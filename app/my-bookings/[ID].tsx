
// // Dans app/my-bookings/[id].tsx
// // Écran affichant les détails d'une réservation spécifique pour le nageur
// // VERSION CORRIGÉE : Correction format date (yyyy) et accès paramètre ID

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
//     ActivityIndicator, Alert, Image, Platform, RefreshControl
// } from 'react-native';
// import { Stack, useLocalSearchParams, router } from 'expo-router';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/hooks/useAuth';
// import { format, parseISO, differenceInHours, isValid, isAfter } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import {
//     ArrowLeft, Calendar, Clock, Users, MapPin, DollarSign, Info, User as HostIcon,
//     CheckCircle2, XCircle, MessageCircle, AlertCircle, RefreshCw
// } from 'lucide-react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';

// // --- Interfaces ---
// interface SwimmerBookingDetailPoolImage { url: string; position?: number | null; }
// interface SwimmerBookingDetailPoolListing { id: string; title: string; location: string | null; owner_id: string; pool_images: SwimmerBookingDetailPoolImage[] | null; }
// interface SwimmerBookingDetailHostProfile { full_name: string | null; avatar_url?: string | null; }
// interface SwimmerBookingDetailConversation { id: string; status: string; }
// interface SwimmerBookingDetail {
//     id: string;
//     start_time: string;
//     end_time: string;
//     status: string;
//     total_price: number;
//     created_at: string;
//     guest_count: number;
//     pool_listing_id: string;
//     user_id: string;
//     pool_listing?: SwimmerBookingDetailPoolListing | null;
//     host_profile?: SwimmerBookingDetailHostProfile | null;
//     conversation?: SwimmerBookingDetailConversation | null;
// }

// // --- Constantes ---
// const BOOKING_STATUS_LABELS: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', completed: 'Terminée', canceled: 'Annulée', declined: 'Refusée' };

// export default function SwimmerBookingDetailScreen() {
//     const params = useLocalSearchParams();
//     console.log(`[SwimmerBookingDetailScreen] Received local search params:`, params);
//     // Vérifier params.id (minuscule) ET params.ID (majuscule)
//     const bookingIdParamValue = params.id || params.ID;
//     const bookingId = typeof bookingIdParamValue === 'string' ? bookingIdParamValue : null;
//     console.log(`[SwimmerBookingDetailScreen] Extracted bookingId: ${bookingId}`);

//     const { user, isLoading: isLoadingAuth } = useAuth();
//     const [bookingDetails, setBookingDetails] = useState<SwimmerBookingDetail | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [actionLoading, setActionLoading] = useState(false);
//     const [refreshing, setRefreshing] = useState(false);

//     const [fontsLoaded, fontError] = useFonts({
//         'Montserrat-Bold': Montserrat_700Bold,
//         'Montserrat-SemiBold': Montserrat_600SemiBold,
//         'Montserrat-Regular': Montserrat_400Regular,
//     });

//     // --- Fetch Booking Details ---
//     const fetchBookingDetails = useCallback(async (isRefresh = false) => {
//         if (!bookingId) { setError("ID de réservation invalide ou manquant."); setLoading(false); return; }
//         if (!user) { console.log("fetchBookingDetails: User not loaded yet."); setLoading(false); return; }

//         if (!isRefresh) setLoading(true);
//         setError(null);
//         console.log(`🚀 Fetching details for booking: ${bookingId} for swimmer: ${user.id}`);

//         try {
//             const { data: bookingData, error: bookingError } = await supabase
//                 .from('bookings')
//                 .select(`*, pool_listing:pool_listings ( id, title, location, owner_id, pool_images(url, position) ), conversation:conversations ( id, status )`)
//                 .eq('id', bookingId)
//                 .eq('user_id', user.id)
//                 .single();

//             if (bookingError) {
//                 if (bookingError.code === 'PGRST116') throw new Error("Réservation introuvable ou accès non autorisé.");
//                 throw bookingError;
//             }
//             if (!bookingData) throw new Error("Données de réservation non trouvées.");
//             console.log("✅ Booking base data received.");

//             const formattedBookingBase = {
//                  ...bookingData,
//                  pool_listing: bookingData.pool_listing ? { ...bookingData.pool_listing, pool_images: bookingData.pool_listing.pool_images?.sort((a: any, b: any) => (a.position ?? 99) - (b.position ?? 99)) || null } : null,
//                  conversation: Array.isArray(bookingData.conversation) ? bookingData.conversation[0] : bookingData.conversation
//              };

//             let hostProfileData: SwimmerBookingDetailHostProfile | null = null;
//             const ownerId = formattedBookingBase.pool_listing?.owner_id;
//             if (ownerId) {
//                 console.log(`   Fetching host profile for owner_id: ${ownerId}`);
//                 const { data: profileData, error: profileError } = await supabase.from('profiles').select('full_name, avatar_url').eq('user_id', ownerId).maybeSingle();
//                 if (profileError) { console.warn("Could not fetch host profile:", profileError.message); }
//                 else if (profileData) { hostProfileData = profileData as SwimmerBookingDetailHostProfile; console.log("   ✅ Host profile fetched."); }
//                 else { console.log("   Host profile not found."); }
//             } else { console.warn("   Cannot fetch host profile: owner_id missing."); }

//             const finalDetails: SwimmerBookingDetail = { ...(formattedBookingBase as Omit<SwimmerBookingDetail, 'host_profile'>), host_profile: hostProfileData };
//             setBookingDetails(finalDetails);
//             console.log("✅ All booking details processed.");

//         } catch (err: any) {
//             console.error("Error fetching booking details:", err);
//             setError(err.message || "Erreur lors du chargement des détails.");
//             setBookingDetails(null);
//         } finally {
//             if (!isRefresh) setLoading(false);
//             if (isRefresh) setRefreshing(false);
//         }
//     }, [bookingId, user]);

//     // --- UseEffect pour charger les données initiales ---
//     useEffect(() => {
//         if (fontsLoaded && !fontError && !isLoadingAuth && user && bookingId) {
//             fetchBookingDetails();
//         } else if (fontsLoaded && !fontError && !isLoadingAuth && !bookingId) {
//              setError("ID de réservation manquant.");
//              setLoading(false);
//         }
//     }, [bookingId, user, fontsLoaded, fontError, isLoadingAuth, fetchBookingDetails]);

