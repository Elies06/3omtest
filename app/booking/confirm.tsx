// // import { useState } from 'react';
// // import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
// // import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// // import { Calendar, Clock, Users, CreditCard, ChevronLeft, Info } from 'lucide-react-native';
// // import { router, useLocalSearchParams } from 'expo-router';
// // import { SplashScreen } from 'expo-router';
// // import Animated, { FadeIn } from 'react-native-reanimated';
// // import { calculatePricing, formatPrice } from '@/utils/pricing';

// // SplashScreen.preventAutoHideAsync();

// // const BOOKING_DATA = {
// //   pool: {
// //     title: 'Villa avec Piscine Chauffée',
// //     location: 'Marrakech, Gueliz',
// //     price: 35,
// //   },
// //   guests: 4,
// //   duration: 2,
// // };

// // export default function BookingConfirmScreen() {
// //   const params = useLocalSearchParams();
// //   const [isProcessing, setIsProcessing] = useState(false);
// //   const [showFeesInfo, setShowFeesInfo] = useState(false);
// //   const guestCount = parseInt(params.guestCount as string, 10) || 1;

// //   const [fontsLoaded] = useFonts({
// //     'Montserrat-Bold': Montserrat_700Bold,
// //     'Montserrat-SemiBold': Montserrat_600SemiBold,
// //     'Montserrat-Regular': Montserrat_400Regular,
// //   });

// //   if (!fontsLoaded) {
// //     return null;
// //   }

// //   const pricing = calculatePricing(
// //     BOOKING_DATA.pool.price,
// //     guestCount,
// //     BOOKING_DATA.duration
// //   );

// //   const handlePayment = async () => {
// //     setIsProcessing(true);
// //     // Simulate payment processing
// //     setTimeout(() => {
// //       router.push('/booking/success');
// //     }, 2000);
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <View style={styles.header}>
// //         <TouchableOpacity 
// //           style={styles.backButton}
// //           onPress={() => router.back()}
// //         >
// //           <ChevronLeft size={24} color="#1e293b" />
// //         </TouchableOpacity>
// //         <Text style={styles.headerTitle}>Confirmation</Text>
// //       </View>

// //       <ScrollView style={styles.content}>
// //         <Animated.View 
// //           style={styles.bookingDetails}
// //           entering={FadeIn.delay(200).springify()}
// //         >
// //           <Text style={styles.sectionTitle}>Détails de la réservation</Text>
          
// //           <View style={styles.detailRow}>
// //             <Calendar size={20} color="#0891b2" />
// //             <Text style={styles.detailText}>
// //               {new Date(params.date as string).toLocaleDateString('fr-FR', { 
// //                 weekday: 'long',
// //                 day: 'numeric',
// //                 month: 'long'
// //               })}
// //             </Text>
// //           </View>

// //           <View style={styles.detailRow}>
// //             <Clock size={20} color="#0891b2" />
// //             <Text style={styles.detailText}>{params.timeSlot as string}</Text>
// //           </View>

// //           <View style={styles.detailRow}>
// //             <Users size={20} color="#0891b2" />
// //             <Text style={styles.detailText}>{guestCount} personnes</Text>
// //           </View>
// //         </Animated.View>

// //         <Animated.View 
// //           style={styles.paymentSection}
// //           entering={FadeIn.delay(400).springify()}
// //         >
// //           <Text style={styles.sectionTitle}>Mode de paiement</Text>
          
// //           <View style={styles.paymentOption}>
// //             <CreditCard size={24} color="#0891b2" />
// //             <View style={styles.paymentOptionContent}>
// //               <Text style={styles.paymentOptionTitle}>Carte bancaire</Text>
// //               <Text style={styles.paymentOptionSubtitle}>Paiement sécurisé</Text>
// //             </View>
// //           </View>
// //         </Animated.View>

// //         <Animated.View 
// //           style={styles.summary}
// //           entering={FadeIn.delay(600).springify()}
// //         >
// //           <View style={styles.summaryHeader}>
// //             <Text style={styles.sectionTitle}>Récapitulatif</Text>
// //             <TouchableOpacity 
// //               style={styles.infoButton}
// //               onPress={() => setShowFeesInfo(!showFeesInfo)}
// //             >
// //               <Info size={20} color="#64748b" />
// //             </TouchableOpacity>
// //           </View>
          
// //           <View style={styles.summaryRow}>
// //             <Text style={styles.summaryLabel}>
// //               {guestCount} pers. × {BOOKING_DATA.duration}h × {formatPrice(BOOKING_DATA.pool.price)}
// //             </Text>
// //             <Text style={styles.summaryValue}>{formatPrice(pricing.subtotal)}</Text>
// //           </View>
          
// //           <View style={styles.summaryRow}>
// //             <Text style={styles.summaryLabel}>Frais de service (20%)</Text>
// //             <Text style={styles.summaryValue}>{formatPrice(pricing.guestFee)}</Text>
// //           </View>

// //           {showFeesInfo && (
// //             <View style={styles.feesInfo}>
// //               <Text style={styles.feesInfoText}>
// //                 Les frais de service nous permettent de :{'\n'}
// //                 • Vérifier l'identité des utilisateurs{'\n'}
// //                 • Assurer votre sécurité{'\n'}
// //                 • Maintenir la plateforme{'\n'}
// //                 • Fournir un support client 24/7
// //               </Text>
// //             </View>
// //           )}

// //           <View style={[styles.summaryRow, styles.totalRow]}>
// //             <Text style={styles.totalLabel}>Total</Text>
// //             <Text style={styles.totalValue}>{formatPrice(pricing.totalPrice)}</Text>
// //           </View>
// //         </Animated.View>
// //       </ScrollView>

// //       <View style={styles.footer}>
// //         <TouchableOpacity 
// //           style={[styles.confirmButton, isProcessing && styles.confirmButtonDisabled]}
// //           onPress={handlePayment}
// //           disabled={isProcessing}
// //         >
// //           <Text style={styles.confirmButtonText}>
// //             {isProcessing ? 'Traitement en cours...' : `Payer ${formatPrice(pricing.totalPrice)}`}
// //           </Text>
// //         </TouchableOpacity>
// //       </View>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#ffffff',
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     padding: 20,
// //     paddingTop: Platform.OS === 'web' ? 20 : 60,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#f1f5f9',
// //   },
// //   backButton: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     backgroundColor: '#f8fafc',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     marginRight: 12,
// //   },
// //   headerTitle: {
// //     fontFamily: 'Montserrat-Bold',
// //     fontSize: 20,
// //     color: '#1e293b',
// //   },
// //   content: {
// //     flex: 1,
// //     padding: 20,
// //   },
// //   bookingDetails: {
// //     backgroundColor: '#f8fafc',
// //     borderRadius: 16,
// //     padding: 20,
// //     marginBottom: 24,
// //   },
// //   sectionTitle: {
// //     fontFamily: 'Montserrat-Bold',
// //     fontSize: 18,
// //     color: '#1e293b',
// //     marginBottom: 16,
// //   },
// //   detailRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 12,
// //     marginBottom: 12,
// //   },
// //   detailText: {
// //     fontFamily: 'Montserrat-SemiBold',
// //     fontSize: 16,
// //     color: '#1e293b',
// //   },
// //   paymentSection: {
// //     marginBottom: 24,
// //   },
// //   paymentOption: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     padding: 16,
// //     backgroundColor: '#e0f2fe',
// //     borderRadius: 12,
// //   },
// //   paymentOptionContent: {
// //     flex: 1,
// //     marginLeft: 12,
// //   },
// //   paymentOptionTitle: {
// //     fontFamily: 'Montserrat-SemiBold',
// //     fontSize: 16,
// //     color: '#1e293b',
// //   },
// //   paymentOptionSubtitle: {
// //     fontFamily: 'Montserrat-Regular',
// //     fontSize: 14,
// //     color: '#64748b',
// //   },
// //   summary: {
// //     backgroundColor: '#f8fafc',
// //     borderRadius: 16,
// //     padding: 20,
// //   },
// //   summaryHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 16,
// //   },
// //   infoButton: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //     backgroundColor: '#ffffff',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   summaryRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     marginBottom: 12,
// //   },
// //   summaryLabel: {
// //     fontFamily: 'Montserrat-Regular',
// //     fontSize: 16,
// //     color: '#64748b',
// //   },
// //   summaryValue: {
// //     fontFamily: 'Montserrat-SemiBold',
// //     fontSize: 16,
// //     color: '#1e293b',
// //   },
// //   feesInfo: {
// //     backgroundColor: '#ffffff',
// //     borderRadius: 12,
// //     padding: 16,
// //     marginBottom: 16,
// //   },
// //   feesInfoText: {
// //     fontFamily: 'Montserrat-Regular',
// //     fontSize: 14,
// //     color: '#64748b',
// //     lineHeight: 22,
// //   },
// //   totalRow: {
// //     borderTopWidth: 1,
// //     borderTopColor: '#e2e8f0',
// //     paddingTop: 12,
// //     marginTop: 12,
// //   },
// //   totalLabel: {
// //     fontFamily: 'Montserrat-Bold',
// //     fontSize: 18,
// //     color: '#1e293b',
// //   },
// //   totalValue: {
// //     fontFamily: 'Montserrat-Bold',
// //     fontSize: 18,
// //     color: '#0891b2',
// //   },
// //   footer: {
// //     padding: 20,
// //     backgroundColor: '#ffffff',
// //     borderTopWidth: 1,
// //     borderTopColor: '#f1f5f9',
// //   },
// //   confirmButton: {
// //     backgroundColor: '#0891b2',
// //     paddingVertical: 16,
// //     borderRadius: 12,
// //     alignItems: 'center',
// //   },
// //   confirmButtonDisabled: {
// //     backgroundColor: '#94a3b8',
// //   },
// //   confirmButtonText: {
// //     fontFamily: 'Montserrat-SemiBold',
// //     fontSize: 16,
// //     color: '#ffffff',
// //   },
// // });




// // // Dans app/booking/confirm.tsx
// // import React, { useState, useEffect, useCallback } from 'react'; // Ajout useEffect, useCallback
// // import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert, SafeAreaView } from 'react-native'; // Ajout imports
// // import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// // import { Calendar, Clock, Users, CreditCard, ChevronLeft, Info } from 'lucide-react-native';
// // import { router, useLocalSearchParams, Stack } from 'expo-router'; // Ajout Stack
// // // import { SplashScreen } from 'expo-router';
// // import Animated, { FadeIn } from 'react-native-reanimated';
// // import { supabase } from '@/lib/supabase'; // Import Supabase
// // import { useAuth } from '@/hooks/useAuth'; // Import useAuth pour user ID
// // import { calculatePricing, formatPrice } from '@/utils/pricing'; // Supposons que ces utilitaires existent
// // import { parse, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns'; // Pour manipuler dates/heures

// // // Interface pour les données de la piscine nécessaires ici
// // interface PoolData {
// //     title: string;
// //     location: string | null;
// //     price_per_hour: number; // Assumons non null pour une annonce réservable
// // }

// // export default function BookingConfirmScreen() {
// //     // Récupérer TOUS les paramètres nécessaires
// //     const params = useLocalSearchParams<{
// //         poolId: string;
// //         date: string; // ex: '2025-04-10T00:00:00.000Z' ou '2025-04-10'
// //         timeSlot: string; // ex: '14:00 - 16:00'
// //         guestCount: string;
// //     }>();

// //     const { user } = useAuth(); // Obtenir l'utilisateur connecté
// //     const [poolData, setPoolData] = useState<PoolData | null>(null);
// //     const [loadingPool, setLoadingPool] = useState(true);
// //     const [bookingError, setBookingError] = useState<string | null>(null);
// //     const [isProcessing, setIsProcessing] = useState(false);
// //     const [showFeesInfo, setShowFeesInfo] = useState(false);

// //     // Parser les paramètres une seule fois
// //     const guestCount = parseInt(params.guestCount || '1', 10);
// //     const selectedDate = params.date ? new Date(params.date) : new Date(); // Date de base
// //     const timeSlot = params.timeSlot || ''; // ex: "14:00 - 16:00"
// //    const [error, setError] = useState<string | null>(null); 

// //     // --- Calculer start_time, end_time, duration ---
// //     let startTime: Date | null = null;
// //     let endTime: Date | null = null;
// //     let durationHours = 0;
// //     if (timeSlot) {
// //         try {
// //             const parts = timeSlot.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
// //             if (parts) {
// //                 const startHour = parseInt(parts[1], 10);
// //                 const startMinute = parseInt(parts[2], 10);
// //                 const endHour = parseInt(parts[3], 10);
// //                 const endMinute = parseInt(parts[4], 10);

// //                 // Crée les objets Date complets
// //                 startTime = setMilliseconds(setSeconds(setMinutes(setHours(selectedDate, startHour), startMinute), 0), 0);
// //                 endTime = setMilliseconds(setSeconds(setMinutes(setHours(selectedDate, endHour), endMinute), 0), 0);

// //                 // Calculer durée (simple pour l'instant, attention aux changements de jour)
// //                 durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

// //             } else {
// //                  console.error("Format timeSlot invalide:", timeSlot);
// //                  // Gérer l'erreur si le format n'est pas bon
// //             }
// //         } catch(e) { console.error("Erreur parsing date/heure", e)}
// //     }
// //     // -------------------------------------------------

