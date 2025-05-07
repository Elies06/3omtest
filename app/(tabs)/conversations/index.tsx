// // Dans PROJECT/app/conversations/index.tsx - VERSION AVEC RPC

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     View, Text, StyleSheet, FlatList, TouchableOpacity,
//     ActivityIndicator, SafeAreaView, RefreshControl, Image
// } from 'react-native';
// import { Stack, router } from 'expo-router';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/hooks/useAuth';
// import { formatDistanceToNow } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import { MessageSquareText, AlertCircle } from 'lucide-react-native';

// // Interface pour correspondre aux colonnes retournées par la fonction RPC get_my_conversations
// // Renommez les champs pour correspondre exactement à la sortie de la fonction SQL
// interface ConversationItemRPC {
//     conversation_id: string; // Correspond à c.id AS conversation_id
//     last_updated_at: string; // Correspond à c.updated_at AS last_updated_at
//     pool_title: string | null; // Correspond à pl.title AS pool_title
//     pool_first_image_url: string | null; // Correspond à la sous-requête AS pool_first_image_url
//     other_participant_name: string | null; // Correspond au CASE AS other_participant_name
//     other_participant_avatar_url: string | null; // Correspond au CASE AS other_participant_avatar_url
// }

// export default function ConversationsListScreen() {
//     const { user, isLoading: isLoadingAuth } = useAuth();
//     const [conversations, setConversations] = useState<ConversationItemRPC[]>([]); // Utilise la nouvelle interface RPC
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [refreshing, setRefreshing] = useState(false);

//     // --- Chargement des conversations via RPC ---
//     const loadConversations = useCallback(async (isRefresh = false) => {
//         if (!user) {
//             console.log("ConversationsList: No user, clearing list.");
//             setConversations([]); setLoading(false); setRefreshing(false);
//             return;
//         }
//         if (!isRefresh) setLoading(true);
//         setError(null);
//         console.log("🚀 Fetching conversations for user via RPC:", user.id);

//         try {
//             // === APPEL RPC ===
//             // Assurez-vous que la fonction 'get_my_conversations' existe et
//             // que l'utilisateur 'authenticated' a la permission EXECUTE dessus.
//             const { data, error: rpcError } = await supabase.rpc('get_my_conversations');
//             // =================

//             if (rpcError) {
//                 console.error('Error calling get_my_conversations RPC:', rpcError);
//                  // Essayer de donner une erreur plus utile
//                  if (rpcError.message.includes('permission denied')) {
//                      throw new Error("Erreur: Permission refusée pour accéder aux conversations.");
//                  } else if (rpcError.message.includes('function public.get_my_conversations() does not exist')) {
//                      throw new Error("Erreur: La fonction de récupération des conversations n'a pas été trouvée.");
//                  } else {
//                      throw rpcError; // Relancer l'erreur originale
//                  }
//             }

//             console.log(`✅ Found ${data?.length || 0} conversations via RPC.`);
//             // Les données sont déjà formatées par la fonction SQL
//             setConversations((data as ConversationItemRPC[]) || []);

//         } catch (err: any) {
//             console.error('Error loading conversations:', err);
//             setError(err.message || "Erreur chargement des conversations.");
//             setConversations([]);
//         } finally {
//             if (!isRefresh) setLoading(false);
//             setRefreshing(false);
//         }
//     }, [user]); // Dépend de l'utilisateur

//     // --- Effets (inchangés) ---
//     useEffect(() => {
//         if (!isLoadingAuth && user) { loadConversations(); }
//         else if (!isLoadingAuth && !user) { setLoading(false); setConversations([]); }
//     }, [user, isLoadingAuth, loadConversations]);

//     const onRefresh = useCallback(() => { setRefreshing(true); loadConversations(true); }, [loadConversations]);

