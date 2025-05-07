// // // app/_layout.tsx
// // // VERSION CORRIGÉE AVEC SLOT

// // import React, { useEffect, useRef, useState, useContext } from 'react';
// // import { Slot, SplashScreen, Stack, useRouter, usePathname } from 'expo-router';
// // import { StatusBar } from 'expo-status-bar';
// // import { useAuth, AuthContext } from '@/hooks/useAuth';
// // import { AuthProvider } from '@/components/AuthProvider';
// // import { ActivityIndicator, View, StyleSheet } from 'react-native';

// // // Empêche masquage auto du splash
// // SplashScreen.preventAutoHideAsync();

// // // Composant Racine qui enveloppe tout dans le Provider
// // export default function RootLayout() {
// //   console.log(">>> RootLayout: Mounting AuthProvider");
// //   return (
// //     <AuthProvider>
// //       <RootLayoutNav />
// //     </AuthProvider>
// //   );
// // }

// // // Composant interne gérant la navigation et les redirections
// // function RootLayoutNav() {
// //   // Récupérer l'état d'authentification depuis le hook useAuth avec gestion d'erreur
// //   let authData;
  
// //   try {
// //     // Log direct du contexte (pour debug avancé)
// //     const directContextValue = useContext(AuthContext);
// //     console.log(">>> RootLayoutNav DIRECT context value:", {
// //       contextExists: !!directContextValue,
// //       sessionInitialized: directContextValue?.sessionInitialized,
// //       sessionValid: !!directContextValue?.session
// //     });
    
// //     // Utiliser le hook avec gestion de l'erreur
// //     authData = useAuth();
// //     console.log(">>> RootLayoutNav: useAuth() a réussi:", {
// //       sessionInitialized: authData.sessionInitialized,
// //       isLoading: authData.isLoading,
// //       sessionValid: !!authData.session
// //     });
// //   } catch (error) {
// //     console.error(">>> RootLayoutNav: useAuth() a échoué:", error);
// //     // Fournir des valeurs par défaut en cas d'erreur
// //     authData = { 
// //       session: null, 
// //       sessionInitialized: false, 
// //       isLoading: true 
// //     };
// //   }
  
// //   // Déstructurer de manière sécurisée
// //   const { session, sessionInitialized, isLoading } = authData;
// //   const router = useRouter();
// //   const pathname = usePathname(); // Chemin actuel
// //   const redirectLoginAttemptedRef = useRef(false); // Pour éviter redirection login multiple
// //   const [initializationComplete, setInitializationComplete] = useState(false); // Pour attendre la fin de l'init de useAuth
// //   const [shouldShowApp, setShouldShowApp] = useState(false); // État pour contrôler l'affichage principal

// //   // Définir les chemins considérés comme publics (non protégés par connexion)
// //   const publicPaths = [
// //     '/',             // Page d'accueil (souvent dans tabs/index)
// //     '/search',       // Page de recherche (si publique)
// //     '/become-host',  // Page devenir hôte (si publique)
// //     // '/pool/[id]', // Page détail piscine ? À vérifier si publique ou non
// //     // Ajouter d'autres chemins publics exacts ici
// //   ];

// //   // Effet pour marquer l'initialisation complète et masquer le splash screen
// //   useEffect(() => {
// //     // Ne s'exécute que si sessionInitialized (venant de useAuth) devient true
// //     if (!sessionInitialized) {
// //       console.log("[RootLayoutNav] Waiting for session initialization...");
// //       return;
// //     }
// //     // Marquer l'init complète seulement si ce n'est pas déjà fait
// //     if (!initializationComplete) {
// //       console.log("[RootLayoutNav] Session initialization complete. Hiding SplashScreen.");
// //       setInitializationComplete(true);
// //       SplashScreen.hideAsync().catch(console.warn);
// //     }
// //   }, [sessionInitialized, initializationComplete]); // Dépend de ces deux états

