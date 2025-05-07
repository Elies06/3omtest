

// // // // Dans app/(tabs)/host/booking-details/[id].tsx
// // // // VERSION CORRIGÉE : Update optimiste de l'UI + Refetch retardé pour gérer latence DB/Cache

// // // import React, { useState, useEffect, useCallback, useRef } from 'react';
// // // import {
// // //     View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
// // //     ActivityIndicator, Alert, Image, Platform, Modal
// // // } from 'react-native';
// // // import { Stack, useLocalSearchParams, router } from 'expo-router';
// // // import { supabase } from '@/lib/supabase';
// // // import { useAuth } from '@/hooks/useAuth';
// // // import { format, parseISO, differenceInHours, isValid } from 'date-fns';
// // // import { fr } from 'date-fns/locale';
// // // import {
// // //     ArrowLeft, Calendar, Clock, Users, MapPin, DollarSign, Info, User as UserIcon,
// // //     CheckCircle2, XCircle, MessageCircle, AlertCircle, RefreshCw
// // // } from 'lucide-react-native';
// // // import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';

// // // // --- Interfaces (restent identiques) ---
// // // interface BookingUserProfile { full_name: string | null; avatar_url?: string | null; }
// // // interface BookingPoolImage { url: string; position?: number | null; }
// // // interface BookingPoolListing { id: string; title: string; location: string | null; owner_id: string; pool_images: BookingPoolImage[] | null; }
// // // interface BookingConversation { id: string; status: string; updated_at: string; booking_id: string; }
// // // interface BookingDetail { id: string; start_time: string; end_time: string; status: string; total_price: number; created_at: string; user_id: string; pool_listing_id: string; guest_count: number; user_profile?: BookingUserProfile | null; pool_listing?: BookingPoolListing | null; conversation?: BookingConversation | null; }
// // // // --- Fin des Interfaces ---

// // // // --- Constantes ---
// // // const BOOKING_STATUS_LABELS: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', completed: 'Terminée', canceled: 'Annulée', declined: 'Refusée' };


// // // export default function BookingDetailScreen() {
// // //     const { id: bookingId } = useLocalSearchParams<{ id: string }>();
// // //     const { user, isLoading: isLoadingAuth } = useAuth();

// // //     const [bookingDetails, setBookingDetails] = useState<BookingDetail | null>(null);
// // //     const [loading, setLoading] = useState(true);
// // //     const [error, setError] = useState<string | null>(null);
// // //     const [actionLoading, setActionLoading] = useState(false);
// // //     const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
// // //     const [statusToConfirm, setStatusToConfirm] = useState<'confirmed' | 'declined' | null>(null);
// // //     // Timer Ref pour le cleanup du setTimeout
// // //     const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

// // //     const [fontsLoaded, fontError] = useFonts({
// // //         'Montserrat-Bold': Montserrat_700Bold,
// // //         'Montserrat-SemiBold': Montserrat_600SemiBold,
// // //         'Montserrat-Regular': Montserrat_400Regular,
// // //     });

// // //     // --- Fetch Booking Details via RPC (Simplifié - sans check direct) ---
// // //     const fetchBookingDetails = useCallback(async (calledFrom?: string) => {
// // //         if (!bookingId || typeof bookingId !== 'string') { setError("ID de réservation invalide."); setLoading(false); return; }
// // //         if (!user) { console.log(`fetchBookingDetails (${calledFrom || 'initial'}): User not loaded yet, waiting...`); setLoading(false); return; }

// // //         // Mettre en chargement seulement pour l'appel initial ou refresh manuel
// // //         if (['useEffect', 'forceRefresh', 'retryButton'].includes(calledFrom || '')) {
// // //              setLoading(true);
// // //         }
// // //         setError(null);

// // //         console.log(`🚀 (${calledFrom || 'initial'}) Calling RPC for booking: ${bookingId}`);

// // //         try {
// // //             const { data, error: rpcError } = await supabase.rpc(
// // //                 'get_booking_details_for_host',
// // //                 { p_booking_id: bookingId, p_host_id: user.id }
// // //             );

// // //             if (rpcError) { console.error("RPC Error:", rpcError); throw new Error(`Erreur RPC: ${rpcError.message}`); }
// // //             if (data === null) { console.log("RPC returned null"); throw new Error("Réservation introuvable ou accès non autorisé."); }

// // //             console.log(`✅ (${calledFrom || 'initial'}) RPC successful. Status from data: ${data.status}`);
// // //             setBookingDetails(data as BookingDetail);

// // //         } catch (err: any) {
// // //             console.error(`Error fetching booking details (${calledFrom || 'initial'}):`, err);
// // //             setError(err.message || "Erreur chargement détails.");
// // //             setBookingDetails(null);
// // //         } finally {
// // //              if (!actionLoading) { // Ne pas arrêter le chargement global si une action est en cours
// // //                  setLoading(false);
// // //              }
// // //         }
// // //     }, [bookingId, user, actionLoading]); // actionLoading ajouté pour la gestion du spinner

// // //     // --- UseEffect pour charger les données et cleanup timer ---
// // //     useEffect(() => {
// // //         if (fontsLoaded && !fontError && !isLoadingAuth && user && bookingId) {
// // //             fetchBookingDetails('useEffect');
// // //         } else if (fontsLoaded && !fontError && !isLoadingAuth && !bookingId) {
// // //              setError("ID de réservation manquant dans l'URL.");
// // //              setLoading(false);
// // //         }
// // //         // Cleanup function pour le timer si le composant est démonté
// // //         return () => {
// // //             if (refreshTimerRef.current) {
// // //                 clearTimeout(refreshTimerRef.current);
// // //             }
// // //         };
// // //     }, [bookingId, user, fontsLoaded, fontError, isLoadingAuth, fetchBookingDetails]); // fetchBookingDetails est stable

// // //     // --- Fonction pour OUVRIR le modal de confirmation (inchangée) ---
// // //     const openConfirmationModal = (newStatus: 'confirmed' | 'declined') => {
// // //         setStatusToConfirm(newStatus);
// // //         setIsConfirmModalVisible(true);
// // //     };

// // //      // --- Fonction pour forcer un rafraîchissement complet (inchangée) ---
// // //      const forceRefresh = useCallback(() => {
// // //         console.log("Forcing full data refresh...");
// // //         fetchBookingDetails('forceRefresh');
// // //     }, [fetchBookingDetails]);

// // //     // --- Fonction exécutée quand on CONFIRME dans le modal ---
// // //     const handleConfirmAction = useCallback(async () => {
// // //         if (!user || !bookingDetails || !statusToConfirm) {
// // //             console.error("handleConfirmAction: Missing user, details, or statusToConfirm");
// // //             setIsConfirmModalVisible(false);
// // //             return;
// // //         }

// // //         const bookingToUpdateId = bookingDetails.id; // Sauvegarde l'ID au cas où bookingDetails change
// // //         const newStatus = statusToConfirm; // Sauvegarde le nouveau statut

// // //         console.log(`Modal confirmed for status: ${newStatus}. Setting actionLoading to true.`);
// // //         setActionLoading(true);
// // //         setIsConfirmModalVisible(false);
// // //         setStatusToConfirm(null); // Réinitialise immédiatement

// // //         // *** Mise à jour locale IMMÉDIATE (Optimistic Update) ***
// // //         setBookingDetails(prevDetails => {
// // //             if (!prevDetails || prevDetails.id !== bookingToUpdateId) return prevDetails; // Sécurité
// // //             console.log(`Forcing local state update to ${newStatus}`);
// // //             return { ...prevDetails, status: newStatus };
// // //         });

// // //         try {
// // //             // 1. Update booking dans la DB (en arrière-plan)
// // //             console.log(`Updating booking ${bookingToUpdateId} to status ${newStatus} in DB...`);
// // //             const { error: bookingUpdateError } = await supabase
// // //                 .from('bookings')
// // //                 .update({ status: newStatus })
// // //                 .eq('id', bookingToUpdateId);
// // //             if (bookingUpdateError) {
// // //                  console.error("Supabase booking update error:", bookingUpdateError);
// // //                  // Annuler la mise à jour optimiste si l'écriture échoue ?
// // //                  // Optionnel: forceRefresh() ici pour revenir à l'état précédent.
// // //                  throw bookingUpdateError;
// // //             }
// // //             console.log("✅ Booking status updated successfully in DB.");

// // //             // 2. Update conversation (en arrière-plan)
// // //             if (bookingDetails.conversation) { // Utiliser bookingDetails d'avant l'update locale pour la conversation
// // //                 let newConvStatus: string | undefined;
// // //                 const currentConvStatus = bookingDetails.conversation.status;
// // //                 if (newStatus === 'confirmed' && ['locked', 'pre-message'].includes(currentConvStatus)) newConvStatus = 'open';
// // //                 else if (newStatus === 'declined' && currentConvStatus !== 'archived') newConvStatus = 'archived';

// // //                 if (newConvStatus) {
// // //                     console.log(`Updating conversation ${bookingDetails.conversation.id} to status ${newConvStatus}`);
// // //                     const { error: convUpdateError } = await supabase
// // //                         .from('conversations')
// // //                         .update({ status: newConvStatus })
// // //                         .eq('id', bookingDetails.conversation.id);
// // //                     if (convUpdateError) console.warn("Could not update conversation:", convUpdateError);
// // //                     else console.log("✅ Conversation status updated successfully.");
// // //                 }
// // //             }

// // //             // 3. Afficher le succès immédiatement
// // //             Alert.alert("Succès", `Réservation ${newStatus === 'confirmed' ? 'confirmée' : 'refusée'}.`);

// // //             // 4. *** Refetch RETARDÉ pour synchronisation finale ***
// // //             console.log("Scheduling delayed refetch (1s) to confirm state...");
// // //             if (refreshTimerRef.current) { clearTimeout(refreshTimerRef.current); } // Clear précédent timer
// // //             refreshTimerRef.current = setTimeout(() => {
// // //                 console.log("Executing delayed refetch...");
// // //                 fetchBookingDetails('delayedRefetchAfterAction');
// // //                 refreshTimerRef.current = null; // Clear la ref après exécution
// // //             }, 1000); // Délai de 1 seconde (ajustable)

// // //         } catch (err: any) {
// // //             console.error(`Error updating booking to ${newStatus}:`, err);
// // //             Alert.alert("Erreur", `Échec de la mise à jour: ${err.message || "Veuillez réessayer."}`);
// // //             // En cas d'erreur, forcer un refresh pour revenir à l'état DB
// // //             forceRefresh();
// // //         } finally {
// // //             // Arrêter le spinner immédiatement après la mise à jour locale
// // //             console.log("Action finished (UI updated optimistically). Setting actionLoading to false.");
// // //             setActionLoading(false);
// // //             // setStatusToConfirm(null); // Déjà fait plus haut
// // //         }
// // //     }, [user, bookingDetails, statusToConfirm, fetchBookingDetails, forceRefresh]); // Dépendances