//     // --- Rendu d'un élément de la liste (adapté aux noms retournés par RPC) ---
//     const renderConversationItem = ({ item }: { item: ConversationItemRPC }) => {
//         const defaultAvatar = 'https://ui-avatars.com/api/?name=?&background=random';
//         const avatarUrl = item.other_participant_avatar_url || defaultAvatar;
//         const otherName = item.other_participant_name || 'Utilisateur Inconnu';
//         const poolTitle = item.pool_title || 'Piscine Supprimée';
//         const poolImage = item.pool_first_image_url || 'https://placehold.co/60x60?text=Pool';

//         return (
//             <TouchableOpacity
//                 style={styles.itemContainer}
//                 // Utiliser conversation_id retourné par RPC pour la navigation
//                 onPress={() => router.push(`/conversations/${item.conversation_id}`)}
//             >
//                 <Image source={{ uri: poolImage }} style={styles.poolImage} />
//                 <View style={styles.itemTextContainer}>
//                     <Text style={styles.itemTitle} numberOfLines={1}>{poolTitle}</Text>
//                     <Text style={styles.itemSubtitle} numberOfLines={1}>Conversation avec {otherName}</Text>
//                     <Text style={styles.itemTimestamp} numberOfLines={1}>
//                         {/* Utiliser last_updated_at retourné par RPC */}
//                         Mise à jour {formatDistanceToNow(new Date(item.last_updated_at), { addSuffix: true, locale: fr })}
//                     </Text>
//                 </View>
//             </TouchableOpacity>
//         );
//     };

//     // --- Rendu Principal ---
//      if (isLoadingAuth || (!user && !error)) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }

//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ title: 'Mes Messages' }} />

//              {/* Afficher l'erreur de chargement principale si elle existe */}
//              {error && !loading && (
//                 <View style={styles.errorContainer}>
//                     <AlertCircle size={40} color="#dc2626" />
//                     <Text style={styles.errorText}>{error}</Text>
//                      <TouchableOpacity onPress={() => loadConversations()} style={styles.retryButton}>
//                          <Text style={styles.retryButtonText}>Réessayer</Text>
//                      </TouchableOpacity>
//                 </View>
//              )}

//              {/* Afficher la liste seulement si pas d'erreur majeure */}
//              {!error && (
//                 <FlatList
//                     data={conversations}
//                     renderItem={renderConversationItem}
//                     // Utiliser conversation_id retourné par RPC comme clé
//                     keyExtractor={(item) => item.conversation_id}
//                     contentContainerStyle={styles.listContainer}
//                     ListEmptyComponent={ !loading ? ( <View style={styles.emptyContainer}><MessageSquareText size={48} color="#cbd5e1" /><Text style={styles.emptyText}>Aucune conversation.</Text></View> ) : null }
//                     refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0891b2']} tintColor={'#0891b2'} /> }
//                     ListHeaderComponent={ loading && conversations.length === 0 ? <ActivityIndicator style={{ marginTop: 20}} size="small" /> : null }
//                 />
//              )}
//         </SafeAreaView>
//     );
// }

// // --- Styles (inchangés) ---
// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#ffffff' },
//     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
//     errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//     errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
//     retryButton: { backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10 },
//     retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
//     listContainer: { flexGrow: 1, paddingVertical: 10 },
//     itemContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
//     poolImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#e2e8f0' }, // Placeholder background
//     itemTextContainer: { flex: 1 },
//     itemTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1e293b', marginBottom: 2 },
//     itemSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', marginBottom: 4 },
//     itemTimestamp: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#94a3b8' },
//     emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
//     emptyText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#94a3b8', marginTop: 16, textAlign: 'center' },
// });





// // Dans PROJECT/app/conversations/index.tsx - VERSION AVEC CONTRÔLE D'ACCÈS (VÉRIFIÉ)

