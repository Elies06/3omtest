///home/project/app/booking/success.tsx
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { CircleCheck as CheckCircle2, Chrome as Home } from 'lucide-react-native';
import { router } from 'expo-router';
import { SplashScreen } from 'expo-router';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

export default function BookingSuccessScreen() {
  const [fontsLoaded] = useFonts({
    'Montserrat-Bold': Montserrat_700Bold,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Regular': Montserrat_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={styles.content}
        entering={FadeIn.delay(200).springify()}
      >
        <View style={styles.iconContainer}>
          <CheckCircle2 size={64} color="#059669" />
        </View>

        <Text style={styles.title}>Réservation confirmée !</Text>
        <Text style={styles.subtitle}>
          Votre réservation a été effectuée avec succès. Un email de confirmation vous a été envoyé.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Rappel</Text>
          <Text style={styles.infoText}>
            N'oubliez pas d'apporter :{'\n'}
            • Votre maillot de bain{'\n'}
            • Une serviette{'\n'}
            • Une pièce d'identité
          </Text>
        </View>
      </Animated.View>

      <Animated.View 
        style={styles.footer}
        entering={SlideInUp.delay(400).springify()}
      >
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.replace('/')}
        >
          <Home size={20} color="#ffffff" />
          <Text style={styles.homeButtonText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 40 : 60,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 300,
  },
  infoCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  infoTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: '#0891b2',
    marginBottom: 12,
  },
  infoText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
  },
  footer: {
    marginTop: 40,
  },
  homeButton: {
    backgroundColor: '#0891b2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  homeButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});