// //     const [fontsLoaded, fontError] = useFonts({ /* ... */ });

// //     // --- Fetch données de la piscine ---
// //     const fetchPoolData = useCallback(async () => {
// //         if (!params.poolId) { setError("ID de l'annonce manquant dans les paramètres."); setLoadingPool(false); return; }
// //         setLoadingPool(true); setError(null);
// //         try {
// //             const { data, error } = await supabase
// //                 .from('pool_listings')
// //                 .select('title, location, price_per_hour')
// //                 .eq('id', params.poolId)
// //                 .eq('status', 'approved')
// //                 .single(); // On s'attend à une seule annonce approuvée

// //             if (error) throw error;
// //             if (!data || data.price_per_hour == null) throw new Error("Données de l'annonce invalides ou prix manquant.");
// //             setPoolData(data as PoolData);
// //         } catch (err: any) {
// //             console.error("Error fetching pool data:", err);
// //             setError(err.message || "Erreur chargement des infos de l'annonce.");
// //         } finally {
// //             setLoadingPool(false);
// //         }
// //     }, [params.poolId]);

// //     useEffect(() => { fetchPoolData(); }, [fetchPoolData]);
// //     // ---------------------------------

// //     // --- Calcul du Prix ---
// //     // Assurez-vous que calculatePricing gère bien le prix/heure
// //     const pricing = poolData?.price_per_hour && durationHours > 0
// //         ? calculatePricing(poolData.price_per_hour, guestCount, durationHours)
// //         : { subtotal: 0, guestFee: 0, hostFee: 0, totalPrice: 0 }; // Valeurs par défaut
// //     // --------------------

// //     // --- Fonction de Confirmation et INSERTION ---
// //     const handleConfirmBooking = async () => {
// //         if (!user || !poolData || !params.poolId || !startTime || !endTime || !guestCount || pricing.totalPrice == null) {
// //             Alert.alert("Erreur", "Informations manquantes pour créer la réservation.");
// //             return;
// //         }

// //         setIsProcessing(true);
// //         setBookingError(null);
// //         console.log("Attempting to insert booking...");

// //         const bookingData = {
// //              // Assurez-vous que ce nom correspond à votre table 'bookings'
// //             pool_listing_id: params.poolId,
// //             user_id: user.id,
// //             start_time: startTime.toISOString(), // Format ISO pour la DB
// //             end_time: endTime.toISOString(),     // Format ISO pour la DB
// //             guest_count: guestCount,             // Assurez-vous que c'est le bon nom de colonne
// //             total_price: pricing.totalPrice,     // Utiliser le prix calculé
// //             status: 'confirmed'                  // Statut initial (ou 'pending' si paiement requis)
// //             // created_at sera mis par défaut par la DB
// //         };

// //         console.log("Booking data to insert:", bookingData);

// //         try {
// //             // Appel à Supabase pour insérer la réservation
// //             const { error: insertError } = await supabase
// //                 .from('bookings')
// //                 .insert(bookingData)
// //                 .select() // Pour vérifier si l'insertion a réussi (optionnel mais utile)
// //                 .single(); // On s'attend à insérer une seule ligne

// //             if (insertError) {
// //                 // Gérer les erreurs spécifiques (ex: RLS, contrainte unique, etc.)
// //                 console.error("Supabase insert error:", insertError);
// //                 throw new Error(insertError.message || "Erreur lors de la création de la réservation.");
// //             }

// //             console.log("✅ Booking successfully inserted!");
// //             // Redirection vers la page de succès
// //             router.replace({ pathname: '/booking/success', params: { bookingId: 'NEW_BOOKING_ID' } }); // TODO: Récupérer le vrai ID si besoin

// //         } catch (err: any) {
// //             console.error("Error creating booking:", err);
// //             setBookingError(err.message || "Une erreur s'est produite.");
// //             Alert.alert("Échec de la Réservation", err.message || "Une erreur s'est produite. Veuillez réessayer.");
// //         } finally {
// //             setIsProcessing(false);
// //         }
// //     };
// //     // -------------------------------------------


// //     // --- Rendu ---
// //      if (!fontsLoaded || loadingPool) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
// //      if (fontError) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
// //      // Afficher erreur si données piscine non chargées
// //      if (!poolData || error) { return ( <SafeAreaView style={styles.container}> <Stack.Screen options={{ title: 'Erreur' }} /> <View style={styles.headerStatic}> <TouchableOpacity style={styles.backButton} onPress={router.back}> <ChevronLeft size={24} color="#1e293b" /> </TouchableOpacity> <Text style={styles.headerTitleStatic}>Erreur Réservation</Text><View style={{width: 40}}/> </View> <View style={styles.errorContainer}> <Text style={styles.errorText}>{error || "Impossible de charger les détails de l'annonce."}</Text> <TouchableOpacity style={styles.buttonLink} onPress={router.back}> <Text style={styles.buttonLinkText}>Retour</Text> </TouchableOpacity> </View> </SafeAreaView> ); }

// //     return (
// //         <SafeAreaView style={styles.container}>
// //             <Stack.Screen options={{ title: 'Confirmer Réservation' }} />
// //              <View style={styles.headerStatic}>
// //                  <TouchableOpacity style={styles.backButton} onPress={() => router.back()} > <ChevronLeft size={24} color="#1e293b" /> </TouchableOpacity>
// //                  <Text style={styles.headerTitleStatic}>Confirmation</Text>
// //                  <View style={{width: 40}} />{/* Placeholder pour centrer */}
// //              </View>

// //             <ScrollView style={styles.content}>
// //                  <Animated.View style={styles.bookingDetails} entering={FadeIn.delay(100)}>
// //                     <Text style={styles.sectionTitle}>Votre réservation pour</Text>
// //                      {/* Afficher Titre et Lieu de l'annonce chargée */}
// //                      <Text style={styles.poolTitleConfirm}>{poolData.title}</Text>
// //                      <Text style={styles.poolLocationConfirm}>{poolData.location}</Text>
// //                      <View style={styles.separator} />

// //                     <Text style={styles.sectionTitleSmall}>Détails</Text>
// //                      <View style={styles.detailRow}><Calendar size={20} color="#0891b2" /><Text style={styles.detailText}>{selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text></View>
// //                      <View style={styles.detailRow}><Clock size={20} color="#0891b2" /><Text style={styles.detailText}>{timeSlot}</Text></View>
// //                      <View style={styles.detailRow}><Users size={20} color="#0891b2" /><Text style={styles.detailText}>{guestCount} personne{guestCount > 1 ? 's' : ''}</Text></View>
// //                  </Animated.View>

// //                  <Animated.View style={styles.paymentSection} entering={FadeIn.delay(200)}>
// //                      <Text style={styles.sectionTitle}>Mode de paiement</Text>
// //                      <View style={styles.paymentOption}><CreditCard size={24} color="#0891b2" /><View style={styles.paymentOptionContent}><Text style={styles.paymentOptionTitle}>Carte bancaire</Text><Text style={styles.paymentOptionSubtitle}>Paiement sécurisé à venir</Text></View></View>
// //                  </Animated.View>

// //                  <Animated.View style={styles.summary} entering={FadeIn.delay(300)}>
// //                      <View style={styles.summaryHeader}><Text style={styles.sectionTitle}>Récapitulatif</Text><TouchableOpacity style={styles.infoButton} onPress={() => setShowFeesInfo(!showFeesInfo)}><Info size={20} color="#64748b" /></TouchableOpacity></View>
// //                     <View style={styles.summaryRow}><Text style={styles.summaryLabel}>{guestCount} pers. × {durationHours}h × {formatPrice(poolData.price_per_hour)}</Text><Text style={styles.summaryValue}>{formatPrice(pricing.subtotal)}</Text></View>
// //                     <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Frais de service</Text><Text style={styles.summaryValue}>{formatPrice(pricing.guestFee)}</Text></View>
// //                      {showFeesInfo && ( <View style={styles.feesInfo}><Text style={styles.feesInfoText}>Les frais de service nous aident à maintenir la plateforme et à assurer votre sécurité.</Text></View> )}
// //                     <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{formatPrice(pricing.totalPrice)}</Text></View>
// //                  </Animated.View>

// //                  {/* Afficher l'erreur de réservation si elle existe */}
// //                  {bookingError && <Text style={[styles.errorText, {marginTop: 15}]}>{bookingError}</Text>}

// //              </ScrollView>

// //             <View style={styles.footer}>
// //                  <TouchableOpacity style={[styles.confirmButton, isProcessing && styles.confirmButtonDisabled]} onPress={handleConfirmBooking} disabled={isProcessing || loadingPool /* Désactiver aussi si poolData pas chargé */} >
// //                      {isProcessing ? ( <ActivityIndicator size="small" color="#ffffff" /> ) : ( <Text style={styles.confirmButtonText}>Confirmer et Payer {formatPrice(pricing.totalPrice)}</Text> )}
// //                  </TouchableOpacity>
// //             </View>
// //         </SafeAreaView>
// //     );
// // }

// // // --- Styles ---
// // // Copier les styles de la version précédente de ce fichier et adapter si besoin
// // const styles = StyleSheet.create({
// //      container: { flex: 1, backgroundColor: '#ffffff' },
// //      loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// //      errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20},
// //      errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
// //      headerStatic: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? 40 : 60, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
// //      backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
// //      headerTitleStatic: { flex: 1, textAlign: 'center', fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b' },
// //      content: { flex: 1, padding: 16 }, // Padding pour le contenu scrollable
// //      bookingDetails: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 20, marginBottom: 24 },
// //      sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 16 },
// //      sectionTitleSmall: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#374151', marginBottom: 12 },
// //      poolTitleConfirm: { fontFamily: 'Montserrat-SemiBold', fontSize: 18, color: '#111827', marginBottom: 4 },
// //      poolLocationConfirm: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginBottom: 12 },
// //      separator: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
// //      detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
// //      detailText: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1e293b', flexShrink: 1 }, // flexShrink pour retour à la ligne
// //      paymentSection: { marginBottom: 24 },
// //      paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#f0f9ff', borderRadius: 12, borderWidth: 1, borderColor: '#e0f2fe' }, // Bleu clair
// //      paymentOptionContent: { flex: 1, marginLeft: 12 },
// //      paymentOptionTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#1e293b' },
// //      paymentOptionSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b' },
// //      summary: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 20, marginBottom: 20 }, // Marge basse pour erreur éventuelle
// //      summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
// //      infoButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' }, // Bouton info plus petit
// //      summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }, // Moins de marge
// //      summaryLabel: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', flexShrink: 1, marginRight: 10 }, // flexShrink
// //      summaryValue: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#1e293b' },
// //      feesInfo: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, marginVertical: 8, borderWidth: 1, borderColor: '#e5e7eb'},
// //      feesInfoText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#64748b', lineHeight: 18 },
// //      totalRow: { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12, marginTop: 8 }, // Moins de marge
// //      totalLabel: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b' },
// //      totalValue: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#0891b2' },
// //      footer: { padding: 16, paddingBottom: Platform.OS === 'web' ? 16 : 34, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
// //      confirmButton: { backgroundColor: '#0891b2', paddingVertical: 14, borderRadius: 12, alignItems: 'center', height: 52, justifyContent: 'center' },
// //      confirmButtonDisabled: { backgroundColor: '#94a3b8', opacity: 0.7 },
// //      confirmButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
// //      buttonLink: { marginTop: 15, paddingVertical: 10 },
// //      buttonLinkText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2', textAlign: 'center' }
// // });




// // Dans app/booking/confirm.tsx
// // VERSION CORRIGÉE : Interroge 'pools' + Vérifie KYC

// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert, SafeAreaView } from 'react-native'; // Ajout imports
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import { Calendar, Clock, Users, CreditCard, ChevronLeft, Info } from 'lucide-react-native';
// import { router, useLocalSearchParams, Stack } from 'expo-router'; // Ajout Stack
// import Animated, { FadeIn } from 'react-native-reanimated';
// import { supabase } from '@/lib/supabase'; // Import Supabase
// import { useAuth } from '@/hooks/useAuth'; // Import useAuth pour user ID ET isVerified
// import { calculatePricing, formatPrice } from '@/utils/pricing'; // Supposons que ces utilitaires existent
// import { parse, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns'; // Pour manipuler dates/heures
// import { fr } from 'date-fns/locale'; // Import locale fr pour format

// // Interface pour les données de la piscine lues depuis la table 'pools'
// interface PoolData {
//     title: string;
//     location: string | null;
//     price_per_hour: number; // Non null dans 'pools' normalement
//     capacity: number | null; // Ajouté pour vérifier guestCount si besoin
// }

// export default function BookingConfirmScreen() {
//     const params = useLocalSearchParams<{
//         poolId: string;
//         date: string;
//         timeSlot: string;
//         guestCount: string;
//     }>();

//     // --- Utilisation de useAuth pour user ET isVerified ---
//     const { user, isVerified, isLoading: isLoadingAuth } = useAuth(); // Renommer isLoading si conflit
//     // const { user, isVerified, isLoading: isAuthLoading } = useAuth();

//     const [poolData, setPoolData] = useState<PoolData | null>(null);
//     const [loadingPool, setLoadingPool] = useState(true);
//     const [bookingError, setBookingError] = useState<string | null>(null); // Erreur spécifique à l'insertion
//     const [fetchPoolError, setFetchPoolError] = useState<string | null>(null); // Erreur spécifique au fetch pool
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [showFeesInfo, setShowFeesInfo] = useState(false);