// import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Ajout useMemo
// import {
//     View, Text, StyleSheet, FlatList, TouchableOpacity,
//     ActivityIndicator, SafeAreaView, RefreshControl, Image
// } from 'react-native';
// import { Stack, router } from 'expo-router';
// import { supabase } from '@/lib/supabase';
// // Assurez-vous que useAuth retourne bien isVerified, userRoles, isLoading, sessionInitialized
// import { useAuth } from '@/hooks/useAuth';
// import { formatDistanceToNow } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import { MessageSquareText, AlertCircle } from 'lucide-react-native';

// // Interface pour correspondre aux colonnes retournées par la fonction RPC get_my_conversations
// interface ConversationItemRPC {
//     conversation_id: string;
//     last_updated_at: string;
//     pool_title: string | null;
//     pool_first_image_url: string | null;
//     other_participant_name: string | null;
//     other_participant_avatar_url: string | null;
// }

// export default function ConversationsListScreen() {
//     // Récupérer les infos de l'utilisateur, y compris rôles et statut vérifié
//     // isLoading est le chargement global (auth+profile+roles+verification)
//     const { user, userRoles, isVerified, isLoading, sessionInitialized } = useAuth();

//     // États locaux pour la liste des conversations
//     const [conversations, setConversations] = useState<ConversationItemRPC[]>([]);
//     const [loadingList, setLoadingList] = useState(true); // Chargement spécifique à la liste
//     const [error, setError] = useState<string | null>(null);
//     const [refreshing, setRefreshing] = useState(false);

//     // Déterminer si l'utilisateur est un hôte
//     const isHost = useMemo(() => (userRoles || []).some(role => ['host', 'hostpro'].includes(role)), [userRoles]);

//     // Déterminer si l'utilisateur a accès au chat (connecté ET (hôte OU vérifié))
//     const canAccessChat = useMemo(() => !!user && (isHost || isVerified), [user, isHost, isVerified]);

//     // --- Chargement des conversations via RPC ---
//     const loadConversations = useCallback(async (isRefresh = false) => {
//         // Double vérification: ne rien faire si pas autorisé ou pas d'user
//         if (!user || !canAccessChat) {
//             setConversations([]); setLoadingList(false); setRefreshing(false);
//             return;
//         }
//         if (!isRefresh) setLoadingList(true); // Utiliser setLoadingList ici
//         setError(null);
//         console.log("🚀 Fetching conversations for user via RPC:", user.id);

//         try {
//             const { data, error: rpcError } = await supabase.rpc('get_my_conversations');
//             if (rpcError) {
//                  console.error('Error calling get_my_conversations RPC:', rpcError);
//                  if (rpcError.message.includes('permission denied')) { throw new Error("Erreur: Permission refusée."); }
//                  else if (rpcError.message.includes('does not exist')) { throw new Error("Erreur: Fonction RPC manquante."); }
//                  else { throw rpcError; }
//             }
//             console.log(`✅ Found ${data?.length || 0} conversations via RPC.`);
//             setConversations((data as ConversationItemRPC[]) || []);
//         } catch (err: any) {
//             console.error('Error loading conversations:', err);
//             setError(err.message || "Erreur chargement des conversations.");
//             setConversations([]);
//         } finally {
//             if (!isRefresh) setLoadingList(false); // Utiliser setLoadingList
//             setRefreshing(false);
//         }
//     // Ajouter canAccessChat aux dépendances pour éviter fetch si accès non autorisé initialement
//     }, [user, canAccessChat]);

//     // --- Effets ---
//     useEffect(() => {
//         // Charger seulement si l'authentification est prête ET que l'utilisateur a accès
//         if (!isLoading && sessionInitialized && canAccessChat) {
//             loadConversations();
//         } else if (!isLoading && sessionInitialized && !canAccessChat) {
//             // Si authentifié mais pas accès, ne rien charger et arrêter le loader local
//             setLoadingList(false);
//             setConversations([]);
//         }
//         // Si isLoading ou !sessionInitialized, attendre état stable (géré par le return principal)
//     }, [isLoading, sessionInitialized, canAccessChat, loadConversations]); // Dépendances clés

