// // Dans app/admin/booking/[id].tsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform, SafeAreaView, Alert, Image } from 'react-native';
// import { useLocalSearchParams, Stack, router } from 'expo-router';
// import { supabase } from '@/lib/supabase'; // Vérifiez chemin
// import { useAuth } from '@/hooks/useAuth'; // Vérifiez chemin
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import { ChevronLeft, User as UserIcon, Mail, Calendar, Clock, Users, DollarSign } from 'lucide-react-native';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';

// // Interface Booking adaptée aux colonnes de la VUE 'admin_bookings_view'
// interface AdminBookingDetail {
//     id: string;
//     start_time: string;
//     end_time: string;
//     status: string;
//     guest_count: number | null;
//     total_price: number | null;
//     created_at: string;
//     user_id: string;        // ID Client (Booker)
//     pool_listing_id: string;// ID Annonce
//     listing_title?: string | null; // Depuis la vue
//     listing_location?: string | null; // Si ajouté à la vue
//     listing_owner_id?: string | null; // Depuis la vue
//     user_full_name?: string | null; // Nom du Client (Booker)
//     user_email?: string | null;     // Email du Client (Booker)
//     user_avatar_url?: string | null;// Avatar du Client (Booker)
//     owner_full_name?: string | null;  // Nom du Propriétaire
//     owner_email?: string | null;      // Email du Propriétaire
//     owner_avatar_url?: string | null; // Avatar du Propriétaire
// }

// export default function BookingDetailScreen() {
//     const { id: bookingId } = useLocalSearchParams<{ id: string }>();
//     const { user: adminUser } = useAuth(); // Pour vérifier droits si besoin
//     const [bookingDetail, setBookingDetail] = useState<AdminBookingDetail | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     const [fontsLoaded, fontError] = useFonts({
//         'Montserrat-Bold': Montserrat_700Bold,
//         'Montserrat-SemiBold': Montserrat_600SemiBold,
//         'Montserrat-Regular': Montserrat_400Regular,
//     });

//     // Fonction Fetch qui utilise la VUE
//     const fetchBookingDetail = useCallback(async () => {
//         if (!bookingId) { setError("ID de réservation manquant."); setLoading(false); return; }
//         setLoading(true); setError(null);
//         console.log(`🚀 Fetching details for booking ID from VIEW: ${bookingId}`);

//         try {
//             // Assurez-vous que RLS permet la lecture de la vue
//             const { data, error: fetchError } = await supabase
//                 .from('admin_bookings_view') // <<< Interroger la vue !
//                 .select('*')                // <<< Sélectionner toutes les colonnes de la vue
//                 .eq('id', bookingId)        // Filtrer par l'ID de réservation
//                 .maybeSingle();             // Attendre une seule ligne

//             if (fetchError) throw fetchError;
//             if (!data) throw new Error("Réservation introuvable via la vue.");

//             console.log("✅ Booking details received via view:", data);
//             setBookingDetail(data as AdminBookingDetail);

//         } catch (err: any) {
//             console.error('Error loading booking details from view:', err);
//             setError(err.message || "Erreur chargement via la vue.");
//             setBookingDetail(null);
//         } finally {
//             setLoading(false);
//         }
//     }, [bookingId]);

//     // useEffect pour charger les données
//     useEffect(() => { if (fontsLoaded && !fontError && bookingId && adminUser) { fetchBookingDetail(); } }, [bookingId, fetchBookingDetail, fontsLoaded, fontError, adminUser]);

//     // Helper style statut
//     function getStatusStyle(status: string | null | undefined) { switch (status?.toLowerCase()) { case 'confirmed': return styles.statusConfirmed; case 'pending': return styles.statusPending; case 'cancelled': return styles.statusCancelled; default: return {}; } }

//     // --- Rendu ---
//     if (loading || !fontsLoaded) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
//     if (fontError) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
//     if (!adminUser) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Accès admin requis.</Text></SafeAreaView>; }
//     if (error || !bookingDetail) { return ( <SafeAreaView style={styles.container}> <Stack.Screen options={{ title: 'Erreur' }} /> <View style={styles.header}> <TouchableOpacity style={styles.backButton} onPress={router.back}> <ChevronLeft size={24} color="#1e293b" /> </TouchableOpacity> <Text style={styles.headerTitle}>Erreur Réservation</Text><View style={{width: 40}}/> </View> <View style={styles.errorContainer}> <Text style={styles.errorText}>{error || "Réservation introuvable."}</Text> <TouchableOpacity style={styles.buttonLink} onPress={router.back}> <Text style={styles.buttonLinkText}>Retour</Text> </TouchableOpacity> </View> </SafeAreaView> ); }

//     // Rendu principal
//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ title: `Réservation ...${bookingId.substring(bookingId.length - 6)}` }} />
//             <View style={styles.header}>
//                 <TouchableOpacity style={styles.backButton} onPress={() => router.back()}> <ChevronLeft size={24} color="#1e293b" /> </TouchableOpacity>
//                 <Text style={styles.headerTitle}>Détail Réservation</Text>
//                 <View style={{width: 40}} />{/* Placeholder */}
//             </View>

