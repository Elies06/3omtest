import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import MenuGrid from '@/components/MenuGrid';

// Garde l'écran de démarrage visible
SplashScreen.preventAutoHideAsync();

export default function AdminDashboard() {
  // Chargement des polices
  const [fontsLoaded, fontError] = useFonts({
    'Montserrat-Bold': Montserrat_700Bold,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Regular': Montserrat_400Regular,
  });

  // Masquer l'écran de démarrage une fois les polices chargées
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Afficher un indicateur pendant le chargement des polices
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
      </View>
    );
  }

  // Rendu principal de la page
  return (
    <ScrollView style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tableau de bord</Text>
        <Text style={styles.subtitle}>
          Gérez votre plateforme en toute simplicité
        </Text>
      </View>
      <MenuGrid />
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Fond blanc
  },
  header: {
    paddingHorizontal: 20, // Padding horizontal
    paddingTop: Platform.OS === 'android' ? 40 : 20, // Padding en haut (plus sur Android pour la barre de statut)
    paddingBottom: 20, // Padding en bas
  },
  title: {
    fontFamily: 'Montserrat-Bold', // Utilise la police chargée
    fontSize: 28, // Taille augmentée pour le titre principal
    color: '#1e293b', // Couleur sombre
    marginBottom: 4, // Espace réduit sous le titre
  },
  subtitle: {
    fontFamily: 'Montserrat-Regular', // Utilise la police chargée
    fontSize: 16,
    color: '#64748b', // Couleur grise
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Assurer un fond pendant le chargement
  },
});