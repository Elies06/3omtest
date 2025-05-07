// // // // import { useState, useEffect } from 'react';
// // // // import { View, Text, StyleSheet, Platform, TouchableOpacity, Image, ScrollView } from 'react-native';
// // // // import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// // // // import { School, Users, MapPin, Shield, LogIn, CircleAlert as AlertCircle } from 'lucide-react-native';
// // // // import { router } from 'expo-router';
// // // // import { SplashScreen } from 'expo-router';
// // // // import { useAuth } from '@/hooks/useAuth';
// // // // import { supabase } from '@/lib/supabase';

// // // // SplashScreen.preventAutoHideAsync();

// // // // type VerificationStatus = {
// // // //   level: number;
// // // //   status: 'pending' | 'approved' | 'rejected';
// // // // };

// // // // export default function HomeScreen() {
// // // //   const { user } = useAuth();
// // // //   const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
// // // //   const [fontsLoaded] = useFonts({
// // // //     'Montserrat-Bold': Montserrat_700Bold,
// // // //     'Montserrat-SemiBold': Montserrat_600SemiBold,
// // // //     'Montserrat-Regular': Montserrat_400Regular,
// // // //   });

// // // //   useEffect(() => {
// // // //     if (user) {
// // // //       loadVerificationStatus();
// // // //     }
// // // //   }, [user]);

// // // //   const loadVerificationStatus = async () => {
// // // //     try {
// // // //       const { data, error } = await supabase
// // // //         .from('identity_verifications')
// // // //         .select('*')
// // // //         .eq('user_id', user?.id)
// // // //         .order('verification_level', { ascending: false })
// // // //         .limit(1)
// // // //         .single();

// // // //       if (error && error.code !== 'PGRST116') throw error;
// // // //       setVerificationStatus(data || null);
// // // //     } catch (err) {
// // // //       console.error('Error loading verification status:', err);
// // // //     }
// // // //   };

// // // //   if (!fontsLoaded) {
// // // //     return null;
// // // //   }

// // // //   return (
// // // //     <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
// // // //       <View style={styles.header}>
// // // //         <View> <Text style={styles.logo}>3ommy</Text>
// // // //           <Text style={styles.slogan}>Un plongeon pour tous</Text>
// // // //         </View>
// // // //         {!user ? (
// // // //           <TouchableOpacity 
// // // //             style={styles.loginButton}
// // // //             onPress={() => router.push('/auth/login')}
// // // //           >
// // // //             <LogIn size={20} color="#0891b2" />
// // // //             <Text style={styles.loginButtonText}>Connexion</Text>
// // // //           </TouchableOpacity>
// // // //         ) : (
// // // //           <View>
// // // //             <TouchableOpacity 
// // // //               style={styles.profileButton}
// // // //               onPress={() => router.push('/profile')}
// // // //             >
// // // //               <Image 
// // // //                 source={{ 
// // // //                   uri: user.user_metadata?.avatar_url ||
// // // //                   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'
// // // //                 }}
// // // //                 style={styles.profileAvatar}
// // // //               />
// // // //             </TouchableOpacity>
// // // //             {(!verificationStatus?.status || verificationStatus.status !== 'approved') && (
// // // //               <TouchableOpacity 
// // // //                 style={styles.verificationBadge}
// // // //                 onPress={() => router.push('/profile/verify')}
// // // //               >
// // // //                 <AlertCircle size={16} color="#ffffff" />
// // // //               </TouchableOpacity>
// // // //             )}
// // // //           </View>
// // // //         )}
// // // //       </View>

// // // //       <View style={styles.heroSection}>
// // // //         <Image
// // // //           source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }}
// // // //           style={styles.heroImage}
// // // //           resizeMode="cover"
// // // //         />
// // // //         <View style={styles.overlay} />
// // // //         <View style={styles.heroContent}>
// // // //           <Text style={styles.heroTitle}>Bienvenue sur 3ommy</Text>
// // // //           <Text style={styles.heroSubtitle}>
// // // //             La première plateforme de location de piscines au Maroc
// // // //           </Text>
// // // //         </View>
// // // //       </View>

// // // //       {user && !verificationStatus?.status && (
// // // //         <TouchableOpacity 
// // // //           style={styles.verificationCard}
// // // //           onPress={() => router.push('/profile/verify')}
// // // //         >
// // // //           <View style={styles.verificationContent}>
// // // //             <AlertCircle size={24} color="#dc2626" />
// // // //             <View style={styles.verificationTextContainer}>
// // // //               <Text style={styles.verificationTitle}>Vérifiez votre identité</Text>
// // // //               <Text style={styles.verificationText}>
// // // //                 La vérification est requise pour réserver ou louer une piscine
// // // //               </Text>
// // // //             </View>
// // // //           </View>
// // // //         </TouchableOpacity>
// // // //       )}

// // // //       <View style={styles.optionsContainer}>
// // // //         <TouchableOpacity 
// // // //           style={styles.optionCard}
// // // //           onPress={() => router.push('/search')}
// // // //         >
// // // //           <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}>
// // // //             <Users size={32} color="#ffffff" />
// // // //           </View>
// // // //           <Text style={styles.optionTitle}>Je veux me baigner</Text>
// // // //           <Text style={styles.optionDescription}>
// // // //             Trouvez la piscine parfaite pour votre journée détente
// // // //           </Text>
// // // //           <View style={styles.features}>
// // // //             <View style={styles.featureRow}>
// // // //               <MapPin size={16} color="#64748b" />
// // // //               <Text style={styles.feature}>Recherche par localisation</Text>
// // // //             </View>
// // // //             <View style={styles.featureRow}>
// // // //               <Shield size={16} color="#64748b" />
// // // //               <Text style={styles.feature}>Piscines vérifiées</Text>
// // // //             </View>
// // // //           </View>
// // // //         </TouchableOpacity>

// // // //         <TouchableOpacity 
// // // //           style={[styles.optionCard, styles.hostCard]}
// // // //           onPress={() => router.push('/auth/login')}
// // // //         >
// // // //           <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}>
// // // //             <School size={32} color="#ffffff" />
// // // //           </View>
// // // //           <Text style={styles.optionTitle}>Je mets ma piscine à louer</Text>
// // // //           <Text style={styles.optionDescription}>
// // // //             Rentabilisez votre piscine en toute sécurité
// // // //           </Text>
// // // //           <View style={styles.features}>
// // // //             <View style={styles.featureRow}>
// // // //               <MapPin size={16} color="#64748b" />
// // // //               <Text style={styles.feature}>Gestion simplifiée</Text>
// // // //             </View>
// // // //             <View style={styles.featureRow}>
// // // //               <Shield size={16} color="#64748b" />
// // // //               <Text style={styles.feature}>Assurance incluse</Text>
// // // //             </View>
// // // //           </View>
// // // //         </TouchableOpacity>
// // // //       </View>
// // // //     </ScrollView>
// // // //   );
// // // // }

// // // // const styles = StyleSheet.create({
// // // //   container: {
// // // //     flex: 1,
// // // //     backgroundColor: '#ffffff',
// // // //   },
// // // //   contentContainer: {
// // // //     flexGrow: 1,
// // // //   },
// // // //   header: {
// // // //     padding: 20,
// // // //     paddingTop: Platform.OS === 'web' ? 20 : 60,
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     alignItems: 'center',
// // // //   },
// // // //   logo: {
// // // //     fontFamily: 'Montserrat-Bold',
// // // //     fontSize: 36,
// // // //     color: '#0891b2',
// // // //   },
// // // //   slogan: {
// // // //     fontFamily: 'Montserrat-Regular',
// // // //     fontSize: 18,
// // // //     color: '#64748b',
// // // //     marginTop: 4,
// // // //   },
// // // //   loginButton: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     gap: 8,
// // // //     padding: 12,
// // // //     borderRadius: 12,
// // // //     backgroundColor: '#f0f9ff',
// // // //   },
// // // //   loginButtonText: {
// // // //     fontFamily: 'Montserrat-SemiBold',
// // // //     fontSize: 14,
// // // //     color: '#0891b2',
// // // //   },
// // // //   profileButton: {
// // // //     width: 40,
// // // //     height: 40,
// // // //     borderRadius: 20,
// // // //     overflow: 'hidden',
// // // //     backgroundColor: '#f0f9ff',
// // // //   },
// // // //   profileAvatar: {
// // // //     width: '100%',
// // // //     height: '100%',
// // // //   },
// // // //   verificationBadge: {
// // // //     position: 'absolute',
// // // //     bottom: -4,
// // // //     right: -4,
// // // //     width: 20,
// // // //     height: 20,
// // // //     borderRadius: 10,
// // // //     backgroundColor: '#dc2626',
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     borderWidth: 2,
// // // //     borderColor: '#ffffff',
// // // //   },
// // // //   heroSection: {
// // // //     height: 240,
// // // //     position: 'relative',
// // // //     marginBottom: 32,
// // // //   },
// // // //   heroImage: {
// // // //     width: '100%',
// // // //     height: '100%',
// // // //   },
// // // //   overlay: {
// // // //     ...StyleSheet.absoluteFillObject,
// // // //     backgroundColor: 'rgba(0, 0, 0, 0.3)',
// // // //   },
// // // //   heroContent: {
// // // //     position: 'absolute',
// // // //     bottom: 0,
// // // //     left: 0,
// // // //     right: 0,
// // // //     padding: 20,
// // // //   },
// // // //   heroTitle: {
// // // //     fontFamily: 'Montserrat-Bold',
// // // //     fontSize: 28,
// // // //     color: '#ffffff',
// // // //     marginBottom: 8,
// // // //   },
// // // //   heroSubtitle: {
// // // //     fontFamily: 'Montserrat-Regular',
// // // //     fontSize: 16,
// // // //     color: '#ffffff',
// // // //     opacity: 0.9,
// // // //   },
// // // //   verificationCard: {
// // // //     backgroundColor: '#fef2f2',
// // // //     margin: 20,
// // // //     marginTop: 0,
// // // //     padding: 16,
// // // //     borderRadius: 12,
// // // //     borderWidth: 1,
// // // //     borderColor: '#fecaca',
// // // //   },
// // // //   verificationContent: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     gap: 12,
// // // //   },
// // // //   verificationTextContainer: {
// // // //     flex: 1,
// // // //   },
// // // //   verificationTitle: {
// // // //     fontFamily: 'Montserrat-Bold',
// // // //     fontSize: 16,
// // // //     color: '#991b1b',
// // // //     marginBottom: 4,
// // // //   },
// // // //   verificationText: {
// // // //     fontFamily: 'Montserrat-Regular',
// // // //     fontSize: 14,
// // // //     color: '#991b1b',
// // // //   },
// // // //   optionsContainer: {
// // // //     padding: 20,
// // // //     gap: 20,
// // // //   },
// // // //   optionCard: {
// // // //     backgroundColor: '#ffffff',
// // // //     borderRadius: 16,
// // // //     padding: 24,
// // // //     ...Platform.select({
// // // //       web: {
// // // //         boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
// // // //       },
// // // //       default: {
// // // //         boxShadow: '#000',
// // // //         boxShadow: { width: 0, height: 2 },
// // // //         boxShadow: 0.1,
// // // //         boxShadow: 8,
// // // //         elevation: 3,
// // // //       },
// // // //     }),
// // // //   },
// // // //   hostCard: {
// // // //     borderWidth: 2,
// // // //     borderColor: '#059669',
// // // //   },
// // // //   iconCircle: {
// // // //     width: 64,
// // // //     height: 64,
// // // //     borderRadius: 32,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     marginBottom: 16,
// // // //   },
// // // //   optionTitle: {
// // // //     fontFamily: 'Montserrat-Bold',
// // // //     fontSize: 20,
// // // //     color: '#1e293b',
// // // //     marginBottom: 8,
// // // //   },
// // // //   optionDescription: {
// // // //     fontFamily: 'Montserrat-Regular',
// // // //     fontSize: 16,
// // // //     color: '#64748b',
// // // //     marginBottom: 16,
// // // //   },
// // // //   features: {
// // // //     gap: 12,
// // // //   },
// // // //   featureRow: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     gap: 8,
// // // //   },
// // // //   feature: {
// // // //     fontFamily: 'Montserrat-Regular',
// // // //     fontSize: 14,
// // // //     color: '#64748b',
// // // //   },
// // // // });


// // // // import { useState, useEffect } from 'react';
// // // // import { View, Text, StyleSheet, Platform, TouchableOpacity, Image, ScrollView } from 'react-native';
// // // // import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// // // // import { School, Users, MapPin, Shield, LogIn, CircleAlert as AlertCircle } from 'lucide-react-native';
// // // // import { router } from 'expo-router';
// // // // import { SplashScreen } from 'expo-router';
// // // // import { useAuth } from '@/hooks/useAuth';
// // // // import { supabase } from '@/lib/supabase';

// // // // SplashScreen.preventAutoHideAsync();

// // // // export default function HomeScreen() {
// // // //   const { user, verificationStatus } = useAuth();
// // // //   const [fontsLoaded] = useFonts({
// // // //     'Montserrat-Bold': Montserrat_700Bold,
// // // //     'Montserrat-SemiBold': Montserrat_600SemiBold,
// // // //     'Montserrat-Regular': Montserrat_400Regular,
// // // //   });

// // // //   if (!fontsLoaded) {
// // // //     return null;
// // // //   }

// // // //   return (
// // // //     <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
// // // //       <View style={styles.header}>
// // // //         <View> <Text style={styles.logo}>3ommy</Text>
// // // //           <Text style={styles.slogan}>Un plongeon pour tous</Text>
// // // //         </View>
// // // //         {!user ? (
// // // //           <TouchableOpacity 
// // // //             style={styles.loginButton}
// // // //             onPress={() => router.push('/auth/login')}
// // // //           >
// // // //             <LogIn size={20} color="#0891b2" />
// // // //             <Text style={styles.loginButtonText}>Connexion</Text>
// // // //           </TouchableOpacity>
// // // //         ) : (
// // // //           <View>
// // // //             <TouchableOpacity 
// // // //               style={styles.profileButton}
// // // //               onPress={() => router.push('/profile')}
// // // //             >
// // // //               <Image 
// // // //                 source={{ 
// // // //                   uri: user.user_metadata?.avatar_url ||
// // // //                   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'
// // // //                 }}
// // // //                 style={styles.profileAvatar}
// // // //               />
// // // //             </TouchableOpacity>
// // // //             {(!verificationStatus?.status || verificationStatus.status !== 'approved') && (
// // // //               <TouchableOpacity 
// // // //                 style={styles.verificationBadge}
// // // //                 onPress={() => router.push('/profile/verify')}
// // // //               >
// // // //                 <AlertCircle size={16} color="#ffffff" />
// // // //               </TouchableOpacity>
// // // //             )}
// // // //           </View>
// // // //         )}
// // // //       </View>

// // // //       <View style={styles.heroSection}>
// // // //         <Image
// // // //           source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }}
// // // //           style={styles.heroImage}
// // // //           resizeMode="cover"
// // // //         />
// // // //         <View style={styles.overlay} />
// // // //         <View style={styles.heroContent}>
// // // //           <Text style={styles.heroTitle}>Bienvenue sur 3ommy</Text>
// // // //           <Text style={styles.heroSubtitle}>
// // // //             La première plateforme de location de piscines au Maroc
// // // //           </Text>
// // // //         </View>
// // // //       </View>

// // // //       {user && !verificationStatus?.status && (
// // // //         <TouchableOpacity 
// // // //           style={styles.verificationCard}
// // // //           onPress={() => router.push('/profile/verify')}
// // // //         >
// // // //           <View style={styles.verificationContent}>
// // // //             <AlertCircle size={24} color="#dc2626" />
// // // //             <View style={styles.verificationTextContainer}>
// // // //               <Text style={styles.verificationTitle}>Vérifiez votre identité</Text>
// // // //               <Text style={styles.verificationText}>
// // // //                 La vérification est requise pour réserver ou louer une piscine
// // // //               </Text>
// // // //             </View>
// // // //           </View>
// // // //         </TouchableOpacity>
// // // //       )}

// // // //       <View style={styles.optionsContainer}>
// // // //         <TouchableOpacity 
// // // //           style={styles.optionCard}
// // // //           onPress={() => router.push('/search')}
// // // //         >
// // // //           <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}>
// // // //             <Users size={32} color="#ffffff" />
// // // //           </View>
// // // //           <Text style={styles.optionTitle}>Je veux me baigner</Text>
// // // //           <Text style={styles.optionDescription}>
// // // //             Trouvez la piscine parfaite pour votre journée détente
// // // //           </Text>
// // // //           <View style={styles.features}>
// // // //             <View style={styles.featureRow}>
// // // //               <MapPin size={16} color="#64748b" />
// // // //               <Text style={styles.feature}>Recherche par localisation</Text>
// // // //             </View>
// // // //             <View style={styles.featureRow}>
// // // //               <Shield size={16} color="#64748b" />
// // // //               <Text style={styles.feature}>Piscines vérifiées</Text>
// // // //             </View>
// // // //           </View>
// // // //         </TouchableOpacity>

// // // //         <TouchableOpacity 
// // // //           style={[styles.optionCard, styles.hostCard]}
// // // //           onPress={() => router.push('/auth/login')}
// // // //         >
// // // //           <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}>
// // // //             <School size={32} color="#ffffff" />
// // // //           </View>
// // // //           <Text style={styles.optionTitle}>Je mets ma piscine à louer</Text>
// // // //           <Text style={styles.optionDescription}>
// // // //             Rentabilisez votre piscine en toute sécurité
// // // //           </Text>
// // // //           <View style={styles.features}>
// // // //             <View style={styles.featureRow}>
// // // //               <MapPin size={16} color="#64748b" />
// // // //               <Text style={styles.feature}>Gestion simplifiée</Text>
// // // //             </View>
// // // //             <View style={styles.featureRow}>
// // // //               <Shield size={16} color="#64748b" />
// // // //               <Text style={styles.feature}>Assurance incluse</Text>
// // // //             </View>
// // // //           </View>
// // // //         </TouchableOpacity>
// // // //       </View>
// // // //     </ScrollView>
// // // //   );
// // // // }

// // // // const styles = StyleSheet.create({
// // // //   container: {
// // // //     flex: 1,
// // // //     backgroundColor: '#ffffff',
// // // //   },
// // // //   contentContainer: {
// // // //     flexGrow: 1,
// // // //   },
// // // //   header: {
// // // //     padding: 20,
// // // //     paddingTop: Platform.OS === 'web' ? 20 : 60,
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     alignItems: 'center',
// // // //   },
// // // //   logo: {
// // // //     fontFamily: 'Montserrat-Bold',
// // // //     fontSize: 36,
// // // //     color: '#0891b2',
// // // //   },
// // // //   slogan: {
// // // //     fontFamily: 'Montserrat-Regular',
// // // //     fontSize: 18,
// // // //     color: '#64748b',
// // // //     marginTop: 4,
// // // //   },
// // // //   loginButton: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     gap: 8,
// // // //     padding: 12,
// // // //     borderRadius: 12,
// // // //     backgroundColor: '#f0f9ff',
// // // //   },
// // // //   loginButtonText: {
// // // //     fontFamily: 'Montserrat-SemiBold',
// // // //     fontSize: 14,
// // // //     color: '#0891b2',
// // // //   },
// // // //   profileButton: {
// // // //     width: 40,
// // // //     height: 40,
// // // //     borderRadius: 20,
// // // //     overflow: 'hidden',
// // // //     backgroundColor: '#f0f9ff',
// // // //   },
// // // //   profileAvatar: {
// // // //     width: '100%',
// // // //     height: '100%',
// // // //   },
// // // //   verificationBadge: {
// // // //     position: 'absolute',
// // // //     bottom: -4,
// // // //     right: -4,
// // // //     width: 20,
// // // //     height: 20,
// // // //     borderRadius: 10,
// // // //     backgroundColor: '#dc2626',
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     borderWidth: 2,
// // // //     borderColor: '#ffffff',
// // // //   },
// // // //   heroSection: {
// // // //     height: 240,
// // // //     position: 'relative',
// // // //     marginBottom: 32,
// // // //   },
// // // //   heroImage: {
// // // //     width: '100%',
// // // //     height: '100%',
// // // //   },
// // // //   overlay: {
// // // //     ...StyleSheet.absoluteFillObject,
// // // //     backgroundColor: 'rgba(0, 0, 0, 0.3)',
// // // //   },
// // // //   heroContent: {
// // // //     position: 'absolute',
// // // //     bottom: 0,
// // // //     left: 0,
// // // //     right: 0,
// // // //     padding: 20,
// // // //   },
// // // //   heroTitle: {
// // // //     fontFamily: 'Montserrat-Bold',
// // // //     fontSize: 28,
// // // //     color: '#ffffff',
// // // //     marginBottom: 8,
// // // //   },
// // // //   heroSubtitle: {
// // // //     fontFamily: 'Montserrat-Regular',
// // // //     fontSize: 16,
// // // //     color: '#ffffff',
// // // //     opacity: 0.9,
// // // //   },
// // // //   verificationCard: {
// // // //     backgroundColor: '#fef2f2',
// // // //     margin: 20,
// // // //     marginTop: 0,
// // // //     padding: 16,
// // // //     borderRadius: 12,
// // // //     borderWidth: 1,
// // // //     borderColor: '#fecaca',
// // // //   },
// // // //   verificationContent: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     gap: 12,
// // // //   },
// // // //   verificationTextContainer: {
// // // //     flex: 1,
// // // //   },
// // // //   verificationTitle: {
// // // //     fontFamily: 'Montserrat-Bold',
// // // //     fontSize: 16,
// // // //     color: '#991b1b',
// // // //     marginBottom: 4,
// // // //   },
// // // //   verificationText: {
// // // //     fontFamily: 'Montserrat-Regular',
// // // //     fontSize: 14,
// // // //     color: '#991b1b',
// // // //   },
// // // //   optionsContainer: {
// // // //     padding: 20,
// // // //     gap: 20,
// // // //   },
// // // //   optionCard: {
// // // //     backgroundColor: '#ffffff',
// // // //     borderRadius: 16,
// // // //     padding: 24,
// // // //     ...Platform.select({
// // // //       web: {
// // // //         boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
// // // //       },
// // // //       default: {
// // // //         boxShadow: '#000',
// // // //         boxShadow: { width: 0, height: 2 },
// // // //         boxShadow: 0.1,
// // // //         boxShadow: 8,
// // // //         elevation: 3,
// // // //       },
// // // //     }),
// // // //   },
// // // //   hostCard: {
// // // //     borderWidth: 2,
// // // //     borderColor: '#059669',
// // // //   },
// // // //   iconCircle: {
// // // //     width: 64,
// // // //     height: 64,
// // // //     borderRadius: 32,
// // // //     justifyContent: 'center',
// // // //     alignItems: 'center',
// // // //     marginBottom: 16,
// // // //   },
// // // //   optionTitle: {
// // // //     fontFamily: 'Montserrat-Bold',
// // // //     fontSize: 20,
// // // //     color: '#1e293b',
// // // //     marginBottom: 8,
// // // //   },
// // // //   optionDescription: {
// // // //     fontFamily: 'Montserrat-Regular',
// // // //     fontSize: 16,
// // // //     color: '#64748b',
// // // //     marginBottom: 16,
// // // //   },
// // // //   features: {
// // // //     gap: 12,
// // // //   },
// // // //   featureRow: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     gap: 8,
// // // //   },
// // // //   feature: {
// // // //     fontFamily: 'Montserrat-Regular',
// // // //     fontSize: 14,
// // // //     color: '#64748b',
// // // //   },
// // // // });





