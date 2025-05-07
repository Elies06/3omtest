
// // // Dans components/ProtectedRoute.tsx - VERSION CORRIGÉE

// // import React, { useEffect, useState, useCallback } from 'react'; // Importer useCallback
// // import { useRouter } from 'expo-router';
// // import { useAuth } from '@/hooks/useAuth'; // Utilise le hook standard
// // import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

// // type ProtectedRouteProps = {
// //   role?: string | string[]; // Le rôle ou les rôles requis (optionnel)
// //   redirectTo?: string;      // Où rediriger si accès refusé (défaut: '/')
// //   children: React.ReactNode;
// //   debug?: boolean;          // Pour afficher les logs de ce composant
// // };

// // export default function ProtectedRoute({
// //   role,
// //   redirectTo = '/',
// //   children,
// //   debug = false
// // }: ProtectedRouteProps) {
// //   const [redirectInitiated, setRedirectInitiated] = useState(false);

// //   // --- Utiliser les données fournies par useAuth standard ---
// //   // isLoading combine déjà isLoadingAuth et isLoadingRoles
// //   // On récupère userRoles directement
// //   const { session, sessionInitialized, isLoading, userRoles } = useAuth();
// //   // ---------------------------------------------------------

// //   const router = useRouter();

// //   // Log conditionnel
// //   const log = (message: string) => {
// //     if (debug) console.log(message);
// //   };

// //   // --- Logique de vérification de rôle DANS CE COMPOSANT ---
// //   // Utilise useCallback pour la stabilité, dépend de userRoles du contexte
// //   const checkHasRole = useCallback((requiredRole: string | string[] | undefined): boolean => {
// //       // Si aucun rôle n'est requis pour cette route, accès autorisé (si connecté)
// //       if (!requiredRole) return true;
// //       // Si l'utilisateur n'a aucun rôle, accès refusé
// //       if (!userRoles || userRoles.length === 0) return false;

// //       // Si la prop 'role' est un tableau de rôles acceptables
// //       if (Array.isArray(requiredRole)) {
// //           // Vérifie si l'utilisateur a AU MOINS UN des rôles requis
// //           return requiredRole.some(r => userRoles.includes(r));
// //       }
// //       // Si la prop 'role' est une chaîne unique
// //       return userRoles.includes(requiredRole);
// //   }, [userRoles]); // Recalculer seulement si userRoles change
// //   // ---------------------------------------------------------

// //   // Effet pour gérer les redirections
// //   useEffect(() => {
// //     if (redirectInitiated) return;

// //     // Attendre l'initialisation ET la fin du chargement global (session + rôles)
// //     if (!sessionInitialized || isLoading) {
// //       log("[ProtectedRoute] Waiting for auth/roles initialization...");
// //       return;
// //     }

// //     // Si pas de session -> login
// //     if (!session) {
// //       log("[ProtectedRoute] No session, redirecting to login.");
// //       setRedirectInitiated(true);
// //       router.replace('/auth/login');
// //       return; // Important de retourner après une redirection
// //     }

// //     // --- Utiliser la logique locale checkHasRole ---
// //     // Si un rôle est requis ET que l'utilisateur ne l'a pas -> redirectTo
// //     if (role && !checkHasRole(role)) {
// //          const requiredRoles = Array.isArray(role) ? role.join('|') : role;
// //          log(`[ProtectedRoute] Access denied for role '${requiredRoles}'. User roles: [${userRoles.join(', ')}]. Redirecting to ${redirectTo}`);
// //          setRedirectInitiated(true);
// //          router.replace(redirectTo);
// //          return; // Important de retourner après une redirection
// //     }
// //     // --------------------------------------------

// //     // Si on arrive ici, accès autorisé
// //     log("[ProtectedRoute] Access granted");

// //   // Adapter les dépendances
// //   }, [session, sessionInitialized, isLoading, userRoles, role, checkHasRole, router, redirectTo, redirectInitiated]);

