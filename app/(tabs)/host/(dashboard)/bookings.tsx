
// Dans app/(tabs)/host/(dashboard)/bookings.tsx
// VERSION CORRIGÉE : Utilise la fonction RPC get_host_bookings_list_details

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Platform,
    Image, ActivityIndicator, RefreshControl, SafeAreaView,
    FlatList,
    Alert, // Gardé pour les messages de succès/erreur, mais pas pour la confirmation
    ScrollView, TextInput,
    Modal // <-- Importé
} from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import {
    CheckCircle2, XCircle, MessageCircle, Clock, User, Calendar as CalendarIconLucide,
    ChevronRight, RefreshCcw, ArrowLeft, Info, AlertCircle,
    Filter, Search as SearchIcon, Calendar as CalendarIcon
} from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Animated, { FadeIn } from 'react-native-reanimated';
import { format, parseISO, isAfter, isBefore, isToday, differenceInHours, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

// --- Interfaces (Inchangées) ---
interface BookingUserProfile { full_name: string | null; avatar_url?: string | null; user_id: string; }
interface BookingPoolImage { url: string; position?: number | null; }
interface BookingPool { id: string; title: string; location: string | null; pool_images: BookingPoolImage[] | null; }
interface BookingConversation { id: string; status: string; updated_at: string; booking_id: string; }
interface Booking {
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    total_price: number;
    created_at: string;
    user_id: string;
    pool_id: string;
    guest_count: number;
    user_profile?: BookingUserProfile | null;
    pool?: BookingPool | null;
    conversation?: BookingConversation | null;
}

// --- Constantes (Inchangées) ---
const BOOKING_STATUS_COLORS: Record<string, string> = { pending: '#fef3c7', confirmed: '#d1fae5', completed: '#e0f2fe', canceled: '#f1f5f9', declined: '#fee2e2' };
const BOOKING_STATUS_TEXT_COLORS: Record<string, string> = { pending: '#92400e', confirmed: '#065f46', completed: '#0369a1', canceled: '#475569', declined: '#b91c1c' };
const BOOKING_STATUS_LABELS: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', completed: 'Terminée', canceled: 'Annulée', declined: 'Refusée' };


// --- Composant Enfant BookingItemCard (Inchangé, appelle onAction) ---
interface BookingItemCardProps {
    item: Booking;
    index: number;
    onAction: (bookingId: string, newStatus: 'confirmed' | 'declined') => void; // Appellera openConfirmationModal
    onContact: (conversationId: string) => void;
    onDetails: (bookingId: string) => void;
    actionLoadingId: string | null;
    newStatusAction: 'confirmed' | 'declined' | null;
}

const BookingItemCard: React.FC<BookingItemCardProps> = React.memo(({
    item, index, onAction, onContact, onDetails, actionLoadingId, newStatusAction
}) => {
    // ... (code interne du composant inchangé) ...
       const startDate = useMemo(() => { try { return parseISO(item.start_time); } catch { return null; } }, [item.start_time]);
     const endDate = useMemo(() => { try { return parseISO(item.end_time); } catch { return null; } }, [item.end_time]);
     const canContact = useMemo(() => (item.conversation != null && ['pending', 'confirmed'].includes(item.status) && item.conversation.status !== 'archived'), [item.conversation, item.status]);
     const isActionLoading = actionLoadingId === item.id;

     if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) {
         console.error("Invalid date found for booking card:", item.id, item.start_time, item.end_time);
         return ( <View style={[styles.bookingCard, { borderColor: '#f87171', backgroundColor: '#fee2e2' }]}><View style={styles.bookingContent}><Text style={[styles.errorText, { textAlign: 'left' }]}>Erreur : Date invalide (ID: {item.id}).</Text></View></View> );
     }

     const formattedStart = format(startDate, "dd MMM yy 'à' HH'h'mm", { locale: fr });
     const formattedEnd = format(endDate, "HH'h'mm", { locale: fr });
     const durationHours = differenceInHours(endDate, startDate);
     const statusColor = BOOKING_STATUS_COLORS[item.status] || '#f1f5f9';
     const statusTextColor = BOOKING_STATUS_TEXT_COLORS[item.status] || '#64748b';
     const statusLabel = BOOKING_STATUS_LABELS[item.status] || item.status;
     const now = new Date();
     const isUpcoming = isAfter(startDate, now) && item.status === 'confirmed';
     const isPast = isBefore(endDate, now) && (item.status === 'confirmed' || item.status === 'completed');
     const isCurrent = isToday(startDate) && item.status === 'confirmed';
     const coverImage = item.pool?.pool_images?.[0]?.url || null;
     const formattedPrice = `${item.total_price?.toFixed(0) ?? 'N/A'} MAD`;

     return (
         <Animated.View entering={FadeIn.delay(index * 50).duration(300)} style={styles.bookingCard}>
             <View style={styles.bookingHeader}>
                 <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                     {item.status === 'pending' && <AlertCircle size={14} color={statusTextColor} />}
                     {item.status === 'confirmed' && <CheckCircle2 size={14} color={statusTextColor} />}
                     {item.status === 'completed' && <CheckCircle2 size={14} color={statusTextColor} />}
                     {item.status === 'canceled' && <XCircle size={14} color={statusTextColor} />}
                     {item.status === 'declined' && <XCircle size={14} color={statusTextColor} />}
                     <Text style={[styles.statusText, { color: statusTextColor }]}>{statusLabel}</Text>
                 </View>
                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      {isUpcoming && <View style={styles.tagBadge}><Text style={styles.tagText}>À venir</Text></View>}
                      {isPast && <View style={[styles.tagBadge, { backgroundColor: '#e2e8f0' }]}><Text style={[styles.tagText, { color: '#64748b' }]}>Passée</Text></View>}
                      {isCurrent && <View style={[styles.tagBadge, { backgroundColor: '#dbeafe' }]}><Text style={[styles.tagText, { color: '#2563eb' }]}>Aujourd'hui</Text></View>}
                      {item.conversation?.status === 'open' && (
                          <View style={[styles.tagBadge, { backgroundColor: '#ecfeff' }]}>
                              <MessageCircle size={12} color="#0e7490" />
                              <Text style={[styles.tagText, { color: '#0e7490', marginLeft: 3 }]}>Active</Text>
                          </View>
                      )}
                 </View>
             </View>
             <View style={styles.bookingContent}>
                 <View style={styles.bookingInfo}>
                     <View style={styles.propertyInfo}>
                          {coverImage ? ( <Image source={{ uri: coverImage }} style={styles.propertyImage} resizeMode="cover" /> ) : ( <View style={[styles.propertyImage, styles.placeholderImage]}><CalendarIconLucide size={24} color="#94a3b8" /></View> )}
                          <View style={styles.propertyDetails}>
                              <Text style={styles.propertyTitle} numberOfLines={1}>{item.pool?.title || "Annonce Inconnue"}</Text>
                              {item.pool?.location && <Text style={styles.propertyLocation} numberOfLines={1}>{item.pool.location}</Text>}
                          </View>
                     </View>
                     <View style={styles.clientInfo}>
                          <View style={styles.clientAvatar}>
                               {item.user_profile?.avatar_url ? <Image source={{ uri: item.user_profile.avatar_url }} style={styles.avatarImage}/> : <User size={16} color="#64748b" />}
                          </View>
                          <Text style={styles.clientName}>{item.user_profile?.full_name || "Client Inconnu"}</Text>
                          <Text style={styles.guestCountText}>({item.guest_count} invité{item.guest_count > 1 ? 's' : ''})</Text>
                     </View>
                     <View style={styles.dateTimeContainer}>
                          <Clock size={14} color="#64748b" style={{ marginRight: 5 }} />
                          <Text style={styles.dateTimeValue}>{formattedStart} - {formattedEnd} ({durationHours > 0 ? `${durationHours}h` : '<1h'})</Text>
                     </View>
                     <Text style={styles.priceText}>{formattedPrice}</Text>
                 </View>
                 <View style={styles.bookingActions}>
                     {item.status === 'pending' && (
                         <>
                             <TouchableOpacity style={[styles.actionButton, styles.confirmButton, isActionLoading && styles.disabledButton]} onPress={() => onAction(item.id, 'confirmed')} disabled={isActionLoading}>
                                 {isActionLoading && newStatusAction === 'confirmed' ? <ActivityIndicator size="small" color="#ffffff"/> : <CheckCircle2 size={16} color="#ffffff" />}
                                 <Text style={styles.confirmButtonText}>Confirmer</Text>
                             </TouchableOpacity>
                             <TouchableOpacity style={[styles.actionButton, styles.declineButton, isActionLoading && styles.disabledButton]} onPress={() => onAction(item.id, 'declined')} disabled={isActionLoading}>
                                 {isActionLoading && newStatusAction === 'declined' ? <ActivityIndicator size="small" color="#b91c1c"/> : <XCircle size={16} color="#b91c1c" />}
                                 <Text style={styles.declineButtonText}>Refuser</Text>
                             </TouchableOpacity>
                         </>
                     )}
                     <TouchableOpacity style={[styles.actionButton, styles.messageButton, (!canContact || isActionLoading) && styles.disabledButton]} onPress={() => { if (canContact && item.conversation) { onContact(item.conversation.id); } else { Alert.alert("Contacter", "Conversation non disponible."); } }} disabled={!canContact || isActionLoading}>
                         <MessageCircle size={16} color={canContact ? '#0891b2' : '#9ca3af'} />
                         <Text style={[styles.messageButtonText, !canContact && { color: '#9ca3af' }]}>Contacter</Text>
                     </TouchableOpacity>
                     <TouchableOpacity style={[styles.actionButton, styles.detailsButton, isActionLoading && styles.disabledButton]} onPress={() => onDetails(item.id)} disabled={isActionLoading}>
                         <Info size={16} color="#475569" />
                         <Text style={styles.detailsButtonText}>Détails</Text>
                     </TouchableOpacity>
                 </View>
             </View>
         </Animated.View>
     );
});


// --- Composant Principal HostBookings ---
export default function HostBookings() {
    const { user, sessionInitialized, isLoadingAuth } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null); // ID de la réservation en cours d'action
    const newStatusRef = useRef<'confirmed' | 'declined' | null>(null);

    // Nouveaux états pour la modale de confirmation
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const [bookingIdToConfirm, setBookingIdToConfirm] = useState<string | null>(null);
    const [statusToConfirm, setStatusToConfirm] = useState<'confirmed' | 'declined' | null>(null);

    const [fontsLoaded, fontError] = useFonts({
         'Montserrat-Bold': Montserrat_700Bold,
         'Montserrat-SemiBold': Montserrat_600SemiBold,
         'Montserrat-Regular': Montserrat_400Regular,
       });

    // --- Charger les réservations (Appel RPC vérifié et correct) ---
    const loadBookings = useCallback(async (isRefresh = false) => {
        if (!user) { setLoadingBookings(false); setBookings([]); if (isRefresh) setRefreshing(false); return; }
        if (!isRefresh) setLoadingBookings(true);
        setBookingsError(null);
        console.log(`🚀 Fetching host bookings for owner: ${user.id} via RPC [get_host_bookings_list_details]`); // OK
        try {
            const { data: rpcData, error: rpcError } = await supabase.rpc(
                'get_host_bookings_list_details', // <-- OK: Ce nom fonctionne
                { p_host_id: user.id }
            );

            if (rpcError) {
                console.error("Supabase RPC error raw object:", rpcError);
                console.error("Supabase RPC error fetching host bookings:", rpcError);
                throw new Error(`Erreur RPC: ${rpcError.message}.`);
            }

            const bookingsData = rpcData.map((item: any) => item.booking_details) as Booking[];
            console.log(`✅ Found ${bookingsData?.length || 0} bookings for host via RPC.`);
            setBookings(bookingsData);

        } catch (err: any) {
            console.error("Error loading host bookings:", err);
            setBookingsError(`Erreur: ${err.message || 'Impossible de charger les réservations.'}`);
            setBookings([]);
        } finally {
            if (!isRefresh) setLoadingBookings(false);
            if (isRefresh) setRefreshing(false);
        }
    }, [user]);

    // useEffect initial (inchangé)
    useEffect(() => {
        if (sessionInitialized && fontsLoaded && !fontError && user) { loadBookings(); }
        else if (sessionInitialized && fontsLoaded && !user) { setLoadingBookings(false); setBookings([]); }
        else if (fontError) { setLoadingBookings(false); setBookingsError("Erreur de chargement des polices."); }
    }, [user, fontsLoaded, fontError, sessionInitialized, loadBookings]);

    // Refresh (inchangé)
    const onRefresh = useCallback(() => { setRefreshing(true); loadBookings(true); }, [loadBookings]);

    // --- Logique Modale ---
    // Fonction pour OUVRIR la modale quand on clique sur Confirmer/Refuser
    const openConfirmationModal = useCallback((bookingId: string, newStatus: 'confirmed' | 'declined') => {
        if (actionLoading) return; // Empêche d'ouvrir si une action est déjà en cours
        setBookingIdToConfirm(bookingId);
        setStatusToConfirm(newStatus);
        setIsConfirmModalVisible(true);
    }, [actionLoading]); // Dépend de actionLoading pour éviter double ouverture

    // Fonction pour FERMER la modale
    const closeConfirmationModal = useCallback(() => {
        // On peut fermer même si une action est en cours, l'action se terminera
        setIsConfirmModalVisible(false);
        // On ne reset les états ici que si l'action n'a pas été lancée (simple fermeture)
        // Le reset après action se fait dans handleConfirmActionInModal
    }, []);

    // --- Fonction pour exécuter l'action APRES confirmation dans la modale ---
    const handleConfirmActionInModal = useCallback(async () => {
        if (!user || !bookingIdToConfirm || !statusToConfirm) {
            console.error("handleConfirmActionInModal: Missing data");
            closeConfirmationModal(); // Ferme au cas où, mais ne devrait pas arriver
            return;
        }

        const currentBooking = bookings.find(b => b.id === bookingIdToConfirm);
        // Pas besoin de vérifier currentBooking ici car on le fait avant la mise à jour DB

        const bookingId = bookingIdToConfirm;
        const newStatus = statusToConfirm;

        // Ferme la modale immédiatement
        setIsConfirmModalVisible(false);
        // Active le spinner pour cet item
        setActionLoading(bookingId);
        newStatusRef.current = newStatus;

        try {
            console.log(`Attempting to update booking ${bookingId} to ${newStatus}`);
            // 1. Mise à jour Booking Status
            const { error: bookingUpdateError } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', bookingId)
                // Optionnel: s'assurer que la réservation est bien 'pending' avant update
                // .eq('status', 'pending')
                ;

            if (bookingUpdateError) {
                console.error("Booking update error:", bookingUpdateError);
                throw new Error(`Erreur MAJ réservation: ${bookingUpdateError.message}`);
            }
            console.log(`Booking ${bookingId} status updated to ${newStatus}.`);

            // 2. Mise à jour Conversation Status (si nécessaire)
            const bookingForConv = bookings.find(b => b.id === bookingId); // Re-find for safety ? ou utiliser currentBooking trouvé avant ? Utilisons currentBooking.
            if (bookingForConv?.conversation) {
                let newConvStatus: string | undefined;
                const currentConvStatus = bookingForConv.conversation.status;

                if (newStatus === 'confirmed' && ['locked', 'pre-message'].includes(currentConvStatus)) {
                    newConvStatus = 'open';
                } else if (newStatus === 'declined' && currentConvStatus !== 'archived') {
                    newConvStatus = 'archived';
                }

                if (newConvStatus) {
                    console.log(`Attempting to update conversation ${bookingForConv.conversation.id} to ${newConvStatus}`);
                    const { error: convUpdateError } = await supabase
                        .from('conversations')
                        .update({ status: newConvStatus })
                        .eq('id', bookingForConv.conversation.id);

                    if (convUpdateError) {
                        // Log l'erreur mais ne bloque pas forcément le succès global
                        console.warn("Could not update conversation status:", convUpdateError);
                    } else {
                        console.log(`Conversation ${bookingForConv.conversation.id} status updated to ${newConvStatus}`);
                    }
                }
            }

            // 3. Recharger les données et afficher succès
            await loadBookings();
            Alert.alert("Succès", `Réservation ${newStatus === 'confirmed' ? 'confirmée' : 'refusée'}.`);

        } catch (err: any) {
            console.error(`Error during booking update process for ${newStatus}:`, err);
            Alert.alert("Erreur", `Échec de la mise à jour: ${err.message || "Veuillez réessayer."}`);
            // Recharger aussi en cas d'erreur pour être sûr que l'UI reflète la DB
            await loadBookings();
        } finally {
            // Reset des états de chargement et d'action
            setActionLoading(null);
            newStatusRef.current = null;
            setBookingIdToConfirm(null); // Important de reset ici
            setStatusToConfirm(null);    // Important de reset ici
        }
    }, [user, loadBookings, bookings, supabase, bookingIdToConfirm, statusToConfirm, closeConfirmationModal]); // Ajout de dépendances


    // Filtrage (inchangé)
    const filteredBookings = useMemo(() => {
        let result = bookings;
        if (activeFilter) result = result.filter(booking => booking.status === activeFilter);
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase().trim();
            result = result.filter(booking =>
                (booking.pool?.title?.toLowerCase().includes(searchLower) || false) ||
                (booking.user_profile?.full_name?.toLowerCase().includes(searchLower) || false)
            );
        }
        return result;
    }, [bookings, activeFilter, searchText]);

    // Fonction renderItem pour FlatList (Modifiée pour passer openConfirmationModal)
    const renderBookingItem = useCallback(({ item, index }: { item: Booking; index: number }) => (
        <BookingItemCard
            item={item}
            index={index}
            onAction={openConfirmationModal} // <-- Utilise la fonction pour ouvrir la modale
            onContact={(conversationId) => router.push({ pathname: '/(tabs)/conversations/[id]', params: { id: conversationId } })}
            onDetails={(bookingId) => router.push(`/host/booking-details/${bookingId}`)}
            actionLoadingId={actionLoading} // Toujours utile pour le spinner sur la carte
            newStatusAction={newStatusRef.current} // Toujours utile pour le spinner sur la carte
        />
    ), [openConfirmationModal, actionLoading, newStatusRef.current]); // Mise à jour dépendances

    // --- Rendu Principal ---
     if (!fontsLoaded || fontError) { return ( <SafeAreaView style={styles.container}><View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /><Text style={styles.loadingText}>{fontError ? "Erreur police" : "Chargement police..."}</Text></View></SafeAreaView>); }
     if (isLoadingAuth || !sessionInitialized) { return ( <SafeAreaView style={styles.container}><View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /><Text style={styles.loadingText}>Vérification session...</Text></View></SafeAreaView>); }
     if (!user) { return ( <SafeAreaView style={styles.container}><Stack.Screen options={{ title: "Réservations", headerShown: false }} /><View style={styles.notLoggedInContainer}><CalendarIcon size={50} color="#cbd5e1" /><Text style={styles.notLoggedInText}>Connectez-vous pour voir vos réservations.</Text><TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/(auth)/sign-in')}><Text style={styles.loginButtonText}>Se connecter</Text></TouchableOpacity></View></SafeAreaView>); }


    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: "Réservations Hôte", headerShown: false }} />
            <FlatList
                // ... (props FlatList inchangées : data, keyExtractor, ListHeader, ListEmpty, refreshControl...)
                  data={filteredBookings}
                 renderItem={renderBookingItem}
                 keyExtractor={(item) => item.id}
                 contentContainerStyle={{ paddingBottom: 20, paddingTop: 0 }}
                 ListHeaderComponent={
                     <>
                         <View style={styles.header}>
                             <View style={styles.headerTop}>
                                 <View><Text style={styles.title}>Réservations Reçues</Text><Text style={styles.subtitle}>Gérez les demandes pour vos piscines</Text></View>
                             </View>
                         </View>
                         <View style={styles.stats}>
                             <View style={styles.statCard}><Text style={styles.statNumber}>{bookings.filter(b=>b.status === 'pending').length}</Text><Text style={styles.statLabel}>En attente</Text></View>
                             <View style={styles.statCard}><Text style={styles.statNumber}>{bookings.filter(b=>b.status === 'confirmed').length}</Text><Text style={styles.statLabel}>Confirmées</Text></View>
                             <View style={styles.statCard}><Text style={styles.statNumber}>{bookings.filter(b=>b.status === 'confirmed' && isValid(parseISO(b.start_time)) && isAfter(parseISO(b.start_time), new Date())).length}</Text><Text style={styles.statLabel}>À venir</Text></View>
                         </View>
                         <View style={styles.searchFilterContainer}>
                             <View style={styles.searchContainer}>
                                 <SearchIcon size={16} color="#64748b" style={styles.searchIcon} />
                                 <TextInput style={styles.searchInput} placeholder="Rechercher annonce ou client..." value={searchText} onChangeText={setSearchText} placeholderTextColor="#94a3b8"/>
                             </View>
                         </View>
                         <View style={styles.filterContainer}>
                             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
                                 <TouchableOpacity style={[styles.filterButton, !activeFilter && styles.filterButtonActive]} onPress={() => setActiveFilter(null)}><Text style={[styles.filterText, !activeFilter && styles.filterTextActive]}>Toutes</Text></TouchableOpacity>
                                 {Object.entries(BOOKING_STATUS_LABELS).map(([status, label]) => (<TouchableOpacity key={status} style={[styles.filterButton, activeFilter === status && styles.filterButtonActive]} onPress={() => setActiveFilter(status)}><Text style={[styles.filterText, activeFilter === status && styles.filterTextActive]}>{label}</Text></TouchableOpacity>))}
                             </ScrollView>
                         </View>
                         {(filteredBookings.length > 0 || (loadingBookings && !refreshing)) && !bookingsError && (
                             <Text style={styles.listTitle}>
                                 {activeFilter ? `Réservations ${BOOKING_STATUS_LABELS[activeFilter]}` : "Toutes les réservations"}
                             </Text>
                         )}
                     </>
                 }
                 ListEmptyComponent={
                     !loadingBookings && !bookingsError && filteredBookings.length === 0 && (
                         <View style={styles.emptyContainer}>
                             <CalendarIcon size={50} color="#cbd5e1" />
                             <Text style={styles.emptyText}>
                                 {searchText ? `Aucun résultat pour "${searchText}".` :
                                  activeFilter ? `Aucune réservation "${BOOKING_STATUS_LABELS[activeFilter]}".` :
                                  "Aucune réservation pour le moment."}
                             </Text>
                         </View>
                     )
                 }
                 refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0891b2']} tintColor="#0891b2" />}
                 ListFooterComponent={<View style={{ height: 20 }} />}
                 ListHeaderComponentStyle={{ paddingHorizontal: 0 }}
            />
            {loadingBookings && !refreshing && bookings.length === 0 && (
                 <View style={styles.globalLoadingIndicator}><ActivityIndicator size="large" color="#0891b2" /></View>
            )}
            {bookingsError && !loadingBookings && (
                 <View style={styles.globalErrorContainer}><AlertCircle size={16} color="#b91c1c" style={{ marginRight: 8 }}/><Text style={styles.errorText}>{bookingsError}</Text></View>
            )}

            {/* --- MODALE DE CONFIRMATION --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isConfirmModalVisible}
                onRequestClose={closeConfirmationModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{statusToConfirm === 'confirmed' ? "Confirmer Réservation ?" : "Refuser Réservation ?"}</Text>
                        <Text style={styles.modalMessage}>Êtes-vous sûr de vouloir {statusToConfirm === 'confirmed' ? 'confirmer' : 'refuser'} cette demande de réservation ?</Text>
                        <View style={styles.modalActions}>
                             <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={closeConfirmationModal} disabled={!!actionLoading}>
                                 <Text style={styles.modalButtonTextCancel}>Annuler</Text>
                             </TouchableOpacity>
                             <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    statusToConfirm === 'confirmed' ? styles.modalButtonConfirm : styles.modalButtonReject,
                                    !!actionLoading && styles.disabledButton // Désactive si une action est en cours (n'importe laquelle)
                                ]}
                                onPress={handleConfirmActionInModal} // Appelle la logique d'action
                                disabled={!!actionLoading} // Désactive si une action est en cours
                             >
                                {/* Affiche un spinner SI l'action en cours concerne CETTE réservation */}
                                {actionLoading === bookingIdToConfirm ? (
                                    <ActivityIndicator size="small" color="#ffffff"/>
                                ) : (
                                    <Text style={statusToConfirm === 'confirmed' ? styles.modalButtonTextConfirm : styles.modalButtonTextReject}>
                                        Oui, {statusToConfirm === 'confirmed' ? 'confirmer' : 'refuser'}
                                    </Text>
                                )}
                             </TouchableOpacity>
                         </View>
                    </View>
                </View>
            </Modal>
            {/* --- Fin de la Modale --- */}

        </SafeAreaView>
    );
}


