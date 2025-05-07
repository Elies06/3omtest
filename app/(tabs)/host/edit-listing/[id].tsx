import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity,
    Platform, Image, ActivityIndicator, SafeAreaView, Modal, StyleSheet, Switch 
} from 'react-native';
import {
    Wifi, Car, Umbrella, Waves, Thermometer, ShowerHead, Bath, Flame, Warehouse,
    Coffee, UtensilsCrossed, Party, Shield, Edit, CheckCircle, XCircle as CancelIcon,
    ChevronRight, Trash2, Info, Save, Plus, CalendarClock, Banknote, Clock as ClockIcon,
    MapPin, DollarSign, Users, Image as ImageIcon, CheckSquare, Square, X as XIcon,
    ArrowLeft, Gift, Crown, PartyPopper
} from 'lucide-react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { format, parse, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

// Interfaces
interface City { id: string | number; name: string; }
interface Amenity { id: string; name: string; icon_name: string | null; category: string | null; }
interface AmenityCategory { id: string; name: string; label: string; sort_order: number; }
interface PoolExtra { id: string; name: string; description: string | null; price: number; icon_name: string | null; category: string; sort_order: number; }
interface SelectedExtraState { id: string; price: number; active: boolean; }
interface ExistingImage { id: string; url: string; position: number; }
interface ListingDetailsResponse {
    success: boolean;
    message?: string;
    listing?: any;
    amenity_ids?: string[];
    schedules?: any[];
    extras?: any[];
    images?: ExistingImage[];
}
interface FormDataResponse {
    cities: City[];
    amenities: Amenity[];
    categories: AmenityCategory[];
    extras: PoolExtra[];
}
interface UpdateListingResponse {
    success: boolean;
    message?: string;
}

