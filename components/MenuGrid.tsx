// // import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// // import { Users, Shield, Settings, Activity, TriangleAlert as AlertTriangle } from 'lucide-react-native';
// // import { router } from 'expo-router';
// // import { useAdmin } from '@/hooks/useAdmin';

// // export default function MenuGrid() {
// //   const { hasPermission } = useAdmin();

// //   console.log(hasPermission);

// //   const menuItems = [
// //     {
// //       title: 'Utilisateurs',
// //       description: 'Gérer les utilisateurs et leurs rôles',
// //       icon: Users,
// //       route: '/admin/users',
// //       permission: 'manage_users',
// //     },
// //     {
// //       title: 'Rôles & Permissions',
// //       description: 'Configurer les rôles et leurs permissions',
// //       icon: Shield,
// //       route: '/admin/roles',
// //       permission: 'manage_roles',
// //     },
// //     {
// //       title: 'Paramètres',
// //       description: 'Configuration générale de la plateforme',
// //       icon: Settings,
// //       route: '/admin/settings',
// //       permission: 'manage_settings',
// //     },
// //     {
// //       title: 'Statistiques',
// //       description: 'Analyser l\'activité de la plateforme',
// //       icon: Activity,
// //       route: '/admin/analytics',
// //       permission: 'view_analytics',
// //     },
// //     {
// //       title: 'Signalements',
// //       description: 'Gérer les signalements d\'utilisateurs',
// //       icon: AlertTriangle,
// //       route: '/admin/reports',
// //       permission: 'moderate_content',
// //     },
// //   ];

