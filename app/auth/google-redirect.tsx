import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';

export default function GoogleRedirectScreen() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        // Handle the redirect and any necessary state management
        if (params.error) {
          throw new Error(params.error as string);
        }
        
        // Successful redirect
        router.replace('/');
      } catch (error) {
        console.error('Redirect error:', error);
        router.replace('/auth/login');
      }
    };

    handleRedirect();
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0891b2" />
      <Text style={styles.text}>Redirection en cours...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    gap: 16,
  },
  text: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#64748b',
  },
});