//             <ScrollView style={styles.content}>
//                 {/* Infos Réservation */}
//                 <View style={styles.section}>
//                      <Text style={styles.sectionTitle}>Informations Réservation</Text>
//                      <View style={styles.detailRow}><Text style={styles.detailLabel}>ID Résa:</Text><Text style={styles.detailValueMonospace}>{bookingDetail.id}</Text></View>
//                      <View style={styles.detailRow}><Text style={styles.detailLabel}>Statut:</Text><Text style={[styles.detailValue, getStatusStyle(bookingDetail.status)]}>{bookingDetail.status || 'N/A'}</Text></View>
//                      <View style={styles.detailRow}><Text style={styles.detailLabel}><Clock size={16} color="#4b5563" /> Horaire:</Text><Text style={styles.detailValue}>{format(new Date(bookingDetail.start_time), 'PPpp', { locale: fr })} - {format(new Date(bookingDetail.end_time), 'p', { locale: fr })}</Text></View>
//                      <View style={styles.detailRow}><Text style={styles.detailLabel}><Users size={16} color="#4b5563" /> Invités:</Text><Text style={styles.detailValue}>{bookingDetail.guest_count ?? 'N/A'}</Text></View>
//                      <View style={styles.detailRow}><Text style={styles.detailLabel}><DollarSign size={16} color="#4b5563" /> Prix Total:</Text><Text style={styles.detailValue}>{bookingDetail.total_price ?? 'N/A'} MAD</Text></View>
//                      <View style={styles.detailRow}><Text style={styles.detailLabel}><Calendar size={16} color="#4b5563" /> Réservé le:</Text><Text style={styles.detailValue}>{new Date(bookingDetail.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</Text></View>
//                 </View>

//                 {/* Client Ayant Réservé */}
//                 <View style={styles.section}>
//                      <Text style={styles.sectionTitle}>Client</Text>
//                      <View style={styles.profileContainer}>
//                          {bookingDetail.user_avatar_url && <Image source={{ uri: bookingDetail.user_avatar_url }} style={styles.avatar} />}
//                          <View style={styles.profileInfo}>
//                              <View style={styles.detailRow}>
//                                  <UserIcon size={16} color="#4b5563" />
//                                  <Text style={styles.detailLabel}>Nom:</Text>
//                                  <Text style={styles.detailValue}>{bookingDetail.user_full_name || '(Profil non trouvé)'}</Text>
//                              </View>
//                              {bookingDetail.user_email && (
//                                 <View style={styles.detailRow}>
//                                     <Mail size={16} color="#4b5563" />
//                                     <Text style={styles.detailLabel}>Email:</Text>
//                                     <Text style={[styles.detailValue, styles.linkText]} numberOfLines={1}>{bookingDetail.user_email}</Text>
//                                 </View>
//                              )}
//                              <Text style={styles.detailTextSmall}>ID User: {bookingDetail.user_id.substring(0, 8)}...</Text>
//                          </View>
//                      </View>
//                      {!bookingDetail.user_full_name && !bookingDetail.user_email && ( <Text style={styles.warningText}>Infos Profil/User client non trouvées.</Text> )}
//                 </View>

//                 {/* Annonce Concernée */}
//                  <View style={styles.section}>
//                      <Text style={styles.sectionTitle}>Annonce Concernée</Text>
//                     {bookingDetail.listing_title !== undefined ? ( // Utiliser listing_title de la vue
//                          <TouchableOpacity onPress={() => router.push(`/admin/listing-detail/${bookingDetail.pool_listing_id}`)}>
//                             <View style={styles.detailRow}><Text style={styles.detailLabel}>Titre:</Text> <Text style={[styles.detailValue, styles.linkText]} numberOfLines={1}>{bookingDetail.listing_title || '(Titre non disp.)'}</Text></View>
//                             {bookingDetail.listing_location && <View style={styles.detailRow}><Text style={styles.detailLabel}>Lieu:</Text> <Text style={styles.detailValue}>{bookingDetail.listing_location}</Text></View>}

//                             {/* Affichage Propriétaire Annonce */}
//                             {bookingDetail.listing_owner_id && (
//                                 <View style={styles.subSection}>
//                                      <Text style={styles.subSectionTitle}>Propriétaire Annonce</Text>
//                                      <View style={styles.profileContainer}>
//                                         {bookingDetail.owner_avatar_url && <Image source={{ uri: bookingDetail.owner_avatar_url }} style={styles.avatarSmall} />}
//                                         <View style={styles.profileInfo}>
//                                             <View style={styles.detailRow}><UserIcon size={14} color="#4b5563" /><Text style={styles.detailValueSmall}>{bookingDetail.owner_full_name || '(Nom inconnu)'}</Text></View>
//                                             {bookingDetail.owner_email && ( <View style={styles.detailRow}><Mail size={14} color="#4b5563" /><Text style={[styles.detailValueSmall, styles.linkText]} numberOfLines={1}>{bookingDetail.owner_email}</Text></View> )}
//                                             <Text style={styles.detailTextSmall}>ID Proprio: {bookingDetail.listing_owner_id.substring(0, 8)}...</Text>
//                                          </View>
//                                     </View>
//                                 </View>
//                              )}

//                          </TouchableOpacity>
//                      ) : ( <Text style={styles.detailText}>Détails annonce non trouvés (ID: {bookingDetail.pool_listing_id.substring(0,8)}...).</Text> )}
//                 </View>

//                  {/* Section Actions Admin (Placeholder) */}
//                  <View style={styles.actionsSection}>
//                       <Text style={styles.comingSoonText}>Actions Admin (Ex: Annuler Réservation) à venir...</Text>
//                  </View>

//             </ScrollView>
//         </SafeAreaView>
//     );
// }

