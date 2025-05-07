
// // hooks/useAuth.ts
// // Définit le Contexte et le Hook Consommateur useAuth

// import React, { createContext, useContext, ReactNode } from 'react';
// import { Session, User, AuthError } from '@supabase/supabase-js';

// // Recopier ou importer les interfaces nécessaires
// interface UserProfile {
//     id: string;
//     stripe_account_id?: string | null;
//     stripe_account_status?: string | null;
//     charges_enabled?: boolean | null;
//     payouts_enabled?: boolean | null;
//     full_name?: string | null;
//     email?: string | null;
// }
// interface VerificationStatus {
//     level: number;
//     status: 'pending' | 'approved' | 'rejected';
//     rejection_reason?: string;
// }

// // Type des données fournies par le contexte (doit correspondre au retour de useAuthLogic)
// export type AuthData = {
//     session: Session | null;
//     user: User | null;
//     profile: UserProfile | null;
//     userRoles: string[];
//     verificationStatus: VerificationStatus | null;
//     isVerified: boolean;
//     sessionInitialized: boolean;
//     isLoading: boolean;
//     isProfileLoading: boolean;
//     isVerificationLoading: boolean;
//     actionLoading: boolean; // useAuthLogic initialise déjà ceci à false
//     error: string | null;
//     signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
//     signUp: (email: string, password: string, userData?: any) => Promise<void>;
//     signOut: () => Promise<void>;
//     resendVerificationEmail: (email: string) => Promise<void>;
//     hasRole: (role: string | string[]) => boolean;
//     refreshProfile: () => Promise<void>;
//     refreshVerificationStatus: () => Promise<void>;
//     loading?: boolean; // Optionnel pour compatibilité
// };

// // Données par défaut (inchangées)
// const defaultAuthData: AuthData = {
//     session: null, user: null, profile: null, userRoles: [], verificationStatus: null, isVerified: false,
//     sessionInitialized: false, isLoading: true, isProfileLoading: true, isVerificationLoading: true,
//     actionLoading: false, error: null,
//     signIn: async () => { console.warn("AuthProvider not ready"); return { error: null }; },
//     signUp: async () => { console.warn("AuthProvider not ready"); },
//     signOut: async () => { console.warn("AuthProvider not ready"); },
//     resendVerificationEmail: async () => { console.warn("AuthProvider not ready"); },
//     hasRole: () => false,
//     refreshProfile: async () => { console.warn("AuthProvider not ready"); },
//     refreshVerificationStatus: async () => { console.warn("AuthProvider not ready"); },
//     loading: true,
// };

// // Création du contexte
// export const AuthContext = createContext<AuthData>(defaultAuthData);

// // --- Hook consommateur final (utilise useContext) ---
// // C'est CE hook que vos composants doivent importer et utiliser
// export function useAuth(): AuthData {
//     const context = useContext(AuthContext);
//     if (context === undefined) {
//         // Cette erreur se produit si useAuth est utilisé en dehors de AuthProvider
//         throw new Error('useAuth doit être utilisé à l`intérieur d`un AuthProvider');
//     }
//     // La valeur retournée est celle fournie par AuthProvider (qui appelle useAuthLogic)
//     return context;
// }
// hooks/useAuth.ts
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { Alert } from 'react-native';

// Types de base
interface UserProfile {
    id: string;
    stripe_account_id?: string | null;
    stripe_account_status?: string | null;
    charges_enabled?: boolean | null;
    payouts_enabled?: boolean | null;
    full_name?: string | null;
    email?: string | null;
}

interface VerificationStatus {
    level: number;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    user_id: string;
}

// État d'authentification
export interface AuthState {
    // États principaux
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    userRoles: string[];
    verificationStatus: VerificationStatus | null;
    isVerified: boolean;

    // États de chargement
    isInitialized: boolean;
    isLoading: boolean;
    isLoadingAction: boolean;

    // Erreur
    error: string | null;