// Composant principal
export default function HostEditListingScreen() {
    const params = useLocalSearchParams<{ id: string | string[] }>();
    const listingId = useMemo(() => {
        const idParam = params.id;
        const potentialId = Array.isArray(idParam) ? idParam[0] : idParam;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(potentialId || '') ? potentialId : null;
    }, [params.id]);

    const iconMap: { [key: string]: React.ElementType } = {
        Wifi, Car, Umbrella, Waves, Thermometer, ShowerHead, Bath, Flame, Warehouse,
        Coffee, UtensilsCrossed, Party, Shield, Edit, CheckCircle, CancelIcon,
        ChevronRight, Trash2, Info, Save, Plus, CalendarClock, Banknote, ClockIcon,
        MapPin, DollarSign, Users, ImageIcon, CheckSquare, Square, XIcon,
        ArrowLeft, Gift, Crown, PartyPopper,
        Birthday: Gift,
        BirthdayPremium: Crown,
        Grill: UtensilsCrossed
    };

    const PremiumBirthdayIcon = ({ size = 24, color = '#000000' }) => (
        <View style={{ position: 'relative' }}>
            <Gift size={size} color={color} />
            <View style={{ position: 'absolute', top: -5, right: -5 }}>
                <Crown size={size * 0.6} color="#FFD700" />
            </View>
        </View>
    );
const CAPACITY_OPTIONS = [
  { value: 2, label: "2 personnes" },
  { value: 4, label: "4 personnes" },
  { value: 6, label: "6 personnes" },
  { value: 8, label: "8 personnes" },
  { value: 10, label: "10 personnes" },
  { value: 15, label: "15 personnes" },
  { value: 20, label: "20 personnes" }
];
  const [loading, setLoading] = useState(false);
    // États
    const { user, sessionInitialized, isLoading: authLoading } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState<string | null>(null);
    const [pricePerHour, setPricePerHour] = useState('');
    const [capacity, setCapacity] = useState('');
    const SIZES = {
        small: { length: '5', width: '3' },
        medium: { length: '8', width: '4' },
        large: { length: '10', width: '5' }
    };
    const getSelectedSize = () => {
        for (const [key, value] of Object.entries(SIZES)) {
            if (value.length === poolLength && value.width === poolWidth) {
                return key;
            }
        }
        return 'custom';
    };
    const handleSizeSelect = (size) => {
        if (size === 'custom') return;
        const { length, width } = SIZES[size];
        setPoolLength(length);
        setPoolWidth(width);
    };
    const [ownerPresence, setOwnerPresence] = useState<string>("present");
    const [accessMethod, setAccessMethod] = useState<string>("owner");
    const [accessInstructions, setAccessInstructions] = useState<string>("");
    const [privacyLevel, setPrivacyLevel] = useState<string>("none");
    const [environment, setEnvironment] = useState<string>("garden");
    const [wifiAvailable, setWifiAvailable] = useState<boolean>(false);
    const [wifiCode, setWifiCode] = useState<string>("");
    const [poolType, setPoolType] = useState<string>("inground");
    const [heated, setHeated] = useState<boolean>(false);
    const [nightLighting, setNightLighting] = useState<boolean>(false);
    const [waterTreatment, setWaterTreatment] = useState<string>("chlorine");
    const [poolLength, setPoolLength] = useState<string>("");
    const [poolWidth, setPoolWidth] = useState<string>("");
    const [poolDepthMin, setPoolDepthMin] = useState<string>("");
    const [poolDepthMax, setPoolDepthMax] = useState<string>("");
    const [foodAllowed, setFoodAllowed] = useState<string>("allowed");
    const [musicAllowed, setMusicAllowed] = useState<string>("yes");
    const [photosAllowed, setPhotosAllowed] = useState<string>("yes");
    const [petsAllowed, setPetsAllowed] = useState<string>("none");
    const [minAge, setMinAge] = useState<string>("all");
    const [acceptedGroups, setAcceptedGroups] = useState<string[]>(["families", "mixed", "couples"]);
    const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);
    const [listingStatus, setListingStatus] = useState<string | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
    const [amenityCategories, setAmenityCategories] = useState<AmenityCategory[]>([]);
    const [availableExtras, setAvailableExtras] = useState<PoolExtra[]>([]);
    const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<string>>(new Set());
    const [selectedExtras, setSelectedExtras] = useState<Map<string, SelectedExtraState>>(new Map());
    const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
    const [newSelectedImages, setNewSelectedImages] = useState<any[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<Set<string>>(new Set());
    const [currentSection, setCurrentSection] = useState(1);
    const [loadingFormData, setLoadingFormData] = useState(true);
    const [loadingCities, setLoadingCities] = useState(true);
    const [loadingAmenities, setLoadingAmenities] = useState(true);
    const [loadingExtras, setLoadingExtras] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const isInitialLoadTriggered = useRef(false);
    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    const isValidDate = (date: any): boolean => {
        return date instanceof Date && !isNaN(date.getTime());
    };

    useEffect(() => {
        if (!sessionInitialized || authLoading) return;
        if (!user) {
            setFormError("Veuillez vous connecter.");
            setLoadingFormData(false);
            return;
        }
        if (!listingId) {
            setFormError("ID d'annonce manquant ou invalide.");
            setLoadingFormData(false);
            return;
        }

        let isMounted = true;

        const fetchListingDataAndFormData = async () => {
            if (isInitialLoadTriggered.current) return;
            isInitialLoadTriggered.current = true;
            
            setLoadingFormData(true);
            setFormError(null);
            setLoadingCities(true);

            try {
                console.log(`>>> Appel RPC get_listing_details_for_edit et get_listing_form_data pour listing ID: ${listingId}`);
                const [detailsResult, formDataResult] = await Promise.all([
                    supabase.rpc('get_listing_details_for_edit', { p_listing_id: listingId }),
                    supabase.rpc('get_listing_form_data')
                ]);

                if (!isMounted) return;

                if (detailsResult.error || !detailsResult.data?.success) {
                    throw new Error(detailsResult.data?.message || detailsResult.error?.message || "Impossible de charger les détails de l'annonce.");
                }

                if (!detailsResult.data?.listing) {
                    throw new Error("Détails de l'annonce non trouvés ou accès non autorisé.");
                }

                const listingDetails = detailsResult.data as ListingDetailsResponse;
                const formData = formDataResult.data as FormDataResponse;

                const { listing, amenity_ids, schedules, extras: listingExtras, images } = listingDetails;
                setTitle(listing!.title || '');
                setDescription(listing!.description || '');
                setLocation(listing!.location || null);
                setPricePerHour(listing!.price_per_hour?.toString() || '');
                setCapacity(listing!.capacity?.toString() || '');
                setListingStatus(listing!.status || null);
                setOwnerPresence(listing!.owner_presence || 'present');
                setAccessMethod(listing!.access_method || 'owner');
                setAccessInstructions(listing!.access_instructions || '');
                setPrivacyLevel(listing!.privacy_level || 'none');
                setEnvironment(listing!.environment || 'garden');
                setWifiAvailable(listing!.wifi_available || false);
                setWifiCode(listing!.wifi_code || '');
                setPoolType(listing!.pool_type || 'inground');
                setHeated(listing!.heated || false);
                setNightLighting(listing!.night_lighting || false);
                setWaterTreatment(listing!.water_treatment || 'chlorine');
                setPoolLength(listing!.pool_length?.toString() || '');
                setPoolWidth(listing!.pool_width?.toString() || '');
                setPoolDepthMin(listing!.pool_depth_min?.toString() || '');
                setPoolDepthMax(listing!.pool_depth_max?.toString() || '');
                setFoodAllowed(listing!.food_allowed || 'allowed');
                setMusicAllowed(listing!.music_allowed || 'yes');
                setPhotosAllowed(listing!.photos_allowed || 'yes');
                setPetsAllowed(listing!.pets_allowed || 'none');
                setMinAge(listing!.min_age || 'all');
                setAcceptedGroups(listing!.accepted_groups || ["families", "mixed", "couples"]);
                setSelectedAmenityIds(new Set(amenity_ids || []));

                const firstSchedule = schedules?.[0];
                if (firstSchedule && schedules) {
                    const scheduleDays = new Set(schedules.map(s => s.day_of_week));
                    setSelectedDays(scheduleDays);
                    try {
                        const baseDate = new Date();
                        baseDate.setSeconds(0, 0);
                        const [startH, startM, startS] = firstSchedule.start_time.split(':').map(Number);
                        const startDate = new Date(baseDate);
                        startDate.setHours(startH, startM, startS || 0);
                        if (isValidDate(startDate)) setStartTime(startDate); else setStartTime(null);
                        const [endH, endM, endS] = firstSchedule.end_time.split(':').map(Number);
                        const endDate = new Date(baseDate);
                        endDate.setHours(endH, endM, endS || 0);
                        if (isValidDate(endDate)) setEndTime(endDate); else setEndTime(null);
                    } catch (timeParseError) {
                        console.error("Erreur parsing horaires:", timeParseError);
                        setStartTime(null);
                        setEndTime(null);
                    }
                } else {
                    setSelectedDays(new Set());
                    setStartTime(null);
                    setEndTime(null);
                }

                setExistingImages(images || []);
                setNewSelectedImages([]);
                setImagesToDelete(new Set());

                setCities(formData.cities || []);
                setAvailableAmenities(formData.amenities || []);
                setAmenityCategories(formData.categories || []);
                setAvailableExtras(formData.extras || []);

                const extrasMap = new Map();
                formData.extras?.forEach(extra => {
                    extrasMap.set(extra.id, {
                        id: extra.id,
                        price: extra.price,
                        active: false
                    });
                });

                if (listingDetails.extras && listingDetails.extras.length > 0) {
                    listingDetails.extras.forEach(selectedExtra => {
                        if (extrasMap.has(selectedExtra.extra_id)) {
                            extrasMap.set(selectedExtra.extra_id, {
                                id: selectedExtra.extra_id,
                                price: selectedExtra.price || extrasMap.get(selectedExtra.extra_id).price,
                                active: true
                            });
                        }
                    });
                }

                setSelectedExtras(extrasMap);
            } catch (err: any) {
                if (!isMounted) return;
                console.error("❌ Erreur chargement données initiales:", err);
                setFormError(err.message || "Une erreur est survenue.");
            } finally {
                if (isMounted) {
                    setLoadingFormData(false);
                    setLoadingCities(false);
                    setLoadingAmenities(false);
                    setLoadingExtras(false);
                    setLoadingCategories(false);
                }
            }
        };

        fetchListingDataAndFormData();
        return () => {
            isMounted = false;
        };
    }, [user, sessionInitialized, listingId, authLoading]);

    const validateForm = (): boolean => {
        if (!user) {
            setFormError("Vous devez être connecté pour modifier l'annonce.");
            return false;
        }
        if (!title.trim()) {
            setFormError("Le titre est obligatoire.");
            return false;
        }
        if (!description.trim()) {
            setFormError("La description est obligatoire.");
            return false;
        }
        if (!location) {
            setFormError("La ville est obligatoire.");
            return false;
        }
        if (!pricePerHour.trim() || isNaN(parseFloat(pricePerHour)) || parseFloat(pricePerHour) <= 0) {
            setFormError("Le prix par heure doit être un nombre positif.");
            return false;
        }
        if (!capacity.trim() || isNaN(parseInt(capacity)) || parseInt(capacity) <= 0) {
            setFormError("La capacité doit être un nombre entier positif.");
            return false;
        }
        const nonDeletedExistingImages = existingImages.filter(img => !imagesToDelete.has(img.id));
        if (nonDeletedExistingImages.length === 0 && newSelectedImages.length === 0) {
            setFormError("Au moins une image est requise.");
            return false;
        }
        if (selectedDays.size === 0) {
            setFormError("Veuillez sélectionner au moins un jour de disponibilité.");
            return false;
        }
        if (!startTime || !endTime) {
            setFormError("Les horaires de disponibilité doivent être définis.");
            return false;
        }
        if (startTime >= endTime) {
            setFormError("L'heure de fin doit être postérieure à l'heure de début.");
            return false;
        }
        return true;
    };

const pickImage = async () => {
    try {
        const currentImageCount = existingImages.filter(img => !imagesToDelete.has(img.id)).length + newSelectedImages.length;
        if (currentImageCount >= 5) {
            setFormError("Vous ne pouvez pas ajouter plus de 5 images.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            allowsMultipleSelection: true,
            selectionLimit: 5 - currentImageCount,
            base64: true  // Toujours activer base64
        });

        if (!result.canceled && result.assets) {
            setNewSelectedImages([...newSelectedImages, ...result.assets]);
        }
    } catch (err) {
        console.error("Erreur lors de la sélection d'image:", err);
        setFormError("Impossible de sélectionner l'image.");
    }
};

    const toggleImageToDelete = (imageId: string) => {
        setImagesToDelete(prev => {
            const updated = new Set(prev);
            if (updated.has(imageId)) {
                updated.delete(imageId);
            } else {
                updated.add(imageId);
            }
            return updated;
        });
    };

    const removeNewImage = (index: number) => {
        setNewSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const toggleDay = (day: number) => {
        setSelectedDays(prev => {
            const updated = new Set(prev);
            if (updated.has(day)) {
                updated.delete(day);
            } else {
                updated.add(day);
            }
            return updated;
        });
    };

    const handleTimeChange = (event: any, selectedDate?: Date, type?: 'start' | 'end') => {
        const currentType = type || showTimePicker;
        if (Platform.OS !== 'web') {
            setShowTimePicker(null);
        }
        
        if (event.type === 'set' && selectedDate) {
            if (currentType === 'start') {
                if (endTime && selectedDate >= endTime) {
                    setFormError("L'heure de début doit être antérieure à l'heure de fin.");
                    return;
                }
                setStartTime(selectedDate);
            } else if (currentType === 'end') {
                if (startTime && selectedDate <= startTime) {
                    setFormError("L'heure de fin doit être postérieure à l'heure de début.");
                    return;
                }
                setEndTime(selectedDate);
            }
        }
    };

    const toggleAmenity = (amenityId: string) => {
        setSelectedAmenityIds(prev => {
            const updated = new Set(prev);
            if (updated.has(amenityId)) {
                updated.delete(amenityId);
            } else {
                updated.add(amenityId);
            }
            return updated;
        });
    };

    const handleExtraToggle = (extraId: string) => {
        setSelectedExtras(prev => {
            const newMap = new Map(prev);
            const currentExtraState = newMap.get(extraId);
            if (currentExtraState) {
                newMap.set(extraId, {
                    ...currentExtraState,
                    active: !currentExtraState.active
                });
            }
            return newMap;
        });
    };

    const handleEditExtraPrice = (extraId: string, newPrice: string) => {
        if (!newPrice || isNaN(parseFloat(newPrice))) return;
        setSelectedExtras(prev => {
            const newMap = new Map(prev);
            const currentExtraState = newMap.get(extraId);
            if (currentExtraState) {
                newMap.set(extraId, {
                    ...currentExtraState,
                    price: parseFloat(newPrice)
                });
            }
            return newMap;
        });
    };

  const handleUpdateListing = async () => {
    if (!validateForm()) {
        console.log("Validation échouée:", formError);
        return;
    }
    setIsSaving(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
        console.log(">>> Début de la mise à jour de l'annonce:", listingId);

        // Préparer les données pour l'annonce
        const updateData = {
            p_listing_id: listingId,
            p_title: title.trim(),
            p_description: description.trim(),
            p_location: location,
            p_price_per_hour: parseFloat(pricePerHour) || 0,
            p_capacity: parseInt(capacity) || 0,
            p_owner_presence: ownerPresence,
            p_access_method: accessMethod,
            p_access_instructions: accessInstructions || '',
            p_privacy_level: privacyLevel,
            p_environment: environment,
            p_wifi_available: wifiAvailable,
            p_wifi_code: wifiAvailable ? wifiCode : null,
            p_pool_type: poolType,
            p_heated: heated,
            p_night_lighting: nightLighting,
            p_water_treatment: waterTreatment,
            p_pool_length: poolLength ? parseFloat(poolLength) : null,
            p_pool_width: poolWidth ? parseFloat(poolWidth) : null,
            p_pool_depth_min: poolDepthMin ? parseFloat(poolDepthMin) : null,
            p_pool_depth_max: poolDepthMax ? parseFloat(poolDepthMax) : null,
            p_food_allowed: foodAllowed,
            p_music_allowed: musicAllowed,
            p_photos_allowed: photosAllowed,
            p_pets_allowed: petsAllowed,
            p_min_age: minAge,
            p_accepted_groups: acceptedGroups,
            p_amenity_ids: Array.from(selectedAmenityIds),
            p_extras: Array.from(selectedExtras.values())
                .filter(extra => extra.active)
                .map(extra => ({ extra_id: extra.id, price: extra.price, active: true })),
         p_schedules: selectedDays.size > 0 ? Array.from(selectedDays).map(day => ({
    day_of_week: day,
    start_time: startTime ? format(startTime, 'HH:mm:ss') : '09:00:00',
    end_time: endTime ? format(endTime, 'HH:mm:ss') : '18:00:00'
})) : null
        };

        console.log("Données envoyées à update_complete_listing:", updateData);

        // Supprimer les images marquées
        if (imagesToDelete.size > 0) {
            console.log("Suppression des images:", Array.from(imagesToDelete));
            for (const imageId of imagesToDelete) {
                const { error: deleteError } = await supabase
                    .from('pool_images')
                    .delete()
                    .eq('id', imageId)
                    .eq('listing_id', listingId);
                if (deleteError) {
                    console.error("Erreur lors de la suppression de l'image:", deleteError);
                    throw new Error(`Échec de la suppression de l'image ${imageId}`);
                }
            }
        }

        // Uploader les nouvelles images
        const newImagePositions = existingImages.filter(img => !imagesToDelete.has(img.id)).length;
const uploadPromises = newSelectedImages.map(async (image, index) => {
    if (!image.uri) return null;
    
    const fileExt = image.fileName?.split('.').pop()?.toLowerCase() ?? image.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const contentType = image.type ? `${image.type}/${fileExt}` : `image/${fileExt}`;
    const uniqueFileName = `${Date.now()}_${index}.${fileExt}`;
    const filePath = `public/${listingId}/${uniqueFileName}`;
    
    try {
        const response = await fetch(image.uri);
        const blob = await response.blob();
        
        const { error: uploadError } = await supabase.storage
            .from('pool-images')
            .upload(filePath, blob, { contentType, upsert: false });
            
        if (uploadError) throw new Error(`Upload image échoué: ${uploadError.message}`);
        
        const { data: urlData } = supabase.storage.from('pool-images').getPublicUrl(filePath);
        if (!urlData?.publicUrl) throw new Error('URL publique image non obtenue.');
        
        const { data: insertedImage, error: insertError } = await supabase
            .from('pool_images')
            .insert({
                listing_id: listingId,
                url: urlData.publicUrl,
                position: newImagePositions + index
            })
            .select('id, url, position')
            .single();
            
        if (insertError) throw insertError;
        return insertedImage;
    } catch (err: any) {
        console.error(`Upload image ${index + 1} error:`, err);
        return null;
    }
});

        const uploadedImages = await Promise.all(uploadPromises);
        const successfulUploads = uploadedImages.filter(img => img !== null);

        // Si au moins une image a été téléchargée avec succès, continuer
        if (newSelectedImages.length > 0 && successfulUploads.length === 0) {
            throw new Error("Aucune image n'a pu être téléchargée.");
        }

        // Ajouter un avertissement si certaines images ont échoué
        if (successfulUploads.length < newSelectedImages.length) {
            const failedCount = newSelectedImages.length - successfulUploads.length;
            console.warn(`${failedCount} image(s) n'ont pas pu être téléchargées.`);
        }

        // Mettre à jour l'annonce
        console.log("Appel de update_complete_listing...");
        const { data: updateResult, error: updateError } = await supabase.rpc(
            'update_complete_listing',
            updateData
        );
        
        if (updateError) {
            console.error("Erreur RPC:", updateError);
            throw new Error(updateError.message || "Échec de la mise à jour de l'annonce.");
        }

        const result = updateResult as UpdateListingResponse;
        if (!result.success) {
            console.error("Échec de la mise à jour:", result.message);
            throw new Error(result.message || "Échec de la mise à jour.");
        }

        console.log("Mise à jour réussie:", result);
        setSuccessMessage("Votre annonce a été mise à jour avec succès !");
        
        setTimeout(() => {
            try {
                router.replace('/host/dashboard');
            } catch (navError) {
                console.error("Erreur de navigation:", navError);
                setFormError("Mise à jour réussie, mais erreur lors de la redirection.");
            }
        }, 2000);
        
    } catch (err: any) {
        console.error("❌ Erreur lors de la mise à jour de l'annonce:", err);
        setFormError(err.message || "Une erreur s'est produite lors de la mise à jour.");
    } finally {
        setIsSaving(false);
    }
};
  const handleDeleteListing = async () => {
    setIsDeleting(true);
    try {
        const { error } = await supabase
            .from('pool_listings')
            .update({ status: 'deleted' })
            .eq('id', listingId)
            .eq('owner_id', user?.id);

        if (error) throw error;
        
        setSuccessMessage("Votre annonce a été supprimée avec succès.");
        setTimeout(() => {
            try {
                router.replace('/host/dashboard');
            } catch (navError) {
                console.error("Erreur de navigation:", navError);
                setFormError("Suppression réussie, mais erreur lors de la redirection.");
            }
        }, 2000);
    } catch (err: any) {
        console.error("Erreur lors de la suppression de l'annonce:", err);
        setFormError("Une erreur s'est produite lors de la suppression de l'annonce.");
    } finally {
        setIsDeleting(false);
        setShowDeleteModal(false);
    }
};

    if (!fontsLoaded || !sessionInitialized || authLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </SafeAreaView>
        );
    }

    if (!user || !listingId || fontError) {
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: "Modifier l'annonce" }} />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        {!user ? "Vous devez être connecté." : 
                         !listingId ? "ID d'annonce invalide." : 
                         "Erreur de chargement des polices."}
                    </Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => router.replace('/host/dashboard')}
                    >
                        <Text style={styles.retryButtonText}>Retour au tableau de bord</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: "Modifier l'annonce" }} />
            
            <Modal
                visible={showDeleteModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Supprimer l'annonce</Text>
                        <Text style={styles.modalText}>
                            Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowDeleteModal(false)}
                                disabled={isDeleting}
                            >
                                <Text style={styles.cancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.deleteModalButton, isDeleting && styles.disabledButton]}
                                onPress={handleDeleteListing}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <Text style={styles.deleteModalButtonText}>Supprimer</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {loadingFormData ? (
                <View style={styles.loadingView}>
                    <ActivityIndicator size="large" color="#0891b2" />
                    <Text style={styles.loadingText}>Chargement des données de l'annonce...</Text>
                </View>
            ) : (
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {successMessage && (
                        <View style={styles.successBox}>
                            <Text style={styles.successBoxText}>{successMessage}</Text>
                        </View>
                    )}
                    {formError && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorBoxText}>{formError}</Text>
                        </View>
                    )}

                    <View style={styles.statusContainer}>
                        <Text style={styles.statusLabel}>Statut actuel:</Text>
                        <View style={[
                            styles.statusBadge, 
                            { backgroundColor: 
                                listingStatus === 'approved' ? '#d1fae5' : 
                                listingStatus === 'pending' ? '#fef3c7' : 
                                listingStatus === 'rejected' ? '#fee2e2' : '#f1f5f9' 
                            }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: 
                                    listingStatus === 'approved' ? '#059669' : 
                                    listingStatus === 'pending' ? '#b45309' : 
                                    listingStatus === 'rejected' ? '#b91c1c' : '#64748b' 
                                }
                            ]}>
                                {listingStatus === 'approved' ? 'Approuvée' : 
                                 listingStatus === 'pending' ? 'En attente' : 
                                 listingStatus === 'rejected' ? 'Refusée' : 
                                 listingStatus === 'draft' ? 'Brouillon' : 'Indéfini'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Informations de base</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Titre <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Titre de votre annonce"
                                maxLength={100}
                                editable={!isSaving}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Décrivez votre piscine en détail..."
                                multiline
                                maxLength={1000}
                                editable={!isSaving}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Ville <Text style={styles.required}>*</Text></Text>
                            {loadingCities ? (
                                <ActivityIndicator size="small" color="#0891b2" />
                            ) : (
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={location}
                                        onValueChange={(itemValue) => setLocation(itemValue)}
                                        enabled={!isSaving}
                                    >
                                        <Picker.Item label="Sélectionner une ville" value="" />
                                        {cities.map(city => (
                                            <Picker.Item key={city.id} label={city.name} value={city.name} />
                                        ))}
                                    </Picker>
                                </View>
                            )}
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Prix par heure (MAD) <Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputWithIcon}>
                                    <DollarSign size={18} color="#64748b" />
                                    <TextInput
                                        style={styles.iconInput}
                                        value={pricePerHour}
                                        onChangeText={setPricePerHour}
                                        keyboardType="numeric"
                                        placeholder="200"
                                        editable={!isSaving}
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Capacité <Text style={styles.required}>*</Text></Text>
                              <View style={styles.pickerContainer}>
        <Picker
            selectedValue={capacity}
            onValueChange={(itemValue) => setCapacity(itemValue.toString())}
            style={styles.picker}
            enabled={!isSaving}
        >
            <Picker.Item label="Sélectionner..." value="" />
            {CAPACITY_OPTIONS.map(option => (
                <Picker.Item 
                    key={option.value.toString()} 
                    label={option.label} 
                    value={option.value.toString()} 
                />
            ))}
        </Picker>
    </View>