//     // Parser les paramètres
//     const guestCount = parseInt(params.guestCount || '1', 10);
//     const selectedDate = params.date ? new Date(params.date) : new Date();
//     const timeSlot = params.timeSlot || '';

//     // --- Calculer start_time, end_time, duration (inchangé) ---
//     let startTime: Date | null = null;
//     let endTime: Date | null = null;
//     let durationHours = 0;
//     if (timeSlot) {
//         try { /* ... même logique de parsing ... */
//             const parts = timeSlot.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
//             if (parts) {
//                 const startHour = parseInt(parts[1], 10); const startMinute = parseInt(parts[2], 10);
//                 const endHour = parseInt(parts[3], 10); const endMinute = parseInt(parts[4], 10);
//                 startTime = setMilliseconds(setSeconds(setMinutes(setHours(selectedDate, startHour), startMinute), 0), 0);
//                 endTime = setMilliseconds(setSeconds(setMinutes(setHours(selectedDate, endHour), endMinute), 0), 0);
//                 durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
//              }
//         } catch(e) { console.error("Erreur parsing date/heure", e)}
//     }
//     // -------------------------------------------------

//     const [fontsLoaded, fontError] = useFonts({
//          'Montserrat-Bold': Montserrat_700Bold,
//          'Montserrat-SemiBold': Montserrat_600SemiBold,
//          'Montserrat-Regular': Montserrat_400Regular,
//      });

//     // --- Fetch données depuis la table 'pools' (CORRIGÉ) ---
//     const fetchPoolData = useCallback(async () => {
//         if (!params.poolId) { setFetchPoolError("ID de l'annonce manquant."); setLoadingPool(false); return; }
//         setLoadingPool(true); setFetchPoolError(null);
//         console.log(`🚀 Fetching APPROVED pool data from 'pools' table for ID: ${params.poolId}`);
//         try {
//             const { data, error } = await supabase
//                 .from('pools') // <<< CORRIGÉ : Interroge la table 'pools'
//                 .select('title, location, price_per_hour, capacity') // Champs de la table 'pools'
//                 .eq('id', params.poolId)
//                 // --- Pas besoin de .eq('status', 'approved') ---
//                 .single(); // Attend une seule ligne

//             if (error) {
//                  if (error.code === 'PGRST116') {
//                      console.error(`Annonce ${params.poolId} non trouvée dans la table 'pools'. Trigger a échoué ou annonce supprimée/non approuvée?`);
//                      throw new Error("L'annonce sélectionnée n'est plus disponible pour la réservation.");
//                  }
//                  throw error; // Autres erreurs DB
//              }
//             if (!data || data.price_per_hour == null) {
//                  console.error("Données invalides ou prix manquant pour l'annonce dans la table 'pools'.", data);
//                  throw new Error("Les informations nécessaires pour cette annonce sont incomplètes.");
//             }

//             console.log("✅ Approved pool data received from 'pools':", data);
//             setPoolData(data as PoolData);

//         } catch (err: any) {
//             console.error("Error fetching approved pool data from 'pools':", err);
//             setFetchPoolError(err.message || "Erreur chargement des infos de l'annonce approuvée.");
//             setPoolData(null);
//         } finally {
//             setLoadingPool(false);
//         }
//     }, [params.poolId]);

//     useEffect(() => { fetchPoolData(); }, [fetchPoolData]);
//     // ---------------------------------

//     // --- Calcul du Prix (inchangé) ---
//     const pricing = poolData?.price_per_hour && durationHours > 0
//         ? calculatePricing(poolData.price_per_hour, guestCount, durationHours)
//         : { subtotal: 0, guestFee: 0, hostFee: 0, totalPrice: 0 };
//     // --------------------

//     // --- Fonction de Confirmation et INSERTION (avec check KYC) ---
//     const handleConfirmBooking = async () => {
//         // Vérifier si l'auth est chargée (important pour isVerified)
//         if (isLoadingAuth) {
//              Alert.alert("Veuillez patienter", "Chargement des informations utilisateur...");
//              return;
//         }

//         // --- AJOUT DE LA VÉRIFICATION KYC ---
//         if (!isVerified) {
//             Alert.alert(
//                 "Vérification d'Identité Requise",
//                 "Pour des raisons de sécurité, vous devez faire vérifier votre identité (KYC) avant de pouvoir effectuer une réservation. Veuillez compléter la vérification dans la section 'Profil'."
//             );
//             // Optionnel: router.push('/profile/verify');
//             return; // Arrête le processus
//         }
//         // ------------------------------------

//         // Vérifications existantes (user, poolData chargé sans erreur, dates valides...)
//         if (!user || !poolData || !params.poolId || !startTime || !endTime || !guestCount || pricing.totalPrice == null || fetchPoolError) {
//              Alert.alert("Erreur", `Impossible de continuer : ${fetchPoolError || 'Informations manquantes ou invalides.'}`);
//              return;
//         }

//         // Vérification capacité (si capacity est chargé depuis pools)
//         if (poolData.capacity && guestCount > poolData.capacity) {
//             Alert.alert("Capacité dépassée", `Cette piscine ne peut accueillir que ${poolData.capacity} personne(s).`);
//             return;
//         }

//         setIsProcessing(true);
//         setBookingError(null);
//         console.log("Attempting to insert booking (user is verified)...");

//         const bookingData = {
//             pool_listing_id: params.poolId, // Clé étrangère vers pool_listings
//             user_id: user.id,
//             start_time: startTime.toISOString(),
//             end_time: endTime.toISOString(),
//             guest_count: guestCount,
//             total_price: pricing.totalPrice,
//             status: 'confirmed' // Ou 'pending' si paiement/confirmation admin requis
//         };

//         console.log("Booking data to insert:", bookingData);

//         try {
//             const { data: insertedBooking, error: insertError } = await supabase
//                 .from('bookings')
//                 .insert(bookingData)
//                 .select('id') // Récupérer l'ID de la réservation créée
//                 .single();

//             if (insertError) throw insertError;
//             if (!insertedBooking?.id) throw new Error("L'ID de la réservation n'a pas été retourné après insertion.");

//             console.log("✅ Booking successfully inserted! ID:", insertedBooking.id);
//             // Redirection vers la page de succès avec le vrai ID
//             router.replace({ pathname: '/booking/success', params: { bookingId: insertedBooking.id } });

//         } catch (err: any) {
//             console.error("Error creating booking:", err);
//             setBookingError(err.message || "Une erreur s'est produite lors de la création de la réservation.");
//             Alert.alert("Échec de la Réservation", err.message || "Une erreur s'est produite. Veuillez réessayer.");
//         } finally {
//             setIsProcessing(false);
//         }
//     };
//     // -------------------------------------------


//     // --- Rendu ---
//     if (!fontsLoaded || isLoadingAuth || loadingPool) { // Attendre polices ET auth ET pool
//         return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
//     }
//     if (fontError) { return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
//     // Afficher erreur si données piscine non chargées (fetchPoolError gère ça)
//     if (fetchPoolError || !poolData) {
//          return ( <SafeAreaView style={styles.container}> <Stack.Screen options={{ title: 'Erreur' }} /> <View style={styles.headerStatic}> <TouchableOpacity style={styles.backButton} onPress={router.back}> <ChevronLeft size={24} color="#1e293b" /> </TouchableOpacity> <Text style={styles.headerTitleStatic}>Erreur Réservation</Text><View style={{width: 40}}/> </View> <View style={styles.errorContainer}> <Text style={styles.errorText}>{fetchPoolError || "Impossible de charger les détails de l'annonce."}</Text> <TouchableOpacity style={styles.buttonLink} onPress={router.back}> <Text style={styles.buttonLinkText}>Retour</Text> </TouchableOpacity> </View> </SafeAreaView> );
//      }

//     // Rendu principal si tout est chargé et sans erreur
//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ title: 'Confirmer Réservation' }} />
//              <View style={styles.headerStatic}>
//                  <TouchableOpacity style={styles.backButton} onPress={() => router.back()} > <ChevronLeft size={24} color="#1e293b" /> </TouchableOpacity>
//                  <Text style={styles.headerTitleStatic}>Confirmation</Text>
//                  <View style={{width: 40}} />{/* Placeholder */}
//              </View>

//             <ScrollView style={styles.content}>
//                 {/* ... Section Détails Réservation (poolTitle, date, time, guests) ... */}
//                  <Animated.View style={styles.bookingDetails} entering={FadeIn.delay(100)}>
//                      <Text style={styles.sectionTitle}>Votre réservation pour</Text>
//                      <Text style={styles.poolTitleConfirm}>{poolData.title}</Text>
//                      <Text style={styles.poolLocationConfirm}>{poolData.location}</Text>
//                      <View style={styles.separator} />
//                      <Text style={styles.sectionTitleSmall}>Détails</Text>
//                      <View style={styles.detailRow}><Calendar size={20} color="#0891b2" /><Text style={styles.detailText}>{selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text></View>
//                      <View style={styles.detailRow}><Clock size={20} color="#0891b2" /><Text style={styles.detailText}>{timeSlot}</Text></View>
//                      <View style={styles.detailRow}><Users size={20} color="#0891b2" /><Text style={styles.detailText}>{guestCount} personne{guestCount > 1 ? 's' : ''}</Text></View>
//                  </Animated.View>

//                  {/* ... Section Paiement ... */}
//                  <Animated.View style={styles.paymentSection} entering={FadeIn.delay(200)}>
//                      <Text style={styles.sectionTitle}>Mode de paiement</Text>
//                      <View style={styles.paymentOption}><CreditCard size={24} color="#0891b2" /><View style={styles.paymentOptionContent}><Text style={styles.paymentOptionTitle}>Carte bancaire</Text><Text style={styles.paymentOptionSubtitle}>Paiement sécurisé à venir</Text></View></View>
//                  </Animated.View>

//                  {/* ... Section Récapitulatif Prix ... */}
//                  <Animated.View style={styles.summary} entering={FadeIn.delay(300)}>
//                      <View style={styles.summaryHeader}><Text style={styles.sectionTitle}>Récapitulatif</Text><TouchableOpacity style={styles.infoButton} onPress={() => setShowFeesInfo(!showFeesInfo)}><Info size={20} color="#64748b" /></TouchableOpacity></View>
//                      <View style={styles.summaryRow}><Text style={styles.summaryLabel}>{guestCount} pers. × {durationHours}h × {formatPrice(poolData.price_per_hour)}</Text><Text style={styles.summaryValue}>{formatPrice(pricing.subtotal)}</Text></View>
//                      <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Frais de service</Text><Text style={styles.summaryValue}>{formatPrice(pricing.guestFee)}</Text></View>
//                      {showFeesInfo && ( <View style={styles.feesInfo}><Text style={styles.feesInfoText}>Les frais de service nous aident à maintenir la plateforme et à assurer votre sécurité.</Text></View> )}
//                      <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>{formatPrice(pricing.totalPrice)}</Text></View>
//                  </Animated.View>

//                  {/* Afficher l'erreur d'INSERTION si elle existe */}
//                  {bookingError && <Text style={[styles.errorText, {marginTop: 15}]}>{bookingError}</Text>}

//             </ScrollView>

//             <View style={styles.footer}>
//                  <TouchableOpacity
//                      style={[styles.confirmButton, (isProcessing || isLoadingAuth || loadingPool) && styles.confirmButtonDisabled]} // Condition MAJ
//                      onPress={handleConfirmBooking}
//                      disabled={isProcessing || isLoadingAuth || loadingPool} // Condition MAJ
//                  >
//                      {isProcessing || isLoadingAuth || loadingPool ? ( // Condition MAJ
//                          <ActivityIndicator size="small" color="#ffffff" />
//                      ) : (
//                          <Text style={styles.confirmButtonText}>Confirmer et Payer {formatPrice(pricing.totalPrice)}</Text>
//                      )}
//                  </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     );
// }

// // --- Styles --- (utiliser les styles précédents)
// const styles = StyleSheet.create({
//     // ... Coller tous les styles de la version précédente ici ...
//      container: { flex: 1, backgroundColor: '#ffffff' },
//      loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//      errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20},
//      errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
//      headerStatic: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? 40 : 60, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
//      backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
//      headerTitleStatic: { flex: 1, textAlign: 'center', fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b' },
//      content: { flex: 1, padding: 16 },
//      bookingDetails: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 20, marginBottom: 24 },
//      sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 16 },
//      sectionTitleSmall: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#374151', marginBottom: 12 },
//      poolTitleConfirm: { fontFamily: 'Montserrat-SemiBold', fontSize: 18, color: '#111827', marginBottom: 4 },
//      poolLocationConfirm: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginBottom: 12 },
//      separator: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
//      detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
//      detailText: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1e293b', flexShrink: 1 },
//      paymentSection: { marginBottom: 24 },
//      paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#f0f9ff', borderRadius: 12, borderWidth: 1, borderColor: '#e0f2fe' },
//      paymentOptionContent: { flex: 1, marginLeft: 12 },
//      paymentOptionTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#1e293b' },
//      paymentOptionSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b' },
//      summary: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 20, marginBottom: 20 },
//      summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
//      infoButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
//      summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
//      summaryLabel: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', flexShrink: 1, marginRight: 10 },
//      summaryValue: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#1e293b' },
//      feesInfo: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, marginVertical: 8, borderWidth: 1, borderColor: '#e5e7eb'},
//      feesInfoText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#64748b', lineHeight: 18 },
//      totalRow: { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12, marginTop: 8 },
//      totalLabel: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b' },
//      totalValue: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#0891b2' },
//      footer: { padding: 16, paddingBottom: Platform.OS === 'web' ? 16 : 34, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
//      confirmButton: { backgroundColor: '#0891b2', paddingVertical: 14, borderRadius: 12, alignItems: 'center', height: 52, justifyContent: 'center' },
//      confirmButtonDisabled: { backgroundColor: '#94a3b8', opacity: 0.7 },
//      confirmButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
//      buttonLink: { marginTop: 15, paddingVertical: 10 },
//      buttonLinkText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2', textAlign: 'center' }
// });



