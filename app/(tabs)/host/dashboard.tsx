
///home/project/app/(tabs)/host/dashboard.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Platform,
    Image, ActivityIndicator, RefreshControl, SafeAreaView,
    ScrollView, Alert
} from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import {
    Plus, Clock, CircleCheck, XCircle, CircleAlert, Trash2,
    CalendarClock, Edit, Banknote, ChevronRight, CalendarDays,
    Settings, DollarSign, Users, Star, RefreshCcw, AlertCircle, MapPin, Eye
} from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO,
    getISODay, startOfDay, endOfDay, differenceInHours, isEqual
} from 'date-fns';
import { fr } from 'date-fns/locale';

// Configuration du calendrier en français
LocaleConfig.locales['fr'] = {
    monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
    today: 'Aujourd\'hui'
};
LocaleConfig.defaultLocale = 'fr';

// Interfaces
interface PoolListingManaged {
    id: string;
    title: string;
    location: string | null;
    price_per_hour: number | null;
    capacity: number | null;
    status: string;
    rejection_reason?: string | null;
    pool_images: { id: string; url: string; position?: number }[] | null;
}

interface AvailabilitySchedule { 
    id: string; 
    pool_id: string; 
    day_of_week: number; 
    start_time: string; 
    end_time: string; 
}
 
interface BlockedPeriod { 
    id: string; 
    pool_id: string; 
    start_datetime: string; 
    end_datetime: string; 
    reason?: string | null; 
}

interface CalendarBookingUser { 
    full_name: string | null; 
    avatar_url: string | null; 
}

interface CalendarBooking { 
    id: string; 
    start_time: string; 
    end_time: string; 
    status: string; 
    pool_id: string; 
    guest_count: number; 
    total_price: number; 
    user: CalendarBookingUser | null; 
}

interface DashboardStats { 
    total_bookings: number; 
    pending_bookings: number; 
    upcoming_bookings: number; 
    completed_bookings: number; 
    revenue_this_month: number; 
    rating_average: number | null; 
    reviews_count: number; 
    views_count: number; 
}

interface MarkedDateValue { 
    startingDay?: boolean; 
    endingDay?: boolean; 
    color?: string; 
    textColor?: string; 
    marked?: boolean; 
    dotColor?: string; 
    disabled?: boolean; 
    disableTouchEvent?: boolean; 
    customStyles?: object; 
}

type MarkedDates = { [dateString: string]: MarkedDateValue; };

interface DashboardResponse {
    success: boolean;
    message?: string;
    listing: PoolListingManaged | null;
    stats: DashboardStats | null;
    calendar?: {
        schedules: AvailabilitySchedule[];
        blocked_periods: BlockedPeriod[];
        bookings: CalendarBooking[];
    } | null;
}

// Constantes
const STATUS_COLORS: Record<string, string> = { 
    'pending': '#fef3c7', 
    'approved': '#d1fae5', 
    'rejected': '#fee2e2', 
    'inactive': '#f1f5f9', 
    'deleted': '#f3f4f6',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
    'pending': Clock,
    'approved': CircleCheck,
    'rejected': XCircle,
    'inactive': CircleAlert,
    'deleted': Trash2,
};

const STATUS_LABELS: Record<string, string> = {
    'pending': 'En attente',
    'approved': 'Approuvée',
    'rejected': 'Refusée',
    'inactive': 'Inactive',
    'deleted': 'Supprimée',
};

const PLACEHOLDER_IMAGE_URL = 'https://placehold.co/90x90/e5e7eb/64748b?text=Piscine'; 