// //   // Effet pour gérer les redirections après l'initialisation
// //   useEffect(() => {
// //     // Attendre que l'initialisation soit marquée comme terminée
// //     if (!initializationComplete) {
// //       console.log("[RootLayoutNav] Redirection effect waiting for initialization complete...");
// //       return;
// //     }

// //     const isAuthRoute = pathname.startsWith('/auth'); // Est-on dans /auth/* ?
// //     const isPublic = publicPaths.includes(pathname); // Est-ce une des pages publiques définies ?

// //     // LOG PRINCIPAL POUR DEBUG REDIRECTION
// //     console.log(`>>> RootLayoutNav Effect Check: Path=${pathname}, SessionValid=${!!session}, isAuthRoute=${isAuthRoute}, isPublic=${isPublic}, InitComplete=${initializationComplete}`);

// //     // --- Logique de Redirection ---
// //     let shouldRedirect = false;
// //     let redirectTo = '';

// //     if (!session) { // CAS 1: Utilisateur NON connecté
// //       // S'il essaie d'accéder à une page non-authentification ET non-publique, et qu'on n'a pas déjà tenté de rediriger
// //       if (!isAuthRoute && !isPublic && !redirectLoginAttemptedRef.current) {
// //         console.log(`>>> RootLayoutNav: Conditions MET for redirect to /auth/login! (Accessing protected '${pathname}')`);
// //         redirectLoginAttemptedRef.current = true; // Marquer qu'on tente
// //         shouldRedirect = true;
// //         redirectTo = '/auth/login';
// //       } else if (redirectLoginAttemptedRef.current && (isAuthRoute || isPublic)) {
// //         // Si on avait tenté une redirection mais qu'on est maintenant sur une page OK, reset le flag
// //         console.log("[RootLayoutNav] Resetting redirect flag (on auth/public page without session).");
// //         redirectLoginAttemptedRef.current = false;
// //       } else {
// //         // Non connecté mais sur une page autorisée (auth ou publique)
// //         console.log("[RootLayoutNav] No session, but on allowed route. No redirect needed.");
// //       }
// //     } else { // CAS 2: Utilisateur CONNECTÉ
// //       // S'il est sur une page d'authentification -> le renvoyer à l'accueil
// //       if (isAuthRoute) {
// //         console.log(`>>> RootLayoutNav: Conditions MET for redirect to / ! (User logged in but on auth route '${pathname}')`);
// //         shouldRedirect = true;
// //         redirectTo = '/';
// //       } else {
// //         // Connecté et pas sur une page auth -> OK
// //         console.log("[RootLayoutNav] Session active, not on auth route. No redirect needed.");
// //       }
// //       // Reset le flag de tentative si on est connecté
// //       if (redirectLoginAttemptedRef.current) redirectLoginAttemptedRef.current = false;
// //     }

// //     // Effectuer la redirection APRÈS le rendu initial
// //     if (shouldRedirect) {
// //       // Attendre que le composant soit monté avant de naviguer
// //       requestAnimationFrame(() => {
// //         try {
// //           console.log(`>>> RootLayoutNav: Attempting to navigate to ${redirectTo}`);
// //           router.replace(redirectTo);
// //         } catch (e) {
// //           console.error(`>>> RootLayoutNav: Navigation error to ${redirectTo}:`, e);
// //           redirectLoginAttemptedRef.current = false; // Réinitialiser pour permettre de réessayer
// //         }
// //       });
// //     }

// //     // Une fois les vérifications et redirections gérées, on peut afficher l'app
// //     setShouldShowApp(true);
// //   }, [session, initializationComplete, pathname, router]); // Dépendances correctes

// //   // Affichage pendant le chargement initial global
// //   if (!initializationComplete || isLoading || !shouldShowApp) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#0891b2" />
// //       </View>
// //     );
// //   }

// //   // Utiliser Slot au lieu de Stack pour le premier rendu
// //   // Cela résout le problème "Attempted to navigate before mounting"
// //   return <Slot />;
// // }