// //   // Rendu pendant le chargement ou la redirection
// //   if (!sessionInitialized || isLoading) {
// //     return <LoadingView message="Vérification de l'accès..." />;
// //   }
// //   if (redirectInitiated) {
// //      // Affiche un chargement pendant que la redirection s'effectue
// //      return <LoadingView message="Redirection en cours..." />;
// //   }

// //   // --- Utiliser la logique locale checkHasRole pour le rendu final ---
// //   // Si l'utilisateur est connecté ET a le rôle requis (ou pas de rôle requis)
// //   if (session && checkHasRole(role)) {
// //     return <>{children}</>; // Affiche le contenu protégé
// //   }
// //   // --------------------------------------------------------------

// //   // Fallback si aucune des conditions ci-dessus n'est remplie
// //   // (normalement ne devrait pas arriver si la logique useEffect est correcte,
// //   // mais sert de sécurité pour ne pas planter ou afficher le contenu protégé)
// //   log("[ProtectedRoute] Fallback: Conditions not met, rendering loading/blocker.");
// //   return <LoadingView message="Accès non autorisé ou état invalide" />;
// // }

// // // --- Composant LoadingView (inchangé) ---
// // function LoadingView({ message }: { message: string }) {
// //   return (
// //     <View style={styles.container}>
// //       <ActivityIndicator size="large" color="#0891b2" />
// //       <Text style={styles.text}>{message}</Text>
// //     </View>
// //   );
// // }

// // // --- Styles (inchangés) ---
// // const styles = StyleSheet.create({
// //   container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', },
// //   text: { marginTop: 10, color: '#64748b', fontFamily: 'Montserrat-Regular', }, // Ajuster la police si nécessaire
// // });

// // Dans components/ProtectedRoute.tsx - VERSION OPTIMISÉE

// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { useRouter } from 'expo-router';
// import { useAuth } from '@/hooks/useAuth';
// import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

// type ProtectedRouteProps = {
//   role?: string | string[];
//   redirectTo?: string;
//   children: React.ReactNode;
//   debug?: boolean;
// };

// export default function ProtectedRoute({
//   role,
//   redirectTo = '/',
//   children,
//   debug = false
// }: ProtectedRouteProps) {
//   const redirectRef = useRef<boolean>(false);
//   const authCheckCompletedRef = useRef<boolean>(false);
//   const [showLoading, setShowLoading] = useState<boolean>(true);
//   const [loadingMessage, setLoadingMessage] = useState<string>("Vérification de l'accès...");
  
//   const { session, sessionInitialized, isLoading, userRoles } = useAuth();
//   const router = useRouter();

//   const log = (message: string) => {
//     if (debug) console.log(`[ProtectedRoute] ${message}`);
//   };

//   // Simplified role checking function
//   const hasRequiredRole = useCallback((): boolean => {
//     if (!role) return true;
//     if (!userRoles || userRoles.length === 0) return false;
    
//     return Array.isArray(role)
//       ? role.some(r => userRoles.includes(r))
//       : userRoles.includes(role);
//   }, [role, userRoles]);

//   // Single, comprehensive effect for auth checking
//   useEffect(() => {
//     // Skip if we've already processed this auth state or redirected
//     if (redirectRef.current || authCheckCompletedRef.current) {
//       return;
//     }

//     log(`Auth check running - initialized: ${sessionInitialized}, loading: ${isLoading}`);
    
//     // Wait for auth initialization to complete
//     if (!sessionInitialized || isLoading) {
//       log("Auth not ready yet, waiting...");
//       setShowLoading(true);
//       setLoadingMessage("Vérification de l'accès...");
//       return;
//     }

//     // CRITICAL: Mark auth check as completed to prevent re-runs
//     authCheckCompletedRef.current = true;
    
//     // No session = redirect to login
//     if (!session) {
//       log("No session, redirecting to login");
//       redirectRef.current = true;
//       setLoadingMessage("Redirection vers la connexion...");
      
//       // Use setTimeout to prevent router navigation conflicts
//       setTimeout(() => {
//         router.replace('/auth/login');
//       }, 50);
//       return;
//     }
    
