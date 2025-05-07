
// Dans app/booking/confirm.tsx
// VERSION CORRIGÉE : Ajout de l'insertion dans conversation_participants

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
    Platform, ActivityIndicator, Alert, SafeAreaView
} from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import {
    ArrowLeft, Calendar, Clock, Users, DollarSign, Info,
    CheckCircle, AlertCircle
} from 'lucide-react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { format, differenceInHours, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// Interface PoolData MISE À JOUR
interface BookingPoolData {
    title: string;
    location: string | null;
    price_per_hour: number;
    capacity: number | null;
    owner_id: string; // <-- ID de l'hôte propriétaire
}

export default function BookingConfirmScreen() {
    const params = useLocalSearchParams();

    // Params formatés (assurer que ce sont des strings)
    const poolId = params.poolId as string ?? '';
    const startTimeStr = params.startTime as string ?? '';
    const endTimeStr = params.endTime as string ?? '';
    const guestCountStr = params.guestCount as string ?? '1';

    // États locaux
    const { user, isVerified, isLoading: isLoadingAuth } = useAuth();
    const [poolData, setPoolData] = useState<BookingPoolData | null>(null);
    const [loadingPool, setLoadingPool] = useState(true);
    const [fetchPoolError, setFetchPoolError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);

    // Convertir les paramètres en Dates (plus robuste)
    const startTime = useMemo(() => {
        try { return startTimeStr ? parseISO(startTimeStr) : null; } catch { return null; }
    }, [startTimeStr]);
    const endTime = useMemo(() => {
        try { return endTimeStr ? parseISO(endTimeStr) : null; } catch { return null; }
    }, [endTimeStr]);
    const guestCount = useMemo(() => parseInt(guestCountStr, 10), [guestCountStr]);

    // Charger les polices
    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // --- Fetch données depuis la table 'pools' ---
    const fetchPoolData = useCallback(async () => {
        if (!poolId) { setFetchPoolError("ID de piscine manquant."); setLoadingPool(false); return; }
        setLoadingPool(true); setFetchPoolError(null);
        console.log(`🚀 Fetching pool data for ID: ${poolId} from 'pools' table.`);
        try {
            const { data, error } = await supabase
    .from('pool_listings') // Remplacer 'pools' par 'pool_listings'
                .select('title, location, price_per_hour, capacity, owner_id')
                .eq('id', poolId)
                .single();

            if (error) {
                 if (error.code === 'PGRST116') { throw new Error("Piscine introuvable."); }
                 throw error;
            }
            if (!data || !data.owner_id) throw new Error("Données piscine invalides ou propriétaire manquant.");

            console.log("✅ Pool data received:", data);
            setPoolData(data as BookingPoolData);
        } catch (err: any) {
            console.error("Error in fetchPoolData:", err);
            setFetchPoolError(err.message || "Erreur chargement données piscine.");
            setPoolData(null);
        } finally {
            setLoadingPool(false);
        }
    }, [poolId]);

    useEffect(() => { fetchPoolData(); }, [fetchPoolData]);

    // Calcul du prix total (CORRIGÉ : inclut guestCount)
    const pricing = useMemo(() => {
        if (!poolData || !startTime || !endTime || !isValid(startTime) || !isValid(endTime) || isNaN(guestCount) || guestCount < 1) {
            return { hours: 0, basePrice: 0, totalPrice: 0, pricePerGuestPerHour: 0 };
        }
        const hours = differenceInHours(endTime, startTime);
        if (hours <= 0) return { hours: 0, basePrice: 0, totalPrice: 0, pricePerGuestPerHour: 0 };
        const pricePerGuestPerHour = poolData.price_per_hour ?? 0;
        const totalPrice = hours * pricePerGuestPerHour * guestCount;
        return { hours, basePrice: pricePerGuestPerHour * hours, totalPrice, pricePerGuestPerHour };
    }, [poolData, startTime, endTime, guestCount]);

    // --- Fonction de Confirmation (Ajout insertion participants) ---
    const handleConfirmBooking = async () => {
        // Vérifications initiales
        if (!user) { Alert.alert("Erreur", "Connectez-vous pour réserver."); return; }
        if (!isVerified) { Alert.alert("Vérification requise", "Vérifiez votre identité avant de réserver."); router.push('/profile/verify'); return; }
        if (!poolData || !poolId || !startTime || !endTime || !guestCount || isNaN(guestCount) || !isValid(startTime) || !isValid(endTime) || !poolData.owner_id || fetchPoolError) { Alert.alert("Erreur", `Impossible de continuer : ${fetchPoolError || 'Informations manquantes/invalides.'}`); return; }
        if (poolData.capacity && guestCount > poolData.capacity) { Alert.alert("Capacité dépassée", `Max ${poolData.capacity} personnes.`); return; }
        if (pricing.hours <= 0) { Alert.alert("Erreur", "Durée de réservation invalide."); return; }

        // !!! Ajouter la vérification dynamique de disponibilité ici !!!
// Vérifier que le créneau est toujours disponible avant de créer la réservation
console.log("Dernière vérification de disponibilité pour le créneau...");
try {
    const { data: conflictingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('listing_id', poolId)
        .not('status', 'in', '("canceled", "declined")')  // Exclure les réservations annulées/refusées
        .lt('start_time', endTime.toISOString())
        .gt('end_time', startTime.toISOString());

    if (checkError) throw new Error("Erreur lors de la vérification de disponibilité");
    
    if (conflictingBookings && conflictingBookings.length > 0) {
        setBookingError("Ce créneau n'est plus disponible. Veuillez choisir un autre horaire.");
        Alert.alert("Créneau indisponible", "Ce créneau a été réservé entre temps. Veuillez choisir un autre horaire.");
        return;
    }
    console.log("Créneau toujours disponible, poursuite de la réservation...");
} catch (err) {
    console.error("Erreur lors de la vérification finale de disponibilité:", err);
    setBookingError("Impossible de vérifier la disponibilité. Veuillez réessayer.");
    return;
}
      
        setIsProcessing(true); setBookingError(null);
        console.log("Attempting to insert booking as PENDING...");

        const bookingData = {
            // Correction: S'assurer que poolId correspond à la colonne FK dans bookings
            // Si la FK dans 'bookings' pointe vers 'pool_listings', il faut utiliser l'ID de pool_listings
            // Si 'pools' et 'pool_listings' partagent le même ID, c'est bon. Sinon, ajuster ici.
    listing_id: poolId, // Utiliser listing_id au lieu de pool_id
            user_id: user.id,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            guest_count: guestCount,
            total_price: pricing.totalPrice,
            status: 'pending'
        };

        let insertedBookingId: string | null = null;
        let insertedConversationId: string | null = null;

        try {
            // 1. Insérer la réservation
            const { data: insertedBooking, error: insertBookingError } = await supabase
                .from('bookings')
                .insert(bookingData)
                .select('id') // Sélectionner l'ID de la réservation insérée
                .single();

            if (insertBookingError) throw insertBookingError;
            if (!insertedBooking?.id) throw new Error("ID réservation manquant après insertion.");
            insertedBookingId = insertedBooking.id; // Stocker l'ID
            console.log("✅ Booking successfully inserted! ID:", insertedBookingId);

            // 2. Créer la conversation associée
            console.log(`Attempting to create conversation for booking ${insertedBookingId}...`);
            const conversationData = {
                booking_id: insertedBookingId,
                swimmer_id: user.id,
                host_id: poolData.owner_id,
                status: 'locked' // Statut initial
            };
            // ** Modifier pour récupérer l'ID de la conversation **
            const { data: insertedConversation, error: insertConvError } = await supabase
                .from('conversations')
                .insert(conversationData)
                .select('id') // Sélectionner l'ID de la conversation insérée
                .single();

            if (insertConvError) {
                // Log l'erreur mais continuer pour ne pas bloquer la réservation
                console.warn(`Could not create conversation for booking ${insertedBookingId}:`, insertConvError);
                // Vous pourriez vouloir annuler la réservation ici si la conversation est essentielle
                // await supabase.from('bookings').delete().eq('id', insertedBookingId);
                // throw new Error("Impossible de créer la conversation associée.");
            } else if (insertedConversation?.id) {
                insertedConversationId = insertedConversation.id; // Stocker l'ID
                console.log(`✅ Conversation created! ID: ${insertedConversationId}`);

                // 3. *** AJOUT : Insérer les participants ***
                console.log(`Attempting to insert participants for conversation ${insertedConversationId}...`);
                const participantsData = [
                    { conversation_id: insertedConversationId, user_id: user.id }, // Nageur (utilisateur actuel)
                    { conversation_id: insertedConversationId, user_id: poolData.owner_id } // Hôte
                ];
                const { error: insertParticipantsError } = await supabase
                    .from('conversation_participants')
                    .insert(participantsData);

                if (insertParticipantsError) {
                    // Log l'erreur mais ne pas bloquer la redirection (pour l'instant)
                    // Peut indiquer un problème si RLS empêche l'insertion ou si les user_id sont invalides
                    console.warn(`Could not insert participants for conversation ${insertedConversationId}:`, insertParticipantsError);
                    // Vous pourriez vouloir annuler la réservation/conversation ici
                } else {
                    console.log(`✅ Participants inserted for conversation ${insertedConversationId}`);
                }
            } else {
                 // Ce cas est étrange : l'insertion a réussi mais n'a pas retourné d'ID
                 console.warn(`Conversation was inserted for booking ${insertedBookingId}, but failed to retrieve its ID.`);
                 // Continuer quand même ? Ou considérer comme une erreur ?
            }

            // 4. Rediriger vers la page de succès
            router.replace({ pathname: '/booking/success', params: { bookingId: insertedBookingId, status: 'pending' } });

        } catch (err: any) {
            console.error("Error creating booking, conversation, or participants:", err);
            setBookingError(err.message || "Erreur lors de la création.");
            Alert.alert("Erreur", `Impossible de créer la réservation: ${err.message || "Erreur inconnue"}`);
            // En cas d'erreur, supprimer la réservation si elle a été créée mais pas la conversation/participants ?
            if (insertedBookingId && !insertedConversationId) {
                console.log(`Attempting to delete booking ${insertedBookingId} due to subsequent error...`);
                await supabase.from('bookings').delete().eq('id', insertedBookingId);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Rendu ---
     if (!fontsLoaded || fontError) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator /></SafeAreaView>; }
     if (loadingPool || isLoadingAuth) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /><Text style={styles.loadingText}>Chargement...</Text></SafeAreaView>; }
     if (!isLoadingAuth && !user) { router.replace('/(auth)/sign-in'); return null; }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft color="#475569" size={22} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Confirmer la réservation</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Erreur Fetch Piscine */}
                {fetchPoolError && ( <View style={styles.errorCard}><AlertCircle color="#b91c1c" size={24} /><Text style={styles.errorText}>{fetchPoolError}</Text></View> )}

                {/* Détails Piscine */}
                {poolData && ( <View style={styles.poolCard}><Text style={styles.poolName}>{poolData.title}</Text>{poolData.location && <Text style={styles.poolLocation}>{poolData.location}</Text>}</View> )}

                {/* Détails Réservation */}
                {startTime && endTime && isValid(startTime) && isValid(endTime) && guestCount && (
                    <View style={styles.bookingDetailsCard}>
                        <Text style={styles.sectionTitle}>Détails de la réservation</Text>
                        <View style={styles.detailRow}><View style={styles.detailIconContainer}><Calendar size={18} color="#475569" /></View><View style={styles.detailContent}><Text style={styles.detailLabel}>Date</Text><Text style={styles.detailValue}>{format(startTime, 'EEEE d MMMM yyyy', { locale: fr })}</Text></View></View>
                        <View style={styles.detailRow}><View style={styles.detailIconContainer}><Clock size={18} color="#475569" /></View><View style={styles.detailContent}><Text style={styles.detailLabel}>Horaire</Text><Text style={styles.detailValue}>{format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')} ({pricing.hours}h)</Text></View></View>
                        <View style={styles.detailRow}><View style={styles.detailIconContainer}><Users size={18} color="#475569" /></View><View style={styles.detailContent}><Text style={styles.detailLabel}>Nombre de personnes</Text><Text style={styles.detailValue}>{guestCount} {guestCount === 1 ? 'personne' : 'personnes'}</Text></View></View>
                    </View>
                )}

                {/* Récap Prix */}
                {poolData && pricing.totalPrice >= 0 && pricing.hours > 0 && (
                    <View style={styles.pricingCard}>
                        <Text style={styles.sectionTitle}>Récapitulatif des prix</Text>
                        <View style={styles.priceRow}>
                             <Text style={styles.priceLabel}>{pricing.hours}h × {guestCount} {guestCount > 1 ? 'pers.' : 'pers.'} × {pricing.pricePerGuestPerHour} MAD/h/pers.</Text>
                             <Text style={styles.priceValue}>{pricing.totalPrice} MAD</Text>
                         </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>{pricing.totalPrice} MAD</Text>
                        </View>
                    </View>
                )}

                 {/* Note Statut Pending */}
                 <View style={styles.infoCard}>
                     <Info size={20} color="#0891b2" />
                     <Text style={styles.infoText}>Votre réservation sera <Text style={styles.infoHighlight}>en attente</Text> jusqu'à confirmation par l'hôte.</Text>
                 </View>

                 {/* Erreur Booking */}
                 {bookingError && ( <View style={styles.errorCard}><AlertCircle color="#b91c1c" size={24} /><Text style={styles.errorText}>{bookingError}</Text></View> )}

                <View style={{ height: 150 }} />
            </ScrollView>

            {/* Footer (fixe) */}
            <View style={styles.footer}>
                 {/* Message Vérification KYC */}
                 {!isLoadingAuth && !isVerified && ( <View style={styles.verificationNeededContainer}> <AlertCircle size={20} color="#d97706" /> <View style={styles.verificationNeededTextContainer}><Text style={styles.verificationNeededTitle}>Vérification Requise</Text><Text style={styles.verificationNeededSubtitle}>Vérifiez votre identité pour réserver.</Text></View> <TouchableOpacity style={styles.verifyLinkButton} onPress={() => router.push('/profile/verify')}><Text style={styles.verifyLinkButtonText}>Vérifier</Text></TouchableOpacity> </View> )}
                 {/* Bouton Confirmer */}
                 <TouchableOpacity
                     style={[ styles.confirmButton, (isProcessing || loadingPool || !poolData || !!fetchPoolError || !isVerified || isLoadingAuth || pricing.hours <= 0) && styles.disabledButton ]}
                     onPress={handleConfirmBooking}
                     disabled={isProcessing || loadingPool || !poolData || !!fetchPoolError || !isVerified || isLoadingAuth || pricing.hours <= 0}
                 >
                  {isProcessing ? ( <ActivityIndicator color="#ffffff" size="small" /> ) : ( <> <CheckCircle size={20} color="#ffffff" /> <Text style={styles.confirmButtonText}>Demander à réserver ({pricing.totalPrice} MAD)</Text> </> )}
                 </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
     container: { flex: 1, backgroundColor: '#f8fafc' },
     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
     loadingText: { marginTop: 12, fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#64748b' },
     header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 10 : 40, paddingBottom: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
     backButton: { padding: 8 },
     headerTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 18, color: '#1e293b' },
     content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
     errorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 16, borderRadius: 12, marginBottom: 16, gap: 12, borderWidth: 1, borderColor: '#fecaca' },
     errorText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#b91c1c', flex: 1 },
     poolCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
     poolName: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 4 },
     poolLocation: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b' },
     bookingDetailsCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
     sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b', marginBottom: 16 },
     detailRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
     detailIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
     detailContent: { flex: 1, justifyContent: 'center' },
     detailLabel: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#64748b', marginBottom: 2 },
     detailValue: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1e293b', lineHeight: 20 },
     pricingCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
     priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
     priceLabel: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', flexShrink: 1, marginRight: 8 },
     priceValue: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#475569' },
     totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
     totalLabel: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b' },
     totalValue: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#0891b2' },
     infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, marginBottom: 16, gap: 12, borderWidth: 1, borderColor: '#bae6fd' },
     infoText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#0c4a6e', flex: 1, lineHeight: 20 },
     infoHighlight: { fontFamily: 'Montserrat-SemiBold' },
     footer: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
     verificationNeededContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#fef3c7', gap: 10, },
     verificationNeededTextContainer: { flex: 1, },
     verificationNeededTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#b45309', },
     verificationNeededSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#ca8a04', marginTop: 2, },
     verifyLinkButton: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f59e0b', borderRadius: 6, },
     verifyLinkButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#ffffff', },
     confirmButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0891b2', padding: 16, borderRadius: 12, gap: 10, height: 52 },
     confirmButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
     disabledButton: { backgroundColor: '#94a3b8', opacity: 0.7 },
});
