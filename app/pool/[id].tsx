///home/project/app/pool/[id].tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
    Image, Dimensions, ActivityIndicator, SafeAreaView, Alert, Modal
} from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import {
    MapPin, Users, Clock, Waves, Umbrella, ShowerHead, Car, Wifi, 
    ChevronLeft, Calendar, Grill, Square, Thermometer, Bath, 
    Flame, Warehouse, X, Coffee, UtensilsCrossed, Party, Shield, 
    Gift, Crown, CheckCircle, XCircle, Star
} from 'lucide-react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import Animated, {
    FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, 
    interpolate, Extrapolate, withTiming, withSpring
} from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const IMAGE_ASPECT_RATIO = 16 / 9;
const IMAGE_HEIGHT = windowWidth / IMAGE_ASPECT_RATIO;

// Carte des icônes pour les équipements
const iconMap: { [key: string]: React.ElementType } = {
    Wifi, Car, Umbrella, Waves, Thermometer, ShowerHead, Bath, Flame, 
    Warehouse, Coffee, UtensilsCrossed, Party, Shield, Grill,
    Birthday: Gift,
    BirthdayPremium: Crown
};

// Composant spécial pour l'icône d'anniversaire premium
const PremiumBirthdayIcon = ({ size = 24, color = '#000000' }) => (
    <View style={{ position: 'relative' }}>
        <Gift size={size} color={color} />
        <View style={{ position: 'absolute', top: -5, right: -5 }}>
            <Crown size={size * 0.6} color="#FFD700" />
        </View>
    </View>
);

// Interface pour les détails de l'annonce
interface PoolListingDetail {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    price_per_hour: number | null;
    capacity: number | null;
    created_at: string;
    owner_id: string;
    status: string;
    owner_presence: string;
    access_method: string;
    access_instructions: string | null;
    privacy_level: string;
    environment: string;
    wifi_available: boolean;
    wifi_code: string | null;
    pool_type: string;
    heated: boolean;
    night_lighting: boolean;
    water_treatment: string;
    pool_length: number | null;
    pool_width: number | null;
    pool_depth_min: number | null;
    pool_depth_max: number | null;
    food_allowed: string;
    music_allowed: string;
    photos_allowed: string;
    pets_allowed: string;
    min_age: string;
    accepted_groups: string[];
    // Relations
    profiles: { 
        full_name: string | null;
        avatar_url?: string | null;
    } | null;
    pool_images: { 
        id: string;
        url: string;
        position: number;
    }[] | null;
    amenities: {
        id: string;
        name: string;
        icon_name: string | null;
        category: string | null;
    }[] | null;
    schedules: {
        id: string;
        day_of_week: number; 
        start_time: string;
        end_time: string;
    }[] | null;
    extras: {
        id: string;
        extra_id: string;
        price: number;
        extra_name: string; 
        icon_name: string | null;
        description: string | null;
    }[] | null;
   reviews?: Review[];
    average_rating?: number;
    reviews_count?: number;
}
interface Review {
    id: string;
    reviewer_id: string;
    listing_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    host_response: string | null;
    host_response_at: string | null;
    reviewer: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

export default function PoolDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const [poolDetail, setPoolDetail] = useState<PoolListingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState(false);

    // Chargement des polices
    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // Récupération des détails de l'annonce
    const fetchPoolDetails = useCallback(async () => {
        if (!id) { 
            setError("ID de l'annonce manquant"); 
            setLoading(false); 
            return; 
        }
        
        setLoading(true);
        setError(null);
        
        try {
            console.log(`🔍 Récupération des détails pour l'annonce ID: ${id}`);
            
            // Appel à la fonction RPC pour récupérer les détails de l'annonce
            const { data, error: fetchError } = await supabase
    .rpc('get_listing_details_with_reviews', { p_listing_id: id });
            if (fetchError) {
                console.error("Erreur Supabase:", fetchError);
                throw new Error(`Erreur lors de la récupération des détails: ${fetchError.message}`);
            }
            
            if (!data) {
                throw new Error("Annonce non trouvée ou inaccessible");
            }
            
            console.log("✅ Détails reçus:", data);
            setPoolDetail(data as PoolListingDetail);
            
            // Vérifie si l'utilisateur connecté est le propriétaire
            if (user && data.owner_id === user.id) {
                setIsOwner(true);
            }
            
        } catch (err: any) {
            console.error("Erreur chargement annonce:", err);
            setError(err.message || "Erreur lors du chargement de l'annonce");
            setPoolDetail(null);
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    // Chargement au montage
    useEffect(() => {
        if (fontsLoaded && !fontError && id) {
            fetchPoolDetails();
        } else if (!id && fontsLoaded) {
            setError("ID de l'annonce manquant");
            setLoading(false);
        }
        
        if (fontError && !loading) {
            setError("Erreur lors du chargement des polices");
            setLoading(false);
            console.error("Erreur polices:", fontError);
        }
    }, [id, fontsLoaded, fontError, fetchPoolDetails]);

    // Animations
    const scrollY = useSharedValue(0);
    const imageScale = useSharedValue(1);
    
    const headerStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            scrollY.value,
            [0, 100],
            [1, 0],
            Extrapolate.CLAMP
        );
        
        return {
            opacity: withTiming(opacity),
            transform: [{
                translateY: withTiming(
                    interpolate(scrollY.value, [0, 100], [0, -50], Extrapolate.CLAMP)
                )
            }]
        };
    });
    