// // //     // --- Rendu ---
// // //     console.log("Rendering BookingDetailScreen. Current bookingDetails.status:", bookingDetails?.status, "actionLoading:", actionLoading);

// // //     // 1. Chargement / Erreurs
// // //     if (!fontsLoaded || isLoadingAuth || loading) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
// // //     if (fontError) { return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
// // //     if (error) { return ( <SafeAreaView style={styles.errorContainer}><AlertCircle size={40} color="#dc2626" /><Text style={styles.errorText}>{error}</Text>{error !== "ID de réservation invalide." && error !== "ID de réservation manquant dans l'URL." && error !== "Réservation introuvable ou accès non autorisé." && (<TouchableOpacity onPress={() => fetchBookingDetails('retryButton')} style={styles.retryButton}><RefreshCw size={16} color="#ffffff" /><Text style={styles.retryButtonText}>Réessayer</Text></TouchableOpacity>)}<TouchableOpacity onPress={() => router.back()} style={[styles.retryButton, {backgroundColor: '#64748b', marginTop: 10}]}><ArrowLeft size={16} color="#ffffff" /><Text style={styles.retryButtonText}>Retour</Text></TouchableOpacity></SafeAreaView> ); }
// // //     if (!bookingDetails) { return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Impossible d'afficher détails.</Text></SafeAreaView>; }

// // //     // 5. Rendu normal
// // //     const startDate = parseISO(bookingDetails.start_time);
// // //     const endDate = parseISO(bookingDetails.end_time);
// // //     const createdAtDate = parseISO(bookingDetails.created_at);
// // //     const isValidDates = isValid(startDate) && isValid(endDate);
// // //     const durationHours = isValidDates ? differenceInHours(endDate, startDate) : 0;
// // //     const formattedPrice = `${bookingDetails.total_price?.toFixed(0) ?? 'N/A'} MAD`;
// // //     const coverImage = bookingDetails.pool_listing?.pool_images?.[0]?.url || null;
// // //     const canContact = bookingDetails.conversation != null &&
// // //                        ['pending', 'confirmed'].includes(bookingDetails.status) &&
// // //                        bookingDetails.conversation.status !== 'archived';

// // //     return (
// // //         <SafeAreaView style={styles.container}>
// // //             <Stack.Screen options={{ headerShown: false }} />

// // //              {/* Header avec Refresh Button */}
// // //             <View style={styles.header}>
// // //                 <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/host/(dashboard)/bookings')}>
// // //                     <ArrowLeft color="#475569" size={22} />
// // //                 </TouchableOpacity>
// // //                 <Text style={styles.headerTitle} numberOfLines={1}>
// // //                      Résa: {bookingDetails.user_profile?.full_name ?? 'Client'}
// // //                 </Text>
// // //                 <TouchableOpacity style={styles.refreshButton} onPress={forceRefresh} disabled={actionLoading || loading}>
// // //                     <RefreshCw size={18} color={actionLoading || loading ? "#cbd5e1" : "#475569"} />
// // //                 </TouchableOpacity>
// // //              </View>

// // //             <ScrollView contentContainerStyle={styles.scrollContent}>
// // //                  {/* Sections Infos */}
// // //                  {bookingDetails.pool_listing && ( <View style={styles.sectionCard}>{coverImage ? <Image source={{ uri: coverImage }} style={styles.poolImage} /> : <View style={[styles.poolImage, styles.placeholderImage]}><Calendar size={40} color="#cbd5e1" /></View>}<Text style={styles.poolTitle}>{bookingDetails.pool_listing.title ?? 'Piscine sans titre'}</Text>{bookingDetails.pool_listing.location && (<View style={styles.inlineInfo}><MapPin size={16} color="#64748b" /><Text style={styles.poolLocation}>{bookingDetails.pool_listing.location}</Text></View>)}</View> )}
// // //                  <View style={styles.sectionCard}><Text style={styles.sectionTitle}>Informations Client</Text><View style={styles.inlineInfo}><UserIcon size={16} color="#475569" /><Text style={styles.detailValue}>{bookingDetails.user_profile?.full_name ?? 'Non spécifié'}</Text></View></View>
// // //                  <View style={styles.sectionCard}>
// // //                     <Text style={styles.sectionTitle}>Détails de la réservation</Text>
// // //                     <View style={styles.detailItem}>
// // //                         <Info size={16} color="#475569" />
// // //                         <Text style={styles.detailValue}>Statut: <Text style={{ fontFamily: 'Montserrat-Bold' }}>{BOOKING_STATUS_LABELS[bookingDetails.status] || bookingDetails.status}</Text></Text>
// // //                     </View>
// // //                     <View style={styles.detailItem}>
// // //                         <Calendar size={16} color="#475569" />
// // //                         <Text style={styles.detailValue}>{isValidDates ? format(startDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Date invalide'}</Text>
// // //                     </View>
// // //                     <View style={styles.detailItem}>
// // //                         <Clock size={16} color="#475569" />
// // //                         <Text style={styles.detailValue}>{isValidDates ? `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')} (${durationHours > 0 ? durationHours + 'h' : '<1h'})` : 'Horaire invalide'}</Text>
// // //                     </View>
// // //                     <View style={styles.detailItem}>
// // //                         <Users size={16} color="#475569" />
// // //                         <Text style={styles.detailValue}>{bookingDetails.guest_count} personne{bookingDetails.guest_count > 1 ? 's' : ''}</Text>
// // //                     </View>
// // //                     <View style={styles.detailItem}>
// // //                         <DollarSign size={16} color="#475569" />
// // //                         <Text style={styles.detailValue}>Total payé: {formattedPrice}</Text>
// // //                     </View>
// // //                     <View style={styles.detailItem}>
// // //                         <Calendar size={16} color="#475569" />
// // //                         <Text style={styles.detailValue}>Demandée le: {isValid(createdAtDate) ? format(createdAtDate, 'd MMM yy à HH:mm', { locale: fr }) : 'Date inconnue'}</Text>
// // //                     </View>
// // //                  </View>

// // //                  {/* Actions */}
// // //                  <View style={styles.actionsContainer}>
// // //                      {/* Condition d'affichage basée sur le statut actuel dans l'état */}
// // //                      {bookingDetails.status === 'pending' && (
// // //                          <>
// // //                              <TouchableOpacity
// // //                                 style={[styles.actionButton, styles.confirmButton, actionLoading && styles.disabledButton]}
// // //                                 onPress={() => openConfirmationModal('confirmed')}
// // //                                 disabled={actionLoading}>
// // //                                  {/* Le spinner est maintenant géré par actionLoading */}
// // //                                  {actionLoading ? <ActivityIndicator size="small" color="#fff" /> : <CheckCircle2 size={20} color="#ffffff" />}
// // //                                  <Text style={styles.actionButtonText}>Confirmer Réservation</Text>
// // //                              </TouchableOpacity>
// // //                              <TouchableOpacity
// // //                                 style={[styles.actionButton, styles.rejectButton, actionLoading && styles.disabledButton]}
// // //                                 onPress={() => openConfirmationModal('declined')}
// // //                                 disabled={actionLoading}>
// // //                                  {/* Le spinner est maintenant géré par actionLoading */}
// // //                                  {actionLoading ? <ActivityIndicator size="small" color="#b91c1c" /> : <XCircle size={20} color="#b91c1c" />}
// // //                                  <Text style={styles.actionButtonTextReject}>Refuser Réservation</Text>
// // //                              </TouchableOpacity>
// // //                          </>
// // //                      )}
// // //                      <TouchableOpacity
// // //                          style={[styles.actionButton, styles.messageButton, (!canContact || actionLoading) && styles.disabledButton]}
// // //                          onPress={() => { if (canContact && bookingDetails.conversation) { router.push({ pathname: '/(tabs)/conversations/[id]', params: { id: bookingDetails.conversation.id }}); } else { Alert.alert("Contacter", "Conversation non disponible."); } }}
// // //                          disabled={!canContact || actionLoading}>
// // //                          <MessageCircle size={20} color={canContact ? '#0891b2' : '#9ca3af'} />
// // //                          <Text style={[styles.actionButtonTextMessage, !canContact && { color: '#9ca3af' }]}>Contacter Client</Text>
// // //                      </TouchableOpacity>
// // //                  </View>

// // //             </ScrollView>

// // //             {/* Modal de Confirmation (inchangé) */}
// // //             <Modal
// // //                 animationType="fade"
// // //                 transparent={true}
// // //                 visible={isConfirmModalVisible}
// // //                 onRequestClose={() => { if (!actionLoading) { setIsConfirmModalVisible(false); setStatusToConfirm(null); } }}>
// // //                 <View style={styles.modalOverlay}>
// // //                     <View style={styles.modalContent}>
// // //                         <Text style={styles.modalTitle}>{statusToConfirm === 'confirmed' ? "Confirmer ?" : "Refuser ?"}</Text>
// // //                         <Text style={styles.modalMessage}>Êtes-vous sûr de vouloir {statusToConfirm === 'confirmed' ? 'confirmer' : 'refuser'} cette demande ?</Text>
// // //                         <View style={styles.modalActions}>
// // //                             <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => { setIsConfirmModalVisible(false); setStatusToConfirm(null); }}>
// // //                                 <Text style={styles.modalButtonTextCancel}>Annuler</Text>
// // //                             </TouchableOpacity>
// // //                             <TouchableOpacity style={[styles.modalButton, statusToConfirm === 'confirmed' ? styles.modalButtonConfirm : styles.modalButtonReject]} onPress={handleConfirmAction}>
// // //                                 <Text style={statusToConfirm === 'confirmed' ? styles.modalButtonTextConfirm : styles.modalButtonTextReject}>Oui, {statusToConfirm === 'confirmed' ? 'confirmer' : 'refuser'}</Text>
// // //                             </TouchableOpacity>
// // //                         </View>
// // //                     </View>
// // //                 </View>
// // //             </Modal>

// // //         </SafeAreaView>
// // //     );
// // // }

