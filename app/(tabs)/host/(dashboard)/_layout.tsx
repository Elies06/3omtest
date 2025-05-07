// // // Dans app/host/(dashboard)/_layout.tsx  (NOUVEAU FICHIER)
// // import React from 'react';
// // import { Tabs } from 'expo-router';
// // import { LayoutDashboard, CalendarClock, User } from 'lucide-react-native';
// // // Vous pourriez aussi vouloir protéger ce groupe avec ProtectedRoute ici,
// // // en plus de la protection sur app/host/_layout.tsx, pour double sécurité.

// // export default function HostDashboardTabLayout() {
// //   return (
// //     <Tabs
// //       screenOptions={{
// //         headerShown: false, // Pas de header spécifique aux onglets ici
// //         tabBarActiveTintColor: '#0891b2',
// //         tabBarInactiveTintColor: '#64748b',
// //         tabBarStyle: {
// //           backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f0f0f0',
// //            paddingBottom: 5, paddingTop: 5, height: 60,
// //         },
// //         tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 11, marginBottom: 3 },
// //       }}>
// //       <Tabs.Screen
// //         name="dashboard" // -> app/host/(dashboard)/dashboard.tsx
// //         options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} strokeWidth={2}/> }}
// //       />
// //       <Tabs.Screen
// //         name="bookings" // -> app/host/(dashboard)/bookings.tsx
// //         options={{ title: 'Réservations', tabBarIcon: ({ color, size }) => <CalendarClock size={size} color={color} strokeWidth={2}/> }}
// //       />
// //       <Tabs.Screen
// //         name="profile" // -> app/host/(dashboard)/profile.tsx (à déplacer/créer)
// //         options={{ title: 'Mon Profil', tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={2}/> }}
// //       />
// //     </Tabs>
// //   );
// // }


// // Dans app/(tabs)/host/(dashboard)/_layout.tsx
// import React, { useEffect } from 'react';
// import { Tabs, router, useSegments } from 'expo-router'; // Importer router et useSegments
// import { LayoutDashboard, CalendarClock, User } from 'lucide-react-native';
// import { useAuth } from '@/hooks/useAuth'; // Pour vérifier la connexion
// import { useAdmin } from '@/hooks/useAdmin'; // Pour vérifier les permissions
// import { View, ActivityIndicator, Text, StyleSheet, Alert } from 'react-native'; // Pour le chargement

// // Le nom de la permission requise pour accéder à cette section
// const REQUIRED_PERMISSION = 'view-host-dashboard'; // Assurez-vous que cette permission existe !

// export default function HostDashboardTabLayout() {
//   const { user, sessionInitialized } = useAuth();
//   const { hasPermission, loading: loadingPermissions } = useAdmin(); // Utiliser hasPermission et son état de chargement
//   const segments = useSegments(); // Pour détecter si on est bien dans cette section

//   useEffect(() => {
//     const checkAccess = async () => {
//       // Attendre que la session soit initialisée ET que les permissions soient chargées
//       if (!sessionInitialized || loadingPermissions) {
//         return;
//       }

//       // Si pas connecté -> login
//       if (!user) {
//         console.log("[HostDashboardLayout] User not logged in. Redirecting to login.");
//         router.replace('/auth/login');
//         return;
//       }

//       // Vérifier la permission spécifique
//       console.log(`[HostDashboardLayout] Checking permission: ${REQUIRED_PERMISSION}`);
//       const canAccess = await hasPermission(REQUIRED_PERMISSION);

//       if (!canAccess) {
//         // Si l'utilisateur est connecté mais n'a pas la permission -> Accueil
//         console.warn(`[HostDashboardLayout] Permission denied for ${REQUIRED_PERMISSION}. Redirecting to home.`);
//         Alert.alert("Accès refusé", "Vous n'avez pas les permissions nécessaires pour accéder à l'espace hôte.");
//         console.error("!!! REDIRECTION VERS / DEPUIS [NOM DU FICHIER] !!! Raison: [...]");   router.replace('/') ; 
//       } else {
//         console.log(`[HostDashboardLayout] Permission granted for ${REQUIRED_PERMISSION}.`);
//         // L'utilisateur a la permission, on ne fait rien, le layout s'affichera.
//       }
//     };

//     checkAccess();
//     // Ajouter user ici pour revérifier si l'utilisateur change (reconnexion)
//   }, [sessionInitialized, user, loadingPermissions, hasPermission, router, segments]);

//   // Afficher un indicateur de chargement tant que la session ou les permissions ne sont pas prêtes
//   if (!sessionInitialized || loadingPermissions) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0891b2" />
//         <Text style={styles.loadingText}>Vérification des accès...</Text>
//       </View>
//     );
//   }