//     // Session exists but role check fails
//     if (role && !hasRequiredRole()) {
//       const requiredRoles = Array.isArray(role) ? role.join('|') : role;
//       log(`Access denied for role '${requiredRoles}'. User roles: [${userRoles.join(', ')}]`);
//       redirectRef.current = true;
//       setLoadingMessage(`Redirection vers ${redirectTo}...`);
      
//       // Use setTimeout to prevent router navigation conflicts
//       setTimeout(() => {
//         router.replace(redirectTo);
//       }, 50);
//       return;
//     }
    
//     // Access granted
//     log("Access granted");
//     setShowLoading(false);
//   }, [
//     session, 
//     sessionInitialized, 
//     isLoading, 
//     hasRequiredRole, 
//     router, 
//     redirectTo, 
//     role, 
//     userRoles
//   ]);

//   // Render appropriate content
//   if (showLoading) {
//     return <LoadingView message={loadingMessage} />;
//   }
  
//   return <>{children}</>;
// }

// function LoadingView({ message }: { message: string }) {
//   return (
//     <View style={styles.container}>
//       <ActivityIndicator size="large" color="#0891b2" />
//       <Text style={styles.text}>{message}</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     backgroundColor: '#ffffff',
//   },
//   text: { 
//     marginTop: 10, 
//     color: '#64748b', 
//     fontFamily: 'Montserrat-Regular',
//   },
// });



// Dans components/ProtectedRoute.tsx
// MODIFICATION: Utiliser useRef au lieu de useState pour redirectInitiated

import React, { useEffect, useRef } from 'react'; // Remplacer useState par useRef
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

type ProtectedRouteProps = {
  role?: string | string[]; 
  redirectTo?: string;      
  children: React.ReactNode;
  debug?: boolean;          
};

export default function ProtectedRoute({
  role,
  redirectTo = '/',
  children,
  debug = false
}: ProtectedRouteProps) {
  // Utiliser un ref au lieu d'un state pour éviter les re-rendus
  const redirectInitiatedRef = useRef(false);

  const { session, sessionInitialized, isLoading, userRoles } = useAuth();
  const router = useRouter();

  const log = (message: string) => {
    if (debug) console.log(message);
  };

  const checkHasRole = (requiredRole: string | string[] | undefined): boolean => {
    if (!requiredRole) return true;
    if (!userRoles || userRoles.length === 0) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(r => userRoles.includes(r));
    }
    return userRoles.includes(requiredRole);
  };

  useEffect(() => {
    // Quitter si la redirection est déjà initiée
    if (redirectInitiatedRef.current) return;

    // Attendre l'initialisation ET la fin du chargement global
    if (!sessionInitialized || isLoading) {
      log("[ProtectedRoute] Waiting for auth/roles initialization...");
      return;
    }

    // Si pas de session -> login
    if (!session) {
      log("[ProtectedRoute] No session, redirecting to login.");
      redirectInitiatedRef.current = true;
      router.replace('/auth/login');
      return;
    }

    // Vérification des rôles
    if (role && !checkHasRole(role)) {
      const requiredRoles = Array.isArray(role) ? role.join('|') : role;
      log(`[ProtectedRoute] Access denied for role '${requiredRoles}'`);
      redirectInitiatedRef.current = true;
      router.replace(redirectTo);
      return;
    }

    log("[ProtectedRoute] Access granted");
  }, [session, sessionInitialized, isLoading, userRoles, role, router, redirectTo]);
  // Suppression de redirectInitiated des dépendances

  // Rendu pendant le chargement
  if (!sessionInitialized || isLoading) {
    return <LoadingView message="Vérification de l'accès..." />;
  }
  
  if (redirectInitiatedRef.current) {
    return <LoadingView message="Redirection en cours..." />;
  }

  // Affichage du contenu si tout va bien
  if (session && checkHasRole(role)) {
    return <>{children}</>;
  }

  return <LoadingView message="Accès non autorisé ou état invalide" />;
}

// Le composant LoadingView reste inchangé
function LoadingView({ message }: { message: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0891b2" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', },
  text: { marginTop: 10, color: '#64748b', fontFamily: 'Montserrat-Regular', },
});