// // Dans app/booking/confirm.tsx
// // VERSION CORRIGÉE avec logs et formatage date sécurisé

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
//     ActivityIndicator, Alert, SafeAreaView // Imports nécessaires
// } from 'react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import { Calendar, Clock, Users, CreditCard, ChevronLeft, Info, AlertCircle } from 'lucide-react-native'; // AlertCircle ajouté
// import { router, useLocalSearchParams, Stack } from 'expo-router';
// import Animated, { FadeIn } from 'react-native-reanimated';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/hooks/useAuth';
// import { calculatePricing, formatPrice } from '@/utils/pricing'; // Assurez-vous que ce chemin est correct
// import { parse, setHours, setMinutes, setSeconds, setMilliseconds, format } from 'date-fns'; // format ajouté
// import { fr } from 'date-fns/locale'; // locale fr importée

// // Interface PoolData (inchangée)
// interface PoolData {
//     title: string;
//     location: string | null;
//     price_per_hour: number;
//     capacity: number | null;
// }

// export default function BookingConfirmScreen() {
//     const params = useLocalSearchParams<{
//         poolId: string;
//         date: string;
//         timeSlot: string;
//         guestCount: string;
//     }>();

//     // --- AJOUT LOGS pour vérifier les paramètres ---
//     console.log('>>> ConfirmScreen PARAMS reçus:', JSON.stringify(params));
//     console.log('>>> ConfirmScreen typeof params.date:', typeof params.date);
//     console.log('>>> ConfirmScreen params.date value:', params.date);
//     // -------------------------------------------

//     const { user, isVerified, isLoading: isLoadingAuth } = useAuth(); // isVerified et isLoadingAuth récupérés
//     const [poolData, setPoolData] = useState<PoolData | null>(null);
//     const [loadingPool, setLoadingPool] = useState(true);
//     const [bookingError, setBookingError] = useState<string | null>(null);
//     const [fetchPoolError, setFetchPoolError] = useState<string | null>(null);
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [showFeesInfo, setShowFeesInfo] = useState(false);

//     // Parser les paramètres
//     const guestCount = parseInt(params.guestCount || '1', 10);
//     // Création de selectedDate (gardée pour référence si besoin, mais on utilisera startTime pour l'affichage)
//     const selectedDate = params.date ? new Date(params.date) : new Date();
//     const timeSlot = params.timeSlot || '';

//     // --- AJOUT LOG pour vérifier selectedDate ---
//     console.log('>>> ConfirmScreen selectedDate object:', selectedDate);
//     console.log('>>> ConfirmScreen selectedDate is valid Date:', selectedDate instanceof Date && !isNaN(selectedDate.getTime()));
//     // -----------------------------------------

//     // --- Calculer start_time, end_time, duration ---
//     let startTime: Date | null = null;
//     let endTime: Date | null = null;
//     let durationHours = 0;
//     if (timeSlot) {
//         try {
//             const parts = timeSlot.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
//             if (parts) {
//                 const startHour = parseInt(parts[1], 10); const startMinute = parseInt(parts[2], 10);
//                 const endHour = parseInt(parts[3], 10); const endMinute = parseInt(parts[4], 10);
//                 // Utiliser selectedDate (qui est déjà initialisée) comme base pour l'heure
//                 startTime = setMilliseconds(setSeconds(setMinutes(setHours(selectedDate, startHour), startMinute), 0), 0);
//                 endTime = setMilliseconds(setSeconds(setMinutes(setHours(selectedDate, endHour), endMinute), 0), 0);
//                 if (startTime instanceof Date && !isNaN(startTime.getTime()) && endTime instanceof Date && !isNaN(endTime.getTime())) {
//                    durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
//                    console.log('>>> ConfirmScreen startTime:', startTime, 'endTime:', endTime, 'duration:', durationHours); // Log des dates calculées
//                 } else {
//                     throw new Error("Date/heure de début ou fin invalide après calcul.");
//                 }
//             } else {
//                  console.error("Format timeSlot invalide:", timeSlot);
//                  // Peut-être définir une erreur ici ? setError("Format d'heure invalide.");
//             }
//         } catch(e) {
//             console.error("Erreur parsing/calcul date/heure:", e);
//             // Peut-être définir une erreur ici ? setError("Erreur calcul date/heure.");
//         }
//     }
//     // -------------------------------------------------

//     const [fontsLoaded, fontError] = useFonts({
//          'Montserrat-Bold': Montserrat_700Bold,
//          'Montserrat-SemiBold': Montserrat_600SemiBold,
//          'Montserrat-Regular': Montserrat_400Regular,
//      });

//     // --- Fetch données depuis la table 'pools' (inchangé par rapport à la dernière correction) ---
//     const fetchPoolData = useCallback(async () => {
//         if (!params.poolId) { setFetchPoolError("ID de l'annonce manquant."); setLoadingPool(false); return; }
//         setLoadingPool(true); setFetchPoolError(null);
//         console.log(`🚀 Fetching APPROVED pool data from 'pools' table for ID: ${params.poolId}`);
//         try {
//             const { data, error } = await supabase
//                 .from('pools')
//                 .select('title, location, price_per_hour, capacity')
//                 .eq('id', params.poolId)
//                 .single();

//             if (error) {
//                  if (error.code === 'PGRST116') {
//                      console.error(`Annonce ${params.poolId} non trouvée dans la table 'pools'.`);
//                      throw new Error("L'annonce sélectionnée n'est plus disponible pour la réservation.");
//                  } throw error;
//              }
//             if (!data || data.price_per_hour == null) { throw new Error("Données de l'annonce invalides ou prix manquant."); }
//             console.log("✅ Approved pool data received from 'pools':", data);
//             setPoolData(data as PoolData);
//         } catch (err: any) { console.error("Error fetching approved pool data:", err); setFetchPoolError(err.message || "Erreur chargement infos annonce."); setPoolData(null); }
//         finally { setLoadingPool(false); }
//     }, [params.poolId]);

//     useEffect(() => { fetchPoolData(); }, [fetchPoolData]);
//     // ---------------------------------

//     // --- Calcul du Prix (inchangé) ---
//     const pricing = poolData?.price_per_hour && durationHours > 0 ? calculatePricing(poolData.price_per_hour, guestCount, durationHours) : { subtotal: 0, guestFee: 0, hostFee: 0, totalPrice: 0 };

//     // --- Fonction de Confirmation (avec check KYC, sans l'Alert si non vérifié) ---
//     const handleConfirmBooking = async () => {
//         if (isLoadingAuth) { console.log("Auth still loading..."); return; }

//         // --- VÉRIFICATION KYC ---
//         if (!isVerified) {
//             console.log("User not verified, booking blocked by UI state.");
//             // L'alerte est remplacée par le message dans l'UI
//             return;
//         }
//         // -----------------------

//         // Vérifications données
//         if (!user || !poolData || !params.poolId || !startTime || !endTime || !guestCount || pricing.totalPrice == null || fetchPoolError) {
//              Alert.alert("Erreur", `Impossible de continuer : ${fetchPoolError || 'Informations manquantes ou invalides.'}`);
//              return;
//         }
//         if (poolData.capacity && guestCount > poolData.capacity) { Alert.alert("Capacité dépassée", `Max ${poolData.capacity} pers.`); return; }

//         setIsProcessing(true); setBookingError(null);
//         console.log("Attempting to insert booking (user is verified)...");
//         const bookingData = { pool_listing_id: params.poolId, user_id: user.id, start_time: startTime.toISOString(), end_time: endTime.toISOString(), guest_count: guestCount, total_price: pricing.totalPrice, status: 'pending' };
//         console.log("Booking data to insert:", bookingData);

//         try { // --- Insertion Supabase (inchangée) ---
//             const { data: insertedBooking, error: insertError } = await supabase.from('bookings').insert(bookingData).select('id').single();
//             if (insertError) throw insertError;
//             if (!insertedBooking?.id) throw new Error("ID réservation manquant après insertion.");
//             console.log("✅ Booking successfully inserted! ID:", insertedBooking.id);
//             router.replace({ pathname: '/booking/success', params: { bookingId: insertedBooking.id } });
//         } catch (err: any) { console.error("Error creating booking:", err); setBookingError(err.message || "Erreur création réservation."); Alert.alert("Échec Réservation", err.message || "Erreur. Veuillez réessayer."); }
//         finally { setIsProcessing(false); }
//     };
//     // -------------------------------------------


//     // --- Rendu ---
//     if (!fontsLoaded || isLoadingAuth || loadingPool) { // Inclure isLoadingAuth
//         return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
//     }
//     if (fontError) { return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
//     if (fetchPoolError || !poolData) { // Utilise fetchPoolError
//          return ( <SafeAreaView style={styles.container}> <Stack.Screen options={{ title: 'Erreur' }} /> <View style={styles.headerStatic}> <TouchableOpacity style={styles.backButton} onPress={router.back}> <ChevronLeft size={24} color="#1e293b" /> </TouchableOpacity> <Text style={styles.headerTitleStatic}>Erreur Réservation</Text><View style={{width: 40}}/> </View> <View style={styles.errorContainer}> <Text style={styles.errorText}>{fetchPoolError || "Impossible de charger les détails."}</Text> <TouchableOpacity style={styles.buttonLink} onPress={router.back}> <Text style={styles.buttonLinkText}>Retour</Text> </TouchableOpacity> </View> </SafeAreaView> );
//      }

//     // Rendu principal
//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ title: 'Confirmer Réservation' }} />
//              <View style={styles.headerStatic}>
//                  <TouchableOpacity style={styles.backButton} onPress={() => router.back()} > <ChevronLeft size={24} color="#1e293b" /> </TouchableOpacity>
//                  <Text style={styles.headerTitleStatic}>Confirmation</Text>
//                  <View style={{width: 40}} />
//              </View>

//             <ScrollView style={styles.content}>
//                 <Animated.View style={styles.bookingDetails} entering={FadeIn.delay(100)}>
//                      <Text style={styles.sectionTitle}>Votre réservation pour</Text>
//                      <Text style={styles.poolTitleConfirm}>{poolData.title}</Text>
//                      <Text style={styles.poolLocationConfirm}>{poolData.location}</Text>
//                      <View style={styles.separator} />
//                      <Text style={styles.sectionTitleSmall}>Détails</Text>
//                      {/* --- CORRECTION AFFICHAGE DATE --- */}
//                      <View style={styles.detailRow}>
//                          <Calendar size={20} color="#0891b2" />
//                          <Text style={styles.detailText}>
//                              {/* Utilise format() de date-fns avec startTime pour plus de sécurité */}
//                              {startTime ? format(startTime, 'EEEE d MMMM', { locale: fr }) : 'Date invalide'}
//                          </Text>
//                      </View>
//                      {/* ------------------------------ */}
//                      <View style={styles.detailRow}><Clock size={20} color="#0891b2" /><Text style={styles.detailText}>{timeSlot}</Text></View>
//                      <View style={styles.detailRow}><Users size={20} color="#0891b2" /><Text style={styles.detailText}>{guestCount} personne{guestCount > 1 ? 's' : ''}</Text></View>
//                  </Animated.View>

//                 <Animated.View style={styles.paymentSection} entering={FadeIn.delay(200)}>
//                     {/* ... Section Paiement (inchangée) ... */}
//                 </Animated.View>

//                 <Animated.View style={styles.summary} entering={FadeIn.delay(300)}>
//                     {/* ... Section Récapitulatif Prix (inchangée) ... */}
//                 </Animated.View>

//                  {/* Afficher l'erreur d'INSERTION si elle existe */}
//                  {bookingError && <Text style={[styles.errorText, {marginTop: 15}]}>{bookingError}</Text>}

//             </ScrollView>

//              {/* Footer avec message KYC conditionnel */}
//             <View style={styles.footer}>
//                  {!isLoadingAuth && !isVerified && (
//                      <View style={styles.verificationNeededContainer}>
//                          <AlertCircle size={20} color="#d97706" />
//                          <View style={styles.verificationNeededTextContainer}>
//                               <Text style={styles.verificationNeededTitle}>Vérification Requise</Text>
//                               <Text style={styles.verificationNeededSubtitle}>Vérifiez votre identité pour pouvoir réserver.</Text>
//                          </View>
//                          <TouchableOpacity style={styles.verifyLinkButton} onPress={() => router.push('/profile/verify')} >
//                              <Text style={styles.verifyLinkButtonText}>Vérifier</Text>
//                          </TouchableOpacity>
//                      </View>
//                  )}
//                  <TouchableOpacity
//                      style={[ styles.confirmButton, (isProcessing || isLoadingAuth || loadingPool || !isVerified) && styles.confirmButtonDisabled ]}
//                      onPress={handleConfirmBooking}
//                      disabled={isProcessing || isLoadingAuth || loadingPool || !isVerified} >
//                      {isProcessing || isLoadingAuth || loadingPool ? ( <ActivityIndicator size="small" color="#ffffff" /> ) : ( <Text style={styles.confirmButtonText}>Confirmer et Payer {formatPrice(pricing.totalPrice)}</Text> )}
//                  </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     );
// }

