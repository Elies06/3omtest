///home/project/app/(tabs)/host/create-listing.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    Platform, Image, ActivityIndicator, Alert, SafeAreaView, Switch,
    FlatList, Modal
} from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import {
    ChevronLeft, MapPin, DollarSign, Users, Image as ImageIcon, Wifi, Car, Umbrella, Waves, Grill,
    Thermometer, ShowerHead, Bath, Flame, Warehouse, CheckSquare, Square, Clock as ClockIcon, RefreshCcw,
    Coffee, UtensilsCrossed, Party, Shield, Edit, CheckCircle, XCircle as CancelIcon, X as CloseIcon, Gift, Crown
} from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';
import TimePicker from '@/components/TimePicker';

// --- Type Definitions ---
interface Amenity { id: string; name: string; icon_name: string | null; category: string | null; }
interface AmenityCategory { id: string; name: string; label: string; sort_order: number; }
interface PoolExtra { id: string; name: string; description: string | null; price: number; icon_name: string | null; category: string; sort_order: number; }
interface SelectedExtraState { id: string; price: number; active: boolean; }
type ImageAsset = ImagePicker.ImagePickerAsset;
interface City { id: string | number; name: string; }
interface DbOption { value: string; label: string; }
interface FormDataResponse {
    cities: City[];
    amenities: Amenity[];
    categories: AmenityCategory[];
    extras: PoolExtra[];
}
interface CreateListingResponse {
    success: boolean;
    id?: string;
    message: string;
}

// --- Constants ---
const iconMap: { [key: string]: React.ElementType } = {
    Wifi, Car, Umbrella, Waves, Thermometer, ShowerHead, Bath, Flame, Warehouse, Grill,
    Coffee, UtensilsCrossed, Party, Shield, Edit, CheckCircle, CancelIcon, CloseIcon, ClockIcon,
    Birthday: Gift,
    BirthdayPremium: Crown,
    GrillAlias: UtensilsCrossed
};
const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const photosAllowedOptions = [{ label: "Oui", value: "yes" }, { label: "Non", value: "no" }];

const PremiumBirthdayIcon = ({ size = 24, color = '#000000' }) => (
    <View style={{ position: 'relative' }}>
        <Gift size={size} color={color} />
        <View style={{ position: 'absolute', top: -5, right: -5 }}>
            <Crown size={size * 0.6} color="#FFD700" />
        </View>
    </View>
);

const SIZES = {
    small: { length: '5', width: '3' },
    medium: { length: '8', width: '4' },
    large: { length: '10', width: '5' }
};

// --- Component ---
export default function CreateListing() {
    const { user, sessionInitialized, loading: authLoading } = useAuth() || {};

    // --- États Formulaire de Base ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState<string | null>(null);
    const [pricePerHour, setPricePerHour] = useState('');
    const [capacity, setCapacity] = useState('');
    const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<string>>(new Set());
    const [selectedImages, setSelectedImages] = useState<ImageAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSection, setCurrentSection] = useState(1);

    // --- États Disponibilité ---
    const [selectedDays, setSelectedDays] = useState<Set<number>>(new Set());
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);

    // --- États Données du Formulaire ---
    const [cities, setCities] = useState<City[]>([]);
    const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
    const [amenityCategories, setAmenityCategories] = useState<AmenityCategory[]>([]);
    const [availableExtras, setAvailableExtras] = useState<PoolExtra[]>([]);
    const [selectedExtras, setSelectedExtras] = useState<Map<string, SelectedExtraState>>(new Map());
    const [editingExtraId, setEditingExtraId] = useState<string | null>(null);
    const [editingExtraPrice, setEditingExtraPrice] = useState('');
    const [loadingFormData, setLoadingFormData] = useState(true);
    const [formError, setFormError] = useState<string | null>(null);

    // --- États pour les options de Picker ---
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

    const [ownerPresenceDbOptions, setOwnerPresenceDbOptions] = useState<DbOption[]>([]);
    const [loadingOwnerPresence, setLoadingOwnerPresence] = useState(true);
    const [errorOwnerPresence, setErrorOwnerPresence] = useState<string | null>(null);
    const [accessMethodDbOptions, setAccessMethodDbOptions] = useState<DbOption[]>([]);
    const [loadingAccessMethods, setLoadingAccessMethods] = useState(true);
    const [errorAccessMethods, setErrorAccessMethods] = useState<string | null>(null);
    const [privacyLevelDbOptions, setPrivacyLevelDbOptions] = useState<DbOption[]>([]);
    const [loadingPrivacyLevels, setLoadingPrivacyLevels] = useState(true);
    const [errorPrivacyLevels, setErrorPrivacyLevels] = useState<string | null>(null);
    const [environmentDbOptions, setEnvironmentDbOptions] = useState<DbOption[]>([]);
    const [loadingEnvironments, setLoadingEnvironments] = useState(true);
    const [errorEnvironments, setErrorEnvironments] = useState<string | null>(null);
    const [foodAllowanceDbOptions, setFoodAllowanceDbOptions] = useState<DbOption[]>([]);
    const [loadingFoodAllowances, setLoadingFoodAllowances] = useState(true);
    const [errorFoodAllowances, setErrorFoodAllowances] = useState<string | null>(null);
    const [petAllowanceDbOptions, setPetAllowanceDbOptions] = useState<DbOption[]>([]);
    const [loadingPetAllowances, setLoadingPetAllowances] = useState(true);
    const [errorPetAllowances, setErrorPetAllowances] = useState<string | null>(null);
    const [poolTypeDbOptions, setPoolTypeDbOptions] = useState<DbOption[]>([]);
    const [loadingPoolTypes, setLoadingPoolTypes] = useState(true);
    const [errorPoolTypes, setErrorPoolTypes] = useState<string | null>(null);
    const [waterTreatmentDbOptions, setWaterTreatmentDbOptions] = useState<DbOption[]>([]);
    const [loadingWaterTreatments, setLoadingWaterTreatments] = useState(true);
    const [errorWaterTreatments, setErrorWaterTreatments] = useState<string | null>(null);
    const [musicAllowanceDbOptions, setMusicAllowanceDbOptions] = useState<DbOption[]>([]);
    const [loadingMusicAllowances, setLoadingMusicAllowances] = useState(true);
    const [errorMusicAllowances, setErrorMusicAllowances] = useState<string | null>(null);
    const [minAgeDbOptions, setMinAgeDbOptions] = useState<DbOption[]>([]);
    const [loadingMinAges, setLoadingMinAges] = useState(true);
    const [errorMinAges, setErrorMinAges] = useState<string | null>(null);
    const [groupTypeDbOptions, setGroupTypeDbOptions] = useState<DbOption[]>([]);
    const [loadingGroupTypes, setLoadingGroupTypes] = useState(true);
    const [errorGroupTypes, setErrorGroupTypes] = useState<string | null>(null);