// // // // Dans app/(tabs)/index.tsx
// // // // VERSION CORRIGÉE : Intégration des notifications (réservations, messages) dans la page existante

// // // import React, { useState, useEffect, useCallback } from 'react';
// // // import {
// // //     View, Text, StyleSheet, Platform, TouchableOpacity, Image, ScrollView,
// // //     ActivityIndicator, RefreshControl, SafeAreaView // SafeAreaView ajoutée pour la cohérence
// // // } from 'react-native';
// // // import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// // // import {
// // //     School, Users, MapPin, Shield, LogIn, CircleAlert as AlertCircleLucide, // Renommé pour éviter conflit Alert
// // //     BellRing, MessageCircle, Clock, CheckCircle, UserCheck, ChevronRight // Ajout des icônes de notif
// // // } from 'lucide-react-native';
// // // import { router, SplashScreen } from 'expo-router'; // SplashScreen importé
// // // import { useAuth } from '@/hooks/useAuth'; // Assurez-vous que useAuth fournit bien verificationStatus détaillé
// // // import { supabase } from '@/lib/supabase';

// // // // SplashScreen.preventAutoHideAsync(); // Décommentez si vous gérez le SplashScreen ici ou dans _layout

// // // // Interface pour les données de notification (simplifiée)
// // // interface NotificationData {
// // //     // kycStatus n'est plus nécessaire ici, on utilise verificationStatus de useAuth
// // //     pendingBookingsCount: number;
// // //     activeConversationsCount: number;
// // // }

// // // export default function HomeScreen() {
// // //     // Utilisation du hook useAuth (vérifiez que verificationStatus est bien fourni)
// // //     const { user, verificationStatus, isVerified, isLoading: isLoadingAuth, sessionInitialized } = useAuth();
// // //     const [refreshing, setRefreshing] = useState(false);

// // //     // États pour les notifications
// // //     const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
// // //     const [loadingNotifications, setLoadingNotifications] = useState(false); // Commence à false, activé par fetch
// // //     const [notificationError, setNotificationError] = useState<string | null>(null);

// // //     // Charger les polices
// // //     const [fontsLoaded, fontError] = useFonts({
// // //         'Montserrat-Bold': Montserrat_700Bold,
// // //         'Montserrat-SemiBold': Montserrat_600SemiBold,
// // //         'Montserrat-Regular': Montserrat_400Regular,
// // //     });

// // //     // --- Fonction pour charger les données des notifications (SANS KYC) ---
// // //     const fetchNotificationsData = useCallback(async () => {
// // //         if (!user) return; // Ne rien faire si pas d'utilisateur

// // //         setLoadingNotifications(true);
// // //         setNotificationError(null);
// // //         console.log("🚀 Fetching notification data for swimmer:", user.id);

// // //         try {
// // //             // Fetch bookings et conversations en parallèle
// // //             const [bookingsResult, conversationsResult] = await Promise.all([
// // //                 // 1. Compter les réservations en attente du nageur
// // //                 supabase
// // //                     .from('bookings')
// // //                     .select('id', { count: 'exact', head: true })
// // //                     .eq('user_id', user.id)
// // //                     .eq('status', 'pending'),

// // //                 // 2. Compter les conversations actives où l'utilisateur est nageur
// // //                 supabase
// // //                     .from('conversations')
// // //                     .select('id', { count: 'exact', head: true })
// // //                     .eq('swimmer_id', user.id)
// // //                     .eq('status', 'open') // Statut 'open' pour conversations actives
// // //             ]);

// // //             // Traiter les résultats
// // //             let pendingBookingsCount = 0;
// // //             if (bookingsResult.error) { console.warn("Error fetching pending bookings count:", bookingsResult.error.message); }
// // //             else { pendingBookingsCount = bookingsResult.count ?? 0; }

// // //             let activeConversationsCount = 0;
// // //             if (conversationsResult.error) { console.warn("Error fetching active conversations count:", conversationsResult.error.message); }
// // //             else { activeConversationsCount = conversationsResult.count ?? 0; }

// // //             const data: NotificationData = {
// // //                 // kycStatus n'est plus inclus ici
// // //                 pendingBookingsCount,
// // //                 activeConversationsCount
// // //             };
// // //             console.log("✅ Notification data fetched:", data);
// // //             setNotificationData(data);

// // //         } catch (err: any) {
// // //             console.error("Error fetching notification data:", err);
// // //             setNotificationError("Erreur de chargement des notifications.");
// // //             setNotificationData(null);
// // //         } finally {
// // //             setLoadingNotifications(false);
// // //         }
// // //     }, [user]); // Dépend de user

// // //     // --- Effet pour cacher SplashScreen et charger les notifications ---
// // //     useEffect(() => {
// // //         // Cacher SplashScreen quand fonts et session sont prêts
// // //         if ((fontsLoaded || fontError) && sessionInitialized) {
// // //              console.log("[HomeScreen] Fonts/Session ready, hiding SplashScreen.");
// // //              SplashScreen.hideAsync();
// // //         }

// // //         // Charger les notifications quand user et fonts sont prêts
// // //         if (user && fontsLoaded && !fontError) {
// // //             console.log("[HomeScreen] User and fonts loaded, fetching notifications.");
// // //             fetchNotificationsData();
// // //         } else if (sessionInitialized && !user) {
// // //             // Si session initialisée mais pas d'utilisateur, reset notifs
// // //              setNotificationData(null);
// // //              setLoadingNotifications(false);
// // //         }
// // //     }, [fontsLoaded, fontError, sessionInitialized, user, fetchNotificationsData]); // Dépendances

// // //     // --- Refresh manuel ---
// // //     const onRefresh = useCallback(async () => {
// // //         setRefreshing(true);
// // //         await fetchNotificationsData(); // Recharger seulement les notifications ici
// // //         // Ajoutez d'autres fetch si nécessaire pour le reste de la page
// // //         setRefreshing(false);
// // //     }, [fetchNotificationsData]);

// // //     // --- Composant pour afficher les notifications ---
// // //     const renderNotificationBanner = () => {
// // //         // Ne rien afficher si pas d'utilisateur ou pendant le chargement initial de l'auth/fonts
// // //         if (!user || isLoadingAuth || !fontsLoaded) return null;

// // //         // Afficher un loader spécifique pour les notifs si elles chargent
// // //         if (loadingNotifications && !refreshing) { // Ne pas montrer si c'est un refresh manuel
// // //             return <ActivityIndicator style={styles.notificationContainerLoading} />;
// // //         }
// // //         // Afficher l'erreur de notif
// // //         if (notificationError) {
// // //             return (
// // //                 <View style={[styles.notificationContainer, styles.errorBanner]}>
// // //                     <AlertCircleLucide size={18} color="#b91c1c" />
// // //                     <Text style={styles.errorBannerText}>{notificationError}</Text>
// // //                      <TouchableOpacity onPress={fetchNotificationsData} style={styles.retryIconSmall}>
// // //                          <Text style={styles.retryTextSmall}>Réessayer</Text>
// // //                      </TouchableOpacity>
// // //                 </View>
// // //             );
// // //         }
// // //         // Si pas de données de notif après chargement, ne rien afficher
// // //         if (!notificationData) return null;

// // //         const notificationsToShow = [];

// // //         // 1. Vérification KYC (utilise verificationStatus de useAuth)
// // //         // Afficher si non vérifié OU si explicitement en attente/rejeté
// // //         if (!isVerified || verificationStatus?.status === 'pending' || verificationStatus?.status === 'rejected') {
// // //              let message = "Vérifiez votre identité pour pouvoir réserver.";
// // //              let iconColor = "#f59e0b"; // Jaune/Orange pour action requise
// // //              if (verificationStatus?.status === 'pending') {
// // //                  message = "Votre vérification d'identité est en cours d'examen.";
// // //                  iconColor = "#0ea5e9"; // Bleu pour en cours
// // //              } else if (verificationStatus?.status === 'rejected') {
// // //                  message = `Vérification refusée: ${verificationStatus.rejection_reason || 'Veuillez vérifier les détails.'}`;
// // //                  iconColor = "#ef4444"; // Rouge pour rejeté
// // //              }
// // //              notificationsToShow.push(
// // //                  <TouchableOpacity key="kyc" style={styles.notificationItem} onPress={() => router.push('/profile/verify')}>
// // //                      <UserCheck size={20} color={iconColor} />
// // //                      <Text style={styles.notificationText}>{message}</Text>
// // //                  </TouchableOpacity>
// // //              );
// // //          }

// // //         // 2. Réservations en attente
// // //         if (notificationData.pendingBookingsCount > 0) {
// // //             notificationsToShow.push(
// // //                 <TouchableOpacity key="bookings" style={styles.notificationItem} onPress={() => router.push('/(tabs)/bookings')}>
// // //                     <Clock size={20} color="#6366f1" />
// // //                     <Text style={styles.notificationText}>
// // //                         {notificationData.pendingBookingsCount} réservation{notificationData.pendingBookingsCount > 1 ? 's sont' : ' est'} en attente.
// // //                     </Text>
// // //                 </TouchableOpacity>
// // //             );
// // //         }

// // //         // 3. Conversations actives
// // //         if (notificationData.activeConversationsCount > 0) {
// // //             notificationsToShow.push(
// // //                 <TouchableOpacity key="messages" style={styles.notificationItem} onPress={() => router.push('/(tabs)/conversations')}>
// // //                     <MessageCircle size={20} color="#0891b2" />
// // //                     <Text style={styles.notificationText}>
// // //                         {notificationData.activeConversationsCount} nouvelle{notificationData.activeConversationsCount > 1 ? 's' : ''} conversation{notificationData.activeConversationsCount > 1 ? 's' : ''} active{notificationData.activeConversationsCount > 1 ? 's' : ''}.
// // //                     </Text>
// // //                 </TouchableOpacity>
// // //             );
// // //         }

// // //         // Si aucune notification à afficher, ne rien rendre
// // //         if (notificationsToShow.length === 0) {
// // //             return null;
// // //         }

// // //         // Rendre le conteneur avec les notifications
// // //         return (
// // //             <View style={styles.notificationContainer}>
// // //                 {notificationsToShow}
// // //             </View>
// // //         );
// // //     };


// // //     // --- Rendu Principal ---
// // //     if (!fontsLoaded || !sessionInitialized) { // Attendre fonts ET initialisation session
// // //         return null; // SplashScreen gère l'attente
// // //     }
// // //     if (fontError) {
// // //         // Afficher une erreur si les polices ne chargent pas
// // //         return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur de chargement des polices.</Text></SafeAreaView>;
// // //     }

// // //     // Rendu pour utilisateur non connecté (après initialisation)
// // //     if (!user) {
// // //         return (
// // //             <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
// // //                  <View style={styles.header}>
// // //                      <View> <Text style={styles.logo}>3ommy</Text><Text style={styles.slogan}>Un plongeon pour tous</Text></View>
// // //                      <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
// // //                          <LogIn size={20} color="#0891b2" />
// // //                          <Text style={styles.loginButtonText}>Connexion</Text>
// // //                      </TouchableOpacity>
// // //                  </View>
// // //                  <View style={styles.heroSection}>
// // //                      <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }} style={styles.heroImage} resizeMode="cover"/>
// // //                      <View style={styles.overlay} />
// // //                      <View style={styles.heroContent}><Text style={styles.heroTitle}>Bienvenue sur 3ommy</Text><Text style={styles.heroSubtitle}>La première plateforme de location de piscines au Maroc</Text></View>
// // //                  </View>
// // //                  {/* Afficher les options même si non connecté */}
// // //                  <View style={styles.optionsContainer}>
// // //                     <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/search')}>
// // //                         <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}><Users size={32} color="#ffffff" /></View>
// // //                         <Text style={styles.optionTitle}>Je veux me baigner</Text>
// // //                         <Text style={styles.optionDescription}>Trouvez la piscine parfaite pour votre journée détente</Text>
// // //                         <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Recherche par localisation</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Piscines vérifiées</Text></View></View>
// // //                     </TouchableOpacity>
// // //                     <TouchableOpacity style={[styles.optionCard, styles.hostCard]} onPress={() => router.push('/auth/login')}>
// // //                         <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}><School size={32} color="#ffffff" /></View>
// // //                         <Text style={styles.optionTitle}>Je mets ma piscine à louer</Text>
// // //                         <Text style={styles.optionDescription}>Rentabilisez votre piscine en toute sécurité</Text>
// // //                         <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Gestion simplifiée</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Assurance incluse</Text></View></View>
// // //                     </TouchableOpacity>
// // //                  </View>
// // //             </ScrollView>
// // //         );
// // //     }

// // //     // Rendu pour utilisateur connecté
// // //     return (
// // //         <SafeAreaView style={styles.container}>
// // //              {/* Utiliser Stack.Screen pour le titre si cet écran est dans un Stack */}
// // //              {/* <Stack.Screen options={{ title: 'Accueil' }} /> */}
// // //             <ScrollView
// // //                 style={styles.container} // Utiliser container pour le style de fond
// // //                 contentContainerStyle={styles.contentContainer}
// // //                 refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891b2"/> }
// // //             >
// // //                 <View style={styles.header}>
// // //                     <View> <Text style={styles.logo}>3ommy</Text><Text style={styles.slogan}>Un plongeon pour tous</Text></View>
// // //                     {/* Affichage Profil + Badge Vérif */}
// // //                     <View>
// // //                         <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
// // //                             <Image
// // //                                 source={{ uri: user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((user.user_metadata?.full_name || user.email || '?').charAt(0)) + '&background=random&color=fff' }}
// // //                                 style={styles.profileAvatar}
// // //                             />
// // //                         </TouchableOpacity>
// // //                         {/* Afficher badge alerte si non vérifié OU en attente/rejeté */}
// // //                         {(!isVerified || verificationStatus?.status === 'pending' || verificationStatus?.status === 'rejected') && (
// // //                             <TouchableOpacity
// // //                                 style={[styles.verificationBadge, verificationStatus?.status === 'rejected' ? styles.verificationBadgeRejected : verificationStatus?.status === 'pending' ? styles.verificationBadgePending : styles.verificationBadgeNeeded]}
// // //                                 onPress={() => router.push('/profile/verify')}
// // //                             >
// // //                                 {verificationStatus?.status === 'pending' ? <Clock size={14} color="#ffffff"/> : <AlertCircleLucide size={16} color="#ffffff" />}
// // //                             </TouchableOpacity>
// // //                         )}
// // //                          {/* Afficher badge succès si vérifié */}
// // //                          {isVerified && verificationStatus?.status === 'approved' && (
// // //                             <View style={[styles.verificationBadge, styles.verificationBadgeVerified]}>
// // //                                 <CheckCircle size={16} color="#ffffff" />
// // //                              </View>
// // //                          )}
// // //                     </View>
// // //                 </View>

// // //                 {/* Bannière de Notifications (appel de la fonction de rendu) */}
// // //                 {renderNotificationBanner()}

// // //                 {/* Hero Section (peut être gardée ou remplacée par autre chose) */}
// // //                 <View style={styles.heroSection}>
// // //                      <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }} style={styles.heroImage} resizeMode="cover"/>
// // //                      <View style={styles.overlay} />
// // //                      <View style={styles.heroContent}><Text style={styles.heroTitle}>Bienvenue, {user.user_metadata?.full_name || user.email} !</Text><Text style={styles.heroSubtitle}>Prêt pour un plongeon ?</Text></View>
// // //                  </View>

// // //                 {/* Options */}
// // //                 <View style={styles.optionsContainer}>
// // //                     <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/search')}>
// // //                         <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}><Users size={32} color="#ffffff" /></View>
// // //                         <Text style={styles.optionTitle}>Je veux me baigner</Text>
// // //                         <Text style={styles.optionDescription}>Trouvez la piscine parfaite pour votre journée détente</Text>
// // //                         <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Recherche par localisation</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Piscines vérifiées</Text></View></View>
// // //                     </TouchableOpacity>
// // //                     <TouchableOpacity style={[styles.optionCard, styles.hostCard]} onPress={() => router.push('/(tabs)/host')}>
// // //                         <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}><School size={32} color="#ffffff" /></View>
// // //                         <Text style={styles.optionTitle}>Espace Hôte</Text>
// // //                         <Text style={styles.optionDescription}>Gérez vos piscines et réservations</Text>
// // //                         <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Gestion simplifiée</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Assurance incluse</Text></View></View>
// // //                     </TouchableOpacity>
// // //                  </View>
// // //             </ScrollView>
// // //         </SafeAreaView>
// // //     );
// // // }