// // // // --- Styles ---
// // // const styles = StyleSheet.create({
// // //      container: { flex: 1, backgroundColor: '#f8fafc' },
// // //      loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
// // //      errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' },
// // //      errorText: { fontFamily: 'Montserrat-SemiBold', color: '#b91c1c', fontSize: 16, textAlign: 'center', marginBottom: 15 },
// // //      retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10, gap: 8 },
// // //      retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
// // //      header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: Platform.OS === 'ios' ? 10 : 40, paddingBottom: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
// // //      backButton: { padding: 8, marginRight: 5, marginLeft: -5 },
// // //      refreshButton: { padding: 8 },
// // //      headerTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 17, color: '#1e293b', textAlign: 'center', flex: 1, marginHorizontal: 5 },
// // //      scrollContent: { padding: 16, paddingBottom: 100 },
// // //      sectionCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
// // //      poolImage: { width: '100%', height: 180, borderRadius: 8, marginBottom: 12, backgroundColor: '#e5e7eb' },
// // //      placeholderImage: { justifyContent: 'center', alignItems: 'center' },
// // //      poolTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1e293b', marginBottom: 6 },
// // //      poolLocation: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', flexShrink: 1 },
// // //      sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8 },
// // //      inlineInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
// // //      detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
// // //      detailValue: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#334155', flexShrink: 1, lineHeight: 22 },
// // //      actionsContainer: { marginTop: 10, gap: 12, paddingBottom: 20 },
// // //      actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, borderWidth: 1, gap: 10, minHeight: 50 },
// // //      confirmButton: { backgroundColor: '#10b981', borderColor: '#059669' },
// // //      actionButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
// // //      rejectButton: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
// // //      actionButtonTextReject: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#b91c1c' },
// // //      messageButton: { backgroundColor: '#ecfeff', borderColor: '#cffafe' },
// // //      actionButtonTextMessage: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2' },
// // //      disabledButton: { opacity: 0.6 },
// // //      avatarImage: { width: 40, height: 40, borderRadius: 20, marginLeft: 'auto' },
// // //      modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
// // //      modalContent: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, width: '85%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
// // //      modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 10, textAlign: 'center', },
// // //      modalMessage: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#475569', marginBottom: 25, textAlign: 'center', lineHeight: 22, },
// // //      modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, },
// // //      modalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, },
// // //      modalButtonCancel: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', },
// // //      modalButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#475569', },
// // //      modalButtonConfirm: { backgroundColor: '#10b981', borderColor: '#059669', },
// // //      modalButtonTextConfirm: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
// // //      modalButtonReject: { backgroundColor: '#ef4444', borderColor: '#dc2626', },
// // //      modalButtonTextReject: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
// // //  });

// // // Dans app/(tabs)/host/booking-details/[id].tsx
// // // VERSION CORRIGÉE : Vérification directe de la table 'bookings' après l'update

// // import React, { useState, useEffect, useCallback, useRef } from 'react';
// // import {
// //     View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
// //     ActivityIndicator, Alert, Image, Platform, Modal
// // } from 'react-native';
// // import { Stack, useLocalSearchParams, router } from 'expo-router';
// // import { supabase } from '@/lib/supabase';
// // import { useAuth } from '@/hooks/useAuth';
// // import { format, parseISO, differenceInHours, isValid } from 'date-fns';
// // import { fr } from 'date-fns/locale';
// // import {
// //     ArrowLeft, Calendar, Clock, Users, MapPin, DollarSign, Info, User as UserIcon,
// //     CheckCircle2, XCircle, MessageCircle, AlertCircle, RefreshCw
// // } from 'lucide-react-native';
// // import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';

// // // --- Interfaces (restent identiques) ---
// // interface BookingUserProfile { full_name: string | null; avatar_url?: string | null; }
// // interface BookingPoolImage { url: string; position?: number | null; }
// // interface BookingPoolListing { id: string; title: string; location: string | null; owner_id: string; pool_images: BookingPoolImage[] | null; }
// // interface BookingConversation { id: string; status: string; updated_at: string; booking_id: string; }
// // interface BookingDetail { id: string; start_time: string; end_time: string; status: string; total_price: number; created_at: string; user_id: string; pool_listing_id: string; guest_count: number; user_profile?: BookingUserProfile | null; pool_listing?: BookingPoolListing | null; conversation?: BookingConversation | null; }
// // // --- Fin des Interfaces ---

// // // --- Constantes ---
// // const BOOKING_STATUS_LABELS: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', completed: 'Terminée', canceled: 'Annulée', declined: 'Refusée' };
// // const MAX_CONFIRM_RETRIES = 5; // Nombre max de tentatives pour vérifier le statut après update
// // const RETRY_DELAY_MS = 500; // Délai entre les tentatives (en ms)

// // // Helper pour délai
// // const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// // export default function BookingDetailScreen() {
// //     const { id: bookingId } = useLocalSearchParams<{ id: string }>();
// //     const { user, isLoading: isLoadingAuth } = useAuth();

// //     const [bookingDetails, setBookingDetails] = useState<BookingDetail | null>(null);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState<string | null>(null);
// //     const [actionLoading, setActionLoading] = useState(false);
// //     const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
// //     const [statusToConfirm, setStatusToConfirm] = useState<'confirmed' | 'declined' | null>(null);
// //     const isInitialLoadDone = useRef(false);

// //     const [fontsLoaded, fontError] = useFonts({
// //         'Montserrat-Bold': Montserrat_700Bold,
// //         'Montserrat-SemiBold': Montserrat_600SemiBold,
// //         'Montserrat-Regular': Montserrat_400Regular,
// //     });

// //     // --- Fetch Booking Details via RPC (Utilisé pour le chargement initial/refresh) ---
// //     const fetchBookingDetails = useCallback(async (calledFrom?: string): Promise<BookingDetail | null> => {
// //         if (!bookingId || typeof bookingId !== 'string') { setError("ID de réservation invalide."); setLoading(false); return null; }
// //         if (!user) { console.log(`fetchBookingDetails (${calledFrom || 'unknown'}): User not loaded yet.`); setLoading(false); return null; }

// //         if (['useEffect', 'forceRefresh', 'retryButton'].includes(calledFrom || '') && !actionLoading) { setLoading(true); }
// //         if (calledFrom !== 'handleConfirmAction') { setError(null); }

// //         console.log(`🚀 (${calledFrom || 'unknown'}) Calling RPC for booking: ${bookingId}`);

// //         try {
// //             const { data, error: rpcError } = await supabase.rpc(
// //                 'get_booking_details_for_host',
// //                 { p_booking_id: bookingId, p_host_id: user.id }
// //             );

// //             if (rpcError) { console.error("RPC Error:", rpcError); throw new Error(`Erreur RPC: ${rpcError.message}`); }
// //             if (data === null) { console.log("RPC returned null"); throw new Error("Réservation introuvable ou accès non autorisé."); }

// //             console.log(`✅ (${calledFrom || 'unknown'}) RPC successful. Status from data: ${data.status}`);

// //             // Mettre à jour l'état SEULEMENT si appelé par useEffect, forceRefresh ou retry
// //             if (['useEffect', 'forceRefresh', 'retryButton'].includes(calledFrom || '')) {
// //                  setBookingDetails(data as BookingDetail);
// //             }
// //             return data as BookingDetail;

// //         } catch (err: any) {
// //             console.error(`Error fetching booking details (${calledFrom || 'unknown'}):`, err);
// //              if (calledFrom !== 'handleConfirmAction') {
// //                  setError(err.message || "Erreur chargement détails.");
// //                  setBookingDetails(null);
// //              }
// //              return null;
// //         } finally {
// //              if (!actionLoading && ['useEffect', 'forceRefresh', 'retryButton'].includes(calledFrom || '')) {
// //                  setLoading(false);
// //              }
// //         }
// //     }, [bookingId, user, actionLoading]);

// //     // --- UseEffect pour charger les données initiales (inchangé) ---
// //     useEffect(() => {
// //         console.log("useEffect Triggered: ", { fontsLoaded, fontError: !!fontError, isLoadingAuth, user: !!user, bookingId, isInitialLoadDone: isInitialLoadDone.current });
// //         const canLoad = fontsLoaded && !fontError && !isLoadingAuth && user && bookingId;

// //         if (canLoad && !isInitialLoadDone.current) {
// //             console.log("useEffect: Initial load conditions met, calling fetchBookingDetails");
// //             isInitialLoadDone.current = true;
// //             fetchBookingDetails('useEffect');
// //         } else if (!canLoad && !isInitialLoadDone.current) {
// //              console.log("useEffect: Conditions not met or still loading for initial fetch");
// //         } else if (isInitialLoadDone.current) {
// //              console.log("useEffect: Skipping fetch, initial load already done.");
// //         }
// //     }, [bookingId, user, fontsLoaded, fontError, isLoadingAuth, fetchBookingDetails]);

// //     // --- Fonction pour OUVRIR le modal de confirmation (inchangée) ---
// //     const openConfirmationModal = (newStatus: 'confirmed' | 'declined') => {
// //         setStatusToConfirm(newStatus);
// //         setIsConfirmModalVisible(true);
// //     };

// //      // --- Fonction pour forcer un rafraîchissement complet (inchangée) ---
// //      const forceRefresh = useCallback(() => {
// //         console.log("Forcing full data refresh...");
// //         fetchBookingDetails('forceRefresh');
// //     }, [fetchBookingDetails]);

// //     // --- Fonction pour VÉRIFIER le statut directement dans la table 'bookings' ---
// //     const verifyStatusUpdateDirectly = useCallback(async (expectedStatus: 'confirmed' | 'declined'): Promise<boolean> => {
// //         if (!bookingId || !user) return false; // Sécurité

// //         console.log(`Attempting to verify status update DIRECTLY to: ${expectedStatus}`);
// //         for (let i = 0; i < MAX_CONFIRM_RETRIES; i++) {
// //             console.log(`Direct verification attempt ${i + 1}/${MAX_CONFIRM_RETRIES}...`);
// //             try {
// //                 // Lecture directe de la table bookings
// //                  const { data, error } = await supabase
// //                     .from('bookings')
// //                     .select('status')
// //                     .eq('id', bookingId)
// //                     .maybeSingle(); // Utiliser maybeSingle

// //                 if (error) {
// //                     console.warn(`Direct verification attempt ${i + 1} failed: ${error.message}. Retrying...`);
// //                 } else if (data && data.status === expectedStatus) {
// //                     console.log(`✅ Direct verification successful! Status is now ${expectedStatus}.`);
// //                     return true; // Succès !
// //                 } else if (data) {
// //                     console.warn(`Direct verification attempt ${i + 1}: Status mismatch. DB: ${data.status}, Expected: ${expectedStatus}. Retrying...`);
// //                 } else {
// //                      console.warn(`Direct verification attempt ${i + 1}: Booking not found. Retrying...`);
// //                  }
// //             } catch (err) {
// //                  console.error(`Error during direct verification attempt ${i + 1}:`, err);
// //             }