//     // --- Annulation ---
//     const handleCancelBooking = useCallback(async () => {
//         if (!bookingDetails || !user) return;
//         const bookingIdToCancel = bookingDetails.id;
//         Alert.alert( "Annuler la réservation", "Êtes-vous sûr ? Cette action est irréversible.", [ { text: "Retour", style: "cancel" }, { text: "Oui, annuler", style: "destructive", onPress: async () => {
//             setActionLoading(true);
//             try {
//                 const { error: updateError } = await supabase.from('bookings').update({ status: 'canceled' }).eq('id', bookingIdToCancel).eq('user_id', user.id);
//                 if (updateError) throw updateError;
//                 setBookingDetails(prev => prev ? { ...prev, status: 'canceled' } : null);
//                 Alert.alert("Annulation confirmée", "Votre réservation a été annulée.");
//             } catch (err: any) { console.error("Error cancelling booking:", err); Alert.alert("Erreur", `Impossible d'annuler : ${err.message || 'Erreur inconnue'}`); }
//             finally { setActionLoading(false); }
//         }}]);
//     }, [user, bookingDetails]);

//     // Refresh manuel
//     const onRefresh = useCallback(() => {
//         setRefreshing(true);
//         fetchBookingDetails(true).finally(() => setRefreshing(false));
//     }, [fetchBookingDetails]);

//     // --- Rendu ---
//     if (!fontsLoaded || isLoadingAuth || loading) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
//     if (fontError) { return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
//     if (error) { return ( <SafeAreaView style={styles.errorContainer}><AlertCircle size={40} color="#dc2626" /><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={() => fetchBookingDetails(true)} style={styles.retryButton}><RefreshCw size={16} color="#ffffff" /><Text style={styles.retryButtonText}>Réessayer</Text></TouchableOpacity><TouchableOpacity onPress={() => router.back()} style={[styles.retryButton, {backgroundColor: '#64748b', marginTop: 10}]}><ArrowLeft size={16} color="#ffffff" /><Text style={styles.retryButtonText}>Retour</Text></TouchableOpacity></SafeAreaView> ); }
//     if (!bookingDetails) { return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Impossible d'afficher les détails de la réservation.</Text></SafeAreaView>; }

//     // Formatage des données pour l'affichage
//     const startDate = parseISO(bookingDetails.start_time);
//     const endDate = parseISO(bookingDetails.end_time);
//     const createdAtDate = parseISO(bookingDetails.created_at);
//     const isValidDates = isValid(startDate) && isValid(endDate);
//     const durationHours = isValidDates ? differenceInHours(endDate, startDate) : 0;
//     const formattedPrice = `${bookingDetails.total_price?.toFixed(0) ?? 'N/A'} MAD`;
//     const coverImage = bookingDetails.pool_listing?.pool_images?.[0]?.url || null;
//     const statusLabel = BOOKING_STATUS_LABELS[bookingDetails.status] || bookingDetails.status;
//     const now = new Date();
//     const canCancel = ['pending', 'confirmed'].includes(bookingDetails.status) && isValidDates && isAfter(startDate, now);
//     const canContact = bookingDetails.conversation != null && ['pending', 'confirmed'].includes(bookingDetails.status) && bookingDetails.conversation.status !== 'archived';

//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ headerShown: false }} />
//             <View style={styles.header}>
//                 <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//                     <ArrowLeft color="#475569" size={22} />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle} numberOfLines={1}>Ma Réservation</Text>
//                  <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={refreshing || actionLoading}>
//                      <RefreshCw size={18} color={refreshing || actionLoading ? "#cbd5e1" : "#475569"} />
//                  </TouchableOpacity>
//              </View>
//             <ScrollView
//                 contentContainerStyle={styles.scrollContent}
//                 refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891b2"/>}
//             >
//                  {bookingDetails.pool_listing && (
//                      <View style={styles.sectionCard}>
//                          {coverImage ? <Image source={{ uri: coverImage }} style={styles.poolImage} /> : <View style={[styles.poolImage, styles.placeholderImage]}><Calendar size={40} color="#cbd5e1" /></View>}
//                          <Text style={styles.poolTitle}>{bookingDetails.pool_listing.title ?? 'Piscine sans titre'}</Text>
//                          {bookingDetails.pool_listing.location && (<View style={styles.inlineInfo}><MapPin size={16} color="#64748b" /><Text style={styles.poolLocation}>{bookingDetails.pool_listing.location}</Text></View>)}
//                          {bookingDetails.host_profile && (
//                              <View style={[styles.inlineInfo, {marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#f1f5f9'}]}>
//                                  <HostIcon size={16} color="#475569" />
//                                  <Text style={styles.hostName}>Hôte: {bookingDetails.host_profile.full_name || 'Non spécifié'}</Text>
//                              </View>
//                          )}
//                      </View>
//                  )}
//                  <View style={styles.sectionCard}>
//                      <Text style={styles.sectionTitle}>Détails de ma réservation</Text>
//                      <View style={styles.detailItem}><Info size={16} color="#475569" /><Text style={styles.detailValue}>Statut: <Text style={{ fontFamily: 'Montserrat-Bold' }}>{statusLabel}</Text></Text></View>
//                      <View style={styles.detailItem}><Calendar size={16} color="#475569" />
//                          {/* *** CORRECTION FORMAT DATE ICI *** */}
//                          <Text style={styles.detailValue}>{isValidDates ? format(startDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Date invalide'}</Text>
//                      </View>
//                      <View style={styles.detailItem}><Clock size={16} color="#475569" /><Text style={styles.detailValue}>{isValidDates ? `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')} (${durationHours > 0 ? durationHours + 'h' : '<1h'})` : 'Horaire invalide'}</Text></View>
//                      <View style={styles.detailItem}><Users size={16} color="#475569" /><Text style={styles.detailValue}>{bookingDetails.guest_count} personne{bookingDetails.guest_count > 1 ? 's' : ''}</Text></View>
//                      <View style={styles.detailItem}><DollarSign size={16} color="#475569" /><Text style={styles.detailValue}>Total payé: {formattedPrice}</Text></View>
//                      <View style={styles.detailItem}><Calendar size={16} color="#475569" /><Text style={styles.detailValue}>Demandée le: {isValid(createdAtDate) ? format(createdAtDate, 'd MMM yy à HH:mm', { locale: fr }) : 'Date inconnue'}</Text></View>
//                  </View>
//                  <View style={styles.actionsContainer}>
//                     {canCancel && (
//                          <TouchableOpacity style={[styles.actionButton, styles.cancelButton, actionLoading && styles.disabledButton]} onPress={handleCancelBooking} disabled={actionLoading}>
//                             {actionLoading ? <ActivityIndicator size="small" color="#b91c1c" /> : <XCircle size={20} color="#b91c1c" />}
//                             <Text style={styles.actionButtonTextCancel}>Annuler ma réservation</Text>
//                          </TouchableOpacity>
//                      )}
//                      <TouchableOpacity style={[styles.actionButton, styles.messageButton, (!canContact || actionLoading) && styles.disabledButton]} onPress={() => { if (canContact && bookingDetails.conversation) { router.push(`/(tabs)/conversations/${bookingDetails.conversation.id}`); } else { Alert.alert("Contacter", "Conversation non disponible."); } }} disabled={!canContact || actionLoading}>
//                          <MessageCircle size={20} color={canContact ? '#0891b2' : '#9ca3af'} />
//                          <Text style={[styles.actionButtonTextMessage, !canContact && { color: '#9ca3af' }]}>Contacter l'hôte</Text>
//                      </TouchableOpacity>
//                      {bookingDetails.pool_listing_id && (
//                          <TouchableOpacity style={[styles.actionButton, styles.viewPoolButton]} onPress={() => router.push(`/pool/${bookingDetails.pool_listing_id}`)} disabled={actionLoading}>
//                             <Info size={16} color="#475569" />
//                             <Text style={styles.viewPoolButtonText}>Voir l'annonce</Text>
//                          </TouchableOpacity>
//                      )}
//                  </View>
//             </ScrollView>
//         </SafeAreaView>
//     );
// }