// // // // --- Styles --- (Ajout/Modification styles pour notifications et badges)
// // // const styles = StyleSheet.create({
// // //     container: {
// // //         flex: 1,
// // //         backgroundColor: '#f8fafc', // Fond légèrement gris
// // //     },
// // //     contentContainer: {
// // //         flexGrow: 1,
// // //         paddingBottom: 40, // Espace en bas
// // //     },
// // //     header: {
// // //         paddingHorizontal: 20,
// // //         paddingTop: Platform.OS === 'web' ? 20 : (Platform.OS === 'ios' ? 50 : 40), // Ajustement safe area
// // //         paddingBottom: 15,
// // //         flexDirection: 'row',
// // //         justifyContent: 'space-between',
// // //         alignItems: 'center',
// // //         backgroundColor: '#ffffff', // Fond blanc pour header
// // //         borderBottomWidth: 1,
// // //         borderBottomColor: '#e5e7eb',
// // //     },
// // //     logo: {
// // //         fontFamily: 'Montserrat-Bold',
// // //         fontSize: 28, // Légèrement plus petit
// // //         color: '#0891b2',
// // //     },
// // //     slogan: {
// // //         fontFamily: 'Montserrat-Regular',
// // //         fontSize: 14, // Légèrement plus petit
// // //         color: '#64748b',
// // //         marginTop: 2,
// // //     },
// // //     loginButton: {
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         gap: 8,
// // //         paddingVertical: 8,
// // //         paddingHorizontal: 12,
// // //         borderRadius: 8,
// // //         backgroundColor: '#f0f9ff',
// // //         borderWidth: 1,
// // //         borderColor: '#bae6fd',
// // //     },
// // //     loginButtonText: {
// // //         fontFamily: 'Montserrat-SemiBold',
// // //         fontSize: 14,
// // //         color: '#0891b2',
// // //     },
// // //     profileButton: {
// // //         width: 44, // Légèrement plus grand
// // //         height: 44,
// // //         borderRadius: 22,
// // //         overflow: 'hidden',
// // //         backgroundColor: '#e0f2fe', // Placeholder color
// // //         borderWidth: 1,
// // //         borderColor: '#bae6fd',
// // //     },
// // //     profileAvatar: {
// // //         width: '100%',
// // //         height: '100%',
// // //     },
// // //     verificationBadge: { // Badge commun
// // //         position: 'absolute',
// // //         bottom: -3,
// // //         right: -3,
// // //         width: 22,
// // //         height: 22,
// // //         borderRadius: 11,
// // //         justifyContent: 'center',
// // //         alignItems: 'center',
// // //         borderWidth: 2,
// // //         borderColor: '#ffffff',
// // //     },
// // //     verificationBadgeNeeded: { // Non vérifié ou inconnu
// // //          backgroundColor: '#f59e0b', // Orange
// // //     },
// // //      verificationBadgePending: { // En attente
// // //          backgroundColor: '#3b82f6', // Bleu
// // //      },
// // //      verificationBadgeRejected: { // Rejeté
// // //          backgroundColor: '#ef4444', // Rouge
// // //      },
// // //     verificationBadgeVerified: { // Approuvé
// // //         backgroundColor: '#22c55e', // Vert
// // //     },
// // //     heroSection: {
// // //         height: 200, // Moins haut
// // //         position: 'relative',
// // //         // marginBottom: 24, // Retiré, géré par padding options
// // //     },
// // //     heroImage: { width: '100%', height: '100%', },
// // //     overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 70, 90, 0.4)', }, // Teinte cyan
// // //     heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, },
// // //     heroTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#ffffff', marginBottom: 4, },
// // //     heroSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#ffffff', opacity: 0.9, },
// // //     // Styles pour notifications (repris et adaptés)
// // //     notificationContainer: {
// // //         marginTop: 16, // Espace au-dessus
// // //         marginHorizontal: 16, // Marges latérales
// // //         marginBottom: 8, // Espace en dessous avant les options
// // //         borderRadius: 12,
// // //         backgroundColor: '#ffffff',
// // //         borderWidth: 1,
// // //         borderColor: '#e5e7eb',
// // //         overflow: 'hidden',
// // //         shadowColor: "#000",
// // //         shadowOffset: { width: 0, height: 1, },
// // //         shadowOpacity: 0.05,
// // //         shadowRadius: 2.00,
// // //         elevation: 1,
// // //     },
// // //      notificationContainerLoading: {
// // //         height: 60, // Hauteur fixe pendant le chargement
// // //         justifyContent: 'center',
// // //         alignItems: 'center',
// // //         marginHorizontal: 16,
// // //         marginBottom: 8,
// // //      },
// // //     notificationItem: {
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         paddingVertical: 12,
// // //         paddingHorizontal: 16,
// // //         borderBottomWidth: 1,
// // //         borderBottomColor: '#f1f5f9', // Séparateur plus léger
// // //         gap: 12,
// // //     },
// // //     notificationText: {
// // //         fontFamily: 'Montserrat-Regular',
// // //         fontSize: 14,
// // //         color: '#334155',
// // //         flex: 1,
// // //         lineHeight: 20,
// // //     },
// // //     errorBanner: { // Style pour bannière d'erreur notif
// // //         backgroundColor: '#fef2f2',
// // //         borderColor: '#fecaca',
// // //         paddingVertical: 12,
// // //         paddingHorizontal: 16,
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         gap: 8,
// // //     },
// // //     errorBannerText: {
// // //         color: '#b91c1c',
// // //         fontFamily: 'Montserrat-Regular',
// // //         flex: 1,
// // //         fontSize: 13,
// // //     },
// // //     retryIconSmall: { padding: 4 }, // Zone cliquable retry
// // //     retryTextSmall: { color: '#b91c1c', fontSize: 13, fontFamily: 'Montserrat-SemiBold', textDecorationLine: 'underline'},
// // //     optionsContainer: { padding: 16, gap: 16, }, // Padding au lieu de margin
// // //     optionCard: {
// // //         backgroundColor: '#ffffff',
// // //         borderRadius: 16,
// // //         padding: 20, // Moins de padding
// // //         borderWidth: 1,
// // //         borderColor: '#e5e7eb',
// // //          shadowColor: "#000",
// // //          shadowOffset: { width: 0, height: 2, },
// // //          shadowOpacity: 0.06,
// // //          shadowRadius: 4,
// // //          elevation: 2,
// // //     },
// // //     hostCard: { borderColor: '#d1fae5', backgroundColor: '#f0fdf4' }, // Style plus subtil pour hôte
// // //     iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 16, },
// // //     optionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 6, },
// // //     optionDescription: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginBottom: 16, lineHeight: 20 },
// // //     features: { gap: 10, },
// // //     featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, },
// // //     feature: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', }, // Texte feature un peu plus foncé
// // //     // Styles pour la carte de vérification (repris de profile.tsx et adaptés)
// // //      verificationCard: {
// // //          backgroundColor: '#fef2f2',
// // //          marginHorizontal: 16, // Consistant avec les autres padding
// // //          marginTop: 16, // Espace après hero
// // //          marginBottom: 0, // Pas de marge basse si notifs suivent
// // //          padding: 16,
// // //          borderRadius: 12,
// // //          borderWidth: 1,
// // //          borderColor: '#fecaca',
// // //          flexDirection: 'row', // Mettre côte à côte
// // //          alignItems: 'center', // Centrer verticalement
// // //          gap: 12,
// // //      },
// // //      verificationContent: {
// // //          flex: 1, // Prendre l'espace restant
// // //      },
// // //      verificationTextContainer: {
// // //          // Pas nécessaire si verificationContent gère le flex: 1
// // //      },
// // //      verificationTitle: {
// // //          fontFamily: 'Montserrat-Bold',
// // //          fontSize: 15, // Taille ajustée
// // //          color: '#991b1b',
// // //          marginBottom: 4,
// // //      },
// // //      verificationText: {
// // //          fontFamily: 'Montserrat-Regular',
// // //          fontSize: 13, // Taille ajustée
// // //          color: '#b91c1c', // Couleur ajustée
// // //          lineHeight: 18,
// // //      },
// // //      // Styles pour le bouton Se Connecter (repris de profile.tsx)
// // //      retryButton: {
// // //          backgroundColor: '#0891b2',
// // //          paddingVertical: 10,
// // //          paddingHorizontal: 20,
// // //          borderRadius: 8,
// // //          marginTop: 15
// // //      },
// // //      retryButtonText: {
// // //          fontFamily: 'Montserrat-SemiBold',
// // //          fontSize: 14,
// // //          color: '#ffffff'
// // //      },
// // // });



// // // // Dans app/(tabs)/index.tsx
// // // // VERSION CORRIGÉE : Intégration des notifications (réservations, messages) dans la page existante

// // // import React, { useState, useEffect, useCallback } from 'react';
// // // import {
// // //     View, Text, StyleSheet, Platform, TouchableOpacity, Image, ScrollView,
// // //     ActivityIndicator, RefreshControl, SafeAreaView // SafeAreaView ajoutée pour la cohérence
// // // } from 'react-native';
// // // import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// // // import {
// // //     School, Users, MapPin, Shield, LogIn, CircleAlert as AlertCircleLucide, // Renommé pour éviter conflit Alert
// // //     BellRing, MessageCircle, Clock, CheckCircle, UserCheck, ChevronRight // Ajout des icônes de notif
// // // } from 'lucide-react-native';
// // // import { router, SplashScreen } from 'expo-router'; // SplashScreen importé
// // // import { useAuth } from '@/hooks/useAuth'; // Assurez-vous que useAuth fournit bien verificationStatus détaillé
// // // import { supabase } from '@/lib/supabase';

// // // // SplashScreen.preventAutoHideAsync(); // Décommentez si vous gérez le SplashScreen ici ou dans _layout

// // // // Interface pour les données de notification (simplifiée)
// // // interface NotificationData {
// // //     // kycStatus n'est plus nécessaire ici, on utilise verificationStatus de useAuth
// // //     pendingBookingsCount: number;
// // //     activeConversationsCount: number;
// // // }

// // // export default function HomeScreen() {
// // //     // Utilisation du hook useAuth (vérifiez que verificationStatus est bien fourni)
// // //     const { user, verificationStatus, isVerified, isLoading: isLoadingAuth, sessionInitialized } = useAuth();
// // //     const [refreshing, setRefreshing] = useState(false);

// // //     // États pour les notifications
// // //     const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
// // //     const [loadingNotifications, setLoadingNotifications] = useState(false); // Commence à false, activé par fetch
// // //     const [notificationError, setNotificationError] = useState<string | null>(null);

// // //     // Charger les polices
// // //     const [fontsLoaded, fontError] = useFonts({
// // //         'Montserrat-Bold': Montserrat_700Bold,
// // //         'Montserrat-SemiBold': Montserrat_600SemiBold,
// // //         'Montserrat-Regular': Montserrat_400Regular,
// // //     });

// // //     // --- Fonction pour charger les données des notifications (SANS KYC) ---
// // //     const fetchNotificationsData = useCallback(async () => {
// // //         if (!user) return; // Ne rien faire si pas d'utilisateur

// // //         setLoadingNotifications(true);
// // //         setNotificationError(null);
// // //         console.log("🚀 Fetching notification data for swimmer:", user.id);

// // //         try {
// // //             // Fetch bookings et conversations en parallèle
// // //             const [bookingsResult, conversationsResult] = await Promise.all([
// // //                 // 1. Compter les réservations en attente du nageur
// // //                 supabase
// // //                     .from('bookings')
// // //                     .select('id', { count: 'exact', head: true })
// // //                     .eq('user_id', user.id)
// // //                     .eq('status', 'pending'),

// // //                 // 2. Compter les conversations actives où l'utilisateur est nageur
// // //                 supabase
// // //                     .from('conversations')
// // //                     .select('id', { count: 'exact', head: true })
// // //                     .eq('swimmer_id', user.id)
// // //                     .eq('status', 'open') // Statut 'open' pour conversations actives
// // //             ]);

// // //             // Traiter les résultats
// // //             let pendingBookingsCount = 0;
// // //             if (bookingsResult.error) { console.warn("Error fetching pending bookings count:", bookingsResult.error.message); }
// // //             else { pendingBookingsCount = bookingsResult.count ?? 0; }

// // //             let activeConversationsCount = 0;
// // //             if (conversationsResult.error) { console.warn("Error fetching active conversations count:", conversationsResult.error.message); }
// // //             else { activeConversationsCount = conversationsResult.count ?? 0; }

// // //             const data: NotificationData = {
// // //                 // kycStatus n'est plus inclus ici
// // //                 pendingBookingsCount,
// // //                 activeConversationsCount
// // //             };
// // //             console.log("✅ Notification data fetched:", data);
// // //             setNotificationData(data);

// // //         } catch (err: any) {
// // //             console.error("Error fetching notification data:", err);
// // //             setNotificationError("Erreur de chargement des notifications.");
// // //             setNotificationData(null);
// // //         } finally {
// // //             setLoadingNotifications(false);
// // //         }
// // //     }, [user]); // Dépend de user

// // //     // --- Effet pour cacher SplashScreen et charger les notifications ---
// // //     useEffect(() => {
// // //         // Cacher SplashScreen quand fonts et session sont prêts
// // //         if ((fontsLoaded || fontError) && sessionInitialized) {
// // //              console.log("[HomeScreen] Fonts/Session ready, hiding SplashScreen.");
// // //              SplashScreen.hideAsync().catch(err => console.warn("Error hiding splash screen:", err));
// // //         }

// // //         // Charger les notifications quand user et fonts sont prêts
// // //         if (user && fontsLoaded && !fontError) {
// // //             console.log("[HomeScreen] User and fonts loaded, fetching notifications.");
// // //             fetchNotificationsData();
// // //         } else if (sessionInitialized && !user) {
// // //             // Si session initialisée mais pas d'utilisateur, reset notifs
// // //              setNotificationData(null);
// // //              setLoadingNotifications(false);
// // //         }
// // //     }, [fontsLoaded, fontError, sessionInitialized, user, fetchNotificationsData]); // Dépendances

// // //     // --- Refresh manuel ---
// // //     const onRefresh = useCallback(async () => {
// // //         setRefreshing(true);
// // //         await fetchNotificationsData(); // Recharger seulement les notifications ici
// // //         // Ajoutez d'autres fetch si nécessaire pour le reste de la page
// // //         setRefreshing(false);
// // //     }, [fetchNotificationsData]);

// // //     // --- Composant pour afficher les notifications ---
// // //     const renderNotificationBanner = () => {
// // //         // Ne rien afficher si pas d'utilisateur ou pendant le chargement initial de l'auth/fonts
// // //         if (!user || isLoadingAuth || !fontsLoaded) return null;

// // //         // Afficher un loader spécifique pour les notifs si elles chargent
// // //         if (loadingNotifications && !refreshing) { // Ne pas montrer si c'est un refresh manuel
// // //             return <ActivityIndicator style={styles.notificationContainerLoading} />;
// // //         }
// // //         // Afficher l'erreur de notif
// // //         if (notificationError) {
// // //             return (
// // //                 <View style={[styles.notificationContainer, styles.errorBanner]}>
// // //                     <AlertCircleLucide size={18} color="#b91c1c" />
// // //                     <Text style={styles.errorBannerText}>{notificationError}</Text>
// // //                      <TouchableOpacity onPress={fetchNotificationsData} style={styles.retryIconSmall}>
// // //                          <Text style={styles.retryTextSmall}>Réessayer</Text>
// // //                      </TouchableOpacity>
// // //                 </View>
// // //             );
// // //         }
// // //         // Si pas de données de notif après chargement, ne rien afficher
// // //         if (!notificationData) return null;

// // //         const notificationsToShow = [];

// // //         // 1. Vérification KYC (utilise verificationStatus de useAuth)
// // //         // Afficher si non vérifié OU si explicitement en attente/rejeté
// // //         if (!isVerified || verificationStatus?.status === 'pending' || verificationStatus?.status === 'rejected') {
// // //              let message = "Vérifiez votre identité pour pouvoir réserver.";
// // //              let iconColor = "#f59e0b"; // Jaune/Orange pour action requise
// // //              if (verificationStatus?.status === 'pending') {
// // //                  message = "Votre vérification d'identité est en cours d'examen.";
// // //                  iconColor = "#0ea5e9"; // Bleu pour en cours
// // //              } else if (verificationStatus?.status === 'rejected') {
// // //                  message = `Vérification refusée: ${verificationStatus.rejection_reason || 'Veuillez vérifier les détails.'}`;
// // //                  iconColor = "#ef4444"; // Rouge pour rejeté
// // //              }
// // //              notificationsToShow.push(
// // //                  <TouchableOpacity key="kyc" style={styles.notificationItem} onPress={() => router.push('/profile/verify')}>
// // //                      <UserCheck size={20} color={iconColor} />
// // //                      <Text style={styles.notificationText}>{message}</Text>
// // //                  </TouchableOpacity>
// // //              );
// // //          }

// // //         // 2. Réservations en attente
// // //         if (notificationData.pendingBookingsCount > 0) {
// // //             notificationsToShow.push(
// // //                 <TouchableOpacity key="bookings" style={styles.notificationItem} onPress={() => router.push('/(tabs)/bookings')}>
// // //                     <Clock size={20} color="#6366f1" />
// // //                     <Text style={styles.notificationText}>
// // //                         {notificationData.pendingBookingsCount} réservation{notificationData.pendingBookingsCount > 1 ? 's sont' : ' est'} en attente.
// // //                     </Text>
// // //                 </TouchableOpacity>
// // //             );
// // //         }

// // //         // 3. Conversations actives
// // //         if (notificationData.activeConversationsCount > 0) {
// // //             notificationsToShow.push(
// // //                 <TouchableOpacity key="messages" style={styles.notificationItem} onPress={() => router.push('/(tabs)/conversations')}>
// // //                     <MessageCircle size={20} color="#0891b2" />
// // //                     <Text style={styles.notificationText}>
// // //                         {notificationData.activeConversationsCount} nouvelle{notificationData.activeConversationsCount > 1 ? 's' : ''} conversation{notificationData.activeConversationsCount > 1 ? 's' : ''} active{notificationData.activeConversationsCount > 1 ? 's' : ''}.
// // //                     </Text>
// // //                 </TouchableOpacity>
// // //             );
// // //         }

// // //         // Si aucune notification à afficher, ne rien rendre
// // //         if (notificationsToShow.length === 0) {
// // //             return null;
// // //         }

// // //         // Rendre le conteneur avec les notifications
// // //         return (
// // //             <View style={styles.notificationContainer}>
// // //                 {notificationsToShow}
// // //             </View>
// // //         );
// // //     };


// // //     // --- Rendu Principal ---
// // //     if (!fontsLoaded || !sessionInitialized) { // Attendre fonts ET initialisation session
// // //         return null; // SplashScreen gère l'attente
// // //     }
// // //     if (fontError) {
// // //         // Afficher une erreur si les polices ne chargent pas
// // //         return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur de chargement des polices.</Text></SafeAreaView>;
// // //     }

// // //     // Rendu pour utilisateur non connecté (après initialisation)
// // //     if (!user) {
// // //         return (
// // //             <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
// // //                  <View style={styles.header}>
// // //                      <View> <Text style={styles.logo}>3ommy</Text><Text style={styles.slogan}>Un plongeon pour tous</Text></View>
// // //                      <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')}>
// // //                          <LogIn size={20} color="#0891b2" />
// // //                          <Text style={styles.loginButtonText}>Connexion</Text>
// // //                      </TouchableOpacity>
// // //                  </View>
// // //                  <View style={styles.heroSection}>
// // //                      <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }} style={styles.heroImage} resizeMode="cover"/>
// // //                      <View style={styles.overlay} />
// // //                      <View style={styles.heroContent}><Text style={styles.heroTitle}>Bienvenue sur 3ommy</Text><Text style={styles.heroSubtitle}>La première plateforme de location de piscines au Maroc</Text></View>
// // //                  </View>
// // //                  {/* Afficher les options même si non connecté */}
// // //                  <View style={styles.optionsContainer}>
// // //                     <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/search')}>
// // //                         <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}><Users size={32} color="#ffffff" /></View>
// // //                         <Text style={styles.optionTitle}>Je veux me baigner</Text>
// // //                         <Text style={styles.optionDescription}>Trouvez la piscine parfaite pour votre journée détente</Text>
// // //                         <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Recherche par localisation</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Piscines vérifiées</Text></View></View>
// // //                     </TouchableOpacity>
// // //                     <TouchableOpacity style={[styles.optionCard, styles.hostCard]} onPress={() => router.push('/auth/login')}>
// // //                         <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}><School size={32} color="#ffffff" /></View>
// // //                         <Text style={styles.optionTitle}>Je mets ma piscine à louer</Text>
// // //                         <Text style={styles.optionDescription}>Rentabilisez votre piscine en toute sécurité</Text>
// // //                         <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Gestion simplifiée</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Assurance incluse</Text></View></View>
// // //                     </TouchableOpacity>
// // //                  </View>
// // //             </ScrollView>
// // //         );
// // //     }

// // //     // Rendu pour utilisateur connecté
// // //     return (
// // //         <SafeAreaView style={styles.container}>
// // //              {/* Utiliser Stack.Screen pour le titre si cet écran est dans un Stack */}
// // //              {/* <Stack.Screen options={{ title: 'Accueil' }} /> */}
// // //             <ScrollView
// // //                 style={styles.container} // Utiliser container pour le style de fond
// // //                 contentContainerStyle={styles.contentContainer}
// // //                 refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891b2"/> }
// // //             >
// // //                 <View style={styles.header}>
// // //                     <View> <Text style={styles.logo}>3ommy</Text><Text style={styles.slogan}>Un plongeon pour tous</Text></View>
// // //                     {/* Affichage Profil + Badge Vérif */}
// // //                     <View>
// // //                         <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
// // //                             <Image
// // //                                 source={{ uri: user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((user.user_metadata?.full_name || user.email || '?').charAt(0)) + '&background=random&color=fff' }}
// // //                                 style={styles.profileAvatar}
// // //                             />
// // //                         </TouchableOpacity>
// // //                         {/* Afficher badge alerte si non vérifié OU en attente/rejeté */}
// // //                         {(!isVerified || verificationStatus?.status === 'pending' || verificationStatus?.status === 'rejected') && (
// // //                             <TouchableOpacity
// // //                                 style={[styles.verificationBadge, verificationStatus?.status === 'rejected' ? styles.verificationBadgeRejected : verificationStatus?.status === 'pending' ? styles.verificationBadgePending : styles.verificationBadgeNeeded]}
// // //                                 onPress={() => router.push('/profile/verify')}
// // //                             >
// // //                                 {verificationStatus?.status === 'pending' ? <Clock size={14} color="#ffffff"/> : <AlertCircleLucide size={16} color="#ffffff" />}
// // //                             </TouchableOpacity>
// // //                         )}
// // //                          {/* Afficher badge succès si vérifié */}
// // //                          {isVerified && verificationStatus?.status === 'approved' && (
// // //                             <View style={[styles.verificationBadge, styles.verificationBadgeVerified]}>
// // //                                 <CheckCircle size={16} color="#ffffff" />
// // //                              </View>
// // //                          )}
// // //                     </View>
// // //                 </View>

// // //                 {/* Bannière de Notifications (appel de la fonction de rendu) */}
// // //                 {renderNotificationBanner()}

// // //                 {/* Hero Section (peut être gardée ou remplacée par autre chose) */}
// // //                 <View style={styles.heroSection}>
// // //                      <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }} style={styles.heroImage} resizeMode="cover"/>
// // //                      <View style={styles.overlay} />
// // //                      <View style={styles.heroContent}><Text style={styles.heroTitle}>Bienvenue, {user.user_metadata?.full_name || user.email} !</Text><Text style={styles.heroSubtitle}>Prêt pour un plongeon ?</Text></View>
// // //                  </View>

// // //                 {/* Options */}
// // //                 <View style={styles.optionsContainer}>
// // //                     <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/search')}>
// // //                         <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}><Users size={32} color="#ffffff" /></View>
// // //                         <Text style={styles.optionTitle}>Je veux me baigner</Text>
// // //                         <Text style={styles.optionDescription}>Trouvez la piscine parfaite pour votre journée détente</Text>
// // //                         <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Recherche par localisation</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Piscines vérifiées</Text></View></View>
// // //                     </TouchableOpacity>
// // //                     <TouchableOpacity style={[styles.optionCard, styles.hostCard]} onPress={() => router.push('/(tabs)/host')}>
// // //                         <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}><School size={32} color="#ffffff" /></View>
// // //                         <Text style={styles.optionTitle}>Espace Hôte</Text>
// // //                         <Text style={styles.optionDescription}>Gérez vos piscines et réservations</Text>
// // //                         <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Gestion simplifiée</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Assurance incluse</Text></View></View>
// // //                     </TouchableOpacity>
// // //                  </View>
// // //             </ScrollView>
// // //         </SafeAreaView>
// // //     );
// // // }