// //             // Attendre avant la prochaine tentative
// //             if (i < MAX_CONFIRM_RETRIES - 1) {
// //                 await delay(RETRY_DELAY_MS * (i + 1));
// //             }
// //         }
// //         console.error(`❌ Failed to verify status update DIRECTLY to ${expectedStatus} after ${MAX_CONFIRM_RETRIES} attempts.`);
// //         return false; // Échec de la vérification
// //     }, [bookingId, user]); // Dépendances

// //     // --- Fonction exécutée quand on CONFIRME dans le modal ---
// //     const handleConfirmAction = useCallback(async () => {
// //         if (!user || !bookingDetails || !statusToConfirm) {
// //             console.error("handleConfirmAction: Missing user, details, or statusToConfirm");
// //             setIsConfirmModalVisible(false);
// //             return;
// //         }

// //         const bookingToUpdateId = bookingDetails.id;
// //         const newStatus = statusToConfirm;

// //         console.log(`Modal confirmed for status: ${newStatus}. Setting actionLoading to true.`);
// //         setActionLoading(true);
// //         setIsConfirmModalVisible(false);
// //         setStatusToConfirm(null);

// //         let updateSuccessful = false;

// //         try {
// //             // 1. Update booking dans la DB
// //             console.log(`Updating booking ${bookingToUpdateId} to status ${newStatus} in DB...`);
// //             const { error: bookingUpdateError } = await supabase
// //                 .from('bookings')
// //                 .update({ status: newStatus })
// //                 .eq('id', bookingToUpdateId);
// //             if (bookingUpdateError) {
// //                  console.error("Supabase booking update error:", bookingUpdateError);
// //                  throw bookingUpdateError;
// //             }
// //             console.log("✅ Booking status updated successfully in DB.");
// //             updateSuccessful = true;

// //             // 2. Update conversation (si nécessaire)
// //             if (bookingDetails.conversation) {
// //                 // ... (logique update conversation inchangée) ...
// //                  let newConvStatus: string | undefined;
// //                  const currentConvStatus = bookingDetails.conversation.status;
// //                  if (newStatus === 'confirmed' && ['locked', 'pre-message'].includes(currentConvStatus)) newConvStatus = 'open';
// //                  else if (newStatus === 'declined' && currentConvStatus !== 'archived') newConvStatus = 'archived';

// //                  if (newConvStatus) {
// //                      console.log(`Updating conversation ${bookingDetails.conversation.id} to status ${newConvStatus}`);
// //                      const { error: convUpdateError } = await supabase.from('conversations').update({ status: newConvStatus }).eq('id', bookingDetails.conversation.id);
// //                      if (convUpdateError) console.warn("Could not update conversation:", convUpdateError);
// //                      else console.log("✅ Conversation status updated successfully.");
// //                  }
// //             }

// //             // 3. *** ATTENDRE LA CONFIRMATION VIA LECTURE DIRECTE ***
// //             const isVerified = await verifyStatusUpdateDirectly(newStatus);

// //             if (isVerified) {
// //                 // Mettre à jour l'état React SEULEMENT APRÈS VÉRIFICATION DIRECTE
// //                 // On peut soit refetcher tout via RPC, soit juste mettre à jour le statut localement
// //                 console.log("Updating React state after direct verification.");
// //                  setBookingDetails(prevDetails => prevDetails ? { ...prevDetails, status: newStatus } : null);
// //                 // Alternative: appeler fetchBookingDetails pour tout recharger proprement
// //                 // await fetchBookingDetails('postVerification');
// //                 Alert.alert("Succès", `Réservation ${newStatus === 'confirmed' ? 'confirmée' : 'refusée'}.`);
// //             } else {
// //                 Alert.alert("Attention", "La mise à jour a été envoyée, mais la confirmation directe du nouveau statut a échoué. L'affichage pourrait être désynchronisé. Veuillez rafraîchir.");
// //                 // Ne pas mettre à jour l'UI si la vérification échoue
// //             }

// //         } catch (err: any) {
// //             console.error(`Error during booking update process for ${newStatus}:`, err);
// //             Alert.alert("Erreur", `Échec de la mise à jour: ${err.message || "Veuillez réessayer."}`);
// //             if (!updateSuccessful) { forceRefresh(); } // Refresh seulement si l'écriture a échoué
// //         } finally {
// //             console.log("Action finished. Setting actionLoading to false.");
// //             setActionLoading(false);
// //         }
// //     }, [user, bookingDetails, statusToConfirm, verifyStatusUpdateDirectly, forceRefresh]); // verifyStatusUpdateDirectly ajouté

// //     // --- Rendu ---
// //     console.log("Rendering BookingDetailScreen. Current bookingDetails.status:", bookingDetails?.status, "actionLoading:", actionLoading);

// //     // 1. Chargement / Erreurs
// //     if (!fontsLoaded || isLoadingAuth || loading) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
// //     if (fontError) { return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
// //     if (error) { return ( <SafeAreaView style={styles.errorContainer}><AlertCircle size={40} color="#dc2626" /><Text style={styles.errorText}>{error}</Text>{error !== "ID de réservation invalide." && error !== "ID de réservation manquant dans l'URL." && error !== "Réservation introuvable ou accès non autorisé." && (<TouchableOpacity onPress={() => fetchBookingDetails('retryButton')} style={styles.retryButton}><RefreshCw size={16} color="#ffffff" /><Text style={styles.retryButtonText}>Réessayer</Text></TouchableOpacity>)}<TouchableOpacity onPress={() => router.back()} style={[styles.retryButton, {backgroundColor: '#64748b', marginTop: 10}]}><ArrowLeft size={16} color="#ffffff" /><Text style={styles.retryButtonText}>Retour</Text></TouchableOpacity></SafeAreaView> ); }
// //     if (!bookingDetails) { return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Impossible d'afficher détails.</Text></SafeAreaView>; }

// //     // 5. Rendu normal (inchangé)
// //     const startDate = parseISO(bookingDetails.start_time);
// //     const endDate = parseISO(bookingDetails.end_time);
// //     const createdAtDate = parseISO(bookingDetails.created_at);
// //     const isValidDates = isValid(startDate) && isValid(endDate);
// //     const durationHours = isValidDates ? differenceInHours(endDate, startDate) : 0;
// //     const formattedPrice = `${bookingDetails.total_price?.toFixed(0) ?? 'N/A'} MAD`;
// //     const coverImage = bookingDetails.pool_listing?.pool_images?.[0]?.url || null;
// //     const canContact = bookingDetails.conversation != null &&
// //                        ['pending', 'confirmed'].includes(bookingDetails.status) &&
// //                        bookingDetails.conversation.status !== 'archived';

// //     return (
// //         <SafeAreaView style={styles.container}>
// //             <Stack.Screen options={{ headerShown: false }} />

// //              {/* Header avec Refresh Button */}
// //             <View style={styles.header}>
// //                 <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/host/(dashboard)/bookings')}>
// //                     <ArrowLeft color="#475569" size={22} />
// //                 </TouchableOpacity>
// //                 <Text style={styles.headerTitle} numberOfLines={1}>
// //                      Résa: {bookingDetails.user_profile?.full_name ?? 'Client'}
// //                 </Text>
// //                 <TouchableOpacity style={styles.refreshButton} onPress={forceRefresh} disabled={actionLoading || loading}>
// //                     <RefreshCw size={18} color={actionLoading || loading ? "#cbd5e1" : "#475569"} />
// //                 </TouchableOpacity>
// //              </View>

// //             <ScrollView contentContainerStyle={styles.scrollContent}>
// //                  {/* Sections Infos */}
// //                  {bookingDetails.pool_listing && ( <View style={styles.sectionCard}>{coverImage ? <Image source={{ uri: coverImage }} style={styles.poolImage} /> : <View style={[styles.poolImage, styles.placeholderImage]}><Calendar size={40} color="#cbd5e1" /></View>}<Text style={styles.poolTitle}>{bookingDetails.pool_listing.title ?? 'Piscine sans titre'}</Text>{bookingDetails.pool_listing.location && (<View style={styles.inlineInfo}><MapPin size={16} color="#64748b" /><Text style={styles.poolLocation}>{bookingDetails.pool_listing.location}</Text></View>)}</View> )}
// //                  <View style={styles.sectionCard}><Text style={styles.sectionTitle}>Informations Client</Text><View style={styles.inlineInfo}><UserIcon size={16} color="#475569" /><Text style={styles.detailValue}>{bookingDetails.user_profile?.full_name ?? 'Non spécifié'}</Text></View></View>
// //                  <View style={styles.sectionCard}>
// //                     <Text style={styles.sectionTitle}>Détails de la réservation</Text>
// //                     <View style={styles.detailItem}>
// //                         <Info size={16} color="#475569" />
// //                         <Text style={styles.detailValue}>Statut: <Text style={{ fontFamily: 'Montserrat-Bold' }}>{BOOKING_STATUS_LABELS[bookingDetails.status] || bookingDetails.status}</Text></Text>
// //                     </View>
// //                     <View style={styles.detailItem}>
// //                         <Calendar size={16} color="#475569" />
// //                         <Text style={styles.detailValue}>{isValidDates ? format(startDate, 'EEEE d MMMM Platteville', { locale: fr }) : 'Date invalide'}</Text>
// //                     </View>
// //                     <View style={styles.detailItem}>
// //                         <Clock size={16} color="#475569" />
// //                         <Text style={styles.detailValue}>{isValidDates ? `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')} (${durationHours > 0 ? durationHours + 'h' : '<1h'})` : 'Horaire invalide'}</Text>
// //                     </View>
// //                     <View style={styles.detailItem}>
// //                         <Users size={16} color="#475569" />
// //                         <Text style={styles.detailValue}>{bookingDetails.guest_count} personne{bookingDetails.guest_count > 1 ? 's' : ''}</Text>
// //                     </View>
// //                     <View style={styles.detailItem}>
// //                         <DollarSign size={16} color="#475569" />
// //                         <Text style={styles.detailValue}>Total payé: {formattedPrice}</Text>
// //                     </View>
// //                     <View style={styles.detailItem}>
// //                         <Calendar size={16} color="#475569" />
// //                         <Text style={styles.detailValue}>Demandée le: {isValid(createdAtDate) ? format(createdAtDate, 'd MMM yy à HH:mm', { locale: fr }) : 'Date inconnue'}</Text>
// //                     </View>
// //                  </View>

