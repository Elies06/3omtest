// 

// hooks/useAuthLogic.ts
// Contient la logique interne de l'authentification avec correction du cache

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase'; // Ajustez le chemin si nécessaire
import { Session, User, AuthError } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// --- Interfaces ---
interface UserProfile {
    id: string;
    stripe_account_id?: string | null;
    stripe_account_status?: string | null;
    charges_enabled?: boolean | null;
    payouts_enabled?: boolean | null;
    full_name?: string | null;
    email?: string | null;
    user_id?: string; // Ajouté pour correspondre aux données Supabase
}

interface VerificationStatus {
    level: number;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    user_id?: string; // Ajouté pour correspondre aux données Supabase
}

import { AuthData } from './useAuth';

export function useAuthLogic(): AuthData {
    const isMountedRef = useRef(false);

    // États principaux
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
    const [isVerified, setIsVerified] = useState<boolean>(false);
    const [sessionInitialized, setSessionInitialized] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isLoadingVerification, setIsLoadingVerification] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Références pour le cache et la gestion des appels
    const rolesRef = useRef<string[]>([]);
    const profileRef = useRef<UserProfile | null>(null);
    const verificationRef = useRef<VerificationStatus | null>(null);
    const sessionInitializedRef = useRef(false);
    const lastEventRef = useRef<{ event: string; userId: string | null; timestamp: number } | null>(null);
    const requestCounter = useRef(0);
    const lastFetchRef = useRef(0);
    const maxRequests = 5; // Limite arbitraire pour détecter les boucles

    // Fonction utilitaire pour vider tous les caches (déplacée en haut)
    const clearAllCaches = useCallback(() => {
        rolesRef.current = [];
        profileRef.current = null;
        verificationRef.current = null;
        requestCounter.current = 0; // Réinitialiser le compteur
        lastFetchRef.current = 0; // Réinitialiser le debounce
        console.log("[useAuthLogic] All caches cleared");
    }, []);

    // Fetch User Profile
    const fetchUserProfile = useCallback(async (currentUser: User | null) => {
        if (!currentUser || !isMountedRef.current || requestCounter.current > maxRequests) {
            if (requestCounter.current > maxRequests) {
                console.error("[useAuthLogic] Trop de requêtes pour fetchUserProfile, arrêt forcé");
            }
            if (isMountedRef.current) {
                setProfile(null);
                setIsLoadingProfile(false);
            }
            return;
        }

        const now = Date.now();
        if (
            profileRef.current &&
            profileRef.current.user_id === currentUser.id &&
            now - lastFetchRef.current < 2000
        ) {
            console.log("[useAuthLogic] fetchUserProfile: Utilisation du cache");
            setProfile(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(profileRef.current)) {
                    return profileRef.current;
                }
                return prev;
            });
            setIsLoadingProfile(false);
            return;
        }

        requestCounter.current += 1;
        lastFetchRef.current = now;
        if (isMountedRef.current) setIsLoadingProfile(true);
        console.log("[useAuthLogic] fetchUserProfile: Requête Supabase", {
            attempt: requestCounter.current,
        });

        const timeoutPromise = new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error("Profile fetch timeout")), 30000)
        );

        try {
            await Promise.race([
                (async () => {
                    const { data: checkData, count, error: checkError } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', currentUser.id);

                    if (checkError) throw checkError;

                    if (count === 0) {
                        console.log("[useAuthLogic] fetchUserProfile: Profile does not exist, creating...");
                        const { data: newProfile, error: createError } = await supabase
                            .from('profiles')
                            .insert([
                                {
                                    user_id: currentUser.id,
                                    id: currentUser.id,
                                    full_name: currentUser.user_metadata?.full_name || currentUser.email || '',
                                    email: currentUser.email,
                                },
                            ])
                            .select()
                            .single();

                        if (createError) throw createError;
                        if (isMountedRef.current) {
                            setProfile(newProfile as UserProfile);
                            profileRef.current = newProfile as UserProfile;
                        }
                        console.log("[useAuthLogic] fetchUserProfile: Profile created.", newProfile);
                    } else {
                        console.log("[useAuthLogic] fetchUserProfile: Profile exists, fetching...");
                        const { data: existingProfile, error: fetchError } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('user_id', currentUser.id)
                            .single();

                        if (fetchError) throw fetchError;
                        if (isMountedRef.current) {
                            setProfile(existingProfile as UserProfile);
                            profileRef.current = existingProfile as UserProfile;
                        }
                        console.log("[useAuthLogic] fetchUserProfile: Profile fetched.", existingProfile);
                    }
                })(),
                timeoutPromise,
            ]);
        } catch (err: any) {
            console.error('[useAuthLogic] fetchUserProfile Error:', err.message || err);
            if (isMountedRef.current) setProfile(null);
        } finally {
            if (isMountedRef.current) setIsLoadingProfile(false);
        }
    }, []); // Retiré clearAllCaches des dépendances

    // Fetch Verification Status
    const fetchVerificationStatus = useCallback(async (currentUser: User | null) => {
        if (!currentUser || !isMountedRef.current || requestCounter.current > maxRequests) {
            if (requestCounter.current > maxRequests) {
                console.error("[useAuthLogic] Trop de requêtes pour fetchVerificationStatus, arrêt forcé");
            }
            if (isMountedRef.current) {
                setVerificationStatus(null);
                setIsVerified(false);
                setIsLoadingVerification(false);
            }
            return;
        }

        const now = Date.now();
        if (
            verificationRef.current &&
            verificationRef.current.user_id === currentUser.id &&
            now - lastFetchRef.current < 2000
        ) {
            console.log("[useAuthLogic] fetchVerificationStatus: Utilisation du cache");
            setVerificationStatus(verificationRef.current);
            setIsVerified(verificationRef.current.status === 'approved');
            setIsLoadingVerification(false);
            return;
        }

        requestCounter.current += 1;
        lastFetchRef.current = now;
        if (isMountedRef.current) setIsLoadingVerification(true);
        console.log("[useAuthLogic] fetchVerificationStatus: Fetching...", {
            attempt: requestCounter.current,
        });

        const defaultStatus: VerificationStatus = { level: 0, status: 'pending', user_id: currentUser.id };
        const timeoutPromise = new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error("Verification fetch timeout")), 30000)
        );

        try {
            await Promise.race([
                (async () => {
                    const { data, error } = await supabase
                        .from('identity_verifications')
                        .select('*')
                        .eq('user_id', currentUser.id)
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (error) {
                        if (error.code === 'PGRST116') {
                            console.warn(
                                "[useAuthLogic] fetchVerificationStatus: No verification record found for user."
                            );
                            if (isMountedRef.current) {
                                setVerificationStatus(defaultStatus);
                                setIsVerified(false);
                            }
                        } else {
                            throw error;
                        }
                    } else if (data && data.length > 0) {
                        const statusData = data[0] as VerificationStatus;
                        if (isMountedRef.current) {
                            setVerificationStatus(statusData);
                            setIsVerified(statusData.status === 'approved');
                            verificationRef.current = statusData;
                        }
                        console.log("[useAuthLogic] fetchVerificationStatus: Status found.", statusData);
                    } else {
                        console.warn("[useAuthLogic] fetchVerificationStatus: No verification data returned.");
                        if (isMountedRef.current) {
                            setVerificationStatus(defaultStatus);
                            setIsVerified(false);
                        }
                    }
                })(),
                timeoutPromise,
            ]);
        } catch (err: any) {
            console.error('[useAuthLogic] fetchVerificationStatus Error:', err.message || err);
            if (isMountedRef.current) {
                setVerificationStatus(defaultStatus);
                setIsVerified(false);
            }
        } finally {
            if (isMountedRef.current) setIsLoadingVerification(false);
        }
    }, []); // Retiré clearAllCaches des dépendances

    // Fetch User Roles
    const fetchUserRoles = useCallback(async (currentUser: User | null) => {
        if (!currentUser || !isMountedRef.current || requestCounter.current > maxRequests) {
            if (requestCounter.current > maxRequests) {
                console.error("[useAuthLogic] Trop de requêtes pour fetchUserRoles, arrêt forcé");
            }
            if (isMountedRef.current) {
                setUserRoles([]);
                setIsLoadingRoles(false);
            }
            return;
        }

        const now = Date.now();
        if (
            rolesRef.current.length > 0 &&
            profileRef.current?.user_id === currentUser.id &&
            now - lastFetchRef.current < 2000
        ) {
            console.log("[useAuthLogic] fetchUserRoles: Utilisation du cache");
            setUserRoles(rolesRef.current);
            setIsLoadingRoles(false);
            return;
        }

        requestCounter.current += 1;
        lastFetchRef.current = now;
        if (isMountedRef.current) setIsLoadingRoles(true);
        console.log("[useAuthLogic] fetchUserRoles: Fetching...", { attempt: requestCounter.current });

        const timeoutPromise = new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error("Roles fetch timeout")), 30000)
        );

        let roles: string[] = [];
        let success = false;

        try {
            await Promise.race([
                (async () => {
                    const { data: roleJoinData, error: roleJoinError } = await supabase
                        .from('user_roles')
                        .select('roles(name)')
                        .eq('user_id', currentUser.id);

                    if (roleJoinError) {
                        console.error("[useAuthLogic] Join query (role_name) error:", roleJoinError.message || roleJoinError);
                    } else if (roleJoinData && roleJoinData.length > 0) {
                        roles = roleJoinData
                            .map(item => (item.roles ? item.roles.name : null))
                            .filter((roleName): roleName is string => Boolean(roleName));

                        if (roles.length > 0) {
                            console.log("[useAuthLogic] Roles via join:", roles);
                            success = true;
                        } else {
                            console.warn("[useAuthLogic] Join query successful but no valid role names extracted.");
                        }
                    } else {
                        console.log("[useAuthLogic] No roles found for user in user_roles table.");
                        success = true;
                        roles = [];
                    }
                })(),
                timeoutPromise,
            ]);
        } catch (err: any) {
            console.error('[useAuthLogic] fetchUserRoles Outer catch (likely timeout):', err.message || err);
            success = false;
        } finally {
            const finalRoles = success && roles.length > 0 ? roles : ['user'];

            if (isMountedRef.current) {
                setUserRoles(prevRoles => {
                    if (JSON.stringify(prevRoles) !== JSON.stringify(finalRoles)) {
                        console.log("[useAuthLogic] Setting final roles:", finalRoles);
                        rolesRef.current = [...finalRoles];
                        return finalRoles;
                    }
                    console.log("[useAuthLogic] Final roles unchanged:", finalRoles);
                    return prevRoles;
                });
                setIsLoadingRoles(false);
            }
        }
    }, []); // Retiré clearAllCaches des dépendances

    // Effect principal
    useEffect(() => {
        isMountedRef.current = true;
        console.log("[useAuthLogic] Setting up listener. isMountedRef=true");
        if (isMountedRef.current) setError(null);

        const getInitialSession = async () => {
            if (!isMountedRef.current) {
                console.log("[useAuthLogic] getInitialSession: Composant démonté, abandon.");
                return;
            }

            console.log("[useAuthLogic] Getting initial session...");
            const { data: { session: initialSession }, error: initialError } = await supabase.auth.getSession();
            if (initialError) {
                console.error("[useAuthLogic] Error getting initial session:", initialError);
                if (isMountedRef.current) {
                    setIsLoadingAuth(false);
                    setSessionInitialized(true);
                }
                return;
            }

            console.log(`[useAuthLogic] Initial session fetched: ${!!initialSession}`);
            if (!session && isMountedRef.current && !sessionInitializedRef.current) {
                console.log("[useAuthLogic] Setting state from initial session.");
                const currentUser = initialSession?.user ?? null;
                setSession(initialSession);
                setUser(currentUser);
                setIsLoadingAuth(false);

                if (currentUser) {
                    console.log("[useAuthLogic] Initial session valid, fetching user data...");
                    setIsLoadingRoles(true);
                    setIsLoadingProfile(true);
                    setIsLoadingVerification(true);
                    await Promise.allSettled([
                        fetchUserProfile(currentUser),
                        fetchUserRoles(currentUser),
                        fetchVerificationStatus(currentUser),
                    ]);
                    console.log("[useAuthLogic] Initial user data fetches settled.");
                } else {
                    console.log("[useAuthLogic] Initial session invalid, resetting states.");
                    clearAllCaches();
                    setUserRoles([]);
                    setProfile(null);
                    setVerificationStatus(null);
                    setIsVerified(false);
                    setIsLoadingRoles(false);
                    setIsLoadingProfile(false);
                    setIsLoadingVerification(false);
                }
            } else {
                console.log(
                    "[useAuthLogic] Initial session check: Listener might have already set the state or component unmounted/initialized."
                );
                if (isMountedRef.current && !sessionInitializedRef.current) {
                    setIsLoadingAuth(false);
                }
            }

            if (isMountedRef.current && !sessionInitializedRef.current) {
                console.log("[useAuthLogic] Initial session processing done. Setting sessionInitialized = TRUE");
                setSessionInitialized(true);
            }
        };

        // Exécuter getInitialSession dans un useEffect séparé pour éviter les problèmes de montage
        getInitialSession().catch(err => {
            console.error("[useAuthLogic] getInitialSession failed:", err);
            if (isMountedRef.current) {
                setIsLoadingAuth(false);
                setSessionInitialized(true);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
            const currentUser = currentSession?.user ?? null;
            const eventData = {
                event: _event,
                userId: currentUser?.id || null,
                timestamp: Date.now(),
            };

            // Ignorer les événements redondants dans un court délai
            if (
                lastEventRef.current &&
                lastEventRef.current.event === _event &&
                lastEventRef.current.userId === eventData.userId &&
                eventData.timestamp - lastEventRef.current.timestamp < 1000
            ) {
                console.log("[useAuthLogic] Ignorer événement redondant", _event);
                return;
            }

            lastEventRef.current = eventData;
            console.log(
                `[useAuthLogic] Auth event: ${_event}, Session: ${!!currentSession}, User: ${currentUser?.id}, InitializedRef: ${sessionInitializedRef.current}`
            );

            if (!isMountedRef.current) {
                console.log("[useAuthLogic] Listener triggered but component unmounted. Aborting.");
                return;
            }

            if (_event === 'INITIAL_SESSION' && sessionInitializedRef.current) {
                console.log("[useAuthLogic] Skipping INITIAL_SESSION event: already initialized.");
                if (!session && !currentSession) setIsLoadingAuth(false);
                return;
            }

            console.log(`[useAuthLogic] Processing event: ${_event}`);
            const previousUserId = user?.id;

            setSession(currentSession);
            setUser(currentUser);
            setIsLoadingAuth(false);
            setError(null);

            if (_event === 'SIGNED_OUT') {
                clearAllCaches();
            }

            if (
                currentUser?.id !== previousUserId ||
                (_event === 'SIGNED_IN' && !previousUserId) ||
                (_event === 'INITIAL_SESSION' && currentUser && !session)
            ) {
                if (currentUser) {
                    if (currentUser.id !== previousUserId && previousUserId) {
                        console.log("[useAuthLogic] User changed, clearing caches");
                        clearAllCaches();
                    }

                    console.log("[useAuthLogic] User changed or first sign in. Fetching all user data...");
                    setIsLoadingRoles(true);
                    setIsLoadingProfile(true);
                    setIsLoadingVerification(true);
                    try {
                        await Promise.allSettled([
                            fetchUserProfile(currentUser),
                            fetchUserRoles(currentUser),
                            fetchVerificationStatus(currentUser),
                        ]);
                        console.log("[useAuthLogic] Listener user data fetches settled after change.");
                    } catch (fetchError: any) {
                        console.error("[useAuthLogic] Listener fetch error after user change:", fetchError);
                        setError("Erreur lors du chargement des données utilisateur.");
                        setIsLoadingRoles(false);
                        setIsLoadingProfile(false);
                        setIsLoadingVerification(false);
                    }
                } else {
                    console.log("[useAuthLogic] User signed out. Resetting states.");
                    clearAllCaches();
                    setUserRoles([]);
                    setProfile(null);
                    setVerificationStatus(null);
                    setIsVerified(false);
                    setIsLoadingRoles(false);
                    setIsLoadingProfile(false);
                    setIsLoadingVerification(false);
                }
            } else if (currentUser && _event === 'USER_UPDATED') {
                console.log("[useAuthLogic] User updated. Refreshing profile...");
                setIsLoadingProfile(true);
                try {
                    await Promise.allSettled([fetchUserProfile(currentUser)]);
                    console.log("[useAuthLogic] User update data fetches settled.");
                } catch (fetchError: any) {
                    console.error("[useAuthLogic] Listener fetch error after user update:", fetchError);
                    setError("Erreur lors de la mise à jour du profil utilisateur.");
                    setIsLoadingProfile(false);
                }
            } else if (!currentUser && !session) {
                console.log("[useAuthLogic] Confirmed no session state.");
                clearAllCaches();
                setIsLoadingRoles(false);
                setIsLoadingProfile(false);
                setIsLoadingVerification(false);
            }

            if (!sessionInitializedRef.current) {
                console.log(`[useAuthLogic] Listener setting sessionInitialized = TRUE after event ${_event}`);
                setSessionInitialized(true);
            }
            console.log(`[useAuthLogic] Listener processing finished for ${_event}.`);
        });

        return () => {
            console.log("[useAuthLogic] Cleanup: Unsubscribing listener. isMountedRef=false");
            isMountedRef.current = false;
            subscription?.unsubscribe();
        };
    }, [fetchUserProfile, fetchUserRoles, fetchVerificationStatus]); // Retiré clearAllCaches des dépendances

    // Synchronisation de sessionInitializedRef avec l'état
    useEffect(() => {
        sessionInitializedRef.current = sessionInitialized;
    }, [sessionInitialized]);

    // Fonction signOut
    const signOut = useCallback(async () => {
        setActionLoading(true);
        setError(null);
        try {
            clearAllCaches();
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) throw signOutError;
        } catch (err: any) {
            console.error("Sign out failed:", err.message || err);
            if (isMountedRef.current) setError(err.message || "Erreur lors de la déconnexion.");
            Alert.alert("Erreur de déconnexion", err.message || "Une erreur est survenue.");
        } finally {
            if (isMountedRef.current) setActionLoading(false);
        }
    }, [clearAllCaches]);

    // Les autres fonctions d'action
    const signIn = useCallback(
        async (email: string, password: string): Promise<{ error: AuthError | null }> => {
            setActionLoading(true);
            setError(null);
            try {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) throw signInError;
                return { error: null };
            } catch (err: any) {
                console.error("Sign In Error:", err);
                const authError = err as AuthError;
                if (isMountedRef.current) setError(authError.message || "Email ou mot de passe incorrect.");
                return { error: authError };
            } finally {
                if (isMountedRef.current) setActionLoading(false);
            }
        },
        []
    );

    const signUp = useCallback(async (email: string, password: string, userData?: any) => {
        setActionLoading(true);
        setError(null);
        try {
            const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
            console.log(`[useAuthLogic] Sign up redirect URL: ${redirectUrl}`);

            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: userData,
                    emailRedirectTo: redirectUrl,
                },
            });
            if (signUpError) throw signUpError;

            router.replace({ pathname: '/auth/verify-email', params: { email } });
            Alert.alert("Compte créé", "Veuillez vérifier votre boîte de réception pour activer votre compte.");
        } catch (err: any) {
            console.error("SignUp Error:", err);
            const authError = err as AuthError;
            if (isMountedRef.current) setError(authError.message || "Erreur lors de l'inscription.");
            Alert.alert("Erreur d'inscription", authError.message || "Une erreur est survenue.");
        } finally {
            if (isMountedRef.current) setActionLoading(false);
        }
    }, []);

    const resendVerificationEmail = useCallback(async (email: string) => {
        setActionLoading(true);
        setError(null);
        try {
            const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: { emailRedirectTo: redirectUrl },
            });
            if (error) throw error;
            Alert.alert("Email envoyé", "Un nouvel email de vérification a été envoyé à votre adresse.");
        } catch (err: any) {
            console.error("Resend Email Error:", err);
            const authError = err as AuthError;
            if (isMountedRef.current) setError(authError.message || "Erreur lors du renvoi de l'email.");
            Alert.alert("Erreur", err.message || "Impossible de renvoyer l'email de vérification.");
        } finally {
            if (isMountedRef.current) setActionLoading(false);
        }
    }, []);

    // Fonctions utilitaires
    const hasRole = useCallback((role: string | string[]) => {
        if (!userRoles || userRoles.length === 0) return false;
        if (Array.isArray(role)) {
            return role.some(r => userRoles.includes(r));
        }
        return userRoles.includes(role);
    }, [userRoles]);

    const refreshProfile = useCallback(async () => {
        if (user) {
            console.log("[useAuthLogic] Refreshing profile manually...");
            await fetchUserProfile(user);
        } else {
            console.log("[useAuthLogic] Cannot refresh profile, no user logged in.");
        }
    }, [user, fetchUserProfile]);

    const refreshVerificationStatus = useCallback(async () => {
        if (user) {
            console.log("[useAuthLogic] Refreshing verification status manually...");
            await fetchVerificationStatus(user);
        } else {
            console.log("[useAuthLogic] Cannot refresh verification status, no user logged in.");
        }
    }, [user, fetchVerificationStatus]);

    // Calcul isLoading global
    const isLoading = useMemo(() => {
        if (!sessionInitialized) return true;
        if (isLoadingAuth) return true;
        if (!session) return false;
        return isLoadingRoles || isLoadingProfile || isLoadingVerification;
    }, [sessionInitialized, isLoadingAuth, session, isLoadingRoles, isLoadingProfile, isLoadingVerification]);

    // Retour des données
    return useMemo(
        () => ({
            session,
            user,
            profile,
            userRoles,
            verificationStatus,
            isVerified,
            sessionInitialized,
            isLoading,
            isProfileLoading: isLoadingProfile,
            isVerificationLoading: isLoadingVerification,
            actionLoading,
            error,
            signIn,
            signUp,
            signOut,
            resendVerificationEmail,
            hasRole,
            refreshProfile,
            refreshVerificationStatus,
            loading: isLoading,
        }),
        [
            session,
            user,
            profile,
            userRoles,
            verificationStatus,
            isVerified,
            sessionInitialized,
            isLoading,
            isLoadingProfile,
            isLoadingVerification,
            actionLoading,
            error,
            signIn,
            signUp,
            signOut,
            resendVerificationEmail,
            hasRole,
            refreshProfile,
            refreshVerificationStatus,
        ]
    );
}