// // // // --- Styles --- (Ajout/Modification styles pour notifications et badges)
// // // const styles = StyleSheet.create({
// // //     container: {
// // //         flex: 1,
// // //         backgroundColor: '#f8fafc', // Fond légèrement gris
// // //     },
// // //     contentContainer: {
// // //         flexGrow: 1,
// // //         paddingBottom: 40, // Espace en bas
// // //     },
// // //     errorContainer: {
// // //         flex: 1,
// // //         justifyContent: 'center',
// // //         alignItems: 'center',
// // //         backgroundColor: '#f8fafc',
// // //     },
// // //     errorText: {
// // //         fontFamily: 'Montserrat-Regular',
// // //         color: '#dc2626',
// // //         fontSize: 16,
// // //         textAlign: 'center',
// // //     },
// // //     header: {
// // //         paddingHorizontal: 20,
// // //         paddingTop: Platform.OS === 'web' ? 20 : (Platform.OS === 'ios' ? 50 : 40), // Ajustement safe area
// // //         paddingBottom: 15,
// // //         flexDirection: 'row',
// // //         justifyContent: 'space-between',
// // //         alignItems: 'center',
// // //         backgroundColor: '#ffffff', // Fond blanc pour header
// // //         borderBottomWidth: 1,
// // //         borderBottomColor: '#e5e7eb',
// // //     },
// // //     logo: {
// // //         fontFamily: 'Montserrat-Bold',
// // //         fontSize: 28, // Légèrement plus petit
// // //         color: '#0891b2',
// // //     },
// // //     slogan: {
// // //         fontFamily: 'Montserrat-Regular',
// // //         fontSize: 14, // Légèrement plus petit
// // //         color: '#64748b',
// // //         marginTop: 2,
// // //     },
// // //     loginButton: {
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         gap: 8,
// // //         paddingVertical: 8,
// // //         paddingHorizontal: 12,
// // //         borderRadius: 8,
// // //         backgroundColor: '#f0f9ff',
// // //         borderWidth: 1,
// // //         borderColor: '#bae6fd',
// // //     },
// // //     loginButtonText: {
// // //         fontFamily: 'Montserrat-SemiBold',
// // //         fontSize: 14,
// // //         color: '#0891b2',
// // //     },
// // //     profileButton: {
// // //         width: 44, // Légèrement plus grand
// // //         height: 44,
// // //         borderRadius: 22,
// // //         overflow: 'hidden',
// // //         backgroundColor: '#e0f2fe', // Placeholder color
// // //         borderWidth: 1,
// // //         borderColor: '#bae6fd',
// // //     },
// // //     profileAvatar: {
// // //         width: '100%',
// // //         height: '100%',
// // //     },
// // //     verificationBadge: { // Badge commun
// // //         position: 'absolute',
// // //         bottom: -3,
// // //         right: -3,
// // //         width: 22,
// // //         height: 22,
// // //         borderRadius: 11,
// // //         justifyContent: 'center',
// // //         alignItems: 'center',
// // //         borderWidth: 2,
// // //         borderColor: '#ffffff',
// // //     },
// // //     verificationBadgeNeeded: { // Non vérifié ou inconnu
// // //          backgroundColor: '#f59e0b', // Orange
// // //     },
// // //      verificationBadgePending: { // En attente
// // //          backgroundColor: '#3b82f6', // Bleu
// // //      },
// // //      verificationBadgeRejected: { // Rejeté
// // //          backgroundColor: '#ef4444', // Rouge
// // //      },
// // //     verificationBadgeVerified: { // Approuvé
// // //         backgroundColor: '#22c55e', // Vert
// // //     },
// // //     heroSection: {
// // //         height: 200, // Moins haut
// // //         position: 'relative',
// // //         // marginBottom: 24, // Retiré, géré par padding options
// // //     },
// // //     heroImage: { width: '100%', height: '100%', },
// // //     overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 70, 90, 0.4)', }, // Teinte cyan
// // //     heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, },
// // //     heroTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#ffffff', marginBottom: 4, },
// // //     heroSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#ffffff', opacity: 0.9, },
// // //     // Styles pour notifications (repris et adaptés)
// // //     notificationContainer: {
// // //         marginTop: 16, // Espace au-dessus
// // //         marginHorizontal: 16, // Marges latérales
// // //         marginBottom: 8, // Espace en dessous avant les options
// // //         borderRadius: 12,
// // //         backgroundColor: '#ffffff',
// // //         borderWidth: 1,
// // //         borderColor: '#e5e7eb',
// // //         overflow: 'hidden',
// // //         shadowColor: "#000",
// // //         shadowOffset: { width: 0, height: 1, },
// // //         shadowOpacity: 0.05,
// // //         shadowRadius: 2.00,
// // //         elevation: 1,
// // //     },
// // //      notificationContainerLoading: {
// // //         height: 60, // Hauteur fixe pendant le chargement
// // //         justifyContent: 'center',
// // //         alignItems: 'center',
// // //         marginHorizontal: 16,
// // //         marginBottom: 8,
// // //      },
// // //     notificationItem: {
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         paddingVertical: 12,
// // //         paddingHorizontal: 16,
// // //         borderBottomWidth: 1,
// // //         borderBottomColor: '#f1f5f9', // Séparateur plus léger
// // //         gap: 12,
// // //     },
// // //     notificationText: {
// // //         fontFamily: 'Montserrat-Regular',
// // //         fontSize: 14,
// // //         color: '#334155',
// // //         flex: 1,
// // //         lineHeight: 20,
// // //     },
// // //     errorBanner: { // Style pour bannière d'erreur notif
// // //         backgroundColor: '#fef2f2',
// // //         borderColor: '#fecaca',
// // //         paddingVertical: 12,
// // //         paddingHorizontal: 16,
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         gap: 8,
// // //     },
// // //     errorBannerText: {
// // //         color: '#b91c1c',
// // //         fontFamily: 'Montserrat-Regular',
// // //         flex: 1,
// // //         fontSize: 13,
// // //     },
// // //     retryIconSmall: { padding: 4 }, // Zone cliquable retry
// // //     retryTextSmall: { color: '#b91c1c', fontSize: 13, fontFamily: 'Montserrat-SemiBold', textDecorationLine: 'underline'},
// // //     optionsContainer: { padding: 16, gap: 16, }, // Padding au lieu de margin
// // //     optionCard: {
// // //         backgroundColor: '#ffffff',
// // //         borderRadius: 16,
// // //         padding: 20, // Moins de padding
// // //         borderWidth: 1,
// // //         borderColor: '#e5e7eb',
// // //          shadowColor: "#000",
// // //          shadowOffset: { width: 0, height: 2, },
// // //          shadowOpacity: 0.06,
// // //          shadowRadius: 4,
// // //          elevation: 2,
// // //     },
// // //     hostCard: { borderColor: '#d1fae5', backgroundColor: '#f0fdf4' }, // Style plus subtil pour hôte
// // //     iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 16, },
// // //     optionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 6, },
// // //     optionDescription: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginBottom: 16, lineHeight: 20 },
// // //     features: { gap: 10, },
// // //     featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, },
// // //     feature: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', }, // Texte feature un peu plus foncé
// // //     // Styles pour la carte de vérification (repris de profile.tsx et adaptés)
// // //      verificationCard: {
// // //          backgroundColor: '#fef2f2',
// // //          marginHorizontal: 16, // Consistant avec les autres padding
// // //          marginTop: 16, // Espace après hero
// // //          marginBottom: 0, // Pas de marge basse si notifs suivent
// // //          padding: 16,
// // //          borderRadius: 12,
// // //          borderWidth: 1,
// // //          borderColor: '#fecaca',
// // //          flexDirection: 'row', // Mettre côte à côte
// // //          alignItems: 'center', // Centrer verticalement
// // //          gap: 12,
// // //      },
// // //      verificationContent: {
// // //          flex: 1, // Prendre l'espace restant
// // //      },
// // //      verificationTextContainer: {
// // //          // Pas nécessaire si verificationContent gère le flex: 1
// // //      },
// // //      verificationTitle: {
// // //          fontFamily: 'Montserrat-Bold',
// // //          fontSize: 15, // Taille ajustée
// // //          color: '#991b1b',
// // //          marginBottom: 4,
// // //      },
// // //      verificationText: {
// // //          fontFamily: 'Montserrat-Regular',
// // //          fontSize: 13, // Taille ajustée
// // //          color: '#b91c1c', // Couleur ajustée
// // //          lineHeight: 18,
// // //      },
// // //      // Styles pour le bouton Se Connecter (repris de profile.tsx)
// // //      retryButton: {
// // //          backgroundColor: '#0891b2',
// // //          paddingVertical: 10,
// // //          paddingHorizontal: 20,
// // //          borderRadius: 8,
// // //          marginTop: 15
// // //      },
// // //      retryButtonText: {
// // //          fontFamily: 'Montserrat-SemiBold',
// // //          fontSize: 14,
// // //          color: '#ffffff'
// // //      },
// // // });

// // // Dans app/(tabs)/index.tsx
// // // VERSION CORRIGÉE : Lien "Devenir Hôte" et texte ajusté

// // import React, { useState, useEffect, useCallback, useRef } from 'react';
// // import {
// //     View, Text, StyleSheet, Platform, TouchableOpacity, Image, ScrollView,
// //     ActivityIndicator, RefreshControl, SafeAreaView
// // } from 'react-native';
// // import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// // import {
// //     School, Users, MapPin, Shield, LogIn, CircleAlert as AlertCircleLucide,
// //     BellRing, MessageCircle, Clock, CheckCircle, UserCheck, ChevronRight
// // } from 'lucide-react-native';
// // import { router, SplashScreen, Stack } from 'expo-router';
// // import { useAuth } from '@/hooks/useAuth';
// // import { supabase } from '@/lib/supabase';

// // // SplashScreen.preventAutoHideAsync(); // Géré dans _layout global

// // // Interface pour les données de notification
// // interface NotificationData {
// //     pendingBookingsCount: number;
// //     activeConversationsCount: number;
// // }

// // export default function HomeScreen() {
// //     const { user, verificationStatus, isVerified, isLoading: isLoadingAuth, sessionInitialized } = useAuth();
// //     const [refreshing, setRefreshing] = useState(false);
// //     const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
// //     const [loadingNotifications, setLoadingNotifications] = useState(false);
// //     const [notificationError, setNotificationError] = useState<string | null>(null);

// //     const [fontsLoaded, fontError] = useFonts({
// //         'Montserrat-Bold': Montserrat_700Bold,
// //         'Montserrat-SemiBold': Montserrat_600SemiBold,
// //         'Montserrat-Regular': Montserrat_400Regular,
// //     });

// //     const isInitialNotificationFetchDone = useRef(false);

// //     // --- Fonction pour charger les données des notifications ---
// //     const fetchNotificationsData = useCallback(async (isManualRefresh = false) => {
// //         if (!user) { setNotificationData(null); return; }
// //         if (!isManualRefresh) setLoadingNotifications(true);
// //         setNotificationError(null);
// //         console.log("🚀 Fetching notification data for swimmer:", user.id);
// //         try {
// //             const [bookingsResult, conversationsResult] = await Promise.all([
// //                 supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending'),
// //                 supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('swimmer_id', user.id).eq('status', 'open')
// //             ]);

// //             let pendingBookingsCount = notificationData?.pendingBookingsCount ?? 0;
// //             if (bookingsResult.error) { console.warn("Error fetching pending bookings count:", bookingsResult.error.message); }
// //             else { pendingBookingsCount = bookingsResult.count ?? 0; }

// //             let activeConversationsCount = notificationData?.activeConversationsCount ?? 0;
// //             if (conversationsResult.error) { console.warn("Error fetching active conversations count:", conversationsResult.error.message); }
// //             else { activeConversationsCount = conversationsResult.count ?? 0; }

// //             const newData: NotificationData = { pendingBookingsCount, activeConversationsCount };
// //             console.log("✅ Notification data fetched:", newData);
// //             setNotificationData(newData);
// //         } catch (err: any) {
// //             console.error("Unexpected error fetching notification data:", err);
// //             setNotificationError("Erreur de chargement des notifications.");
// //         } finally {
// //             setLoadingNotifications(false);
// //         }
// //     }, [user, notificationData]);

// //     // --- Effet principal pour le chargement initial et le SplashScreen ---
// //     useEffect(() => {
// //         const isReady = (fontsLoaded || fontError) && sessionInitialized;
// //         if (isReady) {
// //             SplashScreen.hideAsync().catch(err => console.warn("Error hiding splash screen:", err));
// //             if (user && !isInitialNotificationFetchDone.current) {
// //                 isInitialNotificationFetchDone.current = true;
// //                 fetchNotificationsData(false);
// //             } else if (!user) {
// //                  setNotificationData(null);
// //                  setLoadingNotifications(false);
// //              }
// //         }
// //     }, [fontsLoaded, fontError, sessionInitialized, user, fetchNotificationsData]);

// //     // --- Refresh manuel ---
// //     const onRefresh = useCallback(async () => {
// //         setRefreshing(true);
// //         await fetchNotificationsData(true);
// //         setRefreshing(false);
// //     }, [fetchNotificationsData]);

// //     // --- Composant pour afficher les notifications ---
// //     const renderNotificationBanner = () => {
// //         if (!user || isLoadingAuth || !fontsLoaded) return null;
// //         if (loadingNotifications && !refreshing) { return <ActivityIndicator style={styles.notificationContainerLoading} />; }
// //         if (notificationError && !loadingNotifications) { return ( <View style={[styles.notificationContainer, styles.errorBanner]}><AlertCircleLucide size={18} color="#b91c1c" /><Text style={styles.errorBannerText}>{notificationError}</Text><TouchableOpacity onPress={() => fetchNotificationsData(false)} style={styles.retryIconSmall}><Text style={styles.retryTextSmall}>Réessayer</Text></TouchableOpacity></View> ); }
// //         if (!notificationData) return null;

// //         const notificationsToShow = [];
// //         const kycStatus = verificationStatus?.status;

// //         // 1. Vérification KYC
// //         if (!isVerified || kycStatus === 'pending' || kycStatus === 'rejected') {
// //              let message = "Vérifiez votre identité pour pouvoir réserver.";
// //              let iconColor = "#f59e0b";
// //              if (kycStatus === 'pending') { message = "Votre vérification d'identité est en cours."; iconColor = "#0ea5e9"; }
// //              else if (kycStatus === 'rejected') { message = `Vérification refusée: ${verificationStatus.rejection_reason || 'Vérifiez vos documents.'}`; iconColor = "#ef4444"; }
// //              notificationsToShow.push( <TouchableOpacity key="kyc" style={styles.notificationItem} onPress={() => router.push('/profile/verify')}><UserCheck size={20} color={iconColor} /><Text style={styles.notificationText}>{message}</Text><ChevronRight size={18} color="#9ca3af" /></TouchableOpacity> );
// //          }

// //         // 2. Réservations en attente
// //         if (notificationData.pendingBookingsCount > 0) {
// //             // *** Lien vers la liste des réservations du nageur ***
// //             notificationsToShow.push( <TouchableOpacity key="bookings" style={styles.notificationItem} onPress={() => router.push('/(tabs)/bookings')}><Clock size={20} color="#6366f1" /><Text style={styles.notificationText}>{notificationData.pendingBookingsCount} réservation{notificationData.pendingBookingsCount > 1 ? 's sont' : ' est'} en attente.</Text><ChevronRight size={18} color="#9ca3af" /></TouchableOpacity> );
// //         }

// //         // 3. Conversations actives
// //         if (notificationData.activeConversationsCount > 0) {
// //             notificationsToShow.push( <TouchableOpacity key="messages" style={styles.notificationItem} onPress={() => router.push('/(tabs)/conversations')}><MessageCircle size={20} color="#0891b2" /><Text style={styles.notificationText}>{notificationData.activeConversationsCount} conversation{notificationData.activeConversationsCount > 1 ? 's' : ''} active{notificationData.activeConversationsCount > 1 ? 's' : ''}.</Text><ChevronRight size={18} color="#9ca3af" /></TouchableOpacity> );
// //         }

// //         if (notificationsToShow.length === 0 && !loadingNotifications) { return null; }
// //         return ( <View style={styles.notificationContainer}>{notificationsToShow}</View> );
// //     };

// //     // --- Rendu Principal ---
// //     if (!fontsLoaded || !sessionInitialized || isLoadingAuth) {
// //         return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></View>;
// //     }
// //     if (fontError) {
// //         return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>;
// //     }

// //     // Rendu pour utilisateur non connecté
// //     if (!user) {
// //         return (
// //             <SafeAreaView style={{flex: 1}}>
// //                 <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
// //                     <View style={styles.header}>
// //                         <View> <Text style={styles.logo}>3ommy</Text><Text style={styles.slogan}>Un plongeon pour tous</Text></View>
// //                         <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
// //                             <LogIn size={20} color="#0891b2" />
// //                             <Text style={styles.loginButtonText}>Connexion</Text>
// //                         </TouchableOpacity>
// //                     </View>
// //                     <View style={styles.heroSection}>
// //                         <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }} style={styles.heroImage} resizeMode="cover"/>
// //                         <View style={styles.overlay} />
// //                         <View style={styles.heroContent}><Text style={styles.heroTitle}>Bienvenue sur 3ommy</Text><Text style={styles.heroSubtitle}>La première plateforme de location de piscines au Maroc</Text></View>
// //                     </View>
// //                     <View style={styles.optionsContainer}>
// //                         <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/search')}>
// //                             <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}><Users size={32} color="#ffffff" /></View>
// //                             <Text style={styles.optionTitle}>Je veux me baigner</Text>
// //                             <Text style={styles.optionDescription}>Trouvez la piscine parfaite</Text>
// //                             <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Recherche par localisation</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Piscines vérifiées</Text></View></View>
// //                         </TouchableOpacity>
// //                         {/* *** CORRECTION LIEN ET TEXTE ICI (Non connecté) *** */}
// //                         <TouchableOpacity style={[styles.optionCard, styles.hostCard]} onPress={() => router.push('/(tabs)/become-host')}>
// //                             <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}><School size={32} color="#ffffff" /></View>
// //                             <Text style={styles.optionTitle}>Devenez Hôte</Text>
// //                             <Text style={styles.optionDescription}>Rentabilisez votre piscine en toute sécurité</Text>
// //                             <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Gestion simplifiée</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Assurance incluse</Text></View></View>
// //                         </TouchableOpacity>
// //                     </View>
// //                 </ScrollView>
// //             </SafeAreaView>
// //         );
// //     }

// //     // Rendu pour utilisateur connecté
// //     return (
// //         <SafeAreaView style={styles.container}>
// //             <ScrollView
// //                 contentContainerStyle={styles.contentContainer}
// //                 refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891b2"/> }
// //             >
// //                 {/* Header Connecté */}
// //                 <View style={styles.header}>
// //                     <View> <Text style={styles.logo}>3ommy</Text><Text style={styles.slogan}>Un plongeon pour tous</Text></View>
// //                     <View>
// //                         <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}>
// //                             <Image
// //                                 source={{ uri: user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((user.user_metadata?.full_name || user.email || '?').charAt(0)) + '&background=random&color=fff' }}
// //                                 style={styles.profileAvatar}
// //                             />
// //                         </TouchableOpacity>
// //                          {(!isVerified || verificationStatus?.status === 'pending' || verificationStatus?.status === 'rejected') && (
// //                             <TouchableOpacity
// //                                 style={[styles.verificationBadge, verificationStatus?.status === 'rejected' ? styles.verificationBadgeRejected : verificationStatus?.status === 'pending' ? styles.verificationBadgePending : styles.verificationBadgeNeeded]}
// //                                 onPress={() => router.push('/profile/verify')} >
// //                                 {verificationStatus?.status === 'pending' ? <Clock size={14} color="#ffffff"/> : <AlertCircleLucide size={16} color="#ffffff" />}
// //                             </TouchableOpacity>
// //                          )}
// //                          {isVerified && verificationStatus?.status === 'approved' && (
// //                             <View style={[styles.verificationBadge, styles.verificationBadgeVerified]}>
// //                                 <CheckCircle size={16} color="#ffffff" />
// //                              </View>
// //                          )}
// //                     </View>
// //                 </View>

// //                  {/* Bannière de Notifications */}
// //                  {renderNotificationBanner()}

// //                 {/* Hero Section Connecté */}
// //                 <View style={styles.heroSection}>
// //                      <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }} style={styles.heroImage} resizeMode="cover"/>
// //                      <View style={styles.overlay} />
// //                      <View style={styles.heroContent}>
// //                          <Text style={styles.heroTitle}>Bonjour{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''} !</Text>
// //                          <Text style={styles.heroSubtitle}>Prêt pour un plongeon ?</Text>
// //                      </View>
// //                  </View>

// //                  {/* Options */}
// //                 <View style={styles.optionsContainer}>
// //                     <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/search')}>
// //                         <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}><Users size={32} color="#ffffff" /></View>
// //                         <Text style={styles.optionTitle}>Je veux me baigner</Text>
// //                         <Text style={styles.optionDescription}>Trouvez la piscine parfaite</Text>
// //                         <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Recherche par localisation</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Piscines vérifiées</Text></View></View>
// //                     </TouchableOpacity>
// //                     {/* *** CORRECTION LIEN ET TEXTE ICI (Connecté) *** */}
// //                     <TouchableOpacity style={[styles.optionCard, styles.hostCard]} onPress={() => router.push('/(tabs)/become-host')}>
// //                         <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}><School size={32} color="#ffffff" /></View>
// //                         <Text style={styles.optionTitle}>Devenez Hôte</Text>
// //                         <Text style={styles.optionDescription}>Rentabilisez votre piscine en toute sécurité</Text>
// //                         <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Gestion simplifiée</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Assurance incluse</Text></View></View>
// //                     </TouchableOpacity>
// //                  </View>
// //             </ScrollView>
// //         </SafeAreaView>
// //     );
// // }