//     // --- Rafraîchissement manuel ---
//     const onRefresh = useCallback(() => {
//         if (canAccessChat) { // Rafraîchir seulement si autorisé
//             setRefreshing(true);
//             loadConversations(true);
//         } else {
//             setRefreshing(false); // Ne rien faire si non autorisé
//         }
//     }, [canAccessChat, loadConversations]);

//     // --- Rendu d'un élément de la liste ---
//     const renderConversationItem = ({ item }: { item: ConversationItemRPC }) => {
//         const defaultAvatar = 'https://ui-avatars.com/api/?name=?&background=random';
//         const avatarUrl = item.other_participant_avatar_url || defaultAvatar;
//         const otherName = item.other_participant_name || 'Utilisateur Inconnu';
//         const poolTitle = item.pool_title || 'Piscine';
//         const poolImage = item.pool_first_image_url || 'https://placehold.co/60x60?text=P';

//         return (
//             <TouchableOpacity
//                 style={styles.itemContainer}
//                 onPress={() => router.push(`/conversations/${item.conversation_id}`)}
//             >
//                 <Image source={{ uri: poolImage }} style={styles.poolImage} />
//                 <View style={styles.itemTextContainer}>
//                     <Text style={styles.itemTitle} numberOfLines={1}>{poolTitle}</Text>
//                     <Text style={styles.itemSubtitle} numberOfLines={1}>Avec {otherName}</Text>
//                     <Text style={styles.itemTimestamp} numberOfLines={1}>
//                         Màj {formatDistanceToNow(new Date(item.last_updated_at), { addSuffix: true, locale: fr })}
//                     </Text>
//                 </View>
//             </TouchableOpacity>
//         );
//     };

//     // --- Rendu Principal ---

//     // 1. Afficher le chargement global tant que l'authentification/profil/rôles/vérif n'est pas prêt
//     if (isLoading || !sessionInitialized) {
//         return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
//     }

//     // 2. Gérer l'erreur de police après le chargement principal
//      if (fontsLoaded === false && fontError) {
//          return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur chargement polices.</Text></SafeAreaView>;
//      }

//     // 3. Si connecté mais PAS autorisé (non hôte ET non vérifié) -> Afficher message spécifique
//     if (user && !canAccessChat) {
//         return (
//           <SafeAreaView style={styles.centeredMessageContainer}>
//             <Stack.Screen options={{ title: 'Accès Messagerie' }} />
//             <AlertCircle size={48} color="#f59e0b" />
//             <Text style={styles.infoMessageText}>Pour accéder à vos messages ou contacter un hôte, veuillez d'abord faire vérifier votre identité.</Text>
//             {/* Adaptez le chemin vers votre écran de vérification si nécessaire */}
//             <TouchableOpacity onPress={() => router.push('/profile/verify')} style={styles.verifyButton}>
//                <Text style={styles.verifyButtonText}>Vérifier mon identité</Text>
//             </TouchableOpacity>
//             {router.canGoBack() && (
//                  <TouchableOpacity onPress={() => router.back()} style={styles.backButtonAlt}>
//                      <Text style={styles.backButtonAltText}>Retour</Text>
//                  </TouchableOpacity>
//              )}
//           </SafeAreaView>
//         );
//     }

//     // 4. Si autorisé, afficher le contenu principal (liste ou erreur de liste)
//     // Le cas !user ne devrait pas être atteint ici si href:null fonctionne dans le layout
//     return (
//          <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ title: 'Mes Messages' }} />
//              {/* Afficher l'erreur de chargement des conversations si elle existe */}
//              {error && !loadingList && ( // Utiliser loadingList ici
//                 <View style={styles.errorContainer}>
//                     <AlertCircle size={40} color="#dc2626" />
//                     <Text style={styles.errorText}>{error}</Text>
//                      <TouchableOpacity onPress={() => loadConversations()} style={styles.retryButton}>
//                          <Text style={styles.retryButtonText}>Réessayer</Text>
//                      </TouchableOpacity>
//                 </View>
//              )}