    // Fonctions
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUp: (email: string, password: string, userData?: any) => Promise<void>;
    signOut: () => Promise<void>;
    resendVerificationEmail: (email: string) => Promise<void>;
    hasRole: (role: string | string[]) => boolean;
    refreshProfile: () => Promise<void>;
    refreshVerificationStatus: () => Promise<void>;
    clearError: () => void;
}

// Valeurs par défaut
const defaultAuthState: AuthState = {
    user: null,
    session: null,
    profile: null,
    userRoles: [],
    verificationStatus: null,
    isVerified: false,
    isInitialized: false,
    isLoading: true,
    isLoadingAction: false,
    error: null,
    signIn: async () => ({ error: null }),
    signUp: async () => {},
    signOut: async () => {},
    resendVerificationEmail: async () => {},
    hasRole: () => false,
    refreshProfile: async () => {},
    refreshVerificationStatus: async () => {},
    clearError: () => {}
};

// Création du contexte - S'assurer que createContext est appelé avec les valeurs par défaut
export const AuthContext = createContext<AuthState>(defaultAuthState);

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    // États principaux
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
    const [isVerified, setIsVerified] = useState<boolean>(false);
    
    // États de chargement
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    
    // État d'erreur
    const [error, setError] = useState<string | null>(null);

    // Cache mémoire pour optimisation
    const cachedData = React.useRef({
        roles: [] as string[],
        profile: null as UserProfile | null,
        verification: null as VerificationStatus | null
    });

    // Fonction pour nettoyer l'erreur
    const clearError = useCallback(() => setError(null), []);

    // --- Fetch User Profile ---
    const fetchUserProfile = useCallback(async (currentUser: User | null) => {
        if (!currentUser) {
            setProfile(null);
            return;
        }

        // Utiliser le cache si disponible pour l'affichage immédiat
        if (cachedData.current.profile && cachedData.current.profile.id === currentUser.id) {
            setProfile(cachedData.current.profile);
        }

        try {
            // Vérifier d'abord si le profil existe
            const { data: checkData, count, error: checkError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.id);

            if (checkError) throw checkError;

            if (count === 0) {
                // Créer un nouveau profil si inexistant
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert([{
                        user_id: currentUser.id,
                        id: currentUser.id,
                        full_name: currentUser.user_metadata?.full_name || currentUser.email || '',
                        email: currentUser.email,
                    }])
                    .select()
                    .single();

                if (createError) throw createError;
                setProfile(newProfile as UserProfile);
                cachedData.current.profile = newProfile as UserProfile;
            } else {
                // Récupérer le profil existant
                const { data: existingProfile, error: fetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .single();

                if (fetchError) throw fetchError;
                setProfile(existingProfile as UserProfile);
                cachedData.current.profile = existingProfile as UserProfile;
            }
        } catch (err: any) {
            console.error('Error fetching/creating profile:', err.message || err);
            setProfile(null);
        }
    }, []);

    // --- Fetch User Roles ---
    const fetchUserRoles = useCallback(async (currentUser: User | null) => {
        if (!currentUser) {
            setUserRoles([]);
            return;
        }

        // Utiliser le cache si disponible
        if (cachedData.current.roles.length > 0) {
            setUserRoles(cachedData.current.roles);
        }

        try {
            const { data: roleJoinData, error: roleJoinError } = await supabase
                .from('user_roles')
                .select('roles(name)')
                .eq('user_id', currentUser.id);

            if (roleJoinError) throw roleJoinError;

            const roles = roleJoinData
                ?.map(item => item.roles ? item.roles.name : null)
                .filter(Boolean) as string[] || [];

            // Assurer qu'il y a au moins le rôle 'user'
            const finalRoles = roles.length > 0 ? roles : ['user'];
            
            setUserRoles(finalRoles);
            cachedData.current.roles = finalRoles;
        } catch (err: any) {
            console.error('Error fetching user roles:', err.message || err);
            // Fallback au cache ou rôle par défaut
            setUserRoles(cachedData.current.roles.length > 0 ? cachedData.current.roles : ['user']);
        }
    }, []);

    // --- Fetch Verification Status ---
    const fetchVerificationStatus = useCallback(async (currentUser: User | null) => {
        if (!currentUser) {
            setVerificationStatus(null);
            setIsVerified(false);
            return;
        }

        // Utiliser le cache si disponible 
        if (cachedData.current.verification && 
            cachedData.current.verification.user_id === currentUser.id) {
            setVerificationStatus(cachedData.current.verification);
            setIsVerified(cachedData.current.verification.status === 'approved');
            return;
        }

        const defaultStatus: VerificationStatus = { 
            level: 0, 
            status: 'pending',
            user_id: currentUser.id
        };
        
        try {
            const { data, error } = await supabase
                .from('identity_verifications')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) {
                if (error.code === 'PGRST116') {
                    // Aucun enregistrement trouvé
                    setVerificationStatus(defaultStatus);
                    setIsVerified(false);
                } else {
                    throw error;
                }
            } else if (data && data.length > 0) {
                setVerificationStatus(data[0] as VerificationStatus);
                setIsVerified(data[0].status === 'approved');
                cachedData.current.verification = data[0] as VerificationStatus;
            } else {
                setVerificationStatus(defaultStatus);
                setIsVerified(false);
            }
        } catch (err: any) {
            console.error('Error fetching verification status:', err.message || err);
            setVerificationStatus(defaultStatus);
            setIsVerified(false);
        }
    }, []);

    // --- Auth Flow Complet ---
    useEffect(() => {
        let mounted = true;
        
        // Fonction pour récupérer la session initiale
        const getInitialSession = async () => {
            try {
                setIsLoading(true);
                
                // Récupérer la session
                const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;
                
                // Si component est encore monté, mettre à jour l'état
                if (!mounted) return;
                
                const currentUser = initialSession?.user ?? null;
                setSession(initialSession);
                setUser(currentUser);
                
                // Si utilisateur connecté, récupérer les données
                if (currentUser) {
                    await Promise.allSettled([
                        fetchUserProfile(currentUser),
                        fetchUserRoles(currentUser),
                        fetchVerificationStatus(currentUser)
                    ]);
                }
            } catch (err: any) {
                if (mounted) {
                    console.error("Error getting initial session:", err);
                    setError(err.message || "Erreur lors de l'initialisation.");
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                    setIsInitialized(true);
                }
            }
        };

        // Exécuter immédiatement
        getInitialSession();
        
        // Configurer l'écouteur des changements d'état d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            console.log(`Auth state change event: ${event}`);
            
            if (!mounted) return;
            
            const currentUser = currentSession?.user ?? null;
            setSession(currentSession);
            setUser(currentUser);
            
            // Traiter les différents événements
            switch (event) {
                case 'SIGNED_IN':
                    // Essayer d'utiliser le cache d'abord
                    if (cachedData.current.roles.length > 0) {
                        setUserRoles(cachedData.current.roles);
                        setProfile(cachedData.current.profile);
                        setVerificationStatus(cachedData.current.verification);
                        setIsVerified(cachedData.current.verification?.status === 'approved' || false);
                    }
                    
                    // Rafraîchir les données en arrière-plan
                    await Promise.allSettled([
                        fetchUserProfile(currentUser),
                        fetchUserRoles(currentUser),
                        fetchVerificationStatus(currentUser)
                    ]);
                    break;
                    
                case 'SIGNED_OUT':
                    // Réinitialiser les états
                    setUserRoles([]);
                    setProfile(null);
                    setVerificationStatus(null);
                    setIsVerified(false);
                    cachedData.current = {
                        roles: [],
                        profile: null,
                        verification: null
                    };
                    break;
                    
                case 'USER_UPDATED':
                    // Rafraîchir uniquement le profil
                    await fetchUserProfile(currentUser);
                    break;
            }
            
            if (!isInitialized) {
                setIsInitialized(true);
            }
            
            setIsLoading(false);
        });

        // Nettoyer à la destruction
        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, [fetchUserProfile, fetchUserRoles, fetchVerificationStatus, isInitialized]);

    // --- Actions d'authentification ---
    const signIn = useCallback(async (email: string, password: string): Promise<{ error: AuthError | null }> => {
        setIsLoadingAction(true);
        clearError();
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) throw signInError;
            return { error: null };
        } catch (err: any) {
            console.error("Sign In Error:", err);
            const authError = err as AuthError;
            setError(authError.message || "Email ou mot de passe incorrect.");
            return { error: authError };
        } finally {
            setIsLoadingAction(false);
        }
    }, [clearError]);

    const signUp = useCallback(async (email: string, password: string, userData?: any) => {
        setIsLoadingAction(true);
        clearError();
        try {
            const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
            
            const { error: signUpError } = await supabase.auth.signUp({
                email, password,
                options: {
                    data: userData,
                    emailRedirectTo: redirectUrl,
                },
            });
            
            if (signUpError) throw signUpError;
            
            Alert.alert("Compte créé", "Veuillez vérifier votre boîte de réception pour activer votre compte.");
        } catch (err: any) {
            console.error("SignUp Error:", err);
            const authError = err as AuthError;
            setError(authError.message || "Erreur lors de l'inscription.");
            Alert.alert("Erreur d'inscription", authError.message || "Une erreur est survenue.");
        } finally {
            setIsLoadingAction(false);
        }
    }, [clearError]);

    const signOut = useCallback(async () => {
        setIsLoadingAction(true);
        clearError();
        try {
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) throw signOutError;
        } catch (err: any) {
            console.error("Sign out failed:", err.message || err);
            setError(err.message || "Erreur lors de la déconnexion.");
            Alert.alert("Erreur de déconnexion", err.message || "Une erreur est survenue.");
        } finally {
            setIsLoadingAction(false);
        }
    }, [clearError]);

    const resendVerificationEmail = useCallback(async (email: string) => {
        setIsLoadingAction(true);
        clearError();
        try {
            const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback`: undefined;
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: { emailRedirectTo: redirectUrl }
            });
            
            if (error) throw error;
            Alert.alert("Email envoyé", "Un nouvel email de vérification a été envoyé à votre adresse.");
        } catch (err: any) {
            console.error("Resend Email Error:", err);
            const authError = err as AuthError;
            setError(authError.message || "Erreur lors du renvoi de l'email.");
            Alert.alert("Erreur", err.message || "Impossible de renvoyer l'email de vérification.");
        } finally {
            setIsLoadingAction(false);
        }
    }, [clearError]);

    // --- Fonctions utilitaires ---
    const hasRole = useCallback((role: string | string[]) => {
        if (!userRoles || userRoles.length === 0) return false;
        
        if (Array.isArray(role)) {
            return role.some(r => userRoles.includes(r));
        }
        
        return userRoles.includes(role);
    }, [userRoles]);

    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchUserProfile(user);
        }
    }, [user, fetchUserProfile]);

    const refreshVerificationStatus = useCallback(async () => {
        if (user) {
            await fetchVerificationStatus(user);
        }
    }, [user, fetchVerificationStatus]);

    // Valeur du contexte
    const value = useMemo(() => ({
        user,
        session,
        profile,
        userRoles,
        verificationStatus,
        isVerified,
        isInitialized,
        isLoading,
        isLoadingAction,
        error,
        signIn,
        signUp,
        signOut,
        resendVerificationEmail,
        hasRole,
        refreshProfile,
        refreshVerificationStatus,
        clearError
    }), [
        user, session, profile, userRoles, verificationStatus, isVerified,
        isInitialized, isLoading, isLoadingAction, error,
        signIn, signUp, signOut, resendVerificationEmail, hasRole,
        refreshProfile, refreshVerificationStatus, clearError
    ]);

    // Utiliser React.createElement au lieu de JSX pour éviter les problèmes de syntaxe
    return React.createElement(
        AuthContext.Provider,
        { value },
        children
    );
}

// Hook qui expose le contexte
export function useAuth(): AuthState {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth doit être utilisé à l`intérieur d`un AuthProvider');
    }
    return context;
}