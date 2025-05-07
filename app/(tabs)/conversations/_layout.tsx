// Dans PROJECT/app/(tabs)/conversations/_layout.tsx

import { Stack } from 'expo-router';

export default function ConversationsLayout() {
  // Ce layout utilise un Stack Navigator pour gérer les écrans
  // à l'intérieur de l'onglet "Messages".
  // Par défaut, il affichera l'écran 'index'.
  // Quand on naviguera vers '[id]', le Stack gérera la transition.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* On désactive le header du Stack ici car les écrans
          (index.tsx et [id].tsx) peuvent définir leur propre header
          via <Stack.Screen options={{...}} /> s'ils en ont besoin. */}
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}