// // // --- Styles ---
// // const styles = StyleSheet.create({
// //     container: { flex: 1, backgroundColor: '#f8fafc', },
// //     contentContainer: { flexGrow: 1, paddingBottom: 40, },
// //     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
// //     errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
// //     errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
// //     header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 20 : (Platform.OS === 'ios' ? 50 : 40), paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', },
// //     logo: { fontFamily: 'Montserrat-Bold', fontSize: 28, color: '#0891b2', },
// //     slogan: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginTop: 2, },
// //     loginButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', },
// //     loginButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#0891b2', },
// //     profileButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: '#e0f2fe', borderWidth: 1, borderColor: '#bae6fd', },
// //     profileAvatar: { width: '100%', height: '100%', },
// //     verificationBadge: { position: 'absolute', bottom: -3, right: -3, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ffffff', },
// //     verificationBadgeNeeded: { backgroundColor: '#f59e0b', },
// //     verificationBadgePending: { backgroundColor: '#3b82f6', },
// //     verificationBadgeRejected: { backgroundColor: '#ef4444', },
// //     verificationBadgeVerified: { backgroundColor: '#22c55e', },
// //     heroSection: { height: 200, position: 'relative', },
// //     heroImage: { width: '100%', height: '100%', },
// //     overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 70, 90, 0.4)', },
// //     heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, },
// //     heroTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#ffffff', marginBottom: 4, },
// //     heroSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#ffffff', opacity: 0.9, },
// //     notificationContainer: { marginTop: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.05, shadowRadius: 2.00, elevation: 1, },
// //     notificationContainerLoading: { height: 60, justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, },
// //     notificationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 12, },
// //     notificationText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#334155', flex: 1, lineHeight: 20, },
// //     errorBanner: { backgroundColor: '#fef2f2', borderColor: '#fecaca', paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, },
// //     errorBannerText: { color: '#b91c1c', fontFamily: 'Montserrat-Regular', flex: 1, fontSize: 13, },
// //     retryIconSmall: { padding: 4 },
// //     retryTextSmall: { color: '#b91c1c', fontSize: 13, fontFamily: 'Montserrat-SemiBold', textDecorationLine: 'underline'},
// //     optionsContainer: { padding: 16, gap: 16, },
// //     optionCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, },
// //     hostCard: { borderColor: '#d1fae5', backgroundColor: '#f0fdf4' },
// //     iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 16, },
// //     optionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 6, },
// //     optionDescription: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginBottom: 16, lineHeight: 20 },
// //     features: { gap: 10, },
// //     featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, },
// //     feature: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', },
// //     verificationCard: { backgroundColor: '#fef2f2', marginHorizontal: 16, marginTop: 16, marginBottom: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca', flexDirection: 'row', alignItems: 'center', gap: 12, },
// //     verificationContent: { flex: 1, },
// //     verificationTextContainer: { },
// //     verificationTitle: { fontFamily: 'Montserrat-Bold', fontSize: 15, color: '#991b1b', marginBottom: 4, },
// //     verificationText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#b91c1c', lineHeight: 18, },
// //     retryButton: { backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 15 },
// //     retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
// // });



// // // Dans app/(tabs)/index.tsx
// // // VERSION CORRIGÉE : Intégration des notifications (réservations, messages) et liens corrigés

// // import React, { useState, useEffect, useCallback, useRef } from 'react'; // useRef ajouté
// // import {
// //     View, Text, StyleSheet, Platform, TouchableOpacity, Image, ScrollView,
// //     ActivityIndicator, RefreshControl, SafeAreaView // SafeAreaView ajoutée
// // } from 'react-native';
// // import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// // import {
// //     School, Users, MapPin, Shield, LogIn, CircleAlert as AlertCircleLucide, // Renommé
// //     BellRing, MessageCircle, Clock, CheckCircle, UserCheck, ChevronRight // Ajout des icônes de notif
// // } from 'lucide-react-native';
// // import { router, SplashScreen, Stack } from 'expo-router'; // Stack ajouté si besoin de configurer header ici
// // import { useAuth } from '@/hooks/useAuth';
// // import { supabase } from '@/lib/supabase';

// // // SplashScreen.preventAutoHideAsync(); // Géré dans _layout global

// // // Interface pour les données de notification
// // interface NotificationData {
// //     pendingBookingsCount: number;
// //     activeConversationsCount: number;
// // }

// // export default function HomeScreen() {
// //     // Utilisation du hook useAuth
// //     const { user, verificationStatus, isVerified, isLoading: isLoadingAuth, sessionInitialized } = useAuth();
// //     const [refreshing, setRefreshing] = useState(false);

// //     // États pour les notifications
// //     const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
// //     const [loadingNotifications, setLoadingNotifications] = useState(false); // Commence à false
// //     const [notificationError, setNotificationError] = useState<string | null>(null);

// //     // Charger les polices
// //     const [fontsLoaded, fontError] = useFonts({
// //         'Montserrat-Bold': Montserrat_700Bold,
// //         'Montserrat-SemiBold': Montserrat_600SemiBold,
// //         'Montserrat-Regular': Montserrat_400Regular,
// //     });

// //     // Ref pour éviter le re-fetch initial après la première fois
// //     const isInitialNotificationFetchDone = useRef(false);

// //     // --- Fonction pour charger les données des notifications ---
// //     const fetchNotificationsData = useCallback(async (isManualRefresh = false) => {
// //         if (!user) {
// //             console.log("fetchNotificationsData: No user, skipping.");
// //             setNotificationData(null); // Reset notifs si pas d'user
// //             return;
// //         }

// //         // Afficher le loader uniquement si ce n'est pas un refresh en arrière-plan
// //         if (!isManualRefresh) {
// //             setLoadingNotifications(true);
// //         }
// //         setNotificationError(null);
// //         console.log("🚀 Fetching notification data for swimmer:", user.id);

// //         try {
// //             const [bookingsResult, conversationsResult] = await Promise.all([
// //                 supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending'),
// //                 supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('swimmer_id', user.id).eq('status', 'open')
// //             ]);

// //             let pendingBookingsCount = notificationData?.pendingBookingsCount ?? 0;
// //             if (bookingsResult.error) { console.warn("Error fetching pending bookings count:", bookingsResult.error.message); }
// //             else { pendingBookingsCount = bookingsResult.count ?? 0; }

// //             let activeConversationsCount = notificationData?.activeConversationsCount ?? 0;
// //             if (conversationsResult.error) { console.warn("Error fetching active conversations count:", conversationsResult.error.message); }
// //             else { activeConversationsCount = conversationsResult.count ?? 0; }

// //             const newData: NotificationData = { pendingBookingsCount, activeConversationsCount };
// //             console.log("✅ Notification data fetched:", newData);
// //             setNotificationData(newData);

// //         } catch (err: any) {
// //             console.error("Unexpected error fetching notification data:", err);
// //             setNotificationError("Erreur de chargement des notifications.");
// //         } finally {
// //             setLoadingNotifications(false);
// //         }
// //     }, [user, notificationData]); // notificationData inclus pour garder l'ancienne valeur en cas d'erreur

// //     // --- Effet principal pour le chargement initial et le SplashScreen ---
// //     useEffect(() => {
// //         const isAppReady = (fontsLoaded || fontError) && sessionInitialized;
// //         console.log(`[HomeScreen Effect] Ready State: fontsLoaded=${!!fontsLoaded}, fontError=${!!fontError}, sessionInitialized=${sessionInitialized} => isAppReady=${isAppReady}`);

// //         if (isAppReady) {
// //             console.log("[HomeScreen Effect] App is ready, hiding SplashScreen.");
// //             SplashScreen.hideAsync().catch(err => console.warn("Error hiding splash screen:", err));

// //             // Charger les notifications seulement si l'utilisateur est chargé et si c'est le premier chargement réussi
// //             if (user && !isInitialNotificationFetchDone.current) {
// //                 console.log("[HomeScreen Effect] User exists and initial fetch not done, fetching notifications.");
// //                 isInitialNotificationFetchDone.current = true;
// //                 fetchNotificationsData(false); // false car ce n'est pas un refresh manuel
// //             } else if (!user) {
// //                  console.log("[HomeScreen Effect] No user after init, resetting notifications.");
// //                  setNotificationData(null); // Reset si pas d'utilisateur
// //                  setLoadingNotifications(false);
// //              } else {
// //                  console.log("[HomeScreen Effect] User exists but initial notification fetch already done or in progress.");
// //              }
// //         }
// //     }, [fontsLoaded, fontError, sessionInitialized, user, fetchNotificationsData]);

// //     // --- Refresh manuel ---
// //     const onRefresh = useCallback(async () => {
// //         setRefreshing(true);
// //         await fetchNotificationsData(true); // true pour indiquer refresh manuel
// //         // Ajoutez ici d'autres fetch si nécessaire pour le reste de la page
// //         setRefreshing(false);
// //     }, [fetchNotificationsData]);

// //     // --- Composant pour afficher les notifications ---
// //     const renderNotificationBanner = () => {
// //         // Ne rien afficher si pas d'utilisateur ou pendant le chargement initial global
// //         if (!user || isLoadingAuth || !fontsLoaded) return null;

// //         // Afficher un état de chargement minimaliste ou rien pendant le chargement des notifs
// //         if (loadingNotifications && !refreshing) {
// //              return <ActivityIndicator style={styles.notificationContainerLoading} />;
// //         }

// //         // Afficher l'erreur de chargement des notifs
// //         if (notificationError && !loadingNotifications) {
// //              return (
// //                  <View style={[styles.notificationContainer, styles.errorBanner]}>
// //                      <AlertCircleLucide size={18} color="#b91c1c" />
// //                      <Text style={styles.errorBannerText}>{notificationError}</Text>
// //                       <TouchableOpacity onPress={() => fetchNotificationsData(false)} style={styles.retryIconSmall}>
// //                           <Text style={styles.retryTextSmall}>Réessayer</Text>
// //                       </TouchableOpacity>
// //                  </View>
// //              );
// //         }

// //         // Construire les notifications à afficher
// //         const notificationsToShow = [];
// //         const kycStatus = verificationStatus?.status; // Utiliser le statut du hook useAuth

// //         // 1. Vérification KYC
// //         if (!isVerified || kycStatus === 'pending' || kycStatus === 'rejected') {
// //              let message = "Vérifiez votre identité pour pouvoir réserver.";
// //              let iconColor = "#f59e0b";
// //              if (kycStatus === 'pending') { message = "Votre vérification d'identité est en cours."; iconColor = "#0ea5e9"; }
// //              else if (kycStatus === 'rejected') { message = `Vérification refusée: ${verificationStatus?.rejection_reason || 'Vérifiez vos documents.'}`; iconColor = "#ef4444"; }
// //              notificationsToShow.push(
// //                  <TouchableOpacity key="kyc" style={styles.notificationItem} onPress={() => router.push('/profile/verify')}>
// //                      <UserCheck size={20} color={iconColor} />
// //                      <Text style={styles.notificationText}>{message}</Text>
// //                      <ChevronRight size={18} color="#9ca3af" />
// //                  </TouchableOpacity>
// //              );
// //          }

// //         // 2. Réservations en attente
// //         if (notificationData && notificationData.pendingBookingsCount > 0) {
// //             notificationsToShow.push(
// //                 <TouchableOpacity key="bookings" style={styles.notificationItem} onPress={() => router.push('/(tabs)/bookings')}>
// //                     <Clock size={20} color="#6366f1" />
// //                     <Text style={styles.notificationText}>
// //                         {notificationData.pendingBookingsCount} réservation{notificationData.pendingBookingsCount > 1 ? 's sont' : ' est'} en attente.
// //                     </Text>
// //                     <ChevronRight size={18} color="#9ca3af" />
// //                 </TouchableOpacity>
// //             );
// //         }

// //         // 3. Conversations actives
// //         if (notificationData && notificationData.activeConversationsCount > 0) {
// //             notificationsToShow.push(
// //                 <TouchableOpacity key="messages" style={styles.notificationItem} onPress={() => router.push('/(tabs)/conversations')}>
// //                     <MessageCircle size={20} color="#0891b2" />
// //                     <Text style={styles.notificationText}>
// //                         {notificationData.activeConversationsCount} conversation{notificationData.activeConversationsCount > 1 ? 's' : ''} active{notificationData.activeConversationsCount > 1 ? 's' : ''}.
// //                     </Text>
// //                     <ChevronRight size={18} color="#9ca3af" />
// //                 </TouchableOpacity>
// //             );
// //         }

// //         // Si aucune notification (après chargement), ne rien rendre
// //         if (notificationsToShow.length === 0 && !loadingNotifications) {
// //              return null;
// //         }

// //         // Rendre le conteneur avec les notifications
// //         return (
// //             <View style={styles.notificationContainer}>
// //                 {notificationsToShow}
// //             </View>
// //         );
// //     };


// //     // --- Rendu Principal ---
// //     // Attendre que les fonts ET la session soient initialisées
// //     if (!fontsLoaded || !sessionInitialized || isLoadingAuth) {
// //         // Le SplashScreen devrait être géré par _layout, on affiche un loader ici au cas où
// //         return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
// //     }
// //     if (fontError) {
// //         return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>;
// //     }

// //     // Rendu pour utilisateur non connecté
// //     if (!user) {
// //         return (
// //             <SafeAreaView style={{flex: 1}}>
// //                 {/* Configurer le header si nécessaire via Stack.Screen */}
// //                 {/* <Stack.Screen options={{ title: 'Bienvenue' }} /> */}
// //                 <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
// //                     <View style={styles.header}>
// //                         <View> <Text style={styles.logo}>3ommy</Text><Text style={styles.slogan}>Un plongeon pour tous</Text></View>
// //                         <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
// //                             <LogIn size={20} color="#0891b2" />
// //                             <Text style={styles.loginButtonText}>Connexion</Text>
// //                         </TouchableOpacity>
// //                     </View>
// //                     <View style={styles.heroSection}>
// //                         <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }} style={styles.heroImage} resizeMode="cover"/>
// //                         <View style={styles.overlay} />
// //                         <View style={styles.heroContent}><Text style={styles.heroTitle}>Bienvenue sur 3ommy</Text><Text style={styles.heroSubtitle}>La première plateforme de location de piscines au Maroc</Text></View>
// //                     </View>
// //                     <View style={styles.optionsContainer}>
// //                         <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/search')}>
// //                             <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}><Users size={32} color="#ffffff" /></View>
// //                             <Text style={styles.optionTitle}>Je veux me baigner</Text>
// //                             <Text style={styles.optionDescription}>Trouvez la piscine parfaite</Text>
// //                             <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Recherche par localisation</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Piscines vérifiées</Text></View></View>
// //                         </TouchableOpacity>
// //                         {/* Lien corrigé vers become-host */}
// //                         <TouchableOpacity style={[styles.optionCard, styles.hostCard]} onPress={() => router.push('/(tabs)/become-host')}>
// //                             <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}><School size={32} color="#ffffff" /></View>
// //                             <Text style={styles.optionTitle}>Devenez Hôte</Text>
// //                             <Text style={styles.optionDescription}>Rentabilisez votre piscine en toute sécurité</Text>
// //                             <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Gestion simplifiée</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Assurance incluse</Text></View></View>
// //                         </TouchableOpacity>
// //                     </View>
// //                 </ScrollView>
// //             </SafeAreaView>
// //         );
// //     }

// //     // Rendu pour utilisateur connecté
// //     return (
// //         <SafeAreaView style={styles.container}>
// //              {/* Configurer le header si nécessaire via Stack.Screen */}
// //              {/* <Stack.Screen options={{ title: 'Accueil' }} /> */}
// //             <ScrollView
// //                 contentContainerStyle={styles.contentContainer}
// //                 refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891b2"/> }
// //             >
// //                 {/* Header Connecté */}
// //                 <View style={styles.header}>
// //                     <View> <Text style={styles.logo}>3ommy</Text><Text style={styles.slogan}>Un plongeon pour tous</Text></View>
// //                     <View>
// //                         <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}>
// //                             <Image
// //                                 source={{ uri: user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((user.user_metadata?.full_name || user.email || '?').charAt(0)) + '&background=random&color=fff' }}
// //                                 style={styles.profileAvatar}
// //                             />
// //                         </TouchableOpacity>
// //                          {(!isVerified || verificationStatus?.status === 'pending' || verificationStatus?.status === 'rejected') && (
// //                             <TouchableOpacity
// //                                 style={[styles.verificationBadge, verificationStatus?.status === 'rejected' ? styles.verificationBadgeRejected : verificationStatus?.status === 'pending' ? styles.verificationBadgePending : styles.verificationBadgeNeeded]}
// //                                 onPress={() => router.push('/profile/verify')} >
// //                                 {verificationStatus?.status === 'pending' ? <Clock size={14} color="#ffffff"/> : <AlertCircleLucide size={16} color="#ffffff" />}
// //                             </TouchableOpacity>
// //                          )}
// //                          {isVerified && verificationStatus?.status === 'approved' && (
// //                             <View style={[styles.verificationBadge, styles.verificationBadgeVerified]}>
// //                                 <CheckCircle size={16} color="#ffffff" />
// //                              </View>
// //                          )}
// //                     </View>
// //                 </View>

// //                  {/* Bannière de Notifications */}
// //                  {renderNotificationBanner()}

// //                 {/* Hero Section Connecté */}
// //                 <View style={styles.heroSection}>
// //                      <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }} style={styles.heroImage} resizeMode="cover"/>
// //                      <View style={styles.overlay} />
// //                      <View style={styles.heroContent}>
// //                          <Text style={styles.heroTitle}>Bonjour{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''} !</Text>
// //                          <Text style={styles.heroSubtitle}>Prêt pour un plongeon ?</Text>
// //                      </View>
// //                  </View>

// //                  {/* Options */}
// //                 <View style={styles.optionsContainer}>
// //                     <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/search')}>
// //                         <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}><Users size={32} color="#ffffff" /></View>
// //                         <Text style={styles.optionTitle}>Je veux me baigner</Text>
// //                         <Text style={styles.optionDescription}>Trouvez la piscine parfaite</Text>
// //                         <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Recherche par localisation</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Piscines vérifiées</Text></View></View>
// //                     </TouchableOpacity>
// //                     {/* *** CORRECTION LIEN ET TEXTE ICI (Connecté) *** */}
// //                     <TouchableOpacity style={[styles.optionCard, styles.hostCard]} onPress={() => router.push('/(tabs)/become-host')}>
// //                         <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}><School size={32} color="#ffffff" /></View>
// //                         <Text style={styles.optionTitle}>Devenez Hôte</Text>
// //                         <Text style={styles.optionDescription}>Rentabilisez votre piscine en toute sécurité</Text>
// //                         <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Gestion simplifiée</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Assurance incluse</Text></View></View>
// //                     </TouchableOpacity>
// //                  </View>
// //             </ScrollView>
// //         </SafeAreaView>
// //     );
// // }

// // // --- Styles ---
// // const styles = StyleSheet.create({
// //     container: { flex: 1, backgroundColor: '#f8fafc', },
// //     contentContainer: { flexGrow: 1, paddingBottom: 40, },
// //     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
// //     errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
// //     errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
// //     header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 20 : (Platform.OS === 'ios' ? 50 : 40), paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', },
// //     logo: { fontFamily: 'Montserrat-Bold', fontSize: 28, color: '#0891b2', },
// //     slogan: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginTop: 2, },
// //     loginButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', },
// //     loginButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#0891b2', },
// //     profileButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: '#e0f2fe', borderWidth: 1, borderColor: '#bae6fd', },
// //     profileAvatar: { width: '100%', height: '100%', },
// //     verificationBadge: { position: 'absolute', bottom: -3, right: -3, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ffffff', },
// //     verificationBadgeNeeded: { backgroundColor: '#f59e0b', },
// //     verificationBadgePending: { backgroundColor: '#3b82f6', },
// //     verificationBadgeRejected: { backgroundColor: '#ef4444', },
// //     verificationBadgeVerified: { backgroundColor: '#22c55e', },
// //     heroSection: { height: 200, position: 'relative', },
// //     heroImage: { width: '100%', height: '100%', },
// //     overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 70, 90, 0.4)', },
// //     heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, },
// //     heroTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#ffffff', marginBottom: 4, },
// //     heroSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#ffffff', opacity: 0.9, },
// //     notificationContainer: { marginTop: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.05, shadowRadius: 2.00, elevation: 1, },
// //     notificationContainerLoading: { height: 60, justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, },
// //     notificationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 12, },
// //     notificationText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#334155', flex: 1, lineHeight: 20, },
// //     errorBanner: { backgroundColor: '#fef2f2', borderColor: '#fecaca', paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, },
// //     errorBannerText: { color: '#b91c1c', fontFamily: 'Montserrat-Regular', flex: 1, fontSize: 13, },
// //     retryIconSmall: { padding: 4 },
// //     retryTextSmall: { color: '#b91c1c', fontSize: 13, fontFamily: 'Montserrat-SemiBold', textDecorationLine: 'underline'},
// //     optionsContainer: { padding: 16, gap: 16, },
// //     optionCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, },
// //     hostCard: { borderColor: '#d1fae5', backgroundColor: '#f0fdf4' },
// //     iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 16, },
// //     optionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 6, },
// //     optionDescription: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginBottom: 16, lineHeight: 20 },
// //     features: { gap: 10, },
// //     featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, },
// //     feature: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', },
// //     verificationCard: { backgroundColor: '#fef2f2', marginHorizontal: 16, marginTop: 16, marginBottom: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca', flexDirection: 'row', alignItems: 'center', gap: 12, },
// //     verificationContent: { flex: 1, },
// //     verificationTextContainer: { },
// //     verificationTitle: { fontFamily: 'Montserrat-Bold', fontSize: 15, color: '#991b1b', marginBottom: 4, },
// //     verificationText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#b91c1c', lineHeight: 18, },
// //     retryButton: { backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 15 },
// //     retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
// // });



