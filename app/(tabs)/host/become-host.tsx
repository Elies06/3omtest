// Fichier: app/(tabs)/become-host.tsx

import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
    Platform, ActivityIndicator, SafeAreaView // Ajout SafeAreaView
} from 'react-native';
import {
    useFonts,
    Montserrat_700Bold,
    Montserrat_600SemiBold,
    Montserrat_400Regular,
} from '@expo-google-fonts/montserrat';
import { ArrowRight, LogIn } from 'lucide-react-native';
// --- MODIFICATION IMPORT: Ajout de Tabs ---
import { router, SplashScreen, Stack, Tabs } from 'expo-router';
// ------------------------------------------
import Animated, { FadeIn } from 'react-native-reanimated';
// --- Imports Composants (vérifiez/adaptez les chemins !) ---
import { RevenueSimulator } from '@/components/RevenueSimulator'; // Supposé déplacé
import { WhyHostSection } from '@/components/WhyHostSection';   // Supposé déplacé
// -----------------------------------------------------------
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin'; // <-- Importer useAdmin

SplashScreen.preventAutoHideAsync();

// Renommer la fonction du composant écran
export default function BecomeHostScreen() {
  const { user } = useAuth();
  // Utiliser useAdmin pour obtenir les rôles et l'état de chargement
  const { userRoles, loading: loadingRoles, hasRole } = useAdmin(); // hasRole peut être utile ailleurs
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  const [fontsLoaded, fontError] = useFonts({
    'Montserrat-Bold': Montserrat_700Bold,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Regular': Montserrat_400Regular,
  });

  // Masquer SplashScreen quand polices chargées
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Nouvelle fonction pour gérer le clic sur le bouton CTA
  const handleStartHosting = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Attendre que les rôles soient chargés
    if (loadingRoles) {
      console.log("Attente chargement des rôles...");
      return; // Ne rien faire pour l'instant
    }

    console.log("[BecomeHostScreen] Rôles détectés pour action CTA:", userRoles);

    if (userRoles.includes('usernotverified')) {
      // Si non vérifié, aller vers la vérification d'identité
      console.log("Redirection vers /profile/verify pour usernotverified");
      router.push('/profile/verify'); // Assurez-vous que cette route existe
    } else if (userRoles.includes('swimmer')) {
      // Si swimmer, aller vers la page de demande de rôle host
       console.log("Redirection vers /profile/request-host-role pour swimmer");
      router.push('/profile/request-host-role'); // Assurez-vous que cette route existe
    } else if (userRoles.includes('host') || userRoles.includes('hostpro')) {
        // Normalement, cet utilisateur ne devrait pas voir cet onglet, mais par sécurité :
        console.log("Utilisateur déjà Host/HostPro, redirection vers dashboard");
        router.replace('/host/dashboard'); // Remplace la route actuelle par le dashboard
    }
    else {
      // Cas par défaut ou rôle inconnu
      console.warn("handleStartHosting: Rôle inattendu ou non géré:", userRoles);
      router.push('/profile'); // Rediriger vers le profil
    }
  };

  if (!fontsLoaded && !fontError) {
    // Affiche un loader tant que les polices ne sont pas prêtes
    return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
  }
   // Gérer erreur police
   if (fontError) {
       console.error("Font loading error:", fontError);
       return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur chargement polices.</Text></SafeAreaView>;
   }

  return (
    // Utiliser SafeAreaView pour éviter les encoches/barres de statut
    <SafeAreaView style={styles.container}>
        {/* --- AJOUT LIGNE POUR MASQUER L'ONGLET DANS LE LAYOUT PARENT --- */}
        <Tabs.Screen options={{ href: null }} />
        {/* ------------------------------------------------------------- */}

        {/* Titre optionnel via Stack.Screen si nécessaire (peut être redondant avec Tabs) */}
        {/* <Stack.Screen options={{ title: 'Devenir Hôte', headerShown: false }} /> */}

        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* --- Contenu de la page --- */}
          <View style={styles.heroSection}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200' }} style={styles.heroImage} />
            <View style={styles.overlay} />
            <View style={styles.heroContent}>
              <Animated.View entering={FadeIn.delay(200)}>
                <Text style={styles.heroTitle}>Gagnez de l'argent en louant votre piscine</Text>
                <Text style={styles.heroSubtitle}>Rentabilisez votre piscine dès le premier plongeon</Text>
              </Animated.View>
            </View>
          </View>

          <View style={styles.simulatorContainer}>
            <RevenueSimulator onSimulate={setMonthlyRevenue} />
            <View style={styles.revenueDisplay}>
              <Text style={styles.revenueLabel}>Revenu mensuel estimé</Text>
              <Animated.Text style={styles.revenueAmount} entering={FadeIn.delay(400)}>
                {monthlyRevenue} MAD
              </Animated.Text>
            </View>
          </View>

          {/* Section Pourquoi Devenir Hôte */}
          <WhyHostSection />

          {/* --- Section CTA Modifiée --- */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
            <Text style={styles.ctaText}>
               {/* Texte simplifié */}
               Devenez propriétaire pour pouvoir créer votre annonce et commencer à gagner de l'argent.
            </Text>

            <TouchableOpacity
              style={[styles.ctaButton, (user && loadingRoles) && styles.ctaButtonDisabled]} // Désactiver si rôles en chargement
              onPress={handleStartHosting}
              disabled={(user && loadingRoles)} // Désactiver pendant le chargement des rôles si utilisateur connecté
            >
              {!user ? (
                <>
                  <LogIn size={20} color="#ffffff" />
                  <Text style={styles.ctaButtonText}>Se connecter d'abord</Text>
                </>
              ) : (
                <>
                  <ArrowRight size={20} color="#ffffff" />
                  <Text style={styles.ctaButtonText}>Devenir propriétaire</Text>
                </>
              )}
              {/* Afficher un indicateur si les rôles chargent */}
              {user && loadingRoles && <ActivityIndicator color="#ffffff" style={{ marginLeft: 10 }}/>}
            </TouchableOpacity>
          </View>
          {/* --- Fin Section CTA --- */}

       </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: { // Ajout style pour chargement police
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  errorText: { // Ajout style pour erreur police
    color: 'red'
  },
  contentContainer: { // Ajout pour padding éventuel
     paddingBottom: 40, // Espace en bas
  },
  heroSection: {
    height: 500, // Ou ajustez selon votre design
    position: 'relative',
    backgroundColor: '#e0f2fe', // Couleur de fond pendant chargement image
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Assombrir un peu plus
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Platform.OS === 'web' ? 40 : 24, // Moins de padding sur mobile
  },
  heroTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: Platform.OS === 'web' ? 48 : 36, // Plus petit sur mobile
    color: '#ffffff',
    marginBottom: 16,
    maxWidth: 600, // Pour éviter texte trop large sur web
  },
  heroSubtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: Platform.OS === 'web' ? 24 : 18, // Plus petit sur mobile
    color: '#ffffff',
    opacity: 0.9,
    maxWidth: 500, // Pour éviter texte trop large sur web
  },
  simulatorContainer: {
    padding: 24,
    marginTop: Platform.OS === 'web' ? -80 : -60, // Remonter un peu moins sur mobile
    zIndex: 1,
  },
  revenueDisplay: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
    // --- BOX SHADOW --- (Adapté de votre autre fichier)
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2, // Légère ombre en bas
    },
    shadowOpacity: 0.1, // Ombre subtile
    shadowRadius: 8, // Flou de l'ombre
    elevation: 5, // Pour Android
    // -----------------
  },
  revenueLabel: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#64748b', // Gris
    marginBottom: 8,
  },
  revenueAmount: {
    fontFamily: 'Montserrat-Bold',
    fontSize: Platform.OS === 'web' ? 36 : 32, // Taille adaptée
    color: '#059669', // Vert
  },
  ctaSection: {
    padding: 24,
    backgroundColor: '#f8fafc', // Fond légèrement gris
    alignItems: 'center',
    borderRadius: 16, // Coins arrondis
    marginHorizontal: 24, // Marges latérales
    marginTop: 32, // Marge haute
    marginBottom: 24, // Marge basse
  },
  ctaTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: Platform.OS === 'web' ? 32 : 28,
    color: '#1e293b', // Texte sombre
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: '#64748b', // Texte gris
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 600, // Limite largeur
    lineHeight: Platform.OS === 'web' ? 28 : 24, // Interligne
  },
  ctaButton: {
    backgroundColor: '#059669', // Vert
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // Espace entre icone et texte
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12, // Coins arrondis
  },
   ctaButtonDisabled: { // Style pour bouton désactivé
     opacity: 0.6,
   },
  ctaButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#ffffff', // Texte blanc
  },
});