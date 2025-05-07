// Dans app/booking/index.tsx - CORRECTION de la boucle infinie

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
    ActivityIndicator, SafeAreaView, Alert, RefreshControl
} from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { format, addDays, isSameDay, isBefore, startOfDay, endOfDay, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

interface BookingPoolData {
    title: string;
    capacity: number | null;
    available_time_slots: string[] | null;
    price_per_hour: number | null;
    location?: string | null;
    owner_id?: string;
}

// Helper pour parser et formater les créneaux
const parseTimeSlot = (slot: string): { start: { hour: number, minute: number }, end: { hour: number, minute: number } } | null => {
    const match = slot.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    if (!match) return null;
    return {
        start: { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10) },
        end: { hour: parseInt(match[3], 10), minute: parseInt(match[4], 10) }
    };
};

const formatBookingToSlotString = (bookingStartTime: Date, bookingEndTime: Date): string => {
    return `${format(bookingStartTime, 'HH:mm')} - ${format(bookingEndTime, 'HH:mm')}`;
};

export default function BookingScreen() {
    // Paramètres et états principaux
    const params = useLocalSearchParams<{ poolId: string }>();
    const poolId = useMemo(() => params.poolId as string, [params.poolId]);
    
    const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [guestCount, setGuestCount] = useState(1);
    
    // États de données
    const [poolData, setPoolData] = useState<BookingPoolData | null>(null);
    const [isLoadingPool, setIsLoadingPool] = useState(true);
    const [fetchPoolError, setFetchPoolError] = useState<string | null>(null);
    const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    
    // Références pour éviter les appels multiples
    const isMounted = useRef(true);
    const initialLoadDone = useRef(false);
    const initialAvailabilityCheck = useRef(false);
    const dataFetchInProgress = useRef(false);
    const availabilityCheckInProgress = useRef(false);
    
    // Polices
    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });
    
    // Effet pour suivre le montage/démontage du composant
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);
    
    // Chargement des données de la piscine
    const loadPoolData = useCallback(async (isRefresh = false) => {
        if (dataFetchInProgress.current && !isRefresh) return;
        if (!poolId) {
            if (isMounted.current) {
                setFetchPoolError("ID piscine manquant.");
                setIsLoadingPool(false);
            }
            return;
        }
        
        if (!isRefresh && isMounted.current) setIsLoadingPool(true);
        if (isMounted.current) setFetchPoolError(null);
        dataFetchInProgress.current = true;
        
        try {
            console.log(`🚀 Chargement des données de la piscine ID: ${poolId}`);
            
            const { data, error } = await supabase
                .from('pool_listings')
                .select('title, capacity, available_time_slots, price_per_hour, location, owner_id')
                .eq('id', poolId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new Error("Piscine introuvable.");
                }
                throw error;
            }
            
            if (!data) throw new Error("Données de la piscine non trouvées.");
            
            const formattedData = {
                ...data,
                available_time_slots: data.available_time_slots === null ? [] : data.available_time_slots
            };
            
            if (isMounted.current) {
                setPoolData(formattedData as BookingPoolData);
            }
        } catch (err: any) {
            console.error("Erreur chargement données piscine:", err);
            if (isMounted.current) {
                setFetchPoolError(err.message || "Erreur chargement piscine.");
                setPoolData(null);
            }
        } finally {
            if (!isRefresh && isMounted.current) setIsLoadingPool(false);
            dataFetchInProgress.current = false;
            initialLoadDone.current = true;
        }
    }, [poolId]);
    
    // Vérification des disponibilités
    const checkAvailability = useCallback(async (dateToCheck: Date) => {
        if (!poolId || !dateToCheck) return;
        
        if (availabilityCheckInProgress.current) return;
        availabilityCheckInProgress.current = true;
        
        if (isMounted.current) {
            setLoadingAvailability(true);
            setAvailabilityError(null);
        }
        
        const formattedDate = format(dateToCheck, 'yyyy-MM-dd');
        console.log(`⏳ Vérification disponibilité pour ${poolId} le ${formattedDate}`);

        const dayStart = startOfDay(dateToCheck).toISOString();
        const dayEnd = endOfDay(dateToCheck).toISOString();

        try {
            const { data: conflictingBookings, error } = await supabase
                .from('bookings')
                .select('start_time, end_time')
                .eq('listing_id', poolId)
                .in('status', ['confirmed', 'pending'])
                .lt('start_time', dayEnd)
                .gt('end_time', dayStart);

            if (error) throw error;

            const currentlyBookedSlots = new Set<string>();
            
            if (conflictingBookings && conflictingBookings.length > 0) {
                conflictingBookings.forEach(booking => {
                    try {
                        const start = parseISO(booking.start_time);
                        const end = parseISO(booking.end_time);
                        if (isValid(start) && isValid(end) && isSameDay(start, dateToCheck)) {
                            const slotString = formatBookingToSlotString(start, end);
                            currentlyBookedSlots.add(slotString);
                        }
                    } catch (parseError) { 
                        console.error("Erreur de parsing des dates:", parseError); 
                    }
                });
            }
            
            console.log(`✅ ${currentlyBookedSlots.size} créneaux réservés pour le ${formattedDate}`);
            
            if (isMounted.current) {
                setBookedSlots(currentlyBookedSlots);
            }
            
        } catch (err: any) {
            console.error("Erreur vérification disponibilité:", err);
            if (isMounted.current) {
                setAvailabilityError("Erreur vérification disponibilité.");
            }
        } finally {
            if (isMounted.current) {
                setLoadingAvailability(false);
            }
            initialAvailabilityCheck.current = true;
            availabilityCheckInProgress.current = false;
        }
    }, [poolId]);
    
    // Effet de chargement initial
    useEffect(() => {
        if (!poolId || !fontsLoaded || fontError) return;
        
        if (initialLoadDone.current) return;
        
        console.log("[BookingScreen] Chargement initial des données");
        loadPoolData();
        
    }, [poolId, fontsLoaded, fontError, loadPoolData]);
    
    // Effet pour la disponibilité
    useEffect(() => {
        if (!poolId || !poolData || isLoadingPool) return;
        
        if (availabilityCheckInProgress.current) return;
        
        if (!initialAvailabilityCheck.current || selectedDate) {
            console.log(`[BookingScreen] Vérification disponibilité pour le ${format(selectedDate, 'yyyy-MM-dd')}`);
            
            let isEffectActive = true;
            
            const checkDateAvailability = async () => {
                await checkAvailability(selectedDate);
                if (!isEffectActive) return;
            };
            
            checkDateAvailability();
            
            return () => {
                isEffectActive = false; 
            };
        }
    }, [selectedDate, poolId, poolData, isLoadingPool, checkAvailability]);
    
    // Valeurs dérivées
    const availableSlots = useMemo(() => {
        return Array.isArray(poolData?.available_time_slots) 
            ? [...poolData.available_time_slots].sort() 
            : [];
    }, [poolData?.available_time_slots]);
    
    const maxCapacity = useMemo(() => 
        poolData?.capacity || 1, 
    [poolData?.capacity]);

    // Ajuster le nombre d'invités
    useEffect(() => {
        if (poolData && guestCount > maxCapacity && isMounted.current) {
            setGuestCount(maxCapacity);
        }
    }, [maxCapacity, poolData, guestCount]);

    // Gestionnaires d'événements
    const handleDateChange = useCallback((days: number) => {
        const newDate = addDays(selectedDate, days);
        if (isBefore(newDate, startOfDay(new Date()))) return;
        setSelectedDate(newDate);
        setSelectedTimeSlot(null);
    }, [selectedDate]);

    const handleGuestChange = useCallback((increment: boolean) => {
        if (!isMounted.current) return;
        setGuestCount(prev => {
            const newValue = increment ? prev + 1 : prev - 1;
            return (newValue >= 1 && newValue <= maxCapacity) ? newValue : prev;
        });
    }, [maxCapacity]);

    const handleContinue = useCallback(() => {
        if (!selectedTimeSlot) {
            Alert.alert("Information manquante", "Veuillez sélectionner un créneau horaire.");
            return;
        }
        
        if (bookedSlots.has(selectedTimeSlot)) {
            Alert.alert("Créneau Indisponible", "Ce créneau n'est plus disponible. Veuillez en choisir un autre.");
            return;
        }

        if (!poolData || !poolId || !selectedDate || !guestCount) {
            Alert.alert("Erreur", "Informations manquantes pour continuer.");
            return;
        }

        const slotTimes = parseTimeSlot(selectedTimeSlot);
        if (!slotTimes) {
            Alert.alert("Erreur", "Format de créneau invalide.");
            return;
        }
        
        const startTime = new Date(selectedDate);
        startTime.setHours(slotTimes.start.hour, slotTimes.start.minute, 0, 0);
        
        const endTime = new Date(selectedDate);
        endTime.setHours(slotTimes.end.hour, slotTimes.end.minute, 0, 0);

        // Vérifier si l'heure de début n'est pas dans le passé
        if (isBefore(startTime, new Date())) {
            Alert.alert("Créneau Passé", "Vous ne pouvez pas réserver un créneau horaire déjà passé.");
            return;
        }

        // **CORRECTION PRINCIPALE** : Utiliser listingId au lieu de poolId pour correspondre à confirm.tsx
        router.push({
            pathname: '/booking/confirm',
            params: {
                poolId: poolId,       // Garder poolId pour correspondre aux autres screens
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                guestCount: guestCount.toString()
            }
        });
    }, [poolId, poolData, selectedDate, selectedTimeSlot, guestCount, bookedSlots, router]);

    // Valeurs dérivées pour le formatage
    const isDateToday = useMemo(() => 
        isSameDay(selectedDate, new Date()), 
        [selectedDate]
    );
    
    const formatDateHeader = useCallback((date: Date) => 
        isDateToday ? "Aujourd'hui" : format(date, 'EEEE d MMMM', { locale: fr }),
        [isDateToday]
    );

    // Gestionnaire d'actualisation manuelle
    const onRefresh = useCallback(async () => {
        if (!isMounted.current) return;
        setRefreshing(true);
        
        try {
            await loadPoolData(true);
            if (!availabilityCheckInProgress.current) {
                await checkAvailability(selectedDate);
            }
        } finally {
            if (isMounted.current) {
                setRefreshing(false);
            }
        }
    }, [loadPoolData, checkAvailability, selectedDate]);

    // Rendu
    if (!fontsLoaded || fontError) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator />
            </SafeAreaView>
        );
    }
    
    if (isLoadingPool) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
            </SafeAreaView>
        );
    }
    
    if (fetchPoolError) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>{fetchPoolError}</Text>
            </SafeAreaView>
        );
    }
    
    if (!poolData) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Piscine introuvable.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: poolData.title || 'Réservation', headerBackTitle: 'Retour' }} />
            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        tintColor="#0891b2"
                    />
                }
            >
                {/* Section Date */}
                <Animated.View style={styles.dateSection} entering={FadeIn.delay(200).springify()}>
                     <Text style={styles.sectionTitle}>Date</Text>
                     <View style={styles.dateNavigation}>
                         <TouchableOpacity 
                             style={[styles.navigationButton, isDateToday && styles.navigationButtonDisabled]} 
                             onPress={() => handleDateChange(-1)} 
                             disabled={isDateToday}
                         >
                             <ChevronLeft size={24} color={isDateToday ? '#cbd5e1' : '#1e293b'} />
                         </TouchableOpacity>
                         <Text style={styles.dateText}>{formatDateHeader(selectedDate)}</Text>
                         <TouchableOpacity 
                             style={styles.navigationButton} 
                             onPress={() => handleDateChange(1)}
                         >
                             <ChevronRight size={24} color="#1e293b" />
                         </TouchableOpacity>
                     </View>
                 </Animated.View>

                {/* Section Horaire */}
                <Animated.View style={styles.timeSection} entering={FadeIn.delay(400).springify()}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.sectionTitle}>Horaire</Text>
                        {loadingAvailability && <ActivityIndicator size="small" color="#0891b2" />}
                    </View>
                    
                    {availabilityError && (
                        <Text style={styles.errorTextSmall}>{availabilityError}</Text>
                    )}
                    
                    <View style={styles.timeSlotsGrid}>
                        {availableSlots.length > 0 ? (
                            availableSlots.map((slot, index) => {
                                const isBooked = bookedSlots.has(slot);
                                const isSelected = selectedTimeSlot === slot;

                                let isPastSlot = false;
                                const slotTimes = parseTimeSlot(slot);
                                if (slotTimes && isSameDay(selectedDate, new Date())) {
                                    const slotStartTime = new Date(selectedDate);
                                    slotStartTime.setHours(slotTimes.start.hour, slotTimes.start.minute, 0, 0);
                                    if (isBefore(slotStartTime, new Date())) {
                                        isPastSlot = true;
                                    }
                                }
                                const isDisabled = isBooked || isPastSlot;

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.timeSlot, 
                                            isSelected && !isDisabled && styles.timeSlotSelected, 
                                            isDisabled && styles.timeSlotDisabled
                                        ]}
                                        onPress={() => { if (!isDisabled) setSelectedTimeSlot(slot); }}
                                        disabled={isDisabled || loadingAvailability}
                                        activeOpacity={isDisabled ? 1 : 0.7}
                                    >
                                        <Clock 
                                            size={20} 
                                            color={isSelected && !isDisabled ? '#ffffff' : isDisabled ? '#9ca3af' : '#0891b2'} 
                                        />
                                        <Text style={[
                                            styles.timeSlotText, 
                                            isSelected && !isDisabled && styles.timeSlotTextSelected, 
                                            isDisabled && styles.timeSlotTextDisabled
                                        ]}>
                                            {slot} {isBooked ? "(Indisponible)" : isPastSlot ? "(Passé)" : ""}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <View style={styles.noSlotsContainer}>
                                <AlertCircle size={20} color="#64748b" />
                                <Text style={styles.noSlotsText}>Aucun créneau défini pour cette piscine.</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {/* Section Invités */}
                <Animated.View style={styles.guestsSection} entering={FadeIn.delay(600).springify()}>
                    <Text style={styles.sectionTitle}>Nombre de personnes (Max: {maxCapacity})</Text>
                    <View style={styles.guestsControl}>
                        <TouchableOpacity 
                            style={[
                                styles.guestButton, 
                                guestCount === 1 && styles.guestButtonDisabled
                            ]} 
                            onPress={() => handleGuestChange(false)} 
                            disabled={guestCount === 1}
                        >
                            <Text style={[
                                styles.guestButtonText, 
                                guestCount === 1 && styles.guestButtonTextDisabled
                            ]}>-</Text>
                        </TouchableOpacity>
                        
                        <View style={styles.guestCount}>
                            <Text style={styles.guestCountNumber}>{guestCount}</Text>
                            <Text style={styles.guestCountLabel}>
                                {guestCount === 1 ? 'personne' : 'personnes'}
                            </Text>
                        </View>
                        
                        <TouchableOpacity 
                            style={[
                                styles.guestButton, 
                                guestCount === maxCapacity && styles.guestButtonDisabled
                            ]} 
                            onPress={() => handleGuestChange(true)} 
                            disabled={guestCount === maxCapacity}
                        >
                            <Text style={[
                                styles.guestButtonText, 
                                guestCount === maxCapacity && styles.guestButtonTextDisabled
                            ]}>+</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
                
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.continueButton, 
                        (!selectedTimeSlot || loadingAvailability || bookedSlots.has(selectedTimeSlot ?? '')) && styles.continueButtonDisabled
                    ]}
                    onPress={handleContinue}
                    disabled={!selectedTimeSlot || loadingAvailability || bookedSlots.has(selectedTimeSlot ?? '')}
                >
                    <Text style={styles.continueButtonText}>
                        {selectedTimeSlot && bookedSlots.has(selectedTimeSlot)
                            ? 'Créneau Indisponible'
                            : selectedTimeSlot
                            ? 'Continuer vers Confirmation'
                            : 'Sélectionnez un créneau'
                        }
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
    errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center' },
    errorTextSmall: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#ef4444', textAlign: 'center', marginBottom: 8 },
    noSlotsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 20, opacity: 0.7 },
    noSlotsText: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#64748b' },
    container: { flex: 1, backgroundColor: '#ffffff' },
    content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
    dateSection: { marginBottom: 24 },
    sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 12 },
    dateNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    navigationButton: { padding: 8 },
    navigationButtonDisabled: { opacity: 0.4 },
    dateText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#1e293b', textTransform: 'capitalize' },
    timeSection: { marginBottom: 24 },
    timeSlotsGrid: { gap: 10 },
    timeSlot: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f8fafc', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    timeSlotSelected: { backgroundColor: '#0891b2', borderColor: '#06b6d4' },
    timeSlotDisabled: { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', opacity: 0.6 },
    timeSlotText: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1e293b' },
    timeSlotTextSelected: { color: '#ffffff' },
    timeSlotTextDisabled: { color: '#9ca3af', textDecorationLine: 'line-through' },
    guestsSection: { marginBottom: 24 },
    guestsControl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    guestButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0891b2', justifyContent: 'center', alignItems: 'center' },
    guestButtonDisabled: { backgroundColor: '#cbd5e1' },
    guestButtonText: { fontFamily: 'Montserrat-Bold', fontSize: 22, color: '#ffffff', lineHeight: 24 },
    guestButtonTextDisabled: { color: '#94a3b8' },
    guestCount: { alignItems: 'center' },
    guestCountNumber: { fontFamily: 'Montserrat-Bold', fontSize: 22, color: '#1e293b' },
    guestCountLabel: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#64748b' },
    footer: { padding: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingBottom: Platform.OS === 'ios' ? 34 : 16 },
    continueButton: { backgroundColor: '#0891b2', paddingVertical: 14, borderRadius: 10, alignItems: 'center', height: 50, justifyContent: 'center' },
    continueButtonDisabled: { backgroundColor: '#94a3b8', opacity: 0.7 },
    continueButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
});