    const imageStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withSpring(imageScale.value) }]
        };
    });
    
    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        scrollY.value = offsetY;
        
        if (offsetY < 0) {
            imageScale.value = interpolate(
                offsetY,
                [-100, 0],
                [1.2, 1],
                Extrapolate.CLAMP
            );
        } else {
            imageScale.value = 1;
        }
    };

    // Gestion de l'affichage des images en modal
    const handleImagePress = useCallback((imageUrl: string) => {
        setSelectedImageUrl(imageUrl);
        setIsModalVisible(true);
    }, []);

    // Navigation vers la page de réservation
    const handleBooking = () => {
        if (poolDetail) {
            router.push({
                pathname: '/booking',
                params: { listingId: poolDetail.id }
            });
        } else {
            Alert.alert("Erreur", "Impossible de démarrer la réservation, données manquantes");
        }
    };

    // Navigation vers la page d'édition (pour le propriétaire)
    const handleEdit = () => {
        if (poolDetail && isOwner) {
            router.push({
                pathname: '/host/edit-listing/[id]',
                params: { id: poolDetail.id }
            });
        }
    };

    // Formatage des jours disponibles
    const formatSchedules = (schedules: PoolListingDetail['schedules']) => {
        if (!schedules || schedules.length === 0) return "Non spécifié";
        
        const daysMap = ["", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
        const days = schedules.map(s => daysMap[s.day_of_week]).join(", ");
        
        // Utiliser le premier horaire comme référence
        const firstSchedule = schedules[0];
        if (!firstSchedule) return days;
        
        // Formatage des heures
        const startTime = firstSchedule.start_time.substring(0, 5); // HH:MM
        const endTime = firstSchedule.end_time.substring(0, 5); // HH:MM
        
        return `${days} de ${startTime} à ${endTime}`;
    };

    // Chargement
    if (loading || !fontsLoaded) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
            </SafeAreaView>
        );
    }
    
    // Gestion des erreurs
    if (fontError) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.errorText}>Erreur chargement polices</Text>
            </SafeAreaView>
        );
    }
    
    if (error || !poolDetail) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Erreur' }} />
                <View style={styles.headerStatic}>
                    <TouchableOpacity style={styles.backButton} onPress={router.back}>
                        <ChevronLeft size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitleStatic}>Annonce Indisponible</Text>
                    <View style={{width: 40}}/>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        {error || "Annonce non trouvée ou inaccessible"}
                    </Text>
                    <TouchableOpacity style={styles.buttonLink} onPress={router.back}>
                        <Text style={styles.buttonLinkText}>Retour</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Rendu principal
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header animé */}
            <Animated.View style={[styles.header, headerStyle]}>
                <TouchableOpacity style={styles.backButton} onPress={router.back}>
                    <ChevronLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {poolDetail.title}
                    </Text>
                    <View style={styles.locationRowHeader}>
                        <MapPin size={14} color="#64748b" />
                        <Text style={styles.locationTextHeader} numberOfLines={1}>
                            {poolDetail.location || 'Lieu non spécifié'}
                        </Text>
                    </View>
                </View>
                
                {isOwner && (
                    <TouchableOpacity 
                        style={styles.editButton} 
                        onPress={handleEdit}
                    >
                        <Text style={styles.editButtonText}>Éditer</Text>
                    </TouchableOpacity>
                )}
            </Animated.View>

            {/* Contenu principal */}
            <ScrollView 
                style={styles.scrollView} 
                onScroll={handleScroll} 
                scrollEventThrottle={16}
            >
                {/* Carousel d'images */}
                <View style={styles.imageContainer}>
                    {poolDetail.pool_images && poolDetail.pool_images.length > 0 ? (
                        <Carousel
                            loop={poolDetail.pool_images.length > 1}
                            width={windowWidth}
                            height={IMAGE_HEIGHT}
                            autoPlay={false}
                            data={poolDetail.pool_images}
                            onSnapToItem={(index) => setCurrentImageIndex(index)}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => handleImagePress(item.url)} 
                                    activeOpacity={0.9}
                                >
                                    <Animated.View style={[styles.imageWrapper, imageStyle]}>
                                        <Image
                                            source={{ uri: item.url }}
                                            style={styles.poolImage}
                                            resizeMode="cover"
                                        />
                                    </Animated.View>
                                </TouchableOpacity>
                            )}
                        />
                    ) : (
                        <View style={[styles.imageWrapper, styles.placeholderImage]}>
                            <Text style={styles.noImageText}>Aucune image disponible</Text>
                        </View>
                    )}
                    
                    {/* Pagination d'images */}
                    {poolDetail.pool_images && poolDetail.pool_images.length > 1 && (
                        <View style={styles.imagePagination}>
                            {poolDetail.pool_images.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.paginationDot,
                                        currentImageIndex === index && styles.paginationDotActive
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                    
                    {/* Badge de statut pour le propriétaire */}
                    {isOwner && (
                        <View style={[
                            styles.statusBadge,
                            poolDetail.status === 'approved' ? styles.statusApproved :
                            poolDetail.status === 'pending' ? styles.statusPending :
                            poolDetail.status === 'rejected' ? styles.statusRejected :
                            styles.statusDraft
                        ]}>
                            <Text style={styles.statusText}>
                                {poolDetail.status === 'approved' ? 'Approuvée' :
                                 poolDetail.status === 'pending' ? 'En attente' :
                                 poolDetail.status === 'rejected' ? 'Refusée' :
                                 'Brouillon'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Contenu détaillé */}
                <View style={styles.content}>
                    {/* Section d'info principale */}
                    <Animated.View style={styles.infoSection} entering={FadeInDown.delay(100)}>
                        <Text style={styles.mainTitle}>{poolDetail.title}</Text>
                        
                        <View style={styles.locationRowContent}>
                            <MapPin size={16} color="#64748b" />
                            <Text style={styles.locationTextContent}>
                                {poolDetail.location || 'Lieu non spécifié'}
                            </Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <Users size={20} color="#0891b2" />
                                <Text style={styles.infoText}>
                                    {poolDetail.capacity || '?'} pers. max
                                </Text>
                            </View>
                            
                            {poolDetail.schedules && poolDetail.schedules.length > 0 && (
                                <View style={styles.infoItem}>
                                    <Clock size={20} color="#0891b2" />
                                    <Text style={styles.infoText}>
                                        {formatSchedules(poolDetail.schedules)}
                                    </Text>
                                </View>
                            )}
                        </View>
                        
                        {/* Options principales mise en avant */}
                        <View style={styles.keyFeaturesRow}>
                            {poolDetail.heated && (
                                <View style={styles.keyFeature}>
                                    <Thermometer size={18} color="#0891b2" />
                                    <Text style={styles.keyFeatureText}>Chauffée</Text>
                                </View>
                            )}
                            
                            {poolDetail.night_lighting && (
                                <View style={styles.keyFeature}>
                                    <Flame size={18} color="#0891b2" />
                                    <Text style={styles.keyFeatureText}>Éclairage</Text>
                                </View>
                            )}
                            
                            {poolDetail.wifi_available && (
                                <View style={styles.keyFeature}>
                                    <Wifi size={18} color="#0891b2" />
                                    <Text style={styles.keyFeatureText}>WiFi</Text>
                                </View>
                            )}
                        </View>
                    </Animated.View>

                    {/* Description */}
                    <Animated.View style={styles.section} entering={FadeInDown.delay(200)}>
                        <Text style={styles.sectionTitle}>À propos de cette piscine</Text>
                        <Text style={styles.description}>
                            {poolDetail.description || 'Aucune description fournie.'}
                        </Text>
                    </Animated.View>

                    {/* Caractéristiques de la piscine */}
                    <Animated.View style={styles.section} entering={FadeInDown.delay(250)}>
                        <Text style={styles.sectionTitle}>Caractéristiques</Text>
                        <View style={styles.specsList}>
                            <View style={styles.specItem}>
                                <Text style={styles.specLabel}>Type de piscine</Text>
                                <Text style={styles.specValue}>
                                    {poolDetail.pool_type === 'inground' ? 'Enterrée' :
                                     poolDetail.pool_type === 'aboveground' ? 'Hors-sol' :
                                     poolDetail.pool_type === 'natural' ? 'Naturelle' : 'Autre'}
                                </Text>
                            </View>
                            
                            {(poolDetail.pool_length || poolDetail.pool_width) && (
                                <View style={styles.specItem}>
                                    <Text style={styles.specLabel}>Dimensions</Text>
                                    <Text style={styles.specValue}>
                                        {poolDetail.pool_length || '?'} × {poolDetail.pool_width || '?'} m
                                    </Text>
                                </View>
                            )}
                            
                            {(poolDetail.pool_depth_min || poolDetail.pool_depth_max) && (
                                <View style={styles.specItem}>
                                    <Text style={styles.specLabel}>Profondeur</Text>
                                    <Text style={styles.specValue}>
                                        {poolDetail.pool_depth_min ? `${poolDetail.pool_depth_min} m` : '?'} 
                                        {' à '} 
                                        {poolDetail.pool_depth_max ? `${poolDetail.pool_depth_max} m` : '?'}
                                    </Text>
                                </View>
                            )}
                            
                            <View style={styles.specItem}>
                                <Text style={styles.specLabel}>Traitement de l'eau</Text>
                                <Text style={styles.specValue}>
                                    {poolDetail.water_treatment === 'chlorine' ? 'Chlore' :
                                     poolDetail.water_treatment === 'salt' ? 'Sel' :
                                     poolDetail.water_treatment === 'bromine' ? 'Brome' : 'Autre'}
                                </Text>
                            </View>
                            
                            <View style={styles.specItem}>
                                <Text style={styles.specLabel}>Environnement</Text>
                                <Text style={styles.specValue}>
                                    {poolDetail.environment === 'garden' ? 'Jardin' :
                                     poolDetail.environment === 'indoor' ? 'Intérieur' :
                                     poolDetail.environment === 'rooftop' ? 'Toit-terrasse' : 
                                     poolDetail.environment === 'courtyard' ? 'Cour' : 'Autre'}
                                </Text>
                            </View>
                            
                            <View style={styles.specItem}>
                                <Text style={styles.specLabel}>Niveau d'intimité</Text>
                                <Text style={styles.specValue}>
                                    {poolDetail.privacy_level === 'none' ? 'Pas de vis-à-vis' :
                                     poolDetail.privacy_level === 'low' ? 'Peu de vis-à-vis' :
                                     poolDetail.privacy_level === 'medium' ? 'Vis-à-vis limité' : 'Vis-à-vis présent'}
                                </Text>
                            </View>
                            
                            <View style={styles.specItem}>
                                <Text style={styles.specLabel}>Présence de l'hôte</Text>
                                <Text style={styles.specValue}>
                                    {poolDetail.owner_presence === 'present' ? 'Présent' :
                                     poolDetail.owner_presence === 'absent' ? 'Absent' :
                                     poolDetail.owner_presence === 'occasional' ? 'Occasionnelle' : 'Variable'}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Règles */}
                    <Animated.View style={styles.section} entering={FadeInDown.delay(300)}>
                        <Text style={styles.sectionTitle}>Règles</Text>
                        <View style={styles.rulesList}>
                            <View style={styles.ruleItem}>
                                <Text style={styles.ruleLabel}>Nourriture</Text>
                                <Text style={styles.ruleValue}>
                                    {poolDetail.food_allowed === 'allowed' ? 'Autorisée' :
                                     poolDetail.food_allowed === 'limited' ? 'Autorisée avec restrictions' :
                                     poolDetail.food_allowed === 'outside_only' ? 'Autorisée à l\'extérieur' : 'Non autorisée'}
                                </Text>
                            </View>
                            
                            <View style={styles.ruleItem}>
                                <Text style={styles.ruleLabel}>Musique</Text>
                                <Text style={styles.ruleValue}>
                                    {poolDetail.music_allowed === 'yes' ? 'Autorisée' :
                                     poolDetail.music_allowed === 'low' ? 'Volume modéré' : 'Non autorisée'}
                                </Text>
                            </View>
                            
                            <View style={styles.ruleItem}>
                                <Text style={styles.ruleLabel}>Photos</Text>
                                <Text style={styles.ruleValue}>
                                    {poolDetail.photos_allowed === 'yes' ? 'Autorisées' : 'Non autorisées'}
                                </Text>
                            </View>
                            
                            <View style={styles.ruleItem}>
                                <Text style={styles.ruleLabel}>Animaux</Text>
                                <Text style={styles.ruleValue}>
                                    {poolDetail.pets_allowed === 'allowed' ? 'Autorisés' :
                                     poolDetail.pets_allowed === 'small_only' ? 'Petits animaux' : 'Non autorisés'}
                                </Text>
                            </View>
                            
                            <View style={styles.ruleItem}>
                                <Text style={styles.ruleLabel}>Âge minimum</Text>
                                <Text style={styles.ruleValue}>
                                    {poolDetail.min_age === 'all' ? 'Tous âges' :
                                     poolDetail.min_age === 'supervised' ? 'Enfants supervisés' :
                                     poolDetail.min_age === '12' ? '12 ans et +' :
                                     poolDetail.min_age === '16' ? '16 ans et +' : '18 ans et +'}
                                </Text>
                            </View>
                            
                            <View style={styles.ruleItem}>
                                <Text style={styles.ruleLabel}>Groupes acceptés</Text>
                                <Text style={styles.ruleValue}>
                                    {poolDetail.accepted_groups?.length > 0 
                                        ? poolDetail.accepted_groups
                                            .map(g => 
                                                g === 'families' ? 'Familles' :
                                                g === 'couples' ? 'Couples' :
                                                g === 'mixed' ? 'Groupes mixtes' :
                                                g === 'friends' ? 'Amis' : 
                                                g === 'corporate' ? 'Entreprises' : g
                                            )
                                            .join(', ')
                                        : 'Non spécifié'}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Équipements */}
                    {poolDetail.amenities && poolDetail.amenities.length > 0 && (
                        <Animated.View style={styles.section} entering={FadeInDown.delay(350)}>
                            <Text style={styles.sectionTitle}>Équipements</Text>
                            <View style={styles.amenitiesGrid}>
                                {poolDetail.amenities.map((amenity) => {
                                    if (!amenity?.id) return null;
                                    const IconComponent = amenity.icon_name && iconMap[amenity.icon_name] 
                                        ? iconMap[amenity.icon_name] 
                                        : Square;
                                    
                                    return (
                                        <View key={amenity.id} style={styles.amenityItem}>
                                            <View style={styles.amenityIconWrapper}>
                                                <IconComponent size={18} color="#0891b2" strokeWidth={1.5} />
                                            </View>
                                            <Text style={styles.amenityLabel}>{amenity.name}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </Animated.View>
                    )}

                    {/* Extras & Services */}
                    {poolDetail.extras && poolDetail.extras.length > 0 && (
                        <Animated.View style={styles.section} entering={FadeInDown.delay(400)}>
                            <Text style={styles.sectionTitle}>Services additionnels</Text>
                            <View style={styles.extrasList}>
                                {poolDetail.extras.map((extra) => {
                                    if (!extra?.id) return null;
                                    const IconComponent = extra.icon_name && iconMap[extra.icon_name] 
                                        ? iconMap[extra.icon_name] 
                                        : Square;
                                    
                                    return (
                                        <View key={extra.id} style={styles.extraItem}>
                                            <View style={styles.extraHeader}>
                                                <View style={styles.extraIconWrapper}>
                                                    <IconComponent size={18} color="#0891b2" strokeWidth={1.5} />
                                                </View>
                                                <Text style={styles.extraName}>{extra.extra_name}</Text>
                                                <Text style={styles.extraPrice}>{extra.price} MAD</Text>
                                            </View>
                                            {extra.description && (
                                                <Text style={styles.extraDescription}>{extra.description}</Text>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </Animated.View>
                    )}

                    {/* Disponibilités */}
                    <Animated.View style={styles.section} entering={FadeInDown.delay(450)}>
                        <Text style={styles.sectionTitle}>Disponibilités</Text>
                        <Text style={styles.availabilityText}>
                            {poolDetail.schedules && poolDetail.schedules.length > 0 
                                ? formatSchedules(poolDetail.schedules)
                                : "Horaires non spécifiés. Contactez l'hôte pour plus d'informations."}
                        </Text>
                        <Text style={styles.availabilityNote}>
                            Cliquez sur "Réserver" pour voir le calendrier complet de disponibilité
                        </Text>
                    </Animated.View>

                    {/* À propos de l'hôte */}
                    <Animated.View style={[styles.section, styles.lastSection]} entering={FadeInDown.delay(500)}>
                        <Text style={styles.sectionTitle}>À propos de l'hôte</Text>
                        <View style={styles.hostInfo}>
                            <View style={styles.hostAvatar}>
                                {poolDetail.profiles?.avatar_url ? (
                                    <Image 
                                        source={{ uri: poolDetail.profiles.avatar_url }} 
                                        style={styles.avatarImage} 
                                    />
                                ) : (
                                    <Users size={24} color="#64748b" />
                                )}
                            </View>
                            <Text style={styles.hostName}>
                                {poolDetail.profiles?.full_name || "Hôte"}
                            </Text>
                        </View>
                    </Animated.View>
                {poolDetail.reviews && poolDetail.reviews.length > 0 ? (
    <Animated.View style={styles.section} entering={FadeInDown.delay(550)}>
        <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Avis</Text>
            <View style={styles.ratingBadge}>
                <Text style={styles.ratingScore}>
                    {poolDetail.average_rating?.toFixed(1) || '0.0'}
                </Text>
                <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                            key={star} 
                            size={14} 
                            color={star <= Math.round(poolDetail.average_rating || 0) ? '#f59e0b' : '#d1d5db'} 
                            fill={star <= Math.round(poolDetail.average_rating || 0) ? '#f59e0b' : 'transparent'} 
                        />
                    ))}
                </View>
                <Text style={styles.reviewsCount}>
                    ({poolDetail.reviews_count || 0})
                </Text>
            </View>
        </View>

        {poolDetail.reviews.slice(0, 3).map((review) => (
            <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                        <View style={styles.reviewerAvatar}>
                            {review.reviewer?.avatar_url ? (
                                <Image 
                                    source={{ uri: review.reviewer.avatar_url }} 
                                    style={styles.reviewerAvatarImage} 
                                />
                            ) : (
                                <Users size={16} color="#64748b" />
                            )}
                        </View>
                        <Text style={styles.reviewerName}>
                            {review.reviewer?.full_name || "Utilisateur"}
                        </Text>
                    </View>
                    <View style={styles.reviewRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                                key={star} 
                                size={14} 
                                color={star <= review.rating ? '#f59e0b' : '#d1d5db'} 
                                fill={star <= review.rating ? '#f59e0b' : 'transparent'} 
                            />
                        ))}
                    </View>
                    <Text style={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString('fr-FR', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric'
                        })}
                    </Text>
                </View>

                {review.comment && (
                    <Text style={styles.reviewComment}>
                        {review.comment}
                    </Text>
                )}

                {review.host_response && (
                    <View style={styles.hostResponse}>
                        <Text style={styles.hostResponseLabel}>Réponse de l'hôte:</Text>
                        <Text style={styles.hostResponseText}>{review.host_response}</Text>
                        {review.host_response_at && (
                            <Text style={styles.hostResponseDate}>
                                {new Date(review.host_response_at).toLocaleDateString('fr-FR', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric'
                                })}
                            </Text>
                        )}
                    </View>
                )}
            </View>
        ))}

        {poolDetail.reviews.length > 3 && (
            <TouchableOpacity style={styles.viewAllReviewsButton}>
                <Text style={styles.viewAllReviewsText}>
                    Voir tous les avis ({poolDetail.reviews_count})
                </Text>
            </TouchableOpacity>
        )}
    </Animated.View>
) : (
    isOwner ? null : (
        <Animated.View style={styles.section} entering={FadeInDown.delay(550)}>
            <Text style={styles.sectionTitle}>Avis</Text>
            <Text style={styles.noReviewsText}>Aucun avis pour le moment</Text>
        </Animated.View>
    )
)}
                </View>
            </ScrollView>

            {/* Footer - Prix et bouton de réservation */}
            <Animated.View style={styles.footer} entering={FadeIn.delay(600)}>
                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Prix</Text>
                    <Text style={styles.price}>
                        {poolDetail.price_per_hour || 'N/A'} MAD
                        <Text style={styles.priceUnit}> / heure</Text>
                    </Text>
                </View>
                
                {!isOwner ? (
                    <TouchableOpacity 
                        style={styles.bookButton}
                        onPress={handleBooking}
                    >
                        <Text style={styles.bookButtonText}>Réserver</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        style={styles.editButtonLarge}
                        onPress={handleEdit}
                    >
                        <Text style={styles.editButtonLargeText}>Modifier l'annonce</Text>
                    </TouchableOpacity>
                )}
            </Animated.View>

            {/* Modal pour affichage d'image en plein écran */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPressOut={() => setIsModalVisible(false)}
                    />
                    <View style={styles.modalContent}>
                        <Image
                            source={{ uri: selectedImageUrl || undefined }}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIsModalVisible(false)}
                        >
                            <X size={28} color="#ffffff" strokeWidth={3} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Conteneurs principaux
    container: { 
        flex: 1, 
        backgroundColor: '#ffffff' 
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    errorContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20
    },
    scrollView: { 
        flex: 1, 
        backgroundColor: '#ffffff' 
    },
    content: { 
        padding: 16, 
        backgroundColor: '#ffffff', 
        borderTopLeftRadius: 20, 
        borderTopRightRadius: 20, 
        marginTop: -20, 
        minHeight: windowHeight - IMAGE_HEIGHT + 20 
    },
    
    // Éléments d'erreur et de chargement
    errorText: { 
        fontFamily: 'Montserrat-Regular', 
        color: '#dc2626', 
        fontSize: 16, 
        textAlign: 'center', 
        marginBottom: 15 
    },
    buttonLink: { 
        marginTop: 15, 
        paddingVertical: 10 
    },
    buttonLinkText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 16, 
        color: '#0891b2', 
        textAlign: 'center' 
    },
    
    // Headers
    headerStatic: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        paddingTop: Platform.OS === 'android' ? 40 : 60, 
        backgroundColor: '#ffffff', 
        borderBottomWidth: 1, 
        borderBottomColor: '#e5e7eb' 
    },
    headerTitleStatic: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 18, 
        color: '#111827', 
        flex: 1, 
        textAlign: 'center'
    },
    header: { 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 10, 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingTop: Platform.OS === 'android' ? 40 : 60, 
        paddingBottom: 12, 
        backgroundColor: 'rgba(255,255,255,0.9)', 
        borderBottomWidth: 1, 
        borderBottomColor: 'rgba(229, 231, 235, 0.7)'
    },
    backButton: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        backgroundColor: 'rgba(248, 250, 252, 0.8)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    headerContent: { 
        flex: 1, 
        marginLeft: 12 
    },
    headerTitle: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 16, 
        color: '#1e293b', 
        marginBottom: 2 
    },
    locationRowHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 4 
    },
    locationTextHeader: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 12, 
        color: '#64748b' 
    },
    
    // Images
    imageContainer: { 
        height: IMAGE_HEIGHT, 
        position: 'relative', 
        backgroundColor: '#f3f4f6' 
    },
    imageWrapper: { 
        width: windowWidth, 
        height: IMAGE_HEIGHT 
    },
    poolImage: { 
        width: '100%', 
        height: '100%' 
    },
    placeholderImage: { 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#d1d5db', 
        borderStyle: 'dashed'
    },
    noImageText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#6b7280'
    },
    imagePagination: { 
        position: 'absolute', 
        bottom: 16, 
        left: 0, 
        right: 0, 
        flexDirection: 'row', 
        justifyContent: 'center', 
        gap: 6 
    },
    paginationDot: { 
        width: 8, 
        height: 8, 
        borderRadius: 4, 
        backgroundColor: 'rgba(255, 255, 255, 0.6)' 
    },
    paginationDotActive: { 
        backgroundColor: '#ffffff' 
    },
    
    // Sections et titres
    section: { 
        marginBottom: 24, 
        paddingBottom: 24, 
        borderBottomWidth: 1, 
        borderBottomColor: '#f1f5f9' 
    },
    lastSection: {
        marginBottom: 0,
        paddingBottom: 0,
        borderBottomWidth: 0
    },
    infoSection: { 
        marginBottom: 16, 
        paddingBottom: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#f1f5f9' 
    },
    sectionTitle: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 18, 
        color: '#1e293b', 
        marginBottom: 16 
    },
    mainTitle: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 22, 
        color: '#1e293b', 
        marginBottom: 8
    },
    
    // Informations principales
    locationRowContent: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6, 
        marginBottom: 12 
    },
    locationTextContent: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 14, 
        color: '#64748b'
    },
    infoRow: { 
        flexDirection: 'row', 
        gap: 20, 
        marginTop: 8 
    },
    infoItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 6 
    },
    infoText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 14, 
        color: '#374151' 
    },
    description: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 15, 
        color: '#4b5563', 
        lineHeight: 22 
    },
    
    // Caractéristiques clés
    keyFeaturesRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 12
    },
    keyFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f9ff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6
    },
    keyFeatureText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 12,
        color: '#0891b2'
    },
    
    // Caractéristiques détaillées
    specsList: {
        gap: 12
    },
    specItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    specLabel: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 15,
        color: '#4b5563',
        flex: 1
    },
    specValue: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 15,
        color: '#1e293b',
        textAlign: 'right',
        flex: 1
    },
    
    // Règles
    rulesList: {
        gap: 12
    },
    ruleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    ruleLabel: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 15,
        color: '#4b5563',
        flex: 1
    },
    ruleValue: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 15,
        color: '#1e293b',
        textAlign: 'right',
        flex: 1
    },
    
    // Aménités et Équipements
    amenitiesGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 12,
        marginTop: 8
    },
    amenityItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        width: '46%', 
        marginVertical: 6
    },
    amenityIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f0f9ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8
    },
    amenityLabel: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 14, 
        color: '#1e293b',
        flexShrink: 1
    },
    
    // Extras et Services
    extrasList: {
        gap: 16
    },
    extraItem: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 12
    },
    extraHeader: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    extraIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#e0f2fe',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    extraName: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 15,
        color: '#0c4a6e',
        flex: 1
    },
    extraPrice: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 16,
        color: '#0891b2'
    },
    extraDescription: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
        marginLeft: 42
    },
    
    // Disponibilités
    availabilityText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 15, 
        color: '#1e293b', 
        marginBottom: 8
    },
    availabilityNote: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#64748b',
        fontStyle: 'italic'
    },
    
    // Badges de statut
    statusBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        zIndex: 10
    },
    statusApproved: {
        backgroundColor: '#d1fae5'
    },
    statusPending: {
        backgroundColor: '#fef3c7'
    },
    statusRejected: {
        backgroundColor: '#fee2e2'
    },
    statusDraft: {
        backgroundColor: '#f1f5f9'
    },
    statusText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    
    // Informations sur l'hôte
    hostInfo: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    hostAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    avatarImage: {
        width: 50,
        height: 50,
        borderRadius: 25
    },
    hostName: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 16,
        color: '#1e293b'
    },
    
    // Footer et boutons
    footer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: 16, 
        backgroundColor: '#ffffff', 
        borderTopWidth: 1, 
        borderTopColor: '#e5e7eb', 
        paddingBottom: Platform.OS === 'web' ? 16 : 34 
    },
    priceContainer: { 
        flexShrink: 1, 
        marginRight: 16 
    },
    priceLabel: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 14, 
        color: '#64748b' 
    },
    price: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 20, 
        color: '#1e293b' 
    },
    priceUnit: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 14, 
        color: '#64748b' 
    },
    bookButton: { 
        backgroundColor: '#0891b2', 
        paddingHorizontal: 32, 
        paddingVertical: 14, 
        borderRadius: 12 
    },
    bookButtonText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 16, 
        color: '#ffffff' 
    },
    editButton: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    editButtonText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 13,
        color: '#475569'
    },
    editButtonLarge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    editButtonLargeText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 16,
        color: '#475569'
    },
    
    // Modal image plein écran
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)'
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    modalContent: {
        width: '90%',
        height: '80%',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 20,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    // Styles pour les avis
    reviewsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4
    },
    ratingScore: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 14,
        color: '#1e293b'
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2
    },
    reviewsCount: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 12,
        color: '#64748b'
    },
    reviewItem: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12
    },
    reviewHeader: {
        marginBottom: 10
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6
    },
    reviewerAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8
    },
    reviewerAvatarImage: {
        width: 28,
        height: 28,
        borderRadius: 14
    },
    reviewerName: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: '#1e293b'
    },
    reviewRating: {
        flexDirection: 'row',
        gap: 2,
        marginBottom: 4
    },
    reviewDate: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 12,
        color: '#64748b',
        marginBottom: 6
    },
    reviewComment: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20
    },
    hostResponse: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingLeft: 12
    },
    hostResponseLabel: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 13,
        color: '#0891b2',
        marginBottom: 4
    },
    hostResponseText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 13,
        color: '#4b5563',
        fontStyle: 'italic',
        lineHeight: 18
    },
    hostResponseDate: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 4
    },
    viewAllReviewsButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 8,
        backgroundColor: '#f1f5f9',
        borderRadius: 8
    },
    viewAllReviewsText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: '#0891b2'
    },
    noReviewsText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginVertical: 12
    }
});