import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    Platform, Image, ActivityIndicator, Alert, SafeAreaView
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import {
    ChevronLeft, MapPin, DollarSign, Users, RefreshCcw, CheckSquare, Square, X as XIcon, Image as ImageIcon,
    Wifi, Car, Umbrella, Waves, Thermometer, ShowerHead, Bath, Flame, Warehouse, Grill,
    BadgeCheck, AlertCircle,
} from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

// Interfaces
interface UserVerification {
    id: string;
    level: number;
    status: 'pending' | 'approved' | 'rejected';
    document_type: string;
    document_number: string;
    document_front_path: string | null;
    document_back_path: string | null;
    user_face_path: string | null; // Chemin pour la photo du visage
    rejection_reason?: string;
    user_id: string;
}

interface InitialListingData {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    price_per_hour: number | null;
    capacity: number | null;
    pool_images: { id: string; url: string; position: number }[] | null;
    pool_amenities: { amenities: { id: string } | null }[] | null;
    user_id: string | null;
}
interface City { id: string | number; name: string; }
interface Amenity { id: string; name: string; icon_name: string | null; }
interface ExistingImage { id: string; url: string; position: number; }
type ImageAsset = ImagePicker.ImagePickerAsset;

const iconMap: { [key: string]: React.ElementType } = {
    Wifi: Wifi, Car: Car, Umbrella: Umbrella, Waves: Waves, Thermometer: Thermometer, ShowerHead: ShowerHead, Bath: Bath, Flame: Flame, Warehouse: Warehouse, Grill: Grill,
};

export default function EditListingScreen() {
    // ... (Code existant pour l'état, les hooks, etc.)

    // Fetch Vérification Utilisateur
    const fetchUserVerification = useCallback(async (userId: string) => {
        setLoadingVerification(true);
        setVerificationError(null);
        try {
            const { data, error } = await supabase
                .from('identity_verifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .maybeSingle();

            if (error) throw error;
            setUserVerification(data || null);
        } catch (err: any) {
            console.error("Error fetching user verification:", err);
            setVerificationError(err.message || "Erreur chargement vérification.");
        } finally {
            setLoadingVerification(false);
        }
    }, []);

    // ... (Code existant - fetchInitialData, fetchCities, fetchAmenities, etc.)

    return (
        <SafeAreaView style={styles.container}>
            {/* ... (Code existant - Header, etc.) */}

            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.form}>
                    {/* ... (Code existant - Champs Principaux, Images, etc.) */}

                    {/* Section Vérification d'Identité */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Vérification d'Identité</Text>
                        {loadingVerification ? (
                            <ActivityIndicator />
                        ) : verificationError ? (
                            <Text style={styles.errorText}>{verificationError}</Text>
                        ) : userVerification ? (
                            <View style={styles.verificationCard}>
                                <Text style={styles.verificationInfo}>
                                    Statut: {userVerification.status}
                                </Text>
                                <Text style={styles.verificationInfo}>
                                    Type de document: {userVerification.document_type}
                                </Text>
                                <Text style={styles.verificationInfo}>
                                    Numéro de document: {userVerification.document_number}
                                </Text>

                                {/* Affichage Recto/Verso */}
                                {userVerification.document_front_path && (
                                    <View style={styles.imageDisplayContainer}>
                                        <Text style={styles.imageLabel}>Recto:</Text>
                                        <Image
                                            source={{ uri: userVerification.document_front_path }}
                                            style={styles.verificationImage}
                                        />
                                    </View>
                                )}
                                {userVerification.document_back_path && (
                                    <View style={styles.imageDisplayContainer}>
                                        <Text style={styles.imageLabel}>Verso:</Text>
                                        <Image
                                            source={{ uri: userVerification.document_back_path }}
                                            style={styles.verificationImage}
                                        />
                                    </View>
                                )}

                                {/* Affichage de la photo du visage */}
                                {userVerification.user_face_path && (
                                    <View style={styles.imageDisplayContainer}>
                                        <Text style={styles.imageLabel}>Photo du Visage:</Text>
                                        <Image
                                            source={{ uri: userVerification.user_face_path }}
                                            style={styles.verificationImage}
                                        />
                                    </View>
                                )}

                                {/* ... (Code existant - Boutons Approuver/Rejeter) */}

                            </View>
                        ) : (
                            <Text style={styles.noVerifications}>
                                Aucune vérification en attente.
                            </Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* ... (Code existant - Footer) */}
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    // ... Vos styles existants ...
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    sectionTitle: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 18,
        color: '#1e293b',
        marginBottom: 16,
    },
    verificationCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    verificationInfo: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
    },
    verificationActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        minHeight: 44,
    },
    approveButton: {
        backgroundColor: '#10b981',
    },
    rejectButton: {
        backgroundColor: '#ef4444',
    },
    actionButtonText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: '#ffffff',
    },
    noVerifications: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    imageDisplayContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    imageLabel: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: '#1e293b',
        marginBottom: 5,
    },
    verificationImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#e5e7eb',
    },
});