// // import React, { useState, useEffect, useCallback, useRef } from 'react';
// // import {
// //     View, Text, StyleSheet, Platform, TouchableOpacity, Image, ScrollView,
// //     ActivityIndicator, RefreshControl, SafeAreaView
// // } from 'react-native';
// // import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// // import {
// //     School, Users, MapPin, Shield, LogIn, CircleAlert as AlertCircleLucide,
// //     BellRing, MessageCircle, Clock, CheckCircle, UserCheck, ChevronRight,
// //     Layout as DashboardIcon // Icône pour le tableau de bord
// // } from 'lucide-react-native';
// // import { router, SplashScreen, Stack } from 'expo-router';
// // import { useAuth } from '@/hooks/useAuth';
// // import { supabase } from '@/lib/supabase';

// // // Interface pour les données de notification
// // interface NotificationData {
// //     pendingBookingsCount: number;
// //     activeConversationsCount: number;
// // }

// // export default function HomeScreen() {
// //     // Utilisation du hook useAuth
// //     const { user, verificationStatus, isVerified, isLoading: isLoadingAuth, sessionInitialized, userRoles } = useAuth();
// //     const [refreshing, setRefreshing] = useState(false);

// //     // États pour les notifications
// //     const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
// //     const [loadingNotifications, setLoadingNotifications] = useState(false);
// //     const [notificationError, setNotificationError] = useState<string | null>(null);

// //     // Vérifier si l'utilisateur est un hôte
// //     const isHost = user && userRoles && userRoles.some(role => ['host', 'hostpro'].includes(role));

// //     // Charger les polices
// //     const [fontsLoaded, fontError] = useFonts({
// //         'Montserrat-Bold': Montserrat_700Bold,
// //         'Montserrat-SemiBold': Montserrat_600SemiBold,
// //         'Montserrat-Regular': Montserrat_400Regular,
// //     });

// //     // Ref pour éviter le re-fetch initial après la première fois
// //     const isInitialNotificationFetchDone = useRef(false);

// //     // --- Fonction pour charger les données des notifications ---
// //     const fetchNotificationsData = useCallback(async (isManualRefresh = false) => {
// //         if (!user) {
// //             console.log("fetchNotificationsData: No user, skipping.");
// //             setNotificationData(null); // Reset notifs si pas d'user
// //             return;
// //         }

// //         // Afficher le loader uniquement si ce n'est pas un refresh en arrière-plan
// //         if (!isManualRefresh) {
// //             setLoadingNotifications(true);
// //         }
// //         setNotificationError(null);
// //         console.log("🚀 Fetching notification data for swimmer:", user.id);

// //         try {
// //             const [bookingsResult, conversationsResult] = await Promise.all([
// //                 supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending'),
// //                 supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('swimmer_id', user.id).eq('status', 'open')
// //             ]);

// //             let pendingBookingsCount = notificationData?.pendingBookingsCount ?? 0;
// //             if (bookingsResult.error) { console.warn("Error fetching pending bookings count:", bookingsResult.error.message); }
// //             else { pendingBookingsCount = bookingsResult.count ?? 0; }

// //             let activeConversationsCount = notificationData?.activeConversationsCount ?? 0;
// //             if (conversationsResult.error) { console.warn("Error fetching active conversations count:", conversationsResult.error.message); }
// //             else { activeConversationsCount = conversationsResult.count ?? 0; }

// //             const newData: NotificationData = { pendingBookingsCount, activeConversationsCount };
// //             console.log("✅ Notification data fetched:", newData);
// //             setNotificationData(newData);

// //         } catch (err: any) {
// //             console.error("Unexpected error fetching notification data:", err);
// //             setNotificationError("Erreur de chargement des notifications.");
// //         } finally {
// //             setLoadingNotifications(false);
// //         }
// //     }, [user, notificationData]); // notificationData inclus pour garder l'ancienne valeur en cas d'erreur

// //     // --- Effet principal pour le chargement initial et le SplashScreen ---
// //     useEffect(() => {
// //         const isAppReady = (fontsLoaded || fontError) && sessionInitialized;
// //         console.log(`[HomeScreen Effect] Ready State: fontsLoaded=${!!fontsLoaded}, fontError=${!!fontError}, sessionInitialized=${sessionInitialized} => isAppReady=${isAppReady}`);

// //         if (isAppReady) {
// //             console.log("[HomeScreen Effect] App is ready, hiding SplashScreen.");
// //             SplashScreen.hideAsync().catch(err => console.warn("Error hiding splash screen:", err));

// //             // Charger les notifications seulement si l'utilisateur est chargé et si c'est le premier chargement réussi
// //             if (user && !isInitialNotificationFetchDone.current) {
// //                 console.log("[HomeScreen Effect] User exists and initial fetch not done, fetching notifications.");
// //                 isInitialNotificationFetchDone.current = true;
// //                 fetchNotificationsData(false); // false car ce n'est pas un refresh manuel
// //             } else if (!user) {
// //                  console.log("[HomeScreen Effect] No user after init, resetting notifications.");
// //                  setNotificationData(null); // Reset si pas d'utilisateur
// //                  setLoadingNotifications(false);
// //              } else {
// //                  console.log("[HomeScreen Effect] User exists but initial notification fetch already done or in progress.");
// //              }
// //         }
// //     }, [fontsLoaded, fontError, sessionInitialized, user, fetchNotificationsData]);

// //     // --- Refresh manuel ---
// //     const onRefresh = useCallback(async () => {
// //         setRefreshing(true);
// //         await fetchNotificationsData(true); // true pour indiquer refresh manuel
// //         // Ajoutez ici d'autres fetch si nécessaire pour le reste de la page
// //         setRefreshing(false);
// //     }, [fetchNotificationsData]);

// //     // --- Composant pour afficher les notifications ---
// //     const renderNotificationBanner = () => {
// //         // Ne rien afficher si pas d'utilisateur ou pendant le chargement initial global
// //         if (!user || isLoadingAuth || !fontsLoaded) return null;

// //         // Afficher un état de chargement minimaliste ou rien pendant le chargement des notifs
// //         if (loadingNotifications && !refreshing) {
// //              return <ActivityIndicator style={styles.notificationContainerLoading} />;
// //         }

// //         // Afficher l'erreur de chargement des notifs
// //         if (notificationError && !loadingNotifications) {
// //              return (
// //                  <View style={[styles.notificationContainer, styles.errorBanner]}>
// //                      <AlertCircleLucide size={18} color="#b91c1c" />
// //                      <Text style={styles.errorBannerText}>{notificationError}</Text>
// //                       <TouchableOpacity onPress={() => fetchNotificationsData(false)} style={styles.retryIconSmall}>
// //                           <Text style={styles.retryTextSmall}>Réessayer</Text>
// //                       </TouchableOpacity>
// //                  </View>
// //              );
// //         }

// //         // Construire les notifications à afficher
// //         const notificationsToShow = [];
// //         const kycStatus = verificationStatus?.status; // Utiliser le statut du hook useAuth

// //         // 1. Vérification KYC
// //         if (!isVerified || kycStatus === 'pending' || kycStatus === 'rejected') {
// //              let message = "Vérifiez votre identité pour pouvoir réserver.";
// //              let iconColor = "#f59e0b";
// //              if (kycStatus === 'pending') { message = "Votre vérification d'identité est en cours."; iconColor = "#0ea5e9"; }
// //              else if (kycStatus === 'rejected') { message = `Vérification refusée: ${verificationStatus?.rejection_reason || 'Vérifiez vos documents.'}`; iconColor = "#ef4444"; }
// //              notificationsToShow.push(
// //                  <TouchableOpacity key="kyc" style={styles.notificationItem} onPress={() => router.push('/profile/verify')}>
// //                      <UserCheck size={20} color={iconColor} />
// //                      <Text style={styles.notificationText}>{message}</Text>
// //                      <ChevronRight size={18} color="#9ca3af" />
// //                  </TouchableOpacity>
// //              );
// //          }

// //         // 2. Réservations en attente
// //         if (notificationData && notificationData.pendingBookingsCount > 0) {
// //             notificationsToShow.push(
// //                 <TouchableOpacity key="bookings" style={styles.notificationItem} onPress={() => router.push('/(tabs)/bookings')}>
// //                     <Clock size={20} color="#6366f1" />
// //                     <Text style={styles.notificationText}>
// //                         {notificationData.pendingBookingsCount} réservation{notificationData.pendingBookingsCount > 1 ? 's sont' : ' est'} en attente.
// //                     </Text>
// //                     <ChevronRight size={18} color="#9ca3af" />
// //                 </TouchableOpacity>
// //             );
// //         }

// //         // 3. Conversations actives
// //         if (notificationData && notificationData.activeConversationsCount > 0) {
// //             notificationsToShow.push(
// //                 <TouchableOpacity key="messages" style={styles.notificationItem} onPress={() => router.push('/(tabs)/conversations')}>
// //                     <MessageCircle size={20} color="#0891b2" />
// //                     <Text style={styles.notificationText}>
// //                         {notificationData.activeConversationsCount} conversation{notificationData.activeConversationsCount > 1 ? 's' : ''} active{notificationData.activeConversationsCount > 1 ? 's' : ''}.
// //                     </Text>
// //                     <ChevronRight size={18} color="#9ca3af" />
// //                 </TouchableOpacity>
// //             );
// //         }

// //         // Si aucune notification (après chargement), ne rien rendre
// //         if (notificationsToShow.length === 0 && !loadingNotifications) {
// //              return null;
// //         }

// //         // Rendre le conteneur avec les notifications
// //         return (
// //             <View style={styles.notificationContainer}>
// //                 {notificationsToShow}
// //             </View>
// //         );
// //     };


// //     // --- Rendu Principal ---
// //     // Attendre que les fonts ET la session soient initialisées
// //     if (!fontsLoaded || !sessionInitialized || isLoadingAuth) {
// //         // Le SplashScreen devrait être géré par _layout, on affiche un loader ici au cas où
// //         return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
// //     }
// //     if (fontError) {
// //         return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>;
// //     }

// //     // Rendu pour utilisateur non connecté
// //     if (!user) {
// //         return (
// //             <SafeAreaView style={{flex: 1}}>
// //                 <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
// //                     <View style={styles.header}>
// //                         <View> <Text style={styles.logo}>3ommy</Text><Text style={styles.slogan}>Un plongeon pour tous</Text></View>
// //                         <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
// //                             <LogIn size={20} color="#0891b2" />
// //                             <Text style={styles.loginButtonText}>Connexion</Text>
// //                         </TouchableOpacity>
// //                     </View>
// //                     <View style={styles.heroSection}>
// //                         <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }} style={styles.heroImage} resizeMode="cover"/>
// //                         <View style={styles.overlay} />
// //                         <View style={styles.heroContent}><Text style={styles.heroTitle}>Bienvenue sur 3ommy</Text><Text style={styles.heroSubtitle}>La première plateforme de location de piscines au Maroc</Text></View>
// //                     </View>
// //                     <View style={styles.optionsContainer}>
// //                         <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/search')}>
// //                             <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}><Users size={32} color="#ffffff" /></View>
// //                             <Text style={styles.optionTitle}>Je veux me baigner</Text>
// //                             <Text style={styles.optionDescription}>Trouvez la piscine parfaite</Text>
// //                             <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Recherche par localisation</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Piscines vérifiées</Text></View></View>
// //                         </TouchableOpacity>
// //                         <TouchableOpacity style={[styles.optionCard, styles.hostCard]} onPress={() => router.push('/(tabs)/become-host')}>
// //                             <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}><School size={32} color="#ffffff" /></View>
// //                             <Text style={styles.optionTitle}>Devenez Hôte</Text>
// //                             <Text style={styles.optionDescription}>Rentabilisez votre piscine en toute sécurité</Text>
// //                             <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Gestion simplifiée</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Assurance incluse</Text></View></View>
// //                         </TouchableOpacity>
// //                     </View>
// //                 </ScrollView>
// //             </SafeAreaView>
// //         );
// //     }

// //     // Rendu pour utilisateur connecté
// //     return (
// //         <SafeAreaView style={styles.container}>
// //             <ScrollView
// //                 contentContainerStyle={styles.contentContainer}
// //                 refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891b2"/> }
// //             >
// //                 {/* Header Connecté */}
// //                 <View style={styles.header}>
// //                     <View> <Text style={styles.logo}>3ommy</Text><Text style={styles.slogan}>Un plongeon pour tous</Text></View>
// //                     <View>
// //                         <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}>
// //                             <Image
// //                                 source={{ uri: user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((user.user_metadata?.full_name || user.email || '?').charAt(0)) + '&background=random&color=fff' }}
// //                                 style={styles.profileAvatar}
// //                             />
// //                         </TouchableOpacity>
// //                          {(!isVerified || verificationStatus?.status === 'pending' || verificationStatus?.status === 'rejected') && (
// //                             <TouchableOpacity
// //                                 style={[styles.verificationBadge, verificationStatus?.status === 'rejected' ? styles.verificationBadgeRejected : verificationStatus?.status === 'pending' ? styles.verificationBadgePending : styles.verificationBadgeNeeded]}
// //                                 onPress={() => router.push('/profile/verify')} >
// //                                 {verificationStatus?.status === 'pending' ? <Clock size={14} color="#ffffff"/> : <AlertCircleLucide size={16} color="#ffffff" />}
// //                             </TouchableOpacity>
// //                          )}
// //                          {isVerified && verificationStatus?.status === 'approved' && (
// //                             <View style={[styles.verificationBadge, styles.verificationBadgeVerified]}>
// //                                 <CheckCircle size={16} color="#ffffff" />
// //                              </View>
// //                          )}
// //                     </View>
// //                 </View>

// //                  {/* Bannière de Notifications */}
// //                  {renderNotificationBanner()}

// //                 {/* Hero Section Connecté */}
// //                 <View style={styles.heroSection}>
// //                      <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }} style={styles.heroImage} resizeMode="cover"/>
// //                      <View style={styles.overlay} />
// //                      <View style={styles.heroContent}>
// //                          <Text style={styles.heroTitle}>Bonjour{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''} !</Text>
// //                          <Text style={styles.heroSubtitle}>Prêt pour un plongeon ?</Text>
// //                      </View>
// //                  </View>

// //                  {/* Options */}
// //                 <View style={styles.optionsContainer}>
// //                     <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/search')}>
// //                         <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}><Users size={32} color="#ffffff" /></View>
// //                         <Text style={styles.optionTitle}>Je veux me baigner</Text>
// //                         <Text style={styles.optionDescription}>Trouvez la piscine parfaite</Text>
// //                         <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Recherche par localisation</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Piscines vérifiées</Text></View></View>
// //                     </TouchableOpacity>
                    
// //                     {/* Carte conditionnelle selon le statut d'hôte */}
// //                     {isHost ? (
// //                         // Option pour accéder au tableau de bord (pour hôtes)
// //                         <TouchableOpacity style={[styles.optionCard, styles.dashboardCard]} onPress={() => router.push('/(tabs)/host/dashboard')}>
// //                             <View style={[styles.iconCircle, { backgroundColor: '#0d9488' }]}><DashboardIcon size={32} color="#ffffff" /></View>
// //                             <Text style={styles.optionTitle}>Accéder à mon tableau de bord</Text>
// //                             <Text style={styles.optionDescription}>Gérez vos piscines et réservations</Text>
// //                             <View style={styles.features}>
// //                                 <View style={styles.featureRow}><Clock size={16} color="#64748b" /><Text style={styles.feature}>Suivi des réservations</Text></View>
// //                                 <View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Gestion des disponibilités</Text></View>
// //                             </View>
// //                         </TouchableOpacity>
// //                     ) : (
// //                         // Option pour devenir hôte (pour non-hôtes)
// //                         <TouchableOpacity style={[styles.optionCard, styles.hostCard]} onPress={() => router.push('/(tabs)/become-host')}>
// //                             <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}><School size={32} color="#ffffff" /></View>
// //                             <Text style={styles.optionTitle}>Devenez Hôte</Text>
// //                             <Text style={styles.optionDescription}>Rentabilisez votre piscine en toute sécurité</Text>
// //                             <View style={styles.features}>
// //                                 <View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Gestion simplifiée</Text></View>
// //                                 <View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Assurance incluse</Text></View>
// //                             </View>
// //                         </TouchableOpacity>
// //                     )}
// //                  </View>
// //             </ScrollView>
// //         </SafeAreaView>
// //     );
// // }

// // // --- Styles ---
// // const styles = StyleSheet.create({
// //     container: { flex: 1, backgroundColor: '#f8fafc', },
// //     contentContainer: { flexGrow: 1, paddingBottom: 40, },
// //     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
// //     errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
// //     errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
// //     header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 20 : (Platform.OS === 'ios' ? 50 : 40), paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', },
// //     logo: { fontFamily: 'Montserrat-Bold', fontSize: 28, color: '#0891b2', },
// //     slogan: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginTop: 2, },
// //     loginButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', },
// //     loginButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#0891b2', },
// //     profileButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: '#e0f2fe', borderWidth: 1, borderColor: '#bae6fd', },
// //     profileAvatar: { width: '100%', height: '100%', },
// //     verificationBadge: { position: 'absolute', bottom: -3, right: -3, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ffffff', },
// //     verificationBadgeNeeded: { backgroundColor: '#f59e0b', },
// //     verificationBadgePending: { backgroundColor: '#3b82f6', },
// //     verificationBadgeRejected: { backgroundColor: '#ef4444', },
// //     verificationBadgeVerified: { backgroundColor: '#22c55e', },
// //     heroSection: { height: 200, position: 'relative', },
// //     heroImage: { width: '100%', height: '100%', },
// //     overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 70, 90, 0.4)', },
// //     heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, },
// //     heroTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#ffffff', marginBottom: 4, },
// //     heroSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#ffffff', opacity: 0.9, },
// //     notificationContainer: { marginTop: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.05, shadowRadius: 2.00, elevation: 1, },
// //     notificationContainerLoading: { height: 60, justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, },
// //     notificationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 12, },
// //     notificationText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#334155', flex: 1, lineHeight: 20, },
// //     errorBanner: { backgroundColor: '#fef2f2', borderColor: '#fecaca', paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, },
// //     errorBannerText: { color: '#b91c1c', fontFamily: 'Montserrat-Regular', flex: 1, fontSize: 13, },
// //     retryIconSmall: { padding: 4 },
// //     retryTextSmall: { color: '#b91c1c', fontSize: 13, fontFamily: 'Montserrat-SemiBold', textDecorationLine: 'underline'},
// //     optionsContainer: { padding: 16, gap: 16, },
// //     optionCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, },
// //     hostCard: { borderColor: '#d1fae5', backgroundColor: '#f0fdf4' },
// //     dashboardCard: { borderColor: '#ccfbf1', backgroundColor: '#f0fdfa' }, // Nouveau style pour la carte de tableau de bord
// //     iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 16, },
// //     optionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 6, },
// //     optionDescription: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginBottom: 16, lineHeight: 20 },
// //     features: { gap: 10, },
// //     featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, },
// //     feature: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', },
// //     verificationCard: { backgroundColor: '#fef2f2', marginHorizontal: 16, marginTop: 16, marginBottom: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca', flexDirection: 'row', alignItems: 'center', gap: 12, },
// //     verificationContent: { flex: 1, },
// //     verificationTextContainer: { },
// //     verificationTitle: { fontFamily: 'Montserrat-Bold', fontSize: 15, color: '#991b1b', marginBottom: 4, },
// //     verificationText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#b91c1c', lineHeight: 18, },
// //     retryButton: { backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 15 },
// //     retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
// // });



// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import {
//     View, Text, StyleSheet, Platform, TouchableOpacity, Image, ScrollView,
//     ActivityIndicator, RefreshControl, SafeAreaView
// } from 'react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import {
//     School, Users, MapPin, Shield, LogIn, CircleAlert as AlertCircleLucide,
//     BellRing, MessageCircle, Clock, CheckCircle, UserCheck, ChevronRight,
//     Layout as DashboardIcon // Icône pour le tableau de bord
// } from 'lucide-react-native';
// import { router, SplashScreen, Stack } from 'expo-router';
// import { useAuth } from '@/hooks/useAuth';
// import { supabase } from '@/lib/supabase';

// // Interface pour les données de notification
// interface NotificationData {
//     pendingBookingsCount: number;
//     activeConversationsCount: number;
// }

// export default function HomeScreen() {
//     // Utilisation du hook useAuth
//     const { user, verificationStatus, isVerified, isLoading: isLoadingAuth, sessionInitialized, userRoles } = useAuth();
//     const [refreshing, setRefreshing] = useState(false);

//     // États pour les notifications
//     const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
//     const [loadingNotifications, setLoadingNotifications] = useState(false);
//     const [notificationError, setNotificationError] = useState<string | null>(null);

//     // Vérifier si l'utilisateur est un hôte
//     const isHost = user && userRoles && userRoles.some(role => ['host', 'hostpro'].includes(role));

//     // Charger les polices
//     const [fontsLoaded, fontError] = useFonts({
//         'Montserrat-Bold': Montserrat_700Bold,
//         'Montserrat-SemiBold': Montserrat_600SemiBold,
//         'Montserrat-Regular': Montserrat_400Regular,
//     });

