// 


// /home/project/app/(tabs)/host/_layout.tsx
import { Stack } from 'expo-router';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function HostLayout() {
  return (
    <ProtectedRoute role="host">
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen
          name="index"
          options={{ title: 'Accueil Hôte', headerStyle: { backgroundColor: '#059669' }, headerTintColor: '#fff', headerTitleStyle: { fontFamily: 'Montserrat-SemiBold' } }}
        />
        <Stack.Screen
          name="register"
          options={{ title: 'Inscription Propriétaire' }}
        />
        <Stack.Screen
          name="dashboard"
          options={{ title: 'Tableau de bord' }}
        />
        <Stack.Screen
          name="payout-settings"
          options={{ title: 'Paramètres de Paiement' }}
        />
        {/* La route dynamique 'edit-listing/[id]' N'A PAS BESOIN d'être définie ici */}
      </Stack>
    </ProtectedRoute>
  );
}