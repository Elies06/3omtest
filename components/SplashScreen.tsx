import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { School as Pool } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence,
  withDelay,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';

export default function SplashScreen() {
  const [fontsLoaded] = useFonts({
    'Montserrat-Bold': Montserrat_700Bold,
    'Montserrat-Regular': Montserrat_400Regular,
  });

  const rippleStyle1 = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withSpring(1.5),
            withSpring(2)
          ),
          -1,
          true
        ),
      },
    ],
    opacity: withRepeat(
      withSequence(
        withSpring(0.8),
        withSpring(0)
      ),
      -1,
      true
    ),
  }));

  const rippleStyle2 = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withDelay(
            400,
            withSequence(
              withSpring(1.5),
              withSpring(2)
            )
          ),
          -1,
          true
        ),
      },
    ],
    opacity: withRepeat(
      withDelay(
        400,
        withSequence(
          withSpring(0.8),
          withSpring(0)
        )
      ),
      -1,
      true
    ),
  }));

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeIn}
        exiting={FadeOut}
        style={styles.content}
      >
        <View style={styles.logoContainer}>
          <Animated.View style={[styles.ripple, rippleStyle1]} />
          <Animated.View style={[styles.ripple, rippleStyle2]} />
          <Pool size={64} color="#0891b2" />
        </View>
        <Text style={styles.title}>3ommy</Text>
        <Text style={styles.subtitle}>Un plongeon pour tous</Text>
      </Animated.View>
    </View>
  );
}

const { width } = Dimensions.get('window');
const rippleSize = width * 0.4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  ripple: {
    position: 'absolute',
    width: rippleSize,
    height: rippleSize,
    borderRadius: rippleSize / 2,
    borderWidth: 4,
    borderColor: '#0891b2',
  },
  title: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 48,
    color: '#0891b2',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 18,
    color: '#64748b',
  },
});