//     // Ref pour éviter le re-fetch initial après la première fois
//     const isInitialNotificationFetchDone = useRef(false);

//     // --- Fonction pour charger les données des notifications ---
//     const fetchNotificationsData = useCallback(async (isManualRefresh = false) => {
//         if (!user) {
//             console.log("fetchNotificationsData: No user, skipping.");
//             setNotificationData(null); // Reset notifs si pas d'user
//             return;
//         }

//         // Afficher le loader uniquement si ce n'est pas un refresh en arrière-plan
//         if (!isManualRefresh) {
//             setLoadingNotifications(true);
//         }
//         setNotificationError(null);
        
//         try {
//             let pendingBookingsCount = 0;
//             let activeConversationsCount = 0;
            
//             // Si l'utilisateur est un hôte
//             if (isHost) {
//                 console.log("🚀 Fetching notification data for host:", user.id);
                
//                 // Récupérer les piscines appartenant à l'hôte
//                 const { data: userPools, error: poolsError } = await supabase
//                     .from('pools')
//                     .select('id')
//                     .eq('owner_id', user.id);
                    
//                 if (poolsError) {
//                     console.warn("Error fetching host pools:", poolsError.message);
//                 } else if (userPools && userPools.length > 0) {
//                     // Obtenir les IDs des piscines
//                     const poolIds = userPools.map(pool => pool.id);
                    
//                     // Rechercher les réservations en attente pour ces piscines
//                     const { count: pendingCount, error: bookingsError } = await supabase
//                         .from('bookings')
//                         .select('id', { count: 'exact', head: true })
//                         .in('pool_id', poolIds)
//                         .eq('status', 'pending');
                        
//                     if (bookingsError) {
//                         console.warn("Error fetching pending bookings for host:", bookingsError.message);
//                     } else {
//                         pendingBookingsCount = pendingCount || 0;
//                     }
                    
//                     // Rechercher les conversations actives où l'utilisateur est l'hôte
//                     const { count: convoCount, error: convoError } = await supabase
//                         .from('conversations')
//                         .select('id', { count: 'exact', head: true })
//                         .eq('host_id', user.id)
//                         .eq('status', 'open');
                        
//                     if (convoError) {
//                         console.warn("Error fetching active conversations for host:", convoError.message);
//                     } else {
//                         activeConversationsCount = convoCount || 0;
//                     }
//                 }
//             } 
//             // Si l'utilisateur est un nageur
//             else {
//                 console.log("🚀 Fetching notification data for swimmer:", user.id);
                
//                 // Requêtes existantes pour les nageurs
//                 const [bookingsResult, conversationsResult] = await Promise.all([
//                     supabase.from('bookings').select('id', { count: 'exact', head: true })
//                         .eq('user_id', user.id)
//                         .eq('status', 'pending'),
//                     supabase.from('conversations').select('id', { count: 'exact', head: true })
//                         .eq('swimmer_id', user.id)
//                         .eq('status', 'open')
//                 ]);

//                 if (bookingsResult.error) {
//                     console.warn("Error fetching pending bookings for swimmer:", bookingsResult.error.message);
//                 } else {
//                     pendingBookingsCount = bookingsResult.count || 0;
//                 }

//                 if (conversationsResult.error) {
//                     console.warn("Error fetching active conversations for swimmer:", conversationsResult.error.message);
//                 } else {
//                     activeConversationsCount = conversationsResult.count || 0;
//                 }
//             }

//             const newData = { pendingBookingsCount, activeConversationsCount };
//             console.log("✅ Notification data fetched:", newData);
//             setNotificationData(newData);

//         } catch (err: any) {
//             console.error("Unexpected error fetching notification data:", err);
//             setNotificationError("Erreur de chargement des notifications.");
//         } finally {
//             setLoadingNotifications(false);
//         }
//     }, [user, isHost]); // Ajout de isHost comme dépendance

//     // --- Effet principal pour le chargement initial et le SplashScreen ---
//     useEffect(() => {
//         const isAppReady = (fontsLoaded || fontError) && sessionInitialized;
//         console.log(`[HomeScreen Effect] Ready State: fontsLoaded=${!!fontsLoaded}, fontError=${!!fontError}, sessionInitialized=${sessionInitialized} => isAppReady=${isAppReady}`);

//         if (isAppReady) {
//             console.log("[HomeScreen Effect] App is ready, hiding SplashScreen.");
//             SplashScreen.hideAsync().catch(err => console.warn("Error hiding splash screen:", err));

//             // Charger les notifications seulement si l'utilisateur est chargé et si c'est le premier chargement réussi
//             if (user && !isInitialNotificationFetchDone.current) {
//                 console.log("[HomeScreen Effect] User exists and initial fetch not done, fetching notifications.");
//                 isInitialNotificationFetchDone.current = true;
//                 fetchNotificationsData(false); // false car ce n'est pas un refresh manuel
//             } else if (!user) {
//                  console.log("[HomeScreen Effect] No user after init, resetting notifications.");
//                  setNotificationData(null); // Reset si pas d'utilisateur
//                  setLoadingNotifications(false);
//              } else {
//                  console.log("[HomeScreen Effect] User exists but initial notification fetch already done or in progress.");
//              }
//         }
//     }, [fontsLoaded, fontError, sessionInitialized, user, fetchNotificationsData]);

//     // --- Refresh manuel ---
//     const onRefresh = useCallback(async () => {
//         setRefreshing(true);
//         await fetchNotificationsData(true); // true pour indiquer refresh manuel
//         // Ajoutez ici d'autres fetch si nécessaire pour le reste de la page
//         setRefreshing(false);
//     }, [fetchNotificationsData]);

//     // --- Composant pour afficher les notifications ---
//     const renderNotificationBanner = () => {
//         // Ne rien afficher si pas d'utilisateur ou pendant le chargement initial global
//         if (!user || isLoadingAuth || !fontsLoaded) return null;

//         // Afficher un état de chargement minimaliste ou rien pendant le chargement des notifs
//         if (loadingNotifications && !refreshing) {
//              return <ActivityIndicator style={styles.notificationContainerLoading} />;
//         }

//         // Afficher l'erreur de chargement des notifs
//         if (notificationError && !loadingNotifications) {
//              return (
//                  <View style={[styles.notificationContainer, styles.errorBanner]}>
//                      <AlertCircleLucide size={18} color="#b91c1c" />
//                      <Text style={styles.errorBannerText}>{notificationError}</Text>
//                       <TouchableOpacity onPress={() => fetchNotificationsData(false)} style={styles.retryIconSmall}>
//                           <Text style={styles.retryTextSmall}>Réessayer</Text>
//                       </TouchableOpacity>
//                  </View>
//              );
//         }

//         // Construire les notifications à afficher
//         const notificationsToShow = [];
//         const kycStatus = verificationStatus?.status; // Utiliser le statut du hook useAuth

//         // 1. Vérification KYC
//         if (!isVerified || kycStatus === 'pending' || kycStatus === 'rejected') {
//              let message = "Vérifiez votre identité pour pouvoir réserver.";
//              let iconColor = "#f59e0b";
//              if (kycStatus === 'pending') { message = "Votre vérification d'identité est en cours."; iconColor = "#0ea5e9"; }
//              else if (kycStatus === 'rejected') { message = `Vérification refusée: ${verificationStatus?.rejection_reason || 'Vérifiez vos documents.'}`; iconColor = "#ef4444"; }
//              notificationsToShow.push(
//                  <TouchableOpacity key="kyc" style={styles.notificationItem} onPress={() => router.push('/profile/verify')}>
//                      <UserCheck size={20} color={iconColor} />
//                      <Text style={styles.notificationText}>{message}</Text>
//                      <ChevronRight size={18} color="#9ca3af" />
//                  </TouchableOpacity>
//              );
//          }

//         // 2. Réservations en attente
//         if (notificationData && notificationData.pendingBookingsCount > 0) {
//             notificationsToShow.push(
//                 <TouchableOpacity 
//                     key="bookings" 
//                     style={styles.notificationItem} 
//                     onPress={() => {
//                         // Si c'est un hôte, rediriger vers l'espace hôte
//                         if (isHost) {
//                             router.push('/(tabs)/host/(dashboard)/bookings');
//                         } else {
//                             router.push('/(tabs)/bookings');
//                         }
//                     }}
//                 >
//                     <Clock size={20} color="#6366f1" />
//                     <Text style={styles.notificationText}>
//                         {notificationData.pendingBookingsCount} réservation{notificationData.pendingBookingsCount > 1 ? 's sont' : ' est'} en attente.
//                     </Text>
//                     <ChevronRight size={18} color="#9ca3af" />
//                 </TouchableOpacity>
//             );
//         }

//         // 3. Conversations actives
//         if (notificationData && notificationData.activeConversationsCount > 0) {
//             notificationsToShow.push(
//                 <TouchableOpacity key="messages" style={styles.notificationItem} onPress={() => router.push('/(tabs)/conversations')}>
//                     <MessageCircle size={20} color="#0891b2" />
//                     <Text style={styles.notificationText}>
//                         {notificationData.activeConversationsCount} conversation{notificationData.activeConversationsCount > 1 ? 's' : ''} active{notificationData.activeConversationsCount > 1 ? 's' : ''}.
//                     </Text>
//                     <ChevronRight size={18} color="#9ca3af" />
//                 </TouchableOpacity>
//             );
//         }

//         // Si aucune notification (après chargement), ne rien rendre
//         if (notificationsToShow.length === 0 && !loadingNotifications) {
//              return null;
//         }

//         // Rendre le conteneur avec les notifications
//         return (
//             <View style={styles.notificationContainer}>
//                 {notificationsToShow}
//             </View>
//         );
//     };


//     // --- Rendu Principal ---
//     // Attendre que les fonts ET la session soient initialisées
//     if (!fontsLoaded || !sessionInitialized || isLoadingAuth) {
//         // Le SplashScreen devrait être géré par _layout, on affiche un loader ici au cas où
//         return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
//     }
//     if (fontError) {
//         return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>;
//     }

//     // Rendu pour utilisateur non connecté
//     if (!user) {
//         return (
//             <SafeAreaView style={{flex: 1}}>
//                 <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
//                     <View style={styles.header}>
//                         <View> <Text style={styles.logo}>3ommy</Text><Text style={styles.slogan}>Un plongeon pour tous</Text></View>
//                         <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
//                             <LogIn size={20} color="#0891b2" />
//                             <Text style={styles.loginButtonText}>Connexion</Text>
//                         </TouchableOpacity>
//                     </View>
//                     <View style={styles.heroSection}>
//                         <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }} style={styles.heroImage} resizeMode="cover"/>
//                         <View style={styles.overlay} />
//                         <View style={styles.heroContent}><Text style={styles.heroTitle}>Bienvenue sur 3ommy</Text><Text style={styles.heroSubtitle}>La première plateforme de location de piscines au Maroc</Text></View>
//                     </View>
//                     <View style={styles.optionsContainer}>
//                         <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/search')}>
//                             <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}><Users size={32} color="#ffffff" /></View>
//                             <Text style={styles.optionTitle}>Je veux me baigner</Text>
//                             <Text style={styles.optionDescription}>Trouvez la piscine parfaite</Text>
//                             <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Recherche par localisation</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Piscines vérifiées</Text></View></View>
//                         </TouchableOpacity>
//                         <TouchableOpacity style={[styles.optionCard, styles.hostCard]} onPress={() => router.push('/(tabs)/become-host')}>
//                             <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}><School size={32} color="#ffffff" /></View>
//                             <Text style={styles.optionTitle}>Devenez Hôte</Text>
//                             <Text style={styles.optionDescription}>Rentabilisez votre piscine en toute sécurité</Text>
//                             <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Gestion simplifiée</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Assurance incluse</Text></View></View>
//                         </TouchableOpacity>
//                     </View>
//                 </ScrollView>
//             </SafeAreaView>
//         );
//     }

//     // Rendu pour utilisateur connecté
//     return (
//         <SafeAreaView style={styles.container}>
//             <ScrollView
//                 contentContainerStyle={styles.contentContainer}
//                 refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891b2"/> }
//             >
//                 {/* Header Connecté */}
//                 <View style={styles.header}>
//                     <View> <Text style={styles.logo}>3ommy</Text><Text style={styles.slogan}>Un plongeon pour tous</Text></View>
//                     <View>
//                         <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}>
//                             <Image
//                                 source={{ uri: user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((user.user_metadata?.full_name || user.email || '?').charAt(0)) + '&background=random&color=fff' }}
//                                 style={styles.profileAvatar}
//                             />
//                         </TouchableOpacity>
//                          {(!isVerified || verificationStatus?.status === 'pending' || verificationStatus?.status === 'rejected') && (
//                             <TouchableOpacity
//                                 style={[styles.verificationBadge, verificationStatus?.status === 'rejected' ? styles.verificationBadgeRejected : verificationStatus?.status === 'pending' ? styles.verificationBadgePending : styles.verificationBadgeNeeded]}
//                                 onPress={() => router.push('/profile/verify')} >
//                                 {verificationStatus?.status === 'pending' ? <Clock size={14} color="#ffffff"/> : <AlertCircleLucide size={16} color="#ffffff" />}
//                             </TouchableOpacity>
//                          )}
//                          {isVerified && verificationStatus?.status === 'approved' && (
//                             <View style={[styles.verificationBadge, styles.verificationBadgeVerified]}>
//                                 <CheckCircle size={16} color="#ffffff" />
//                              </View>
//                          )}
//                     </View>
//                 </View>

//                  {/* Bannière de Notifications */}
//                  {renderNotificationBanner()}

//                 {/* Hero Section Connecté */}
//                 <View style={styles.heroSection}>
//                      <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }} style={styles.heroImage} resizeMode="cover"/>
//                      <View style={styles.overlay} />
//                      <View style={styles.heroContent}>
//                          <Text style={styles.heroTitle}>Bonjour{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''} !</Text>
//                          <Text style={styles.heroSubtitle}>Prêt pour un plongeon ?</Text>
//                      </View>
//                  </View>

//                  {/* Options */}
//                 <View style={styles.optionsContainer}>
//                     <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/search')}>
//                         <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}><Users size={32} color="#ffffff" /></View>
//                         <Text style={styles.optionTitle}>Je veux me baigner</Text>
//                         <Text style={styles.optionDescription}>Trouvez la piscine parfaite</Text>
//                         <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Recherche par localisation</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Piscines vérifiées</Text></View></View>
//                     </TouchableOpacity>
                    
//                     {/* Carte conditionnelle selon le statut d'hôte */}
//                     {isHost ? (
//                         // Option pour accéder au tableau de bord (pour hôtes)
//                         <TouchableOpacity style={[styles.optionCard, styles.dashboardCard]} onPress={() => router.push('/(tabs)/host/dashboard')}>
//                             <View style={[styles.iconCircle, { backgroundColor: '#0d9488' }]}><DashboardIcon size={32} color="#ffffff" /></View>
//                             <Text style={styles.optionTitle}>Accéder à mon tableau de bord</Text>
//                             <Text style={styles.optionDescription}>Gérez vos piscines et réservations</Text>
//                             <View style={styles.features}>
//                                 <View style={styles.featureRow}><Clock size={16} color="#64748b" /><Text style={styles.feature}>Suivi des réservations</Text></View>
//                                 <View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Gestion des disponibilités</Text></View>
//                             </View>
//                         </TouchableOpacity>
//                     ) : (
//                         // Option pour devenir hôte (pour non-hôtes)
//                         <TouchableOpacity style={[styles.optionCard, styles.hostCard]} onPress={() => router.push('/(tabs)/become-host')}>
//                             <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}><School size={32} color="#ffffff" /></View>
//                             <Text style={styles.optionTitle}>Devenez Hôte</Text>
//                             <Text style={styles.optionDescription}>Rentabilisez votre piscine en toute sécurité</Text>
//                             <View style={styles.features}>
//                                 <View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Gestion simplifiée</Text></View>
//                                 <View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Assurance incluse</Text></View>
//                             </View>
//                         </TouchableOpacity>
//                     )}
//                  </View>
//             </ScrollView>
//         </SafeAreaView>
//     );
// }

// // --- Styles ---
// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#f8fafc', },
//     contentContainer: { flexGrow: 1, paddingBottom: 40, },
//     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
//     errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//     errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
//     header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 20 : (Platform.OS === 'ios' ? 50 : 40), paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', },
//     logo: { fontFamily: 'Montserrat-Bold', fontSize: 28, color: '#0891b2', },
//     slogan: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginTop: 2, },
//     loginButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', },
//     loginButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#0891b2', },
//     profileButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: '#e0f2fe', borderWidth: 1, borderColor: '#bae6fd', },
//     profileAvatar: { width: '100%', height: '100%', },
//     verificationBadge: { position: 'absolute', bottom: -3, right: -3, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ffffff', },
//     verificationBadgeNeeded: { backgroundColor: '#f59e0b', },
//     verificationBadgePending: { backgroundColor: '#3b82f6', },
//     verificationBadgeRejected: { backgroundColor: '#ef4444', },
//     verificationBadgeVerified: { backgroundColor: '#22c55e', },
//     heroSection: { height: 200, position: 'relative', },
//     heroImage: { width: '100%', height: '100%', },
//     overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 70, 90, 0.4)', },
//     heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, },
//     heroTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#ffffff', marginBottom: 4, },
//     heroSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#ffffff', opacity: 0.9, },
//     notificationContainer: { marginTop: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.05, shadowRadius: 2.00, elevation: 1, },
//     notificationContainerLoading: { height: 60, justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, },
//     notificationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 12, },
//     notificationText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#334155', flex: 1, lineHeight: 20, },
//     errorBanner: { backgroundColor: '#fef2f2', borderColor: '#fecaca', paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, },
//     errorBannerText: { color: '#b91c1c', fontFamily: 'Montserrat-Regular', flex: 1, fontSize: 13, },
//     retryIconSmall: { padding: 4 },
//     retryTextSmall: { color: '#b91c1c', fontSize: 13, fontFamily: 'Montserrat-SemiBold', textDecorationLine: 'underline'},
//     optionsContainer: { padding: 16, gap: 16, },
//     optionCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, },
//     hostCard: { borderColor: '#d1fae5', backgroundColor: '#f0fdf4' },
//     dashboardCard: { borderColor: '#ccfbf1', backgroundColor: '#f0fdfa' }, // Nouveau style pour la carte de tableau de bord
//     iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 16, },
//     optionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 6, },
//     optionDescription: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginBottom: 16, lineHeight: 20 },
//     features: { gap: 10, },
//     featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, },
//     feature: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', },
//     verificationCard: { backgroundColor: '#fef2f2', marginHorizontal: 16, marginTop: 16, marginBottom: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca', flexDirection: 'row', alignItems: 'center', gap: 12, },
//     verificationContent: { flex: 1, },
//     verificationTextContainer: { },
//     verificationTitle: { fontFamily: 'Montserrat-Bold', fontSize: 15, color: '#991b1b', marginBottom: 4, },
//     verificationText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#b91c1c', lineHeight: 18, },
//     retryButton: { backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 15 },
//     retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
// });