// //                  {/* Actions */}
// //                  <View style={styles.actionsContainer}>
// //                      {bookingDetails.status === 'pending' && (
// //                          <>
// //                              <TouchableOpacity
// //                                 style={[styles.actionButton, styles.confirmButton, actionLoading && styles.disabledButton]}
// //                                 onPress={() => openConfirmationModal('confirmed')}
// //                                 disabled={actionLoading}>
// //                                  {actionLoading ? <ActivityIndicator size="small" color="#fff" /> : <CheckCircle2 size={20} color="#ffffff" />}
// //                                  <Text style={styles.actionButtonText}>Confirmer Réservation</Text>
// //                              </TouchableOpacity>
// //                              <TouchableOpacity
// //                                 style={[styles.actionButton, styles.rejectButton, actionLoading && styles.disabledButton]}
// //                                 onPress={() => openConfirmationModal('declined')}
// //                                 disabled={actionLoading}>
// //                                  {actionLoading ? <ActivityIndicator size="small" color="#b91c1c" /> : <XCircle size={20} color="#b91c1c" />}
// //                                  <Text style={styles.actionButtonTextReject}>Refuser Réservation</Text>
// //                              </TouchableOpacity>
// //                          </>
// //                      )}
// //                      <TouchableOpacity
// //                          style={[styles.actionButton, styles.messageButton, (!canContact || actionLoading) && styles.disabledButton]}
// //                          onPress={() => { if (canContact && bookingDetails.conversation) { router.push({ pathname: '/(tabs)/conversations/[id]', params: { id: bookingDetails.conversation.id }}); } else { Alert.alert("Contacter", "Conversation non disponible."); } }}
// //                          disabled={!canContact || actionLoading}>
// //                          <MessageCircle size={20} color={canContact ? '#0891b2' : '#9ca3af'} />
// //                          <Text style={[styles.actionButtonTextMessage, !canContact && { color: '#9ca3af' }]}>Contacter Client</Text>
// //                      </TouchableOpacity>
// //                  </View>

// //             </ScrollView>

// //             {/* Modal de Confirmation (inchangé) */}
// //             <Modal
// //                 animationType="fade"
// //                 transparent={true}
// //                 visible={isConfirmModalVisible}
// //                 onRequestClose={() => { if (!actionLoading) { setIsConfirmModalVisible(false); setStatusToConfirm(null); } }}>
// //                 <View style={styles.modalOverlay}>
// //                     <View style={styles.modalContent}>
// //                         <Text style={styles.modalTitle}>{statusToConfirm === 'confirmed' ? "Confirmer ?" : "Refuser ?"}</Text>
// //                         <Text style={styles.modalMessage}>Êtes-vous sûr de vouloir {statusToConfirm === 'confirmed' ? 'confirmer' : 'refuser'} cette demande ?</Text>
// //                         <View style={styles.modalActions}>
// //                             <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => { setIsConfirmModalVisible(false); setStatusToConfirm(null); }}>
// //                                 <Text style={styles.modalButtonTextCancel}>Annuler</Text>
// //                             </TouchableOpacity>
// //                             <TouchableOpacity style={[styles.modalButton, statusToConfirm === 'confirmed' ? styles.modalButtonConfirm : styles.modalButtonReject]} onPress={handleConfirmAction}>
// //                                 <Text style={statusToConfirm === 'confirmed' ? styles.modalButtonTextConfirm : styles.modalButtonTextReject}>Oui, {statusToConfirm === 'confirmed' ? 'confirmer' : 'refuser'}</Text>
// //                             </TouchableOpacity>
// //                         </View>
// //                     </View>
// //                 </View>
// //             </Modal>

// //         </SafeAreaView>
// //     );
// // }

// // // --- Styles ---
// // const styles = StyleSheet.create({
// //      container: { flex: 1, backgroundColor: '#f8fafc' },
// //      loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
// //      errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' },
// //      errorText: { fontFamily: 'Montserrat-SemiBold', color: '#b91c1c', fontSize: 16, textAlign: 'center', marginBottom: 15 },
// //      retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10, gap: 8 },
// //      retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
// //      header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: Platform.OS === 'ios' ? 10 : 40, paddingBottom: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
// //      backButton: { padding: 8, marginRight: 5, marginLeft: -5 },
// //      refreshButton: { padding: 8 },
// //      headerTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 17, color: '#1e293b', textAlign: 'center', flex: 1, marginHorizontal: 5 },
// //      scrollContent: { padding: 16, paddingBottom: 100 },
// //      sectionCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
// //      poolImage: { width: '100%', height: 180, borderRadius: 8, marginBottom: 12, backgroundColor: '#e5e7eb' },
// //      placeholderImage: { justifyContent: 'center', alignItems: 'center' },
// //      poolTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1e293b', marginBottom: 6 },
// //      poolLocation: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', flexShrink: 1 },
// //      sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8 },
// //      inlineInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
// //      detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
// //      detailValue: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#334155', flexShrink: 1, lineHeight: 22 },
// //      actionsContainer: { marginTop: 10, gap: 12, paddingBottom: 20 },
// //      actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, borderWidth: 1, gap: 10, minHeight: 50 },
// //      confirmButton: { backgroundColor: '#10b981', borderColor: '#059669' },
// //      actionButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
// //      rejectButton: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
// //      actionButtonTextReject: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#b91c1c' },
// //      messageButton: { backgroundColor: '#ecfeff', borderColor: '#cffafe' },
// //      actionButtonTextMessage: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2' },
// //      disabledButton: { opacity: 0.6 },
// //      avatarImage: { width: 40, height: 40, borderRadius: 20, marginLeft: 'auto' },
// //      modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
// //      modalContent: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, width: '85%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
// //      modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 10, textAlign: 'center', },
// //      modalMessage: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#475569', marginBottom: 25, textAlign: 'center', lineHeight: 22, },
// //      modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, },
// //      modalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, },
// //      modalButtonCancel: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', },
// //      modalButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#475569', },
// //      modalButtonConfirm: { backgroundColor: '#10b981', borderColor: '#059669', },
// //      modalButtonTextConfirm: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
// //      modalButtonReject: { backgroundColor: '#ef4444', borderColor: '#dc2626', },
// //      modalButtonTextReject: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
// //  });