// // --- Styles ---
// const styles = StyleSheet.create({
//      container: { flex: 1, backgroundColor: '#f8fafc' },
//      loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
//      errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' },
//      errorText: { fontFamily: 'Montserrat-SemiBold', color: '#b91c1c', fontSize: 16, textAlign: 'center', marginBottom: 15 },
//      retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10, gap: 8 },
//      retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
//      header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: Platform.OS === 'ios' ? 10 : 40, paddingBottom: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
//      backButton: { padding: 8, marginRight: 5, marginLeft: -5 },
//      refreshButton: { padding: 8 },
//      headerTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 17, color: '#1e293b', textAlign: 'center', flex: 1, marginHorizontal: 5 },
//      scrollContent: { padding: 16, paddingBottom: 100 },
//      sectionCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
//      poolImage: { width: '100%', height: 180, borderRadius: 8, marginBottom: 12, backgroundColor: '#e5e7eb' },
//      placeholderImage: { justifyContent: 'center', alignItems: 'center' },
//      poolTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1e293b', marginBottom: 6 },
//      poolLocation: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', flexShrink: 1 },
//      hostName: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', flexShrink: 1 },
//      sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b', marginBottom: 16 },
//      inlineInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
//      detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
//      detailValue: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#334155', flexShrink: 1, lineHeight: 22 },
//      actionsContainer: { marginTop: 10, gap: 12, paddingBottom: 20 },
//      actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, borderWidth: 1, gap: 10, minHeight: 50 },
//      cancelButton: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
//      actionButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#b91c1c' },
//      messageButton: { backgroundColor: '#ecfeff', borderColor: '#cffafe' },
//      actionButtonTextMessage: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2' },
//      viewPoolButton: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
//      viewPoolButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#475569' },
//      disabledButton: { opacity: 0.6 },
// });


// // Dans app/my-bookings/[id].tsx
// // Écran affichant les détails d'une réservation spécifique pour le nageur
// // VERSION CORRIGÉE : Utilisation d'un Modal personnalisé pour l'annulation

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
//     ActivityIndicator, Alert, Image, Platform, RefreshControl,
//     Modal // Modal importé
// } from 'react-native';
// import { Stack, useLocalSearchParams, router } from 'expo-router';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/hooks/useAuth';
// import { format, parseISO, differenceInHours, isValid, isAfter } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import {
//     ArrowLeft, Calendar, Clock, Users, MapPin, DollarSign, Info, User as HostIcon,
//     CheckCircle2, XCircle, MessageCircle, AlertCircle, RefreshCw
// } from 'lucide-react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';

// // --- Interfaces ---
// interface SwimmerBookingDetailPoolImage { url: string; position?: number | null; }
// interface SwimmerBookingDetailPoolListing { id: string; title: string; location: string | null; owner_id: string; pool_images: SwimmerBookingDetailPoolImage[] | null; }
// interface SwimmerBookingDetailHostProfile { full_name: string | null; avatar_url?: string | null; }
// interface SwimmerBookingDetailConversation { id: string; status: string; }
// interface SwimmerBookingDetail {
//     id: string;
//     start_time: string;
//     end_time: string;
//     status: string;
//     total_price: number;
//     created_at: string;
//     guest_count: number;
//     pool_listing_id: string;
//     user_id: string;
//     pool_listing?: SwimmerBookingDetailPoolListing | null;
//     host_profile?: SwimmerBookingDetailHostProfile | null;
//     conversation?: SwimmerBookingDetailConversation | null;
// }

// // --- Constantes ---
// const BOOKING_STATUS_LABELS: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', completed: 'Terminée', canceled: 'Annulée', declined: 'Refusée' };

// export default function SwimmerBookingDetailScreen() {
//     const params = useLocalSearchParams();
//     const bookingIdParamValue = params.id || params.ID;
//     const bookingId = typeof bookingIdParamValue === 'string' ? bookingIdParamValue : null;

