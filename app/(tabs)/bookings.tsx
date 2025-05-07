
// Dans app/(tabs)/bookings.tsx
// Écran permettant aux nageurs de voir leurs réservations
// VERSION OPTIMISÉE: Utilise une fonction PostgreSQL pour récupérer les données

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Platform,
    Image, ActivityIndicator, RefreshControl, SafeAreaView, Alert, ScrollView,
    Modal
} from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular, Montserrat_500Medium } from '@expo-google-fonts/montserrat';
import {
    CheckCircle2, XCircle, MessageCircle, Clock, User, Calendar as CalendarIcon,
    ChevronRight, RefreshCcw, AlertCircle, Info, Filter, Search as SearchIcon,
    Users, ArrowRight, MapPin
} from 'lucide-react-native';
import { router, Stack, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Animated, { FadeIn, FadeInRight, interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { format, parseISO, isAfter, isBefore, isToday, differenceInHours, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';

// --- Interfaces ---
interface SwimmerBookingPoolImage { url: string; position?: number | null; }
interface SwimmerBookingPoolListing {
    id: string;
    title: string;
    location: string | null;
    pool_images: SwimmerBookingPoolImage[] | null;
}
interface SwimmerBookingConversation { id: string; status: string; }
interface SwimmerBooking {
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    total_price: number;
    created_at: string;
    guest_count: number;
    listing_id: string;
    listing?: SwimmerBookingPoolListing | null;
    conversation?: SwimmerBookingConversation | null;
}

// --- Constantes ---
const BOOKING_STATUS_COLORS: Record<string, string> = { pending: '#fffbeb', confirmed: '#f0fdf4', completed: '#f0f9ff', canceled: '#f8fafc', declined: '#fef2f2' };
const BOOKING_STATUS_BACKGROUNDS: Record<string, string[]> = { pending: ['#ffedd5', '#fdba74'], confirmed: ['#dcfce7', '#86efac'], completed: ['#e0f2fe', '#7dd3fc'], canceled: ['#f8fafc', '#e2e8f0'], declined: ['#fee2e2', '#fca5a5'] };
const BOOKING_STATUS_TEXT_COLORS: Record<string, string> = { pending: '#b45309', confirmed: '#15803d', completed: '#075985', canceled: '#475569', declined: '#b91c1c' };
const BOOKING_STATUS_LABELS: Record<string, string> = { pending: 'En attente', confirmed: 'Confirmée', completed: 'Terminée', canceled: 'Annulée', declined: 'Refusée' };
const FILTERS = [ { key: null, label: 'Toutes', icon: () => <Filter size={16} color="#475569" /> }, { key: 'pending', label: 'En attente', icon: () => <Clock size={16} color="#f59e0b" /> }, { key: 'confirmed', label: 'Confirmées', icon: () => <CheckCircle2 size={16} color="#22c55e" /> }, { key: 'completed', label: 'Terminées', icon: () => <CalendarIcon size={16} color="#0ea5e9" /> }, { key: 'canceled', label: 'Annulées', icon: () => <XCircle size={16} color="#94a3b8" /> }, { key: 'declined', label: 'Refusées', icon: () => <XCircle size={16} color="#ef4444" /> } ];

export default function SwimmerBookingsScreen() {
    const { user, sessionInitialized, isLoading: isLoadingAuth, userRoles } = useAuth();
    const [bookings, setBookings] = useState<SwimmerBooking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(null);

    const [fontsLoaded, fontError] = useFonts({
         'Montserrat-Bold': Montserrat_700Bold,
         'Montserrat-SemiBold': Montserrat_600SemiBold,
         'Montserrat-Medium': Montserrat_500Medium,
         'Montserrat-Regular': Montserrat_400Regular,
     });

     // Animations
     const headerOpacity = useSharedValue(0);
     const bookingsOpacity = useSharedValue(0);
     const headerAnimatedStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value, transform: [{ translateY: interpolate(headerOpacity.value, [0, 1], [-20, 0]) }] }));
     const bookingsAnimatedStyle = useAnimatedStyle(() => ({ opacity: bookingsOpacity.value }));
     useEffect(() => { if (fontsLoaded && !loadingBookings && !isLoadingAuth) { headerOpacity.value = withTiming(1, { duration: 500 }); bookingsOpacity.value = withTiming(1, { duration: 700 }); } }, [fontsLoaded, loadingBookings, isLoadingAuth]);

    // Vérification du rôle et redirection
    const isHost = useMemo(() =>
        user && (userRoles || []).some(role => ['host', 'hostpro'].includes(role)),
        [user, userRoles]
    );

    useFocusEffect(
        useCallback(() => {
            if (!sessionInitialized || isLoadingAuth) {
                 console.log("[SwimmerBookingsScreen Focus] Attente init auth...");
                 return;
            }

            if (user && isHost) {
                 console.log("[SwimmerBookingsScreen Focus] Utilisateur est hôte, redirection...");
                 router.replace('/(tabs)/host/dashboard/bookings');
             } else if (user && !isHost) {
                 console.log("[SwimmerBookingsScreen Focus] Utilisateur est nageur, chargement réservations...");
                 if(bookings.length === 0 || !isInitialLoadTriggered.current) {
                     loadBookings();
                     isInitialLoadTriggered.current = true;
                 }
             } else {
                 console.log("[SwimmerBookingsScreen Focus] Utilisateur non connecté ou rôle indéterminé.");
                 setBookings([]);
                 setLoadingBookings(false);
             }
        }, [user, sessionInitialized, isLoadingAuth, isHost, userRoles, router, bookings.length])
    );
    const isInitialLoadTriggered = useRef(false);

    // --- Charger les réservations de l'utilisateur (NAGEUR) avec la fonction Postgres ---
    const loadBookings = useCallback(async (isRefresh = false) => {
        if (!user || isHost) {
            setBookings([]);
            setLoadingBookings(false);
            if (isRefresh) setRefreshing(false);
            console.log("[loadBookings] Ignoré: Utilisateur hôte ou non connecté.");
            return;
        }
        
        if (!isRefresh) setLoadingBookings(true);
        setBookingsError(null);
        console.log(`🚀 Chargement réservations pour nageur: ${user.id}`);
        
        try {
            // Appel de la fonction PostgreSQL
            const { data, error } = await supabase.rpc('get_swimmer_bookings');

            if (error) {
                console.error("Erreur Supabase chargement réservations nageur:", error);
                throw new Error(`Erreur Supabase: ${error.message}.`);
            }
            
            console.log(`✅ Trouvé ${data?.length || 0} réservations pour nageur.`);
            setBookings(data || []);
        } catch (err: any) {
            console.error("Erreur chargement réservations nageur:", err);
            setBookingsError(`Erreur: ${err.message || 'Impossible de charger vos réservations.'}`);
            setBookings([]);
        } finally {
            if (!isRefresh) setLoadingBookings(false);
            if (isRefresh) setRefreshing(false);
        }
    }, [user, isHost]);

    // --- Effets ---
     useEffect(() => {
         if (sessionInitialized && !user) {
             setLoadingBookings(false);
             setBookings([]);
             isInitialLoadTriggered.current = false;
         }
     }, [sessionInitialized, user]);

    // Refresh
    const onRefresh = useCallback(() => { 
        setRefreshing(true); 
        if (user && !isHost) { 
            loadBookings(true); 
        } else { 
            setRefreshing(false); 
        } 
    }, [loadBookings, user, isHost]);

    // Filtrage
    const filteredBookings = useMemo(() => { 
        if (!activeFilter) return bookings; 
        return bookings.filter(booking => booking.status === activeFilter); 
    }, [bookings, activeFilter]);

    // Stats
    const bookingsStats = useMemo(() => ({ 
        total: bookings.length, 
        upcoming: bookings.filter(b => { 
            try { 
                return isAfter(parseISO(b.start_time), new Date()) && ['pending', 'confirmed'].includes(b.status); 
            } catch { 
                return false; 
            } 
        }).length, 
        completed: bookings.filter(b => b.status === 'completed').length 
    }), [bookings]);

    // Annulation
    const handleOpenCancelModal = useCallback((bookingId: string) => { 
        setBookingToCancelId(bookingId); 
        setIsCancelModalVisible(true); 
    }, []);
    
    const confirmCancellation = useCallback(async () => { 
        if (!user || !bookingToCancelId) return; 
        setIsCancelModalVisible(false); 
        setActionLoading(bookingToCancelId); 
        try { 
            const { error: updateError } = await supabase
                .from('bookings')
                .update({ status: 'canceled' })
                .eq('id', bookingToCancelId)
                .eq('user_id', user.id); 
                
            if (updateError) throw updateError; 
            await loadBookings(true);
            Alert.alert("Annulation confirmée", "Votre réservation a été annulée."); 
        } catch (err: any) { 
            console.error("Error cancelling booking:", err); 
            Alert.alert("Erreur", `Impossible d'annuler : ${err.message || 'Erreur inconnue'}`); 
        } finally { 
            setActionLoading(null); 
            setBookingToCancelId(null); 
        } 
    }, [user, bookingToCancelId, loadBookings]);

    // --- Rendu d'un item de réservation ---
    const renderBookingItem = useCallback(({ item, index }: { item: SwimmerBooking, index: number }) => {
        try {
            // Validation des dates
            if (!item.start_time || !item.end_time) { 
                return <View style={styles.bookingCard}><Text style={styles.errorTextSmall}>Données invalides</Text></View>; 
            }
            let startDate, endDate;
            try { 
                startDate = parseISO(item.start_time); 
                endDate = parseISO(item.end_time); 
            } catch (err) { 
                console.error("Erreur parse date pour item", item.id, err); 
                return <View style={styles.bookingCard}><Text style={styles.errorTextSmall}>Date invalide pour résa {item.id}</Text></View>; 
            }
            if (!isValid(startDate) || !isValid(endDate)) { 
                return <View style={styles.bookingCard}><Text style={styles.errorTextSmall}>Date invalide pour résa {item.id}</Text></View>; 
            }

            // Formatage
            let formattedStart = format(startDate, "HH'h'mm", { locale: fr });
            let formattedEnd = format(endDate, "HH'h'mm", { locale: fr });
            let formattedDay = format(startDate, 'EEEE d MMMM yyyy', { locale: fr });
            formattedDay = formattedDay.charAt(0).toUpperCase() + formattedDay.slice(1);
            let durationHours = differenceInHours(endDate, startDate);

            // Styles et labels status
            const statusColor = BOOKING_STATUS_COLORS[item.status] || '#f8fafc';
            const statusBg = BOOKING_STATUS_BACKGROUNDS[item.status] || ['#f1f5f9', '#e2e8f0'];
            const statusTextColor = BOOKING_STATUS_TEXT_COLORS[item.status] || '#64748b';
            const statusLabel = BOOKING_STATUS_LABELS[item.status] || item.status;

            // Accès aux données du listing
            const coverImage = item.listing?.pool_images?.[0]?.url || null;
            const listingTitle = item.listing?.title || "Piscine inconnue";
            const listingLocation = item.listing?.location;

            // Autres variables
            const formattedPrice = `${item.total_price?.toFixed(0) ?? 'N/A'} MAD`;
            const now = new Date();
            const canCancel = ['pending', 'confirmed'].includes(item.status) && isAfter(startDate, now);
            const canContact = item.conversation != null && ['pending', 'confirmed'].includes(item.status) && item.conversation.status !== 'archived';
            const isItemActionLoading = actionLoading === item.id;
            const isUpcoming = isAfter(startDate, now) && item.status === 'confirmed';
            const isPast = isBefore(endDate, now) && (item.status === 'completed');
            const isTodayBooking = format(startDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && item.status === 'confirmed';

            return (
                <Animated.View entering={FadeInRight.delay(index * 100).duration(400).springify()} style={[styles.bookingCard, { backgroundColor: statusColor }]}>
                    {/* Header avec image et titre */}
                    <View style={styles.cardHeader}>
                        {coverImage ? (
                            <Image source={{ uri: coverImage }} style={styles.propertyImage} resizeMode="cover" />
                        ) : (
                            <View style={[styles.propertyImage, styles.placeholderImage]}>
                                <CalendarIcon size={28} color="#9ca3af" />
                            </View>
                        )}
                        <View style={styles.cardHeaderOverlay}>
                            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.headerGradient}/>
                            <View style={styles.headerContent}>
                                <View style={styles.headerLeftContent}>
                                    <Text style={styles.propertyTitle} numberOfLines={1}>{listingTitle}</Text>
                                    {listingLocation && (
                                        <View style={styles.locationContainer}>
                                            <MapPin size={12} color="#ffffff" style={{opacity: 0.8}}/>
                                            <Text style={styles.propertyLocation} numberOfLines={1}>{listingLocation}</Text>
                                        </View>
                                    )}
                                </View>
                                <LinearGradient colors={statusBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.statusBadge}>
                                    {/* Icônes statut */}
                                    {item.status === 'pending' && <Clock size={14} color={statusTextColor} />}
                                    {item.status === 'confirmed' && <CheckCircle2 size={14} color={statusTextColor} />}
                                    {item.status === 'completed' && <CheckCircle2 size={14} color={statusTextColor} />}
                                    {item.status === 'canceled' && <XCircle size={14} color={statusTextColor} />}
                                    {item.status === 'declined' && <XCircle size={14} color={statusTextColor} />}
                                    <Text style={[styles.statusText, { color: statusTextColor }]}>{statusLabel}</Text>
                                </LinearGradient>
                            </View>
                        </View>
                    </View>
                     {/* Tags spéciaux */}
                    {(isUpcoming || isTodayBooking) && (
                        <View style={[styles.specialTag, isTodayBooking ? styles.todayTag : styles.upcomingTag]}>
                            <Text style={[styles.specialTagText, isTodayBooking ? styles.todayTagText : styles.upcomingTagText]}>
                                {isTodayBooking ? "Aujourd'hui" : "À venir"}
                            </Text>
                        </View>
                    )}
                    {/* Infos réservation */}
                    <View style={styles.bookingInfo}>
                        <View style={styles.infoSection}>
                            <View style={styles.detailRow}>
                                <CalendarIcon size={16} color="#475569" />
                                <Text style={styles.detailLabel}>Date:</Text>
                                <Text style={styles.detailValue}>{formattedDay}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Clock size={16} color="#475569" />
                                <Text style={styles.detailLabel}>Horaire:</Text>
                                <Text style={styles.detailValue}>
                                    {formattedStart} - {formattedEnd} ({durationHours > 0 ? `${durationHours}h` : '<1h'})
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Users size={16} color="#475569" />
                                <Text style={styles.detailLabel}>Invités:</Text>
                                <Text style={styles.detailValue}>
                                    {item.guest_count} personne{item.guest_count > 1 ? 's' : ''}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.priceContainer}>
                            <Text style={styles.priceLabel}>Prix total</Text>
                            <Text style={styles.priceText}>{formattedPrice}</Text>
                        </View>
                    </View>
                    {/* Actions réservation */}
                    <View style={styles.bookingActions}>
                         {canCancel && (
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.cancelButton, isItemActionLoading && styles.disabledButton]} 
                                onPress={() => handleOpenCancelModal(item.id)} 
                                disabled={isItemActionLoading}
                            >
                                {actionLoading === item.id ? 
                                    <ActivityIndicator size="small" color="#b91c1c"/> : 
                                    <XCircle size={16} color="#b91c1c" />
                                }
                                <Text style={styles.cancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                         )}
                         <TouchableOpacity 
                            style={[
                                styles.actionButton, 
                                styles.messageButton, 
                                (!canContact || isItemActionLoading) && styles.disabledButton
                            ]} 
                            onPress={() => {
                                if (canContact && item.conversation) {
                                    router.push(`/(tabs)/conversations/${item.conversation.id}`);
                                } else {
                                    Alert.alert("Contacter", "Conversation non disponible.");
                                }
                            }} 
                            disabled={!canContact || isItemActionLoading}
                         >
                            <MessageCircle size={16} color={canContact ? '#0891b2' : '#9ca3af'} />
                            <Text style={[styles.messageButtonText, !canContact && { color: '#9ca3af' }]}>
                                Contacter
                            </Text>
                         </TouchableOpacity>
                         <TouchableOpacity 
                            style={[styles.actionButton, styles.detailsButton, isItemActionLoading && styles.disabledButton]} 
                            onPress={() => {
                                if(item.id && typeof item.id === 'string') {
                                    router.push(`/my-bookings/${item.id}`);
                                } else {
                                    Alert.alert("Erreur", "ID manquant.");
                                }
                            }} 
                            disabled={isItemActionLoading}
                         >
                            <Info size={16} color="#475569" />
                            <Text style={styles.detailsButtonText}>Détails</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            );
        } catch (err) {
            console.error("Erreur rendu item réservation:", item.id, err);
            return (
                <View style={styles.bookingCard}>
                    <Text style={styles.errorTextSmall}>Erreur affichage résa {item.id}</Text>
                </View>
            );
        }
    }, [actionLoading, handleOpenCancelModal, router]);

    // Header Component
    const renderHeader = useCallback(() => {
        if (isHost) return null;
        
        return (
            <Animated.View style={[styles.header, headerAnimatedStyle]}>
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeTitle}>Mes réservations</Text>
                    <Text style={styles.welcomeSubtitle}>Suivez et gérez vos prochaines baignades.</Text>
                </View>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{bookingsStats.total}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{bookingsStats.upcoming}</Text>
                        <Text style={styles.statLabel}>À venir</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{bookingsStats.completed}</Text>
                        <Text style={styles.statLabel}>Terminées</Text>
                    </View>
                </View>
                <View style={styles.filterScrollContainer}>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={styles.filterContent}
                    >
                        {FILTERS.map((filter) => {
                            const isActive = activeFilter === filter.key;
                            return (
                                <TouchableOpacity 
                                    key={filter.key || 'all'} 
                                    style={[styles.filterButton, isActive && styles.filterButtonActive]} 
                                    onPress={() => setActiveFilter(filter.key)}
                                >
                                    <View style={[
                                        styles.filterIconContainer, 
                                        isActive && styles.filterIconContainerActive
                                    ]}>
                                        {filter.icon()}
                                    </View>
                                    <Text style={[
                                        styles.filterText, 
                                        isActive && styles.filterTextActive
                                    ]}>
                                        {filter.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </Animated.View>
        );
    }, [headerAnimatedStyle, bookingsStats, activeFilter, isHost]);

    // EmptyComponent
    const renderEmptyComponent = useCallback(() => {
        if (loadingBookings || bookingsError || isHost) return null;
        
        return (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                    <CalendarIcon size={50} color="#ffffff" />
                </View>
                <Text style={styles.emptyTitle}>Aucune réservation</Text>
                <Text style={styles.emptyText}>
                    {activeFilter 
                        ? `Vous n'avez pas de réservation "${BOOKING_STATUS_LABELS[activeFilter] || activeFilter}".` 
                        : "Vous n'avez pas encore réservé de piscine."}
                </Text>
                <TouchableOpacity style={styles.findButton} onPress={() => router.push('/search')}>
                    <Text style={styles.findButtonText}>Trouver une piscine</Text>
                    <ArrowRight size={18} color="#ffffff" />
                </TouchableOpacity>
            </View>
        );
    }, [loadingBookings, bookingsError, activeFilter, router, isHost]);

    // --- Rendu Principal ---
    if (!fontsLoaded || !sessionInitialized || isLoadingAuth) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
            </SafeAreaView>
        );
    }
    
    if (fontError) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Erreur polices.</Text>
            </SafeAreaView>
        );
    }
    
    if (!user && sessionInitialized) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Veuillez vous connecter.</Text>
            </SafeAreaView>
        );
    }
    
    if (isHost && sessionInitialized) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
                <Text style={styles.loadingText}>Redirection vers l'espace hôte...</Text>
            </SafeAreaView>
        );
    }

    // Affichage normal pour le nageur
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <FlatList
                data={filteredBookings}
                renderItem={renderBookingItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyComponent}
                ListFooterComponent={
                    bookingsError && !loadingBookings ? (
                        <View style={styles.globalErrorContainer}>
                            <AlertCircle size={18} color="#b91c1c" style={{ marginRight: 8 }}/>
                            <Text style={styles.errorTextSmall}>{bookingsError}</Text>
                        </View>
                    ) : (
                        <View style={{ height: 40 }} />
                    )
                }
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        colors={['#0891b2']} 
                        tintColor="#0891b2" 
                        progressBackgroundColor="#ffffff"
                    />
                }
                showsVerticalScrollIndicator={false}
                style={bookingsAnimatedStyle}
            />
            
            {/* Indicateur de chargement initial (si pas refresh) */}
            {loadingBookings && !refreshing && bookings.length === 0 && (
                <View style={styles.overlayLoading}>
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="large" color="#0891b2" />
                        <Text style={styles.loadingCardText}>Chargement de vos réservations...</Text>
                    </View>
                </View>
            )}
            
            {/* Modal d'annulation */}
            <Modal 
                animationType="fade" 
                transparent={true} 
                visible={isCancelModalVisible} 
                onRequestClose={() => {
                    if (!actionLoading) {
                        setIsCancelModalVisible(false);
                        setBookingToCancelId(null);
                    }
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Annuler Réservation ?</Text>
                        <Text style={styles.modalMessage}>
                            Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={[
                                    styles.modalButton, 
                                    styles.modalButtonCancel, 
                                    actionLoading && styles.disabledButton
                                ]} 
                                onPress={() => {
                                    setIsCancelModalVisible(false);
                                    setBookingToCancelId(null);
                                }} 
                                disabled={actionLoading}
                            >
                                <Text style={styles.modalButtonTextCancel}>Retour</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[
                                    styles.modalButton, 
                                    styles.modalButtonReject, 
                                    actionLoading && styles.disabledButton
                                ]} 
                                onPress={confirmCancellation} 
                                disabled={actionLoading}
                            >
                                {actionLoading ? 
                                    <ActivityIndicator size="small" color="#ffffff"/> : 
                                    <Text style={styles.modalButtonTextReject}>Oui, annuler</Text>
                                }
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
    listContainer: { paddingBottom: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20 },
    loadingText: { marginTop: 16, fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#64748b', textAlign: 'center' },
    overlayLoading: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(248, 250, 252, 0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 5 },
    loadingCard: { backgroundColor: 'white', padding: 24, borderRadius: 16, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, maxWidth: '80%' },
    loadingCardText: { fontFamily: 'Montserrat-Medium', fontSize: 15, color: '#334155', marginTop: 16, textAlign: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' },
    errorText: { fontFamily: 'Montserrat-SemiBold', color: '#b91c1c', fontSize: 16, textAlign: 'center', marginBottom: 20 },
    loginButton: { backgroundColor: '#0891b2', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10, marginTop: 16 },
    loginButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
    errorTextSmall: { fontFamily: 'Montserrat-Regular', color: '#b91c1c', fontSize: 13, textAlign: 'center', flex: 1 },
    globalErrorContainer: { marginHorizontal: 16, backgroundColor: '#fee2e2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca', flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 20 },
    header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 20 : 40, paddingBottom: 0, backgroundColor: '#f8fafc' },
    welcomeContainer: { marginBottom: 16 },
    welcomeTitle: { fontFamily: 'Montserrat-Bold', fontSize: 26, color: '#1e293b', marginBottom: 4 },
    welcomeSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#64748b' },
    statsContainer: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: "#64748b", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
    statItem: { flex: 1, alignItems: 'center' },
    statNumber: { fontFamily: 'Montserrat-Bold', fontSize: 22, color: '#0891b2', marginBottom: 4 },
    statLabel: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#64748b' },
    statDivider: { width: 1, height: '80%', backgroundColor: '#e2e8f0', marginHorizontal: 10, alignSelf: 'center' },
    filterScrollContainer: { marginBottom: 16 },
    filterContent: { paddingVertical: 6, paddingHorizontal: 16 },
    filterButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, marginRight: 10, backgroundColor: '#ffffff', shadowColor: "#64748b", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, borderWidth: 1, borderColor: '#e2e8f0' },
    filterButtonActive: { backgroundColor: '#0891b2', borderColor: '#0891b2', shadowColor: "#0891b2", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3, },
    filterIconContainer: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    filterIconContainerActive: { backgroundColor: 'rgba(255,255,255,0.25)', },
    filterText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: '#475569' },
    filterTextActive: { color: '#ffffff', fontFamily: 'Montserrat-SemiBold' },
    bookingCard: { backgroundColor: '#ffffff', borderRadius: 16, marginBottom: 16, overflow: 'hidden', shadowColor: "#94a3b8", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2, marginHorizontal: 16 },
    cardHeader: { position: 'relative', height: 140, width: '100%' },
    propertyImage: { width: '100%', height: '100%' },
    placeholderImage: { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
    cardHeaderOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%' },
    headerGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '70%' },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: 12, position: 'absolute', bottom: 0, left: 0, right: 0 },
    headerLeftContent: { flex: 1, marginRight: 8 },
    propertyTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#ffffff', marginBottom: 2, textShadowColor: 'rgba(0, 0, 0, 0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
    locationContainer: { flexDirection: 'row', alignItems: 'center' },
    propertyLocation: { fontFamily: 'Montserrat-Medium', fontSize: 12, color: '#ffffff', textShadowColor: 'rgba(0, 0, 0, 0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2, marginLeft: 4 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
    statusText: { fontFamily: 'Montserrat-SemiBold', fontSize: 11, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    specialTag: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, zIndex: 10 },
    todayTag: { backgroundColor: 'rgba(37, 99, 235, 0.9)', },
    upcomingTag: { backgroundColor: 'rgba(5, 150, 105, 0.9)', },
    specialTagText: { fontFamily: 'Montserrat-SemiBold', fontSize: 11, color: '#ffffff', textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1 },
    todayTagText: { color: '#ffffff' },
    upcomingTagText: { color: '#ffffff' },
    bookingInfo: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    infoSection: { marginBottom: 16 },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    detailLabel: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: '#64748b', marginLeft: 8, width: 60 },
    detailValue: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: '#1e293b', flex: 1 },
    priceContainer: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    priceLabel: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: '#64748b' },
    priceText: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#0891b2' },
    bookingActions: { flexDirection: 'row', padding: 12, gap: 8 },
    actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10, gap: 6, borderWidth: 1 },
    cancelButton: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
    cancelButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#b91c1c' },
    messageButton: { backgroundColor: '#ecfeff', borderColor: '#cffafe' },
    messageButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#0891b2' },
    detailsButton: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0' },
    detailsButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#475569' },
    disabledButton: { opacity: 0.6 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20, flex: 1 },
    emptyIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0891b2', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: "#0891b2", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    emptyTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1e293b', marginBottom: 8 },
    emptyText: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 24, maxWidth: '80%' },
    findButton: { backgroundColor: '#0891b2', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, flexDirection: 'row', alignItems: 'center', shadowColor: "#0891b2", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
    findButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', marginRight: 8 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: 20 },
    modalContent: { backgroundColor: '#ffffff', borderRadius: 12, padding: 20, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
    modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 10, textAlign: 'center', },
    modalMessage: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#475569', marginBottom: 25, textAlign: 'center', lineHeight: 22, },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, },
    modalButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, },
    modalButtonCancel: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', },
    modalButtonTextCancel: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#475569', },
    modalButtonReject: { backgroundColor: '#ef4444', borderColor: '#dc2626', },
    modalButtonTextReject: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#ffffff', },
});