// // Dans app/(tabs)/host/booking-details/[id].tsx
// // VERSION CORRIGÉE : Utilise la RPC 'update_booking_status_and_get_details' pour l'action

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import {
//     View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
//     ActivityIndicator, Alert, Image, Platform, Modal
// } from 'react-native';
// import { Stack, useLocalSearchParams, router } from 'expo-router';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/hooks/useAuth';
// import { format, parseISO, differenceInHours, isValid } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import {
//     ArrowLeft, Calendar, Clock, Users, MapPin, DollarSign, Info, User as UserIcon,
//     CheckCircle2, XCircle, MessageCircle, AlertCircle, RefreshCw
// } from 'lucide-react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';

// // --- Interfaces (Idéalement dans un fichier partagé types/booking.ts) ---
// // Doivent correspondre à la structure JSON retournée par les fonctions RPC
// interface BookingUserProfile {
//     full_name: string | null;
//     avatar_url?: string | null;
//     // user_id?: string; // Si retourné par RPC
// }

// interface BookingPoolImage {
//     url: string;
//     position?: number | null;
// }

// interface BookingPoolListing {
//     id: string;
//     title: string;
//     location: string | null;
//     owner_id: string;
//     pool_images: BookingPoolImage[] | null;
// }

// interface BookingConversation {
//     id: string;
//     status: string;
//     updated_at: string;
//     booking_id: string;
// }

// // Interface principale correspondant à la structure JSON retournée par RPC
// interface BookingDetail {
//     id: string;
//     start_time: string;
//     end_time: string;
//     status: string;
//     total_price: number;
//     created_at: string;
//     user_id: string;
//     pool_listing_id: string;
//     guest_count: number;
//     user_profile?: BookingUserProfile | null;
//     pool_listing?: BookingPoolListing | null;
//     conversation?: BookingConversation | null;
// }
// // --- Fin des Interfaces ---

// // --- Constantes ---
// const BOOKING_STATUS_LABELS: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', completed: 'Terminée', canceled: 'Annulée', declined: 'Refusée' };

// export default function BookingDetailScreen() {
//     const { id: bookingId } = useLocalSearchParams<{ id: string }>();
//     // Assurez-vous que useAuth exporte 'isLoading' ou ajustez le nom ici
//     const { user, isLoading: isLoadingAuth } = useAuth();

//     const [bookingDetails, setBookingDetails] = useState<BookingDetail | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [actionLoading, setActionLoading] = useState(false); // Pour le spinner pendant l'action
//     const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
//     const [statusToConfirm, setStatusToConfirm] = useState<'confirmed' | 'declined' | null>(null);
//     // Ref pour s'assurer que le fetch initial n'est fait qu'une fois
//     const isInitialLoadDone = useRef(false);

//     const [fontsLoaded, fontError] = useFonts({
//         'Montserrat-Bold': Montserrat_700Bold,
//         'Montserrat-SemiBold': Montserrat_600SemiBold,
//         'Montserrat-Regular': Montserrat_400Regular,
//     });

//     // --- Fetch Booking Details via RPC (pour chargement initial/refresh) ---
//     // Utilise la fonction RPC de LECTURE seule
//     const fetchBookingDetails = useCallback(async (calledFrom?: string): Promise<BookingDetail | null> => {
//         // Vérifications initiales
//         if (!bookingId || typeof bookingId !== 'string') { setError("ID de réservation invalide."); setLoading(false); return null; }
//         if (!user) { console.log(`fetchBookingDetails (${calledFrom || 'unknown'}): User not loaded yet.`); setLoading(false); return null; }

//         // Afficher le spinner de chargement global seulement si nécessaire
//         if (['useEffect', 'forceRefresh', 'retryButton'].includes(calledFrom || '') && !actionLoading) {
//              setLoading(true);
//         }
//         setError(null); // Reset l'erreur au début d'un fetch propre

//         console.log(`🚀 (${calledFrom || 'unknown'}) Calling RPC [get_booking_details_for_host] for booking: ${bookingId}`);

//         try {
//             // Appel de la fonction RPC de LECTURE
//             const { data, error: rpcError } = await supabase.rpc(
//                 'get_booking_details_for_host',
//                 { p_booking_id: bookingId, p_host_id: user.id }
//             );

//             if (rpcError) { console.error("RPC Error (get_booking_details):", rpcError); throw new Error(`Erreur RPC: ${rpcError.message}`); }
//             if (data === null) { console.log("RPC (get_booking_details) returned null"); throw new Error("Réservation introuvable ou accès non autorisé."); }

//             console.log(`✅ (${calledFrom || 'unknown'}) RPC successful. Status from data: ${data.status}`);
//             // Mise à jour de l'état avec les données fraîches
//             setBookingDetails(data as BookingDetail);
//             return data as BookingDetail;

//         } catch (err: any) {
//             console.error(`Error fetching booking details (${calledFrom || 'unknown'}):`, err);
//             setError(err.message || "Erreur chargement détails.");
//             setBookingDetails(null); // Reset en cas d'erreur
//             return null;
//         } finally {
//              // Arrêter le spinner de chargement global si l'appel venait de là et qu'aucune action n'est en cours
//              if (!actionLoading && ['useEffect', 'forceRefresh', 'retryButton'].includes(calledFrom || '')) {
//                  setLoading(false);
//              }
//         }
//     }, [bookingId, user, actionLoading]); // actionLoading est une dépendance pour gérer le spinner

//     // --- UseEffect pour charger les données initiales ---
//     useEffect(() => {
//         // Conditions pour le premier chargement
//         const canLoad = fontsLoaded && !fontError && !isLoadingAuth && user && bookingId;

//         // Exécuter seulement si les conditions sont remplies ET que le chargement initial n'a pas été fait
//         if (canLoad && !isInitialLoadDone.current) {
//             console.log("useEffect: Initial load conditions met, calling fetchBookingDetails");
//             isInitialLoadDone.current = true; // Marquer comme fait
//             fetchBookingDetails('useEffect');
//         }
//         // Ne rien faire dans les autres cas pour éviter les rechargements non désirés
//     }, [bookingId, user, fontsLoaded, fontError, isLoadingAuth, fetchBookingDetails]); // fetchBookingDetails est stable

//     // --- Fonction pour OUVRIR le modal de confirmation ---
//     const openConfirmationModal = (newStatus: 'confirmed' | 'declined') => {
//         setStatusToConfirm(newStatus);
//         setIsConfirmModalVisible(true);
//     };

//      // --- Fonction pour forcer un rafraîchissement complet ---
//      const forceRefresh = useCallback(() => {
//         console.log("Forcing full data refresh...");
//         fetchBookingDetails('forceRefresh');
//     }, [fetchBookingDetails]);

//     // --- Fonction exécutée quand on CONFIRME dans le modal (Appelle la RPC d'UPDATE) ---
//     const handleConfirmAction = useCallback(async () => {
//         // Vérifications
//         if (!user || !bookingDetails || !statusToConfirm) {
//             console.error("handleConfirmAction: Missing user, bookingDetails, or statusToConfirm");
//             setIsConfirmModalVisible(false);
//             return;
//         }

//         const bookingToUpdateId = bookingDetails.id;
//         const newStatus = statusToConfirm;

//         console.log(`Modal confirmed for status: ${newStatus}. Setting actionLoading to true.`);
//         setActionLoading(true); // Active le spinner pendant toute l'opération
//         setIsConfirmModalVisible(false);
//         setStatusToConfirm(null);

//         try {
//             // *** Appel de la NOUVELLE fonction RPC qui fait l'UPDATE et le SELECT ***
//             console.log(`🚀 Calling RPC [update_booking_status_and_get_details] for booking: ${bookingToUpdateId} with status ${newStatus}`);
//             const { data: updatedBookingData, error: updateRpcError } = await supabase.rpc(
//                 'update_booking_status_and_get_details', // La fonction qui combine UPDATE et SELECT
//                 {
//                     p_booking_id: bookingToUpdateId,
//                     p_new_status: newStatus,
//                     p_host_id: user.id
//                 }
//             );

//             // Gérer l'erreur de l'appel RPC
//             if (updateRpcError) {
//                 console.error("RPC Error (update_booking_status):", updateRpcError);
//                 throw new Error(`Erreur RPC lors de la mise à jour: ${updateRpcError.message}`);
//             }

//             // Gérer le cas où la fonction retourne NULL (action non permise ou non trouvée)
//             if (updatedBookingData === null) {
//                  console.log("RPC (update_booking_status) returned null (maybe not pending or not authorized?)");
//                  Alert.alert("Action impossible", "La réservation n'était peut-être plus en attente ou une erreur est survenue.");
//                  forceRefresh(); // Recharger pour afficher l'état actuel correct
//                  // Pas besoin de throw new Error ici, l'alerte informe déjà
//                  return; // Sortir de la fonction
//             }

//             // *** Succès ! La RPC a retourné les données mises à jour ***
//             console.log(`✅ Update RPC successful. Final status from data: ${updatedBookingData.status}`);
//             // Mettre à jour l'état React avec les données fraîches et garanties retournées par la RPC
//             setBookingDetails(updatedBookingData as BookingDetail);
//             Alert.alert("Succès", `Réservation ${newStatus === 'confirmed' ? 'confirmée' : 'refusée'}.`);

//         } catch (err: any) {
//             // Gérer les erreurs (RPC ou autres exceptions)
//             console.error(`Error during booking update process for ${newStatus}:`, err);
//             Alert.alert("Erreur", `Échec de la mise à jour: ${err.message || "Veuillez réessayer."}`);
//             // En cas d'erreur, forcer un refresh pour revenir à l'état DB connu
//             forceRefresh();
//         } finally {
//             // Arrêter le spinner dans tous les cas
//             console.log("Action finished. Setting actionLoading to false.");
//             setActionLoading(false);
//         }
//     }, [user, bookingDetails, statusToConfirm, forceRefresh]); // Dépendances

//     // --- Rendu ---
//     console.log("Rendering BookingDetailScreen. Current bookingDetails.status:", bookingDetails?.status, "actionLoading:", actionLoading);

//     // 1. Chargement / Erreurs
//     if (!fontsLoaded || isLoadingAuth || loading) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
//     if (fontError) { return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
//     if (error) { return ( <SafeAreaView style={styles.errorContainer}><AlertCircle size={40} color="#dc2626" /><Text style={styles.errorText}>{error}</Text>{error !== "ID de réservation invalide." && error !== "ID de réservation manquant dans l'URL." && error !== "Réservation introuvable ou accès non autorisé." && (<TouchableOpacity onPress={() => fetchBookingDetails('retryButton')} style={styles.retryButton}><RefreshCw size={16} color="#ffffff" /><Text style={styles.retryButtonText}>Réessayer</Text></TouchableOpacity>)}<TouchableOpacity onPress={() => router.back()} style={[styles.retryButton, {backgroundColor: '#64748b', marginTop: 10}]}><ArrowLeft size={16} color="#ffffff" /><Text style={styles.retryButtonText}>Retour</Text></TouchableOpacity></SafeAreaView> ); }
//     if (!bookingDetails) { return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Impossible d'afficher détails.</Text></SafeAreaView>; }

//     // 5. Rendu normal
//     const startDate = parseISO(bookingDetails.start_time);
//     const endDate = parseISO(bookingDetails.end_time);
//     const createdAtDate = parseISO(bookingDetails.created_at);
//     const isValidDates = isValid(startDate) && isValid(endDate);
//     const durationHours = isValidDates ? differenceInHours(endDate, startDate) : 0;
//     const formattedPrice = `${bookingDetails.total_price?.toFixed(0) ?? 'N/A'} MAD`;
//     const coverImage = bookingDetails.pool_listing?.pool_images?.[0]?.url || null;
//     const canContact = bookingDetails.conversation != null &&
//                        ['pending', 'confirmed'].includes(bookingDetails.status) &&
//                        bookingDetails.conversation.status !== 'archived';

//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ headerShown: false }} />

//              {/* Header avec Refresh Button */}
//             <View style={styles.header}>
//                 <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/host/(dashboard)/bookings')}>
//                     <ArrowLeft color="#475569" size={22} />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle} numberOfLines={1}>
//                      Résa: {bookingDetails.user_profile?.full_name ?? 'Client'}
//                 </Text>
//                 <TouchableOpacity style={styles.refreshButton} onPress={forceRefresh} disabled={actionLoading || loading}>
//                     <RefreshCw size={18} color={actionLoading || loading ? "#cbd5e1" : "#475569"} />
//                 </TouchableOpacity>
//              </View>

//             <ScrollView contentContainerStyle={styles.scrollContent}>
//                  {/* Sections Infos */}
//                  {bookingDetails.pool_listing && ( <View style={styles.sectionCard}>{coverImage ? <Image source={{ uri: coverImage }} style={styles.poolImage} /> : <View style={[styles.poolImage, styles.placeholderImage]}><Calendar size={40} color="#cbd5e1" /></View>}<Text style={styles.poolTitle}>{bookingDetails.pool_listing.title ?? 'Piscine sans titre'}</Text>{bookingDetails.pool_listing.location && (<View style={styles.inlineInfo}><MapPin size={16} color="#64748b" /><Text style={styles.poolLocation}>{bookingDetails.pool_listing.location}</Text></View>)}</View> )}
//                  <View style={styles.sectionCard}><Text style={styles.sectionTitle}>Informations Client</Text><View style={styles.inlineInfo}><UserIcon size={16} color="#475569" /><Text style={styles.detailValue}>{bookingDetails.user_profile?.full_name ?? 'Non spécifié'}</Text></View></View>
//                  <View style={styles.sectionCard}>
//                     <Text style={styles.sectionTitle}>Détails de la réservation</Text>
//                     <View style={styles.detailItem}>
//                         <Info size={16} color="#475569" />
//                         <Text style={styles.detailValue}>Statut: <Text style={{ fontFamily: 'Montserrat-Bold' }}>{BOOKING_STATUS_LABELS[bookingDetails.status] || bookingDetails.status}</Text></Text>
//                     </View>
//                     <View style={styles.detailItem}>
//                         <Calendar size={16} color="#475569" />
//                         {/* Correction format date */}
//                         <Text style={styles.detailValue}>{isValidDates ? format(startDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Date invalide'}</Text>
//                     </View>
//                     <View style={styles.detailItem}>
//                         <Clock size={16} color="#475569" />
//                         <Text style={styles.detailValue}>{isValidDates ? `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')} (${durationHours > 0 ? durationHours + 'h' : '<1h'})` : 'Horaire invalide'}</Text>
//                     </View>
//                     <View style={styles.detailItem}>
//                         <Users size={16} color="#475569" />
//                         <Text style={styles.detailValue}>{bookingDetails.guest_count} personne{bookingDetails.guest_count > 1 ? 's' : ''}</Text>
//                     </View>
//                     <View style={styles.detailItem}>
//                         <DollarSign size={16} color="#475569" />
//                         <Text style={styles.detailValue}>Total payé: {formattedPrice}</Text>
//                     </View>
//                     <View style={styles.detailItem}>
//                         <Calendar size={16} color="#475569" />
//                         <Text style={styles.detailValue}>Demandée le: {isValid(createdAtDate) ? format(createdAtDate, 'd MMM yy à HH:mm', { locale: fr }) : 'Date inconnue'}</Text>
//                     </View>
//                  </View>

//                  {/* Actions */}
//                  <View style={styles.actionsContainer}>
//                      {/* Condition d'affichage basée sur le statut actuel dans l'état */}
//                      {bookingDetails.status === 'pending' && (
//                          <>
//                              <TouchableOpacity
//                                 style={[styles.actionButton, styles.confirmButton, actionLoading && styles.disabledButton]}
//                                 onPress={() => openConfirmationModal('confirmed')}
//                                 disabled={actionLoading}>
//                                  {/* Le spinner est géré par actionLoading */}
//                                  {actionLoading ? <ActivityIndicator size="small" color="#fff" /> : <CheckCircle2 size={20} color="#ffffff" />}
//                                  <Text style={styles.actionButtonText}>Confirmer Réservation</Text>
//                              </TouchableOpacity>
//                              <TouchableOpacity
//                                 style={[styles.actionButton, styles.rejectButton, actionLoading && styles.disabledButton]}
//                                 onPress={() => openConfirmationModal('declined')}
//                                 disabled={actionLoading}>
//                                  {/* Le spinner est géré par actionLoading */}
//                                  {actionLoading ? <ActivityIndicator size="small" color="#b91c1c" /> : <XCircle size={20} color="#b91c1c" />}
//                                  <Text style={styles.actionButtonTextReject}>Refuser Réservation</Text>
//                              </TouchableOpacity>
//                          </>
//                      )}
//                      <TouchableOpacity
//                          style={[styles.actionButton, styles.messageButton, (!canContact || actionLoading) && styles.disabledButton]}
//                          onPress={() => { if (canContact && bookingDetails.conversation) { router.push({ pathname: '/(tabs)/conversations/[id]', params: { id: bookingDetails.conversation.id }}); } else { Alert.alert("Contacter", "Conversation non disponible."); } }}
//                          disabled={!canContact || actionLoading}>
//                          <MessageCircle size={20} color={canContact ? '#0891b2' : '#9ca3af'} />
//                          <Text style={[styles.actionButtonTextMessage, !canContact && { color: '#9ca3af' }]}>Contacter Client</Text>
//                      </TouchableOpacity>
//                  </View>

//             </ScrollView>

//             {/* Modal de Confirmation (inchangé) */}
//             <Modal
//                 animationType="fade"
//                 transparent={true}
//                 visible={isConfirmModalVisible}
//                 onRequestClose={() => { if (!actionLoading) { setIsConfirmModalVisible(false); setStatusToConfirm(null); } }}>
//                 <View style={styles.modalOverlay}>
//                     <View style={styles.modalContent}>
//                         <Text style={styles.modalTitle}>{statusToConfirm === 'confirmed' ? "Confirmer ?" : "Refuser ?"}</Text>
//                         <Text style={styles.modalMessage}>Êtes-vous sûr de vouloir {statusToConfirm === 'confirmed' ? 'confirmer' : 'refuser'} cette demande ?</Text>
//                         <View style={styles.modalActions}>
//                             <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => { setIsConfirmModalVisible(false); setStatusToConfirm(null); }}>
//                                 <Text style={styles.modalButtonTextCancel}>Annuler</Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity style={[styles.modalButton, statusToConfirm === 'confirmed' ? styles.modalButtonConfirm : styles.modalButtonReject]} onPress={handleConfirmAction}>
//                                 <Text style={statusToConfirm === 'confirmed' ? styles.modalButtonTextConfirm : styles.modalButtonTextReject}>Oui, {statusToConfirm === 'confirmed' ? 'confirmer' : 'refuser'}</Text>
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
//      sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8 },
//      inlineInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
//      detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
//      detailValue: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#334155', flexShrink: 1, lineHeight: 22 },
//      actionsContainer: { marginTop: 10, gap: 12, paddingBottom: 20 },
//      actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, borderWidth: 1, gap: 10, minHeight: 50 },
//      confirmButton: { backgroundColor: '#10b981', borderColor: '#059669' },
//      actionButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
//      rejectButton: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
//      actionButtonTextReject: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#b91c1c' },
//      messageButton: { backgroundColor: '#ecfeff', borderColor: '#cffafe' },
//      actionButtonTextMessage: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2' },
//      disabledButton: { opacity: 0.6 },
//      avatarImage: { width: 40, height: 40, borderRadius: 20, marginLeft: 'auto' },
//      modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
//      modalContent: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, width: '85%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
//      modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 10, textAlign: 'center', },
//      modalMessage: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#475569', marginBottom: 25, textAlign: 'center', lineHeight: 22, },
//      modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, },
//      modalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, },
//      modalButtonCancel: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', },
//      modalButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#475569', },
//      modalButtonConfirm: { backgroundColor: '#10b981', borderColor: '#059669', },
//      modalButtonTextConfirm: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
//      modalButtonReject: { backgroundColor: '#ef4444', borderColor: '#dc2626', },
//      modalButtonTextReject: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
//  });



// Dans app/(tabs)/host/booking-details/[id].tsx
// VERSION CORRIGÉE : Ajout log pour inspecter l'objet conversation après update RPC

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
    ActivityIndicator, Alert, Image, Platform, Modal
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO, differenceInHours, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    ArrowLeft, Calendar, Clock, Users, MapPin, DollarSign, Info, User as UserIcon,
    CheckCircle2, XCircle, MessageCircle, AlertCircle, RefreshCw
} from 'lucide-react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';