//     const { user, isLoading: isLoadingAuth } = useAuth();
//     const [bookingDetails, setBookingDetails] = useState<SwimmerBookingDetail | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [actionLoading, setActionLoading] = useState(false); // Pour l'annulation
//     const [refreshing, setRefreshing] = useState(false);
//     // *** État pour le modal d'annulation ***
//     const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

//     const [fontsLoaded, fontError] = useFonts({
//         'Montserrat-Bold': Montserrat_700Bold,
//         'Montserrat-SemiBold': Montserrat_600SemiBold,
//         'Montserrat-Regular': Montserrat_400Regular,
//     });

//     // --- Fetch Booking Details ---
//     const fetchBookingDetails = useCallback(async (isRefresh = false) => {
//         if (!bookingId) { setError("ID de réservation invalide ou manquant."); setLoading(false); return; }
//         if (!user) { console.log("fetchBookingDetails: User not loaded yet."); setLoading(false); return; }
//         if (!isRefresh) setLoading(true); setError(null);
//         console.log(`🚀 Fetching details for booking: ${bookingId} for swimmer: ${user.id}`);
//         try {
//             const { data: bookingData, error: bookingError } = await supabase.from('bookings').select(`*, pool_listing:pool_listings ( id, title, location, owner_id, pool_images(url, position) ), conversation:conversations ( id, status )`).eq('id', bookingId).eq('user_id', user.id).single();
//             if (bookingError) { if (bookingError.code === 'PGRST116') throw new Error("Réservation introuvable ou accès non autorisé."); throw bookingError; }
//             if (!bookingData) throw new Error("Données de réservation non trouvées.");
//             console.log("✅ Booking base data received.");
//             const formattedBookingBase = { ...bookingData, pool_listing: bookingData.pool_listing ? { ...bookingData.pool_listing, pool_images: bookingData.pool_listing.pool_images?.sort((a: any, b: any) => (a.position ?? 99) - (b.position ?? 99)) || null } : null, conversation: Array.isArray(bookingData.conversation) ? bookingData.conversation[0] : bookingData.conversation };
//             let hostProfileData: SwimmerBookingDetailHostProfile | null = null;
//             const ownerId = formattedBookingBase.pool_listing?.owner_id;
//             if (ownerId) {
//                 const { data: profileData, error: profileError } = await supabase.from('profiles').select('full_name, avatar_url').eq('user_id', ownerId).maybeSingle();
//                 if (profileError) { console.warn("Could not fetch host profile:", profileError.message); }
//                 else if (profileData) { hostProfileData = profileData as SwimmerBookingDetailHostProfile; console.log("   ✅ Host profile fetched."); }
//             } else { console.warn("   Cannot fetch host profile: owner_id missing."); }
//             const finalDetails: SwimmerBookingDetail = { ...(formattedBookingBase as Omit<SwimmerBookingDetail, 'host_profile'>), host_profile: hostProfileData };
//             setBookingDetails(finalDetails);
//             console.log("✅ All booking details processed.");
//         } catch (err: any) { console.error("Error fetching booking details:", err); setError(err.message || "Erreur lors du chargement des détails."); setBookingDetails(null); }
//         finally { if (!isRefresh) setLoading(false); if (isRefresh) setRefreshing(false); }
//     }, [bookingId, user]);

//     // --- UseEffect pour charger les données initiales ---
//     useEffect(() => {
//         if (fontsLoaded && !fontError && !isLoadingAuth && user && bookingId) { fetchBookingDetails(); }
//         else if (fontsLoaded && !fontError && !isLoadingAuth && !bookingId) { setError("ID de réservation manquant."); setLoading(false); }
//     }, [bookingId, user, fontsLoaded, fontError, isLoadingAuth, fetchBookingDetails]);

//     // --- Annulation ---
//     // Ouvre le modal de confirmation
//     const handleOpenCancelModal = useCallback(() => {
//          console.log("[handleOpenCancelModal] Opening cancel confirmation modal.");
//          setIsCancelModalVisible(true);
//     }, []);

//     // Fonction appelée par le bouton "Oui, annuler" du modal
//     const confirmCancellation = useCallback(async () => {
//         if (!bookingDetails || !user) return;
//         const bookingIdToCancel = bookingDetails.id;

//         setIsCancelModalVisible(false); // Fermer le modal
//         setActionLoading(true); // Activer le spinner global ou spécifique
//         console.log(`[confirmCancellation] Attempting to cancel booking via Supabase: ${bookingIdToCancel}`);

//         try {
//             const { error: updateError } = await supabase.from('bookings').update({ status: 'canceled' }).eq('id', bookingIdToCancel).eq('user_id', user.id);
//             if (updateError) throw updateError;
//             console.log(`✅ Booking ${bookingIdToCancel} cancelled in DB.`);
//             setBookingDetails(prev => prev ? { ...prev, status: 'canceled' } : null); // Update local optimiste
//             Alert.alert("Annulation confirmée", "Votre réservation a été annulée.");
//         } catch (err: any) {
//             console.error("Error cancelling booking:", err);
//             Alert.alert("Erreur", `Impossible d'annuler : ${err.message || 'Erreur inconnue'}`);
//             // Recharger les données en cas d'erreur pour être sûr
//             fetchBookingDetails();
//         } finally {
//             setActionLoading(false); // Désactiver le spinner
//         }
//     }, [user, bookingDetails, fetchBookingDetails]); // fetchBookingDetails ajouté pour le cas d'erreur

//     // Refresh manuel
//     const onRefresh = useCallback(() => {
//         setRefreshing(true);
//         fetchBookingDetails(true).finally(() => setRefreshing(false));
//     }, [fetchBookingDetails]);