//   // Si on arrive ici, l'utilisateur est connecté et a la permission requise
//   // On affiche alors les sous-onglets définis par ce layout
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: '#0891b2',
//         tabBarInactiveTintColor: '#64748b',
//         tabBarStyle: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingBottom: 5, paddingTop: 5, height: 60, },
//         tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 11, marginBottom: 3 },
//       }}>
//       <Tabs.Screen
//         name="dashboard" // -> app/(tabs)/host/(dashboard)/dashboard.tsx (doit exister)
//         options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} strokeWidth={2}/> }}
//       />
//       <Tabs.Screen
//         name="bookings" // -> app/(tabs)/host/(dashboard)/bookings.tsx
//         options={{ title: 'Réservations', tabBarIcon: ({ color, size }) => <CalendarClock size={size} color={color} strokeWidth={2}/> }}
//       />
//       <Tabs.Screen
//         // Assurez-vous que ce fichier existe : app/(tabs)/host/(dashboard)/profile.tsx
//         name="profile"
//         options={{ title: 'Mon Profil', tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={2}/> }}
//       />
//     </Tabs>
//   );
// }

// // Styles pour le chargement (peuvent être mis ailleurs)
// const styles = StyleSheet.create({
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#f8fafc',
//     },
//     loadingText: {
//         marginTop: 10,
//         fontFamily: 'Montserrat-Regular',
//         color: '#64748b'
//     }
// });



// Dans app/(tabs)/host/(dashboard)/_layout.tsx
// CORRECTION : Utilisation de checkPermission (async) au lieu de hasPermission (sync)

import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router'; // useSegments n'est plus nécessaire ici si non utilisé
import { LayoutDashboard, CalendarClock, User } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin'; // Assurez-vous que le chemin est correct
import { View, ActivityIndicator, Text, StyleSheet, Alert } from 'react-native';

const REQUIRED_PERMISSION = 'view-host-dashboard';

export default function HostDashboardTabLayout() {
  const { user, sessionInitialized } = useAuth();
  // <<< Utiliser checkPermission (async) et loadingPermissions de useAdmin >>>
  const { checkPermission, loading: loadingPermissions } = useAdmin();

  useEffect(() => {
    const checkAccess = async () => {
      // Attendre init session ET fin chargement useAdmin
      if (!sessionInitialized || loadingPermissions) {
        console.log(`[HostDashboardLayout] Waiting... SessionInit: ${sessionInitialized}, LoadingPerms: ${loadingPermissions}`);
        return;
      }

      // Vérifier user (sécurité)
      if (!user) {
        console.log("[HostDashboardLayout] No user after loading. Redirecting login.");
        router.replace('/auth/login');
        return;
      }

      // <<< CORRECTION : Appeler checkPermission ici >>>
      console.log(`[HostDashboardLayout] Checking permission: ${REQUIRED_PERMISSION}`);
      let canAccess = false;
      try {
        canAccess = await checkPermission(REQUIRED_PERMISSION); // Appel ASYNCHRONE
        console.log(`[HostDashboardLayout] Result of checkPermission('${REQUIRED_PERMISSION}'): ${canAccess}`);
      } catch (checkErr) {
        console.error(`[HostDashboardLayout] Error calling checkPermission:`, checkErr);
        canAccess = false; // Refuser l'accès en cas d'erreur
      }

      // Rediriger si accès refusé
      if (!canAccess) {
        console.warn(`[HostDashboardLayout] Permission denied for ${REQUIRED_PERMISSION}. Redirecting to home.`);
        Alert.alert("Accès refusé", "Vous n'avez pas les permissions nécessaires.");
        // Mettre le nom du fichier correct est mieux pour le debug
        console.error("!!! REDIRECTION VERS / DEPUIS HostDashboardLayout !!! Raison: Permission refusée par checkPermission");
        router.replace('/');
      } else {
        console.log(`[HostDashboardLayout] Permission granted for ${REQUIRED_PERMISSION}.`);
      }
    };

    checkAccess();
    // Ajouter les bonnes dépendances
  }, [sessionInitialized, user, loadingPermissions, checkPermission, router]);

  // Affichage pendant le chargement
  if (loadingPermissions || !sessionInitialized) { // Attendre les deux
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={styles.loadingText}>Vérification des accès...</Text>
      </View>
    );
  }

  // Si pas d'utilisateur après chargement (sécurité)
  if (!user) {
     return null; // Ou écran d'erreur/indication
  }

  // --- Rendu des onglets imbriqués ---
  // ATTENTION : Corrigez aussi les erreurs Expo Router signalées !
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0891b2',
        // ... autres options ...
      }}>
      {/* Option 1: Si dashboard.tsx existe */}
      {/* <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', ... }} /> */}
      {/* Option 2: Si bookings.tsx est l'index */}
      <Tabs.Screen name="index" options={{ title: 'Réservations', tabBarIcon: ({ color, size }) => <CalendarClock size={size} color={color} strokeWidth={2}/> }} />
      <Tabs.Screen name="bookings" options={{ href: null }} /> {/* Masquer /bookings si index est utilisé */}
      {/* Ou gardez 'bookings' si c'est le fichier réel et qu'il n'y a pas d'index */}
      {/* <Tabs.Screen name="bookings" options={{ title: 'Réservations', ... }} /> */}

      {/* >>> SUPPRIMER L'ONGLET PROFIL DUPLIQUÉ <<< */}
      {/* <Tabs.Screen name="profile" options={{ title: 'Mon Profil', ... }} /> */}
    </Tabs>
  );
}

// Styles
const styles = StyleSheet.create({
    loadingContainer: { /* ... */ },
    loadingText: { /* ... */ }
});