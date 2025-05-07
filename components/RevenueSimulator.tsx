import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Calendar, Clock, Users, DollarSign } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface SimulatorProps {
  onSimulate: (revenue: number) => void;
}

export function RevenueSimulator({ onSimulate }: SimulatorProps) {
  const [location, setLocation] = useState('');
  const [guestCapacity, setGuestCapacity] = useState<'1-5' | '5-10' | '10+'>(
    '1-5'
  );
  const [frequency, setFrequency] = useState<
    'occasional' | 'weekends' | 'regular'
  >('occasional');
  const [basePrice, setBasePrice] = useState('200');

  useEffect(() => {
    calculateRevenue();
  }, [guestCapacity, frequency, basePrice]);

  const calculateRevenue = () => {
    let monthlyBookings = 0;
    let priceMultiplier = 1;

    // Calculer le nombre de réservations mensuelles
    switch (frequency) {
      case 'occasional':
        monthlyBookings = 4; // 1 fois par semaine
        break;
      case 'weekends':
        monthlyBookings = 8; // 2 fois par semaine
        break;
      case 'regular':
        monthlyBookings = 20; // 5 fois par semaine
        break;
    }

    // Ajuster le prix en fonction de la capacité
    switch (guestCapacity) {
      case '1-5':
        priceMultiplier = 1;
        break;
      case '5-10':
        priceMultiplier = 1.5;
        break;
      case '10+':
        priceMultiplier = 2;
        break;
    }

    const price = parseInt(basePrice) || 0;
    const monthlyRevenue = Math.round(
      price * priceMultiplier * monthlyBookings
    );

    onSimulate(monthlyRevenue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simulez vos revenus</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vous habitez en</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Choisir votre région..."
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Combien de personnes souhaitez-vous accueillir ?
          </Text>
          <View style={styles.optionsGrid}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                guestCapacity === '1-5' && styles.optionButtonActive,
              ]}
              onPress={() => setGuestCapacity('1-5')}
            >
              <Text
                style={[
                  styles.optionText,
                  guestCapacity === '1-5' && styles.optionTextActive,
                ]}
              >
                1 à 5
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                guestCapacity === '5-10' && styles.optionButtonActive,
              ]}
              onPress={() => setGuestCapacity('5-10')}
            >
              <Text
                style={[
                  styles.optionText,
                  guestCapacity === '5-10' && styles.optionTextActive,
                ]}
              >
                5 à 10
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                guestCapacity === '10+' && styles.optionButtonActive,
              ]}
              onPress={() => setGuestCapacity('10+')}
            >
              <Text
                style={[
                  styles.optionText,
                  guestCapacity === '10+' && styles.optionTextActive,
                ]}
              >
                10+
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>À quel rythme souhaitez-vous louer ?</Text>
          <View style={styles.frequencyOptions}>
            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === 'occasional' && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency('occasional')}
            >
              <Calendar
                size={20}
                color={frequency === 'occasional' ? '#ffffff' : '#64748b'}
              />
              <Text
                style={[
                  styles.frequencyText,
                  frequency === 'occasional' && styles.frequencyTextActive,
                ]}
              >
                De temps en temps
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === 'weekends' && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency('weekends')}
            >
              <Clock
                size={20}
                color={frequency === 'weekends' ? '#ffffff' : '#64748b'}
              />
              <Text
                style={[
                  styles.frequencyText,
                  frequency === 'weekends' && styles.frequencyTextActive,
                ]}
              >
                Tous les week-ends
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.frequencyButton,
                frequency === 'regular' && styles.frequencyButtonActive,
              ]}
              onPress={() => setFrequency('regular')}
            >
              <Users
                size={20}
                color={frequency === 'regular' ? '#ffffff' : '#64748b'}
              />
              <Text
                style={[
                  styles.frequencyText,
                  frequency === 'regular' && styles.frequencyTextActive,
                ]}
              >
                En semaine et les week-ends
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prix par heure (MAD)</Text>
          <View style={styles.priceContainer}>
            <DollarSign size={20} color="#64748b" />
            <TextInput
              style={styles.priceInput}
              keyboardType="numeric"
              value={basePrice}
              onChangeText={setBasePrice}
              placeholder="200"
            />
            <Text style={styles.priceSuffix}>MAD/heure</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
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
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 24,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 12,
  },
  label: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#1e293b',
  },
  inputContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  input: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#1e293b',
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#059669',
  },
  optionText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#1e293b',
  },
  optionTextActive: {
    color: '#ffffff',
  },
  frequencyOptions: {
    gap: 12,
  },
  frequencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  frequencyButtonActive: {
    backgroundColor: '#059669',
  },
  frequencyText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#1e293b',
  },
  frequencyTextActive: {
    color: '#ffffff',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  priceInput: {
    flex: 1,
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#1e293b',
  },
  priceSuffix: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#64748b',
  },
});