// --- Styles (Assurez-vous que les styles pour la modale sont présents et corrects) ---
const styles = StyleSheet.create({
    // ... (tous les styles précédents, y compris ceux de la modale ajoutés/vérifiés précédemment) ...
     // Styles pour la Modale (vérifiés/ajoutés précédemment)
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
    modalContent: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, width: '85%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
    modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 10, textAlign: 'center', },
    modalMessage: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#475569', marginBottom: 25, textAlign: 'center', lineHeight: 22, },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, },
    modalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, minHeight: 40, justifyContent: 'center' },
    modalButtonCancel: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', },
    modalButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#475569', },
    modalButtonConfirm: { backgroundColor: '#10b981', borderColor: '#059669', },
    modalButtonTextConfirm: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
    modalButtonReject: { backgroundColor: '#ef4444', borderColor: '#dc2626', },
    modalButtonTextReject: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
    // Styles existants...
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20 },
    loadingText: { marginTop: 12, fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', textAlign: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontFamily: 'Montserrat-Regular', color: '#b91c1c', fontSize: 13, textAlign: 'center' },
    globalLoadingIndicator: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(248, 250, 252, 0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    globalErrorContainer: { position: 'absolute', bottom: Platform.OS === 'ios' ? 30 : 20, left: 16, right: 16, backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca', flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    header: { paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 15 : 10, paddingBottom: 10 },
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    backButton: { marginRight: 12, padding: 8, borderRadius: 20, backgroundColor: '#f1f5f9' }, // Peut-être inutilisé ici mais gardé
    title: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#1e293b' },
    subtitle: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginTop: 2 },
    stats: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
    statCard: { flex: 1, backgroundColor: '#ffffff', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
    statNumber: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#0891b2', marginBottom: 3 },
    statLabel: { fontFamily: 'Montserrat-Regular', fontSize: 11, color: '#64748b', textAlign: 'center' },
    searchFilterContainer: { paddingHorizontal: 16, marginBottom: 8 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e5e7eb', height: 44 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, height: '100%', fontFamily: 'Montserrat-Regular', color: '#1e293b', fontSize: 14 },
    filterContainer: { paddingHorizontal: 16, marginBottom: 16 },
    filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: 'transparent' },
    filterButtonActive: { backgroundColor: '#0891b2', borderColor: '#0891b2', borderWidth: 1 },
    filterText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#475569' },
    filterTextActive: { color: '#ffffff' },
    listTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#334155', marginBottom: 12, paddingHorizontal: 16 },
    bookingCard: { backgroundColor: '#ffffff', borderRadius: 12, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb', elevation: 1, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, marginHorizontal: 16 },
    bookingHeader: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontFamily: 'Montserrat-SemiBold', fontSize: 11, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    tagBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
    tagText: { fontFamily: 'Montserrat-SemiBold', fontSize: 11, color: '#166534' },
    bookingContent: { padding: 12 },
    bookingInfo: { marginBottom: 12 },
    propertyInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    propertyImage: { width: 52, height: 52, borderRadius: 8 },
    placeholderImage: { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
    propertyDetails: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    propertyTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1e293b', marginBottom: 3 },
    propertyLocation: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#64748b' },
    clientInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    clientAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    avatarImage: { width: '100%', height: '100%', borderRadius: 14 },
    clientName: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#334155' },
    guestCountText: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#64748b', marginLeft: 6 },
    dateTimeContainer: { marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
    dateTimeValue: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#334155', flexWrap: 'wrap' },
    priceText: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#0891b2', marginTop: 4, textAlign: 'right' },
    bookingActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12, gap: 8, marginTop: 8 },
    actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 6, borderRadius: 8, gap: 5, minHeight: 38 },
    confirmButton: { backgroundColor: '#10b981' },
    confirmButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#ffffff' },
    declineButton: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca' },
    declineButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#b91c1c' },
    messageButton: { backgroundColor: '#ecfeff', borderWidth: 1, borderColor: '#cffafe' },
    messageButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#0891b2' },
    detailsButton: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
    detailsButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#475569' },
    disabledButton: { opacity: 0.6 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 30, flex: 1 },
    emptyText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 16 },
    notLoggedInContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    notLoggedInText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#475569', textAlign: 'center', marginBottom: 25, lineHeight: 24 },
    loginButton: { backgroundColor: '#0891b2', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8, elevation: 2, shadowColor: '#0891b2', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 } },
    loginButtonText: { fontFamily: 'Montserrat-SemiBold', color: '#ffffff', fontSize: 15 }
});