// // --- Styles --- (Assurez-vous d'inclure les styles ajoutés précédemment pour verificationNeeded*)
// const styles = StyleSheet.create({
//     // ... Coller tous les styles de la version précédente ici ...
//      container: { flex: 1, backgroundColor: '#ffffff' },
//      loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//      errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20},
//      errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
//      headerStatic: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? 40 : 60, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
//      backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
//      headerTitleStatic: { flex: 1, textAlign: 'center', fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b' },
//      content: { flex: 1, padding: 16 },
//      bookingDetails: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 20, marginBottom: 24 },
//      sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 16 },
//      sectionTitleSmall: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#374151', marginBottom: 12 },
//      poolTitleConfirm: { fontFamily: 'Montserrat-SemiBold', fontSize: 18, color: '#111827', marginBottom: 4 },
//      poolLocationConfirm: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginBottom: 12 },
//      separator: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 12 },
//      detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
//      detailText: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1e293b', flexShrink: 1 },
//      paymentSection: { marginBottom: 24 },
//      paymentOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#f0f9ff', borderRadius: 12, borderWidth: 1, borderColor: '#e0f2fe' },
//      paymentOptionContent: { flex: 1, marginLeft: 12 },
//      paymentOptionTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#1e293b' },
//      paymentOptionSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b' },
//      summary: { backgroundColor: '#f8fafc', borderRadius: 16, padding: 20, marginBottom: 20 },
//      summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
//      infoButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb', justifyContent: 'center', alignItems: 'center' },
//      summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
//      summaryLabel: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', flexShrink: 1, marginRight: 10 },
//      summaryValue: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#1e293b' },
//      feesInfo: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, marginVertical: 8, borderWidth: 1, borderColor: '#e5e7eb'},
//      feesInfoText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#64748b', lineHeight: 18 },
//      totalRow: { borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 12, marginTop: 8 },
//      totalLabel: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b' },
//      totalValue: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#0891b2' },
//      footer: { padding: 16, paddingBottom: Platform.OS === 'web' ? 16 : 34, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
//      confirmButton: { backgroundColor: '#0891b2', paddingVertical: 14, borderRadius: 12, alignItems: 'center', height: 52, justifyContent: 'center' },
//      confirmButtonDisabled: { backgroundColor: '#94a3b8', opacity: 0.7 },
//      confirmButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
//      buttonLink: { marginTop: 15, paddingVertical: 10 },
//      buttonLinkText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2', textAlign: 'center' },

//      // --- NOUVEAUX STYLES pour le message de vérification ---
//      verificationNeededContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#fef3c7', gap: 10, },
//      verificationNeededTextContainer: { flex: 1, },
//      verificationNeededTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#b45309', },
//      verificationNeededSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#ca8a04', marginTop: 2, },
//      verifyLinkButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f59e0b', borderRadius: 6, },
//      verifyLinkButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#ffffff', },
// });


// // Dans app/booking/confirm.tsx
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//     View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
//     Platform, ActivityIndicator, Alert, SafeAreaView
// } from 'react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import {
//     ArrowLeft, Calendar, Clock, Users, DollarSign, Info,
//     CheckCircle, XCircle, AlertCircle
// } from 'lucide-react-native';
// import { router, Stack, useLocalSearchParams } from 'expo-router';
// import { format, differenceInHours, addHours } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/hooks/useAuth';

// // Interface PoolData MISE À JOUR
// interface BookingPoolData {
//     title: string;
//     location: string | null; // Gardons-le si besoin pour affichage
//     price_per_hour: number;
//     capacity: number | null;
//     owner_id: string; // <-- AJOUTÉ: ID de l'hôte propriétaire
//     // available_time_slots: string[] | null; // Déjà présent dans votre code précédent
// }

// export default function BookingConfirmScreen() {
//     const params = useLocalSearchParams();
    
//     // Params formatés avec valeurs par défaut
//     const poolId = params.poolId as string;
//     const startTimeStr = params.startTime as string;
//     const endTimeStr = params.endTime as string;
//     const guestCountStr = params.guestCount as string;
    
//     // États locaux
//     const { user, isVerified, isLoading: isLoadingAuth } = useAuth(); // Récupérer l'utilisateur connecté
//     const [poolData, setPoolData] = useState<BookingPoolData | null>(null);
//     const [loadingPool, setLoadingPool] = useState(true);
//     const [fetchPoolError, setFetchPoolError] = useState<string | null>(null);
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [bookingError, setBookingError] = useState<string | null>(null);
    
//     // Convertir les paramètres
//     const startTime = startTimeStr ? new Date(startTimeStr) : null;
//     const endTime = endTimeStr ? new Date(endTimeStr) : null;
//     const guestCount = guestCountStr ? parseInt(guestCountStr, 10) : null;
    
//     // Charger les polices
//     const [fontsLoaded, fontError] = useFonts({
//         'Montserrat-Bold': Montserrat_700Bold,
//         'Montserrat-SemiBold': Montserrat_600SemiBold,
//         'Montserrat-Regular': Montserrat_400Regular,
//     });

//     // --- Fetch données depuis la table 'pools' (MISE À JOUR: ajoute owner_id) ---
//     const fetchPoolData = useCallback(async () => {
//         if (!poolId) {
//             setFetchPoolError("ID de piscine manquant.");
//             setLoadingPool(false);
//             return;
//         }
//         setLoadingPool(true);
//         setFetchPoolError(null);
//         console.log(`🚀 Fetching APPROVED pool data for ID: ${poolId}`);
//         try {
//             const { data, error } = await supabase
//                 .from('pools') // Correct car on réserve une piscine approuvée
//                 .select('title, location, price_per_hour, capacity, owner_id') // <-- AJOUTÉ owner_id
//                 .eq('id', poolId)
//                 .single(); // single() est mieux si l'ID est PK

//             if (error) {
//                 console.error("Error fetching pool data:", error);
//                 setFetchPoolError(`Erreur lors de la récupération des données: ${error.message}`);
//                 return;
//             }
            
//             if (!data || data.price_per_hour == null || !data.owner_id) { // Vérifier aussi owner_id
//                 throw new Error("Données de l'annonce invalides, prix ou propriétaire manquant.");
//             }
            
//             console.log("✅ Pool data received:", data);
//             setPoolData(data as BookingPoolData); // Cast vers l'interface mise à jour
//         } catch (err: any) {
//             console.error("Error in fetchPoolData:", err);
//             setFetchPoolError(err.message || "Erreur lors de la récupération des données de la piscine.");
//         }
//         finally {
//             setLoadingPool(false);
//         }
//     }, [poolId]);

//     useEffect(() => {
//         fetchPoolData();
//     }, [fetchPoolData]);

//     // Calcul du prix total
//     const pricing = useMemo(() => {
//         if (!poolData || !startTime || !endTime) {
//             return { hours: 0, basePrice: 0, totalPrice: 0 };
//         }
        
//         const hours = differenceInHours(endTime, startTime);
//         const basePrice = poolData.price_per_hour;
//         const totalPrice = hours * basePrice;
        
//         return { hours, basePrice, totalPrice };
//     }, [poolData, startTime, endTime]);

//     // --- Fonction de Confirmation (MISE À JOUR: ajoute création conversation) ---
//     const handleConfirmBooking = async () => {
//         // Vérifications de base
//         if (!user) {
//             Alert.alert("Erreur", "Vous devez être connecté pour effectuer une réservation.");
//             return;
//         }
        
//         if (!isVerified) {
//             Alert.alert("Vérification requise", "Vous devez vérifier votre identité avant de pouvoir réserver.");
//             router.push('/profile/verify');
//             return;
//         }
        
//         if (!poolData || !poolId || !startTime || !endTime || !guestCount || pricing.totalPrice == null || !poolData.owner_id /* Vérif ajoutée */ || fetchPoolError) {
//             Alert.alert("Erreur", `Impossible de continuer : ${fetchPoolError || 'Informations manquantes ou invalides (vérifiez propriétaire).'}`);
//             return;
//         }
        
//         // Vérifier la capacité
//         if (poolData.capacity && guestCount > poolData.capacity) {
//             Alert.alert("Capacité dépassée", `Cette piscine peut accueillir maximum ${poolData.capacity} personnes.`);
//             return;
//         }

//         setIsProcessing(true);
//         setBookingError(null);
//         console.log("Attempting to insert booking as PENDING...");

//         // Données pour l'insertion booking (status: 'pending')
//         const bookingData = {
//             pool_listing_id: poolId, // Utiliser l'ID de l'annonce (qui est le même dans pools et pool_listings)
//             user_id: user.id,
//             start_time: startTime.toISOString(),
//             end_time: endTime.toISOString(),
//             guest_count: guestCount,
//             total_price: pricing.totalPrice,
//             status: 'pending' // <-- Changé en 'pending' comme vous l'avez fait
//         };
//         console.log("Booking data to insert:", bookingData);

//         try {
//             // 1. Insérer la réservation
//             const { data: insertedBooking, error: insertError } = await supabase
//                 .from('bookings')
//                 .insert(bookingData)
//                 .select('id') // Récupérer l'ID de la réservation créée
//                 .single();

//             if (insertError) throw insertError;
//             if (!insertedBooking?.id) throw new Error("ID réservation manquant après insertion.");

//             console.log("✅ Booking successfully inserted! ID:", insertedBooking.id);

//             // --- AJOUT : 2. Créer la conversation associée ---
//             console.log(`Attempting to create conversation for booking ${insertedBooking.id}...`);
//             const conversationData = {
//                 booking_id: insertedBooking.id,
//                 swimmer_id: user.id, // L'utilisateur actuel (nageur)
//                 host_id: poolData.owner_id, // L'ID de l'hôte récupéré
//                 status: 'locked' // Statut initial (ou 'pre-message' si vous préférez)
//             };
//             const { error: convError } = await supabase
//                 .from('conversations')
//                 .insert(conversationData);

//             if (convError) {
//                 // Que faire si la conversation ne peut pas être créée ?
//                 // Option 1: Logguer l'erreur et continuer (la réservation existe quand même)
//                 console.warn(`Could not create conversation for booking ${insertedBooking.id}:`, convError);
//                 // Option 2: Essayer d'annuler la réservation ? Plus complexe.
//             } else {
//                 console.log(`✅ Conversation created for booking ${insertedBooking.id}`);
//             }
//             // -------------------------------------------

//             // 3. Rediriger vers la page de succès (ou une page indiquant "en attente d'approbation")
//             router.replace({ pathname: '/booking/success', params: { bookingId: insertedBooking.id, status: 'pending' } }); // Passer le statut

//         } catch (err: any) {
//             console.error("Error creating booking:", err);
//             setBookingError(err.message || "Erreur lors de la création de la réservation.");
//             Alert.alert("Erreur", `Impossible de créer la réservation: ${err.message || "Erreur inconnue"}`);
//         }
//         finally {
//             setIsProcessing(false);
//         }
//     };

//     // Affichage pendant chargement des polices
//     if (!fontsLoaded) {
//         return (
//             <SafeAreaView style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#0891b2" />
//                 <Text style={styles.loadingText}>Chargement...</Text>
//             </SafeAreaView>
//         );
//     }

//     // Rendu principal
//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ headerShown: false }} />
            
//             <View style={styles.header}>
//                 <TouchableOpacity 
//                     style={styles.backButton} 
//                     onPress={() => router.back()}
//                 >
//                     <ArrowLeft color="#475569" size={22} />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>Confirmer la réservation</Text>
//                 <View style={{ width: 22 }} />
//             </View>
            
//             <ScrollView style={styles.content}>
//                 {/* Affichage des erreurs */}
//                 {fetchPoolError && (
//                     <View style={styles.errorCard}>
//                         <AlertCircle color="#b91c1c" size={24} />
//                         <Text style={styles.errorText}>{fetchPoolError}</Text>
//                     </View>
//                 )}
                
//                 {/* Détails de la piscine */}
//                 {loadingPool ? (
//                     <ActivityIndicator style={{ marginVertical: 40 }} size="large" color="#0891b2" />
//                 ) : poolData ? (
//                     <View style={styles.poolCard}>
//                         <Text style={styles.poolName}>{poolData.title}</Text>
//                         {poolData.location && (
//                             <Text style={styles.poolLocation}>{poolData.location}</Text>
//                         )}
//                     </View>
//                 ) : null}
                
//                 {/* Détails de la réservation */}
//                 {startTime && endTime && (
//                     <View style={styles.bookingDetailsCard}>
//                         <Text style={styles.sectionTitle}>Détails de la réservation</Text>
                        
//                         <View style={styles.detailRow}>
//                             <View style={styles.detailIconContainer}>
//                                 <Calendar size={18} color="#475569" />
//                             </View>
//                             <View style={styles.detailContent}>
//                                 <Text style={styles.detailLabel}>Date</Text>
//                                 <Text style={styles.detailValue}>
//                                     {format(startTime, 'EEEE d MMMM yyyy', { locale: fr })}
//                                 </Text>
//                             </View>
//                         </View>
                        
