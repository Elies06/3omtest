

// import { Stack } from 'expo-router';
// import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import { SplashScreen } from 'expo-router';
// import { useEffect } from 'react';
// import ProtectedRoute from '@/components/ProtectedRoute';

// SplashScreen.preventAutoHideAsync();

// export default function AdminLayout() {
//   const [fontsLoaded] = useFonts({
//     'Montserrat-Bold': Montserrat_700Bold,
//     'Montserrat-SemiBold': Montserrat_600SemiBold,
//     'Montserrat-Regular': Montserrat_400Regular,
//   });

//   useEffect(() => {
//     if (fontsLoaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [fontsLoaded]);

//   if (!fontsLoaded) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#3b82f6" />
//         <Text>Chargement des polices...</Text>
//       </View>
//     );
//   }

//   return (
//     <ProtectedRoute role="admin">
//       <Stack screenOptions={{ headerShown: true }}>
//         <Stack.Screen
//           name="index"
//           options={{ title: 'Tableau de bord' }}
//         />
//         <Stack.Screen name="users" options={{ title: 'Gestion des utilisateurs' }} />
//         <Stack.Screen name="users/[id]" options={{ title: 'Détails utilisateur' }} />
//         <Stack.Screen name="listings-validation" options={{ title: 'Gestion des annonces' }} />
//       </Stack>
//     </ProtectedRoute>
//   );
// }

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });





// Dans PROJECT/app/admin/_layout.tsx

import { Stack } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute'; // Assurez-vous que le chemin est correct

SplashScreen.preventAutoHideAsync();

export default function AdminLayout() {
  const [fontsLoaded, fontError] = useFonts({ // Ajout de fontError ici
    'Montserrat-Bold': Montserrat_700Bold,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Regular': Montserrat_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) { // Cacher même si erreur police
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) { // Afficher seulement si pas chargé ET pas d'erreur
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text>Chargement...</Text>
      </View>
    );
  }
   // Gérer l'erreur de police si elle se produit
   if (fontError) {
       console.error("Erreur chargement police dans AdminLayout:", fontError);
       // Afficher un message simple ou un fallback
       // return <View style={styles.loadingContainer}><Text>Erreur police</Text></View>;
       // Ou laisser le rendu continuer avec les polices système
   }


  return (
    // Protéger toute la section admin
    <ProtectedRoute role="admin">
      <Stack screenOptions={{
          headerShown: true,
          // Appliquer un style de header cohérent pour l'admin
          headerStyle: { backgroundColor: '#4b5563' }, // Exemple: Gris foncé
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontFamily: 'Montserrat-SemiBold' },
         }}>

        {/* Écran principal du tableau de bord admin */}
        <Stack.Screen
          name="index" // -> app/admin/index.tsx
          options={{ title: 'Tableau de Bord Admin' }}
        />
        {/* Écrans de gestion des utilisateurs */}
        <Stack.Screen
          name="users/index" // -> app/admin/users/index.tsx
          options={{ title: 'Gestion Utilisateurs' }}
         />
        <Stack.Screen
          name="users/[id]" // -> app/admin/users/[id].tsx
          options={{ title: 'Détails Utilisateur' }}
         />

        {/* Écran de validation des annonces (si vous l'avez) */}
        <Stack.Screen
            name="listings-validation" // -> app/admin/listings-validation.tsx (ou dossier/index)
            options={{ title: 'Validation Annonces' }}
        />
 <Stack.Screen
        name="listing-detail/[id]" // Correspond au dossier/fichier
        options={{ title: 'Détail Annonce' }}
    />
    <Stack.Screen
        name="listing-bookings/[listingId]" // Correspond au dossier/fichier
        options={{ title: 'Réservations Annonce' }}
    />

        {/* --- AJOUT DES NOUVEAUX ÉCRANS DE VÉRIFICATION --- */}
        <Stack.Screen
          name="verifications/index" // -> app/admin/verifications/index.tsx
          options={{ title: 'Gestion Vérifications KYC' }}
        />
        <Stack.Screen
          name="payout-verifications/index" // -> app/admin/payout-verifications/index.tsx
          options={{ title: 'Vérification des RIB' }}
        />
        {/* --- FIN AJOUT --- */}

         {/* Ajouter ici d'autres écrans admin (ex: roles, settings, etc.) */}
         <Stack.Screen name="roles" options={{ title: "Gestion Rôles" }} />
         <Stack.Screen name="settings" options={{ title: "Paramètres Admin" }} />
         <Stack.Screen name="analytics" options={{ title: "Statistiques" }} />
         <Stack.Screen name="reports" options={{ title: "Signalements" }} />
         <Stack.Screen name="bookings" options={{ title: "Toutes les Réservations" }} />
         <Stack.Screen name="manage-listings" options={{ title: "Toutes les Annonces" }} />


      </Stack>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { // Style pour erreur police
      fontSize: 16,
      color: 'red'
  }
});