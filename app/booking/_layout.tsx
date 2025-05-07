// import { Stack } from 'expo-router';

// export default function BookingLayout() {
//   return (
//     <Stack screenOptions={{ headerShown: true }}>
//       <Stack.Screen 
//         name="index" 
//         options={{ 
//           title: 'Réservation',
//           headerStyle: {
//             backgroundColor: '#0891b2',
//           },
//           headerTintColor: '#fff',
//           headerTitleStyle: {
//             fontFamily: 'Montserrat-SemiBold',
//           },
//         }} 
//       />
//       <Stack.Screen 
//         name="confirm" 
//         options={{ 
//           title: 'Confirmation',
//           headerStyle: {
//             backgroundColor: '#0891b2',
//           },
//           headerTintColor: '#fff',
//           headerTitleStyle: {
//             fontFamily: 'Montserrat-SemiBold',
//           },
//         }} 
//       />
//       <Stack.Screen 
//         name="success" 
//         options={{ 
//           title: 'Réservation confirmée',
//           headerStyle: {
//             backgroundColor: '#0891b2',
//           },
//           headerTintColor: '#fff',
//           headerTitleStyle: {
//             fontFamily: 'Montserrat-SemiBold',
//           },
//           headerBackVisible: false,
//         }} 
//       />
//     </Stack>
//   );
// }


// // Dans PROJECT/app/booking/_layout.tsx

// import { Stack } from 'expo-router';
// import ProtectedRoute from '@/components/ProtectedRoute'; // <-- 1. Importer ProtectedRoute

// export default function BookingLayout() {
//   return (
//     // --- 2. Envelopper le Stack avec ProtectedRoute ---
//     // Pas besoin de 'role' ici, on veut juste s'assurer que l'utilisateur est connecté
//     <ProtectedRoute>
//       <Stack screenOptions={{ headerShown: true }}>
//         <Stack.Screen
//           name="index"
//           options={{
//             title: 'Réservation',
//             headerStyle: { backgroundColor: '#0891b2' },
//             headerTintColor: '#fff',
//             headerTitleStyle: { fontFamily: 'Montserrat-SemiBold' },
//           }}
//         />
//         <Stack.Screen
//           name="confirm"
//           options={{
//             title: 'Confirmation',
//             headerStyle: { backgroundColor: '#0891b2' },
//             headerTintColor: '#fff',
//             headerTitleStyle: { fontFamily: 'Montserrat-SemiBold' },
//           }}
//         />
//         <Stack.Screen
//           name="success"
//           options={{
//             title: 'Réservation confirmée',
//             headerStyle: { backgroundColor: '#0891b2' },
//             headerTintColor: '#fff',
//             headerTitleStyle: { fontFamily: 'Montserrat-SemiBold' },
//             headerBackVisible: false, // C'est bien de ne pas pouvoir revenir en arrière ici
//           }}
//         />
//       </Stack>
//     </ProtectedRoute>
//     // ----------------------------------------------------
//   );
// }


// Dans app/booking/_layout.tsx
// MODIFICATION: Enlever la dépendance redirectInitiated du tableau de dépendances
// et utiliser useRef à la place de useState

import { Stack } from 'expo-router';
import React, { useRef } from 'react'; // Ajoutez useRef
import ProtectedRoute from '@/components/ProtectedRoute';

export default function BookingLayout() {
  return (
    <ProtectedRoute>
      <Stack screenOptions={{ headerShown: true }}>
        {/* Reste du code inchangé */}
      </Stack>
    </ProtectedRoute>
  );
}