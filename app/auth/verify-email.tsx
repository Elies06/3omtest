import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { Mail, ArrowLeft, RotateCcw } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SplashScreen } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';

SplashScreen.preventAutoHideAsync();

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams();
  const { resendVerificationEmail } = useAuth();
  const [email] = useState<string>(params.email as string);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [fontsLoaded] = useFonts({
    'Montserrat-Bold': Montserrat_700Bold,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Regular': Montserrat_400Regular,
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimeout > 0) {
      timer = setInterval(() => {
        setResendTimeout(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [resendTimeout]);

  if (!fontsLoaded || !email) {
    return null;
  }

  const handleResend = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    const success = await resendVerificationEmail(email);
    setResendLoading(false);
    
    if (success) {
      setCanResend(false);
      setResendTimeout(60);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#1e293b" />
      </TouchableOpacity>

      <Animated.View 
        style={styles.content}
        entering={FadeIn.delay(200).springify()}
      >
        <View style={styles.iconContainer}>
          <Mail size={48} color="#059669" />
        </View>

        <Text style={styles.title}>Vérifiez votre email</Text>
        <Text style={styles.description}>
          Nous avons envoyé un email de confirmation à{'\n'}
          <Text style={styles.emailText}>{email}</Text>{'\n'}
          Veuillez cliquer sur le lien dans l'email pour activer votre compte.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Vous n'avez pas reçu l'email ?</Text>
          <Text style={styles.infoText}>
            • Vérifiez votre dossier spam{'\n'}
            • L'email peut prendre quelques minutes pour arriver{'\n'}
            • Assurez-vous que l'adresse email est correcte
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.resendButton,
              (!canResend || resendLoading) && styles.resendButtonDisabled
            ]}
            onPress={handleResend}
            disabled={!canResend || resendLoading}
          >
            {resendLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <RotateCcw size={20} color="#ffffff" />
                <Text style={styles.resendButtonText}>
                  {canResend 
                    ? "Renvoyer l'email" 
                    : `Réessayer dans ${resendTimeout}s`
                  }
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
    marginBottom: 16,
  },
  description: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emailText: {
    fontFamily: 'Montserrat-SemiBold',
    color: '#1e293b',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 24,
    width: '100%',
  },
  infoTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 16,
  },
  infoText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
  },
  resendButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  resendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  resendButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});