// // // Styles
// // const styles = StyleSheet.create({
// //   loadingContainer: { 
// //     flex: 1, 
// //     justifyContent: 'center', 
// //     alignItems: 'center', 
// //     backgroundColor: '#ffffff',
// //   }
// // });



// // app/_layout.tsx
// // VERSION CORRIGÉE AVEC Stack Navigator pour séparer Tabs et autres écrans

// import React, { useEffect, useRef, useState, useContext } from 'react';
// // *** MODIFICATION: Importer Stack au lieu de Slot ***
// import { SplashScreen, Stack, useRouter, usePathname } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useAuth, AuthContext } from '@/hooks/useAuth';
// import { AuthProvider } from '@/components/AuthProvider';
// import { ActivityIndicator, View, StyleSheet } from 'react-native';

// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//     console.log(">>> RootLayout: Mounting AuthProvider");
//     return (
//         <AuthProvider>
//             <RootLayoutNav />
//         </AuthProvider>
//     );
// }

// function RootLayoutNav() {
//     let authData;
//     try {
//         const directContextValue = useContext(AuthContext);
//         console.log(">>> RootLayoutNav DIRECT context value:", { contextExists: !!directContextValue, sessionInitialized: directContextValue?.sessionInitialized, sessionValid: !!directContextValue?.session });
//         authData = useAuth();
//         console.log(">>> RootLayoutNav: useAuth() a réussi:", { sessionInitialized: authData.sessionInitialized, isLoading: authData.isLoading, sessionValid: !!authData.session });
//     } catch (error) {
//         console.error(">>> RootLayoutNav: useAuth() a échoué:", error);
//         authData = { session: null, sessionInitialized: false, isLoading: true };
//     }

//     const { session, sessionInitialized, isLoading } = authData;
//     const router = useRouter();
//     const pathname = usePathname();
//     const redirectLoginAttemptedRef = useRef(false);
//     const [initializationComplete, setInitializationComplete] = useState(false);
//     const [shouldShowApp, setShouldShowApp] = useState(false);

//     const publicPaths = ['/', '/search', '/become-host', /* '/pool/[id]', ... */];

//     useEffect(() => {
//         if (!sessionInitialized) { console.log("[RootLayoutNav] Waiting for session initialization..."); return; }
//         if (!initializationComplete) {
//             console.log("[RootLayoutNav] Session initialization complete. Hiding SplashScreen.");
//             setInitializationComplete(true);
//             SplashScreen.hideAsync().catch(console.warn);
//         }
//     }, [sessionInitialized, initializationComplete]);

//     useEffect(() => {
//         if (!initializationComplete) { console.log("[RootLayoutNav] Redirection effect waiting for initialization complete..."); return; }

//         const isAuthRoute = pathname.startsWith('/auth');
//         const isPublic = publicPaths.includes(pathname);

//         console.log(`>>> RootLayoutNav Effect Check: Path=${pathname}, SessionValid=${!!session}, isAuthRoute=${isAuthRoute}, isPublic=${isPublic}, InitComplete=${initializationComplete}`);

//         let shouldRedirect = false;
//         let redirectTo = '';

//         if (!session) {
//             if (!isAuthRoute && !isPublic && !redirectLoginAttemptedRef.current) {
//                 console.log(`>>> RootLayoutNav: Conditions MET for redirect to /auth/login! (Accessing protected '${pathname}')`);
//                 redirectLoginAttemptedRef.current = true;
//                 shouldRedirect = true;
//                 redirectTo = '/(auth)/login'; // Assurez-vous que le chemin est correct (ex: groupe auth)
//             } else if (redirectLoginAttemptedRef.current && (isAuthRoute || isPublic)) {
//                 console.log("[RootLayoutNav] Resetting redirect flag (on auth/public page without session).");
//                 redirectLoginAttemptedRef.current = false;
//             } else {
//                 console.log("[RootLayoutNav] No session, but on allowed route. No redirect needed.");
//             }
//         } else {
//             if (isAuthRoute) {
//                 console.log(`>>> RootLayoutNav: Conditions MET for redirect to / ! (User logged in but on auth route '${pathname}')`);
//                 shouldRedirect = true;
//                 redirectTo = '/'; // Redirige vers la racine (qui est gérée par (tabs))
//             } else {
//                 console.log("[RootLayoutNav] Session active, not on auth route. No redirect needed.");
//             }
//             if (redirectLoginAttemptedRef.current) redirectLoginAttemptedRef.current = false;
//         }