//              {/* Afficher la liste seulement si pas d'erreur majeure */}
//              {!error && (
//                 <FlatList
//                     data={conversations}
//                     renderItem={renderConversationItem}
//                     keyExtractor={(item) => item.conversation_id}
//                     contentContainerStyle={styles.listContainer}
//                     ListEmptyComponent={
//                         !loadingList ? ( // Utiliser loadingList
//                             <View style={styles.emptyContainer}>
//                                 <MessageSquareText size={48} color="#cbd5e1" />
//                                 <Text style={styles.emptyText}>Aucune conversation.</Text>
//                             </View>
//                         ) : null // Ne pas afficher pendant le chargement initial
//                     }
//                     refreshControl={
//                         <RefreshControl
//                             refreshing={refreshing}
//                             onRefresh={onRefresh}
//                             colors={['#0891b2']}
//                             tintColor={'#0891b2'}
//                         />
//                     }
//                     // Afficher un loader pendant le chargement spécifique de la liste
//                     ListHeaderComponent={ loadingList && conversations.length === 0 ? <ActivityIndicator style={{ marginTop: 20}} size="small" /> : null }
//                 />
//              )}
//         </SafeAreaView>
//      );
// }

// // --- Styles --- (Ajouter les styles pour le message d'accès)
// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#ffffff' },
//     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
//     errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//     errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
//     retryButton: { backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10 },
//     retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
//     listContainer: { flexGrow: 1, paddingVertical: 10 },
//     itemContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
//     poolImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#e2e8f0' },
//     itemTextContainer: { flex: 1 },
//     itemTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1e293b', marginBottom: 2 },
//     itemSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', marginBottom: 4 },
//     itemTimestamp: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#94a3b8' },
//     emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30, marginTop: 50 },
//     emptyText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#94a3b8', marginTop: 16, textAlign: 'center' },
//     // Styles pour le message "Vérifiez votre identité"
//     centeredMessageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#fff' },
//     infoMessageText: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#4b5563', textAlign: 'center', lineHeight: 24, marginTop: 20, marginBottom: 30 },
//     verifyButton: { backgroundColor: '#0891b2', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginBottom: 15 },
//     verifyButtonText: { color: '#ffffff', fontFamily: 'Montserrat-SemiBold', fontSize: 15 },
//     backButtonAlt: { paddingVertical: 10 },
//     backButtonAltText: { color: '#64748b', fontFamily: 'Montserrat-Regular', fontSize: 14 },
// });







// Dans PROJECT/app/(tabs)/conversations/index.tsx - VERSION CORRIGÉE (sans check fontsLoaded local)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, SafeAreaView, RefreshControl, Image
} from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
// Assurez-vous que useAuth retourne bien isVerified, userRoles, isLoading, sessionInitialized
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageSquareText, AlertCircle } from 'lucide-react-native';

// Interface ConversationItemRPC (inchangée)
interface ConversationItemRPC {
    conversation_id: string;
    last_updated_at: string;
    pool_title: string | null;
    pool_first_image_url: string | null;
    other_participant_name: string | null;
    other_participant_avatar_url: string | null;
}