</View>
                                </View>
                            </View>
                  
                

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Caractéristiques de la piscine</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Type de piscine</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={poolType}
                                    onValueChange={(value) => setPoolType(value)}
                                    enabled={!isSaving}
                                >
                                    <Picker.Item label="Piscine enterrée" value="inground" />
                                    <Picker.Item label="Piscine hors-sol" value="aboveground" />
                                    <Picker.Item label="Piscine naturelle" value="natural" />
                                    <Picker.Item label="Autre" value="other" />
                                </Picker>
                            </View>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Dimensions de la piscine</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={getSelectedSize()}
                                    onValueChange={(value) => handleSizeSelect(value)}
                                    enabled={!isSaving}
                                >
                                    <Picker.Item label="Petit (5x3m)" value="small" />
                                    <Picker.Item label="Moyen (8x4m)" value="medium" />
                                    <Picker.Item label="Grand (10x5m)" value="large" />
                                    <Picker.Item label="Personnalisé" value="custom" />
                                </Picker>
                            </View>
                        </View>
                        {getSelectedSize() === 'custom' && (
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.label}>Longueur (m)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={poolLength}
                                        onChangeText={setPoolLength}
                                        keyboardType="numeric"
                                        placeholder="Ex: 10"
                                        editable={!isSaving}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.label}>Largeur (m)</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={poolWidth}
                                        onChangeText={setPoolWidth}
                                        keyboardType="numeric"
                                        placeholder="Ex: 5"
                                        editable={!isSaving}
                                    />
                                </View>
                            </View>
                        )}
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Profondeur min. (m)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={poolDepthMin}
                                    onChangeText={setPoolDepthMin}
                                    keyboardType="numeric"
                                    placeholder="Ex: 1.2"
                                    editable={!isSaving}
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Profondeur max. (m)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={poolDepthMax}
                                    onChangeText={setPoolDepthMax}
                                    keyboardType="numeric"
                                    placeholder="Ex: 2.5"
                                    editable={!isSaving}
                                />
                            </View>
                        </View>
                        <View style={styles.checkboxesGroup}>
                            <Text style={styles.label}>Options</Text>
                            <TouchableOpacity 
                                style={styles.checkboxRow} 
                                onPress={() => setHeated(!heated)}
                                disabled={isSaving}
                            >
                                <View style={styles.checkbox}>
                                    {heated && <View style={styles.checked} />}
                                </View>
                                <Text style={styles.checkboxLabel}>Piscine chauffée</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.checkboxRow} 
                                onPress={() => setNightLighting(!nightLighting)}
                                disabled={isSaving}
                            >
                                <View style={styles.checkbox}>
                                    {nightLighting && <View style={styles.checked} />}
                                </View>
                                <Text style={styles.checkboxLabel}>Éclairage nocturne</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.checkboxRow} 
                                onPress={() => setWifiAvailable(!wifiAvailable)}
                                disabled={isSaving}
                            >
                                <View style={styles.checkbox}>
                                    {wifiAvailable && <View style={styles.checked} />}
                                </View>
                                <Text style={styles.checkboxLabel}>WiFi disponible</Text>
                            </TouchableOpacity>
                        </View>
                        {wifiAvailable && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Code WiFi (optionnel)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={wifiCode}
                                    onChangeText={setWifiCode}
                                    placeholder="Code WiFi à communiquer aux baigneurs"
                                    editable={!isSaving}
                                />
                            </View>
                        )}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Traitement de l'eau</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={waterTreatment}
                                    onValueChange={(value) => setWaterTreatment(value)}
                                    enabled={!isSaving}
                                >
                                    <Picker.Item label="Chlore" value="chlorine" />
                                    <Picker.Item label="Sel" value="salt" />
                                    <Picker.Item label="Brome" value="bromine" />
                                    <Picker.Item label="Autre" value="other" />
                                </Picker>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Équipements disponibles</Text>
                        {loadingAmenities ? (
                            <ActivityIndicator size="small" color="#0891b2" style={{ marginVertical: 20 }} />
                        ) : (
                            amenityCategories.map(category => {
                                const categoryAmenities = availableAmenities.filter(
                                    amenity => amenity.category === category.name
                                );
                                if (categoryAmenities.length === 0) return null;
                                return (
                                    <View key={category.id} style={styles.categoryGroup}>
                                        <View style={styles.categoryHeaderContainer}>
                                            <View style={styles.categoryHeaderLine}></View>
                                            <Text style={styles.categoryLabel}>{category.label}</Text>
                                            <View style={styles.categoryHeaderLine}></View>
                                        </View>
                                        <View style={styles.amenitiesGrid}>
                                            {categoryAmenities.map(amenity => {
                                                const Icon = iconMap[amenity.icon_name || ''] || Square;
                                                const isSelected = selectedAmenityIds.has(amenity.id);
                                                return (
                                                    <TouchableOpacity
                                                        key={amenity.id}
                                                        style={styles.amenityItem}
                                                        onPress={() => toggleAmenity(amenity.id)}
                                                        disabled={isSaving}
                                                        activeOpacity={0.7}
                                                    >
                                                        <View style={styles.amenityIconContainer}>
                                                            <Icon 
                                                                size={20} 
                                                                color={isSelected ? '#0891b2' : '#64748b'} 
                                                            />
                                                        </View>
                                                        <Text style={[
                                                            styles.amenityText,
                                                            isSelected && styles.amenityTextSelected
                                                        ]}>
                                                            {amenity.name}
                                                        </Text>
                                                        <View style={styles.checkboxContainer}>
                                                            {isSelected ? (
                                                                <CheckSquare size={20} color="#0891b2" />
                                                            ) : (
                                                                <Square size={20} color="#64748b" />
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Services et Extras</Text>
                        {loadingExtras ? (
                            <ActivityIndicator size="small" color="#0891b2" style={{ marginVertical: 20 }} />
                        ) : availableExtras.length === 0 ? (
                            <Text style={styles.helperText}>Aucun extra disponible pour le moment.</Text>
                        ) : (
                            <View style={styles.extrasContainer}>
                                {availableExtras.map(extra => {
                                    const extraState = selectedExtras.get(extra.id);
                                    if (!extraState) return null;
                                    const isActive = extraState.active;
                                    const IconComponent = iconMap[extra.icon_name || ''] || Info;
                                    return (
                                        <View key={extra.id} style={styles.extraItem}>
                                            <View style={styles.extraHeader}>
                                                <View style={styles.extraTitleContainer}>
                                                    <View style={[
                                                        styles.extraIconContainer, 
                                                        isActive && styles.extraIconActive
                                                    ]}>
                                                        <IconComponent 
                                                            size={18} 
                                                            color={isActive ? '#0c4a6e' : '#64748b'} 
                                                        />
                                                    </View>
                                                    <Text style={[
                                                        styles.extraTitle, 
                                                        isActive && styles.extraTitleActive
                                                    ]}>
                                                        {extra.name}
                                                    </Text>
                                                </View>
                                                <Switch
                                                    value={isActive}
                                                    onValueChange={() => handleExtraToggle(extra.id)}
                                                    disabled={isSaving}
                                                    trackColor={{ false: "#e5e7eb", true: "#bae6fd" }}
                                                    thumbColor={isActive ? "#0ea5e9" : "#f1f5f9"}
                                                    ios_backgroundColor="#e5e7eb"
                                                />
                                            </View>
                                            {isActive && (
                                                <View style={styles.extraDetails}>
                                                    {extra.description && (
                                                        <Text style={styles.extraDescription}>
                                                            {extra.description}
                                                        </Text>
                                                    )}
                                                    <View style={styles.extraPriceRow}>
                                                        <View style={styles.priceContainer}>
                                                            <Text style={styles.priceLabel}>Prix:</Text>
                                                            <TextInput
                                                                style={styles.priceInput}
                                                                value={extraState.price.toString()}
                                                                onChangeText={(text) => 
                                                                    handleEditExtraPrice(extra.id, text)
                                                                }
                                                                keyboardType="numeric"
                                                                editable={!isSaving}
                                                            />
                                                            <Text style={styles.priceUnit}>MAD</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Disponibilités <Text style={styles.required}>*</Text></Text>
                        <Text style={styles.label}>Jours disponibles</Text>
                        <View style={styles.daysContainer}>
                            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => {
                                const dayNumber = index + 1;
                                const isSelected = selectedDays.has(dayNumber);
                                return (
                                    <TouchableOpacity
                                        key={dayNumber}
                                        style={[
                                            styles.dayButton,
                                            isSelected && styles.dayButtonSelected
                                        ]}
                                        onPress={() => toggleDay(dayNumber)}
                                        disabled={isSaving}
                                    >
                                        <Text style={[
                                            styles.dayButtonText,
                                            isSelected && styles.dayButtonTextSelected
                                        ]}>
                                            {day}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Heure de début <Text style={styles.required}>*</Text></Text>
                                {Platform.OS === 'ios' || Platform.OS === 'android' ? (
                                    <TouchableOpacity
                                        style={styles.timeButton}
                                        onPress={() => setShowTimePicker('start')}
                                        disabled={isSaving}
                                    >
                                        <ClockIcon size={18} color="#64748b" />
                                        <Text style={styles.timeButtonText}>
                                            {startTime ? format(startTime, 'HH:mm') : '--:--'}
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.timeInputWeb}>
                                        <input
                                            type="time"
                                            value={startTime ? format(startTime, 'HH:mm') : ''}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    const [hours, minutes] = e.target.value.split(':').map(Number);
                                                    const newDate = new Date();
                                                    newDate.setHours(hours, minutes, 0, 0);
                                                    setStartTime(newDate);
                                                } else {
                                                    setStartTime(null);
                                                }
                                            }}
                                            disabled={isSaving}
                                        />
                                    </View>
                                )}
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Heure de fin <Text style={styles.required}>*</Text></Text>
                                {Platform.OS === 'ios' || Platform.OS === 'android' ? (
                                    <TouchableOpacity
                                        style={styles.timeButton}
                                        onPress={() => setShowTimePicker('end')}
                                        disabled={isSaving}
                                    >
                                        <ClockIcon size={18} color="#64748b" />
                                        <Text style={styles.timeButtonText}>
                                            {endTime ? format(endTime, 'HH:mm') : '--:--'}
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.timeInputWeb}>
                                        <input
                                            type="time"
                                            value={endTime ? format(endTime, 'HH:mm') : ''}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    const [hours, minutes] = e.target.value.split(':').map(Number);
                                                    const newDate = new Date();
                                                    newDate.setHours(hours, minutes, 0, 0);
                                                    setEndTime(newDate);
                                                } else {
                                                    setEndTime(null);
                                                }
                                            }}
                                            disabled={isSaving}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                        {showTimePicker === 'start' && (Platform.OS === 'ios' || Platform.OS === 'android') && (
                            <DateTimePicker
                                value={startTime || new Date()}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, date) => handleTimeChange(event, date, 'start')}
                                minuteInterval={30}
                            />
                        )}
                        {showTimePicker === 'end' && (Platform.OS === 'ios' || Platform.OS === 'android') && (
                            <DateTimePicker
                                value={endTime || new Date()}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, date) => handleTimeChange(event, date, 'end')}
                                minuteInterval={30}
                            />
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Images <Text style={styles.required}>*</Text></Text>
                        <Text style={styles.helperText}>Au moins une image est requise. Maximum 5 images.</Text>
                        <View style={styles.imagesContainer}>
                            {existingImages.map(image => (
                                <View key={image.id} style={styles.imageWrapper}>
                                    <Image 
                                        source={{ uri: image.url }} 
                                        style={[
                                            styles.imagePreview,
                                            imagesToDelete.has(image.id) && styles.imageToBeDeleted
                                        ]} 
                                    />
                                    <TouchableOpacity
                                        style={[
                                            styles.imageActionButton,
                                            imagesToDelete.has(image.id) ? styles.imageActionRestore : styles.imageActionDelete
                                        ]}
                                        onPress={() => toggleImageToDelete(image.id)}
                                        disabled={isSaving}
                                    >
                                        {imagesToDelete.has(image.id) ? (
                                            <Text style={styles.imageActionRestoreText}>Restaurer</Text>
                                        ) : (
                                            <Text style={styles.imageActionDeleteText}>Supprimer</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {newSelectedImages.map((image, index) => (
                                <View key={`new-${index}`} style={styles.imageWrapper}>
                                    <Image 
                                        source={{ uri: image.uri }} 
                                        style={styles.imagePreview} 
                                    />
                                    <TouchableOpacity
                                        style={[styles.imageActionButton, styles.imageActionDelete]}
                                        onPress={() => removeNewImage(index)}
                                        disabled={isSaving}
                                    >
                                        <Text style={styles.imageActionDeleteText}>Supprimer</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {existingImages.filter(img => !imagesToDelete.has(img.id)).length + newSelectedImages.length < 5 && (
                                <TouchableOpacity
                                    style={styles.addImageButton}
                                    onPress={pickImage}
                                    disabled={isSaving}
                                >
                                    <Plus size={24} color="#0891b2" />
                                    <Text style={styles.addImageText}>Ajouter une image</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.deleteButton, isSaving && styles.disabledButton]}
                            onPress={() => setShowDeleteModal(true)}
                            disabled={isSaving}
                        >
                            <Trash2 size={20} color="#dc2626" />
                            <Text style={styles.deleteButtonText}>Supprimer l'annonce</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveButton, isSaving && styles.disabledButton]}
                            onPress={handleUpdateListing}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <>
                                    <Save size={20} color="#ffffff" />
                                    <Text style={styles.saveButtonText}>Enregistrer les modifications</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb'
    },
    scrollView: {
        flex: 1
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb'
    },
    loadingView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    loadingText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
        color: '#64748b',
        marginTop: 16
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorBox: {
        backgroundColor: '#fee2e2',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fecaca',
        marginBottom: 20
    },
    errorBoxText: {
        fontFamily: 'Montserrat-Regular',
        color: '#b91c1c',
        fontSize: 14,
        textAlign: 'center'
    },
    successBox: {
        backgroundColor: '#d1fae5',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#a7f3d0',
        marginBottom: 20
    },
    successBoxText: {
        fontFamily: 'Montserrat-SemiBold',
        color: '#059669',
        fontSize: 14,
        textAlign: 'center'
    },
    errorText: {
        fontFamily: 'Montserrat-Regular',
        color: '#b91c1c',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20
    },
    retryButton: {
        backgroundColor: '#0891b2',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8
    },
    retryButtonText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: '#ffffff',
        textAlign: 'center'
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    statusLabel: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: '#334155'
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16
    },
    statusText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    section: {
        marginTop: 24,
        marginBottom: 8,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2
    },
    sectionTitle: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 18,
        color: '#334155',
        marginBottom: 16
    },
    inputGroup: {
        marginBottom: 16
    },
    row: {
        flexDirection: 'row',
        marginBottom: 0
    },
    label: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 8
    },
    required: {
        color: '#ef4444'
    },
    helperText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 12
    },
    input: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
        backgroundColor: '#ffffff',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        color: '#1f2937'
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top'
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        height: 50
    },
    iconInput: {
        flex: 1,
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
        color: '#1f2937',
        marginLeft: 8,
        height: '100%'
    },
    pickerContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        height: 50,
        justifyContent: 'center',
        overflow: 'hidden'
    },
    checkboxesGroup: {
        marginBottom: 16
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#d1d5db',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    checked: {
        width: 14,
        height: 14,
        backgroundColor: '#0891b2',
        borderRadius: 2
    },
    checkboxLabel: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 15,
        color: '#374151'
    },
    categoryGroup: {
        marginBottom: 24
    },
    categoryHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },
    categoryHeaderLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0'
    },
    categoryLabel: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 16,
        color: '#475569',
        paddingHorizontal: 12
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '50%',
        paddingVertical: 12,
        paddingHorizontal: 8
    },
    amenityIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    amenityText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 15,
        color: '#374151',
        flex: 1
    },
    amenityTextSelected: {
        fontFamily: 'Montserrat-SemiBold',
        color: '#0c4a6e'
    },
    checkboxContainer: {
        width: 28,
        alignItems: 'center'
    },
    extrasContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        overflow: 'hidden'
    },
    extraItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        padding: 12
    },
    extraHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    extraTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10
    },
    extraIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    extraIconActive: {
        backgroundColor: '#e0f2fe'
    },
    extraTitle: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 15,
        color: '#334155',
        flex: 1
    },
    extraTitleActive: {
        color: '#0c4a6e'
    },
    extraDetails: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9'
    },
    extraDescription: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 13,
        color: '#64748b',
        marginBottom: 8
    },
    extraPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16
    },
    priceLabel: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#64748b',
        marginRight: 6
    },
    priceInput: {
        width: 80,
        fontFamily: 'Montserrat-Bold',
        fontSize: 14,
        color: '#0891b2',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        textAlign: 'right'
    },
    priceUnit: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#64748b',
        marginLeft: 6
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    dayButton: {
        width: '13%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 8
    },
    dayButtonSelected: {
        backgroundColor: '#e0f2fe',
        borderColor: '#7dd3fc'
    },
    dayButtonText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 13,
        color: '#475569'
    },
    dayButtonTextSelected: {
        color: '#0c4a6e'
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: 50
    },
    timeButtonText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 15,
        color: '#374151',
        marginLeft: 8
    },
    timeInputWeb: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 16,
        backgroundColor: '#ffffff'
    },
    imagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
        gap: 16
    },
    imageWrapper: {
        width: '45%',
        position: 'relative',
        marginBottom: 16
    },
    imagePreview: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 8,
        backgroundColor: '#e5e7eb'
    },
    imageToBeDeleted: {
        opacity: 0.3
    },
    imageActionButton: {
        position: 'absolute',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        top: 8,
        right: 8
    },
    imageActionDelete: {
        backgroundColor: 'rgba(220, 38, 38, 0.8)'
    },
    imageActionRestore: {
        backgroundColor: 'rgba(14, 165, 233, 0.8)'
    },
    imageActionDeleteText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 12,
        color: '#ffffff'
    },
    imageActionRestoreText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 12,
        color: '#ffffff'
    },
    addImageButton: {
        width: '45%',
        aspectRatio: 1,
        borderWidth: 2,
        borderColor: '#0891b2',
        borderStyle: 'dashed',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(8, 145, 178, 0.05)'
    },
    addImageText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: '#0891b2',
        marginTop: 8,
        textAlign: 'center'
    },
    actionsContainer: {
        marginTop: 24,
        marginBottom: 40
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0891b2',
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 16,
        gap: 10
    },
    saveButtonText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 16,
        color: '#ffffff'
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fee2e2',
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fecaca',
        gap: 10
    },
    deleteButtonText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 16,
        color: '#dc2626'
    },
    disabledButton: {
        opacity: 0.6
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 18,
        color: '#334155',
        marginBottom: 12,
        textAlign: 'center'
    },
    modalText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 20,
        textAlign: 'center'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelButton: {
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    cancelButtonText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: '#475569'
    },
    deleteModalButton: {
        backgroundColor: '#dc2626'
    },
    deleteModalButtonText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: '#ffffff'
    }
});