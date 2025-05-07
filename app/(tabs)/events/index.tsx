import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { PartyPopper, Users, Cake, Gift, Baby } from 'lucide-react-native';
import { router } from 'expo-router';
import { SplashScreen } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

const EVENTS = [
  {
    id: 'pool-party',
    title: 'Pool Party',
    description: 'Fêtez en grand avec vos amis',
    icon: PartyPopper,
    image: 'https://images.unsplash.com/photo-1526758097130-bab247274f58?w=800',
    color: '#0891b2'
  },
  {
    id: 'team-building',
    title: 'Team Building',
    description: 'Renforcez la cohésion d\'équipe',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
    color: '#059669'
  },
  {
    id: 'evjf-evg',
    title: 'EVJF / EVG',
    description: 'Un moment inoubliable entre amis',
    icon: Gift,
    image: 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?w=800',
    color: '#8b5cf6'
  },
  {
    id: 'anniversaire',
    title: 'Anniversaire',
    description: 'Célébrez votre journée spéciale',
    icon: Cake,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
    color: '#ec4899'
  },
  {
    id: 'baby-shower',
    title: 'Baby Shower',
    description: 'Un cadre paisible pour votre événement',
    icon: Baby,
    image: 'https://images.unsplash.com/photo-1623718649591-311775a30c43?w=800',
    color: '#3b82f6'
  }
];

export default function EventsScreen() {
  const [fontsLoaded] = useFonts({
    'Montserrat-Bold': Montserrat_700Bold,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Regular': Montserrat_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleEventPress = (eventId: string) => {
    router.push(`/search?event=${eventId}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Un événement à fêter ?</Text>
        <Text style={styles.subtitle}>À chaque occasion sa piscine idéale</Text>
      </View>

      <View style={styles.content}>
        {EVENTS.map((event, index) => (
          <Animated.View
            key={event.id}
            entering={FadeInDown.delay(index * 100).springify()}
          >
            <TouchableOpacity
              style={styles.eventCard}
              onPress={() => handleEventPress(event.id)}
            >
              <Image
                source={{ uri: event.image }}
                style={styles.eventImage}
              />
              <View style={styles.overlay} />
              
              <View style={styles.eventContent}>
                <View style={[styles.iconContainer, { backgroundColor: event.color }]}>
                  <event.icon size={24} color="#ffffff" />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Toutes les excuses sont bonnes pour piquer une tête.
        </Text>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => router.push('/search')}
        >
          <Text style={styles.footerButtonText}>Une piscine pour le plaisir</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 60,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 32,
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  eventCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      default: {
        boxShadow: '#000',
        boxShadow: { width: 0, height: 2 },
        boxShadow: 0.1,
        boxShadow: 8,
        elevation: 3,
      },
    }),
  },
  eventImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  eventContent: {
    flex: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 4,
  },
  eventDescription: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  footerText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  footerButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  footerButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});