//     // --- Rendu ---
//     if (!fontsLoaded || isLoadingAuth || loading) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
//     if (fontError) { return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
//     if (error) { return ( <SafeAreaView style={styles.errorContainer}><AlertCircle size={40} color="#dc2626" /><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={() => fetchBookingDetails(true)} style={styles.retryButton}><RefreshCw size={16} color="#ffffff" /><Text style={styles.retryButtonText}>Réessayer</Text></TouchableOpacity><TouchableOpacity onPress={() => router.back()} style={[styles.retryButton, {backgroundColor: '#64748b', marginTop: 10}]}><ArrowLeft size={16} color="#ffffff" /><Text style={styles.retryButtonText}>Retour</Text></TouchableOpacity></SafeAreaView> ); }
//     if (!bookingDetails) { return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Impossible d'afficher les détails de la réservation.</Text></SafeAreaView>; }

//     // Formatage des données pour l'affichage
//     const startDate = parseISO(bookingDetails.start_time);
//     const endDate = parseISO(bookingDetails.end_time);
//     const createdAtDate = parseISO(bookingDetails.created_at);
//     const isValidDates = isValid(startDate) && isValid(endDate);
//     const durationHours = isValidDates ? differenceInHours(endDate, startDate) : 0;
//     const formattedPrice = `${bookingDetails.total_price?.toFixed(0) ?? 'N/A'} MAD`;
//     const coverImage = bookingDetails.pool_listing?.pool_images?.[0]?.url || null;
//     const statusLabel = BOOKING_STATUS_LABELS[bookingDetails.status] || bookingDetails.status;
//     const now = new Date();
//     const canCancel = ['pending', 'confirmed'].includes(bookingDetails.status) && isValidDates && isAfter(startDate, now);
//     const canContact = bookingDetails.conversation != null && ['pending', 'confirmed'].includes(bookingDetails.status) && bookingDetails.conversation.status !== 'archived';

//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ headerShown: false }} />
//             <View style={styles.header}>
//                 <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//                     <ArrowLeft color="#475569" size={22} />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle} numberOfLines={1}>Ma Réservation</Text>
//                  <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={refreshing || actionLoading}>
//                      <RefreshCw size={18} color={refreshing || actionLoading ? "#cbd5e1" : "#475569"} />
//                  </TouchableOpacity>
//              </View>
//             <ScrollView
//                 contentContainerStyle={styles.scrollContent}
//                 refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891b2"/>}
//             >
//                  {bookingDetails.pool_listing && (
//                      <View style={styles.sectionCard}>
//                          {coverImage ? <Image source={{ uri: coverImage }} style={styles.poolImage} /> : <View style={[styles.poolImage, styles.placeholderImage]}><Calendar size={40} color="#cbd5e1" /></View>}
//                          <Text style={styles.poolTitle}>{bookingDetails.pool_listing.title ?? 'Piscine sans titre'}</Text>
//                          {bookingDetails.pool_listing.location && (<View style={styles.inlineInfo}><MapPin size={16} color="#64748b" /><Text style={styles.poolLocation}>{bookingDetails.pool_listing.location}</Text></View>)}
//                          {bookingDetails.host_profile && (
//                              <View style={[styles.inlineInfo, {marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#f1f5f9'}]}>
//                                  <HostIcon size={16} color="#475569" />
//                                  <Text style={styles.hostName}>Hôte: {bookingDetails.host_profile.full_name || 'Non spécifié'}</Text>
//                              </View>
//                          )}
//                      </View>
//                  )}
//                  <View style={styles.sectionCard}>
//                      <Text style={styles.sectionTitle}>Détails de ma réservation</Text>
//                      <View style={styles.detailItem}><Info size={16} color="#475569" /><Text style={styles.detailValue}>Statut: <Text style={{ fontFamily: 'Montserrat-Bold' }}>{statusLabel}</Text></Text></View>
//                      <View style={styles.detailItem}><Calendar size={16} color="#475569" /><Text style={styles.detailValue}>{isValidDates ? format(startDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Date invalide'}</Text></View>
//                      <View style={styles.detailItem}><Clock size={16} color="#475569" /><Text style={styles.detailValue}>{isValidDates ? `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')} (${durationHours > 0 ? durationHours + 'h' : '<1h'})` : 'Horaire invalide'}</Text></View>
//                      <View style={styles.detailItem}><Users size={16} color="#475569" /><Text style={styles.detailValue}>{bookingDetails.guest_count} personne{bookingDetails.guest_count > 1 ? 's' : ''}</Text></View>
//                      <View style={styles.detailItem}><DollarSign size={16} color="#475569" /><Text style={styles.detailValue}>Total payé: {formattedPrice}</Text></View>
//                      <View style={styles.detailItem}><Calendar size={16} color="#475569" /><Text style={styles.detailValue}>Demandée le: {isValid(createdAtDate) ? format(createdAtDate, 'd MMM yy à HH:mm', { locale: fr }) : 'Date inconnue'}</Text></View>
//                  </View>
//                  <View style={styles.actionsContainer}>
//                     {canCancel && (
//                          <TouchableOpacity
//                             style={[styles.actionButton, styles.cancelButton, actionLoading && styles.disabledButton]}
//                             onPress={handleOpenCancelModal} // *** MODIFIÉ: Ouvre le modal ***
//                             disabled={actionLoading}>
//                             {actionLoading ? <ActivityIndicator size="small" color="#b91c1c" /> : <XCircle size={20} color="#b91c1c" />}
//                             <Text style={styles.actionButtonTextCancel}>Annuler ma réservation</Text>
//                          </TouchableOpacity>
//                      )}
//                      <TouchableOpacity style={[styles.actionButton, styles.messageButton, (!canContact || actionLoading) && styles.disabledButton]} onPress={() => { if (canContact && bookingDetails.conversation) { router.push(`/(tabs)/conversations/${bookingDetails.conversation.id}`); } else { Alert.alert("Contacter", "Conversation non disponible."); } }} disabled={!canContact || actionLoading}>
//                          <MessageCircle size={20} color={canContact ? '#0891b2' : '#9ca3af'} />
//                          <Text style={[styles.actionButtonTextMessage, !canContact && { color: '#9ca3af' }]}>Contacter l'hôte</Text>
//                      </TouchableOpacity>
//                      {bookingDetails.pool_listing_id && (
//                          <TouchableOpacity style={[styles.actionButton, styles.viewPoolButton]} onPress={() => router.push(`/pool/${bookingDetails.pool_listing_id}`)} disabled={actionLoading}>
//                             <Info size={16} color="#475569" />
//                             <Text style={styles.viewPoolButtonText}>Voir l'annonce</Text>
//                          </TouchableOpacity>
//                      )}
//                  </View>
//             </ScrollView>

