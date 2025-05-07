// // Dans app/admin/bookings.tsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, RefreshControl, Platform, Alert } from 'react-native'; // Alert retiré de l'import principal car géré différemment
// import { Stack, router } from 'expo-router';
// import { supabase } from '@/lib/supabase'; // Vérifiez chemin
// import { useAuth } from '@/hooks/useAuth'; // Vérifiez chemin
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import { ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react-native';
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';

// // Interface Booking
// interface AdminBooking {
//     id: string;
//     start_time: string;
//     end_time: string;
//     status: string;
//     guest_count: number | null;
//     total_price: number | null;
//     created_at: string;
//     user_id: string;
//     pool_listing_id: string;
//     pool_listings?: { title: string | null } | null;
//     profiles?: { full_name: string | null } | null;
// }

// const PAGE_SIZE = 20;

// export default function AdminBookingsScreen() {
//     const { user: adminUser } = useAuth();
//     const [bookings, setBookings] = useState<AdminBooking[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [refreshing, setRefreshing] = useState(false);
//     const [page, setPage] = useState(0);
//     const [totalCount, setTotalCount] = useState(0);
//     const [loadingMore, setLoadingMore] = useState(false);

//     const [fontsLoaded, fontError] = useFonts({
//         'Montserrat-Bold': Montserrat_700Bold,
//         'Montserrat-SemiBold': Montserrat_600SemiBold,
//         'Montserrat-Regular': Montserrat_400Regular,
//     });

//     // Fonction Fetch
//     const fetchAdminBookings = useCallback(async (pageNum: number, isRefresh = false) => {
//         if (!adminUser) { setError("Admin non authentifié."); setLoading(false); setLoadingMore(false); setRefreshing(false); return; }
//         if (!isRefresh) setLoadingMore(pageNum > 0);
//         if (pageNum === 0 && !isRefresh) setLoading(true);
//         // Ne pas reset l'erreur ici, pour qu'elle reste affichée si besoin
//         // setError(null);

//         const rangeFrom = pageNum * PAGE_SIZE;
//         const rangeTo = rangeFrom + PAGE_SIZE - 1;

//         try {
//             console.log(`🚀 Fetching bookings page ${pageNum}...`);
//             const { data, error: fetchError, count } = await supabase
//                 .from('bookings')
//                 .select(`
//                     *,
//                     pool_listings:pool_listing_id ( title ),
//                     profiles:user_id ( full_name )
//                 `, { count: 'exact' })
//                 .order('start_time', { ascending: false })
//                 .range(rangeFrom, rangeTo);

//             if (fetchError) throw fetchError;

//             console.log(`✅ Bookings page ${pageNum}: Found ${data?.length || 0}. Total: ${count}`);
//             // Si succès, on efface une potentielle erreur précédente
//              setError(null);
//             if (pageNum === 0 || isRefresh) {
//                 setBookings(data || []);
//             } else {
//                  setBookings(data || []); // Remplacer pour pagination simple
//             }
//             setTotalCount(count ?? 0);

//         } catch (err: any) {
//             console.error("Error loading admin bookings:", err);
//             setError(err.message || "Erreur chargement des réservations.");
//             // Ne pas vider bookings si on veut afficher l'erreur au dessus
//         } finally {
//              setLoading(false);
//              setLoadingMore(false);
//              setRefreshing(false);
//         }
//     }, [adminUser]); // Ajouter adminUser comme dépendance

//     // Charger la première page
//     useEffect(() => {
//         if (fontsLoaded && !fontError && adminUser) {
//             fetchAdminBookings(0);
//         } else if (!adminUser && fontsLoaded) {
//              setLoading(false);
//         }
//     }, [fontsLoaded, fontError, adminUser, fetchAdminBookings]);

//      // Recharger quand la page change
//      useEffect(() => {
//         // Recharge seulement si ce n'est pas la page initiale (gérée par l'autre useEffect)
//         // et si les prérequis sont là
//         if (fontsLoaded && !fontError && adminUser && page > 0) {
//              fetchAdminBookings(page);
//         }
//     }, [page]); // Dépend UNIQUEMENT de page pour éviter re-fetch inutiles


//     // Fonctions de pagination
//     const goToNextPage = () => { if ((page + 1) * PAGE_SIZE < totalCount && !loadingMore) { setPage(p => p + 1); } };
//     const goToPrevPage = () => { if (page > 0 && !loadingMore) { setPage(p => p - 1); } };
//     const onRefresh = useCallback(() => { setRefreshing(true); setPage(0); fetchAdminBookings(0, true); }, [fetchAdminBookings]);

//     // Rendu d'un item
//     const renderBookingItem = ({ item }: { item: AdminBooking }) => (
//         <TouchableOpacity style={styles.bookingItem} onPress={() => router.push(`/admin/booking/${item.id}`)}>
//             <Text style={styles.itemTitle}>{item.pool_listings?.title || 'Annonce Inconnue'}</Text>
//              <Text style={styles.itemDetail}>Client: {item.profiles?.full_name || `ID: ${item.user_id.substring(0,8)}...`}</Text>
//              <Text style={styles.itemDetail}>Date: {format(new Date(item.start_time), 'dd/MM/yy HH:mm', { locale: fr })} - {format(new Date(item.end_time), 'HH:mm', { locale: fr })}</Text>
//              <Text style={styles.itemDetail}>Invités: {item.guest_count ?? 'N/A'}, Prix: {item.total_price ?? 'N/A'} MAD</Text>
//              <Text style={styles.itemDetail}>Statut: <Text style={getStatusStyle(item.status)}>{item.status || 'N/A'}</Text></Text>
//              <Text style={[styles.itemDetail, {fontSize: 11, color: '#9ca3af'}]}>Créée le: {new Date(item.created_at).toLocaleDateString('fr-FR')}</Text>
//         </TouchableOpacity>
//     );

//     // Helper style statut
//     function getStatusStyle(status: string | null | undefined) { switch (status?.toLowerCase()) { case 'confirmed': return styles.statusConfirmed; case 'pending': return styles.statusPending; case 'cancelled': return styles.statusCancelled; default: return {}; } }

//     // --- Rendu ---
//     if (loading && page === 0 && !refreshing) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
//     if (!fontsLoaded && !fontError) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
//     if (fontError) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
//     // Vérifier si adminUser existe avant de rendre le contenu principal
//      if (!adminUser) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Veuillez vous connecter avec un compte admin.</Text></SafeAreaView>; }


//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ title: 'Toutes les Réservations' }} />

//             {/* === BANNIÈRE D'ERREUR (Remplace Alert.alert) === */}
//             {error && (
//                 <View style={styles.errorBanner}>
//                     <Text style={styles.errorBannerText}>{error}</Text>
//                     <TouchableOpacity onPress={() => fetchAdminBookings(page)} style={styles.retryIcon}>
//                         <RefreshCcw size={16} color="#b91c1c" />
//                     </TouchableOpacity>
//                 </View>
//             )}
//             {/* ================================================ */}

//             {/* TODO: Ajouter Barre de Recherche/Filtres ici plus tard */}
//              <View style={styles.filterPlaceholder}>
//                 <Text style={styles.filterPlaceholderText}>Recherche / Filtres (à venir)</Text>
//              </View>


//             <FlatList
//                 data={bookings}
//                 renderItem={renderBookingItem}
//                 keyExtractor={(item) => item.id}
//                 contentContainerStyle={styles.listContainer}
//                 ListEmptyComponent={ !loading ? <Text style={styles.emptyText}>Aucune réservation trouvée.</Text> : null }
//                 refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0891b2']} tintColor={'#0891b2'} /> }
//                 ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
//             />

//             {/* Contrôles de Pagination */}
//              {(totalCount > PAGE_SIZE) && (
//                  <View style={styles.paginationContainer}>
//                     <TouchableOpacity style={[styles.paginationButton, page === 0 && styles.paginationButtonDisabled]} onPress={goToPrevPage} disabled={page === 0 || loadingMore}>
//                         <ChevronLeft size={20} color={page === 0 ? '#9ca3af' : '#0891b2'} />
//                         <Text style={[styles.paginationButtonText, page === 0 && styles.paginationButtonTextDisabled]}>Préc.</Text>
//                     </TouchableOpacity>
//                     <Text style={styles.paginationText}>Page {page + 1} / {Math.ceil(totalCount / PAGE_SIZE)}</Text>
//                     <TouchableOpacity style={[styles.paginationButton, (page + 1) * PAGE_SIZE >= totalCount && styles.paginationButtonDisabled]} onPress={goToNextPage} disabled={(page + 1) * PAGE_SIZE >= totalCount || loadingMore}>
//                         <Text style={[styles.paginationButtonText, (page + 1) * PAGE_SIZE >= totalCount && styles.paginationButtonTextDisabled]}>Suiv.</Text>
//                         <ChevronRight size={20} color={(page + 1) * PAGE_SIZE >= totalCount ? '#9ca3af' : '#0891b2'} />
//                     </TouchableOpacity>
//                 </View>
//             )}
//         </SafeAreaView>
//     );
// }

// // --- Styles ---
// const styles = StyleSheet.create({
//      container: { flex: 1, backgroundColor: '#f8fafc' },
//      loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//      errorText: { fontFamily: 'Montserrat-Regular', color: '#b91c1c', fontSize: 16, textAlign: 'center', padding: 20 },
//      // Styles pour la bannière d'erreur (similaire à manage-listings)
//      errorBanner: { backgroundColor: '#fee2e2', paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#fecaca' },
//      errorBannerText: { color: '#b91c1c', fontFamily: 'Montserrat-Regular', fontSize: 13, flexShrink: 1, marginRight: 10 },
//      retryIcon: { padding: 4 },
//      filterPlaceholder: { padding: 16, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#d1d5db' },
//      filterPlaceholderText: { fontFamily: 'Montserrat-Regular', color: '#6b7280', fontSize: 14 },
//      listContainer: { padding: 16, flexGrow: 1 },
//      bookingItem: { backgroundColor: '#ffffff', borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', gap: 6, boxShadowColor: "#000", boxShadowOffset: { width: 0, height: 1 }, boxShadowOpacity: 0.05, boxShadowRadius: 2, elevation: 1 },
//      itemTitle: { fontFamily: 'Montserrat-Bold', fontSize: 15, color: '#111827', marginBottom: 4 },
//      itemDetail: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#4b5563', lineHeight: 18 },
//      bookingValueUserId: {fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#6b7280'}, // Police normale pour ID user
//      statusConfirmed: { color: '#10b981', fontFamily: 'Montserrat-SemiBold' },
//      statusPending: { color: '#f59e0b', fontFamily: 'Montserrat-SemiBold' },
//      statusCancelled: { color: '#6b7280', fontFamily: 'Montserrat-Regular' },
//      emptyText: { textAlign: 'center', marginTop: 50, fontFamily: 'Montserrat-Regular', color: '#6b7280', fontSize: 16 },
//      paginationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#ffffff' },
//      paginationButton: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 4 },
//      paginationButtonDisabled: { opacity: 0.4 },
//      paginationButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#0891b2' },
//      paginationButtonTextDisabled: { color: '#9ca3af' },
//      paginationText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#374151' },
//      header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'web' ? 12 : 50, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }, // Pour fallback erreur
//      backButton: { padding: 8, marginRight: 8 }, // Pour fallback erreur
//      headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#111827', flex: 1, textAlign: 'center'}, // Pour fallback erreur
//      errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }, // Pour fallback erreur
//      buttonLink: { marginTop: 15, paddingVertical: 10 }, // Pour fallback erreur
//      buttonLinkText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2', textAlign: 'center' }, // Pour fallback erreur
//      listLoadingIndicator: { marginVertical: 20 }
// });
// Dans app/admin/bookings.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, RefreshControl, Platform, TextInput } from 'react-native'; // TextInput ajouté
import { Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase'; // Vérifiez chemin
import { useAuth } from '@/hooks/useAuth'; // Vérifiez chemin
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { ChevronLeft, ChevronRight, RefreshCcw, Search as SearchIcon, X as XIcon, Calendar } from 'lucide-react-native'; // Ajout d'icônes
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDebounce } from '@/hooks/useDebounce'; // Import Debounce
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Import Date Picker

// --- DÉFINITION DES ONGLETS ---
const BOOKING_TABS = [
    { key: 'upcoming', label: 'À Venir', statusFilter: 'upcoming' }, // Clé utilisée pour le param RPC
    { key: 'pending', label: 'En Attente', statusFilter: 'pending' },
    { key: 'past', label: 'Terminées', statusFilter: 'past' },
    { key: 'cancelled', label: 'Annulées', statusFilter: 'cancelled' },
] as const;
type BookingTabKey = typeof BOOKING_TABS[number]['key'];
// -----------------------------

// Interface Booking (adaptée à la vue et logique)
interface AdminBooking {
    id: string; start_time: string; end_time: string; status: string; guest_count: number | null; total_price: number | null; created_at: string; user_id: string; listing_id: string;
    listing_title?: string | null; user_full_name?: string | null; user_email?: string | null; user_avatar_url?: string | null; // Champs de la vue
    total_records?: number; // Ajouté pour la pagination retournée par RPC
}

const PAGE_SIZE = 20;

export default function AdminBookingsScreen() {
    const { user: adminUser } = useAuth();
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeTabKey, setActiveTabKey] = useState<BookingTabKey>('upcoming');

    // États pour Filtres/Recherche
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);

    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // Fonction Fetch (utilise la fonction RPC search_admin_bookings)
    const fetchAdminBookings = useCallback(async (pageNum: number, tabKey: BookingTabKey, currentSearch: string, currentStart: Date | null, currentEnd: Date | null, isRefresh = false) => {
        if (!adminUser) return;
        if (!isRefresh) setLoadingMore(pageNum > 0);
        if (pageNum === 0 && !isRefresh) setLoading(true);
        setError(null);

        const rpcParams = {
             p_search_text: currentSearch || '',
             p_status_filter: tabKey, // Utilise la clé de l'onglet comme filtre statut
             p_start_date: currentStart?.toISOString() || null,
             p_end_date: currentEnd?.toISOString() || null,
             p_page: pageNum,
             p_page_size: PAGE_SIZE
             // Ajouter p_listing_id, p_user_id si/quand ces filtres sont ajoutés
        };

        try {
            console.log(`🚀 Calling RPC search_admin_bookings with params:`, rpcParams);
            const { data, error: rpcError } = await supabase.rpc('search_admin_bookings', rpcParams);

            if (rpcError) throw rpcError;

            const results = data as AdminBooking[] || []; // La RPC retourne directement les bons champs + total_records
            const count = results.length > 0 ? results[0].total_records ?? 0 : 0; // Prendre le compte total

            console.log(`✅ RPC bookings page ${pageNum} (Tab: ${tabKey}): Found ${results.length}. Total: ${count}`);
            setError(null);

            // S'assurer que les données sont bien typées (enlève total_records pour le state)
             const bookingsData = results.map(({ total_records, ...rest }) => rest);

            if (pageNum === 0 || isRefresh) {
                setBookings(bookingsData);
            } else {
                 setBookings(bookingsData); // Remplacer pour pagination simple
            }
            setTotalCount(count);

        } catch (err: any) { console.error("Error calling search_admin_bookings RPC:", err); setError(err.message || "Erreur chargement réservations."); }
        finally { setLoading(false); setLoadingMore(false); setRefreshing(false); }
    }, [adminUser]);


    // useEffect principal pour charger/recharger en fonction des filtres/onglet
    useEffect(() => {
        if (fontsLoaded && !fontError && adminUser) {
            // Reset à la page 0 quand un filtre change avant de fetcher
             setPage(0);
             fetchAdminBookings(0, activeTabKey, debouncedSearchTerm, startDate, endDate);
        }
    // Dépend de tous les filtres appliqués et de l'onglet actif
    }, [fontsLoaded, fontError, adminUser, fetchAdminBookings, activeTabKey, debouncedSearchTerm, startDate, endDate]);

     // useEffect pour la pagination (inchangé)
     useEffect(() => {
         if (!loading && !loadingMore && fontsLoaded && !fontError && adminUser && page > 0) {
             fetchAdminBookings(page, activeTabKey, debouncedSearchTerm, startDate, endDate);
         }
     }, [page]); // Ne dépend que de la page

    // Fonctions pagination (inchangées)
    const goToNextPage = () => { if (!loadingMore && (page + 1) * PAGE_SIZE < totalCount) { setPage(p => p + 1); } };
    const goToPrevPage = () => { if (!loadingMore && page > 0) { setPage(p => p - 1); } };
    // Refresh: recharge page 0 de l'onglet actuel avec filtres actuels
    const onRefresh = useCallback(() => { setRefreshing(true); setPage(0); fetchAdminBookings(0, activeTabKey, debouncedSearchTerm, startDate, endDate, true); }, [fetchAdminBookings, activeTabKey, debouncedSearchTerm, startDate, endDate]);

    // Fonctions pour pickers date (inchangées, modifient état principal)
    const showStartDatePicker = () => setStartDatePickerVisibility(true);
    const hideStartDatePicker = () => setStartDatePickerVisibility(false);
    const handleStartDateConfirm = (date: Date) => { setStartDate(date); hideStartDatePicker(); if (endDate && date > endDate) setEndDate(null); setPage(0); /* Reset page */ };
    const showEndDatePicker = () => setEndDatePickerVisibility(true);
    const hideEndDatePicker = () => setEndDatePickerVisibility(false);
    const handleEndDateConfirm = (date: Date) => { setEndDate(date); hideEndDatePicker(); setPage(0); /* Reset page */ };

    // Effacer filtres texte et date
     const clearTextDateFilters = () => { setSearchTerm(''); setStartDate(null); setEndDate(null); setPage(0); /* Reset page */ };
     const textDateFiltersAreActive = searchTerm || startDate || endDate;

    // Rendu item (inchangé)
    const renderBookingItem = ({ item }: { item: AdminBooking }) => ( <TouchableOpacity style={styles.bookingItem} onPress={() => router.push(`/admin/booking/${item.id}`)}> <Text style={styles.itemTitle}>{item.listing_title || 'Annonce Inconnue'}</Text><Text style={styles.itemDetail}>Client: {item.user_full_name || `ID: ${item.user_id.substring(0,8)}...`}</Text><Text style={styles.itemDetail}>Date: {format(new Date(item.start_time), 'dd/MM/yy HH:mm', { locale: fr })} - {format(new Date(item.end_time), 'HH:mm', { locale: fr })}</Text><Text style={styles.itemDetail}>Invités: {item.guest_count ?? 'N/A'}, Prix: {item.total_price ?? 'N/A'} MAD</Text><Text style={styles.itemDetail}>Statut: <Text style={getStatusStyle(item.status)}>{item.status || 'N/A'}</Text></Text><Text style={[styles.itemDetail, styles.createdAtText]}>Créée le: {new Date(item.created_at).toLocaleDateString('fr-FR')}</Text> </TouchableOpacity> );
    // Helper style statut (inchangé)
    function getStatusStyle(status: string | null | undefined) { /* ... */ switch (status?.toLowerCase()) { case 'confirmed': return styles.statusConfirmed; case 'pending': return styles.statusPending; case 'completed': return styles.statusCompleted; case 'cancelled': return styles.statusCancelled; default: return {}; } }

    // --- Rendu ---
    if (!fontsLoaded && !fontError) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
    if (fontError) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
    if (!adminUser && !loading) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Accès admin requis.</Text></SafeAreaView>; }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Gestion des Réservations' }} />

            {/* Bannière Erreur */}
            {error && ( <View style={styles.errorBanner}><Text style={styles.errorBannerText}>{error}</Text><TouchableOpacity onPress={() => fetchAdminBookings(page, activeTabKey, debouncedSearchTerm, startDate, endDate)} style={styles.retryIcon}><RefreshCcw size={16} color="#b91c1c" /></TouchableOpacity></View> )}

            {/* Zone Filtres/Recherche */}
            <View style={styles.controlsContainer}>
                <View style={styles.searchBarContainer}>
                     <SearchIcon size={20} color="#6b7280" style={styles.searchIcon}/>
                     <TextInput style={styles.searchInput} placeholder="Chercher client, annonce..." value={searchTerm} onChangeText={setSearchTerm} autoCapitalize="none" autoCorrect={false} placeholderTextColor="#9ca3af" />
                     {searchTerm ? ( <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearSearchButton}><XIcon size={18} color="#6b7280" /></TouchableOpacity> ) : null}
                </View>
                <View style={styles.dateFilterContainer}>
                    <TouchableOpacity onPress={showStartDatePicker} style={styles.dateButton}> <Calendar size={16} color="#374151" /> <Text style={styles.dateButtonText}>{startDate ? format(startDate, 'dd/MM/yy') : 'Date début'}</Text> </TouchableOpacity>
                    <TouchableOpacity onPress={showEndDatePicker} style={styles.dateButton}> <Calendar size={16} color="#374151" /> <Text style={styles.dateButtonText}>{endDate ? format(endDate, 'dd/MM/yy') : 'Date fin'}</Text> </TouchableOpacity>
                </View>
                 {textDateFiltersAreActive && ( <TouchableOpacity onPress={clearTextDateFilters} style={styles.clearFiltersButton}><Text style={styles.clearFiltersButtonText}>Effacer Filtres</Text></TouchableOpacity> )}
            </View>

            {/* Modales DateTimePicker */}
            <DateTimePickerModal isVisible={isStartDatePickerVisible} mode="date" onConfirm={handleStartDateConfirm} onCancel={hideStartDatePicker} locale="fr-FR" maximumDate={endDate || undefined} date={startDate || new Date()}/>
            <DateTimePickerModal isVisible={isEndDatePickerVisible} mode="date" onConfirm={handleEndDateConfirm} onCancel={hideEndDatePicker} locale="fr-FR" minimumDate={startDate || undefined} date={endDate || new Date()}/>

            {/* Barre d'onglets */}
            <View style={styles.tabBar}>
                 {BOOKING_TABS.map((tab) => ( <TouchableOpacity key={tab.key} style={[ styles.tabItem, activeTabKey === tab.key && styles.tabItemActive ]} onPress={() => { if (activeTabKey !== tab.key && !loading) { setActiveTabKey(tab.key); setPage(0); setBookings([]); setLoading(true); } }} disabled={loading} > <Text style={[ styles.tabLabel, activeTabKey === tab.key && styles.tabLabelActive ]}> {tab.label} </Text> </TouchableOpacity> ))}
            </View>

            {/* Loader principal OU Liste */}
             {(loading && page === 0 && !refreshing) ? ( <ActivityIndicator size="large" color="#0891b2" style={styles.mainLoader} /> )
             : ( <FlatList data={bookings} renderItem={renderBookingItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContainer} ListEmptyComponent={ !loadingMore ? <View style={styles.emptyContainer}><Text style={styles.emptyText}>Aucune réservation ne correspond.</Text></View> : null } refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0891b2']} tintColor={'#0891b2'} /> } ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.listLoadingIndicator} /> : null} /> )}

            {/* Contrôles de Pagination */}
             {(!loading || page > 0) && totalCount > PAGE_SIZE && ( <View style={styles.paginationContainer}> <TouchableOpacity style={[styles.paginationButton, page === 0 && styles.paginationButtonDisabled]} onPress={goToPrevPage} disabled={page === 0 || loadingMore || loading}> <ChevronLeft size={20} color={page === 0 ? '#9ca3af' : '#0891b2'} /> <Text style={[styles.paginationButtonText, page === 0 && styles.paginationButtonTextDisabled]}>Préc.</Text> </TouchableOpacity> <Text style={styles.paginationText}>Page {page + 1} / {Math.ceil(totalCount / PAGE_SIZE)}</Text> <TouchableOpacity style={[styles.paginationButton, (page + 1) * PAGE_SIZE >= totalCount && styles.paginationButtonDisabled]} onPress={goToNextPage} disabled={(page + 1) * PAGE_SIZE >= totalCount || loadingMore || loading}> <Text style={[styles.paginationButtonText, (page + 1) * PAGE_SIZE >= totalCount && styles.paginationButtonTextDisabled]}>Suiv.</Text> <ChevronRight size={20} color={(page + 1) * PAGE_SIZE >= totalCount ? '#9ca3af' : '#0891b2'} /> </TouchableOpacity> </View> )}
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    mainLoader: { flex: 1, justifyContent: 'center', alignItems: 'center'}, // Style pour centrer loader principal
    errorText: { fontFamily: 'Montserrat-Regular', color: '#b91c1c', fontSize: 16, textAlign: 'center', padding: 20 },
    errorBanner: { backgroundColor: '#fee2e2', paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#fecaca' },
    errorBannerText: { color: '#b91c1c', fontFamily: 'Montserrat-Regular', fontSize: 13, flexShrink: 1, marginRight: 10 },
    retryIcon: { padding: 4 },
    // Styles pour la zone de contrôles (Recherche + Dates)
     controlsContainer: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 5, // Moins d'espace en bas avant les onglets
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        gap: 10, // Espace entre recherche et dates
    },
    searchBarContainer: {
         flexDirection: 'row',
         alignItems: 'center',
         backgroundColor: '#f1f5f9',
         borderRadius: 8,
         paddingHorizontal: 10,
         height: 44,
     },
     searchIcon: {
         marginRight: 8,
     },
     searchInput: {
        flex: 1,
        fontFamily: 'Montserrat-Regular',
        fontSize: 15,
        color: '#1e293b',
        height: '100%',
    },
     clearSearchButton: {
        padding: 4,
        marginLeft: 4,
     },
    dateFilterContainer: {
         flexDirection: 'row',
         gap: 10,
    },
    dateButton: {
        flex: 1, // Pour partager l'espace
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Centrer contenu
        gap: 6,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        height: 40, // Un peu moins haut
        paddingHorizontal: 10,
    },
    dateButtonText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 13, // Plus petit
        color: '#374151',
    },
     clearFiltersButton: {
         alignSelf: 'flex-end',
         paddingVertical: 4,
     },
      clearFiltersButtonText: {
         fontFamily: 'Montserrat-Regular',
         fontSize: 12,
         color: '#0891b2',
         textDecorationLine: 'underline',
     },
    // Styles TabBar (identiques à manage-listings)
    tabBar: { flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', boxShadow: "#000", boxShadow: { width: 0, height: 1 }, boxShadow: 0.05, boxShadow: 2, elevation: 1 },
    tabItem: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabItemActive: { borderBottomColor: '#0891b2' },
    tabLabel: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#6b7280', textAlign: 'center' },
    tabLabelActive: { fontFamily: 'Montserrat-SemiBold', color: '#0891b2' },
    // Styles Liste et Items
    listContainer: { padding: 16, flexGrow: 1 },
    bookingItem: { backgroundColor: '#ffffff', borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', gap: 6, boxShadow: "#000", boxShadow: { width: 0, height: 1 }, boxShadow: 0.05, boxShadow: 2, elevation: 1 },
    itemTitle: { fontFamily: 'Montserrat-Bold', fontSize: 15, color: '#111827', marginBottom: 4 },
    itemDetail: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#4b5563', lineHeight: 18 },
    bookingValueUserId: {fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#6b7280'},
    createdAtText: {fontSize: 11, color: '#9ca3af', marginTop: 4},
    statusConfirmed: { color: '#10b981', fontFamily: 'Montserrat-SemiBold' },
    statusPending: { color: '#f59e0b', fontFamily: 'Montserrat-SemiBold' },
    statusCancelled: { color: '#6b7280', fontFamily: 'Montserrat-SemiBold' },
    statusCompleted: { color: '#374151', fontFamily: 'Montserrat-SemiBold' },
    emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { textAlign: 'center', fontFamily: 'Montserrat-Regular', color: '#6b7280', fontSize: 16 },
    paginationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#ffffff' },
    paginationButton: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 4 },
    paginationButtonDisabled: { opacity: 0.4 },
    paginationButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#0891b2' },
    paginationButtonTextDisabled: { color: '#9ca3af' },
    paginationText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#374151' },
    listLoadingIndicator: { marginVertical: 20 },
    // Styles Fallback Erreur
     header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'web' ? 12 : 50, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
     backButton: { padding: 8, },
     headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#111827', flex: 1, textAlign: 'center', marginRight: 40 },
     buttonLink: { marginTop: 15, paddingVertical: 10 },
     buttonLinkText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2', textAlign: 'center' },
});