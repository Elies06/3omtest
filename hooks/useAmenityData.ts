// hooks/useAmenityData.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Interfaces
interface Amenity {
    id: string;
    name: string;
    icon_name: string | null;
    category_id: string; // Utilise l'ID de la catégorie au lieu du nom
}
interface AmenityCategory {
    id: string;
    name: string;
    label: string;
    sort_order: number;
}
interface City {
    id: string | number;
    name: string;
}
interface PoolExtra {
    id: string;
    name: string;
    description: string | null;
    price: number;
    icon_name: string | null;
    category: string;
    sort_order: number;
}

interface FormDataResponse {
    cities: City[];
    amenities: Amenity[];
    categories: AmenityCategory[];
    extras: PoolExtra[];
}

export interface UseAmenityDataReturn {
    availableAmenities: Amenity[];
    amenityCategories: AmenityCategory[];
    cities: City[];
    availableExtras: PoolExtra[];
    isLoading: boolean;
    loadingAmenities: boolean;
    loadingCities: boolean;
    loadingExtras: boolean;
    loadingCategories: boolean;
    error: string | null;
    refetch: () => void;
}

export function useAmenityData(): UseAmenityDataReturn {
    const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
    const [amenityCategories, setAmenityCategories] = useState<AmenityCategory[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [availableExtras, setAvailableExtras] = useState<PoolExtra[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadingAmenities, setLoadingAmenities] = useState<boolean>(true);
    const [loadingCities, setLoadingCities] = useState<boolean>(true);
    const [loadingExtras, setLoadingExtras] = useState<boolean>(true);
    const [loadingCategories, setLoadingCategories] = useState<boolean>(true);

    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setLoadingAmenities(true);
        setLoadingCities(true);
        setLoadingExtras(true);
        setLoadingCategories(true);
        setError(null);

        try {
            console.log("🚀 [useAmenityData] Appel RPC get_listing_form_data...");
            const { data, error: rpcError } = await supabase.rpc('get_listing_form_data');
            
            if (rpcError) {
                console.error("Erreur RPC get_listing_form_data:", rpcError);
                throw new Error("Impossible de charger les données de formulaire.");
            }

            if (!data) {
                throw new Error("Aucune donnée retournée par la RPC.");
            }

            const responseData = data as FormDataResponse;

            // Initialisation sécurisée
            if (responseData.amenities) {
                setAvailableAmenities(responseData.amenities);
                setLoadingAmenities(false);
            }
            if (responseData.categories) {
                setAmenityCategories(responseData.categories);
                setLoadingCategories(false);
            }
            if (responseData.cities) {
                setCities(responseData.cities);
                setLoadingCities(false);
            }
            if (responseData.extras) {
                setAvailableExtras(responseData.extras);
                setLoadingExtras(false);
            }

            console.log("✅ [useAmenityData] Données chargées avec succès");

        } catch (err: any) {
            console.error("❌ [useAmenityData] Erreur lors du chargement:", err);
            setError(err.message || "Erreur de chargement des données.");
            setLoadingAmenities(false);
            setLoadingCities(false);
            setLoadingExtras(false);
            setLoadingCategories(false);
            setAvailableAmenities([]);
            setAmenityCategories([]);
            setCities([]);
            setAvailableExtras([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Charger les données au montage du hook (la première fois qu'il est utilisé)
    useEffect(() => {
        fetchData();
    }, [fetchData]); // fetchData est stable grâce à useCallback([])

    return {
        availableAmenities,
        amenityCategories,
        cities,
        availableExtras,
        isLoading,
        loadingAmenities,
        loadingCities,
        loadingExtras,
        loadingCategories,
        error,
        refetch: fetchData
    };
}