//              {/* *** AJOUT DU MODAL D'ANNULATION *** */}
//              <Modal
//                 animationType="fade"
//                 transparent={true}
//                 visible={isCancelModalVisible}
//                 onRequestClose={() => { if (!actionLoading) { setIsCancelModalVisible(false); } }}>
//                 <View style={styles.modalOverlay}>
//                     <View style={styles.modalContent}>
//                         <Text style={styles.modalTitle}>Annuler Réservation ?</Text>
//                         <Text style={styles.modalMessage}>Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.</Text>
//                         <View style={styles.modalActions}>
//                             {/* Bouton Annuler du Modal */}
//                             <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setIsCancelModalVisible(false)} disabled={actionLoading}>
//                                 <Text style={styles.modalButtonTextCancel}>Retour</Text>
//                             </TouchableOpacity>
//                              {/* Bouton Confirmer Annulation du Modal */}
//                             <TouchableOpacity style={[styles.modalButton, styles.modalButtonReject]} onPress={confirmCancellation} disabled={actionLoading}>
//                                 <Text style={styles.modalButtonTextReject}>Oui, annuler</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </View>
//             </Modal>

//         </SafeAreaView>
//     );
// }

// // --- Styles --- (Ajout des styles de modal, similaires à ceux de l'hôte)
// const styles = StyleSheet.create({
//      container: { flex: 1, backgroundColor: '#f8fafc' },
//      loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
//      errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' },
//      errorText: { fontFamily: 'Montserrat-SemiBold', color: '#b91c1c', fontSize: 16, textAlign: 'center', marginBottom: 15 },
//      retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10, gap: 8 },
//      retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
//      header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: Platform.OS === 'ios' ? 10 : 40, paddingBottom: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
//      backButton: { padding: 8, marginRight: 5, marginLeft: -5 },
//      refreshButton: { padding: 8 },
//      headerTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 17, color: '#1e293b', textAlign: 'center', flex: 1, marginHorizontal: 5 },
//      scrollContent: { padding: 16, paddingBottom: 100 },
//      sectionCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
//      poolImage: { width: '100%', height: 180, borderRadius: 8, marginBottom: 12, backgroundColor: '#e5e7eb' },
//      placeholderImage: { justifyContent: 'center', alignItems: 'center' },
//      poolTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1e293b', marginBottom: 6 },
//      poolLocation: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', flexShrink: 1 },
//      hostName: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', flexShrink: 1 },
//      sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b', marginBottom: 16 },
//      inlineInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
//      detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
//      detailValue: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#334155', flexShrink: 1, lineHeight: 22 },
//      actionsContainer: { marginTop: 10, gap: 12, paddingBottom: 20 },
//      actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, borderWidth: 1, gap: 10, minHeight: 50 },
//      cancelButton: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
//      actionButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#b91c1c' },
//      messageButton: { backgroundColor: '#ecfeff', borderColor: '#cffafe' },
//      actionButtonTextMessage: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2' },
//      viewPoolButton: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
//      viewPoolButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#475569' },
//      disabledButton: { opacity: 0.6 },
//      // Styles pour le Modal
//      modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
//      modalContent: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, width: '85%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
//      modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 10, textAlign: 'center', },
//      modalMessage: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#475569', marginBottom: 25, textAlign: 'center', lineHeight: 22, },
//      modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, },
//      modalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, },
//      modalButtonCancel: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', },
//      modalButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#475569', },
//      // Utiliser le style "Reject" pour le bouton d'annulation destructif
//      modalButtonReject: { backgroundColor: '#ef4444', borderColor: '#dc2626', },
//      modalButtonTextReject: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
// });

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
    ActivityIndicator, Alert, Image, Platform, RefreshControl,
    Modal
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO, differenceInHours, isValid, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    ArrowLeft, Calendar, Clock, Users, MapPin, DollarSign, Info, User as HostIcon,
    CheckCircle2, XCircle, MessageCircle, AlertCircle, RefreshCw
} from 'lucide-react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';

// Interfaces
interface SwimmerBookingDetailPoolImage { url: string; position?: number | null; }
interface SwimmerBookingDetailPoolListing { id: string; title: string; location: string | null; owner_id: string; pool_images: SwimmerBookingDetailPoolImage[] | null; }
interface SwimmerBookingDetailHostProfile { full_name: string | null; avatar_url?: string | null; }
interface SwimmerBookingDetailConversation { id: string; status: string; }
interface SwimmerBookingDetail {
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    total_price: number;
    created_at: string;
    guest_count: number;
    pool_id: string;
    user_id: string;
    pool_listing?: SwimmerBookingDetailPoolListing | null;
    host_profile?: SwimmerBookingDetailHostProfile | null;
    conversation?: SwimmerBookingDetailConversation | null;
}

const BOOKING_STATUS_LABELS: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', completed: 'Terminée', canceled: 'Annulée', declined: 'Refusée' };