// // --- Styles ---
// const styles = StyleSheet.create({
//      container: { flex: 1, backgroundColor: '#f8fafc' },
//      loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//      errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//      errorText: { fontFamily: 'Montserrat-Regular', color: '#b91c1c', fontSize: 16, textAlign: 'center', marginBottom: 15 },
//      header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? 40 : 60, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
//      backButton: { padding: 8, },
//      headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#111827', flex: 1, textAlign: 'center', marginRight: 40 /* Pour compenser bouton retour */ },
//      content: { flex: 1, },
//      section: { marginHorizontal: 16, marginBottom: 20, padding: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', boxShadow: "#000", boxShadow: { width: 0, height: 1 }, boxShadow: 0.05, boxShadow: 2, elevation: 1 },
//      sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#111827', marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
//      subSection: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6'},
//      subSectionTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#374151', marginBottom: 10 },
//      detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
//      detailLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#4b5563', width: 90 },
//      detailValue: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#1f2937', flex: 1 },
//      detailValueMonospace: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, color: '#1f2937', flex: 1 },
//      linkText: { color: '#0891b2', textDecorationLine: 'underline' },
//      profileContainer: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
//      avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e5e7eb' },
//      avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb' },
//      profileInfo: { flex: 1, gap: 6 },
//      detailTextSmall: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#6b7280' },
//      warningText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#f59e0b', fontStyle: 'italic', marginTop: 8 },
//      statusConfirmed: { color: '#10b981', fontFamily: 'Montserrat-SemiBold' },
//      statusPending: { color: '#f59e0b', fontFamily: 'Montserrat-SemiBold' },
//      statusCancelled: { color: '#6b7280', fontFamily: 'Montserrat-Regular' },
//      buttonLink: { marginTop: 15, paddingVertical: 10 },
//      buttonLinkText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2', textAlign: 'center' },
//      actionsSection: { marginTop: 10, paddingTop: 16, marginHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', alignItems: 'center' },
//      comingSoonText: { fontFamily: 'Montserrat-Regular', fontStyle: 'italic', color: '#9ca3af', fontSize: 14 }
// });