export default function HostDashboard() {
    // Récupérer user depuis Auth
    const { user, sessionInitialized, isLoading: isLoadingAuth } = useAuth();
    
    // États pour l'annonce, les statistiques et le calendrier
    const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [markedDates, setMarkedDates] = useState<MarkedDates>({});
    const [refreshing, setRefreshing] = useState(false);
    const [imageError, setImageError] = useState(false); // État pour gérer les erreurs d'image
    const [imagesLoaded, setImagesLoaded] = useState(false); // Suivi du chargement des images
    
    // Extraire les données pour faciliter l'utilisation
    const listing = useMemo(() => dashboard?.listing || null, [dashboard]);
    const stats = useMemo(() => dashboard?.stats || null, [dashboard]);
    const calendarData = useMemo(() => dashboard?.calendar || null, [dashboard]);
    
    // Réservations récentes
    const recentBookings = useMemo(() => {
        if (!calendarData?.bookings) return [];
        
        return [...calendarData.bookings]
            .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
            .slice(0, 3);
    }, [calendarData?.bookings]);

    // Pour afficher ou non les données opérationnelles
    const shouldLoadOperationalData = useMemo(() => 
        listing?.status === 'approved', [listing?.status]
    );

    // Chargement des polices
    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // Fonction pour vérifier si un tableau est non-vide
    const isValidArray = (arr: any[] | null | undefined): boolean => {
        return Array.isArray(arr) && arr.length > 0;
    };

    // Fonction pour vérifier une URL d'image
    const isValidImageUrl = (url: string | null | undefined): boolean => {
        if (!url) return false;
        return typeof url === 'string' && url.trim() !== '';
    };

    // Rendu de l'image principale de l'annonce
    const renderListingImage = useCallback(() => {
        // Vérification complète de la structure des données d'image
        const hasImages = listing?.pool_images && 
                        Array.isArray(listing.pool_images) && 
                        listing.pool_images.length > 0 && 
                        isValidImageUrl(listing.pool_images[0]?.url);
        
        const imageUrl = hasImages ? listing.pool_images[0].url : PLACEHOLDER_IMAGE_URL;
        
        return (
            <View style={styles.listingImageContainer}>
                <Image
                    source={{ uri: imageError ? PLACEHOLDER_IMAGE_URL : imageUrl }}
                    style={styles.listingImage}
                    onError={() => {
                        console.warn(`Erreur de chargement d'image: ${imageUrl}`);
                        setImageError(true);
                    }}
                    onLoad={() => {
                        console.log('Image chargée avec succès:', {
                            hasPoolImages: !!listing?.pool_images,
                            poolImagesLength: listing?.pool_images?.length || 0,
                            imageUrl
                        });
                        setImagesLoaded(true);
                    }}
                />
                {imageError && (
                    <View style={styles.imageErrorOverlay}>
                        <AlertCircle size={16} color="#94a3b8" />
                    </View>
                )}
            </View>
        );
    }, [listing, imageError]);

    // Fonction principale pour charger toutes les données du dashboard
    const fetchDashboardData = useCallback(async (isRefresh = false) => {
        if (!user) {
            setDashboard(null);
            setError(null);
            setLoading(false);
            if (isRefresh) setRefreshing(false);
            return;
        }

        if (!isRefresh) setLoading(true);
        setError(null);
        setImageError(false); // Réinitialiser l'erreur d'image
        setImagesLoaded(false); // Réinitialiser le statut de chargement des images

        try {
            console.log(`🚀 Appel RPC get_host_dashboard_data pour l'utilisateur: ${user.id}`);
            
            const { data, error: rpcError } = await supabase.rpc(
                'get_host_dashboard_data', 
                { 
                    p_host_id: user.id,
                    p_month_start: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
                    p_month_end: format(endOfMonth(currentMonth), 'yyyy-MM-dd')
                },
                { 
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                }
            );

            if (rpcError) throw new Error(`Erreur RPC: ${rpcError.message}`);
            
            if (!data || !data.success) {
                throw new Error(data?.message || "Impossible de récupérer les données du tableau de bord");
            }
            
            // Vérification et normalisation des données
            if (data.listing) {
                // S'assurer que pool_images est toujours un tableau
                if (!data.listing.pool_images || !Array.isArray(data.listing.pool_images)) {
                    data.listing.pool_images = [];
                    console.warn("Normalisation: pool_images n'est pas un tableau valide");
                }
                
                // Filtrer les images avec des URLs valides
                if (data.listing.pool_images.length > 0) {
                    const originalLength = data.listing.pool_images.length;
                    data.listing.pool_images = data.listing.pool_images.filter(img => 
                        img && typeof img.url === 'string' && img.url.trim() !== ''
                    );
                    
                    if (originalLength !== data.listing.pool_images.length) {
                        console.warn(`Filtrage: ${originalLength - data.listing.pool_images.length} images invalides supprimées`);
                    }
                }
                
                console.log('Données des images après normalisation:', {
                    listingId: data.listing.id,
                    imageCount: data.listing.pool_images.length,
                    imageSample: data.listing.pool_images.length > 0 ? 
                        data.listing.pool_images[0].url.substring(0, 30) + '...' : 'aucune'
                });
            }
            
            console.log("✅ Données du tableau de bord adaptées avec succès");
            setDashboard(data as DashboardResponse);
            
        } catch (err: any) {
            console.error("❌ Erreur lors du chargement des données:", err);
            setError(err.message || "Une erreur est survenue lors du chargement des données");
            setDashboard(null);
        } finally {
            setLoading(false);
            if (isRefresh) setRefreshing(false);
        }
    }, [user, currentMonth]);

    // Effet principal pour charger les données
    useEffect(() => {
        if (sessionInitialized && fontsLoaded && !fontError && !isLoadingAuth) {
            fetchDashboardData();
        }
    }, [sessionInitialized, fontsLoaded, fontError, isLoadingAuth, fetchDashboardData]);

    // Effet pour calculer les dates marquées sur le calendrier
    useEffect(() => {
        if (!calendarData || !shouldLoadOperationalData) {
            setMarkedDates({});
            return;
        }

        try {
            const { schedules, blocked_periods, bookings } = calendarData;
            const newMarkedDates: MarkedDates = {};
            
            // Début et fin du mois actuel
            const startCal = startOfMonth(currentMonth);
            const endCal = endOfMonth(currentMonth);
            const monthDays = eachDayOfInterval({ start: startCal, end: endCal });
            
            // Carte des jours ouverts
            const openDaysMap = new Map<number, boolean>();
            if (isValidArray(schedules)) {
                schedules.forEach(sch => openDaysMap.set(sch.day_of_week, true));
            }

            // Marquer les jours fermés ou bloqués
            monthDays.forEach(day => {
                const dateString = format(day, 'yyyy-MM-dd');
                const dayOfWeek = getISODay(day);
                const isGenerallyOpen = openDaysMap.has(dayOfWeek);
                
                // Vérifier si la journée est bloquée
                const dayStart = startOfDay(day);
                const dayEnd = endOfDay(day);
                const isBlocked = isValidArray(blocked_periods) && blocked_periods.some(block => {
                    try {
                        const blockStart = parseISO(block.start_datetime);
                        const blockEnd = parseISO(block.end_datetime);
                        return blockStart <= dayEnd && blockEnd >= dayStart;
                    } catch (e) {
                        console.warn('Erreur de parsing de date pour période bloquée:', e);
                        return false;
                    }
                });

                // Si pas ouvert ou bloqué, marquer comme désactivé
                if (!isGenerallyOpen || isBlocked) {
                    newMarkedDates[dateString] = {
                        disabled: true,
                        disableTouchEvent: true,
                        customStyles: {
                            container: { backgroundColor: '#f1f5f9' },
                            text: { color: '#cbd5e1', textDecorationLine: 'line-through' }
                        }
                    };
                }
            });

            // Ajouter les réservations
            if (isValidArray(bookings)) {
                bookings.forEach(booking => {
                    try {
                        const bookingStart = startOfDay(parseISO(booking.start_time));
                        const bookingEnd = startOfDay(parseISO(booking.end_time));
                        const bookingInterval = eachDayOfInterval({ start: bookingStart, end: bookingEnd });
                        
                        bookingInterval.forEach((day, index, arr) => {
                            if (day >= startCal && day <= endCal) {
                                const dateString = format(day, 'yyyy-MM-dd');
                                
                                // Ne pas modifier si le jour est désactivé
                                if (newMarkedDates[dateString]?.disabled) return;
                                
                                const isStartingDay = arr.length === 1 ? false : isEqual(day, bookingStart);
                                const isEndingDay = arr.length === 1 ? false : isEqual(day, bookingEnd);
                                const isSingleDayBooking = arr.length === 1;
                                const color = booking.status === 'confirmed' ? '#a5f3fc' : '#fef08a';
                                const textColor = '#1e293b';

                                if (isSingleDayBooking) {
                                    newMarkedDates[dateString] = {
                                        marked: true,
                                        dotColor: booking.status === 'confirmed' ? '#0e7490' : '#ca8a04',
                                        customStyles: {
                                            container: { backgroundColor: color, borderRadius: 4 },
                                            text: { color: textColor, fontWeight: 'bold' }
                                        },
                                        disableTouchEvent: false
                                    };
                                } else {
                                    newMarkedDates[dateString] = {
                                        ...(newMarkedDates[dateString] || {}),
                                        startingDay: isStartingDay,
                                        endingDay: isEndingDay,
                                        color: color,
                                        textColor: textColor,
                                        disableTouchEvent: false
                                    };
                                }
                            }
                        });
                    } catch (e) {
                        console.error("Erreur lors du traitement de la réservation:", e);
                    }
                });
            }

            setMarkedDates(newMarkedDates);
        } catch (error) {
            console.error("Erreur lors du calcul des dates marquées:", error);
            setMarkedDates({});
        }
    }, [calendarData, shouldLoadOperationalData, currentMonth]);

    // Gestion des changements de mois
    const handleMonthChange = useCallback((month: DateData) => {
        try {
            setCurrentMonth(parseISO(month.dateString));
        } catch (e) {
            console.error("Erreur lors du changement de mois:", e);
            // Fallback au mois courant en cas d'erreur
            setCurrentMonth(new Date());
        }
    }, []);

    // Fonction de rafraîchissement
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setImageError(false); // Réinitialiser l'erreur d'image lors du rafraîchissement
        setImagesLoaded(false); // Réinitialiser le statut de chargement des images
        fetchDashboardData(true);
    }, [fetchDashboardData]);

    // Fonctions de navigation
    const navigateToEditListing = useCallback(() => {
        if (listing?.id) {
            router.push({
                pathname: '/(tabs)/host/edit-listing/[id]',
                params: { id: listing.id }
            });
        } else {
            Alert.alert("Erreur", "Impossible de modifier l'annonce: ID manquant");
        }
    }, [listing?.id]);

    const navigateToManageCalendar = useCallback(() => {
        if (listing?.id) {
            router.push({ pathname: '/host/manage-calendar', params: { id: listing.id } });
        } else {
            Alert.alert("Erreur", "Impossible de gérer le calendrier: ID d'annonce manquant");
        }
    }, [listing?.id]);

    const navigateToHostBookings = useCallback(() => {
        router.push('/(tabs)/host/(dashboard)/bookings');
    }, []);

    const navigateToPayoutSettings = useCallback(() => {
        router.push('/(tabs)/host/payout-settings');
    }, []);

    const navigateToSettings = useCallback(() => {
        router.push('/(tabs)/host/settings');
    }, []);

    const navigateToBookingDetails = useCallback((bookingId: string) => {
        router.push({ pathname: `/host/booking-details/${bookingId}` });
    }, []);

    const navigateToCreateListing = useCallback(() => {
        router.push('/(tabs)/host/create-listing');
    }, []);

    const navigateToSignIn = useCallback(() => {
        router.push('/(auth)/sign-in');
    }, []);

    // Logique conditionnelle pour l'icône de statut
    let StatusIconComponent: React.ElementType | null = null;
    let statusIconColor: string = '#6b7280';
    let statusTextColor: string = '#6b7280';
    
    if (listing?.status && STATUS_ICONS[listing.status]) {
        StatusIconComponent = STATUS_ICONS[listing.status];
        statusIconColor = listing.status === 'approved' ? '#059669' : 
                          listing.status === 'rejected' ? '#dc2626' : 
                          listing.status === 'pending' ? '#ca8a04' : '#6b7280';
        statusTextColor = statusIconColor;
    }

    // Affichages conditionnels pour différents états
    if (!fontsLoaded || !sessionInitialized || (isLoadingAuth && !user)) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </SafeAreaView>
        );
    }

    if (fontError) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Erreur lors du chargement des polices.</Text>
            </SafeAreaView>
        );
    }

    if (!user && sessionInitialized) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.notLoggedInContainer}>
                    <Text style={styles.notLoggedInTitle}>Connectez-vous pour accéder à votre espace hôte</Text>
                    <TouchableOpacity style={styles.loginButton} onPress={navigateToSignIn}>
                        <Text style={styles.loginButtonText}>Se connecter</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (loading && !refreshing && !dashboard) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
                <Text style={styles.loadingText}>Chargement du tableau de bord...</Text>
            </SafeAreaView>
        );
    }

    if (error && !loading && !dashboard) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <AlertCircle size={24} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => fetchDashboardData()}>
                    <RefreshCcw size={16} color="#ffffff" />
                    <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (!loading && !error && !listing && user) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Espace Hôte' }} />
                <View style={styles.noListingContainer}>
                    <Image
                        source={{ uri: PLACEHOLDER_IMAGE_URL }}
                        style={styles.noListingImage}
                    />
                    <Text style={styles.noListingTitle}>Aucune annonce trouvée</Text>
                    <Text style={styles.noListingSubtitle}>Créez votre annonce pour commencer à louer votre piscine.</Text>
                    <TouchableOpacity style={styles.createListingButton} onPress={navigateToCreateListing}>
                        <Plus size={18} color="#ffffff" />
                        <Text style={styles.createListingButtonText}>Créer une annonce</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Affichage principal du tableau de bord
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Espace Hôte' }} />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        colors={['#0891b2']} 
                        tintColor={'#0891b2'} 
                    />
                }
            >
                {/* Section Annonce Gérée */}
                <Animated.View entering={FadeIn.duration(300)}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardHeaderTitle}>Mon Annonce</Text>
                            {!loading && !refreshing && listing?.id && (
                                <TouchableOpacity 
                                    style={styles.refreshIconButton} 
                                    onPress={onRefresh} 
                                    disabled={refreshing}
                                >
                                    <RefreshCcw 
                                        size={16} 
                                        color={refreshing ? "#cbd5e1" : "#0891b2"} 
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                        {(loading && !listing) ? (
                            <ActivityIndicator style={{ marginVertical: 40 }} size="small" color="#0891b2" />
                        ) : listing ? (
                            <View style={styles.listingContainer}>
                                {renderListingImage()}
                                <View style={styles.listingContent}>
                                    <View style={styles.listingHeader}>
                                        <Text style={styles.listingTitle} numberOfLines={2}>{listing.title}</Text>
                                        {StatusIconComponent && (
                                            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[listing.status] || '#e5e7eb' }]}>
                                                <StatusIconComponent size={14} color={statusIconColor} />
                                                <Text style={[styles.statusText, { color: statusTextColor }]}>
                                                    {STATUS_LABELS[listing.status] || "Inconnu"}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    {listing.location && (
                                        <View style={styles.locationRow}>
                                            <MapPin size={14} color="#64748b" style={{ marginRight: 4 }} />
                                            <Text style={styles.locationText}>{listing.location}</Text>
                                        </View>
                                    )}
                                    <View style={styles.listingDetailsRow}>
                                        {listing.price_per_hour !== null && (
                                            <View style={styles.listingDetailItem}>
                                                <DollarSign size={14} color="#0891b2" />
                                                <Text style={styles.listingDetailText}>{listing.price_per_hour} MAD/h</Text>
                                            </View>
                                        )}
                                        {listing.capacity !== null && (
                                            <View style={styles.listingDetailItem}>
                                                <Users size={14} color="#0891b2" />
                                                <Text style={styles.listingDetailText}>{listing.capacity} pers.</Text>
                                            </View>
                                        )}
                                    </View>
                                    {listing.status === 'rejected' && listing.rejection_reason && (
                                        <View style={styles.rejectionContainer}>
                                            <Text style={styles.rejectionTitle}>Motif du refus :</Text>
                                            <Text style={styles.rejectionReason}>{listing.rejection_reason}</Text>
                                        </View>
                                    )}
                                    <View style={styles.listingActions}>
                                        <TouchableOpacity
                                            style={[styles.editButton, !listing.id && styles.disabledButton]}
                                            onPress={navigateToEditListing}
                                            disabled={!listing.id}
                                        >
                                            <Edit size={16} color={!listing.id ? "#cbd5e1" : "#475569"} />
                                            <Text style={[styles.editButtonText, !listing.id && styles.disabledText]}>Modifier</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ) : null}
                    </View>
                </Animated.View>

                {/* Actions rapides */}
                {listing?.id && (
                    <Animated.View entering={FadeIn.delay(200).duration(300)}>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardHeaderTitle}>Accès rapides</Text>
                            </View>
                            <View style={styles.quickActionsGrid}>
                                <TouchableOpacity
                                    style={[styles.quickActionButton, (!listing.id || !shouldLoadOperationalData) && styles.quickActionButtonDisabled]}
                                    onPress={navigateToHostBookings}
                                    disabled={!listing.id || !shouldLoadOperationalData}
                                >
                                    <View style={styles.quickActionIconContainer}>
                                        <CalendarClock size={24} color={!listing.id || !shouldLoadOperationalData ? "#cbd5e1" : "#0891b2"} />
                                    </View>
                                    <Text style={[styles.quickActionText, (!listing.id || !shouldLoadOperationalData) && styles.quickActionTextDisabled]}>
                                        Réservations
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.quickActionButton, (!listing.id || !shouldLoadOperationalData) && styles.quickActionButtonDisabled]}
                                    onPress={navigateToManageCalendar}
                                    disabled={!listing.id || !shouldLoadOperationalData}
                                >
                                    <View style={styles.quickActionIconContainer}>
                                        <CalendarDays size={24} color={!listing.id || !shouldLoadOperationalData ? "#cbd5e1" : "#0891b2"} />
                                    </View>
                                    <Text style={[styles.quickActionText, (!listing.id || !shouldLoadOperationalData) && styles.quickActionTextDisabled]}>
                                        Disponibilités
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.quickActionButton, !listing.id && styles.quickActionButtonDisabled]}
                                    onPress={navigateToPayoutSettings}
                                    disabled={!listing.id}
                                >
                                    <View style={styles.quickActionIconContainer}>
                                        <Banknote size={24} color={!listing.id ? "#cbd5e1" : "#0891b2"} />
                                    </View>
                                    <Text style={[styles.quickActionText, !listing.id && styles.quickActionTextDisabled]}>
                                        Paiements
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.quickActionButton, !listing.id && styles.quickActionButtonDisabled]}
                                    onPress={navigateToSettings}
                                    disabled={!listing.id}
                                >
                                    <View style={styles.quickActionIconContainer}>
                                        <Settings size={24} color={!listing.id ? "#cbd5e1" : "#0891b2"} />
                                    </View>
                                    <Text style={[styles.quickActionText, !listing.id && styles.quickActionTextDisabled]}>
                                        Réglages
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* Statistiques, Calendrier, Réservations */}
                {listing?.id && shouldLoadOperationalData ? (
                    <>
                        {/* Statistiques */}
                        <Animated.View entering={FadeIn.delay(300).duration(300)}>
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardHeaderTitle}>Performance</Text>
                                </View>
                                {loading && !stats ? (
                                    <ActivityIndicator style={styles.cardLoadingContainer} size="small" color="#0891b2" />
                                ) : stats ? (
                                    <View style={styles.statsContainer}>
                                        <View style={styles.statsGrid}>
                                            <View style={styles.statCard}>
                                                <View style={styles.statCardContent}>
                                                    <View style={[styles.statIconContainer, { backgroundColor: '#fef3c7' }]}>
                                                        <Clock size={20} color="#ca8a04" />
                                                    </View>
                                                    <Text style={styles.statValue}>{stats.pending_bookings}</Text>
                                                    <Text style={styles.statLabel}>En attente</Text>
                                                </View>
                                            </View>
                                            <View style={styles.statCard}>
                                                <View style={styles.statCardContent}>
                                                    <View style={[styles.statIconContainer, { backgroundColor: '#d1fae5' }]}>
                                                        <CalendarClock size={20} color="#059669" />
                                                    </View>
                                                    <Text style={styles.statValue}>{stats.upcoming_bookings}</Text>
                                                    <Text style={styles.statLabel}>À venir</Text>
                                                </View>
                                            </View>
                                            <View style={styles.statCard}>
                                                <View style={styles.statCardContent}>
                                                    <View style={[styles.statIconContainer, { backgroundColor: '#e0f2fe' }]}>
                                                        <CalendarDays size={20} color="#0891b2" />
                                                    </View>
                                                    <Text style={styles.statValue}>{stats.total_bookings}</Text>
                                                    <Text style={styles.statLabel}>Total</Text>
                                                </View>
                                            </View>
                                            <View style={styles.statCard}>
                                                <View style={styles.statCardContent}>
                                                    <View style={[styles.statIconContainer, { backgroundColor: '#ecfdf5' }]}>
                                                        <Banknote size={20} color="#10b981" />
                                                    </View>
                                                    <Text style={styles.statValue}>{stats.revenue_this_month}</Text>
                                                    <Text style={styles.statUnit}>MAD</Text>
                                                    <Text style={styles.statLabel}>Ce mois</Text>
                                                </View>
                                            </View>
                                            <View style={styles.statCard}>
                                                <View style={styles.statCardContent}>
                                                    <View style={[styles.statIconContainer, { backgroundColor: '#f1f5f9' }]}>
                                                        <Eye size={20} color="#64748b" />
                                                    </View>
                                                    <Text style={styles.statValue}>{stats.views_count}</Text>
                                                    <Text style={styles.statLabel}>Vues</Text>
                                                </View>
                                            </View>
                                            <View style={styles.statCard}>
                                                <View style={styles.statCardContent}>
                                                    <View style={[styles.statIconContainer, { backgroundColor: '#fffbeb' }]}>
                                                        <Star size={20} color="#f59e0b" />
                                                    </View>
                                                    <Text style={styles.statValue}>
                                                        {stats.rating_average ? stats.rating_average.toFixed(1) : '-'}
                                                    </Text>
                                                    <Text style={styles.statLabel}>Note ({stats.reviews_count})</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ) : (
                                    <Text style={styles.noDataText}>Statistiques indisponibles.</Text>
                                )}
                            </View>
                        </Animated.View>

                        {/* Calendrier */}
                        <Animated.View entering={FadeIn.delay(400).duration(300)}>
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardHeaderTitle}>Calendrier</Text>
                                </View>
                                <View style={styles.calendarContainer}>
                                    {loading && !calendarData ? (
                                        <ActivityIndicator style={{ marginVertical: 40 }} color="#0891b2" />
                                    ) : calendarData ? (
                                        <Calendar
                                            key={`${listing.id}-${format(currentMonth, 'yyyy-MM')}`}
                                            current={format(currentMonth, 'yyyy-MM-dd')}
                                            onMonthChange={handleMonthChange}
                                            markedDates={markedDates}
                                            markingType={'period'}
                                            theme={{
                                                arrowColor: '#0891b2',
                                                todayTextColor: '#0891b2',
                                                textMonthFontFamily: 'Montserrat-SemiBold',
                                                textDayHeaderFontFamily: 'Montserrat-Regular',
                                                dayTextColor: '#1e293b',
                                                textDayFontFamily: 'Montserrat-Regular',
                                                monthTextColor: '#1e293b'
                                            }}
                                            style={styles.calendarStyle}
                                            firstDay={1}
                                        />
                                    ) : (
                                        <Text style={styles.noDataText}>Calendrier indisponible.</Text>
                                    )}
                                    
                                    <View style={styles.legendContainer}>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: '#a5f3fc' }]} />
                                            <Text style={styles.legendText}>Confirmé</Text>
                                        </View>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: '#fef08a' }]} />
                                            <Text style={styles.legendText}>En attente</Text>
                                        </View>
                                        <View style={styles.legendItem}>
                                            <View style={[styles.legendDot, { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1' }]} />
                                            <Text style={styles.legendText}>Bloqué/Fermé</Text>
                                        </View>
                                    </View>
                                    
                                    <TouchableOpacity
                                        style={styles.calendarActionButton}
                                        disabled={!listing.id}
                                        onPress={navigateToManageCalendar}
                                    >
                                        <CalendarDays size={16} color="#ffffff" />
                                        <Text style={styles.calendarActionButtonText}>Gérer les disponibilités</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>

                        {/* Réservations récentes */}
                        <Animated.View entering={FadeIn.delay(500).duration(300)}>
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardHeaderTitle}>Réservations récentes</Text>
                                    <TouchableOpacity style={styles.seeAllButton} onPress={navigateToHostBookings}>
                                        <Text style={styles.seeAllButtonText}>Voir tout</Text>
                                        <ChevronRight size={16} color="#0891b2" />
                                    </TouchableOpacity>
                                </View>
                                {loading && !calendarData ? (
                                    <ActivityIndicator style={{ marginVertical: 20 }} size="small" color="#0891b2" />
                                ) : recentBookings.length === 0 ? (
                                    <View style={styles.cardEmptyContainer}>
                                        <CalendarClock size={32} color="#cbd5e1" />
                                        <Text style={styles.cardEmptyText}>Aucune réservation récente</Text>
                                    </View>
                                ) : (
                                    <View style={styles.bookingsContainer}>
                                        {recentBookings.map((booking) => {
                                            try {
                                                const startDate = parseISO(booking.start_time);
                                                const endDate = parseISO(booking.end_time);
                                                const duration = differenceInHours(endDate, startDate);
                                                
                                                const bookingStatusInfo = {
                                                    confirmed: { icon: CircleCheck, bgColor: '#d1fae5', color: '#059669', label: 'Confirmée' },
                                                    pending: { icon: Clock, bgColor: '#fef3c7', color: '#ca8a04', label: 'En attente' },
                                                    completed: { icon: CircleCheck, bgColor: '#d1fae5', color: '#059669', label: 'Terminée' },
                                                    canceled: { icon: XCircle, bgColor: '#f1f5f9', color: '#6b7280', label: 'Annulée' }
                                                }[booking.status] || { 
                                                    icon: CircleAlert, 
                                                    bgColor: '#f1f5f9', 
                                                    color: '#6b7280', 
                                                    label: booking.status || 'Inconnu' 
                                                };
                                                
                                                const BookingStatusIcon = bookingStatusInfo.icon;
                                                
                                                return (
                                                    <TouchableOpacity
                                                        key={booking.id}
                                                        style={styles.bookingCard}
                                                        onPress={() => navigateToBookingDetails(booking.id)}
                                                    >
                                                        <View style={styles.bookingCardHeader}>
                                                            <View style={styles.bookingUserInfo}>
                                                                <View style={styles.bookingUserAvatar}>
                                                                    {isValidImageUrl(booking.user?.avatar_url) ? (
                                                                        <Image 
                                                                            source={{ uri: booking.user.avatar_url }} 
                                                                            style={styles.avatarImage}
                                                                            onError={() => console.warn("Erreur de chargement d'avatar utilisateur")}
                                                                        />
                                                                    ) : (
                                                                        <Users size={20} color="#94a3b8" />
                                                                    )}
                                                                </View>
                                                                <Text style={styles.bookingUserName} numberOfLines={1}>
                                                                    {booking.user?.full_name || "Utilisateur"}
                                                                </Text>
                                                            </View>
                                                            <View style={[styles.bookingStatusBadge, { backgroundColor: bookingStatusInfo.bgColor }]}>
                                                                <BookingStatusIcon size={12} color={bookingStatusInfo.color} />
                                                                <Text style={[styles.bookingStatusText, { color: bookingStatusInfo.color }]}>
                                                                    {bookingStatusInfo.label}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.bookingDetails}>
                                                            <View style={styles.bookingDetailRow}>
                                                                <Text style={styles.bookingDetailLabel}>Date</Text>
                                                                <Text style={styles.bookingDetailValue}>
                                                                    {format(startDate, 'dd MMM yy', { locale: fr })}
                                                                </Text>
                                                            </View>
                                                            <View style={styles.bookingDetailRow}>
                                                                <Text style={styles.bookingDetailLabel}>Heure</Text>
                                                                <Text style={styles.bookingDetailValue}>
                                                                    {format(startDate, 'HH:mm')} ({duration}h)
                                                                </Text>
                                                            </View>
                                                            <View style={styles.bookingDetailRow}>
                                                                <Text style={styles.bookingDetailLabel}>Prix</Text>
                                                                <Text style={styles.bookingDetailValue}>
                                                                    {booking.total_price} MAD
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            } catch (e) {
                                                console.error("Erreur de rendu d'une réservation:", e);
                                                return null;
                                            }
                                        })}
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    </>
                ) : listing?.id ? (
                    <Animated.View entering={FadeIn.duration(300)}>
                        <View style={styles.infoCardContainer}>
                            {listing.status === 'pending' && (
                                <View style={styles.infoCard}>
                                    <Clock size={24} color="#b45309" />
                                    <View style={styles.infoCardContent}>
                                        <Text style={styles.infoCardTitle}>Annonce en attente</Text>
                                        <Text style={styles.infoCardText}>Votre annonce est en cours d'examen par notre équipe.</Text>
                                    </View>
                                </View>
                            )}
                            {listing.status === 'rejected' && (
                                <View style={[styles.infoCard, styles.rejectionCard]}>
                                    <XCircle size={24} color="#b91c1c" />
                                    <View style={styles.infoCardContent}>
                                        <Text style={[styles.infoCardTitle, { color: '#b91c1c' }]}>Annonce refusée</Text>
                                        {listing.rejection_reason && (
                                            <Text style={[styles.infoCardText, { color: '#b91c1c' }]}>
                                                Motif : {listing.rejection_reason}
                                            </Text>
                                        )}
                                        <TouchableOpacity style={styles.editRejectedButton} onPress={navigateToEditListing}>
                                            <Edit size={16} color="#ffffff" />
                                            <Text style={styles.editRejectedButtonText}>Modifier</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            {listing.status === 'inactive' && (
                                <View style={styles.infoCard}>
                                    <CircleAlert size={24} color="#b45309" />
                                    <View style={styles.infoCardContent}>
                                        <Text style={styles.infoCardTitle}>Annonce inactive</Text>
                                        <Text style={styles.infoCardText}>Votre annonce est actuellement inactive.</Text>
                                        <TouchableOpacity style={styles.editRejectedButton} onPress={navigateToEditListing}>
                                            <Edit size={16} color="#ffffff" />
                                            <Text style={styles.editRejectedButtonText}>Modifier</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f8fafc' 
    },
    scrollContent: { 
        paddingVertical: 16, 
        paddingBottom: 40 
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#f8fafc' 
    },
    loadingText: { 
        marginTop: 12, 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 14, 
        color: '#64748b' 
    },
    errorContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    errorText: { 
        fontFamily: 'Montserrat-Regular', 
        color: '#b91c1c', 
        fontSize: 14, 
        textAlign: 'center' 
    },
    retryButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8, 
        backgroundColor: '#0891b2', 
        paddingVertical: 10, 
        paddingHorizontal: 16, 
        borderRadius: 8, 
        marginTop: 16 
    },
    retryButtonText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 14, 
        color: '#ffffff' 
    },
    noDataText: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 14, 
        color: '#64748b', 
        textAlign: 'center', 
        paddingVertical: 20 
    },
    notLoggedInContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 30 
    },
    notLoggedInTitle: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 18, 
        color: '#334155', 
        textAlign: 'center', 
        marginBottom: 20 
    },
    loginButton: { 
        backgroundColor: '#0891b2', 
        paddingVertical: 14, 
        paddingHorizontal: 30, 
        borderRadius: 10 
    },
    loginButtonText: { 
        fontFamily: 'Montserrat-SemiBold', 
        color: '#ffffff', 
        fontSize: 16 
    },
    noListingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 30 
    },
    noListingImage: { 
        width: 120, 
        height: 120, 
        borderRadius: 60, 
        marginBottom: 24, 
        opacity: 0.7 
    },
    noListingTitle: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 20, 
        color: '#1e293b', 
        textAlign: 'center', 
        marginBottom: 8 
    },
    noListingSubtitle: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 15, 
        color: '#64748b', 
        textAlign: 'center', 
        marginBottom: 25, 
        lineHeight: 22 
    },
    createListingButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#0ea5e9', 
        paddingVertical: 14, 
        paddingHorizontal: 24, 
        borderRadius: 10, 
        gap: 8 
    },
    createListingButtonText: { 
        fontFamily: 'Montserrat-SemiBold', 
        color: '#ffffff', 
        fontSize: 16 
    },

    card: { 
        backgroundColor: '#ffffff', 
        borderRadius: 16, 
        marginBottom: 16, 
        marginHorizontal: 16, 
        shadowColor: "#94a3b8", 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.08, 
        shadowRadius: 4, 
        elevation: 3, 
        borderWidth: 1, 
        borderColor: '#f1f5f9', 
        overflow: Platform.OS === 'android' ? 'hidden' : 'visible' 
    },
    cardHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingVertical: 14, 
        borderBottomWidth: 1, 
        borderBottomColor: '#f1f5f9' 
    },
    cardHeaderTitle: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 16, 
        color: '#1e293b' 
    },
    refreshIconButton: { 
        padding: 6 
    },
    seeAllButton: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    seeAllButtonText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 14, 
        color: '#0891b2', 
        marginRight: 2 
    },
    cardLoadingContainer: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingVertical: 30 
    },
    cardEmptyContainer: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingVertical: 30, 
        paddingHorizontal: 16 
    },
    cardEmptyText: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 15, 
        color: '#64748b', 
        textAlign: 'center' 
    },

    listingContainer: { 
        padding: 16, 
        flexDirection: 'row', 
        gap: 14 
    },
    listingImageContainer: {
        position: 'relative',
        width: 90,
        height: 90,
        borderRadius: 10,
        backgroundColor: '#e5e7eb',
        overflow: 'hidden'
    },
    listingImage: { 
        width: '100%', 
        height: '100%', 
        borderRadius: 10
    },
    imageErrorOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(241, 245, 249, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    listingContent: { 
        flex: 1, 
        justifyContent: 'space-between' 
    },
    listingHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 6, 
        gap: 6 
    },
    listingTitle: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 17, 
        color: '#1e293b', 
        flexShrink: 1, 
        marginRight: 8 
    },
    statusBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 8, 
        paddingVertical: 4, 
        borderRadius: 16, 
        gap: 4 
    },
    statusText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 10, 
        textTransform: 'uppercase' 
    },
    locationRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 4, 
        marginBottom: 8 
    },
    locationText: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 14, 
        color: '#64748b', 
        flexShrink: 1 
    },
    listingDetailsRow: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 12, 
        marginBottom: 10 
    },
    listingDetailItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 5, 
        backgroundColor: '#f0f9ff', 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 6, 
        borderWidth: 1, 
        borderColor: '#e0f2fe' 
    },
    listingDetailText: { 
        fontFamily: 'Montserrat-Medium', 
        fontSize: 13, 
        color: '#0c4a6e' 
    },
    rejectionContainer: { 
        backgroundColor: '#fee2e2', 
        padding: 8, 
        borderRadius: 8, 
        marginTop: 6, 
        borderLeftWidth: 3, 
        borderLeftColor: '#f87171' 
    },
    rejectionTitle: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 12, 
        color: '#b91c1c', 
        marginBottom: 2 
    },
    rejectionReason: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 12, 
        color: '#b91c1c' 
    },
    listingActions: { 
        flexDirection: 'row', 
        gap: 10, 
        marginTop: 10 
    },
    editButton: { 
        flexDirection: 'row', 
        flex: 1, 
        backgroundColor: '#f1f5f9', 
        paddingVertical: 9, 
        borderRadius: 8, 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 6, 
        borderWidth: 1, 
        borderColor: '#e2e8f0' 
    },
    editButtonText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 13, 
        color: '#4b5563' 
    },
    disabledButton: { 
        opacity: 0.6 
    },
    disabledText: { 
        color: '#cbd5e1' 
    },

    quickActionsGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        padding: 12, 
        gap: 12 
    },
    quickActionButton: { 
        flexBasis: '47%', 
        backgroundColor: '#f8fafc', 
        padding: 12, 
        borderRadius: 12, 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#e2e8f0' 
    },
    quickActionButtonDisabled: { 
        backgroundColor: '#f1f5f9', 
        borderColor: '#e5e7eb', 
        opacity: 0.7 
    },
    quickActionIconContainer: { 
        width: 50, 
        height: 50, 
        borderRadius: 25, 
        backgroundColor: '#ffffff', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 8, 
        borderWidth: 1, 
        borderColor: '#e2e8f0' 
    },
    quickActionText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 13, 
        color: '#334155', 
        textAlign: 'center' 
    },
    quickActionTextDisabled: { 
        color: '#9ca3af' 
    },

    statsContainer: { 
        padding: 16 
    },
    statsGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        marginHorizontal: -6 
    },
    statCard: { 
        width: '33.33%', 
        padding: 6, 
        marginBottom: 12 
    },
    statCardContent: { 
        backgroundColor: '#ffffff', 
        padding: 12, 
        borderRadius: 10, 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#e5e7eb', 
        height: '100%', 
        justifyContent: 'center', 
        shadowColor: "#64748b", 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.03, 
        shadowRadius: 2, 
        elevation: 1 
    },
    statIconContainer: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 8 
    },
    statValue: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 18, 
        color: '#1e293b', 
        marginBottom: 4, 
        textAlign: 'center' 
    },
    statUnit: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 12, 
        color: '#64748b', 
        marginBottom: 4 
    },
    statLabel: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 11, 
        color: '#64748b', 
        textAlign: 'center' 
    },

    calendarContainer: { 
        paddingHorizontal: 0 
    },
    calendarStyle: { 
        borderWidth: 0, 
        borderTopWidth: 1, 
        borderColor: '#f1f5f9', 
        borderRadius: 0, 
        paddingBottom: 8 
    },
    legendContainer: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        gap: 16, 
        marginTop: 16, 
        marginBottom: 16, 
        flexWrap: 'wrap' 
    },
    legendItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6 
    },
    legendDot: { 
        width: 10, 
        height: 10, 
        borderRadius: 5 
    },
    legendText: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 12, 
        color: '#64748b' 
    },
    calendarActionButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#0891b2', 
        paddingVertical: 12, 
        borderRadius: 10, 
        marginTop: 8, 
        gap: 8, 
        marginHorizontal: 16,
        marginBottom: 16
    },
    calendarActionButtonText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 14, 
        color: '#ffffff' 
    },

    bookingsContainer: { 
        gap: 12, 
        paddingHorizontal: 16, 
        paddingBottom: 16
    },
    bookingCard: { 
        backgroundColor: '#ffffff', 
        borderRadius: 10, 
        padding: 12, 
        borderWidth: 1, 
        borderColor: '#e5e7eb' 
    },
    bookingCardHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 12 
    },
    bookingUserInfo: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 10, 
        flexShrink: 1 
    },
    bookingUserAvatar: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center'
    },
    avatarImage: { 
        width: 40, 
        height: 40, 
        borderRadius: 20 
    },
    bookingUserName: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 14, 
        color: '#1e293b', 
        flexShrink: 1 
    },
    bookingStatusBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 8, 
        paddingVertical: 4, 
        borderRadius: 12, 
        gap: 4 
    },
    bookingStatusText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 10, 
        textTransform: 'uppercase' 
    },
    bookingDetails: { 
        backgroundColor: '#f8fafc', 
        padding: 12, 
        borderRadius: 10, 
        marginBottom: 6,
        marginTop: 6
    },
    bookingDetailRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 6 
    },
    bookingDetailLabel: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 13, 
        color: '#64748b' 
    },
    bookingDetailValue: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 13, 
        color: '#334155' 
    },

    infoCardContainer: { 
        paddingHorizontal: 16, 
        marginTop: 0, 
        marginBottom: 16 
    },
    infoCard: { 
        flexDirection: 'row', 
        backgroundColor: '#fffbeb', 
        padding: 16, 
        borderRadius: 12, 
        alignItems: 'flex-start', 
        gap: 12, 
        borderWidth: 1, 
        borderColor: '#fef3c7' 
    },
    rejectionCard: { 
        backgroundColor: '#fee2e2', 
        borderColor: '#fecaca' 
    },
    infoCardContent: { 
        flex: 1 
    },
    infoCardTitle: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 15, 
        color: '#b45309', 
        marginBottom: 4 
    },
    infoCardText: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 13, 
        color: '#b45309', 
        lineHeight: 18 
    },
    editRejectedButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#dc2626', 
        paddingVertical: 8, 
        paddingHorizontal: 12, 
        borderRadius: 6, 
        alignSelf: 'flex-start', 
        marginTop: 10, 
        gap: 6 
    },
    editRejectedButtonText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 13, 
        color: '#ffffff' 
    }
});