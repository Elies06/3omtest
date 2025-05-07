//dans /home/project/app/(tabs)/host/pool-details.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { Waves, Umbrella, ShowerHead, Car, Wifi, ChevronFirst as FirstAid } from 'lucide-react-native';
import { router } from 'expo-router';
import { SplashScreen } from 'expo-router';
import { AmenityRow } from '/home/project/components/AmenityRow.tsx';

SplashScreen.preventAutoHideAsync();

type Amenity = {
  id: string;
  icon: any;
  label: string;
  value: boolean;
};

export default function PoolDetailsScreen() {
  const [fontsLoaded] = useFonts({
    'Montserrat-Bold': Montserrat_700Bold,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Regular': Montserrat_400Regular,
  });

  const [amenities, setAmenities] = useState<Amenity[]>([
    { id: 'heated', icon: Waves, label: 'Piscine chauffée', value: false },
    { id: 'sunbeds', icon: Umbrella, label: 'Transats', value: false },
    { id: 'shower', icon: ShowerHead, label: 'Douche extérieure', value: false },
    { id: 'parking', icon: Car, label: 'Parking', value: false },
    { id: 'wifi', icon: Wifi, label: 'Wifi', value: false },
    { id: 'firstaid', icon: FirstAid, label: 'Kit premiers secours', value: false },
  ]);

  if (!fontsLoaded) {
    return null;
  }

  const toggleAmenity = (id: string) => {
    setAmenities(amenities.map(amenity => 
      amenity.id === id ? { ...amenity, value: !amenity.value } : amenity
    ));
  };

  const handleSubmit = () => {
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Équipements et Services</Text>
      <Text style={styles.subtitle}>
        Sélectionnez les équipements disponibles pour vos baigneurs
      </Text>

      <View style={styles.amenitiesContainer}>
        {amenities.map(amenity => (
          <AmenityRow
            key={amenity.id}
            icon={amenity.icon}
            label={amenity.label}
            value={amenity.value}
            onToggle={() => toggleAmenity(amenity.id)}
          />
        ))}
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.sectionTitle}>Tarification</Text>
        <Text style={styles.priceInfo}>
          Prix suggéré : 200-350 MAD/heure{'\n'}
          Basé sur les piscines similaires dans votre région
        </Text>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Publier mon annonce</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  amenitiesContainer: {
    gap: 16,
    marginBottom: 32,
  },
  priceSection: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 8,
  },
  priceInfo: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  submitButton: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
});