export default function ConversationsListScreen() {
    // isLoading vient de useAuth et combine tous les chargements (auth, profile, roles, verification)
    // sessionInitialized indique si la première tentative de lecture de session est terminée
    const { user, userRoles, isVerified, isLoading, sessionInitialized } = useAuth();

    const [conversations, setConversations] = useState<ConversationItemRPC[]>([]);
    const [loadingList, setLoadingList] = useState(true); // Chargement spécifique à la liste de cet écran
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // --- SUPPRIMÉ : Appel useFonts ici ---

    const isHost = useMemo(() => (userRoles || []).some(role => ['host', 'hostpro'].includes(role)), [userRoles]);
    // Accès autorisé si connecté ET (Hôte OU Vérifié)
    const canAccessChat = useMemo(() => !!user && (isHost || isVerified), [user, isHost, isVerified]);

    // --- Chargement des conversations via RPC ---
    const loadConversations = useCallback(async (isRefresh = false) => {
        if (!user || !canAccessChat) {
            setConversations([]); setLoadingList(false); setRefreshing(false);
            return;
        }
        if (!isRefresh) setLoadingList(true); // Utiliser setLoadingList
        setError(null);
        console.log("🚀 Fetching conversations for user via RPC:", user.id);
        try {
            const { data, error: rpcError } = await supabase.rpc('get_my_conversations');
            if (rpcError) {
                 console.error('Error calling RPC:', rpcError);
                 if (rpcError.message.includes('permission denied')) { throw new Error("Erreur de permission (RLS) pour lire les conversations."); }
                 else if (rpcError.message.includes('does not exist')) { throw new Error("Erreur: La fonction RPC 'get_my_conversations' est introuvable."); }
                 else { throw rpcError; }
             }
            console.log(`✅ Found ${data?.length || 0} conversations via RPC.`);
            setConversations((data as ConversationItemRPC[]) || []);
        } catch (err: any) {
            console.error('Error loading conversations:', err);
            setError(err.message || "Erreur chargement des conversations.");
            setConversations([]);
        } finally {
            if (!isRefresh) setLoadingList(false); // Utiliser setLoadingList
            setRefreshing(false);
        }
    }, [user, canAccessChat]); // Dépend de user et de l'autorisation d'accès

    // --- Effet pour charger les conversations ---
    useEffect(() => {
        // Charger seulement si l'authentification est prête ET que l'utilisateur a accès
        // isLoading global gère l'attente des polices si configuré dans le layout racine
        if (!isLoading && sessionInitialized && canAccessChat) {
            loadConversations();
        } else if (!isLoading && sessionInitialized && !canAccessChat) {
            // Si authentifié mais pas accès, arrêter le loader local
            setLoadingList(false);
            setConversations([]);
        }
        // Si isLoading ou !sessionInitialized, le return gérera l'affichage du loader principal
    }, [isLoading, sessionInitialized, canAccessChat, loadConversations]); // Dépendances clés

    // --- Rafraîchissement manuel ---
    const onRefresh = useCallback(() => {
        if (canAccessChat) { setRefreshing(true); loadConversations(true); }
        else { setRefreshing(false); }
    }, [canAccessChat, loadConversations]);

    // --- Rendu d'un élément de la liste ---
    const renderConversationItem = ({ item }: { item: ConversationItemRPC }) => {
        const defaultAvatar = 'https://ui-avatars.com/api/?name=?&background=random';
        const avatarUrl = item.other_participant_avatar_url || defaultAvatar;
        const otherName = item.other_participant_name || 'Utilisateur Inconnu';
        const poolTitle = item.pool_title || 'Piscine Supprimée';
        const poolImage = item.pool_first_image_url || 'https://placehold.co/60x60?text=P';

        return (
            <TouchableOpacity style={styles.itemContainer} onPress={() => router.push(`/conversations/${item.conversation_id}`)} >
                <Image source={{ uri: poolImage }} style={styles.poolImage} />
                <View style={styles.itemTextContainer}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{poolTitle}</Text>
                    <Text style={styles.itemSubtitle} numberOfLines={1}>Avec {otherName}</Text>
                    <Text style={styles.itemTimestamp} numberOfLines={1}>
                        Màj {formatDistanceToNow(new Date(item.last_updated_at), { addSuffix: true, locale: fr })}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    // --- Rendu Principal ---

    // 1. Afficher le loader global tant que l'état d'authentification n'est pas prêt
    if (isLoading || !sessionInitialized) {
        return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
    }

    // 2. Si connecté mais PAS autorisé (non hôte ET non vérifié) -> Afficher message spécifique
    if (user && !canAccessChat) {
        return (
          <SafeAreaView style={styles.centeredMessageContainer}>
            <Stack.Screen options={{ title: 'Accès Messagerie' }} />
            <AlertCircle size={48} color="#f59e0b" />
            <Text style={styles.infoMessageText}>Pour accéder à vos messages ou contacter un hôte, veuillez d'abord faire vérifier votre identité.</Text>
            {/* Adaptez le chemin vers votre écran de vérification */}
            <TouchableOpacity onPress={() => router.push('/profile/verify')} style={styles.verifyButton}>
               <Text style={styles.verifyButtonText}>Vérifier mon identité</Text>
            </TouchableOpacity>
            {router.canGoBack() && (
                 <TouchableOpacity onPress={() => router.back()} style={styles.backButtonAlt}>
                     <Text style={styles.backButtonAltText}>Retour</Text>
                 </TouchableOpacity>
             )}
          </SafeAreaView>
        );
    }

    // 3. Si autorisé, afficher la liste ou l'erreur de chargement de la liste
     if (!user) { // Sécurité au cas où, ne devrait pas être atteint si l'onglet est bien géré par href
         return ( <SafeAreaView style={styles.errorContainer}><Text>Utilisateur non connecté.</Text></SafeAreaView> );
     }

    // Rendu de la liste principale ou de l'erreur de chargement de liste
    return (
         <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Mes Messages' }} />
             {error && !loadingList && ( // Afficher l'erreur de chargement de la liste
                <View style={styles.errorContainer}>
                    <AlertCircle size={40} color="#dc2626" />
                    <Text style={styles.errorText}>{error}</Text>
                     <TouchableOpacity onPress={() => loadConversations()} style={styles.retryButton}>
                         <Text style={styles.retryButtonText}>Réessayer</Text>
                     </TouchableOpacity>
                </View>
             )}

             {!error && ( // Ne pas afficher la liste si une erreur est survenue
                <FlatList
                    data={conversations}
                    renderItem={renderConversationItem}
                    keyExtractor={(item) => item.conversation_id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={ !loadingList ? ( <View style={styles.emptyContainer}><MessageSquareText size={48} color="#cbd5e1" /><Text style={styles.emptyText}>Aucune conversation.</Text></View> ) : null }
                    refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0891b2']} tintColor={'#0891b2'} /> }
                    // Afficher le loader spécifique à la liste
                    ListHeaderComponent={ loadingList && conversations.length === 0 ? <ActivityIndicator style={{ marginTop: 20}} size="small" color="#0891b2" /> : null }
                />
             )}
        </SafeAreaView>
     );
}

// --- Styles --- (Assurez-vous d'avoir tous les styles requis, y compris ceux pour le message d'accès)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
    retryButton: { backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10 },
    retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
    listContainer: { flexGrow: 1, paddingVertical: 10 },
    itemContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    poolImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#e2e8f0' },
    itemTextContainer: { flex: 1 },
    itemTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1e293b', marginBottom: 2 },
    itemSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', marginBottom: 4 },
    itemTimestamp: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#94a3b8' },
    emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30, marginTop: 50 },
    emptyText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#94a3b8', marginTop: 16, textAlign: 'center' },
    // Styles pour le message "Vérifiez votre identité"
    centeredMessageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#fff' },
    infoMessageText: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#4b5563', textAlign: 'center', lineHeight: 24, marginTop: 20, marginBottom: 30 },
    verifyButton: { backgroundColor: '#0891b2', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginBottom: 15 },
    verifyButtonText: { color: '#ffffff', fontFamily: 'Montserrat-SemiBold', fontSize: 15 },
    backButtonAlt: { paddingVertical: 10 },
    backButtonAltText: { color: '#64748b', fontFamily: 'Montserrat-Regular', fontSize: 14 },
});