export default function SwimmerBookingDetailScreen() {
    const params = useLocalSearchParams();
    const bookingIdParamValue = params.id || params.ID;
    const bookingId = typeof bookingIdParamValue === 'string' ? bookingIdParamValue : null;

    const { user, isLoading: isLoadingAuth } = useAuth();
    const [bookingDetails, setBookingDetails] = useState<SwimmerBookingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    const fetchBookingDetails = useCallback(async (isRefresh = false) => {
        if (!bookingId) { setError("ID de réservation invalide ou manquant."); setLoading(false); return; }
        if (!isRefresh) setLoading(true); setError(null);
        console.log(`🚀 Calling RPC [get_swimmer_booking_details] for booking: ${bookingId}`);
        try {
            const { data, error: rpcError } = await supabase.rpc(
                'get_swimmer_booking_details',
                { p_booking_id: bookingId }
            );

            if (rpcError) {
                console.error("RPC Error (get_swimmer_booking_details):", rpcError);
                throw new Error(`Erreur RPC: ${rpcError.message}`);
            }
            if (data === null) {
                console.log("RPC returned null (not found or not authorized for swimmer)");
                throw new Error("Réservation introuvable ou accès non autorisé.");
            }

            console.log("✅ RPC successful. Received data.");
            setBookingDetails(data as SwimmerBookingDetail);

        } catch (err: any) {
            console.error("Error fetching booking details via RPC:", err);
            setError(err.message || "Erreur lors du chargement des détails.");
            setBookingDetails(null);
        } finally {
            if (!isRefresh) setLoading(false);
            if (isRefresh) setRefreshing(false);
        }
    }, [bookingId]);

    useEffect(() => {
        if (fontsLoaded && !fontError && bookingId) {
             fetchBookingDetails();
        } else if (fontsLoaded && !fontError && !bookingId) {
             setError("ID de réservation manquant.");
             setLoading(false);
        }
    }, [bookingId, fontsLoaded, fontError, fetchBookingDetails]);

    const handleOpenCancelModal = useCallback(() => {
        if (actionLoading) return;
        setIsCancelModalVisible(true);
    }, [actionLoading]);

    const confirmCancellation = useCallback(async () => {
        if (!bookingDetails || !user) return;
        const bookingIdToCancel = bookingDetails.id;

        setIsCancelModalVisible(false);
        setActionLoading(true);
        console.log(`[confirmCancellation] Attempting to cancel booking via Supabase: ${bookingIdToCancel}`);

        try {
            const { error: updateError } = await supabase
                .from('bookings')
                .update({ status: 'canceled' })
                .eq('id', bookingIdToCancel)
                .eq('user_id', user.id);

            if (updateError) throw updateError;
            console.log(`✅ Booking ${bookingIdToCancel} cancelled in DB.`);
            setBookingDetails(prev => prev ? { ...prev, status: 'canceled' } : null);
            Alert.alert("Annulation confirmée", "Votre réservation a été annulée.");
        } catch (err: any) {
            console.error("Error cancelling booking:", err);
            Alert.alert("Erreur", `Impossible d'annuler : ${err.message || 'Erreur inconnue'}`);
            fetchBookingDetails();
        } finally {
            setActionLoading(false);
        }
    }, [user, bookingDetails, fetchBookingDetails]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchBookingDetails(true).finally(() => setRefreshing(false));
    }, [fetchBookingDetails]);

    if (!fontsLoaded || loading) {
        return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
    }
    if (fontError) {
        return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>;
    }
    if (error) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <AlertCircle size={40} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={() => fetchBookingDetails(true)} style={styles.retryButton}>
                    <RefreshCw size={16} color="#ffffff" />
                    <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.back()} style={[styles.retryButton, {backgroundColor: '#64748b', marginTop: 10}]}>
                    <ArrowLeft size={16} color="#ffffff" />
                    <Text style={styles.retryButtonText}>Retour</Text>
                </TouchableOpacity>
            </SafeAreaView>
         );
    }
    if (!bookingDetails) {
        return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Impossible d'afficher les détails de la réservation.</Text></SafeAreaView>;
    }

    // Formatage des dates (avec chaînes vérifiées)
    const startDate = parseISO(bookingDetails.start_time);
    const endDate = parseISO(bookingDetails.end_time);
    const createdAtDate = parseISO(bookingDetails.created_at);
    const isValidDates = isValid(startDate) && isValid(endDate);
    const durationHours = isValidDates ? differenceInHours(endDate, startDate) : 0;
    const formattedPrice = `${bookingDetails.total_price?.toFixed(0) ?? 'N/A'} MAD`;
    const coverImage = bookingDetails.pool_listing?.pool_images?.[0]?.url || null;
    const statusLabel = BOOKING_STATUS_LABELS[bookingDetails.status] || bookingDetails.status;
    const now = new Date();
    const canCancel = ['pending', 'confirmed'].includes(bookingDetails.status) && isValidDates && isAfter(startDate, now);
    const canContact = bookingDetails.conversation != null && ['pending', 'confirmed'].includes(bookingDetails.status) && bookingDetails.conversation.status !== 'archived';

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft color="#475569" size={22} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Ma Réservation</Text>
                 <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={refreshing || actionLoading}>
                     <RefreshCw size={18} color={refreshing || actionLoading ? "#cbd5e1" : "#475569"} />
                 </TouchableOpacity>
             </View>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891b2"/>}
            >
                 {bookingDetails.pool_listing && (
                     <View style={styles.sectionCard}>
                          {coverImage ? <Image source={{ uri: coverImage }} style={styles.poolImage} /> : <View style={[styles.poolImage, styles.placeholderImage]}><Calendar size={40} color="#cbd5e1" /></View>}
                          <Text style={styles.poolTitle}>{bookingDetails.pool_listing.title ?? 'Piscine sans titre'}</Text>
                          {bookingDetails.pool_listing.location && (<View style={styles.inlineInfo}><MapPin size={16} color="#64748b" /><Text style={styles.poolLocation}>{bookingDetails.pool_listing.location}</Text></View>)}
                          {bookingDetails.host_profile && (
                               <View style={[styles.inlineInfo, {marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: '#f1f5f9'}]}>
                                   <HostIcon size={16} color="#475569" />
                                   <Text style={styles.hostName}>Hôte: {bookingDetails.host_profile.full_name || 'Non spécifié'}</Text>
                               </View>
                          )}
                     </View>
                 )}
                 <View style={styles.sectionCard}>
                     <Text style={styles.sectionTitle}>Détails de ma réservation</Text>
                     <View style={styles.detailItem}><Info size={16} color="#475569" /><Text style={styles.detailValue}>Statut: <Text style={{ fontFamily: 'Montserrat-Bold' }}>{statusLabel}</Text></Text></View>
                     <View style={styles.detailItem}><Calendar size={16} color="#475569" />
                        <Text style={styles.detailValue}>
                            {/* Format date corrigé/vérifié */}
                            {isValidDates ? format(startDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Date invalide'}
                        </Text>
                    </View>
                     <View style={styles.detailItem}><Clock size={16} color="#475569" />
                        <Text style={styles.detailValue}>
                            {/* Format heures corrigé/vérifié */}
                            {isValidDates ? `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')} (${durationHours > 0 ? durationHours + 'h' : '<1h'})` : 'Horaire invalide'}
                        </Text>
                    </View>
                     <View style={styles.detailItem}><Users size={16} color="#475569" /><Text style={styles.detailValue}>{bookingDetails.guest_count} personne{bookingDetails.guest_count > 1 ? 's' : ''}</Text></View>
                     <View style={styles.detailItem}><DollarSign size={16} color="#475569" /><Text style={styles.detailValue}>Total payé: {formattedPrice}</Text></View>
                     <View style={styles.detailItem}><Calendar size={16} color="#475569" />
                        <Text style={styles.detailValue}>
                            Demandée le: {/* Format date création corrigé/vérifié */}
                            {isValid(createdAtDate) ? format(createdAtDate, 'd MMM yy à HH:mm', { locale: fr }) : 'Date inconnue'}
                        </Text>
                    </View>
                 </View>
                 <View style={styles.actionsContainer}>
                     {canCancel && (
                          <TouchableOpacity
                              style={[styles.actionButton, styles.cancelButton, actionLoading && styles.disabledButton]}
                              onPress={handleOpenCancelModal}
                              disabled={actionLoading}>
                              {actionLoading ? <ActivityIndicator size="small" color="#b91c1c" /> : <XCircle size={20} color="#b91c1c" />}
                              <Text style={styles.actionButtonTextCancel}>Annuler ma réservation</Text>
                          </TouchableOpacity>
                      )}
                      <TouchableOpacity style={[styles.actionButton, styles.messageButton, (!canContact || actionLoading) && styles.disabledButton]} onPress={() => { if (canContact && bookingDetails.conversation) { router.push(`/(tabs)/conversations/${bookingDetails.conversation.id}`); } else { Alert.alert("Contacter", "Conversation non disponible."); } }} disabled={!canContact || actionLoading}>
                          <MessageCircle size={20} color={canContact ? '#0891b2' : '#9ca3af'} />
                          <Text style={[styles.actionButtonTextMessage, !canContact && { color: '#9ca3af' }]}>Contacter l'hôte</Text>
                      </TouchableOpacity>
                      {bookingDetails.pool_id && (
                          <TouchableOpacity style={[styles.actionButton, styles.viewPoolButton]} onPress={() => router.push(`/pool/${bookingDetails.pool_id}`)} disabled={actionLoading}>
                              <Info size={16} color="#475569" />
                              <Text style={styles.viewPoolButtonText}>Voir l'annonce</Text>
                          </TouchableOpacity>
                      )}
                 </View>
            </ScrollView>

             <Modal
                 animationType="fade"
                 transparent={true}
                 visible={isCancelModalVisible}
                 onRequestClose={() => { if (!actionLoading) { setIsCancelModalVisible(false); } }}>
                 <View style={styles.modalOverlay}>
                     <View style={styles.modalContent}>
                         <Text style={styles.modalTitle}>Annuler Réservation ?</Text>
                         <Text style={styles.modalMessage}>Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.</Text>
                         <View style={styles.modalActions}>
                             <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setIsCancelModalVisible(false)} disabled={actionLoading}>
                                 <Text style={styles.modalButtonTextCancel}>Retour</Text>
                             </TouchableOpacity>
                             <TouchableOpacity style={[styles.modalButton, styles.modalButtonReject, actionLoading && styles.disabledButton]} onPress={confirmCancellation} disabled={actionLoading}>
                                {actionLoading ? <ActivityIndicator size="small" color="#ffffff"/> : <Text style={styles.modalButtonTextReject}>Oui, annuler</Text>}
                             </TouchableOpacity>
                         </View>
                     </View>
                 </View>
             </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
     container: { flex: 1, backgroundColor: '#f8fafc' },
     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
     errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' },
     errorText: { fontFamily: 'Montserrat-SemiBold', color: '#b91c1c', fontSize: 16, textAlign: 'center', marginBottom: 15 },
     retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10, gap: 8 },
     retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
     header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: Platform.OS === 'ios' ? 10 : 40, paddingBottom: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
     backButton: { padding: 8, marginRight: 5, marginLeft: -5 },
     refreshButton: { padding: 8 },
     headerTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 17, color: '#1e293b', textAlign: 'center', flex: 1, marginHorizontal: 5 },
     scrollContent: { padding: 16, paddingBottom: 100 },
     sectionCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
     poolImage: { width: '100%', height: 180, borderRadius: 8, marginBottom: 12, backgroundColor: '#e5e7eb' },
     placeholderImage: { justifyContent: 'center', alignItems: 'center' },
     poolTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1e293b', marginBottom: 6 },
     poolLocation: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', flexShrink: 1 },
     hostName: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', flexShrink: 1 },
     sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b', marginBottom: 16 },
     inlineInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
     detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
     detailValue: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#334155', flexShrink: 1, lineHeight: 22 },
     actionsContainer: { marginTop: 10, gap: 12, paddingBottom: 20 },
     actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, borderWidth: 1, gap: 10, minHeight: 50 },
     cancelButton: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
     actionButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#b91c1c' },
     messageButton: { backgroundColor: '#ecfeff', borderColor: '#cffafe' },
     actionButtonTextMessage: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2' },
     viewPoolButton: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' },
     viewPoolButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#475569' },
     disabledButton: { opacity: 0.6 },
     modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
     modalContent: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, width: '85%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
     modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 10, textAlign: 'center', },
     modalMessage: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#475569', marginBottom: 25, textAlign: 'center', lineHeight: 22, },
     modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, },
     modalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, minHeight: 40, justifyContent: 'center' },
     modalButtonCancel: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', },
     modalButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#475569', },
     modalButtonReject: { backgroundColor: '#ef4444', borderColor: '#dc2626', },
     modalButtonTextReject: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
});