// //   return (
// //     <View style={styles.menuGrid}>
// //       {menuItems.map((item, index) => (
// //         hasPermission(item.permission) && (
// //           <TouchableOpacity
// //             key={index}
// //             style={styles.menuItem}
// //             onPress={() => router.push(item.route)}
// //           >
// //             <View style={styles.menuIcon}>
// //               <item.icon size={24} color="#0891b2" />
// //             </View>
// //             <Text style={styles.menuTitle}>{item.title}</Text>
// //             <Text style={styles.menuDescription}>{item.description}</Text>
// //           </TouchableOpacity>
// //         )
// //       ))}
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   menuGrid: {
// //     padding: 20,
// //     gap: 20,
// //   },
// //   menuItem: {
// //     backgroundColor: '#f8fafc',
// //     borderRadius: 16,
// //     padding: 20,
// //   },
// //   menuIcon: {
// //     width: 48,
// //     height: 48,
// //     borderRadius: 24,
// //     backgroundColor: '#e0f2fe',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginBottom: 16,
// //   },
// //   menuTitle: {
// //     fontFamily: 'Montserrat-Bold',
// //     fontSize: 18,
// //     color: '#1e293b',
// //     marginBottom: 8,
// //   },
// //   menuDescription: {
// //     fontFamily: 'Montserrat-Regular',
// //     fontSize: 14,
// //     color: '#64748b',
// //   },
// // });
// // Dans project/components/MenuGrid.tsx
// import React, { useEffect } from 'react'; // Importer useEffect
// import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
// // Assurez-vous que toutes ces icônes sont bien exportées par lucide-react-native
// import { Users, Shield, Settings, Activity, TriangleAlert as AlertTriangle, ClipboardList, CalendarClock } from 'lucide-react-native';
// import { router } from 'expo-router';
// import { useAdmin } from '@/hooks/useAdmin'; // Chemin vers votre hook useAdmin

// export default function MenuGrid() {
//   // Récupérer aussi checkPermission et le cache (pour l'optimisation dans useEffect)
//   const { hasPermission, checkPermission, loading, error, permissionCache } = useAdmin();

//   // Définition des éléments de menu
//   const menuItems = [
//     {
//       title: 'Utilisateurs',
//       description: 'Gérer les utilisateurs et leurs rôles',
//       icon: Users, // Vérifiez que 'Users' est bien importé et valide
//       route: '/admin/users',
//       permission: 'manage_users',
//     },
//     {
//      title: 'Réservations',
//       description: 'Voir et gérer toutes les réservations',
//       icon: CalendarClock, // Vérifiez que 'CalendarClock' est bien importé et valide
//       route: '/admin/bookings',
//       permission: 'manage_bookings',
//     },
//     {
//       title: 'Gestion des annonces',
//       description: 'Voir/éditer les annonces en ligne, en attente, rejetées',
//       icon: ClipboardList, // Vérifiez que 'ClipboardList' est bien importé et valide
//       route: '/admin/manage-listings',
//       permission: 'moderate_content',
//     },
//     {
//       title: 'Rôles & Permissions',
//       description: 'Configurer les rôles et leurs permissions',
//       icon: Shield, // Vérifiez que 'Shield' est bien importé et valide
//       route: '/admin/roles',
//       permission: 'manage_roles',
//     },
//     {
//       title: 'Paramètres',
//       description: 'Configuration générale de la plateforme',
//       icon: Settings, // Vérifiez que 'Settings' est bien importé et valide
//       route: '/admin/settings',
//       permission: 'manage_settings',
//     },
//     {
//       title: 'Statistiques',
//       description: 'Analyser l\'activité de la plateforme',
//       icon: Activity, // Vérifiez que 'Activity' est bien importé et valide
//       route: '/admin/analytics',
//       permission: 'view_analytics',
//     },
//     {
//       title: 'Signalements',
//       description: 'Gérer les signalements d\'utilisateurs',
//       icon: AlertTriangle, // Vérifiez que 'AlertTriangle' (alias de TriangleAlert) est bien importé et valide
//       route: '/admin/reports',
//       permission: 'moderate_content',
//     },
//   ];

//   // Déclencher les vérifications de permissions au montage/changement
//   useEffect(() => {
//     console.log("[MenuGrid] useEffect: Déclenchement des vérifications de permissions...");
//     // Obtenir la liste unique des permissions nécessaires
//     const permissionsToCheck = [...new Set(menuItems.map(item => item.permission))];

//     permissionsToCheck.forEach(permission => {
//       // Vérifier seulement si la permission n'est pas déjà dans le cache
//       if (permissionCache[permission] === undefined) {
//         console.log(`[MenuGrid] useEffect: Appel de checkPermission pour "${permission}"`);
//         checkPermission(permission); // Appelle la fonction ASYNCHRONE
//       } else {
//          console.log(`[MenuGrid] useEffect: Permission "${permission}" déjà dans le cache.`);
//       }
//     });
//     // dépendances pour la stabilité
//   }, [menuItems, checkPermission, permissionCache]);

//   // Afficher pendant le chargement global (auth + rôles + permissions)
//   if (loading) { // 'loading' inclut maintenant isCheckingPermission venant de useAdmin
//     return (
//       <View style={[styles.menuGrid, styles.loadingContainer]}>
//         <ActivityIndicator size="large" color="#0891b2" />
//       </View>
//     );
//   }

//   // Afficher l'erreur globale (peut venir de useAuth)
//   if (error) {
//       return (
//         <View style={styles.menuGrid}>
//          <Text style={styles.errorText}>Erreur chargement: {error}</Text>
//         </View>
//       );
//   }

//   // Filtrer les éléments accessibles APRÈS la fin du chargement, basé sur le cache rempli
//   // On utilise la fonction SYNCHRONE hasPermission ici, qui lit le cache
//   const accessibleItems = menuItems.filter(item => hasPermission(item.permission));

//   return (
//     <View style={styles.menuGrid}>
//       {/* Mapper seulement les éléments accessibles */}
//       {accessibleItems.map((item) => {
//          // Double-vérification pour éviter l'erreur "type is invalid" si une icône est undefined
//          const IconComponent = item.icon;
//          if (!IconComponent) {
//              console.warn(`[MenuGrid] Icon component for "${item.title}" is undefined! Skipping item.`);
//              return null; // Ne pas rendre cet item si l'icône est invalide
//          }
//          return (
//             <TouchableOpacity
//               key={item.title}
//               style={styles.menuItem}
//               onPress={() => router.push(item.route)}
//             >
//               <View style={styles.menuIcon}>
//                 <IconComponent size={24} color="#0891b2" />
//               </View>
//               <Text style={styles.menuTitle}>{item.title}</Text>
//               <Text style={styles.menuDescription}>{item.description}</Text>
//             </TouchableOpacity>
//          );
//       })}

//       {/* Afficher le message vide SEULEMENT si chargement terminé ET aucun item n'est accessible */}
//       {!loading && accessibleItems.length === 0 && (
//         <Text style={styles.menuDescription}>Aucune section accessible.</Text>
//       )}
//     </View>
//   );
// }

// // --- Styles ---
// const styles = StyleSheet.create({
//   menuGrid: {
//     padding: 20,
//     gap: 20, // Si 'gap' ne fonctionne pas sur toutes les plateformes, utilisez marginBottom sur menuItem
//     display: 'flex',
//     flexDirection: 'column', // Affiche les items en colonne. Changez en 'row' et ajoutez 'flexWrap: wrap' pour une grille.
//   },
//   loadingContainer: {
//       justifyContent: 'center',
//       alignItems: 'center',
//       minHeight: 200, // Hauteur minimale pendant le chargement
//   },
//   errorText: {
//       fontFamily: 'Montserrat-Regular', // Assurez-vous que la police est chargée
//       fontSize: 14,
//       color: '#dc2626', // Rouge pour l'erreur
//       textAlign: 'center',
//   },
//   menuItem: {
//     backgroundColor: '#f8fafc', // Fond légèrement gris
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#e5e7eb', // Bordure grise claire
//     // marginBottom: 20, // Alternative à 'gap'
//   },
//   menuIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24, // Cercle parfait
//     backgroundColor: '#e0f2fe', // Fond bleu clair pour l'icône
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   menuTitle: {
//     fontFamily: 'Montserrat-Bold', // Assurez-vous que la police est chargée
//     fontSize: 18,
//     color: '#1e293b', // Couleur sombre pour le titre
//     marginBottom: 8,
//   },
//   menuDescription: {
//     fontFamily: 'Montserrat-Regular', // Assurez-vous que la police est chargée
//     fontSize: 14,
//     color: '#64748b', // Couleur grise pour la description et le message vide
//     textAlign: 'center', // Centrer le message "Aucune section accessible."
//   },
// });





// import React, { useEffect, useMemo, useCallback } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { Users, Shield, Settings, Activity, TriangleAlert as AlertTriangle, ClipboardList, CalendarClock, ArrowLeft } from 'lucide-react-native';
// import { router } from 'expo-router';
// import { useAdmin } from '@/hooks/useAdmin';

// export default function MenuGrid() {
//   const { hasPermission, checkPermission, loading, error, permissionCache } = useAdmin();

//   // Utiliser useMemo pour éviter de recréer le tableau à chaque rendu
//   const menuItems = useMemo(() => [
//     { title: 'Utilisateurs', description: 'Gérer les utilisateurs et leurs rôles', icon: Users, route: '/admin/users', permission: 'manage_users' },
//     { title: 'Réservations', description: 'Voir et gérer toutes les réservations', icon: CalendarClock, route: '/admin/bookings', permission: 'manage_bookings' },
//     { title: 'Gestion des annonces', description: 'Voir/éditer les annonces', icon: ClipboardList, route: '/admin/manage-listings', permission: 'moderate_content' },
//     { title: 'Rôles & Permissions', description: 'Configurer les rôles', icon: Shield, route: '/admin/roles', permission: 'manage_roles' },
//     { title: 'Paramètres', description: 'Configuration générale', icon: Settings, route: '/admin/settings', permission: 'manage_settings' },
//     { title: 'Statistiques', description: 'Analyser l\'activité', icon: Activity, route: '/admin/analytics', permission: 'view_analytics' },
//     { title: 'Signalements', description: 'Gérer les signalements', icon: AlertTriangle, route: '/admin/reports', permission: 'moderate_content' },
//   ], []);

//   // Extraire uniquement les permissions uniques
//   const permissionsToCheck = useMemo(() => 
//     [...new Set(menuItems.map(item => item.permission))],
//     [menuItems]
//   );

//   // Optimiser le useEffect pour n'exécuter qu'une fois
//   useEffect(() => {
//     console.log("[MenuGrid] useEffect: Déclenchement initial des vérifications de permissions...");
    
//     permissionsToCheck.forEach(permission => {
//       if (permissionCache[permission] === undefined) {
//         console.log(`[MenuGrid] useEffect: Appel de checkPermission pour "${permission}"`);
//         checkPermission(permission);
//       } else {
//         console.log(`[MenuGrid] useEffect: Permission "${permission}" déjà dans le cache.`);
//       }
//     });
//   }, [permissionCache, checkPermission, permissionsToCheck]); // Ne pas inclure menuItems directement

//   // Optimiser les callbacks de navigation
//   const navigateToHome = useCallback(() => router.push('/'), []);

//   if (loading) {
//     return (
//       <View style={[styles.container, styles.loadingContainer]}>
//         <ActivityIndicator size="large" color="#0891b2" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.errorText}>Erreur chargement: {error}</Text>
//       </View>
//     );
//   }

//   const accessibleItems = menuItems.filter(item => hasPermission(item.permission));

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={styles.homeButton}
//         onPress={navigateToHome}
//       >
//         <ArrowLeft size={18} color="#0891b2" />
//         <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
//       </TouchableOpacity>

//       <View style={styles.menuGrid}>
//         {accessibleItems.map((item) => {
//           const IconComponent = item.icon;
//           if (!IconComponent) {
//             return null;
//           }
//           return (
//             <TouchableOpacity
//               key={item.title}
//               style={styles.menuItem}
//               onPress={() => router.push(item.route)}
//             >
//               <View style={styles.menuIcon}>
//                 <IconComponent size={24} color="#0891b2" />
//               </View>
//               <Text style={styles.menuTitle}>{item.title}</Text>
//               <Text style={styles.menuDescription}>{item.description}</Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>
      
//       {!loading && accessibleItems.length === 0 && (
//         <View style={styles.fullWidthMessage}>
//           <Text style={styles.emptyText}>Aucune section accessible.</Text>
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     paddingHorizontal: 15,
//     paddingVertical: 20,
//     flex: 1,
//   },
//   homeButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 8,
//     alignSelf: 'flex-start',
//     marginBottom: 24,
//   },
//   homeButtonText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 14,
//     color: '#0891b2',
//     marginLeft: 6,
//   },
//   menuGrid: {
//     display: 'flex',
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   loadingContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     minHeight: 200,
//     width: '100%',
//   },
//   errorText: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#dc2626',
//     textAlign: 'center',
//     width: '100%',
//   },
//   menuItem: {
//     backgroundColor: '#f8fafc',
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//     width: '48%',
//     marginBottom: 15,
//     alignItems: 'center',
//   },
//   menuIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#e0f2fe',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   menuTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     color: '#1e293b',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   menuDescription: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#64748b',
//     textAlign: 'center',
//   },
//   fullWidthMessage: {
//     width: '100%',
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#64748b',
//     textAlign: 'center',
//   },
// });



// import React, { useEffect, useMemo, useCallback } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native'; // Ajout Platform si manquant
// import {
//     Users, Shield, Settings, Activity, TriangleAlert as AlertTriangle,
//     ClipboardList, CalendarClock, ArrowLeft,
//     ShieldCheck // <-- Icône pour KYC
// } from 'lucide-react-native';
// import { router } from 'expo-router';
// import { useAdmin } from '@/hooks/useAdmin'; // Assurez-vous que le chemin est correct

// export default function MenuGrid() { // Nom du composant, adapter si besoin
//     const { hasPermission, checkPermission, loading, error, permissionCache } = useAdmin();

//     // Utiliser useMemo pour éviter de recréer le tableau à chaque rendu
//     const menuItems = useMemo(() => [
//         { title: 'Utilisateurs', description: 'Gérer les utilisateurs et leurs rôles', icon: Users, route: '/admin/users', permission: 'manage_users' },
//         { title: 'Réservations', description: 'Voir et gérer toutes les réservations', icon: CalendarClock, route: '/admin/bookings', permission: 'manage_bookings' },
//         { title: 'Gestion des annonces', description: 'Voir/éditer les annonces', icon: ClipboardList, route: '/admin/manage-listings', permission: 'moderate_content' },
//         // --- AJOUT DE L'ÉLÉMENT KYC ---
//         {
//           title: 'Vérifications KYC',
//           description: 'Approuver ou rejeter les identités',
//           icon: ShieldCheck, // Utilisation de l'icône importée
//           route: '/admin/verifications', // Chemin vers l'écran créé
//           permission: 'manage_verifications' // Permission à vérifier/créer
//         },
//         // -----------------------------
//         { title: 'Rôles & Permissions', description: 'Configurer les rôles', icon: Shield, route: '/admin/roles', permission: 'manage_roles' },
//         { title: 'Paramètres', description: 'Configuration générale', icon: Settings, route: '/admin/settings', permission: 'manage_settings' },
//         { title: 'Statistiques', description: 'Analyser l\'activité', icon: Activity, route: '/admin/analytics', permission: 'view_analytics' },
//         { title: 'Signalements', description: 'Gérer les signalements', icon: AlertTriangle, route: '/admin/reports', permission: 'moderate_content' },
//     ], []);

//     // Extraire uniquement les permissions uniques
//     const permissionsToCheck = useMemo(() =>
//         [...new Set(menuItems.map(item => item.permission))],
//         [menuItems]
//     );

//     // Optimiser le useEffect pour n'exécuter qu'une fois
//     useEffect(() => {
//         console.log("[MenuGrid] useEffect: Checking permissions...");
//         permissionsToCheck.forEach(permission => {
//             if (permissionCache[permission] === undefined) {
//                 console.log(`[MenuGrid] Calling checkPermission for "${permission}"`);
//                 checkPermission(permission);
//             } else {
//                 console.log(`[MenuGrid] Permission "${permission}" already in cache.`);
//             }
//         });
//     }, [permissionCache, checkPermission, permissionsToCheck]);

//     // Optimiser les callbacks de navigation
//     const navigateToHome = useCallback(() => router.push('/'), []);

//     if (loading) {
//         return ( <View style={[styles.container, styles.loadingContainer]}><ActivityIndicator size="large" color="#0891b2" /></View> );
//     }

//     if (error) {
//         return ( <View style={styles.container}><Text style={styles.errorText}>Erreur chargement permissions: {error}</Text></View> );
//     }

//     const accessibleItems = menuItems.filter(item => hasPermission(item.permission));

//     return (
//         <View style={styles.container}>
//             <TouchableOpacity style={styles.homeButton} onPress={navigateToHome} >
//                 <ArrowLeft size={18} color="#0891b2" />
//                 <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
//             </TouchableOpacity>

//             <View style={styles.menuGrid}>
//                 {accessibleItems.map((item) => {
//                     const IconComponent = item.icon;
//                     if (!IconComponent) return null; // Sécurité si icône manquante
//                     return (
//                         <TouchableOpacity key={item.title} style={styles.menuItem} onPress={() => router.push(item.route)} >
//                             <View style={styles.menuIcon}><IconComponent size={24} color="#0891b2" /></View>
//                             <Text style={styles.menuTitle}>{item.title}</Text>
//                             <Text style={styles.menuDescription}>{item.description}</Text>
//                         </TouchableOpacity>
//                     );
//                 })}
//             </View>

//             {!loading && accessibleItems.length === 0 && (
//                 <View style={styles.fullWidthMessage}>
//                      <Text style={styles.emptyText}>Aucune section accessible avec vos permissions actuelles.</Text>
//                 </View>
//             )}
//         </View>
//     );
// }

// // Styles (doivent être définis ci-dessous)
// const styles = StyleSheet.create({
//      container: { paddingHorizontal: 15, paddingVertical: 20, flex: 1, },
//      homeButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, alignSelf: 'flex-start', marginBottom: 24, },
//      homeButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#0891b2', marginLeft: 6, },
//      menuGrid: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', },
//      loadingContainer: { justifyContent: 'center', alignItems: 'center', minHeight: 200, width: '100%', },
//      errorText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#dc2626', textAlign: 'center', width: '100%', },
//      menuItem: { backgroundColor: '#ffffff', // Fond blanc pour contraste
//          borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', width: '48%', // Pour 2 colonnes
//          marginBottom: 15, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, minHeight: 180, // Hauteur minimale
//      },
//      menuIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center', marginBottom: 16, },
//      menuTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, // Légèrement réduit
//          color: '#1e293b', marginBottom: 8, textAlign: 'center', },
//      menuDescription: { fontFamily: 'Montserrat-Regular', fontSize: 13, // Légèrement réduit
//          color: '#64748b', textAlign: 'center', lineHeight: 18, },
//      fullWidthMessage: { width: '100%', marginTop: 20, alignItems: 'center', },
//      emptyText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', textAlign: 'center', },
// });



// Dans components/Admin/MenuGrid.tsx (ou le chemin où il se trouve)

import React, { useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import {
    Users, Shield, Settings, Activity, TriangleAlert as AlertTriangle,
    ClipboardList, CalendarClock, ArrowLeft,
    ShieldCheck, // Icône pour KYC
    Banknote    // Icône pour Paiements/RIB
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAdmin } from '@/hooks/useAdmin'; // Assurez-vous que le chemin est correct

export default function MenuGrid() { // Nom du composant, adapter si besoin
    const { hasPermission, checkPermission, loading, error, permissionCache } = useAdmin();

    // Définition des éléments du menu
    const menuItems = useMemo(() => [
        { title: 'Utilisateurs', description: 'Gérer utilisateurs et rôles', icon: Users, route: '/admin/users', permission: 'manage_users' },
        { title: 'Réservations', description: 'Voir toutes les réservations', icon: CalendarClock, route: '/admin/bookings', permission: 'manage_bookings' },
        { title: 'Gestion Annonces', description: 'Voir/éditer les annonces', icon: ClipboardList, route: '/admin/manage-listings', permission: 'moderate_content' },
        { title: 'Vérifications KYC', description: 'Valider les identités', icon: ShieldCheck, route: '/admin/verifications', permission: 'manage_verifications' },
        { title: 'Vérification Paiements', description: 'Valider les RIB/IBAN des hôtes', icon: Banknote, route: '/admin/payout-verifications', permission: 'manage_payouts' }, // permission à créer/assigner
        { title: 'Rôles & Permissions', description: 'Configurer les rôles', icon: Shield, route: '/admin/roles', permission: 'manage_roles' },
        { title: 'Paramètres', description: 'Configuration générale', icon: Settings, route: '/admin/settings', permission: 'manage_settings' },
        { title: 'Statistiques', description: 'Analyser l\'activité', icon: Activity, route: '/admin/analytics', permission: 'view_analytics' },
        { title: 'Signalements', description: 'Gérer les signalements', icon: AlertTriangle, route: '/admin/reports', permission: 'moderate_content' },
    ], []);

    // Récupération optimisée des permissions
    const permissionsToCheck = useMemo(() => [...new Set(menuItems.map(item => item.permission))], [menuItems]);
    useEffect(() => { permissionsToCheck.forEach(permission => { if (permissionCache[permission] === undefined) { checkPermission(permission); } }); }, [permissionCache, checkPermission, permissionsToCheck]);

    const navigateToHome = useCallback(() => router.push('/'), []);

    if (loading) { return (<View style={[styles.container, styles.loadingContainer]}><ActivityIndicator size="large" color="#0891b2" /></View>); }
    if (error) { return (<View style={styles.container}><Text style={styles.errorText}>Erreur permissions: {error}</Text></View>); }

    const accessibleItems = menuItems.filter(item => hasPermission(item.permission));

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.homeButton} onPress={navigateToHome} >
                <ArrowLeft size={18} color="#0891b2" />
                <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
            </TouchableOpacity>

            <View style={styles.menuGrid}>
                {accessibleItems.map((item) => {
                    const IconComponent = item.icon;
                    if (!IconComponent) return null;
                    return (
                        <TouchableOpacity key={item.title} style={styles.menuItem} onPress={() => router.push(item.route)} >
                            <View style={styles.menuIcon}><IconComponent size={24} color="#0891b2" /></View>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Text style={styles.menuDescription}>{item.description}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {!loading && accessibleItems.length === 0 && ( <View style={styles.fullWidthMessage}><Text style={styles.emptyText}>Aucune section accessible.</Text></View> )}
        </View>
    );
}

// Styles (Assurez-vous que ces styles sont définis ou adaptez)
const styles = StyleSheet.create({
     container: { paddingHorizontal: 15, paddingVertical: 20, flex: 1, },
     homeButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, alignSelf: 'flex-start', marginBottom: 24, },
     homeButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#0891b2', marginLeft: 6, },
     menuGrid: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', },
     loadingContainer: { justifyContent: 'center', alignItems: 'center', minHeight: 200, width: '100%', },
     errorText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#dc2626', textAlign: 'center', width: '100%', },
     menuItem: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', width: '48%', marginBottom: 15, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2, minHeight: 180, },
     menuIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center', marginBottom: 16, },
     menuTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b', marginBottom: 8, textAlign: 'center', },
     menuDescription: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 18, },
     fullWidthMessage: { width: '100%', marginTop: 20, alignItems: 'center', },
     emptyText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', textAlign: 'center', },
});