// // Dans app/admin/booking/[id].tsx
// // VERSION CORRIGÉE : Utilisation d'un Modal personnalisé pour l'annulation admin

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
//     Platform, SafeAreaView, Alert, Image,
//     Modal // *** Modal importé ***
// } from 'react-native';
// import { useLocalSearchParams, Stack, router } from 'expo-router';
// import { supabase } from '@/lib/supabase'; // Vérifiez chemin
// import { useAuth } from '@/hooks/useAuth'; // Vérifiez chemin
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import {
//     ChevronLeft, User as UserIcon, Mail, Calendar, Clock, Users, DollarSign,
//     XCircle, // Icône pour annuler
//     AlertTriangle, // Pour l'erreur
//     RefreshCcw // Pour le bouton Réessayer
// } from 'lucide-react-native';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';

// // Interface Booking adaptée aux colonnes de la VUE 'admin_bookings_view'
// interface AdminBookingDetail {
//     id: string;
//     start_time: string;
//     end_time: string;
//     status: string;
//     guest_count: number | null;
//     total_price: number | null;
//     created_at: string;
//     user_id: string;
//     pool_id: string; // Utilise pool_id de la vue corrigée
//     listing_title?: string | null;
//     listing_location?: string | null;
//     listing_owner_id?: string | null;
//     user_full_name?: string | null;
//     user_email?: string | null;
//     user_avatar_url?: string | null;
//     owner_full_name?: string | null;
//     owner_email?: string | null;
//     owner_avatar_url?: string | null;
// }

// // Constantes pour les labels de statut
// const BOOKING_STATUS_LABELS: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', completed: 'Terminée', canceled: 'Annulée', declined: 'Refusée' };


// export default function AdminBookingDetailScreen() {
//     const { id: bookingId } = useLocalSearchParams<{ id: string }>();
//     const { user: adminUser } = useAuth();
//     const [bookingDetail, setBookingDetail] = useState<AdminBookingDetail | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [actionLoading, setActionLoading] = useState(false);
//     // *** État pour le modal d'annulation ***
//     const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

//     const [fontsLoaded, fontError] = useFonts({
//         'Montserrat-Bold': Montserrat_700Bold,
//         'Montserrat-SemiBold': Montserrat_600SemiBold,
//         'Montserrat-Regular': Montserrat_400Regular,
//     });

//     // Fonction Fetch qui utilise la VUE
//     const fetchBookingDetail = useCallback(async (calledFrom?: string) => {
//         if (!bookingId || typeof bookingId !== 'string') { setError("ID de réservation invalide."); setLoading(false); return; }
//         // Ne pas relancer le loader si on recharge après une action
//         if (calledFrom !== 'actionComplete') {
//              setLoading(true);
//         }
//         setError(null);
//         console.log(`🚀 (${calledFrom || 'initial'}) Fetching details for booking ID from VIEW: ${bookingId}`);

//         try {
//             const { data, error: fetchError } = await supabase
//                 .from('admin_bookings_view')
//                 .select('*')
//                 .eq('id', bookingId)
//                 .maybeSingle();

//             if (fetchError) throw fetchError;
//             if (!data) throw new Error("Réservation introuvable via la vue.");

//             console.log("✅ Booking details received via view:", data);
//             setBookingDetail(data as AdminBookingDetail);

//         } catch (err: any) {
//             console.error('Error loading booking details from view:', err);
//             setError(err.message || "Erreur chargement via la vue.");
//             setBookingDetail(null);
//         } finally {
//              // Arrêter le loader seulement si ce n'est pas un rechargement post-action
//              if (calledFrom !== 'actionComplete') {
//                 setLoading(false);
//              }
//         }
//     }, [bookingId]);

//     // useEffect pour charger les données
//     useEffect(() => { if (fontsLoaded && !fontError && bookingId && adminUser) { fetchBookingDetail('initial'); } }, [bookingId, fetchBookingDetail, fontsLoaded, fontError, adminUser]);

//     // --- Fonction pour OUVRIR le modal d'annulation ---
//     const openAdminCancelModal = useCallback(() => {
//         if (!bookingDetail || actionLoading) return;
//         setIsCancelModalVisible(true);
//     }, [bookingDetail, actionLoading]);

//     // --- Fonction pour CONFIRMER l'annulation (appelée par le modal) ---
//     const confirmAdminCancellation = useCallback(async () => {
//         if (!bookingDetail || actionLoading) return;

//         setIsCancelModalVisible(false); // Ferme le modal
//         setActionLoading(true);
//         setError(null);
//         console.log(`🔄 Admin cancelling booking ID: ${bookingDetail.id}`);
//         try {
//             const { error: updateError } = await supabase
//                 .from('bookings')
//                 .update({ status: 'canceled' }) // Ou 'canceled'
//                 .eq('id', bookingDetail.id);

//             if (updateError) throw updateError;

//             console.log(`✅ Booking ${bookingDetail.id} canceled by admin.`);
//             Alert.alert("Succès", "La réservation a été annulée.");
//             // Recharger les détails pour voir le nouveau statut
//             fetchBookingDetail('actionComplete'); // Indiquer que c'est un rechargement post-action

//         } catch (err: any) {
//             console.error("Error cancelling booking by admin:", err);
//             setError(err.message || "Erreur lors de l'annulation.");
//             Alert.alert("Erreur", `Impossible d'annuler : ${err.message}`);
//         } finally {
//             setActionLoading(false);
//         }
//     }, [bookingDetail, actionLoading, fetchBookingDetail]);

//     // Helper style statut
//     function getStatusStyle(status: string | null | undefined) { switch (status?.toLowerCase()) { case 'confirmed': return styles.statusConfirmed; case 'pending': return styles.statusPending; case 'canceled': return styles.statusCancelled; case 'declined': return styles.statusDeclined; case 'completed': return styles.statusCompleted; default: return {}; } }
//     function getStatusLabel(status: string | null | undefined): string { const key = status?.toLowerCase() || ''; return BOOKING_STATUS_LABELS[key] || key; }

//     // --- Rendu ---
//     if (loading || !fontsLoaded) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
//     if (fontError) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
//     if (!adminUser) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Accès admin requis.</Text></SafeAreaView>; }
//     if (error || !bookingDetail) { return ( <SafeAreaView style={styles.container}> <Stack.Screen options={{ title: 'Erreur' }} /> <View style={styles.header}> <TouchableOpacity style={styles.backButton} onPress={router.back}> <ChevronLeft size={24} color="#1e293b" /> </TouchableOpacity> <Text style={styles.headerTitle}>Erreur Réservation</Text><View style={{width: 40}}/> </View> <View style={styles.errorContainer}> <AlertTriangle size={40} color="#dc2626" /><Text style={styles.errorText}>{error || "Réservation introuvable."}</Text> <TouchableOpacity style={styles.buttonLink} onPress={router.back}> <Text style={styles.buttonLinkText}>Retour</Text> </TouchableOpacity> </View> </SafeAreaView> ); }

//     // Rendu principal
//     const canBeCancelledByAdmin = bookingDetail.status !== 'cancelled' && bookingDetail.status !== 'completed';

//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ title: `Résa ...${bookingId.substring(bookingId.length - 6)}` }} />
//             <View style={styles.header}>
//                 <TouchableOpacity style={styles.backButton} onPress={() => router.back()}> <ChevronLeft size={24} color="#1e293b" /> </TouchableOpacity>
//                 <Text style={styles.headerTitle}>Détail de la réservation</Text>
//                 <View style={{width: 40}} />{/* Placeholder */}
//             </View>

//             <ScrollView style={styles.content}>
//                 {/* Bannière d'erreur non bloquante (pour erreurs d'action) */}
//                 {error && actionLoading && (
//                    <View style={styles.errorBanner}>
//                        <Text style={styles.errorBannerText}>{error}</Text>
//                    </View>
//                 )}

//                 {/* Infos Réservation */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionTitle}>Informations Réservation</Text>
//                     <View style={styles.detailRow}><Text style={styles.detailLabel}>ID Résa:</Text><Text style={styles.detailValueMonospace}>{bookingDetail.id}</Text></View>
//                     <View style={styles.detailRow}><Text style={styles.detailLabel}>Statut:</Text><Text style={[styles.detailValue, getStatusStyle(bookingDetail.status)]}>{getStatusLabel(bookingDetail.status)}</Text></View>
//                     <View style={styles.detailRow}><Text style={styles.detailLabel}><Clock size={16} color="#4b5563" /> Horaire:</Text><Text style={styles.detailValue}>{format(new Date(bookingDetail.start_time), 'PPpp', { locale: fr })} - {format(new Date(bookingDetail.end_time), 'p', { locale: fr })}</Text></View>
//                     <View style={styles.detailRow}><Text style={styles.detailLabel}><Users size={16} color="#4b5563" /> Invités:</Text><Text style={styles.detailValue}>{bookingDetail.guest_count ?? 'N/A'}</Text></View>
//                     <View style={styles.detailRow}><Text style={styles.detailLabel}><DollarSign size={16} color="#4b5563" /> Prix Total:</Text><Text style={styles.detailValue}>{bookingDetail.total_price ?? 'N/A'} MAD</Text></View>
//                     <View style={styles.detailRow}><Text style={styles.detailLabel}><Calendar size={16} color="#4b5563" /> Réservé le:</Text><Text style={styles.detailValue}>{new Date(bookingDetail.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</Text></View>
//                 </View>

//                 {/* Client Ayant Réservé */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionTitle}>Client</Text>
//                     <View style={styles.profileContainer}>
//                         {bookingDetail.user_avatar_url ? <Image source={{ uri: bookingDetail.user_avatar_url }} style={styles.avatar} /> : <View style={[styles.avatar, styles.avatarPlaceholder]}><UserIcon size={24} color="#9ca3af"/></View>}
//                         <View style={styles.profileInfo}>
//                             <View style={styles.detailRow}><UserIcon size={16} color="#4b5563" /><Text style={styles.detailLabel}>Nom:</Text><Text style={styles.detailValue}>{bookingDetail.user_full_name || '(Profil non trouvé)'}</Text></View>
//                             {bookingDetail.user_email && ( <View style={styles.detailRow}><Mail size={16} color="#4b5563" /><Text style={styles.detailLabel}>Email:</Text><Text style={[styles.detailValue, styles.linkText]} numberOfLines={1}>{bookingDetail.user_email}</Text></View> )}
//                             <Text style={styles.detailTextSmall}>ID User: {bookingDetail.user_id.substring(0, 8)}...</Text>
//                         </View>
//                     </View>
//                     {!bookingDetail.user_full_name && !bookingDetail.user_email && ( <Text style={styles.warningText}>Infos Profil/User client non trouvées.</Text> )}
//                 </View>

//                 {/* Annonce Concernée */}
//                  <View style={styles.section}>
//                      <Text style={styles.sectionTitle}>Annonce Concernée</Text>
//                     {bookingDetail.listing_title !== undefined ? (
//                          <TouchableOpacity onPress={() => router.push(`/admin/listing-detail/${bookingDetail.pool_id}`)}> {/* Utilise pool_id */}
//                              <View style={styles.detailRow}><Text style={styles.detailLabel}>Titre:</Text> <Text style={[styles.detailValue, styles.linkText]} numberOfLines={1}>{bookingDetail.listing_title || '(Titre non disp.)'}</Text></View>
//                              {bookingDetail.listing_location && <View style={styles.detailRow}><Text style={styles.detailLabel}>Lieu:</Text> <Text style={styles.detailValue}>{bookingDetail.listing_location}</Text></View>}
//                              {bookingDetail.listing_owner_id && (
//                                  <View style={styles.subSection}>
//                                      <Text style={styles.subSectionTitle}>Propriétaire Annonce</Text>
//                                      <View style={styles.profileContainer}>
//                                          {bookingDetail.owner_avatar_url ? <Image source={{ uri: bookingDetail.owner_avatar_url }} style={styles.avatarSmall} /> : <View style={[styles.avatarSmall, styles.avatarPlaceholder]}><UserIcon size={16} color="#9ca3af"/></View>}
//                                          <View style={styles.profileInfo}>
//                                              <View style={styles.detailRow}><UserIcon size={14} color="#4b5563" /><Text style={styles.detailValueSmall}>{bookingDetail.owner_full_name || '(Nom inconnu)'}</Text></View>
//                                              {bookingDetail.owner_email && ( <View style={styles.detailRow}><Mail size={14} color="#4b5563" /><Text style={[styles.detailValueSmall, styles.linkText]} numberOfLines={1}>{bookingDetail.owner_email}</Text></View> )}
//                                              <Text style={styles.detailTextSmall}>ID Proprio: {bookingDetail.listing_owner_id.substring(0, 8)}...</Text>
//                                          </View>
//                                      </View>
//                                  </View>
//                              )}
//                          </TouchableOpacity>
//                      ) : ( <Text style={styles.detailText}>Détails annonce non trouvés (ID: {bookingDetail.pool_id.substring(0,8)}...).</Text> )}
//                  </View>

//                 {/* Section Actions Admin */}
//                 <View style={styles.actionsSection}>
//                     <Text style={styles.sectionTitle}>Actions Administrateur</Text>
//                     {canBeCancelledByAdmin ? (
//                         <TouchableOpacity
//                             style={[styles.actionButton, styles.cancelButton, actionLoading && styles.disabledButton]}
//                             onPress={openAdminCancelModal} // *** Ouvre le modal ***
//                             disabled={actionLoading}
//                         >
//                             {actionLoading ? (
//                                 <ActivityIndicator size="small" color="#b91c1c" />
//                             ) : (
//                                 <XCircle size={20} color="#b91c1c" />
//                             )}
//                             <Text style={styles.actionButtonTextCancel}>Annuler la Réservation</Text>
//                         </TouchableOpacity>
//                     ) : (
//                         <Text style={styles.infoText}>Aucune action disponible pour ce statut ({getStatusLabel(bookingDetail.status)}).</Text>
//                     )}
//                     {/* Ajouter d'autres boutons d'action admin ici si nécessaire */}
//                 </View>

//             </ScrollView>

//              {/* *** Modal d'annulation Admin *** */}
//              <Modal
//                 animationType="fade"
//                 transparent={true}
//                 visible={isCancelModalVisible}
//                 onRequestClose={() => { if (!actionLoading) setIsCancelModalVisible(false); }}>
//                 <View style={styles.modalOverlay}>
//                     <View style={styles.modalContent}>
//                         <Text style={styles.modalTitle}>Annuler Réservation ?</Text>
//                         <Text style={styles.modalMessage}>
//                             Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible et le client pourrait être notifié.
//                         </Text>
//                         <View style={styles.modalActions}>
//                             <TouchableOpacity
//                                 style={[styles.modalButton, styles.modalButtonCancel]}
//                                 onPress={() => setIsCancelModalVisible(false)}
//                                 disabled={actionLoading}
//                             >
//                                 <Text style={styles.modalButtonTextCancel}>Retour</Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity
//                                 style={[styles.modalButton, styles.modalButtonReject]} // Style destructif
//                                 onPress={confirmAdminCancellation}
//                                 disabled={actionLoading}
//                             >
//                                 {actionLoading ? (
//                                     <ActivityIndicator size="small" color="#ffffff"/>
//                                 ) : (
//                                     <Text style={styles.modalButtonTextReject}>Oui, Annuler</Text>
//                                 )}
//                             </TouchableOpacity>
//                         </View>
//                     </View>
//                 </View>
//             </Modal>

//         </SafeAreaView>
//     );
// }

// // --- Styles ---
// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#f8fafc' },
//     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//     errorText: { fontFamily: 'Montserrat-Regular', color: '#b91c1c', fontSize: 16, textAlign: 'center', marginBottom: 15 },
//     header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? 40 : 60, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
//     backButton: { padding: 8, },
//     headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#111827', flex: 1, textAlign: 'center', marginRight: 40 /* Pour compenser bouton retour */ },
//     content: { flex: 1, },
//     section: { marginHorizontal: 16, marginBottom: 20, padding: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
//     sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#111827', marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
//     subSection: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6'},
//     subSectionTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#374151', marginBottom: 10 },
//     detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
//     detailLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#4b5563', width: 90 },
//     detailValue: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#1f2937', flex: 1 },
//     detailValueMonospace: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, color: '#1f2937', flex: 1 },
//     detailTextSmall: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#6b7280' },
//     linkText: { color: '#0891b2', textDecorationLine: 'underline' },
//     profileContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//     avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e5e7eb' },
//     avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb' },
//     avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
//     profileInfo: { flex: 1, gap: 4 },
//     warningText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#f59e0b', fontStyle: 'italic', marginTop: 8 },
//     statusConfirmed: { color: '#10b981', fontFamily: 'Montserrat-SemiBold' },
//     statusPending: { color: '#f59e0b', fontFamily: 'Montserrat-SemiBold' },
//     statusCancelled: { color: '#6b7280', fontFamily: 'Montserrat-SemiBold' }, // Corrigé
//     statusDeclined: { color: '#ef4444', fontFamily: 'Montserrat-SemiBold' },
//     statusCompleted: { color: '#374151', fontFamily: 'Montserrat-SemiBold' },
//     buttonLink: { marginTop: 15, paddingVertical: 10 },
//     buttonLinkText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2', textAlign: 'center' },
//     actionsSection: { marginTop: 10, paddingTop: 16, marginHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', alignItems: 'stretch' },
//     actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, borderWidth: 1, gap: 10, minHeight: 50, marginBottom: 12 },
//     cancelButton: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
//     actionButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#b91c1c' },
//     disabledButton: { opacity: 0.6 },
//     infoText: { fontFamily: 'Montserrat-Regular', fontStyle: 'italic', color: '#6b7280', fontSize: 14, textAlign: 'center', paddingVertical: 10 },
//     errorBanner: { backgroundColor: '#fee2e2', paddingVertical: 10, paddingHorizontal: 16, marginHorizontal: 16, marginTop: 16, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca' },
//     errorBannerText: { color: '#b91c1c', fontFamily: 'Montserrat-Regular', fontSize: 14 },
//     retryButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginTop: 16 },
//     retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
//     // Styles pour le Modal (ajoutés)
//      modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
//      modalContent: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, width: '85%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
//      modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 10, textAlign: 'center', },
//      modalMessage: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#475569', marginBottom: 25, textAlign: 'center', lineHeight: 22, },
//      modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, },
//      modalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, },
//      modalButtonCancel: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', },
//      modalButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#475569', },
//      modalButtonReject: { backgroundColor: '#ef4444', borderColor: '#dc2626', }, // Style "destructive"
//      modalButtonTextReject: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
// });



// Dans app/admin/booking/[id].tsx
// VERSION CORRIGÉE : Chasse finale au nœud texte parasite

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,
    Platform, SafeAreaView, Alert, Image,
    Modal
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import {
    ChevronLeft, User as UserIcon, Mail, Calendar, Clock, Users, DollarSign,
    XCircle,
    AlertTriangle,
    RefreshCcw
} from 'lucide-react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Interface Booking adaptée aux colonnes de la VUE 'admin_bookings_view'
interface AdminBookingDetail {
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    guest_count: number | null;
    total_price: number | null;
    created_at: string;
    user_id: string;
    pool_id: string;
    listing_title?: string | null;
    listing_location?: string | null;
    listing_owner_id?: string | null;
    user_full_name?: string | null;
    user_email?: string | null;
    user_avatar_url?: string | null;
    owner_full_name?: string | null;
    owner_email?: string | null;
    owner_avatar_url?: string | null;
}

// Constantes pour les labels de statut
const BOOKING_STATUS_LABELS: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', completed: 'Terminée', canceled: 'Annulée', declined: 'Refusée' };


export default function AdminBookingDetailScreen() {
    const { id: bookingId } = useLocalSearchParams<{ id: string }>();
    const { user: adminUser } = useAuth();
    const [bookingDetail, setBookingDetail] = useState<AdminBookingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // Fonction Fetch qui utilise la VUE
    const fetchBookingDetail = useCallback(async (calledFrom?: string) => {
        if (!bookingId || typeof bookingId !== 'string') { setError("ID de réservation invalide."); setLoading(false); return; }
        if (calledFrom !== 'actionComplete') { setLoading(true); }
        setError(null);
        console.log(`🚀 (${calledFrom || 'initial'}) Fetching details for booking ID from VIEW: ${bookingId}`);

        try {
            const { data, error: fetchError } = await supabase
                .from('admin_bookings_view')
                .select('*')
                .eq('id', bookingId)
                .maybeSingle();

            if (fetchError) throw fetchError;
            if (!data) throw new Error("Réservation introuvable via la vue.");

            console.log("✅ Booking details received via view:", data);
            setBookingDetail(data as AdminBookingDetail);

        } catch (err: any) {
            console.error('Error loading booking details from view:', err);
            setError(err.message || "Erreur chargement via la vue.");
            setBookingDetail(null);
        } finally {
             if (calledFrom !== 'actionComplete') { setLoading(false); }
        }
    }, [bookingId]);

    // useEffect pour charger les données
    useEffect(() => { if (fontsLoaded && !fontError && bookingId && adminUser) { fetchBookingDetail('initial'); } }, [bookingId, fetchBookingDetail, fontsLoaded, fontError, adminUser]);

    // --- Fonction pour OUVRIR le modal d'annulation ---
    const openAdminCancelModal = useCallback(() => {
        if (!bookingDetail || actionLoading) return;
        setIsCancelModalVisible(true);
    }, [bookingDetail, actionLoading]);

    // --- Fonction pour CONFIRMER l'annulation (appelée par le modal) ---
    const confirmAdminCancellation = useCallback(async () => {
        if (!bookingDetail || actionLoading) return;

        setIsCancelModalVisible(false);
        setActionLoading(true);
        setError(null);
        console.log(`🔄 Admin cancelling booking ID: ${bookingDetail.id}`);
        try {
            const { error: updateError } = await supabase
                .from('bookings')
                .update({ status: 'canceled' }) // Utilise 'canceled' (un seul l)
                .eq('id', bookingDetail.id);

            if (updateError) throw updateError;

            console.log(`✅ Booking ${bookingDetail.id} cancelled by admin.`);
            // Utiliser Alert pour le moment pour confirmer le flux
            Alert.alert("Succès", "La réservation a été annulée.");
            fetchBookingDetail('actionComplete');

        } catch (err: any) {
            console.error("Error cancelling booking by admin:", err);
            setError(err.message || "Erreur lors de l'annulation.");
            Alert.alert("Erreur", `Impossible d'annuler : ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    }, [bookingDetail, actionLoading, fetchBookingDetail]);

    // Helper style statut
    function getStatusStyle(status: string | null | undefined) { switch (status?.toLowerCase()) { case 'confirmed': return styles.statusConfirmed; case 'pending': return styles.statusPending; case 'canceled': return styles.statusCancelled; case 'declined': return styles.statusDeclined; case 'completed': return styles.statusCompleted; default: return {}; } }
    function getStatusLabel(status: string | null | undefined): string { const key = status?.toLowerCase() || ''; return BOOKING_STATUS_LABELS[key] || key; }

    // --- Rendu ---
    if (loading || !fontsLoaded) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
    if (fontError) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
    if (!adminUser) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Accès admin requis.</Text></SafeAreaView>; }
    if (error || !bookingDetail) { return ( <SafeAreaView style={styles.container}> <Stack.Screen options={{ title: 'Erreur' }} /> <View style={styles.header}> <TouchableOpacity style={styles.backButton} onPress={router.back}> <ChevronLeft size={24} color="#1e293b" /> </TouchableOpacity> <Text style={styles.headerTitle}>Erreur Réservation</Text><View style={{width: 40}}/> </View> <View style={styles.errorContainer}> <AlertTriangle size={40} color="#dc2626" /><Text style={styles.errorText}>{error || "Réservation introuvable."}</Text> <TouchableOpacity style={styles.buttonLink} onPress={router.back}> <Text style={styles.buttonLinkText}>Retour</Text> </TouchableOpacity> </View> </SafeAreaView> ); }

    // Rendu principal
    console.log("Rendering check: bookingDetail.status =", bookingDetail.status);
    const canBeCancelledByAdmin = bookingDetail.status !== 'canceled' && bookingDetail.status !== 'completed';
    console.log("Rendering check: canBeCancelledByAdmin =", canBeCancelledByAdmin);


    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: `Résa ...${bookingId.substring(bookingId.length - 6)}` }} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ChevronLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Détail Réservation (Admin)</Text>
                <View style={{width: 40}} />{/* Placeholder */}
            </View>

            <ScrollView style={styles.content}>
                {/* Bannière d'erreur non bloquante */}
                {error && actionLoading && (
                   <View style={styles.errorBanner}>
                       <Text style={styles.errorBannerText}>{error}</Text>
                   </View>
                )}

                {/* Infos Réservation */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations Réservation</Text>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>ID Résa:</Text><Text style={styles.detailValueMonospace}>{bookingDetail.id}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Statut:</Text><Text style={[styles.detailValue, getStatusStyle(bookingDetail.status)]}>{getStatusLabel(bookingDetail.status)}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}><Clock size={16} color="#4b5563" /> Horaire:</Text><Text style={styles.detailValue}>{format(new Date(bookingDetail.start_time), 'PPpp', { locale: fr })} - {format(new Date(bookingDetail.end_time), 'p', { locale: fr })}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}><Users size={16} color="#4b5563" /> Invités:</Text><Text style={styles.detailValue}>{bookingDetail.guest_count ?? 'N/A'}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}><DollarSign size={16} color="#4b5563" /> Prix Total:</Text><Text style={styles.detailValue}>{bookingDetail.total_price ?? 'N/A'} MAD</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}><Calendar size={16} color="#4b5563" /> Réservé le:</Text><Text style={styles.detailValue}>{new Date(bookingDetail.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</Text></View>
                </View>

                {/* Client Ayant Réservé */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Client</Text>
                    <View style={styles.profileContainer}>
                        {bookingDetail.user_avatar_url ? <Image source={{ uri: bookingDetail.user_avatar_url }} style={styles.avatar} /> : <View style={[styles.avatar, styles.avatarPlaceholder]}><UserIcon size={24} color="#9ca3af"/></View>}
                        <View style={styles.profileInfo}>
                            <View style={styles.detailRow}><UserIcon size={16} color="#4b5563" /><Text style={styles.detailLabel}>Nom:</Text><Text style={styles.detailValue}>{bookingDetail.user_full_name || '(Profil non trouvé)'}</Text></View>
                            {bookingDetail.user_email && ( <View style={styles.detailRow}><Mail size={16} color="#4b5563" /><Text style={styles.detailLabel}>Email:</Text><Text style={[styles.detailValue, styles.linkText]} numberOfLines={1}>{bookingDetail.user_email}</Text></View> )}
                            <Text style={styles.detailTextSmall}>ID User: {bookingDetail.user_id.substring(0, 8)}...</Text>
                        </View>
                    </View>
                    {!bookingDetail.user_full_name && !bookingDetail.user_email && ( <Text style={styles.warningText}>Infos Profil/User client non trouvées.</Text> )}
                </View>

                {/* Annonce Concernée */}
                 <View style={styles.section}>
                     <Text style={styles.sectionTitle}>Annonce Concernée</Text>
                    {bookingDetail.listing_title !== undefined ? (
                         <TouchableOpacity onPress={() => router.push(`/admin/listing-detail/${bookingDetail.pool_id}`)}>
                             <View style={styles.detailRow}><Text style={styles.detailLabel}>Titre:</Text> <Text style={[styles.detailValue, styles.linkText]} numberOfLines={1}>{bookingDetail.listing_title || '(Titre non disp.)'}</Text></View>
                             {bookingDetail.listing_location && <View style={styles.detailRow}><Text style={styles.detailLabel}>Lieu:</Text> <Text style={styles.detailValue}>{bookingDetail.listing_location}</Text></View>}
                             {bookingDetail.listing_owner_id && (
                                 <View style={styles.subSection}>
                                     <Text style={styles.subSectionTitle}>Propriétaire Annonce</Text>
                                     <View style={styles.profileContainer}>
                                         {bookingDetail.owner_avatar_url ? <Image source={{ uri: bookingDetail.owner_avatar_url }} style={styles.avatarSmall} /> : <View style={[styles.avatarSmall, styles.avatarPlaceholder]}><UserIcon size={16} color="#9ca3af"/></View>}
                                         <View style={styles.profileInfo}>
                                             <View style={styles.detailRow}><UserIcon size={14} color="#4b5563" /><Text style={styles.detailValueSmall}>{bookingDetail.owner_full_name || '(Nom inconnu)'}</Text></View>
                                             {bookingDetail.owner_email && ( <View style={styles.detailRow}><Mail size={14} color="#4b5563" /><Text style={[styles.detailValueSmall, styles.linkText]} numberOfLines={1}>{bookingDetail.owner_email}</Text></View> )}
                                             <Text style={styles.detailTextSmall}>ID Proprio: {bookingDetail.listing_owner_id.substring(0, 8)}...</Text>
                                         </View>
                                     </View>
                                 </View>
                             )}
                         </TouchableOpacity>
                     ) : ( <Text style={styles.detailText}>Détails annonce non trouvés (ID: {bookingDetail.pool_id.substring(0,8)}...).</Text> )}
                 </View>

                {/* Section Actions Admin */}
                <View style={styles.actionsSection}>
                    <Text style={styles.sectionTitle}>Actions Administrateur</Text>
                    {/* Vérifier si on peut annuler */}
                    {canBeCancelledByAdmin ? (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton, actionLoading && styles.disabledButton]}
                            onPress={openAdminCancelModal}
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <ActivityIndicator size="small" color="#b91c1c" />
                            ) : (
                                <XCircle size={20} color="#b91c1c" />
                            )}
                            <Text style={styles.actionButtonTextCancel}>Annuler la Réservation</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.infoText}>Aucune action disponible pour ce statut ({getStatusLabel(bookingDetail.status)}).</Text>
                    )}
                    {/* Ajouter d'autres boutons ici si nécessaire */}
                </View>

            </ScrollView>

             {/* Modal d'annulation Admin */}
             <Modal
                animationType="fade"
                transparent={true}
                visible={isCancelModalVisible}
                onRequestClose={() => { if (!actionLoading) setIsCancelModalVisible(false); }}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Annuler Réservation ?</Text>
                        <Text style={styles.modalMessage}>
                            Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible et le client pourrait être notifié.
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonCancel]}
                                onPress={() => setIsCancelModalVisible(false)}
                                disabled={actionLoading}
                            >
                                <Text style={styles.modalButtonTextCancel}>Retour</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonReject]} // Style destructif
                                onPress={confirmAdminCancellation}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color="#ffffff"/>
                                ) : (
                                    <Text style={styles.modalButtonTextReject}>Oui, Annuler</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontFamily: 'Montserrat-Regular', color: '#b91c1c', fontSize: 16, textAlign: 'center', marginBottom: 15 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? 40 : 60, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    backButton: { padding: 8, },
    headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#111827', flex: 1, textAlign: 'center', marginRight: 40 /* Pour compenser bouton retour */ },
    content: { flex: 1, },
    section: { marginHorizontal: 16, marginBottom: 20, padding: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#111827', marginBottom: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    subSection: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6'},
    subSectionTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#374151', marginBottom: 10 },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
    detailLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#4b5563', width: 90 },
    detailValue: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#1f2937', flex: 1 },
    detailValueMonospace: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, color: '#1f2937', flex: 1 },
    detailTextSmall: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#6b7280' },
    linkText: { color: '#0891b2', textDecorationLine: 'underline' },
    profileContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#e5e7eb' },
    avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e5e7eb' },
    avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
    profileInfo: { flex: 1, gap: 4 },
    warningText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#f59e0b', fontStyle: 'italic', marginTop: 8 },
    statusConfirmed: { color: '#10b981', fontFamily: 'Montserrat-SemiBold' },
    statusPending: { color: '#f59e0b', fontFamily: 'Montserrat-SemiBold' },
    statusCancelled: { color: '#6b7280', fontFamily: 'Montserrat-SemiBold' },
    statusDeclined: { color: '#ef4444', fontFamily: 'Montserrat-SemiBold' },
    statusCompleted: { color: '#374151', fontFamily: 'Montserrat-SemiBold' },
    buttonLink: { marginTop: 15, paddingVertical: 10 },
    buttonLinkText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2', textAlign: 'center' },
    actionsSection: { marginTop: 10, paddingTop: 16, marginHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', alignItems: 'stretch' },
    actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, borderWidth: 1, gap: 10, minHeight: 50, marginBottom: 12 },
    cancelButton: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
    actionButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#b91c1c' },
    disabledButton: { opacity: 0.6 },
    infoText: { fontFamily: 'Montserrat-Regular', fontStyle: 'italic', color: '#6b7280', fontSize: 14, textAlign: 'center', paddingVertical: 10 },
    errorBanner: { backgroundColor: '#fee2e2', paddingVertical: 10, paddingHorizontal: 16, marginHorizontal: 16, marginTop: 16, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca' },
    errorBannerText: { color: '#b91c1c', fontFamily: 'Montserrat-Regular', fontSize: 14 },
    retryButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginTop: 16 },
    retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
    // Styles pour le Modal (ajoutés)
     modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
     modalContent: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, width: '85%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
     modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 10, textAlign: 'center', },
     modalMessage: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#475569', marginBottom: 25, textAlign: 'center', lineHeight: 22, },
     modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, },
     modalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, },
     modalButtonCancel: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', },
     modalButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#475569', },
     modalButtonReject: { backgroundColor: '#ef4444', borderColor: '#dc2626', }, // Style "destructive"
     modalButtonTextReject: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
});