//         if (shouldRedirect) {
//             requestAnimationFrame(() => {
//                 try {
//                     console.log(`>>> RootLayoutNav: Attempting to navigate to ${redirectTo}`);
//                     router.replace(redirectTo);
//                 } catch (e) {
//                     console.error(`>>> RootLayoutNav: Navigation error to ${redirectTo}:`, e);
//                     redirectLoginAttemptedRef.current = false;
//                 }
//             });
//         }

//         // Marquer comme prêt à afficher après la première vérification post-initialisation
//         if (!shouldShowApp) {
//              setShouldShowApp(true);
//         }
//     }, [session, initializationComplete, pathname, router, shouldShowApp]); // shouldShowApp ajouté pour éviter boucle infinie potentielle

//     // Affichage pendant le chargement initial global
//     // Remplacé isLoading par !initializationComplete pour plus de fiabilité
//     if (!initializationComplete || !shouldShowApp) {
//         return (
//             <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#0891b2" />
//             </View>
//         );
//     }

//     // *** MODIFICATION: Utiliser Stack au lieu de Slot ***
//     // Le Stack gère la navigation principale.
//     // Les écrans définis ici (comme (tabs) ou my-bookings) sont des écrans de ce Stack.
//     return (
//         <Stack screenOptions={{ headerShown: false }}>
//             {/* Définit le groupe (tabs) comme un écran du Stack principal.
//                 Le layout interne de (tabs) (app/(tabs)/_layout.js) gérera la barre d'onglets. */}
//             <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

//             {/* Définit my-bookings comme un autre groupe/écran dans le Stack principal.
//                 Le header sera géré par l'écran [id].tsx lui-même ou par les options ici. */}
//             <Stack.Screen name="my-bookings" options={{ headerShown: false }} />

//              {/* Ajouter d'autres écrans/groupes de haut niveau ici si nécessaire */}
//              {/* Exemple: <Stack.Screen name="auth" options={{ presentation: 'modal' }} /> */}
//              {/* Exemple: <Stack.Screen name="search" /> */}
//              {/* Exemple: <Stack.Screen name="pool/[id]" /> */}

//         </Stack>
//     );
// }

// // Styles
// const styles = StyleSheet.create({
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#ffffff',
//     }
// });
// app/_layout.tsx
import React, { useEffect, useRef, useState, useContext } from 'react';
import { Slot, SplashScreen, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth, AuthContext } from '@/hooks/useAuth'; // Ajustez le chemin
import { AuthProvider } from '@/components/AuthProvider'; // Ajustez le chemin
import { ActivityIndicator, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    console.log(">>> RootLayout: Mounting AuthProvider");
    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    );
}