import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, Platform, TouchableOpacity, Image, ScrollView,
    ActivityIndicator, RefreshControl, SafeAreaView
} from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import {
    School, Users, MapPin, Shield, LogIn, CircleAlert as AlertCircleLucide,
    BellRing, MessageCircle, Clock, CheckCircle, UserCheck, ChevronRight,
    Layout as DashboardIcon, Banknote // Ajout de Banknote
} from 'lucide-react-native';
import { router, SplashScreen, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// Interface pour les données de notification
interface NotificationData {
    pendingBookingsCount: number;
    activeConversationsCount: number;
    // Nouvelles propriétés pour les annonces
    pendingListingsCount?: number;
    rejectedListingsCount?: number;
    recentlyApprovedListingsCount?: number;
    firstPendingListing?: any;
    firstRejectedListing?: any;
    firstApprovedListing?: any;
    bankAccountMissing?: boolean;
}

export default function HomeScreen() {
    // Utilisation du hook useAuth
    const { user, verificationStatus, isVerified, isLoading: isLoadingAuth, sessionInitialized, userRoles } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    // États pour les notifications
    const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [notificationError, setNotificationError] = useState<string | null>(null);

    // Vérifier si l'utilisateur est un hôte
    const isHost = user && userRoles && userRoles.some(role => ['host', 'hostpro'].includes(role));

    // Charger les polices
    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // Ref pour éviter le re-fetch initial après la première fois
    const isInitialNotificationFetchDone = useRef(false);

    // --- Fonction pour charger les données des notifications ---
    const fetchNotificationsData = useCallback(async (isManualRefresh = false) => {
        if (!user) {
            console.log("fetchNotificationsData: No user, skipping.");
            setNotificationData(null); // Reset notifs si pas d'user
            return;
        }

        // Afficher le loader uniquement si ce n'est pas un refresh en arrière-plan
        if (!isManualRefresh) {
            setLoadingNotifications(true);
        }
        setNotificationError(null);
        
        try {
            let pendingBookingsCount = 0;
            let activeConversationsCount = 0;
            
            // Si l'utilisateur est un hôte
            if (isHost) {
                console.log("🚀 Fetching notification data for host:", user.id);
                
                // Récupérer les piscines appartenant à l'hôte
                const { data: userPools, error: poolsError } = await supabase
                    .from('pools')
                    .select('id')
                    .eq('owner_id', user.id);
                    
                if (poolsError) {
                    console.warn("Error fetching host pools:", poolsError.message);
                } else if (userPools && userPools.length > 0) {
                    // Obtenir les IDs des piscines
                    const poolIds = userPools.map(pool => pool.id);
                    
                    // Rechercher les réservations en attente pour ces piscines
                    const { count: pendingCount, error: bookingsError } = await supabase
                        .from('bookings')
                        .select('id', { count: 'exact', head: true })
                        .in('pool_id', poolIds)
                        .eq('status', 'pending');
                        
                    if (bookingsError) {
                        console.warn("Error fetching pending bookings for host:", bookingsError.message);
                    } else {
                        pendingBookingsCount = pendingCount || 0;
                    }
                    
                    // Rechercher les conversations actives où l'utilisateur est l'hôte
                    const { count: convoCount, error: convoError } = await supabase
                        .from('conversations')
                        .select('id', { count: 'exact', head: true })
                        .eq('host_id', user.id)
                        .eq('status', 'open');
                        
                    if (convoError) {
                        console.warn("Error fetching active conversations for host:", convoError.message);
                    } else {
                        activeConversationsCount = convoCount || 0;
                    }
                }

                // === AJOUT: Vérifications pour les annonces ===
                // Rechercher les annonces en attente, rejetées ou récemment approuvées
                const { data: hostListings, error: listingsError } = await supabase
                    .from('pool_listings')
                    .select('id, title, status, rejection_reason, updated_at')
                    .eq('owner_id', user.id)
                    .in('status', ['pending', 'rejected', 'approved'])
                    .order('updated_at', { ascending: false });

                if (listingsError) {
                    console.warn("Error fetching host listings:", listingsError.message);
                } else if (hostListings && hostListings.length > 0) {
                    const pendingListings = hostListings.filter(listing => listing.status === 'pending');
                    const rejectedListings = hostListings.filter(listing => listing.status === 'rejected');
                    
                    // Vérifier si l'annonce a été approuvée récemment (dernières 24h)
                    const recentlyApprovedListings = hostListings.filter(listing => {
                        return listing.status === 'approved' && 
                               new Date(listing.updated_at) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                    });
                    
                    // Mettre à jour les données de notification
                    pendingBookingsCount = pendingBookingsCount || 0;
                    activeConversationsCount = activeConversationsCount || 0;
                    
                    setNotificationData(prevData => ({
                        pendingBookingsCount: pendingBookingsCount,
                        activeConversationsCount: activeConversationsCount,
                        pendingListingsCount: pendingListings.length,
                        rejectedListingsCount: rejectedListings.length,
                        recentlyApprovedListingsCount: recentlyApprovedListings.length,
                        firstPendingListing: pendingListings[0] || null,
                        firstRejectedListing: rejectedListings[0] || null,
                        firstApprovedListing: recentlyApprovedListings[0] || null,
                        ...(prevData || {})
                    }));
                }

                // === AJOUT: Vérifications pour les coordonnées bancaires ===
                const { data: bankAccount, error: bankError } = await supabase
                    .from('host_bank_accounts')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();
                    
                if (!bankError) {
                    setNotificationData(prevData => ({
                        ...(prevData || {}),
                        pendingBookingsCount: pendingBookingsCount,
                        activeConversationsCount: activeConversationsCount,
                        bankAccountMissing: !bankAccount
                    }));
                }
            } 
            // Si l'utilisateur est un nageur
            else {
                console.log("🚀 Fetching notification data for swimmer:", user.id);
                
                // Requêtes existantes pour les nageurs
                const [bookingsResult, conversationsResult] = await Promise.all([
                    supabase.from('bookings').select('id', { count: 'exact', head: true })
                        .eq('user_id', user.id)
                        .eq('status', 'pending'),
                    supabase.from('conversations').select('id', { count: 'exact', head: true })
                        .eq('swimmer_id', user.id)
                        .eq('status', 'open')
                ]);

                if (bookingsResult.error) {
                    console.warn("Error fetching pending bookings for swimmer:", bookingsResult.error.message);
                } else {
                    pendingBookingsCount = bookingsResult.count || 0;
                }

                if (conversationsResult.error) {
                    console.warn("Error fetching active conversations for swimmer:", conversationsResult.error.message);
                } else {
                    activeConversationsCount = conversationsResult.count || 0;
                }
                
                // Mettre à jour les données des notifications pour un nageur
                setNotificationData({
                    pendingBookingsCount,
                    activeConversationsCount
                });
            }

        } catch (err: any) {
            console.error("Unexpected error fetching notification data:", err);
            setNotificationError("Erreur de chargement des notifications.");
        } finally {
            setLoadingNotifications(false);
        }
    }, [user, isHost]); // Ajout de isHost comme dépendance

    // --- Effet principal pour le chargement initial et le SplashScreen ---
    useEffect(() => {
        const isAppReady = (fontsLoaded || fontError) && sessionInitialized;
        console.log(`[HomeScreen Effect] Ready State: fontsLoaded=${!!fontsLoaded}, fontError=${!!fontError}, sessionInitialized=${sessionInitialized} => isAppReady=${isAppReady}`);

        if (isAppReady) {
            console.log("[HomeScreen Effect] App is ready, hiding SplashScreen.");
            SplashScreen.hideAsync().catch(err => console.warn("Error hiding splash screen:", err));

            // Charger les notifications seulement si l'utilisateur est chargé et si c'est le premier chargement réussi
            if (user && !isInitialNotificationFetchDone.current) {
                console.log("[HomeScreen Effect] User exists and initial fetch not done, fetching notifications.");
                isInitialNotificationFetchDone.current = true;
                fetchNotificationsData(false); // false car ce n'est pas un refresh manuel
            } else if (!user) {
                 console.log("[HomeScreen Effect] No user after init, resetting notifications.");
                 setNotificationData(null); // Reset si pas d'utilisateur
                 setLoadingNotifications(false);
             } else {
                 console.log("[HomeScreen Effect] User exists but initial notification fetch already done or in progress.");
             }
        }
    }, [fontsLoaded, fontError, sessionInitialized, user, fetchNotificationsData]);

    // --- Refresh manuel ---
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchNotificationsData(true); // true pour indiquer refresh manuel
        // Ajoutez ici d'autres fetch si nécessaire pour le reste de la page
        setRefreshing(false);
    }, [fetchNotificationsData]);

    // --- Composant pour afficher les notifications ---
    const renderNotificationBanner = () => {
        // Ne rien afficher si pas d'utilisateur ou pendant le chargement initial global
        if (!user || isLoadingAuth || !fontsLoaded) return null;

        // Afficher un état de chargement minimaliste ou rien pendant le chargement des notifs
        if (loadingNotifications && !refreshing) {
             return <ActivityIndicator style={styles.notificationContainerLoading} />;
        }

        // Afficher l'erreur de chargement des notifs
        if (notificationError && !loadingNotifications) {
             return (
                 <View style={[styles.notificationContainer, styles.errorBanner]}>
                     <AlertCircleLucide size={18} color="#b91c1c" />
                     <Text style={styles.errorBannerText}>{notificationError}</Text>
                      <TouchableOpacity onPress={() => fetchNotificationsData(false)} style={styles.retryIconSmall}>
                          <Text style={styles.retryTextSmall}>Réessayer</Text>
                      </TouchableOpacity>
                 </View>
             );
        }

        // Construire les notifications à afficher
        const notificationsToShow = [];
        const kycStatus = verificationStatus?.status; // Utiliser le statut du hook useAuth

        // 1. Vérification KYC
        if (!isVerified || kycStatus === 'pending' || kycStatus === 'rejected') {
             let message = "Vérifiez votre identité pour pouvoir réserver.";
             let iconColor = "#f59e0b";
             if (kycStatus === 'pending') { message = "Votre vérification d'identité est en cours."; iconColor = "#0ea5e9"; }
             else if (kycStatus === 'rejected') { message = `Vérification refusée: ${verificationStatus?.rejection_reason || 'Vérifiez vos documents.'}`; iconColor = "#ef4444"; }
             notificationsToShow.push(
                 <TouchableOpacity key="kyc" style={styles.notificationItem} onPress={() => router.push('/profile/verify')}>
                     <UserCheck size={20} color={iconColor} />
                     <Text style={styles.notificationText}>{message}</Text>
                     <ChevronRight size={18} color="#9ca3af" />
                 </TouchableOpacity>
             );
         }

        // 2. Réservations en attente
        if (notificationData && notificationData.pendingBookingsCount > 0) {
            notificationsToShow.push(
                <TouchableOpacity 
                    key="bookings" 
                    style={styles.notificationItem} 
                    onPress={() => {
                        // Si c'est un hôte, rediriger vers l'espace hôte
                        if (isHost) {
                            router.push('/(tabs)/host/(dashboard)/bookings');
                        } else {
                            router.push('/(tabs)/bookings');
                        }
                    }}
                >
                    <Clock size={20} color="#6366f1" />
                    <Text style={styles.notificationText}>
                        {notificationData.pendingBookingsCount} réservation{notificationData.pendingBookingsCount > 1 ? 's sont' : ' est'} en attente.
                    </Text>
                    <ChevronRight size={18} color="#9ca3af" />
                </TouchableOpacity>
            );
        }

        // 3. Conversations actives
        if (notificationData && notificationData.activeConversationsCount > 0) {
            notificationsToShow.push(
                <TouchableOpacity key="messages" style={styles.notificationItem} onPress={() => router.push('/(tabs)/conversations')}>
                    <MessageCircle size={20} color="#0891b2" />
                    <Text style={styles.notificationText}>
                        {notificationData.activeConversationsCount} conversation{notificationData.activeConversationsCount > 1 ? 's' : ''} active{notificationData.activeConversationsCount > 1 ? 's' : ''}.
                    </Text>
                    <ChevronRight size={18} color="#9ca3af" />
                </TouchableOpacity>
            );
        }

        // 4. Annonces en attente d'approbation
        if (notificationData?.pendingListingsCount > 0) {
            notificationsToShow.push(
                <TouchableOpacity key="pendingListing" style={styles.notificationItem} onPress={() => router.push('/(tabs)/host/dashboard')}>
                    <Clock size={20} color="#f59e0b" />
                    <Text style={styles.notificationText}>
                        {notificationData.pendingListingsCount > 1 
                            ? `${notificationData.pendingListingsCount} annonces en attente d'approbation.` 
                            : "Votre annonce est en attente d'approbation."}
                    </Text>
                    <ChevronRight size={18} color="#9ca3af" />
                </TouchableOpacity>
            );
        }

        // 5. Annonces récemment approuvées (dernières 24h)
        if (notificationData?.recentlyApprovedListingsCount > 0) {
            notificationsToShow.push(
                <TouchableOpacity key="approvedListing" style={styles.notificationItem} onPress={() => router.push('/(tabs)/host/dashboard')}>
                    <CheckCircle size={20} color="#10b981" />
                    <Text style={styles.notificationText}>
                        {notificationData.recentlyApprovedListingsCount > 1 
                            ? `${notificationData.recentlyApprovedListingsCount} annonces ont été approuvées.` 
                            : `Votre annonce ${notificationData.firstApprovedListing?.title ? `"${notificationData.firstApprovedListing.title}"` : ""} a été approuvée !`}
                    </Text>
                    <ChevronRight size={18} color="#9ca3af" />
                </TouchableOpacity>
            );
        }

        // 6. Annonces refusées
        if (notificationData?.rejectedListingsCount > 0) {
            notificationsToShow.push(
                <TouchableOpacity key="rejectedListing" style={styles.notificationItem} onPress={() => router.push('/(tabs)/host/dashboard')}>
                    <AlertCircleLucide size={20} color="#ef4444" />
                    <Text style={styles.notificationText}>
                        {notificationData.rejectedListingsCount > 1 
                            ? `${notificationData.rejectedListingsCount} annonces ont été refusées.` 
                            : `Votre annonce a été refusée${notificationData.firstRejectedListing?.rejection_reason ? ' : ' + notificationData.firstRejectedListing.rejection_reason : '.'}`}
                    </Text>
                    <ChevronRight size={18} color="#9ca3af" />
                </TouchableOpacity>
            );
        }

        // 7. Coordonnées bancaires manquantes (seulement pour les hôtes avec annonces approuvées)
        if (isHost && notificationData?.bankAccountMissing === true) {
            notificationsToShow.push(
                <TouchableOpacity key="bankAccount" style={styles.notificationItem} onPress={() => router.push('/(tabs)/host/payout-settings')}>
                    <Banknote size={20} color="#8b5cf6" />
                    <Text style={styles.notificationText}>
                        Complétez vos informations bancaires pour recevoir vos paiements.
                    </Text>
                    <ChevronRight size={18} color="#9ca3af" />
                </TouchableOpacity>
            );
        }

        // Si aucune notification (après chargement), ne rien rendre
        if (notificationsToShow.length === 0 && !loadingNotifications) {
             return null;
        }

        // Rendre le conteneur avec les notifications
        return (
            <View style={styles.notificationContainer}>
                {notificationsToShow}
            </View>
        );
    };


    // --- Rendu Principal ---
    // Attendre que les fonts ET la session soient initialisées
    if (!fontsLoaded || !sessionInitialized || isLoadingAuth) {
        // Le SplashScreen devrait être géré par _layout, on affiche un loader ici au cas où
        return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
    }
    if (fontError) {
        return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>;
    }

    // Rendu pour utilisateur non connecté
    if (!user) {
        return (
            <SafeAreaView style={{flex: 1}}>
                <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                    <View style={styles.header}>
                        <View> <Text style={styles.logo}>3ommy</Text><Text style={styles.slogan}>Un plongeon pour tous</Text></View>
                        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
                            <LogIn size={20} color="#0891b2" />
                            <Text style={styles.loginButtonText}>Connexion</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.heroSection}>
                        <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }} style={styles.heroImage} resizeMode="cover"/>
                        <View style={styles.overlay} />
                        <View style={styles.heroContent}><Text style={styles.heroTitle}>Bienvenue sur 3ommy</Text><Text style={styles.heroSubtitle}>La première plateforme de location de piscines au Maroc</Text></View>
                    </View>
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/search')}>
                            <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}><Users size={32} color="#ffffff" /></View>
                            <Text style={styles.optionTitle}>Je veux me baigner</Text>
                            <Text style={styles.optionDescription}>Trouvez la piscine parfaite</Text>
                            <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Recherche par localisation</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Piscines vérifiées</Text></View></View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.optionCard, styles.hostCard]} onPress={() => router.push('/(tabs)/become-host')}>
                            <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}><School size={32} color="#ffffff" /></View>
                            <Text style={styles.optionTitle}>Devenez Hôte</Text>
                            <Text style={styles.optionDescription}>Rentabilisez votre piscine en toute sécurité</Text>
                            <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Gestion simplifiée</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Assurance incluse</Text></View></View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Rendu pour utilisateur connecté
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.contentContainer}
                refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891b2"/> }
            >
                {/* Header Connecté */}
                <View style={styles.header}>
                    <View> <Text style={styles.logo}>3ommy</Text><Text style={styles.slogan}>Un plongeon pour tous</Text></View>
                    <View>
                        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/(tabs)/profile')}>
                            <Image
                                source={{ uri: user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((user.user_metadata?.full_name || user.email || '?').charAt(0)) + '&background=random&color=fff' }}
                                style={styles.profileAvatar}
                            />
                        </TouchableOpacity>
                         {(!isVerified || verificationStatus?.status === 'pending' || verificationStatus?.status === 'rejected') && (
                            <TouchableOpacity
                                style={[styles.verificationBadge, verificationStatus?.status === 'rejected' ? styles.verificationBadgeRejected : verificationStatus?.status === 'pending' ? styles.verificationBadgePending : styles.verificationBadgeNeeded]}
                                onPress={() => router.push('/profile/verify')} >
                                {verificationStatus?.status === 'pending' ? <Clock size={14} color="#ffffff"/> : <AlertCircleLucide size={16} color="#ffffff" />}
                            </TouchableOpacity>
                         )}
                         {isVerified && verificationStatus?.status === 'approved' && (
                            <View style={[styles.verificationBadge, styles.verificationBadgeVerified]}>
                                <CheckCircle size={16} color="#ffffff" />
                             </View>
                         )}
                    </View>
                </View>

                 {/* Bannière de Notifications */}
                 {renderNotificationBanner()}

                {/* Hero Section Connecté */}
                <View style={styles.heroSection}>
                     <Image source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }} style={styles.heroImage} resizeMode="cover"/>
                     <View style={styles.overlay} />
                     <View style={styles.heroContent}>
                         <Text style={styles.heroTitle}>Bonjour{user.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(' ')[0]}` : ''} !</Text>
                         <Text style={styles.heroSubtitle}>Prêt pour un plongeon ?</Text>
                     </View>
                 </View>

                 {/* Options */}
                <View style={styles.optionsContainer}>
                    <TouchableOpacity style={styles.optionCard} onPress={() => router.push('/search')}>
                        <View style={[styles.iconCircle, { backgroundColor: '#0891b2' }]}><Users size={32} color="#ffffff" /></View>
                        <Text style={styles.optionTitle}>Je veux me baigner</Text>
                        <Text style={styles.optionDescription}>Trouvez la piscine parfaite</Text>
                        <View style={styles.features}><View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Recherche par localisation</Text></View><View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Piscines vérifiées</Text></View></View>
                    </TouchableOpacity>
                    
                    {/* Carte conditionnelle selon le statut d'hôte */}
                    {isHost ? (
                        // Option pour accéder au tableau de bord (pour hôtes)
                        <TouchableOpacity style={[styles.optionCard, styles.dashboardCard]} onPress={() => router.push('/(tabs)/host/dashboard')}>
                            <View style={[styles.iconCircle, { backgroundColor: '#0d9488' }]}><DashboardIcon size={32} color="#ffffff" /></View>
                            <Text style={styles.optionTitle}>Accéder à mon tableau de bord</Text>
                            <Text style={styles.optionDescription}>Gérez vos piscines et réservations</Text>
                            <View style={styles.features}>
                                <View style={styles.featureRow}><Clock size={16} color="#64748b" /><Text style={styles.feature}>Suivi des réservations</Text></View>
                                <View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Gestion des disponibilités</Text></View>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        // Option pour devenir hôte (pour non-hôtes)
                        <TouchableOpacity style={[styles.optionCard, styles.hostCard]} onPress={() => router.push('/(tabs)/become-host')}>
                            <View style={[styles.iconCircle, { backgroundColor: '#059669' }]}><School size={32} color="#ffffff" /></View>
                            <Text style={styles.optionTitle}>Devenez Hôte</Text>
                            <Text style={styles.optionDescription}>Rentabilisez votre piscine en toute sécurité</Text>
                            <View style={styles.features}>
                                <View style={styles.featureRow}><MapPin size={16} color="#64748b" /><Text style={styles.feature}>Gestion simplifiée</Text></View>
                                <View style={styles.featureRow}><Shield size={16} color="#64748b" /><Text style={styles.feature}>Assurance incluse</Text></View>
                            </View>
                        </TouchableOpacity>
                    )}
                 </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', },
    contentContainer: { flexGrow: 1, paddingBottom: 40, },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
    header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'web' ? 20 : (Platform.OS === 'ios' ? 50 : 40), paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', },
logo: { fontFamily: 'Montserrat-Bold', fontSize: 28, color: '#0891b2', },
    slogan: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginTop: 2, },
    loginButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', },
    loginButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#0891b2', },
    profileButton: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: '#e0f2fe', borderWidth: 1, borderColor: '#bae6fd', },
    profileAvatar: { width: '100%', height: '100%', },
    verificationBadge: { position: 'absolute', bottom: -3, right: -3, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ffffff', },
    verificationBadgeNeeded: { backgroundColor: '#f59e0b', },
    verificationBadgePending: { backgroundColor: '#3b82f6', },
    verificationBadgeRejected: { backgroundColor: '#ef4444', },
    verificationBadgeVerified: { backgroundColor: '#22c55e', },
    heroSection: { height: 200, position: 'relative', },
    heroImage: { width: '100%', height: '100%', },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 70, 90, 0.4)', },
    heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, },
    heroTitle: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#ffffff', marginBottom: 4, },
    heroSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#ffffff', opacity: 0.9, },
    notificationContainer: { marginTop: 16, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.05, shadowRadius: 2.00, elevation: 1, },
    notificationContainerLoading: { height: 60, justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, marginBottom: 8, },
    notificationItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 12, },
    notificationText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#334155', flex: 1, lineHeight: 20, },
    errorBanner: { backgroundColor: '#fef2f2', borderColor: '#fecaca', paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, },
    errorBannerText: { color: '#b91c1c', fontFamily: 'Montserrat-Regular', flex: 1, fontSize: 13, },
    retryIconSmall: { padding: 4 },
    retryTextSmall: { color: '#b91c1c', fontSize: 13, fontFamily: 'Montserrat-SemiBold', textDecorationLine: 'underline'},
    optionsContainer: { padding: 16, gap: 16, },
    optionCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, },
    hostCard: { borderColor: '#d1fae5', backgroundColor: '#f0fdf4' },
    dashboardCard: { borderColor: '#ccfbf1', backgroundColor: '#f0fdfa' }, // Nouveau style pour la carte de tableau de bord
    iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 16, },
    optionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 6, },
    optionDescription: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginBottom: 16, lineHeight: 20 },
    features: { gap: 10, },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, },
    feature: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', },
    verificationCard: { backgroundColor: '#fef2f2', marginHorizontal: 16, marginTop: 16, marginBottom: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca', flexDirection: 'row', alignItems: 'center', gap: 12, },
    verificationContent: { flex: 1, },
    verificationTextContainer: { },
    verificationTitle: { fontFamily: 'Montserrat-Bold', fontSize: 15, color: '#991b1b', marginBottom: 4, },
    verificationText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#b91c1c', lineHeight: 18, },
    retryButton: { backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 15 },
    retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
});