const CAPACITY_OPTIONS = [
  { value: 2, label: "2 personnes" },
  { value: 4, label: "4 personnes" },
  { value: 6, label: "6 personnes" },
  { value: 8, label: "8 personnes" },
  { value: 10, label: "10 personnes" },
  { value: 15, label: "15 personnes" },
  { value: 20, label: "20 personnes" }
];
    // --- Polices ---
    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // --- Fonctions pour gérer les dimensions ---
    const getSelectedSize = (): string => {
        if (!poolLength || !poolWidth) {
            return 'custom';
        }
        for (const [key, value] of Object.entries(SIZES)) {
            if (value.length === poolLength && value.width === poolWidth) {
                return key;
            }
        }
        return 'custom';
    };

    const handleSizeSelect = (size: string) => {
        if (size === 'custom') {
            setPoolLength('');
            setPoolWidth('');
            return;
        }
        const selectedSize = SIZES[size as keyof typeof SIZES];
        if (selectedSize) {
            setPoolLength(selectedSize.length);
            setPoolWidth(selectedSize.width);
        }
    };

    // --- Fonction Fetch générique pour les options BDD ---
    const createOptionFetcher = (tableName: string, setLoadingOpt: React.Dispatch<React.SetStateAction<boolean>>, setErrorOption: React.Dispatch<React.SetStateAction<string | null>>, setData: React.Dispatch<React.SetStateAction<DbOption[]>>, errorMsg: string) => {
        return useCallback(async () => {
            setLoadingOpt(true);
            setErrorOption(null);
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('value, label')
                    .order('sort_order', { ascending: true });
                if (error) throw error;
                setData(data || []);
            } catch (err: any) {
                console.error(`Error loading ${tableName}:`, err);
                setErrorOption(errorMsg);
            } finally {
                setLoadingOpt(false);
            }
        }, [tableName, errorMsg]);
    };

    // Création des fonctions fetch spécifiques
    const fetchOwnerPresenceOptions = createOptionFetcher('owner_presence_options', setLoadingOwnerPresence, setErrorOwnerPresence, setOwnerPresenceDbOptions, 'Erreur chargement options présence.');
    const fetchAccessMethods = createOptionFetcher('access_methods', setLoadingAccessMethods, setErrorAccessMethods, setAccessMethodDbOptions, 'Erreur chargement méthodes accès.');
    const fetchPrivacyLevels = createOptionFetcher('privacy_levels', setLoadingPrivacyLevels, setErrorPrivacyLevels, setPrivacyLevelDbOptions, 'Erreur chargement niveaux confidentialité.');
    const fetchEnvironments = createOptionFetcher('environments', setLoadingEnvironments, setErrorEnvironments, setEnvironmentDbOptions, 'Erreur chargement environnements.');
    const fetchFoodAllowances = createOptionFetcher('food_allowances', setLoadingFoodAllowances, setErrorFoodAllowances, setFoodAllowanceDbOptions, 'Erreur chargement options nourriture.');
    const fetchPetAllowances = createOptionFetcher('pet_allowances', setLoadingPetAllowances, setErrorPetAllowances, setPetAllowanceDbOptions, 'Erreur chargement options animaux.');
    const fetchPoolTypes = createOptionFetcher('pool_types', setLoadingPoolTypes, setErrorPoolTypes, setPoolTypeDbOptions, 'Erreur chargement types piscine.');
    const fetchWaterTreatments = createOptionFetcher('water_treatments', setLoadingWaterTreatments, setErrorWaterTreatments, setWaterTreatmentDbOptions, 'Erreur chargement traitements eau.');
    const fetchMusicAllowances = createOptionFetcher('music_allowances', setLoadingMusicAllowances, setErrorMusicAllowances, setMusicAllowanceDbOptions, 'Erreur chargement options musique.');
    const fetchMinAges = createOptionFetcher('min_ages', setLoadingMinAges, setErrorMinAges, setMinAgeDbOptions, 'Erreur chargement âges minimum.');
    const fetchGroupTypes = createOptionFetcher('group_types', setLoadingGroupTypes, setErrorGroupTypes, setGroupTypeDbOptions, 'Erreur chargement types groupes.');

    // --- useEffect pour charger les données ---
    useEffect(() => {
        const fetchFormData = async () => {
            setLoadingFormData(true);
            setFormError(null);
            try {
                console.log("Calling RPC: get_listing_form_data");
                const { data, error: rpcError } = await supabase.rpc('get_listing_form_data');
                if (rpcError) {
                    console.error("Error fetching form data via RPC:", rpcError);
                    throw new Error("Impossible de charger les données du formulaire.");
                }
                console.log("RPC Data Received:", data);
                if (data) {
                    const responseData = data as FormDataResponse;
                    setCities(responseData.cities || []);
                    setAvailableAmenities(responseData.amenities || []);
                    setAmenityCategories(responseData.categories || []);
                    setAvailableExtras(responseData.extras || []);
                    const initialSelectedExtras = new Map<string, SelectedExtraState>();
                    (responseData.extras || []).forEach((extra: PoolExtra) => {
                        initialSelectedExtras.set(extra.id, {
                            id: extra.id,
                            price: extra.price,
                            active: false
                        });
                    });
                    setSelectedExtras(initialSelectedExtras);
                } else {
                    throw new Error("Aucune donnée retournée par la RPC.");
                }
            } catch (err: any) {
                console.error("Form data loading error:", err);
                setFormError(err.message || "Une erreur est survenue lors du chargement.");
            } finally {
                setLoadingFormData(false);
            }
        };

        const fetchPickerOptions = () => {
            fetchOwnerPresenceOptions();
            fetchAccessMethods();
            fetchPrivacyLevels();
            fetchEnvironments();
            fetchFoodAllowances();
            fetchPetAllowances();
            fetchPoolTypes();
            fetchWaterTreatments();
            fetchMusicAllowances();
            fetchMinAges();
            fetchGroupTypes();
        };

        if (sessionInitialized && !authLoading) {
            fetchFormData();
            fetchPickerOptions();
        }
    }, [sessionInitialized, authLoading]);

    // --- Fonctions Gestion UI ---
    const handleAmenityToggle = (amenityId: string) => {
        setSelectedAmenityIds(prev => {
            const newSet = new Set(prev);
            newSet.has(amenityId) ? newSet.delete(amenityId) : newSet.add(amenityId);
            return newSet;
        });
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission refusée", "L'accès à la galerie est requis.");
            return;
        }
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                selectionLimit: 5 - selectedImages.length,
            });
            if (!result.canceled && result.assets) {
                if (selectedImages.length + result.assets.length > 5) {
                    Alert.alert("Trop d'images", "Maximum 5 images.");
                    return;
                }
                setSelectedImages([...selectedImages, ...result.assets]);
            }
        } catch (err) {
            console.error("Error picking image:", err);
            Alert.alert("Erreur", "Impossible de charger l'image.");
        }
    };

    const removeImage = (indexToRemove: number) => {
        setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const toggleDaySelection = (dayIndex: number) => {
        setSelectedDays(prev => {
            const newSet = new Set(prev);
            newSet.has(dayIndex) ? newSet.delete(dayIndex) : newSet.add(dayIndex);
            console.log('Updated selectedDays:', Array.from(newSet));
            return newSet;
        });
    };

    const toggleAcceptedGroup = (groupValue: string) => {
        setAcceptedGroups(prev =>
            prev.includes(groupValue)
                ? prev.filter(g => g !== groupValue)
                : [...prev, groupValue]
        );
    };

    const nextSection = () => currentSection < 5 && setCurrentSection(currentSection + 1);
    const prevSection = () => currentSection > 1 && setCurrentSection(currentSection - 1);

    // --- Fonctions Gestion Extras ---
    const handleExtraToggle = (extraId: string) => {
        setSelectedExtras(prevMap => {
            const newMap = new Map(prevMap);
            const currentExtraState = newMap.get(extraId);
            if (currentExtraState) {
                newMap.set(extraId, {
                    ...currentExtraState,
                    active: !currentExtraState.active
                });
            }
            return newMap;
        });
        if (editingExtraId === extraId && !selectedExtras.get(extraId)?.active) {
            handleCancelEditExtraPrice();
        }
    };

    const handleEditExtraPrice = (extra: PoolExtra) => {
        const currentPrice = selectedExtras.get(extra.id)?.price ?? extra.price;
        setEditingExtraId(extra.id);
        setEditingExtraPrice(currentPrice.toString());
    };

    const handleSaveExtraPrice = (extraId: string) => {
        const price = parseFloat(editingExtraPrice);
        if (isNaN(price) || price < 0) {
            Alert.alert("Erreur", "Veuillez entrer un prix valide (nombre positif).");
            return;
        }
        setSelectedExtras(prevMap => {
            const newMap = new Map(prevMap);
            const currentExtraState = newMap.get(extraId);
            if (currentExtraState) {
                newMap.set(extraId, {
                    ...currentExtraState,
                    price: price
                });
            }
            return newMap;
        });
        setEditingExtraId(null);
        setEditingExtraPrice('');
    };

    const handleCancelEditExtraPrice = () => {
        setEditingExtraId(null);
        setEditingExtraPrice('');
    };

    const getActiveExtrasForSubmission = () => {
        const activeExtras: { extra_id: string; price: number; active: boolean }[] = [];
        selectedExtras.forEach(extraState => {
            if (extraState.active) {
                activeExtras.push({
                    extra_id: extraState.id,
                    price: extraState.price,
                    active: true
                });
            }
        });
        return activeExtras;
    };

    // --- Soumission ---
    const handleSubmit = async () => {
        // Log des états pour débogage
        console.log('Submitting with states:', {
            selectedDays: Array.from(selectedDays),
            startTime: startTime?.toISOString() || null,
            endTime: endTime?.toISOString() || null
        });

        if (!user) {
            setError('Vous devez être connecté.');
            return;
        }

        // Validation
        if (!title.trim() || !description.trim() || !location || !pricePerHour.trim() || !capacity.trim() || selectedDays.size === 0) {
            setError('Veuillez remplir tous les champs obligatoires (*), y compris les jours de disponibilité.');
            if (currentSection !== 1) setCurrentSection(1);
            return;
        }

        const parsedPrice = parseInt(pricePerHour, 10);
        const parsedCapacity = parseInt(capacity, 10);
        if (isNaN(parsedPrice) || isNaN(parsedCapacity) || parsedPrice <= 0 || parsedCapacity <= 0) {
            setError("Le prix et la capacité doivent être des nombres positifs valides.");
            if (currentSection !== 1) setCurrentSection(1);
            return;
        }

        // Utiliser des valeurs par défaut pour les horaires si non définis
        const defaultStartTime = startTime || new Date(2025, 4, 3, 8, 0);
        const defaultEndTime = endTime || new Date(2025, 4, 3, 23, 0);

        if (defaultEndTime <= defaultStartTime) {
            setError("L'heure de fin doit être postérieure à l'heure de début.");
            if (currentSection !== 1) setCurrentSection(1);
            return;
        }

        if (selectedImages.length === 0) {
            setError('Veuillez ajouter au moins une image.');
            if (currentSection !== 5) setCurrentSection(5);
            return;
        }

        if ((poolLength && isNaN(parseFloat(poolLength))) || (poolWidth && isNaN(parseFloat(poolWidth))) || (poolDepthMin && isNaN(parseFloat(poolDepthMin))) || (poolDepthMax && isNaN(parseFloat(poolDepthMax)))) {
            setError('Les dimensions, si renseignées, doivent être des nombres valides.');
            if (currentSection !== 3) setCurrentSection(3);
            return;
        }

        if (editingExtraId) {
            setError('Veuillez enregistrer ou annuler la modification du prix de l\'extra avant de soumettre.');
            if (currentSection !== 4) setCurrentSection(4);
            return;
        }

        setLoading(true);
        setError(null);
        let newListingId: string | null = null;

        try {
            // Préparer les données pour la RPC
            const schedulesPayload = Array.from(selectedDays).map(dayOfWeek => ({
                day_of_week: dayOfWeek,
                start_time: format(defaultStartTime, 'HH:mm:ss'),
                end_time: format(defaultEndTime, 'HH:mm:ss'),
            }));

            const extrasPayload = getActiveExtrasForSubmission();

            const rpcParams = {
                p_owner_id: user.id, 
                p_title: title.trim(),
                p_description: description.trim(),
                p_location: location,
                p_price_per_hour: parsedPrice,
                p_capacity: parsedCapacity,
                p_status: 'pending',
                p_owner_presence: ownerPresence,
                p_access_method: accessMethod,
                p_access_instructions: accessInstructions.trim() || null,
                p_privacy_level: privacyLevel,
                p_environment: environment,
                p_wifi_available: wifiAvailable,
                p_wifi_code: wifiCode.trim() || null,
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
                p_schedules: schedulesPayload.length > 0 ? schedulesPayload : null,
                p_extras: extrasPayload.length > 0 ? extrasPayload : null,
            };

            console.log("Calling RPC: create_complete_listing with params:", rpcParams);

            // Appeler la RPC
            const { data: rpcResult, error: rpcError } = await supabase.rpc<CreateListingResponse>('create_complete_listing', rpcParams);
            console.log("RPC Response:", { rpcResult, rpcError });

            if (rpcError || !rpcResult?.success) {
                throw new Error(rpcResult?.message || rpcError?.message || "Erreur lors de la création de l'annonce via RPC.");
            }

            if (!rpcResult.id) {
                throw new Error("La création a réussi mais l'ID n'a pas été retourné par la RPC.");
            }
            newListingId = rpcResult.id;

            // Gérer l'upload des images
            const uploadedImageUrls: { url: string; position: number }[] = [];
            if (selectedImages.length > 0) {
                const uploadPromises = selectedImages.map(async (image, index) => {
                    if (!image.uri) return null;
                    const fileExt = image.fileName?.split('.').pop()?.toLowerCase() ?? image.uri.split('.').pop()?.toLowerCase() ?? 'jpg';
                    const contentType = image.type ? `${image.type}/${fileExt}` : `image/${fileExt}`;
                    const uniqueFileName = `${Date.now()}_${index}.${fileExt}`;
                    const filePath = `public/${newListingId}/${uniqueFileName}`;
                    try {
                        const response = await fetch(image.uri);
                        const blob = await response.blob();
                        const { error: uploadError } = await supabase.storage
                            .from('pool-images')
                            .upload(filePath, blob, { contentType, upsert: false });
                        if (uploadError) throw new Error(`Upload image échoué: ${uploadError.message}`);
                        const { data: urlData } = supabase.storage.from('pool-images').getPublicUrl(filePath);
                        if (!urlData?.publicUrl) throw new Error('URL publique image non obtenue.');
                        return { url: urlData.publicUrl, position: index };
                    } catch (uploadErr: any) {
                        console.error(`Upload image ${index + 1} error:`, uploadErr);
                        throw uploadErr;
                    }
                });
                const results = await Promise.all(uploadPromises);
                uploadedImageUrls.push(...results.filter((res): res is { url: string; position: number } => res !== null));

                if (uploadedImageUrls.length > 0) {
                    const imageInserts = uploadedImageUrls.map(img => ({
                        listing_id: newListingId,
                        url: img.url,
                        position: img.position
                    }));
                    const { error: imagesInsertError } = await supabase.from('pool_images').insert(imageInserts);
                    if (imagesInsertError) {
                        console.error("Error inserting image records:", imagesInsertError);
                        setError(prev => prev ? `${prev}\nErreur enregistrement images.` : 'Erreur enregistrement images.');
                    }
                } else if (selectedImages.length > 0) {
                    console.warn("Images were selected but failed to upload/insert after listing creation.");
                    setError(prev => prev ? `${prev}\nÉchec sauvegarde des images.` : 'Échec sauvegarde des images.');
                }
            }

            Alert.alert("Annonce Créée", "Votre annonce a été enregistrée et est en attente de validation.");
            router.replace('/(tabs)/host/dashboard');

        } catch (err: any) {
            console.error('Erreur lors de la création complète (handleSubmit):', err);
            setError(`Erreur: ${err.message || 'Une erreur inconnue est survenue.'}`);
        } finally {
            setLoading(false);
        }
    };

    // --- Fonction de Rendu des Équipements par Catégorie ---
    const renderAmenitiesByCategory = () => {
        if (loadingFormData) {
            return <ActivityIndicator size="small" color="#0891b2" />;
        }
        if (availableAmenities.length === 0 && amenityCategories.length > 0) {
            return <Text style={styles.noItemsText}>Aucun équipement disponible.</Text>;
        }
        if (amenityCategories.length === 0 && !loadingFormData) {
            return <Text style={styles.noItemsText}>Impossible de charger les catégories d'équipements.</Text>;
        }

        return amenityCategories.map(category => {
            const amenitiesInCategory = availableAmenities.filter(amenity => amenity.category === category.name);
            if (amenitiesInCategory.length === 0) return null;

            return (
                <View key={category.id} style={styles.categorySection}>
                    <View style={styles.categoryHeaderContainer}>
                        <View style={styles.categoryHeaderLine}></View>
                        <Text style={styles.categoryLabel}>{category.label}</Text>
                        <View style={styles.categoryHeaderLine}></View>
                    </View>
                    <View style={styles.amenitiesGrid}>
                        {amenitiesInCategory.map(amenity => {
                            const IconComponent = iconMap[amenity.icon_name || ''] || Square;
                            const isSelected = selectedAmenityIds.has(amenity.id);
                            return (
                                <TouchableOpacity 
                                    key={amenity.id} 
                                    style={styles.amenityItem} 
                                    onPress={() => handleAmenityToggle(amenity.id)} 
                                    disabled={loading}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.amenityIconContainer}>
                                        <IconComponent size={20} color={isSelected ? '#0891b2' : '#64748b'} />
                                    </View>
                                    <Text style={[styles.amenityText, isSelected && styles.amenityTextSelected]}>
                                        {amenity.name}
                                    </Text>
                                    <View style={styles.checkboxContainer}>
                                        {isSelected ? <CheckSquare size={20} color="#0891b2" /> : <Square size={20} color="#64748b" />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            );
        });
    };

    // --- Fonction de Rendu des Extras ---
    const renderExtras = () => {
        if (loadingFormData) {
            return <ActivityIndicator size="small" color="#0891b2" />;
        }
        if (availableExtras.length === 0 && !loadingFormData) {
            return <Text style={styles.noItemsText}>Aucun extra disponible pour le moment.</Text>;
        }

        return availableExtras.map(extra => {
            const extraState = selectedExtras.get(extra.id);
            if (!extraState) return null;
            const isEditingThis = editingExtraId === extra.id;
            const isActive = extraState.active;
            const IconComponent = iconMap[extra.icon_name || ''] || Square;

            return (
                <View key={extra.id} style={styles.extraItem}>
                    <View style={styles.extraHeader}>
                        <View style={styles.extraTitleContainer}>
                            <View style={[styles.extraIconContainer, isActive && styles.extraIconActive]}>
                                <IconComponent size={18} color={isActive ? '#0c4a6e' : '#64748b'} />
                            </View>
                            <Text style={[styles.extraTitle, isActive && styles.extraTitleActive]}>{extra.name}</Text>
                        </View>
                        <Switch 
                            value={isActive} 
                            onValueChange={() => handleExtraToggle(extra.id)} 
                            disabled={loading || isEditingThis} 
                            trackColor={{ false: "#e5e7eb", true: "#bae6fd" }} 
                            thumbColor={isActive ? "#0ea5e9" : "#f1f5f9"} 
                            ios_backgroundColor="#e5e7eb" 
                        />
                    </View>
                    {isActive && (
                        <View style={styles.extraDetails}>
                            {extra.description && <Text style={styles.extraDescription}>{extra.description}</Text>}
                            <View style={styles.extraPriceRow}>
                                {isEditingThis ? (
                                    <View style={styles.editPriceContainer}>
                                        <TextInput 
                                            style={styles.priceInput} 
                                            value={editingExtraPrice} 
                                            onChangeText={setEditingExtraPrice} 
                                            keyboardType="numeric" 
                                            placeholder="Prix" 
                                            autoFocus={true} 
                                        />
                                        <View style={styles.editButtons}>
                                            <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveExtraPrice(extra.id)}>
                                                <CheckCircle size={22} color="#16a34a" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEditExtraPrice}>
                                                <CancelIcon size={22} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.extraPrice}>{extraState.price} MAD</Text>
                                        <TouchableOpacity style={styles.editPriceButton} onPress={() => handleEditExtraPrice(extra)} disabled={loading}>
                                            <Edit size={16} color="#0ea5e9" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            );
        });
    };

    // --- Rendu Principal ---
    if (!fontsLoaded || loadingFormData || loadingOwnerPresence) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
                <Text style={styles.loadingText}>Chargement du formulaire...</Text>
            </SafeAreaView>
        );
    }

    if (fontError || formError) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>{fontError?.message || formError || "Erreur critique."}</Text>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.notLoggedInContainer}>
                <Text style={styles.notLoggedInTitle}>Connectez-vous pour créer une annonce.</Text>
                <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/sign-in')}>
                    <Text style={styles.loginButtonText}>Se Connecter</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Nouvelle Annonce' }} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ChevronLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nouvelle Annonce</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.sectionsNav}>
                {['Général', 'Accès', 'Équipements', 'Règles', 'Photos'].map((tab, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={[styles.sectionTab, currentSection === index + 1 && styles.activeSection]} 
                        onPress={() => setCurrentSection(index + 1)}
                    >
                        <Text style={[styles.sectionTabText, currentSection === index + 1 && styles.activeSectionText]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                <Animated.View entering={FadeIn.delay(100)} style={styles.form}>
                    {error && <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>}

                    {currentSection === 1 && (
                        <>
                            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Informations Générales</Text></View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Titre <Text style={styles.required}>*</Text></Text>
                                <TextInput 
                                    style={styles.input} 
                                    value={title} 
                                    onChangeText={setTitle} 
                                    placeholder="Ex: Villa avec piscine chauffée" 
                                    editable={!loading} 
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
                                <TextInput 
                                    style={[styles.input, styles.textArea]} 
                                    value={description} 
                                    onChangeText={setDescription} 
                                    placeholder="Décrivez votre piscine..." 
                                    multiline 
                                    editable={!loading} 
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Localisation <Text style={styles.required}>*</Text></Text>
                                {loadingFormData ? <ActivityIndicator /> : cities.length === 0 ? (
                                    <Text style={styles.errorTextPicker}>Aucune ville chargée.</Text>
                                ) : (
                                    <View style={styles.pickerContainer}>
                                        <Picker 
                                            selectedValue={location} 
                                            onValueChange={itemValue => setLocation(itemValue ? String(itemValue) : null)} 
                                            style={styles.picker} 
                                            enabled={!loading}
                                        >
                                            <Picker.Item label="-- Sélectionnez --" value={null} style={styles.pickerPlaceholderItem} />
                                            {cities.map(city => <Picker.Item key={city.id} label={city.name} value={city.name} />)}
                                        </Picker>
                                    </View>
                                )}
                            </View>
                            <View style={styles.rowInputs}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Prix/heure (MAD) <Text style={styles.required}>*</Text></Text>
                                    <View style={styles.inputWithIcon}>
                                        <DollarSign size={20} color="#64748b" />
                                        <TextInput 
                                            style={styles.iconInput} 
                                            value={pricePerHour} 
                                            onChangeText={setPricePerHour} 
                                            keyboardType="numeric" 
                                            editable={!loading} 
                                        />
                                    </View>
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Capacité Max <Text style={styles.required}>*</Text></Text>
                                    <View style={styles.inputWithIcon}>
                                        <Users size={20} color="#64748b" />
                                      {/* Remplacer le champ capacité existant par ce Picker */}
<View style={[styles.inputGroup, { flex: 1 }]}>
  <Text style={styles.label}>Capacité Max <Text style={styles.required}>*</Text></Text>
  <View style={styles.pickerContainer}>
    <Picker
      selectedValue={capacity}
      onValueChange={(itemValue) => setCapacity(itemValue.toString())}
      style={styles.picker}
      enabled={!loading}
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
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Disponibilité <Text style={styles.required}>*</Text></Text>
                                <Text style={styles.subLabel}>Jours et plage horaire unique d'ouverture.</Text>
                                <View style={styles.daySelectorContainer}>
                                    {dayNames.map((day, index) => {
                                        const dayIndex = index + 1;
                                        const isSelected = selectedDays.has(dayIndex);
                                        return (
                                            <TouchableOpacity 
                                                key={dayIndex} 
                                                style={[styles.dayButton, isSelected && styles.dayButtonSelected]} 
                                                onPress={() => toggleDaySelection(dayIndex)} 
                                                disabled={loading}
                                            >
                                                <Text style={[styles.dayButtonText, isSelected && styles.dayButtonTextSelected]}>{day}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                                {selectedDays.size > 0 && (
                                    <View style={styles.timeSelectorContainer}>
                                        <Text style={styles.subLabel}>Plage horaire (appliquée aux jours cochés)</Text>
                                        <View style={styles.timePickersRow}>
                                            <TimePicker value={startTime} onChange={setStartTime} label="Début" disabled={loading} />
                                            <TimePicker value={endTime} onChange={setEndTime} label="Fin" disabled={loading} minTime={startTime} />
                                        </View>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    {currentSection === 2 && (
                        <>
                            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Accès et Environnement</Text></View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Présence Hôte</Text>
                                {loadingOwnerPresence ? <ActivityIndicator /> : errorOwnerPresence ? <Text style={styles.errorTextPicker}>{errorOwnerPresence}</Text> : (
                                    <View style={styles.pickerContainer}>
                                        <Picker 
                                            selectedValue={ownerPresence} 
                                            onValueChange={setOwnerPresence} 
                                            style={styles.picker} 
                                            enabled={!loading}
                                        >
                                            {ownerPresenceDbOptions.map(o => <Picker.Item key={o.value} label={o.label} value={o.value} />)}
                                        </Picker>
                                    </View>
                                )}
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Méthode d'Accès</Text>
                                {loadingAccessMethods ? <ActivityIndicator /> : errorAccessMethods ? <Text style={styles.errorTextPicker}>{errorAccessMethods}</Text> : (
                                    <View style={styles.pickerContainer}>
                                        <Picker 
                                            selectedValue={accessMethod} 
                                            onValueChange={setAccessMethod} 
                                            style={styles.picker} 
                                            enabled={!loading}
                                        >
                                            {accessMethodDbOptions.map(o => <Picker.Item key={o.value} label={o.label} value={o.value} />)}
                                        </Picker>
                                    </View>
                                )}
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Instructions Accès</Text>
                                <TextInput 
                                    style={[styles.input, styles.textArea]} 
                                    value={accessInstructions} 
                                    onChangeText={setAccessInstructions} 
                                    placeholder="Code portail, boîte à clés, chemin à suivre..." 
                                    multiline 
                                    editable={!loading} 
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confidentialité (Vis-à-vis)</Text>
                                {loadingPrivacyLevels ? <ActivityIndicator /> : errorPrivacyLevels ? <Text style={styles.errorTextPicker}>{errorPrivacyLevels}</Text> : (
                                    <View style={styles.pickerContainer}>
                                        <Picker 
                                            selectedValue={privacyLevel} 
                                            onValueChange={setPrivacyLevel} 
                                            style={styles.picker} 
                                            enabled={!loading}
                                        >
                                            {privacyLevelDbOptions.map(o => <Picker.Item key={o.value} label={o.label} value={o.value} />)}
                                        </Picker>
                                    </View>
                                )}
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Environnement</Text>
                                {loadingEnvironments ? <ActivityIndicator /> : errorEnvironments ? <Text style={styles.errorTextPicker}>{errorEnvironments}</Text> : (
                                    <View style={styles.pickerContainer}>
                                        <Picker 
                                            selectedValue={environment} 
                                            onValueChange={setEnvironment} 
                                            style={styles.picker} 
                                            enabled={!loading}
                                        >
                                            {environmentDbOptions.map(o => <Picker.Item key={o.value} label={o.label} value={o.value} />)}
                                        </Picker>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    {currentSection === 3 && (
                        <>
                            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Équipements et Piscine</Text></View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Équipements Inclus</Text>
                                <View style={styles.amenitiesContainer}>
                                    {renderAmenitiesByCategory()}
                                </View>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Type de piscine</Text>
                                {loadingPoolTypes ? <ActivityIndicator /> : errorPoolTypes ? (
                                    <Text style={styles.errorTextPicker}>{errorPoolTypes}</Text>
                                ) : (
                                    <View style={styles.pickerContainer}>
                                        <Picker 
                                            selectedValue={poolType} 
                                            onValueChange={setPoolType} 
                                            style={styles.picker} 
                                            enabled={!loading}
                                        >
                                            {poolTypeDbOptions.map(o => <Picker.Item key={o.value} label={o.label} value={o.value} />)}
                                        </Picker>
                                    </View>
                                )}
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Dimensions de la piscine</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={getSelectedSize()}
                                        onValueChange={(value) => handleSizeSelect(value)}
                                        enabled={!loading}
                                    >
                                        <Picker.Item label="Petit (5x3m)" value="small" />
                                        <Picker.Item label="Moyen (8x4m)" value="medium" />
                                        <Picker.Item label="Grand (10x5m)" value="large" />
                                        <Picker.Item label="Personnalisé" value="custom" />
                                    </Picker>
                                </View>
                            </View>
                            {getSelectedSize() === 'custom' && (
                                <>
                                    <View style={styles.rowInputs}>
                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={styles.label}>Longueur (m)</Text>
                                            <TextInput 
                                                style={styles.input} 
                                                value={poolLength} 
                                                onChangeText={setPoolLength} 
                                                keyboardType="numeric" 
                                                placeholder="Ex: 10"
                                                editable={!loading} 
                                            />
                                        </View>
                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={styles.label}>Largeur (m)</Text>
                                            <TextInput 
                                                style={styles.input} 
                                                value={poolWidth} 
                                                onChangeText={setPoolWidth} 
                                                keyboardType="numeric"
                                                placeholder="Ex: 5" 
                                                editable={!loading} 
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.rowInputs}>
                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={styles.label}>Profondeur min. (m)</Text>
                                            <TextInput 
                                                style={styles.input} 
                                                value={poolDepthMin} 
                                                onChangeText={setPoolDepthMin} 
                                                keyboardType="numeric"
                                                placeholder="Ex: 1.2" 
                                                editable={!loading} 
                                            />
                                        </View>
                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={styles.label}>Profondeur max. (m)</Text>
                                            <TextInput 
                                                style={styles.input} 
                                                value={poolDepthMax} 
                                                onChangeText={setPoolDepthMax} 
                                                keyboardType="numeric"
                                                placeholder="Ex: 2.5" 
                                                editable={!loading} 
                                            />
                                        </View>
                                    </View>
                                </>
                            )}
                            <View style={styles.checkboxesGroup}>
                                <Text style={styles.label}>Options</Text>
                                <TouchableOpacity 
                                    style={styles.checkboxRow} 
                                    onPress={() => setHeated(!heated)}
                                    disabled={loading}
                                >
                                    <View style={styles.checkbox}>
                                        {heated && <View style={styles.checked} />}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Piscine chauffée</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.checkboxRow} 
                                    onPress={() => setNightLighting(!nightLighting)}
                                    disabled={loading}
                                >
                                    <View style={styles.checkbox}>
                                        {nightLighting && <View style={styles.checked} />}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Éclairage nocturne</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.checkboxRow} 
                                    onPress={() => setWifiAvailable(!wifiAvailable)}
                                    disabled={loading}
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
                                        editable={!loading} 
                                    />
                                </View>
                            )}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Traitement de l'eau</Text>
                                {loadingWaterTreatments ? <ActivityIndicator /> : errorWaterTreatments ? (
                                    <Text style={styles.errorTextPicker}>{errorWaterTreatments}</Text>
                                ) : (
                                    <View style={styles.pickerContainer}>
                                        <Picker 
                                            selectedValue={waterTreatment} 
                                            onValueChange={setWaterTreatment} 
                                            style={styles.picker} 
                                            enabled={!loading}
                                        >
                                            {waterTreatmentDbOptions.map(o => <Picker.Item key={o.value} label={o.label} value={o.value} />)}
                                        </Picker>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    {currentSection === 4 && (
                        <>
                            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Règles et Extras</Text></View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nourriture</Text>
                                {loadingFoodAllowances ? <ActivityIndicator /> : errorFoodAllowances ? <Text style={styles.errorTextPicker}>{errorFoodAllowances}</Text> : (
                                    <View style={styles.pickerContainer}>
                                        <Picker 
                                            selectedValue={foodAllowed} 
                                            onValueChange={setFoodAllowed} 
                                            style={styles.picker} 
                                            enabled={!loading}
                                        >
                                            {foodAllowanceDbOptions.map(o => <Picker.Item key={o.value} label={o.label} value={o.value} />)}
                                        </Picker>
                                    </View>
                                )}
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Musique</Text>
                                {loadingMusicAllowances ? <ActivityIndicator /> : errorMusicAllowances ? <Text style={styles.errorTextPicker}>{errorMusicAllowances}</Text> : (
                                    <View style={styles.pickerContainer}>
                                        <Picker 
                                            selectedValue={musicAllowed} 
                                            onValueChange={setMusicAllowed} 
                                            style={styles.picker} 
                                            enabled={!loading}
                                        >
                                            {musicAllowanceDbOptions.map(o => <Picker.Item key={o.value} label={o.label} value={o.value} />)}
                                        </Picker>
                                    </View>
                                )}
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Photos Autorisées</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker 
                                        selectedValue={photosAllowed} 
                                        onValueChange={setPhotosAllowed} 
                                        style={styles.picker} 
                                        enabled={!loading}
                                    >
                                        {photosAllowedOptions.map(o => <Picker.Item key={o.value} label={o.label} value={o.value} />)}
                                    </Picker>
                                </View>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Animaux</Text>
                                {loadingPetAllowances ? <ActivityIndicator /> : errorPetAllowances ? <Text style={styles.errorTextPicker}>{errorPetAllowances}</Text> : (
                                    <View style={styles.pickerContainer}>
                                        <Picker 
                                            selectedValue={petsAllowed} 
                                            onValueChange={setPetsAllowed} 
                                            style={styles.picker} 
                                            enabled={!loading}
                                        >
                                            {petAllowanceDbOptions.map(o => <Picker.Item key={o.value} label={o.label} value={o.value} />)}
                                        </Picker>
                                    </View>
                                )}
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Âge Minimum Requis</Text>
                                {loadingMinAges ? <ActivityIndicator /> : errorMinAges ? <Text style={styles.errorTextPicker}>{errorMinAges}</Text> : (
                                    <View style={styles.pickerContainer}>
                                        <Picker 
                                            selectedValue={minAge} 
                                            onValueChange={setMinAge} 
                                            style={styles.picker} 
                                            enabled={!loading}
                                        >
                                            {minAgeDbOptions.map(o => <Picker.Item key={o.value} label={o.label} value={o.value} />)}
                                        </Picker>
                                    </View>
                                )}
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Groupes Acceptés</Text>
                                {loadingGroupTypes ? <ActivityIndicator /> : errorGroupTypes ? <Text style={styles.errorTextPicker}>{errorGroupTypes}</Text> : (
                                    <View style={styles.checkboxGroup}>
                                        {groupTypeDbOptions.map(option => (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={[styles.checkboxItem, acceptedGroups.includes(option.value) && styles.checkboxItemSelected]}
                                                onPress={() => toggleAcceptedGroup(option.value)}
                                                disabled={loading}
                                            >
                                                <Text style={styles.checkboxText}>{option.label}</Text>
                                                {acceptedGroups.includes(option.value) ? <CheckSquare size={16} color="#0891b2"/> : <Square size={16} color="#6b7280"/>}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Services et extras (optionnel)</Text>
                                <View style={styles.extrasContainer}>
                                    {renderExtras()}
                                </View>
                            </View>
                        </>
                    )}

                    {currentSection === 5 && (
                        <>
                            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Photos</Text></View>
                            <TouchableOpacity 
                                style={styles.addImageButton} 
                                onPress={pickImage} 
                                disabled={loading || selectedImages.length >= 5}
                            >
                                <ImageIcon size={20} color="#0891b2" />
                                <Text style={styles.addImageText}>Ajouter Photos ({selectedImages.length}/5)</Text>
                            </TouchableOpacity>
                            <View style={styles.imagePreviewContainer}>
                                {selectedImages.map((image, index) => (
                                    <View key={index} style={styles.imageWrapper}>
                                        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                                        <TouchableOpacity 
                                            style={styles.removeImageButton} 
                                            onPress={() => removeImage(index)} 
                                            disabled={loading}
                                        >
                                            <CloseIcon size={16} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            {selectedImages.length === 0 && <Text style={styles.noItemsText}>Ajoutez au moins une photo.</Text>}
                        </>
                    )}

                    <View style={styles.sectionNavigation}>
                        {currentSection > 1 && (
                            <TouchableOpacity style={styles.navButton} onPress={prevSection} disabled={loading}>
                                <Text style={styles.navButtonText}>Précédent</Text>
                            </TouchableOpacity>
                        )}
                        {currentSection === 1 && <View style={{ flex: 1 }} />}
                        {currentSection < 5 && (
                            <TouchableOpacity style={styles.navButton} onPress={nextSection} disabled={loading}>
                                <Text style={styles.navButtonText}>Suivant</Text>
                            </TouchableOpacity>
                        )}
                        {currentSection === 5 && (
                            <TouchableOpacity 
                                style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
                                onPress={handleSubmit} 
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Créer l'annonce</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 10, fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#1e293b' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', padding: 20 },
  errorText: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#dc2626', textAlign: 'center' },
  errorBanner: { backgroundColor: '#fef2f2', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca', marginBottom: 20 },
  notLoggedInContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  notLoggedInTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 18, color: '#1e293b', textAlign: 'center', marginBottom: 20 },
  loginButton: { backgroundColor: '#0891b2', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  loginButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backButton: { padding: 8, marginRight: 8 },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1e293b' },
  sectionsNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  sectionTab: { paddingVertical: 8, paddingHorizontal: 12 },
  sectionTabText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b' },
  activeSection: { borderBottomWidth: 2, borderBottomColor: '#0891b2' },
  activeSectionText: { fontFamily: 'Montserrat-SemiBold', color: '#0891b2' },
  content: { flex: 1 },
  form: { padding: 16 },
  sectionHeader: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 8 },
  sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b' },
  inputGroup: { marginBottom: 24 },
  label: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#334155', marginBottom: 8 },
  required: { color: '#dc2626' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontFamily: 'Montserrat-Regular', fontSize: 15, backgroundColor: '#fff', minHeight: 48, color: '#111827' },
  textArea: { height: 120, textAlignVertical: 'top' },
  pickerContainer: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, backgroundColor: '#fff', minHeight: 48, justifyContent: 'center' },
  picker: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#111827', height: Platform.OS === 'ios' ? undefined : 48, width: '100%' },
  pickerPlaceholderItem: { color: '#9ca3af' },
  errorTextPicker: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#b91c1c', marginTop: 4, marginLeft: 2 },
  rowInputs: { flexDirection: 'row', gap: 16 },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#fff', height: 48 },
  iconInput: { flex: 1, paddingVertical: 12, paddingLeft: 8, fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#111827' },
  amenitiesContainer: { backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', padding: 16 },
  categorySection: { marginBottom: 20 },
  categoryHeaderContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  categoryHeaderLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  categoryLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#475569', paddingHorizontal: 12 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', width: '50%', paddingVertical: 12, paddingHorizontal: 8 },
  amenityIconContainer: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  amenityText: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#374151', flex: 1 },
  amenityTextSelected: { fontFamily: 'Montserrat-SemiBold', color: '#0c4a6e' },
  checkboxContainer: { width: 28, alignItems: 'center' },
  addImageButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#0891b2', borderStyle: 'dashed', borderRadius: 8, padding: 16, marginBottom: 16, backgroundColor: '#f0f9ff' },
  addImageText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#0891b2', marginLeft: 8 },
  imagePreviewContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imageWrapper: { position: 'relative', width: 100, height: 100 },
  imagePreview: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#e2e8f0' },
  removeImageButton: { position: 'absolute', top: -5, right: -5, backgroundColor: 'rgba(220, 38, 38, 0.9)', borderRadius: 12, padding: 4 },
  checkboxGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  checkboxItem: { flexBasis: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', minHeight: 44 },
  checkboxItemSelected: { borderColor: '#0891b2', backgroundColor: '#f0f9ff' },
  checkboxText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#334155', flexShrink: 1, marginRight: 8 },
  daySelectorContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  dayButton: { paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, alignItems: 'center', marginBottom: 8, backgroundColor: '#fff', minWidth: 44 },
  dayButtonSelected: { backgroundColor: '#0891b2', borderColor: '#06b6d4' },
  dayButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#334155' },
  dayButtonTextSelected: { color: '#fff' },
  subLabel: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#6b7280', marginBottom: 10 },
  timeSelectorContainer: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 16 },
  timePickersRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  extrasContainer: { backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', overflow: 'hidden' },
  extraItem: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9', padding: 12 },
  extraHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  extraTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  extraTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#374151', marginLeft: 8 },
  extraTitleActive: { color: '#0c4a6e' },
  extraIconContainer: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  extraIconActive: { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' },
  extraDetails: { marginTop: 12, paddingLeft: 36 },
  extraDescription: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#4b5563', marginBottom: 8 },
  extraPriceRow: { flexDirection: 'row', alignItems: 'center' },
  priceContainer: { flexDirection: 'row', alignItems: 'center' },
  extraPrice: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#1e293b', marginRight: 8 },
  editPriceButton: { padding: 4 },
  editPriceContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  priceInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, padding: 8, fontFamily: 'Montserrat-Regular', fontSize: 14, backgroundColor: '#fff', width: 100, marginRight: 12, color: '#111827' },
  editButtons: { flexDirection: 'row', gap: 8 },
  saveButton: { padding: 4 },
  cancelButton: { padding: 4 },
  checkboxesGroup: { marginBottom: 24 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checked: { width: 12, height: 12, backgroundColor: '#0891b2', borderRadius: 2 },
  checkboxLabel: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#374151' },
  sectionNavigation: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 16 },
  navButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#0891b2', borderRadius: 8, alignItems: 'center', backgroundColor: '#f0f9ff' },
  navButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#0891b2' },
  submitButton: { flex: 1, padding: 12, backgroundColor: '#0891b2', borderRadius: 8, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: '#6b7280', opacity: 0.7 },
  submitButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#fff' },
  noItemsText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#6b7280', textAlign: 'center', marginVertical: 16 },
});