function RootLayoutNav() {
    let authData;
    try {
        const directContextValue = useContext(AuthContext);
        console.log(">>> RootLayoutNav DIRECT context value:", {
            contextExists: !!directContextValue,
            sessionInitialized: directContextValue?.sessionInitialized,
            sessionValid: !!directContextValue?.session,
        });
        authData = useAuth();
        console.log(">>> RootLayoutNav: useAuth() a réussi:", {
            sessionInitialized: authData.sessionInitialized,
            isLoading: authData.isLoadingAuth,
            sessionValid: !!authData.session,
        });
    } catch (error) {
        console.error(">>> RootLayoutNav: useAuth() a échoué:", error);
        authData = {
            session: null,
            sessionInitialized: false,
            isLoadingAuth: true,
            criticalError: null,
            clearCriticalError: () => {},
        };
    }

    const { session, sessionInitialized, isLoadingAuth, criticalError, clearCriticalError } = authData;
    const router = useRouter();
    const pathname = usePathname();
    const redirectLoginAttemptedRef = useRef(false);
    const [initializationComplete, setInitializationComplete] = useState(false);
    const [shouldShowApp, setShouldShowApp] = useState(false);

    const publicPaths = ['/', '/search', '/become-host'];
    const authPaths = ['/auth/login', '/auth/register', '/auth/verify-email'];

    useEffect(() => {
        if (!sessionInitialized) {
            console.log("[RootLayoutNav] Waiting for session initialization...");
            return;
        }
        if (!initializationComplete) {
            console.log("[RootLayoutNav] Session initialization complete. Hiding SplashScreen.");
            setInitializationComplete(true);
            SplashScreen.hideAsync().catch(console.warn);
        }
    }, [sessionInitialized, initializationComplete]);

    useEffect(() => {
        if (!initializationComplete) {
            console.log("[RootLayoutNav] Redirection effect waiting for initialization complete...");
            return;
        }

        const isAuthRoute = authPaths.some(p => pathname === p);
        const isPublicOrRoot = publicPaths.includes(pathname) || pathname === '/';

        console.log(`>>> RootLayoutNav Effect Check: Path=${pathname}, SessionValid=${!!session}, isAuthRoute=${isAuthRoute}, isPublicOrRoot=${isPublicOrRoot}, InitComplete=${initializationComplete}`);

        let shouldRedirect = false;
        let redirectTo = '';

        if (!session) {
            if (!isAuthRoute && !isPublicOrRoot && !redirectLoginAttemptedRef.current) {
                console.log(`>>> RootLayoutNav: Conditions MET for redirect to /auth/login! (Accessing protected '${pathname}')`);
                redirectLoginAttemptedRef.current = true;
                shouldRedirect = true;
                redirectTo = '/auth/login';
            } else if (redirectLoginAttemptedRef.current && (isAuthRoute || isPublicOrRoot)) {
                console.log("[RootLayoutNav] Resetting redirect flag (on auth/public page without session).");
                redirectLoginAttemptedRef.current = false;
            } else {
                console.log("[RootLayoutNav] No session, but on allowed route. No redirect needed.");
            }
        } else {
            if (isAuthRoute) {
                console.log(`>>> RootLayoutNav: Conditions MET for redirect to / ! (User logged in but on auth route '${pathname}')`);
                shouldRedirect = true;
                redirectTo = '/';
            } else {
                console.log("[RootLayoutNav] Session active, not on auth route. No redirect needed.");
            }
            if (redirectLoginAttemptedRef.current) redirectLoginAttemptedRef.current = false;
        }

        if (shouldRedirect && router) {
            requestAnimationFrame(() => {
                try {
                    console.log(`>>> RootLayoutNav: Attempting to navigate to ${redirectTo}`);
                    router.replace(redirectTo);
                } catch (e) {
                    console.error(`>>> RootLayoutNav: Navigation error to ${redirectTo}:`, e);
                    redirectLoginAttemptedRef.current = false;
                }
            });
        }

        if (!shouldShowApp) {
            setShouldShowApp(true);
        }
    }, [session, initializationComplete, pathname, router, shouldShowApp]);

    // Gestion des erreurs critiques
    if (criticalError) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Une erreur est survenue</Text>
                <Text style={styles.message}>{criticalError}</Text>
                <TouchableOpacity style={styles.button} onPress={clearCriticalError}>
                    <Text style={styles.buttonText}>Réessayer</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Affichage du chargement
    if (!initializationComplete || isLoadingAuth || !shouldShowApp) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
            </View>
        );
    }

    console.log(">>> RootLayoutNav: Rendering Slot");
    return <Slot />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#dc3545',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#6c757d',
    },
    button: {
        backgroundColor: '#0891b2',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
});