// --- Interfaces (restent identiques) ---
interface BookingUserProfile { full_name: string | null; avatar_url?: string | null; }
interface BookingPoolImage { url: string; position?: number | null; }
interface BookingPoolListing { id: string; title: string; location: string | null; owner_id: string; pool_images: BookingPoolImage[] | null; }
interface BookingConversation { id: string; status: string; updated_at: string; booking_id: string; }
interface BookingDetail { id: string; start_time: string; end_time: string; status: string; total_price: number; created_at: string; user_id: string; pool_listing_id: string; guest_count: number; user_profile?: BookingUserProfile | null; pool_listing?: BookingPoolListing | null; conversation?: BookingConversation | null; }
// --- Fin des Interfaces ---

// --- Constantes ---
const BOOKING_STATUS_LABELS: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', completed: 'Terminée', canceled: 'Annulée', declined: 'Refusée' };

export default function BookingDetailScreen() {
    const { id: bookingId } = useLocalSearchParams<{ id: string }>();
    const { user, isLoading: isLoadingAuth } = useAuth();

    const [bookingDetails, setBookingDetails] = useState<BookingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [statusToConfirm, setStatusToConfirm] = useState<'confirmed' | 'declined' | null>(null);
    const isInitialLoadDone = useRef(false);

    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // --- Fetch Booking Details via RPC (pour chargement initial/refresh) ---
    const fetchBookingDetails = useCallback(async (calledFrom?: string): Promise<BookingDetail | null> => {
        if (!bookingId || typeof bookingId !== 'string') { setError("ID de réservation invalide."); setLoading(false); return null; }
        if (!user) { console.log(`fetchBookingDetails (${calledFrom || 'unknown'}): User not loaded yet.`); setLoading(false); return null; }

        if (['useEffect', 'forceRefresh', 'retryButton'].includes(calledFrom || '') && !actionLoading) { setLoading(true); }
        if (['useEffect', 'forceRefresh', 'retryButton'].includes(calledFrom || '')) { setError(null); }


        console.log(`🚀 (${calledFrom || 'unknown'}) Calling RPC [get_booking_details_for_host] for booking: ${bookingId}`);

        try {
            const { data, error: rpcError } = await supabase.rpc(
                'get_booking_details_for_host',
                { p_booking_id: bookingId, p_host_id: user.id }
            );

            if (rpcError) { console.error("RPC Error (get_booking_details):", rpcError); throw new Error(`Erreur RPC: ${rpcError.message}`); }
            if (data === null) { console.log("RPC (get_booking_details) returned null"); throw new Error("Réservation introuvable ou accès non autorisé."); }

            console.log(`✅ (${calledFrom || 'unknown'}) RPC successful. Status from data: ${data.status}`);
            // Log conversation object fetched
            console.log(`   Conversation fetched:`, data.conversation);

            if (['useEffect', 'forceRefresh', 'retryButton'].includes(calledFrom || '')) {
                 setBookingDetails(data as BookingDetail);
            }
            return data as BookingDetail;

        } catch (err: any) {
            console.error(`Error fetching booking details (${calledFrom || 'unknown'}):`, err);
             if (['useEffect', 'forceRefresh', 'retryButton'].includes(calledFrom || '')) {
                 setError(err.message || "Erreur chargement détails.");
                 setBookingDetails(null);
             }
             return null;
        } finally {
             if (!actionLoading && ['useEffect', 'forceRefresh', 'retryButton'].includes(calledFrom || '')) {
                 setLoading(false);
             }
        }
    }, [bookingId, user, actionLoading]);

    // --- UseEffect pour charger les données initiales ---
    useEffect(() => {
        const canLoad = fontsLoaded && !fontError && !isLoadingAuth && user && bookingId;
        if (canLoad && !isInitialLoadDone.current) {
            isInitialLoadDone.current = true;
            fetchBookingDetails('useEffect');
        }
    }, [bookingId, user, fontsLoaded, fontError, isLoadingAuth, fetchBookingDetails]);

    // --- Fonction pour OUVRIR le modal de confirmation ---
    const openConfirmationModal = (newStatus: 'confirmed' | 'declined') => {
        setStatusToConfirm(newStatus);
        setIsConfirmModalVisible(true);
    };

     // --- Fonction pour forcer un rafraîchissement complet ---
     const forceRefresh = useCallback(() => {
        console.log("Forcing full data refresh...");
        fetchBookingDetails('forceRefresh');
    }, [fetchBookingDetails]);

    // --- Fonction exécutée quand on CONFIRME dans le modal (Appelle la RPC d'UPDATE) ---
    const handleConfirmAction = useCallback(async () => {
        if (!user || !bookingDetails || !statusToConfirm) { console.error("handleConfirmAction: Missing data"); setIsConfirmModalVisible(false); return; }

        const bookingToUpdateId = bookingDetails.id;
        const newStatus = statusToConfirm;

        console.log(`Modal confirmed for status: ${newStatus}. Setting actionLoading to true.`);
        setActionLoading(true);
        setIsConfirmModalVisible(false);
        setStatusToConfirm(null);

        try {
            // Appel de la NOUVELLE fonction RPC qui fait l'UPDATE et le SELECT
            console.log(`🚀 Calling RPC [update_booking_status_and_get_details] for booking: ${bookingToUpdateId} with status ${newStatus}`);
            const { data: updatedBookingData, error: updateRpcError } = await supabase.rpc(
                'update_booking_status_and_get_details',
                {
                    p_booking_id: bookingToUpdateId,
                    p_new_status: newStatus,
                    p_host_id: user.id
                }
            );

            if (updateRpcError) {
                console.error("RPC Error (update_booking_status):", updateRpcError);
                throw new Error(`Erreur RPC lors de la mise à jour: ${updateRpcError.message}`);
            }

            if (updatedBookingData === null) {
                 console.log("RPC (update_booking_status) returned null (maybe not pending or not authorized?)");
                 Alert.alert("Action impossible", "La réservation n'était peut-être plus en attente ou une erreur est survenue.");
                 forceRefresh();
                 return; // Sortir après l'erreur
            }

            // Succès ! Mettre à jour l'état avec les données retournées par la RPC
            console.log(`✅ Update RPC successful. Final status from data: ${updatedBookingData.status}`);
            // *** LOG AJOUTÉ ICI ***
            console.log("Conversation object from update RPC:", updatedBookingData.conversation);
            setBookingDetails(updatedBookingData as BookingDetail); // Met à jour l'UI avec les données garanties
            Alert.alert("Succès", `Réservation ${newStatus === 'confirmed' ? 'confirmée' : 'refusée'}.`);

        } catch (err: any) {
            console.error(`Error during booking update process for ${newStatus}:`, err);
            Alert.alert("Erreur", `Échec de la mise à jour: ${err.message || "Veuillez réessayer."}`);
            forceRefresh(); // Revenir à l'état DB connu en cas d'erreur
        } finally {
            console.log("Action finished. Setting actionLoading to false.");
            setActionLoading(false); // Arrêter le spinner
        }
    }, [user, bookingDetails, statusToConfirm, forceRefresh]);

    // --- Rendu ---
    console.log("Rendering BookingDetailScreen. Current bookingDetails.status:", bookingDetails?.status, "actionLoading:", actionLoading);

    // 1. Chargement / Erreurs
    if (!fontsLoaded || isLoadingAuth || loading) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
    if (fontError) { return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
    if (error) { return ( <SafeAreaView style={styles.errorContainer}><AlertCircle size={40} color="#dc2626" /><Text style={styles.errorText}>{error}</Text>{error !== "ID de réservation invalide." && error !== "ID de réservation manquant dans l'URL." && error !== "Réservation introuvable ou accès non autorisé." && (<TouchableOpacity onPress={() => fetchBookingDetails('retryButton')} style={styles.retryButton}><RefreshCw size={16} color="#ffffff" /><Text style={styles.retryButtonText}>Réessayer</Text></TouchableOpacity>)}<TouchableOpacity onPress={() => router.back()} style={[styles.retryButton, {backgroundColor: '#64748b', marginTop: 10}]}><ArrowLeft size={16} color="#ffffff" /><Text style={styles.retryButtonText}>Retour</Text></TouchableOpacity></SafeAreaView> ); }
    if (!bookingDetails) { return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Impossible d'afficher détails.</Text></SafeAreaView>; }

    // 5. Rendu normal
    const startDate = parseISO(bookingDetails.start_time);
    const endDate = parseISO(bookingDetails.end_time);
    const createdAtDate = parseISO(bookingDetails.created_at);
    const isValidDates = isValid(startDate) && isValid(endDate);
    const durationHours = isValidDates ? differenceInHours(endDate, startDate) : 0;
    const formattedPrice = `${bookingDetails.total_price?.toFixed(0) ?? 'N/A'} MAD`;
    const coverImage = bookingDetails.pool_listing?.pool_images?.[0]?.url || null;
    // Recalcul de canContact basé sur l'état actuel
    const canContact = bookingDetails.conversation != null &&
                       ['pending', 'confirmed'].includes(bookingDetails.status) &&
                       bookingDetails.conversation.status !== 'archived';
    // Log pour déboguer canContact
    console.log("Calculating canContact:", {
        hasConversation: bookingDetails.conversation != null,
        statusOk: ['pending', 'confirmed'].includes(bookingDetails.status),
        conversationStatus: bookingDetails.conversation?.status,
        isNotArchived: bookingDetails.conversation?.status !== 'archived',
        result: canContact
    });


    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

             {/* Header avec Refresh Button */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/host/(dashboard)/bookings')}>
                    <ArrowLeft color="#475569" size={22} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                     Résa: {bookingDetails.user_profile?.full_name ?? 'Client'}
                </Text>
                <TouchableOpacity style={styles.refreshButton} onPress={forceRefresh} disabled={actionLoading || loading}>
                    <RefreshCw size={18} color={actionLoading || loading ? "#cbd5e1" : "#475569"} />
                </TouchableOpacity>
             </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                 {/* Sections Infos */}
                 {bookingDetails.pool_listing && ( <View style={styles.sectionCard}>{coverImage ? <Image source={{ uri: coverImage }} style={styles.poolImage} /> : <View style={[styles.poolImage, styles.placeholderImage]}><Calendar size={40} color="#cbd5e1" /></View>}<Text style={styles.poolTitle}>{bookingDetails.pool_listing.title ?? 'Piscine sans titre'}</Text>{bookingDetails.pool_listing.location && (<View style={styles.inlineInfo}><MapPin size={16} color="#64748b" /><Text style={styles.poolLocation}>{bookingDetails.pool_listing.location}</Text></View>)}</View> )}
                 <View style={styles.sectionCard}><Text style={styles.sectionTitle}>Informations Client</Text><View style={styles.inlineInfo}><UserIcon size={16} color="#475569" /><Text style={styles.detailValue}>{bookingDetails.user_profile?.full_name ?? 'Non spécifié'}</Text></View></View>
                 <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Détails de la réservation</Text>
                    <View style={styles.detailItem}>
                        <Info size={16} color="#475569" />
                        <Text style={styles.detailValue}>Statut: <Text style={{ fontFamily: 'Montserrat-Bold' }}>{BOOKING_STATUS_LABELS[bookingDetails.status] || bookingDetails.status}</Text></Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Calendar size={16} color="#475569" />
                        <Text style={styles.detailValue}>{isValidDates ? format(startDate, 'EEEE d MMMM yyyy', { locale: fr }) : 'Date invalide'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Clock size={16} color="#475569" />
                        <Text style={styles.detailValue}>{isValidDates ? `${format(startDate, 'HH:mm')} - ${format(endDate, 'HH:mm')} (${durationHours > 0 ? durationHours + 'h' : '<1h'})` : 'Horaire invalide'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Users size={16} color="#475569" />
                        <Text style={styles.detailValue}>{bookingDetails.guest_count} personne{bookingDetails.guest_count > 1 ? 's' : ''}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <DollarSign size={16} color="#475569" />
                        <Text style={styles.detailValue}>Total payé: {formattedPrice}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Calendar size={16} color="#475569" />
                        <Text style={styles.detailValue}>Demandée le: {isValid(createdAtDate) ? format(createdAtDate, 'd MMM yy à HH:mm', { locale: fr }) : 'Date inconnue'}</Text>
                    </View>
                 </View>

                 {/* Actions */}
                 <View style={styles.actionsContainer}>
                     {bookingDetails.status === 'pending' && (
                         <>
                             <TouchableOpacity
                                style={[styles.actionButton, styles.confirmButton, actionLoading && styles.disabledButton]}
                                onPress={() => openConfirmationModal('confirmed')}
                                disabled={actionLoading}>
                                 {actionLoading ? <ActivityIndicator size="small" color="#fff" /> : <CheckCircle2 size={20} color="#ffffff" />}
                                 <Text style={styles.actionButtonText}>Confirmer Réservation</Text>
                             </TouchableOpacity>
                             <TouchableOpacity
                                style={[styles.actionButton, styles.rejectButton, actionLoading && styles.disabledButton]}
                                onPress={() => openConfirmationModal('declined')}
                                disabled={actionLoading}>
                                 {actionLoading ? <ActivityIndicator size="small" color="#b91c1c" /> : <XCircle size={20} color="#b91c1c" />}
                                 <Text style={styles.actionButtonTextReject}>Refuser Réservation</Text>
                             </TouchableOpacity>
                         </>
                     )}
                     <TouchableOpacity
                         style={[styles.actionButton, styles.messageButton, (!canContact || actionLoading) && styles.disabledButton]}
                         onPress={() => { if (canContact && bookingDetails.conversation) { router.push({ pathname: '/(tabs)/conversations/[id]', params: { id: bookingDetails.conversation.id }}); } else { Alert.alert("Contacter", "Conversation non disponible."); } }}
                         disabled={!canContact || actionLoading}>
                         <MessageCircle size={20} color={canContact ? '#0891b2' : '#9ca3af'} />
                         <Text style={[styles.actionButtonTextMessage, !canContact && { color: '#9ca3af' }]}>Contacter Client</Text>
                     </TouchableOpacity>
                 </View>

            </ScrollView>

            {/* Modal de Confirmation (inchangé) */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isConfirmModalVisible}
                onRequestClose={() => { if (!actionLoading) { setIsConfirmModalVisible(false); setStatusToConfirm(null); } }}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{statusToConfirm === 'confirmed' ? "Confirmer ?" : "Refuser ?"}</Text>
                        <Text style={styles.modalMessage}>Êtes-vous sûr de vouloir {statusToConfirm === 'confirmed' ? 'confirmer' : 'refuser'} cette demande ?</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => { setIsConfirmModalVisible(false); setStatusToConfirm(null); }}>
                                <Text style={styles.modalButtonTextCancel}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, statusToConfirm === 'confirmed' ? styles.modalButtonConfirm : styles.modalButtonReject]} onPress={handleConfirmAction}>
                                <Text style={statusToConfirm === 'confirmed' ? styles.modalButtonTextConfirm : styles.modalButtonTextReject}>Oui, {statusToConfirm === 'confirmed' ? 'confirmer' : 'refuser'}</Text>
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
     sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 8 },
     inlineInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
     detailItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
     detailValue: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#334155', flexShrink: 1, lineHeight: 22 },
     actionsContainer: { marginTop: 10, gap: 12, paddingBottom: 20 },
     actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, borderWidth: 1, gap: 10, minHeight: 50 },
     confirmButton: { backgroundColor: '#10b981', borderColor: '#059669' },
     actionButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
     rejectButton: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
     actionButtonTextReject: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#b91c1c' },
     messageButton: { backgroundColor: '#ecfeff', borderColor: '#cffafe' },
     actionButtonTextMessage: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2' },
     disabledButton: { opacity: 0.6 },
     avatarImage: { width: 40, height: 40, borderRadius: 20, marginLeft: 'auto' },
     modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
     modalContent: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, width: '85%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
     modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 10, textAlign: 'center', },
     modalMessage: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#475569', marginBottom: 25, textAlign: 'center', lineHeight: 22, },
     modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, },
     modalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, },
     modalButtonCancel: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', },
     modalButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#475569', },
     modalButtonConfirm: { backgroundColor: '#10b981', borderColor: '#059669', },
     modalButtonTextConfirm: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
     modalButtonReject: { backgroundColor: '#ef4444', borderColor: '#dc2626', },
     modalButtonTextReject: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
 });