//                         <View style={styles.detailRow}>
//                             <View style={styles.detailIconContainer}>
//                                 <Clock size={18} color="#475569" />
//                             </View>
//                             <View style={styles.detailContent}>
//                                 <Text style={styles.detailLabel}>Horaire</Text>
//                                 <Text style={styles.detailValue}>
//                                     {format(startTime, 'HH:mm', { locale: fr })} - {format(endTime, 'HH:mm', { locale: fr })} ({pricing.hours}h)
//                                 </Text>
//                             </View>
//                         </View>
                        
//                         <View style={styles.detailRow}>
//                             <View style={styles.detailIconContainer}>
//                                 <Users size={18} color="#475569" />
//                             </View>
//                             <View style={styles.detailContent}>
//                                 <Text style={styles.detailLabel}>Nombre de personnes</Text>
//                                 <Text style={styles.detailValue}>{guestCount} {guestCount === 1 ? 'personne' : 'personnes'}</Text>
//                             </View>
//                         </View>
//                     </View>
//                 )}
                
//                 {/* Récapitulatif des prix */}
//                 {poolData && startTime && endTime && (
//                     <View style={styles.pricingCard}>
//                         <Text style={styles.sectionTitle}>Récapitulatif des prix</Text>
                        
//                         <View style={styles.priceRow}>
//                             <Text style={styles.priceLabel}>{pricing.hours} heures × {poolData.price_per_hour} MAD/heure</Text>
//                             <Text style={styles.priceValue}>{pricing.totalPrice} MAD</Text>
//                         </View>
                        
//                         <View style={styles.totalRow}>
//                             <Text style={styles.totalLabel}>Total</Text>
//                             <Text style={styles.totalValue}>{pricing.totalPrice} MAD</Text>
//                         </View>
//                     </View>
//                 )}
                
//                 {/* Note sur le statut "en attente" */}
//                 <View style={styles.infoCard}>
//                     <Info size={20} color="#0891b2" />
//                     <Text style={styles.infoText}>
//                         Votre réservation sera <Text style={styles.infoHighlight}>en attente</Text> jusqu'à ce que l'hôte la confirme.
//                     </Text>
//                 </View>
                
//                 {/* Placeholder pour écart en bas */}
//                 <View style={{ height: 80 }} />
//             </ScrollView>
            
//             {/* Bouton Confirmer */}
//             <View style={styles.footer}>
//                 <TouchableOpacity 
//                     style={[styles.confirmButton, (isProcessing || loadingPool) && styles.disabledButton]} 
//                     onPress={handleConfirmBooking}
//                     disabled={isProcessing || loadingPool}
//                 >
//                     {isProcessing ? (
//                         <ActivityIndicator color="#ffffff" size="small" />
//                     ) : (
//                         <>
//                             <CheckCircle size={20} color="#ffffff" />
//                             <Text style={styles.confirmButtonText}>Confirmer la réservation</Text>
//                         </>
//                     )}
//                 </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     );
// }

// // Styles
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f8fafc',
//     },
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#f8fafc',
//     },
//     loadingText: {
//         marginTop: 12,
//         fontFamily: 'Montserrat-Regular',
//         fontSize: 16,
//         color: '#64748b',
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 16,
//         paddingTop: Platform.OS === 'ios' ? 10 : 40,
//         paddingBottom: 10,
//         backgroundColor: '#ffffff',
//         borderBottomWidth: 1,
//         borderBottomColor: '#e5e7eb',
//     },
//     backButton: {
//         padding: 8,
//         borderRadius: 8,
//         backgroundColor: '#f1f5f9',
//     },
//     headerTitle: {
//         fontFamily: 'Montserrat-SemiBold',
//         fontSize: 18,
//         color: '#1e293b',
//     },
//     content: {
//         flex: 1,
//         padding: 16,
//     },
//     errorCard: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#fef2f2',
//         padding: 16,
//         borderRadius: 12,
//         marginBottom: 16,
//         gap: 12,
//         borderWidth: 1,
//         borderColor: '#fecaca',
//     },
//     errorText: {
//         fontFamily: 'Montserrat-Regular',
//         fontSize: 14,
//         color: '#b91c1c',
//         flex: 1,
//     },
//     poolCard: {
//         backgroundColor: '#ffffff',
//         padding: 16,
//         borderRadius: 12,
//         marginBottom: 16,
//         borderWidth: 1,
//         borderColor: '#e5e7eb',
//     },
//     poolName: {
//         fontFamily: 'Montserrat-Bold',
//         fontSize: 18,
//         color: '#1e293b',
//         marginBottom: 4,
//     },
//     poolLocation: {
//         fontFamily: 'Montserrat-Regular',
//         fontSize: 14,
//         color: '#64748b',
//     },
//     bookingDetailsCard: {
//         backgroundColor: '#ffffff',
//         padding: 16,
//         borderRadius: 12,
//         marginBottom: 16,
//         borderWidth: 1,
//         borderColor: '#e5e7eb',
//     },
//     sectionTitle: {
//         fontFamily: 'Montserrat-Bold',
//         fontSize: 16,
//         color: '#1e293b',
//         marginBottom: 12,
//     },
//     detailRow: {
//         flexDirection: 'row',
//         marginBottom: 12,
//     },
//     detailIconContainer: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: '#f1f5f9',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 12,
//     },
//     detailContent: {
//         flex: 1,
//         justifyContent: 'center',
//     },
//     detailLabel: {
//         fontFamily: 'Montserrat-Regular',
//         fontSize: 12,
//         color: '#64748b',
//         marginBottom: 2,
//     },
//     detailValue: {
//         fontFamily: 'Montserrat-SemiBold',
//         fontSize: 15,
//         color: '#1e293b',
//     },
//     pricingCard: {
//         backgroundColor: '#ffffff',
//         padding: 16,
//         borderRadius: 12,
//         marginBottom: 16,
//         borderWidth: 1,
//         borderColor: '#e5e7eb',
//     },
//     priceRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 8,
//     },
//     priceLabel: {
//         fontFamily: 'Montserrat-Regular',
//         fontSize: 14,
//         color: '#475569',
//     },
//     priceValue: {
//         fontFamily: 'Montserrat-SemiBold',
//         fontSize: 14,
//         color: '#475569',
//     },
//     totalRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginTop: 12,
//         paddingTop: 12,
//         borderTopWidth: 1,
//         borderTopColor: '#e5e7eb',
//     },
//     totalLabel: {
//         fontFamily: 'Montserrat-Bold',
//         fontSize: 16,
//         color: '#1e293b',
//     },
//     totalValue: {
//         fontFamily: 'Montserrat-Bold',
//         fontSize: 16,
//         color: '#0891b2',
//     },
//     infoCard: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         backgroundColor: '#f0f9ff',
//         padding: 16,
//         borderRadius: 12,
//         marginBottom: 16,
//         gap: 12,
//         borderWidth: 1,
//         borderColor: '#bae6fd',
//     },
//     infoText: {
//         fontFamily: 'Montserrat-Regular',
//         fontSize: 14,
//         color: '#0c4a6e',
//         flex: 1,
//     },
//     infoHighlight: {
//         fontFamily: 'Montserrat-SemiBold',
//     },
//     footer: {
//         position: 'absolute',
//         bottom: 0,
//         left: 0,
//         right: 0,
//         backgroundColor: '#ffffff',
//         padding: 16,
//         paddingBottom: Platform.OS === 'ios' ? 34 : 16,
//         borderTopWidth: 1,
//         borderTopColor: '#e5e7eb',
//     },
//     confirmButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#0891b2',
//         padding: 16,
//         borderRadius: 12,
//         gap: 10,
//     },
//     confirmButtonText: {
//         fontFamily: 'Montserrat-SemiBold',
//         fontSize: 16,
//         color: '#ffffff',
//     },
//     disabledButton: {
//         backgroundColor: '#94a3b8',
//     },
// });





// // Dans app/booking/confirm.tsx
// // VERSION CORRIGÉE : Calcul du prix total prend en compte le nombre d'invités

// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//     View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
//     Platform, ActivityIndicator, Alert, SafeAreaView
// } from 'react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import {
//     ArrowLeft, Calendar, Clock, Users, DollarSign, Info,
//     CheckCircle, AlertCircle
// } from 'lucide-react-native';
// import { router, Stack, useLocalSearchParams } from 'expo-router';
// import { format, differenceInHours, parseISO, isValid } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/hooks/useAuth';

// // Interface PoolData MISE À JOUR
// interface BookingPoolData {
//     title: string;
//     location: string | null;
//     price_per_hour: number;
//     capacity: number | null;
//     owner_id: string; // <-- ID de l'hôte propriétaire
// }

// export default function BookingConfirmScreen() {
//     const params = useLocalSearchParams();

//     // Params formatés (assurer que ce sont des strings)
//     const poolId = params.poolId as string ?? '';
//     const startTimeStr = params.startTime as string ?? '';
//     const endTimeStr = params.endTime as string ?? '';
//     const guestCountStr = params.guestCount as string ?? '1';

//     // États locaux
//     const { user, isVerified, isLoading: isLoadingAuth } = useAuth();
//     const [poolData, setPoolData] = useState<BookingPoolData | null>(null);
//     const [loadingPool, setLoadingPool] = useState(true);
//     const [fetchPoolError, setFetchPoolError] = useState<string | null>(null);
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [bookingError, setBookingError] = useState<string | null>(null);

//     // Convertir les paramètres en Dates (plus robuste)
//     const startTime = useMemo(() => {
//         try { return startTimeStr ? parseISO(startTimeStr) : null; } catch { return null; }
//     }, [startTimeStr]);
//     const endTime = useMemo(() => {
//         try { return endTimeStr ? parseISO(endTimeStr) : null; } catch { return null; }
//     }, [endTimeStr]);
//     const guestCount = useMemo(() => parseInt(guestCountStr, 10), [guestCountStr]);

//     // Charger les polices
//     const [fontsLoaded, fontError] = useFonts({
//         'Montserrat-Bold': Montserrat_700Bold,
//         'Montserrat-SemiBold': Montserrat_600SemiBold,
//         'Montserrat-Regular': Montserrat_400Regular,
//     });

//     // --- Fetch données depuis la table 'pools' ---
//     const fetchPoolData = useCallback(async () => {
//         if (!poolId) { setFetchPoolError("ID de piscine manquant."); setLoadingPool(false); return; }
//         setLoadingPool(true); setFetchPoolError(null);
//         console.log(`🚀 Fetching pool data for ID: ${poolId} from 'pools' table.`);
//         try {
//             const { data, error } = await supabase
//                 .from('pools') // Interroge la table 'pools'
//                 .select('title, location, price_per_hour, capacity, owner_id')
//                 .eq('id', poolId)
//                 .single();

//             if (error) {
//                  if (error.code === 'PGRST116') { throw new Error("Piscine introuvable."); }
//                  throw error;
//             }
//             if (!data || !data.owner_id) throw new Error("Données piscine invalides ou propriétaire manquant.");

//             console.log("✅ Pool data received:", data);
//             setPoolData(data as BookingPoolData);
//         } catch (err: any) {
//             console.error("Error in fetchPoolData:", err);
//             setFetchPoolError(err.message || "Erreur chargement données piscine.");
//             setPoolData(null);
//         } finally {
//             setLoadingPool(false);
//         }
//     }, [poolId]);

//     useEffect(() => { fetchPoolData(); }, [fetchPoolData]);

//     // Calcul du prix total (CORRIGÉ : inclut guestCount)
//     const pricing = useMemo(() => {
//         // Vérifier si toutes les données nécessaires sont valides
//         if (!poolData || !startTime || !endTime || !isValid(startTime) || !isValid(endTime) || isNaN(guestCount) || guestCount < 1) {
//             return { hours: 0, basePrice: 0, totalPrice: 0, pricePerGuestPerHour: 0 };
//         }
//         // Calculer la durée en heures
//         const hours = differenceInHours(endTime, startTime);
//         if (hours <= 0) return { hours: 0, basePrice: 0, totalPrice: 0, pricePerGuestPerHour: 0 };

//         // Récupérer le prix par heure (s'assurer qu'il est défini, sinon 0)
//         const pricePerGuestPerHour = poolData.price_per_hour ?? 0;
//         // Calculer le prix total en multipliant par la durée ET le nombre d'invités
//         const totalPrice = hours * pricePerGuestPerHour * guestCount;

//         return { hours, basePrice: pricePerGuestPerHour * hours, totalPrice, pricePerGuestPerHour }; // Retourner aussi le prix/h pour affichage
//     }, [poolData, startTime, endTime, guestCount]); // guestCount ajouté aux dépendances

//     // --- Fonction de Confirmation (inchangée) ---
//     const handleConfirmBooking = async () => {
//         if (!user) { Alert.alert("Erreur", "Connectez-vous pour réserver."); return; }
//         if (!isVerified) { Alert.alert("Vérification requise", "Vérifiez votre identité avant de réserver."); router.push('/profile/verify'); return; }
//         if (!poolData || !poolId || !startTime || !endTime || !guestCount || isNaN(guestCount) || !isValid(startTime) || !isValid(endTime) || !poolData.owner_id || fetchPoolError) { Alert.alert("Erreur", `Impossible de continuer : ${fetchPoolError || 'Informations manquantes/invalides.'}`); return; }
//         if (poolData.capacity && guestCount > poolData.capacity) { Alert.alert("Capacité dépassée", `Max ${poolData.capacity} personnes.`); return; }
//         if (pricing.hours <= 0) { Alert.alert("Erreur", "Durée de réservation invalide."); return; }

