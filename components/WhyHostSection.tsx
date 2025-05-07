///home/project/components/WhyHostSection.tsx
import { View, Text, StyleSheet, Platform } from 'react-native';
import { DollarSign, Shield, Users } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const BENEFITS = [
  {
    icon: DollarSign,
    title: 'Revenus complémentaires',
    description: 'Rentabilisez votre piscine et générez des revenus supplémentaires toute l\'année.',
  },
  {
    icon: Shield,
    title: 'Sécurité garantie',
    description: 'Assurance complète incluse avec chaque réservation. Votre tranquillité est notre priorité.',
  },
  {
    icon: Users,
    title: 'Communauté de confiance',
    description: 'Des baigneurs vérifiés et respectueux. Vous gardez le contrôle total sur vos réservations.',
  },
];

export function WhyHostSection() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pourquoi devenir hôte ?</Text>
      
      <View style={styles.benefitsGrid}>
        {BENEFITS.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <Animated.View 
              key={index}
              style={styles.benefitCard}
              entering={FadeIn.delay(index * 200)}
            >
              <View style={styles.iconContainer}>
                <Icon size={32} color="#059669" />
              </View>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitDescription}>
                {benefit.description}
              </Text>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>15K+</Text>
          <Text style={styles.statLabel}>Hôtes actifs</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>50K+</Text>
          <Text style={styles.statLabel}>Réservations</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4.8/5</Text>
          <Text style={styles.statLabel}>Note moyenne</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 32,
    color: '#1e293b',
    marginBottom: 32,
    textAlign: 'center',
  },
  benefitsGrid: {
    gap: 24,
    marginBottom: 48,
  },
  benefitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  benefitDescription: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: '#059669',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#64748b',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
});