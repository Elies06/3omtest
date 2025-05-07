
// Dans app/(tabs)/conversations/[id].tsx
// VERSION CORRIGÉE: Requêtes séparées pour charger conversation et profils

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform,
    Alert
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SendHorizontal, ChevronLeft, AlertCircle } from 'lucide-react-native';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';

// Interface pour un message
interface Message {
    id: string;
    created_at: string;
    message_text: string | null;
    user_id: string;
}

// Interface pour les détails de la conversation et participants
interface ConversationDetails {
    id: string;
    status: string;
    swimmer_id: string;
    host_id: string;
    swimmer_profile?: { full_name: string | null } | null;
    host_profile?: { full_name: string | null } | null;
}

// Interface pour les données de base de la conversation
interface ConversationBaseData {
     id: string;
     status: string;
     swimmer_id: string;
     host_id: string;
}

// Interface pour les données de profil
interface ProfileData {
    full_name: string | null;
}


export default function ConversationScreen() {
    const { id: conversationId } = useLocalSearchParams<{ id: string }>();
    const { user, isLoading: isLoadingAuth } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessageText, setNewMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [conversationDetails, setConversationDetails] = useState<ConversationDetails | null>(null);

    const flatListRef = useRef<FlatList>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // --- Chargement Données Initiales (Requêtes Séparées) ---
    const loadInitialData = useCallback(async () => {
        if (!conversationId || !user || !fontsLoaded) {
            if (!conversationId || !user) setError("Données manquantes.");
            setLoading(false);
            return;
        }
        setLoading(true); setError(null);
        console.log(`🚀 Fetching initial data for conversation: ${conversationId}`);

        try {
            // 1. Fetch Conversation Details (sans profils)
            console.log("   Fetching conversation base details...");
            const { data: convData, error: convError } = await supabase
                .from('conversations')
                .select('id, status, swimmer_id, host_id')
                .eq('id', conversationId)
                .single();

            if (convError) {
                if (convError.code === 'PGRST116') throw new Error("Conversation introuvable ou accès refusé.");
                throw new Error(`Conversation: ${convError.message}`);
            }
            if (!convData) throw new Error("Détails de conversation non trouvés.");

            // Vérifier autorisation
            if (user.id !== convData.swimmer_id && user.id !== convData.host_id) {
                throw new Error("Vous n'êtes pas autorisé à accéder à cette conversation.");
            }
            console.log("✅ Conversation base details loaded:", convData);

            // 2. Fetch Messages et Profils en parallèle
            console.log("   Fetching messages and profiles...");
            const [messagesResult, swimmerProfileResult, hostProfileResult] = await Promise.all([
                supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', conversationId)
                    .order('created_at', { ascending: true }),
                // Fetch swimmer profile
                supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('user_id', convData.swimmer_id)
                    .maybeSingle(), // Utiliser maybeSingle si le profil peut manquer
                // Fetch host profile
                supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('user_id', convData.host_id)
                    .maybeSingle() // Utiliser maybeSingle si le profil peut manquer
            ]);

            // Process Messages
            if (messagesResult.error) throw new Error(`Messages: ${messagesResult.error.message}`);
            setMessages(messagesResult.data || []);
            console.log(`✅ Found ${messagesResult.data?.length || 0} messages.`);

            // Process Profiles (gérer les erreurs/nulls)
            let swimmerProfile: ProfileData | null = null;
            if (swimmerProfileResult.error) { console.warn("Could not fetch swimmer profile:", swimmerProfileResult.error); }
            else { swimmerProfile = swimmerProfileResult.data; }

            let hostProfile: ProfileData | null = null;
            if (hostProfileResult.error) { console.warn("Could not fetch host profile:", hostProfileResult.error); }
            else { hostProfile = hostProfileResult.data; }
            console.log("✅ Profiles fetched (or attempted).");

            // Combiner les données pour l'état final
            const finalConvDetails: ConversationDetails = {
                ...(convData as ConversationBaseData), // Cast les données de base
                swimmer_profile: swimmerProfile,
                host_profile: hostProfile
            };
            setConversationDetails(finalConvDetails);
            console.log("✅ All initial data loaded and combined.");

        } catch (err: any) {
            console.error('Error loading initial data:', err);
            setError(err.message || "Erreur chargement conversation.");
            setMessages([]);
            setConversationDetails(null);
        } finally {
            setLoading(false);
        }
    }, [conversationId, user, fontsLoaded]); // Dépendances

    // --- Effet pour charger données initiales ET s'abonner au temps réel ---
    useEffect(() => {
        if (conversationId && user && fontsLoaded) {
            loadInitialData();

            // Abonnement Realtime
            console.log(`👂 Subscribing to new messages for conversation: ${conversationId}`);
            const channel = supabase.channel(`messages_conv_${conversationId}`)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}`},
                    (payload) => {
                        console.log('🟢 New message received via Realtime:', payload.new);
                        setMessages(currentMessages => {
                            const newMessage = payload.new as Message;
                            if (currentMessages.some(msg => msg.id === newMessage.id)) { return currentMessages; }
                            return [...currentMessages, newMessage];
                        });
                    }
                )
                .subscribe((status, err) => {
                    if (status === 'SUBSCRIBED') { console.log('✅ Realtime channel subscribed successfully!'); }
                    if (status === 'CHANNEL_ERROR') { console.error('❌ Realtime channel error:', err); setError("Erreur de connexion temps réel."); }
                    if (status === 'TIMED_OUT') { console.warn('⏰ Realtime channel timed out.'); setError("Connexion temps réel expirée."); }
                });
            channelRef.current = channel;

            // Cleanup
            return () => {
                if (channelRef.current) {
                    console.log(`👋 Unsubscribing from channel messages_conv_${conversationId}`);
                    supabase.removeChannel(channelRef.current);
                    channelRef.current = null;
                }
            };
        } else if (!conversationId || !user) {
            setLoading(false);
        }
    }, [conversationId, user, fontsLoaded, loadInitialData]);

    // --- Fonction pour envoyer un message (inchangée) ---
    const handleSendMessage = async () => {
        const messageToSend = newMessageText.trim();
        if (!messageToSend || !user || !conversationId || isSending || !conversationDetails) return;
        if (!['open', 'pre-message'].includes(conversationDetails.status)) { Alert.alert("Envoi impossible", "Conversation verrouillée."); return; }

        setNewMessageText(''); setIsSending(true); setError(null);
        console.log(`✉️ Sending message via Edge Function: "${messageToSend}"`);
        try {
            const { data, error: functionError } = await supabase.functions.invoke('send-secure-message', { body: { conversation_id: conversationId, message_text: messageToSend } });
            if (functionError) throw new Error(`Erreur fonction Edge: ${functionError.message}`);
            if (data.error) throw new Error(`Erreur lors de l'envoi: ${data.error}`);
            if (!data.success) throw new Error("L'envoi a échoué.");
            console.log("✅ Message sent via Edge Function, ID:", data.messageId);
        } catch (err: any) {
            console.error("Error sending message:", err);
            setError(err.message || "Impossible d'envoyer.");
            setNewMessageText(messageToSend);
            Alert.alert("Erreur d'envoi", err.message || "Veuillez réessayer.");
        } finally { setIsSending(false); }
    };

    // --- Rendu d'un message (inchangé) ---
    const renderMessageItem = ({ item }: { item: Message }) => {
        const isMyMessage = item.user_id === user?.id;
        const messageDate = parseISO(item.created_at);
        const formattedTime = isValid(messageDate) ? format(messageDate, 'HH:mm', { locale: fr }) : '';
        return ( <View style={[styles.messageRow, isMyMessage ? styles.myMessageRow : styles.otherMessageRow]}><View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble]}><Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>{item.message_text}</Text><Text style={[styles.messageTimestamp, isMyMessage ? styles.myMessageTimestamp : styles.otherMessageTimestamp]}>{formattedTime}</Text></View></View> );
    };

    // Déterminer le nom de l'interlocuteur pour le titre (inchangé)
    const opponentName = useMemo(() => {
        if (!user || !conversationDetails) return 'Conversation';
        if (user.id === conversationDetails.swimmer_id) { return conversationDetails.host_profile?.full_name || 'Hôte'; }
        else if (user.id === conversationDetails.host_id) { return conversationDetails.swimmer_profile?.full_name || 'Nageur'; }
        return 'Conversation';
    }, [user, conversationDetails]);

    // Déterminer si l'input doit être actif (inchangé)
    const canInput = useMemo(() => ( conversationDetails && ['open', 'pre-message'].includes(conversationDetails.status) ), [conversationDetails]);


    // --- Rendu Principal ---
    if (isLoadingAuth || !fontsLoaded) {
        return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
    }
    if (fontError) {
        return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur chargement polices.</Text></SafeAreaView>;
    }
    if (!user) { return ( <SafeAreaView style={styles.errorContainer}><AlertCircle size={40} color="#dc2626" /><Text style={styles.errorText}>Connectez-vous pour voir les messages.</Text><TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')} style={styles.retryButton}><Text style={styles.retryButtonText}>Se connecter</Text></TouchableOpacity></SafeAreaView> ); }

    // Rendu normal
    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: opponentName }} />

             {/* Bannière d'erreur persistante */}
             {error && !loading && (
                 <View style={styles.errorBanner}>
                     <AlertCircle size={18} color="#b91c1c" />
                     <Text style={styles.errorBannerText}>{error}</Text>
                     {/* Utiliser loadInitialData pour réessayer */}
                     <TouchableOpacity onPress={loadInitialData} style={styles.retryIconSmall}>
                         <Text style={styles.retryTextSmall}>Réessayer</Text>
                     </TouchableOpacity>
                 </View>
             )}

            {/* Liste des messages */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesListContainer}
                ListEmptyComponent={ !loading && !error ? ( <View style={styles.emptyContainer}><Text style={styles.emptyText}>Envoyez le premier message !</Text></View> ) : null }
                ListHeaderComponent={loading ? <ActivityIndicator style={{marginVertical: 20}}/> : null}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />

            {/* Zone de Saisie */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                style={styles.inputAreaContainer}
            >
                <TextInput
                    style={[styles.textInput, !canInput && styles.textInputDisabled]}
                    placeholder={canInput ? "Écrivez votre message..." : "Conversation verrouillée"}
                    value={newMessageText}
                    onChangeText={setNewMessageText}
                    multiline
                    placeholderTextColor="#9ca3af"
                    editable={canInput && !isSending}
                />
                <TouchableOpacity
                    style={[styles.sendButton, (!canInput || isSending || !newMessageText.trim()) && styles.sendButtonDisabled]}
                    onPress={handleSendMessage}
                    disabled={!canInput || isSending || !newMessageText.trim()}
                >
                    {isSending ? <ActivityIndicator size="small" color="#ffffff" /> : <SendHorizontal size={20} color="#ffffff" />}
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
     container: { flex: 1, backgroundColor: '#f1f5f9' },
     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
     errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
     errorText: { fontFamily: 'Montserrat-Regular', color: '#b91c1c', fontSize: 16, textAlign: 'center', marginBottom: 15 },
     errorBanner: { backgroundColor: '#fee2e2', paddingVertical: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
     errorBannerText: { color: '#b91c1c', fontFamily: 'Montserrat-Regular', flex: 1, fontSize: 13 },
     retryIconSmall: { padding: 5 },
     retryTextSmall: { color: '#b91c1c', fontSize: 13, fontFamily: 'Montserrat-SemiBold', textDecorationLine: 'underline'},
     retryButton: { backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10 },
     retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
     messagesListContainer: { flexGrow: 1, paddingVertical: 10, paddingHorizontal: 10 },
     emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30, opacity: 0.7 },
     emptyText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#64748b', textAlign: 'center' },
     messageRow: { flexDirection: 'row', marginBottom: 10, },
     myMessageRow: { justifyContent: 'flex-end', marginLeft: 50 },
     otherMessageRow: { justifyContent: 'flex-start', marginRight: 50 },
     messageBubble: { maxWidth: '85%', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 18, },
     myMessageBubble: { backgroundColor: '#0891b2', borderBottomRightRadius: 4, },
     otherMessageBubble: { backgroundColor: '#ffffff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e5e7eb' },
     myMessageText: { color: '#ffffff', fontSize: 15, fontFamily: 'Montserrat-Regular', lineHeight: 21 },
     otherMessageText: { color: '#1f2937', fontSize: 15, fontFamily: 'Montserrat-Regular', lineHeight: 21 },
     messageTimestamp: { fontSize: 10, marginTop: 4, },
     myMessageTimestamp: { color: '#e0f2fe', textAlign: 'right', fontFamily: 'Montserrat-Regular' },
     otherMessageTimestamp: { color: '#9ca3af', textAlign: 'left', fontFamily: 'Montserrat-Regular' },
     inputAreaContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#d1d5db', backgroundColor: '#ffffff', paddingBottom: Platform.OS === 'ios' ? 25 : 10 },
     textInput: { flex: 1, minHeight: 42, maxHeight: 120, backgroundColor: '#f3f4f6', borderRadius: 21, paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 10 : 8, paddingBottom: Platform.OS === 'ios' ? 10 : 8, fontSize: 16, fontFamily: 'Montserrat-Regular', marginRight: 8, lineHeight: 20 },
     textInputDisabled: { backgroundColor: '#e5e7eb', color: '#9ca3af' },
     sendButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#0891b2', justifyContent: 'center', alignItems: 'center', },
     sendButtonDisabled: { backgroundColor: '#94a3b8' },
});
