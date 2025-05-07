import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import { Video as LucideIcon } from 'lucide-react-native';

type AmenityRowProps = {
  icon: LucideIcon;
  label: string;
  value: boolean;
  onToggle: () => void;
};

export function AmenityRow({ icon: Icon, label, value, onToggle }: AmenityRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Icon size={24} color="#059669" />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#e2e8f0', true: '#059669' }}
        thumbColor={Platform.OS === 'ios' ? '#ffffff' : value ? '#ffffff' : '#f4f4f5'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#1e293b',
  },
});