//         // !!! Ajouter la vérification dynamique de disponibilité ici !!!

//         setIsProcessing(true); setBookingError(null);
//         console.log("Attempting to insert booking as PENDING...");

//         const bookingData = {
//             pool_listing_id: poolId,
//             user_id: user.id,
//             start_time: startTime.toISOString(),
//             end_time: endTime.toISOString(),
//             guest_count: guestCount,
//             total_price: pricing.totalPrice, // Utilise le prix total calculé
//             status: 'pending'
//         };

//         try {
//             // 1. Insérer la réservation
//             const { data: insertedBooking, error: insertError } = await supabase.from('bookings').insert(bookingData).select('id').single();
//             if (insertError) throw insertError;
//             if (!insertedBooking?.id) throw new Error("ID réservation manquant après insertion.");
//             console.log("✅ Booking successfully inserted! ID:", insertedBooking.id);

//             // 2. Créer la conversation associée
//             console.log(`Attempting to create conversation for booking ${insertedBooking.id}...`);
//             const conversationData = { booking_id: insertedBooking.id, swimmer_id: user.id, host_id: poolData.owner_id, status: 'locked' };
//             const { error: convError } = await supabase.from('conversations').insert(conversationData);
//             if (convError) { console.warn(`Could not create conversation for booking ${insertedBooking.id}:`, convError); }
//             else { console.log(`✅ Conversation created for booking ${insertedBooking.id}`); }

//             // 3. Rediriger
//             router.replace({ pathname: '/booking/success', params: { bookingId: insertedBooking.id, status: 'pending' } });

//         } catch (err: any) {
//             console.error("Error creating booking or conversation:", err);
//             setBookingError(err.message || "Erreur lors de la création.");
//             Alert.alert("Erreur", `Impossible de créer la réservation: ${err.message || "Erreur inconnue"}`);
//         } finally {
//             setIsProcessing(false);
//         }
//     };

//     // --- Rendu ---
//      if (!fontsLoaded || fontError) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator /></SafeAreaView>; }
//      if (loadingPool || isLoadingAuth) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /><Text style={styles.loadingText}>Chargement...</Text></SafeAreaView>; }
//      if (!isLoadingAuth && !user) { router.replace('/(auth)/sign-in'); return null; }

//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ headerShown: false }} />

//             {/* Header */}
//             <View style={styles.header}>
//                 <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//                     <ArrowLeft color="#475569" size={22} />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>Confirmer la réservation</Text>
//                 <View style={{ width: 40 }} />
//             </View>

//             <ScrollView style={styles.content}>
//                 {/* Erreur Fetch Piscine */}
//                 {fetchPoolError && ( <View style={styles.errorCard}><AlertCircle color="#b91c1c" size={24} /><Text style={styles.errorText}>{fetchPoolError}</Text></View> )}

//                 {/* Détails Piscine */}
//                 {poolData && ( <View style={styles.poolCard}><Text style={styles.poolName}>{poolData.title}</Text>{poolData.location && <Text style={styles.poolLocation}>{poolData.location}</Text>}</View> )}

//                 {/* Détails Réservation */}
//                 {startTime && endTime && isValid(startTime) && isValid(endTime) && guestCount && (
//                     <View style={styles.bookingDetailsCard}>
//                         <Text style={styles.sectionTitle}>Détails de la réservation</Text>
//                         <View style={styles.detailRow}><View style={styles.detailIconContainer}><Calendar size={18} color="#475569" /></View><View style={styles.detailContent}><Text style={styles.detailLabel}>Date</Text><Text style={styles.detailValue}>{format(startTime, 'EEEE d MMMM yyyy', { locale: fr })}</Text></View></View>
//                         <View style={styles.detailRow}><View style={styles.detailIconContainer}><Clock size={18} color="#475569" /></View><View style={styles.detailContent}><Text style={styles.detailLabel}>Horaire</Text><Text style={styles.detailValue}>{format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')} ({pricing.hours}h)</Text></View></View>
//                         <View style={styles.detailRow}><View style={styles.detailIconContainer}><Users size={18} color="#475569" /></View><View style={styles.detailContent}><Text style={styles.detailLabel}>Nombre de personnes</Text><Text style={styles.detailValue}>{guestCount} {guestCount === 1 ? 'personne' : 'personnes'}</Text></View></View>
//                     </View>
//                 )}

//                 {/* Récap Prix (Affichage mis à jour) */}
//                 {poolData && pricing.totalPrice >= 0 && pricing.hours > 0 && (
//                     <View style={styles.pricingCard}>
//                         <Text style={styles.sectionTitle}>Récapitulatif des prix</Text>
//                         {/* Afficher le détail du calcul */}
//                         <View style={styles.priceRow}>
//                              <Text style={styles.priceLabel}>{pricing.hours}h × {guestCount} {guestCount > 1 ? 'pers.' : 'pers.'} × {pricing.pricePerGuestPerHour} MAD/h/pers.</Text>
//                              <Text style={styles.priceValue}>{pricing.totalPrice} MAD</Text>
//                          </View>
//                         {/* Ajouter frais service etc. ici si nécessaire */}
//                         {/* <View style={styles.priceRow}><Text style={styles.priceLabel}>Frais de service</Text><Text style={styles.priceValue}>X MAD</Text></View> */}
//                         <View style={styles.totalRow}>
//                             <Text style={styles.totalLabel}>Total</Text>
//                             <Text style={styles.totalValue}>{pricing.totalPrice} MAD</Text>
//                         </View>
//                     </View>
//                 )}

//                  {/* Note Statut Pending */}
//                  <View style={styles.infoCard}>
//                      <Info size={20} color="#0891b2" />
//                      <Text style={styles.infoText}>Votre réservation sera <Text style={styles.infoHighlight}>en attente</Text> jusqu'à confirmation par l'hôte.</Text>
//                  </View>

//                  {/* Erreur Booking */}
//                  {bookingError && ( <View style={styles.errorCard}><AlertCircle color="#b91c1c" size={24} /><Text style={styles.errorText}>{bookingError}</Text></View> )}

//                 <View style={{ height: 150 }} />
//             </ScrollView>

//             {/* Footer (fixe) */}
//             <View style={styles.footer}>
//                  {/* Message Vérification KYC */}
//                  {!isLoadingAuth && !isVerified && ( <View style={styles.verificationNeededContainer}> <AlertCircle size={20} color="#d97706" /> <View style={styles.verificationNeededTextContainer}><Text style={styles.verificationNeededTitle}>Vérification Requise</Text><Text style={styles.verificationNeededSubtitle}>Vérifiez votre identité pour réserver.</Text></View> <TouchableOpacity style={styles.verifyLinkButton} onPress={() => router.push('/profile/verify')}><Text style={styles.verifyLinkButtonText}>Vérifier</Text></TouchableOpacity> </View> )}
//                  {/* Bouton Confirmer (affiche le prix total calculé) */}
//                  <TouchableOpacity
//                      style={[ styles.confirmButton, (isProcessing || loadingPool || !poolData || !!fetchPoolError || !isVerified || isLoadingAuth || pricing.hours <= 0) && styles.disabledButton ]}
//                      onPress={handleConfirmBooking}
//                      disabled={isProcessing || loadingPool || !poolData || !!fetchPoolError || !isVerified || isLoadingAuth || pricing.hours <= 0}
//                  >
//                   {isProcessing ? ( <ActivityIndicator color="#ffffff" size="small" /> ) : ( <> <CheckCircle size={20} color="#ffffff" /> <Text style={styles.confirmButtonText}>Demander à réserver ({pricing.totalPrice} MAD)</Text> </> )}
//                  </TouchableOpacity>
//             </View>
//         </SafeAreaView>
//     );
// }

// // --- Styles ---
// const styles = StyleSheet.create({
//      container: { flex: 1, backgroundColor: '#f8fafc' },
//      loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
//      loadingText: { marginTop: 12, fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#64748b' },
//      header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 10 : 40, paddingBottom: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
//      backButton: { padding: 8 },
//      headerTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 18, color: '#1e293b' },
//      content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
//      errorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, marginBottom: 16, gap: 12, borderWidth: 1, borderColor: '#fecaca' },
//      errorText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#b91c1c', flex: 1 },
//      poolCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
//      poolName: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 4 },
//      poolLocation: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b' },
//      bookingDetailsCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
//      sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b', marginBottom: 16 },
//      detailRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
//      detailIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
//      detailContent: { flex: 1, justifyContent: 'center' },
//      detailLabel: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#64748b', marginBottom: 2 },
//      detailValue: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1e293b', lineHeight: 20 },
//      pricingCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
//      priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
//      priceLabel: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', flexShrink: 1, marginRight: 8 }, // Permettre au label de se réduire
//      priceValue: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#475569' },
//      totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
//      totalLabel: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b' },
//      totalValue: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#0891b2' },
//      infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, marginBottom: 16, gap: 12, borderWidth: 1, borderColor: '#bae6fd' },
//      infoText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#0c4a6e', flex: 1, lineHeight: 20 },
//      infoHighlight: { fontFamily: 'Montserrat-SemiBold' },
//      footer: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
//      verificationNeededContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#fef3c7', gap: 10, },
//      verificationNeededTextContainer: { flex: 1, },
//      verificationNeededTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#b45309', },
//      verificationNeededSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#ca8a04', marginTop: 2, },
//      verifyLinkButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f59e0b', borderRadius: 6, },
//      verifyLinkButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#ffffff', },
//      confirmButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0891b2', padding: 16, borderRadius: 12, gap: 10, height: 52 },
//      confirmButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
//      disabledButton: { backgroundColor: '#94a3b8', opacity: 0.7 },
// });



// Dans app/booking/confirm.tsx
// VERSION CORRIGÉE : Ajout de l'insertion dans conversation_participants

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
    Platform, ActivityIndicator, Alert, SafeAreaView
} from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import {
    ArrowLeft, Calendar, Clock, Users, DollarSign, Info,
    CheckCircle, AlertCircle
} from 'lucide-react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { format, differenceInHours, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Interface PoolData MISE À JOUR
interface BookingPoolData {
    title: string;
    location: string | null;
    price_per_hour: number;
    capacity: number | null;
    owner_id: string; // <-- ID de l'hôte propriétaire
}

export default function BookingConfirmScreen() {
    const params = useLocalSearchParams();

    // Params formatés (assurer que ce sont des strings)
    const poolId = params.poolId as string ?? '';
    const startTimeStr = params.startTime as string ?? '';
    const endTimeStr = params.endTime as string ?? '';
    const guestCountStr = params.guestCount as string ?? '1';

    // États locaux
    const { user, isVerified, isLoading: isLoadingAuth } = useAuth();
    const [poolData, setPoolData] = useState<BookingPoolData | null>(null);
    const [loadingPool, setLoadingPool] = useState(true);
    const [fetchPoolError, setFetchPoolError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);

    // Convertir les paramètres en Dates (plus robuste)
    const startTime = useMemo(() => {
        try { return startTimeStr ? parseISO(startTimeStr) : null; } catch { return null; }
    }, [startTimeStr]);
    const endTime = useMemo(() => {
        try { return endTimeStr ? parseISO(endTimeStr) : null; } catch { return null; }
    }, [endTimeStr]);
    const guestCount = useMemo(() => parseInt(guestCountStr, 10), [guestCountStr]);

    // Charger les polices
    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // --- Fetch données depuis la table 'pools' ---
    const fetchPoolData = useCallback(async () => {
        if (!poolId) { setFetchPoolError("ID de piscine manquant."); setLoadingPool(false); return; }
        setLoadingPool(true); setFetchPoolError(null);
        console.log(`🚀 Fetching pool data for ID: ${poolId} from 'pools' table.`);
        try {
            const { data, error } = await supabase
    .from('pool_listings') // Remplacer 'pools' par 'pool_listings'
                .select('title, location, price_per_hour, capacity, owner_id')
                .eq('id', poolId)
                .single();

            if (error) {
                 if (error.code === 'PGRST116') { throw new Error("Piscine introuvable."); }
                 throw error;
            }
            if (!data || !data.owner_id) throw new Error("Données piscine invalides ou propriétaire manquant.");

            console.log("✅ Pool data received:", data);
            setPoolData(data as BookingPoolData);
        } catch (err: any) {
            console.error("Error in fetchPoolData:", err);
            setFetchPoolError(err.message || "Erreur chargement données piscine.");
            setPoolData(null);
        } finally {
            setLoadingPool(false);
        }
    }, [poolId]);

    useEffect(() => { fetchPoolData(); }, [fetchPoolData]);

    // Calcul du prix total (CORRIGÉ : inclut guestCount)
    const pricing = useMemo(() => {
        if (!poolData || !startTime || !endTime || !isValid(startTime) || !isValid(endTime) || isNaN(guestCount) || guestCount < 1) {
            return { hours: 0, basePrice: 0, totalPrice: 0, pricePerGuestPerHour: 0 };
        }
        const hours = differenceInHours(endTime, startTime);
        if (hours <= 0) return { hours: 0, basePrice: 0, totalPrice: 0, pricePerGuestPerHour: 0 };
        const pricePerGuestPerHour = poolData.price_per_hour ?? 0;
        const totalPrice = hours * pricePerGuestPerHour * guestCount;
        return { hours, basePrice: pricePerGuestPerHour * hours, totalPrice, pricePerGuestPerHour };
    }, [poolData, startTime, endTime, guestCount]);

    // --- Fonction de Confirmation (Ajout insertion participants) ---
    const handleConfirmBooking = async () => {
        // Vérifications initiales
        if (!user) { Alert.alert("Erreur", "Connectez-vous pour réserver."); return; }
        if (!isVerified) { Alert.alert("Vérification requise", "Vérifiez votre identité avant de réserver."); router.push('/profile/verify'); return; }
        if (!poolData || !poolId || !startTime || !endTime || !guestCount || isNaN(guestCount) || !isValid(startTime) || !isValid(endTime) || !poolData.owner_id || fetchPoolError) { Alert.alert("Erreur", `Impossible de continuer : ${fetchPoolError || 'Informations manquantes/invalides.'}`); return; }
        if (poolData.capacity && guestCount > poolData.capacity) { Alert.alert("Capacité dépassée", `Max ${poolData.capacity} personnes.`); return; }
        if (pricing.hours <= 0) { Alert.alert("Erreur", "Durée de réservation invalide."); return; }

        // !!! Ajouter la vérification dynamique de disponibilité ici !!!
// Vérifier que le créneau est toujours disponible avant de créer la réservation
console.log("Dernière vérification de disponibilité pour le créneau...");
try {
    const { data: conflictingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('listing_id', poolId)
        .not('status', 'in', '("canceled", "declined")')  // Exclure les réservations annulées/refusées
        .lt('start_time', endTime.toISOString())
        .gt('end_time', startTime.toISOString());

    if (checkError) throw new Error("Erreur lors de la vérification de disponibilité");
    
    if (conflictingBookings && conflictingBookings.length > 0) {
        setBookingError("Ce créneau n'est plus disponible. Veuillez choisir un autre horaire.");
        Alert.alert("Créneau indisponible", "Ce créneau a été réservé entre temps. Veuillez choisir un autre horaire.");
        return;
    }
    console.log("Créneau toujours disponible, poursuite de la réservation...");
} catch (err) {
    console.error("Erreur lors de la vérification finale de disponibilité:", err);
    setBookingError("Impossible de vérifier la disponibilité. Veuillez réessayer.");
    return;
}
      
        setIsProcessing(true); setBookingError(null);
        console.log("Attempting to insert booking as PENDING...");

        const bookingData = {
            // Correction: S'assurer que poolId correspond à la colonne FK dans bookings
            // Si la FK dans 'bookings' pointe vers 'pool_listings', il faut utiliser l'ID de pool_listings
            // Si 'pools' et 'pool_listings' partagent le même ID, c'est bon. Sinon, ajuster ici.
    listing_id: poolId, // Utiliser listing_id au lieu de pool_id
            user_id: user.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            guest_count: guestCount,
            total_price: pricing.totalPrice,
            status: 'pending'
        };

        let insertedBookingId: string | null = null;
        let insertedConversationId: string | null = null;

        try {
            // 1. Insérer la réservation
            const { data: insertedBooking, error: insertBookingError } = await supabase
                .from('bookings')
                .insert(bookingData)
                .select('id') // Sélectionner l'ID de la réservation insérée
                .single();

            if (insertBookingError) throw insertBookingError;
            if (!insertedBooking?.id) throw new Error("ID réservation manquant après insertion.");
            insertedBookingId = insertedBooking.id; // Stocker l'ID
            console.log("✅ Booking successfully inserted! ID:", insertedBookingId);

            // 2. Créer la conversation associée
            console.log(`Attempting to create conversation for booking ${insertedBookingId}...`);
            const conversationData = {
                booking_id: insertedBookingId,
                swimmer_id: user.id,
                host_id: poolData.owner_id,
                status: 'locked' // Statut initial
            };
            // ** Modifier pour récupérer l'ID de la conversation **
            const { data: insertedConversation, error: insertConvError } = await supabase
                .from('conversations')
                .insert(conversationData)
                .select('id') // Sélectionner l'ID de la conversation insérée
                .single();

            if (insertConvError) {
                // Log l'erreur mais continuer pour ne pas bloquer la réservation
                console.warn(`Could not create conversation for booking ${insertedBookingId}:`, insertConvError);
                // Vous pourriez vouloir annuler la réservation ici si la conversation est essentielle
                // await supabase.from('bookings').delete().eq('id', insertedBookingId);
                // throw new Error("Impossible de créer la conversation associée.");
            } else if (insertedConversation?.id) {
                insertedConversationId = insertedConversation.id; // Stocker l'ID
                console.log(`✅ Conversation created! ID: ${insertedConversationId}`);

                // 3. *** AJOUT : Insérer les participants ***
                console.log(`Attempting to insert participants for conversation ${insertedConversationId}...`);
                const participantsData = [
                    { conversation_id: insertedConversationId, user_id: user.id }, // Nageur (utilisateur actuel)
                    { conversation_id: insertedConversationId, user_id: poolData.owner_id } // Hôte
                ];
                const { error: insertParticipantsError } = await supabase
                    .from('conversation_participants')
                    .insert(participantsData);

                if (insertParticipantsError) {
                    // Log l'erreur mais ne pas bloquer la redirection (pour l'instant)
                    // Peut indiquer un problème si RLS empêche l'insertion ou si les user_id sont invalides
                    console.warn(`Could not insert participants for conversation ${insertedConversationId}:`, insertParticipantsError);
                    // Vous pourriez vouloir annuler la réservation/conversation ici
                } else {
                    console.log(`✅ Participants inserted for conversation ${insertedConversationId}`);
                }
            } else {
                 // Ce cas est étrange : l'insertion a réussi mais n'a pas retourné d'ID
                 console.warn(`Conversation was inserted for booking ${insertedBookingId}, but failed to retrieve its ID.`);
                 // Continuer quand même ? Ou considérer comme une erreur ?
            }

            // 4. Rediriger vers la page de succès
            router.replace({ pathname: '/booking/success', params: { bookingId: insertedBookingId, status: 'pending' } });

        } catch (err: any) {
            console.error("Error creating booking, conversation, or participants:", err);
            setBookingError(err.message || "Erreur lors de la création.");
            Alert.alert("Erreur", `Impossible de créer la réservation: ${err.message || "Erreur inconnue"}`);
            // En cas d'erreur, supprimer la réservation si elle a été créée mais pas la conversation/participants ?
            if (insertedBookingId && !insertedConversationId) {
                console.log(`Attempting to delete booking ${insertedBookingId} due to subsequent error...`);
                await supabase.from('bookings').delete().eq('id', insertedBookingId);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Rendu ---
     if (!fontsLoaded || fontError) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator /></SafeAreaView>; }
     if (loadingPool || isLoadingAuth) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /><Text style={styles.loadingText}>Chargement...</Text></SafeAreaView>; }
     if (!isLoadingAuth && !user) { router.replace('/(auth)/sign-in'); return null; }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft color="#475569" size={22} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confirmer la réservation</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Erreur Fetch Piscine */}
                {fetchPoolError && ( <View style={styles.errorCard}><AlertCircle color="#b91c1c" size={24} /><Text style={styles.errorText}>{fetchPoolError}</Text></View> )}

                {/* Détails Piscine */}
                {poolData && ( <View style={styles.poolCard}><Text style={styles.poolName}>{poolData.title}</Text>{poolData.location && <Text style={styles.poolLocation}>{poolData.location}</Text>}</View> )}

                {/* Détails Réservation */}
                {startTime && endTime && isValid(startTime) && isValid(endTime) && guestCount && (
                    <View style={styles.bookingDetailsCard}>
                        <Text style={styles.sectionTitle}>Détails de la réservation</Text>
                        <View style={styles.detailRow}><View style={styles.detailIconContainer}><Calendar size={18} color="#475569" /></View><View style={styles.detailContent}><Text style={styles.detailLabel}>Date</Text><Text style={styles.detailValue}>{format(startTime, 'EEEE d MMMM yyyy', { locale: fr })}</Text></View></View>
                        <View style={styles.detailRow}><View style={styles.detailIconContainer}><Clock size={18} color="#475569" /></View><View style={styles.detailContent}><Text style={styles.detailLabel}>Horaire</Text><Text style={styles.detailValue}>{format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')} ({pricing.hours}h)</Text></View></View>
                        <View style={styles.detailRow}><View style={styles.detailIconContainer}><Users size={18} color="#475569" /></View><View style={styles.detailContent}><Text style={styles.detailLabel}>Nombre de personnes</Text><Text style={styles.detailValue}>{guestCount} {guestCount === 1 ? 'personne' : 'personnes'}</Text></View></View>
                    </View>
                )}

                {/* Récap Prix */}
                {poolData && pricing.totalPrice >= 0 && pricing.hours > 0 && (
                    <View style={styles.pricingCard}>
                        <Text style={styles.sectionTitle}>Récapitulatif des prix</Text>
                        <View style={styles.priceRow}>
                             <Text style={styles.priceLabel}>{pricing.hours}h × {guestCount} {guestCount > 1 ? 'pers.' : 'pers.'} × {pricing.pricePerGuestPerHour} MAD/h/pers.</Text>
                             <Text style={styles.priceValue}>{pricing.totalPrice} MAD</Text>
                         </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>{pricing.totalPrice} MAD</Text>
                        </View>
                    </View>
                )}

                 {/* Note Statut Pending */}
                 <View style={styles.infoCard}>
                     <Info size={20} color="#0891b2" />
                     <Text style={styles.infoText}>Votre réservation sera <Text style={styles.infoHighlight}>en attente</Text> jusqu'à confirmation par l'hôte.</Text>
                 </View>

                 {/* Erreur Booking */}
                 {bookingError && ( <View style={styles.errorCard}><AlertCircle color="#b91c1c" size={24} /><Text style={styles.errorText}>{bookingError}</Text></View> )}

                <View style={{ height: 150 }} />
            </ScrollView>

            {/* Footer (fixe) */}
            <View style={styles.footer}>
                 {/* Message Vérification KYC */}
                 {!isLoadingAuth && !isVerified && ( <View style={styles.verificationNeededContainer}> <AlertCircle size={20} color="#d97706" /> <View style={styles.verificationNeededTextContainer}><Text style={styles.verificationNeededTitle}>Vérification Requise</Text><Text style={styles.verificationNeededSubtitle}>Vérifiez votre identité pour réserver.</Text></View> <TouchableOpacity style={styles.verifyLinkButton} onPress={() => router.push('/profile/verify')}><Text style={styles.verifyLinkButtonText}>Vérifier</Text></TouchableOpacity> </View> )}
                 {/* Bouton Confirmer */}
                 <TouchableOpacity
                     style={[ styles.confirmButton, (isProcessing || loadingPool || !poolData || !!fetchPoolError || !isVerified || isLoadingAuth || pricing.hours <= 0) && styles.disabledButton ]}
                     onPress={handleConfirmBooking}
                     disabled={isProcessing || loadingPool || !poolData || !!fetchPoolError || !isVerified || isLoadingAuth || pricing.hours <= 0}
                 >
                  {isProcessing ? ( <ActivityIndicator color="#ffffff" size="small" /> ) : ( <> <CheckCircle size={20} color="#ffffff" /> <Text style={styles.confirmButtonText}>Demander à réserver ({pricing.totalPrice} MAD)</Text> </> )}
                 </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
     container: { flex: 1, backgroundColor: '#f8fafc' },
     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
     loadingText: { marginTop: 12, fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#64748b' },
     header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 10 : 40, paddingBottom: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
     backButton: { padding: 8 },
     headerTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 18, color: '#1e293b' },
     content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
     errorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, marginBottom: 16, gap: 12, borderWidth: 1, borderColor: '#fecaca' },
     errorText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#b91c1c', flex: 1 },
     poolCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
     poolName: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 4 },
     poolLocation: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b' },
     bookingDetailsCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
     sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b', marginBottom: 16 },
     detailRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
     detailIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
     detailContent: { flex: 1, justifyContent: 'center' },
     detailLabel: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#64748b', marginBottom: 2 },
     detailValue: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1e293b', lineHeight: 20 },
     pricingCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
     priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
     priceLabel: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', flexShrink: 1, marginRight: 8 },
     priceValue: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#475569' },
     totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
     totalLabel: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b' },
     totalValue: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#0891b2' },
     infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, marginBottom: 16, gap: 12, borderWidth: 1, borderColor: '#bae6fd' },
     infoText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#0c4a6e', flex: 1, lineHeight: 20 },
     infoHighlight: { fontFamily: 'Montserrat-SemiBold' },
     footer: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
     verificationNeededContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#fef3c7', gap: 10, },
     verificationNeededTextContainer: { flex: 1, },
     verificationNeededTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#b45309', },
     verificationNeededSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#ca8a04', marginTop: 2, },
     verifyLinkButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f59e0b', borderRadius: 6, },
     verifyLinkButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#ffffff', },
     confirmButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0891b2', padding: 16, borderRadius: 12, gap: 10, height: 52 },
     confirmButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
     disabledButton: { backgroundColor: '#94a3b8', opacity: 0.7 },
});
