// // // Dans /home/project/app/admin/payout-verifications.tsx
// // // VERSION AVEC 4 FILTRES (En cours, Vérifiés, Non soumis, Tous) via RPC

// // import React, { useState, useEffect, useCallback } from 'react';
// // import { View, Text, SafeAreaView, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
// // import { Stack, router } from 'expo-router';
// // import { supabase } from '@/lib/supabase';
// // import { useAuth } from '@/hooks/useAuth';
// // import { format } from 'date-fns';
// // import { fr } from 'date-fns/locale';
// // import { Banknote, CheckCircle, AlertCircle, UserCircle as UserIconLucide, Clock, BadgeCheck, XCircle, ShieldAlert, RefreshCcw, List, HelpCircle } from 'lucide-react-native'; // Ajout HelpCircle et List

// // // Interface étendue pour gérer les deux types de retour RPC
// // // On rend les détails bancaires optionnels
// // interface CombinedAccountInfo {
// //     id?: string; // ID du compte bancaire (absent si non soumis)
// //     user_id: string; // ID utilisateur (toujours présent)
// //     account_holder?: string;
// //     bank_name?: string;
// //     iban?: string;
// //     created_at?: string; // Date soumission RIB (absent si non soumis)
// //     updated_at?: string; // Date vérification (absent si non soumis)
// //     verified?: boolean; // Statut vérification (non pertinent si non soumis)
// //     profiles: {
// //         full_name: string | null;
// //         avatar_url: string | null;
// //     } | null;
// //     // Flag pour savoir si les détails bancaires ont été soumis
// //     bankDetailsSubmitted: boolean;
// // }

// // // --- NOUVEAU TYPE POUR LE FILTRE (4 états) ---
// // type FilterStatus = 'pending' | 'verified' | 'not_submitted' | 'all';

// // export default function PayoutVerificationScreen() {
// //     const { user: adminUser, isLoading: isLoadingAuth } = useAuth();
// //     // L'état contiendra maintenant notre interface combinée
// //     const [accountsInfo, setAccountsInfo] = useState<CombinedAccountInfo[]>([]);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState<string | null>(null);
// //     const [refreshing, setRefreshing] = useState(false);
// //     const [loadingActionId, setLoadingActionId] = useState<string | null>(null); // Pour le bouton "Approuver"

// //     // --- État du Filtre (4 états) ---
// //     const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending'); // Commence par 'pending'

// //     // --- Chargement (appelle la bonne RPC selon le filtre) ---
// //     const loadData = useCallback(async (statusFilter: FilterStatus, isRefresh = false) => {
// //         if (!adminUser) { setError("Admin non identifié."); return; }
// //         if (!isRefresh) {
// //             setLoading(true);
// //             setAccountsInfo([]); // Vider avant chargement
// //         }
// //         setError(null);
// //         console.log(`🚀 Fetching data for filter: ${statusFilter}...`);

// //         try {
// //             let data: any[] | null = null;
// //             let fetchError: any = null;

// //             if (statusFilter === 'not_submitted') {
// //                 // --- APPEL RPC 2 ---
// //                 console.log("... calling get_hosts_without_bank_details");
// //                 const { data: rpcData, error: rpcError } = await supabase.rpc(
// //                     'get_hosts_without_bank_details'
// //                     // { p_target_roles: ['host', 'hostpro'] } // Si non mis par défaut dans SQL
// //                 );
// //                 data = rpcData;
// //                 fetchError = rpcError;
// //                 // ------------------
// //             } else {
// //                 // --- APPEL RPC 1 ---
// //                 let statusParam: boolean | null = null;
// //                 if (statusFilter === 'pending') statusParam = false;
// //                 else if (statusFilter === 'verified') statusParam = true;
// //                 // Si 'all', statusParam reste null

// //                 const rpcParams = { p_verified_status: statusParam };
// //                 console.log("... calling get_bank_accounts_for_admin_view with params:", rpcParams);
// //                 const { data: rpcData, error: rpcError } = await supabase.rpc(
// //                     'get_bank_accounts_for_admin_view',
// //                     rpcParams
// //                 );
// //                 data = rpcData;
// //                 fetchError = rpcError;
// //                 // ------------------
// //             }

// //             if (fetchError) throw fetchError;

// //             // --- FORMATAGE DES DONNÉES (selon la RPC appelée) ---
// //             let formattedData: CombinedAccountInfo[] = [];
// //             if (statusFilter === 'not_submitted') {
// //                 formattedData = (data || []).map((item: any) => ({
// //                     user_id: item.user_id,
// //                     profiles: {
// //                         full_name: item.profile_full_name || null,
// //                         avatar_url: item.profile_avatar_url || null,
// //                     },
// //                     bankDetailsSubmitted: false // Flag indiquant RIB non soumis
// //                     // Les autres champs (id, account_holder etc.) sont undefined
// //                 }));
// //             } else {
// //                 formattedData = (data || []).map((item: any) => ({
// //                     id: item.id, // Présent pour RPC 1
// //                     user_id: item.user_id,
// //                     account_holder: item.account_holder,
// //                     bank_name: item.bank_name,
// //                     iban: item.iban,
// //                     created_at: item.created_at,
// //                     updated_at: item.updated_at,
// //                     verified: item.verified,
// //                     profiles: {
// //                         full_name: item.profile_full_name || null,
// //                         avatar_url: item.profile_avatar_url || null,
// //                     },
// //                     bankDetailsSubmitted: true // Flag indiquant RIB soumis
// //                 }));
// //             }
// //             // ----------------------------------------------------

// //             console.log(`✅ Fetched ${formattedData.length || 0} items for filter: ${statusFilter}`);
// //             setAccountsInfo(formattedData);

// //         } catch (err: any) {
// //             console.error(`Error loading data for filter ${statusFilter}:`, err);
// //             setError(err.message || "Erreur lors de la récupération des données.");
// //             setAccountsInfo([]);
// //         } finally {
// //             if (!isRefresh) setLoading(false);
// //             setRefreshing(false);
// //         }
// //     }, [adminUser]);

// //     // useEffect et onRefresh (mis à jour pour dépendre de filterStatus et appeler loadData)
// //     useEffect(() => {
// //         if (!isLoadingAuth && adminUser) {
// //             loadData(filterStatus);
// //         }
// //     }, [isLoadingAuth, adminUser, filterStatus, loadData]);

// //     const onRefresh = useCallback(() => {
// //         setRefreshing(true);
// //         loadData(filterStatus, true);
// //     }, [loadData, filterStatus]);

// //     // handleApproveBankAccount (Légère modif pour recharger avec loadData)
// //      const handleApproveBankAccount = useCallback(async (bankAccountId: string) => {
// //          // ... (début inchangé: vérif admin, set loading...)
// //          setLoadingActionId(bankAccountId); 
// //          setError(null);
// //          try {
// //              // ... (appel supabase.functions.invoke inchangé) ...
// //               const { data: functionResponse, error: functionError } = await supabase.functions.invoke('approve-bank-details', { body: JSON.stringify({ bankAccountId: bankAccountId }) });
// //               if (functionError) throw new Error(functionError.message || "Erreur fonction approbation.");
// //               if (functionResponse?.error) throw new Error(functionResponse.error);

// //              Alert.alert("Succès", "Informations bancaires marquées comme vérifiées.");
// //              // Recharger la liste PENDING via loadData
// //              await loadData('pending', true);
// //              // Si on était sur 'all', on peut aussi recharger 'all'
// //              // if (filterStatus === 'all') await loadData('all', true);
// //          } catch (err: any) { /* ... gestion erreur ... */ }
// //          finally { setLoadingActionId(null); }
// //      }, [adminUser?.id, loadData]);

// //     // --- Rendu d'un élément (DOIT gérer les deux types de données) ---
// //     const renderItem = ({ item }: { item: CombinedAccountInfo }) => {
// //         const isLoadingItemAction = loadingActionId === item.id;
// //         const defaultAvatar = 'https://ui-avatars.com/api/?name=?&background=random';

// //         return (
// //             <View style={styles.itemContainer}>
// //                 {/* Infos Utilisateur (toujours présentes) */}
// //                 <View style={styles.userInfo}>
// //                     <Image source={{ uri: item.profiles?.avatar_url || defaultAvatar }} style={styles.avatar} />
// //                     <View style={styles.userDetails}>
// //                         <Text style={styles.userName}>{item.profiles?.full_name || 'Utilisateur Inconnu'}</Text>
// //                         <TouchableOpacity onPress={() => router.push(`/admin/users/${item.user_id}`)}>
// //                             <Text style={styles.userIdLink}>Voir profil (ID: {item.user_id.substring(0,8)}...)</Text>
// //                         </TouchableOpacity>
// //                     </View>
// //                 </View>

// //                 {/* Affiche infos bancaires OU message "Non soumis" */}
// //                 {item.bankDetailsSubmitted ? (
// //                     <View style={styles.bankDetailsGroup}>
// //                         <View style={styles.bankDetails}><Text style={styles.detailLabel}>Titulaire:</Text><Text style={styles.detailValue}>{item.account_holder}</Text></View>
// //                         <View style={styles.bankDetails}><Text style={styles.detailLabel}>Banque:</Text><Text style={styles.detailValue}>{item.bank_name}</Text></View>
// //                         <View style={styles.bankDetails}><Text style={styles.detailLabel}>IBAN/RIB:</Text><Text style={[styles.detailValue, styles.ibanText]}>{item.iban}</Text></View>
// //                     </View>
// //                 ) : (
// //                     <View style={styles.notSubmittedContainer}>
// //                         <HelpCircle size={16} color="#64748b" />
// //                         <Text style={styles.notSubmittedText}>Aucune information bancaire soumise.</Text>
// //                     </View>
// //                 )}

// //                 {/* Bouton/Badge de Statut (conditionnel) */}
// //                 {item.bankDetailsSubmitted && filterStatus === 'pending' && (
// //                    <View style={styles.actionsContainer}>
// //                        <TouchableOpacity style={[styles.actionButton, styles.approveButton, isLoadingItemAction && styles.actionButtonDisabled]} onPress={() => handleApproveBankAccount(item.id!)} disabled={isLoadingItemAction}>
// //                            {isLoadingItemAction ? <ActivityIndicator size="small" color="#ffffff"/> : <CheckCircle size={16} color="#ffffff" />}
// //                            <Text style={styles.actionButtonText}>Marquer comme Vérifié</Text>
// //                        </TouchableOpacity>
// //                    </View>
// //                 )}
// //                 {item.bankDetailsSubmitted && item.verified && ( // Seulement si soumis ET vérifié
// //                     <View style={styles.verifiedBadge}>
// //                         <BadgeCheck size={16} color="#10b981" />
// //                         <Text style={styles.verifiedText}>Vérifié le {format(new Date(item.updated_at!), 'dd/MM/yyyy', { locale: fr })}</Text>
// //                     </View>
// //                 )}
// //                 {/* Pas d'action/badge spécifique pour 'not_submitted' ou 'all' pour l'instant */}

// //             </View>
// //         );
// //     };

// //     // --- Rendu Principal (avec 4 boutons filtres) ---
// //     if (isLoadingAuth) { return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></View>; }
// //     if (!adminUser) { return <View style={styles.errorContainer}><Text style={styles.errorText}>Accès non autorisé</Text></View>; }

// //     return (
// //         <SafeAreaView style={styles.container}>
// //             <Stack.Screen options={{ title: 'Vérification RIB/IBAN Hôtes' }} />

// //             {/* --- BARRE DE FILTRES (4 boutons) --- */}
// //             <View style={styles.filterBar}>
// //                 <TouchableOpacity style={[styles.filterButton, filterStatus === 'pending' && styles.filterButtonActive]} onPress={() => setFilterStatus('pending')} disabled={loading || refreshing} >
// //                     <Clock size={16} color={filterStatus === 'pending' ? '#ffffff' : '#f59e0b'} />
// //                     <Text style={[styles.filterButtonText, filterStatus === 'pending' && styles.filterButtonTextActive]}>En attente</Text>
// //                 </TouchableOpacity>
// //                 <TouchableOpacity style={[styles.filterButton, filterStatus === 'verified' && styles.filterButtonActive]} onPress={() => setFilterStatus('verified')} disabled={loading || refreshing} >
// //                     <BadgeCheck size={16} color={filterStatus === 'verified' ? '#ffffff' : '#10b981'} />
// //                     <Text style={[styles.filterButtonText, filterStatus === 'verified' && styles.filterButtonTextActive]}>Vérifiés</Text>
// //                 </TouchableOpacity>
// //                 {/* NOUVEAU BOUTON */}
// //                 <TouchableOpacity style={[styles.filterButton, filterStatus === 'not_submitted' && styles.filterButtonActive]} onPress={() => setFilterStatus('not_submitted')} disabled={loading || refreshing} >
// //                     <HelpCircle size={16} color={filterStatus === 'not_submitted' ? '#ffffff' : '#64748b'} />
// //                     <Text style={[styles.filterButtonText, filterStatus === 'not_submitted' && styles.filterTextActive]}>Non soumis</Text>
// //                 </TouchableOpacity>
// //                 <TouchableOpacity style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]} onPress={() => setFilterStatus('all')} disabled={loading || refreshing} >
// //                     <List size={16} color={filterStatus === 'all' ? '#ffffff' : '#64748b'} />
// //                     <Text style={[styles.filterButtonText, filterStatus === 'all' && styles.filterTextActive]}>Tous</Text>
// //                 </TouchableOpacity>
// //             </View>
// //             {/* ------------------------------------ */}

// //             {/* Affichage Erreur Chargement */}
// //             {error && !loading && (
// //                 <View style={styles.errorContainer}>
// //                     <AlertCircle size={48} color="#dc2626" />
// //                     <Text style={styles.errorText}>{error}</Text>
// //                     <TouchableOpacity style={styles.retryButton} onPress={() => loadData(filterStatus)}>
// //                         <RefreshCcw size={16} color="#ffffff" />
// //                         <Text style={styles.retryButtonText}>Réessayer</Text>
// //                     </TouchableOpacity>
// //                 </View>
// //             )}

// //             {/* Affichage Liste */}
// //             {!error && (
// //                 <FlatList
// //                     data={accountsInfo} // Utilise accountsInfo
// //                     renderItem={renderItem} // Utilise le nouveau renderItem
// //                     // Utilise user_id comme clé car 'id' peut être absent pour 'not_submitted'
// //                     keyExtractor={(item) => item.user_id}
// //                     contentContainerStyle={styles.listContainer}
// //                     ListHeaderComponent={loading && accountsInfo.length === 0 ? <ActivityIndicator style={{ marginTop: 20}} size="large" color="#0891b2" /> : null}
// //                     ListEmptyComponent={
// //                         !loading ? (
// //                             <View style={styles.emptyContainer}>
// //                                 <Banknote size={48} color="#cbd5e1" />
// //                                 {/* --- Message Vide Dynamique (4 cas) --- */}
// //                                 <Text style={styles.emptyText}>
// //                                     {filterStatus === 'pending' ? "Aucun RIB en attente." : 
// //                                      filterStatus === 'verified' ? "Aucun RIB vérifié." : 
// //                                      filterStatus === 'not_submitted' ? "Tous les hôtes/hostpros ont soumis un RIB." : 
// //                                      "Aucune information trouvée."}
// //                                 </Text>
// //                             </View>
// //                         ) : null
// //                     }
// //                     refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0891b2']} tintColor={'#0891b2'} />}
// //                 />
// //             )}
// //         </SafeAreaView>
// //     );
// // }

// // // --- Styles --- (Ajout styles pour notSubmitted*)
// // const styles = StyleSheet.create({
// //     container: { flex: 1, backgroundColor: '#f1f5f9' },
// //     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
// //     errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
// //     errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
// //     retryButton: { flexDirection: 'row', gap: 8, backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10 },
// //     retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },

// //     filterBar: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', gap: 10 },
// //     filterButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f9fafb', gap: 4, minHeight: 42 }, // minHeight pour alignement
// //     filterButtonActive: { backgroundColor: '#0891b2', borderColor: '#06b6d4' },
// //     filterButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#374151', textAlign: 'center' }, // Ajusté taille
// //     filterButtonTextActive: { color: '#ffffff' },
// //     filterTextActive: { color: '#ffffff' }, // Ajouté pour 'Tous' & 'Non soumis'

// //     listContainer: { flexGrow: 1, padding: 10, paddingBottom: 30 },
// //     itemContainer: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
// //     userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
// //     avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e5e7eb' },
// //     userDetails: { flex: 1 },
// //     userName: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1f2937' },
// //     userIdLink: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#0891b2', marginTop: 2 },
// //     bankDetailsGroup: { marginVertical: 8 },
// //     bankDetails: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, paddingVertical: 2 },
// //     detailLabel: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#6b7280', marginRight: 8 },
// //     detailValue: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: '#374151', flexShrink: 1, textAlign: 'right' },
// //     ibanText: { fontFamily: 'monospace', fontSize: 14 },

// //     // --- Styles pour le cas "Non soumis" ---
// //     notSubmittedContainer: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         paddingVertical: 20,
// //         paddingHorizontal: 10,
// //         marginVertical: 8,
// //         backgroundColor: '#f1f5f9', // Fond légèrement différent
// //         borderRadius: 8,
// //         gap: 8,
// //         borderWidth: 1,
// //         borderColor: '#e2e8f0'
// //     },
// //     notSubmittedText: {
// //         fontFamily: 'Montserrat-Regular',
// //         fontSize: 13,
// //         color: '#64748b',
// //         fontStyle: 'italic'
// //     },
// //     // --------------------------------------

// //     actionsContainer: { flexDirection: 'row', gap: 10, marginTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16, justifyContent: 'flex-end' },
// //     actionButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 40, flexDirection: 'row' },
// //     approveButton: { backgroundColor: '#10b981', borderColor: '#059669', borderWidth: 1 },
// //     actionButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#ffffff' },
// //     actionButtonDisabled: { opacity: 0.6 },

// //     verifiedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
// //     verifiedText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: '#059669' },

// //     emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30, marginTop: 50 },
// //     emptyText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#9ca3af', marginTop: 16, textAlign: 'center' }
// // });



// // Dans /home/project/app/admin/payout-verifications.tsx
// // VERSION FINALE avec 4 FILTRES + RECHERCHE via RPC

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     View, Text, SafeAreaView, FlatList, TouchableOpacity, Image,
//     Alert, ActivityIndicator, RefreshControl, StyleSheet, TextInput // TextInput ajouté
// } from 'react-native';
// import { Stack, router } from 'expo-router';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/hooks/useAuth';
// import { useDebounce } from '@/hooks/useDebounce'; // <<< IMPORTER useDebounce
// import { format } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import {
//     Banknote, CheckCircle, AlertCircle, UserCircle as UserIconLucide, Clock,
//     BadgeCheck, XCircle, ShieldAlert, RefreshCcw, List, HelpCircle, Search as SearchIcon // Ajout SearchIcon
// } from 'lucide-react-native';

// // Interface (inchangée)
// interface CombinedAccountInfo {
//     id?: string; user_id: string; account_holder?: string; bank_name?: string; iban?: string; created_at?: string; updated_at?: string; verified?: boolean;
//     profiles: { full_name: string | null; avatar_url: string | null; } | null;
//     bankDetailsSubmitted: boolean;
// }

// type FilterStatus = 'pending' | 'verified' | 'not_submitted' | 'all';

// export default function PayoutVerificationScreen() {
//     const { user: adminUser, isLoading: isLoadingAuth } = useAuth();
//     const [accountsInfo, setAccountsInfo] = useState<CombinedAccountInfo[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [refreshing, setRefreshing] = useState(false);
//     const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

//     // --- États Filtre et Recherche ---
//     const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
//     const [searchTerm, setSearchTerm] = useState('');
//     const debouncedSearchTerm = useDebounce(searchTerm, 500); // Délai de 500ms

//     // --- Chargement (modifié pour inclure la recherche) ---
//     const loadData = useCallback(async (statusFilter: FilterStatus, searchText: string, isRefresh = false) => {
//         if (!adminUser) { setError("Admin non identifié."); return; }
//         if (!isRefresh) {
//             setLoading(true);
//             setAccountsInfo([]);
//         }
//         setError(null);
//         const currentSearch = searchText.trim(); // Utiliser la version trim()
//         console.log(`🚀 Fetching data for filter: ${statusFilter}, search: "${currentSearch}"...`);

//         try {
//             let data: any[] | null = null;
//             let fetchError: any = null;
//             let rpcName = '';
//             let rpcParams: any = {};

//             if (statusFilter === 'not_submitted') {
//                 // --- APPEL RPC 2 avec recherche ---
//                 rpcName = 'get_hosts_without_bank_details';
//                 rpcParams = {
//                     // p_target_roles: ['host', 'hostpro'], // Si non mis par défaut dans SQL
//                     p_search_text: currentSearch
//                 };
//                 console.log("... calling", rpcName, "with params:", rpcParams);
//                 // ---------------------------------
//             } else {
//                 // --- APPEL RPC 1 avec recherche ---
//                 rpcName = 'get_bank_accounts_for_admin_view';
//                 let statusParam: boolean | null = null;
//                 if (statusFilter === 'pending') statusParam = false;
//                 else if (statusFilter === 'verified') statusParam = true;

//                 rpcParams = {
//                     p_verified_status: statusParam,
//                     p_target_roles: ['host', 'hostpro'], // Paramètre rôle requis par la fonction SQL
//                     p_search_text: currentSearch          // Paramètre recherche ajouté
//                 };
//                 console.log("... calling", rpcName, "with params:", rpcParams);
//                 // ---------------------------------
//             }

//              // Exécution de l'appel RPC sélectionné
//              const { data: rpcData, error: rpcError } = await supabase.rpc(rpcName, rpcParams);
//              data = rpcData;
//              fetchError = rpcError;

//             if (fetchError) throw fetchError;

//             // --- FORMATAGE (inchangé) ---
//             let formattedData: CombinedAccountInfo[] = [];
//              if (statusFilter === 'not_submitted') {
//                  formattedData = (data || []).map((item: any) => ({
//                      user_id: item.user_id, profiles: { full_name: item.profile_full_name || null, avatar_url: item.profile_avatar_url || null, }, bankDetailsSubmitted: false
//                  }));
//              } else {
//                  formattedData = (data || []).map((item: any) => ({
//                      id: item.id, user_id: item.user_id, account_holder: item.account_holder, bank_name: item.bank_name, iban: item.iban, created_at: item.created_at, updated_at: item.updated_at, verified: item.verified,
//                      profiles: { full_name: item.profile_full_name || null, avatar_url: item.profile_avatar_url || null, }, bankDetailsSubmitted: true
//                  }));
//              }
//             // --------------------------

//             console.log(`✅ Fetched ${formattedData.length || 0} items for filter: ${statusFilter}, search: "${currentSearch}"`);
//             setAccountsInfo(formattedData);

//         } catch (err: any) {
//             console.error(`Error loading data for filter ${statusFilter} / search "${currentSearch}":`, err);
//             setError(err.message || "Erreur lors de la récupération des données.");
//             setAccountsInfo([]);
//         } finally {
//             if (!isRefresh) setLoading(false);
//             setRefreshing(false);
//         }
//     // --- adminUser ajouté comme dépendance ---
//     }, [adminUser]);

//     // useEffect pour charger les données quand filtre OU recherche (décalée) change
//     useEffect(() => {
//         if (!isLoadingAuth && adminUser) {
//             // Appel avec le filtre ET le terme de recherche décalé
//             loadData(filterStatus, debouncedSearchTerm);
//         }
//         // --- AJOUT debouncedSearchTerm AUX DÉPENDANCES ---
//     }, [isLoadingAuth, adminUser, filterStatus, debouncedSearchTerm, loadData]);

//     // onRefresh (modifié pour inclure la recherche actuelle)
//     const onRefresh = useCallback(() => {
//         setRefreshing(true);
//         // Recharge avec le filtre ET le terme de recherche ACTUELS (pas le décalé ici)
//         loadData(filterStatus, searchTerm, true);
//     // --- AJOUT searchTerm et filterStatus AUX DÉPENDANCES ---
//     }, [loadData, filterStatus, searchTerm]);

//     // handleApproveBankAccount (Recharge 'pending' sans recherche spécifique)
//      const handleApproveBankAccount = useCallback(async (bankAccountId: string) => {
//          if (!adminUser?.id) return;
//          setLoadingActionId(bankAccountId); setError(null);
//          console.log(`⚡️ Approving bank account ID: ${bankAccountId}`);
//          try {
//              const { data: functionResponse, error: functionError } = await supabase.functions.invoke('approve-bank-details', { body: JSON.stringify({ bankAccountId: bankAccountId }) });
//              if (functionError) throw new Error(functionError.message || "Erreur fonction approbation.");
//              if (functionResponse?.error) throw new Error(functionResponse.error);
//              Alert.alert("Succès", "Informations bancaires marquées comme vérifiées.");
//              // Recharge la liste PENDING sans terme de recherche
//              await loadData('pending', '', true);
//              // Si l'utilisateur regardait "Tous", on pourrait rafraîchir "Tous" avec la recherche actuelle
//              if (filterStatus === 'all') {
//                  await loadData('all', searchTerm, true);
//              }
//          } catch (err: any) { console.error("Error approving bank details:", err); setError(err.message || "Erreur approbation."); Alert.alert("Erreur", err.message || "Impossible approuver."); }
//          finally { setLoadingActionId(null); }
//      }, [adminUser?.id, loadData, filterStatus, searchTerm]); // dépendances MAJ

//     // renderItem (inchangé)
//     const renderItem = ({ item }: { item: CombinedAccountInfo }) => {
//          const isLoadingItemAction = loadingActionId === item.id;
//          const defaultAvatar = 'https://ui-avatars.com/api/?name=?&background=random';
//          return ( /* ... JSX identique à la version précédente ... */ );
//     };

//     // --- Rendu Principal ---
//     if (isLoadingAuth) { return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></View>; }
//     if (!adminUser) { return <View style={styles.errorContainer}><Text style={styles.errorText}>Accès non autorisé</Text></View>; }

//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ title: 'Vérification RIB/IBAN Hôtes' }} />

//             {/* --- BARRE DE FILTRES (4 boutons) --- */}
//             <View style={styles.filterBar}>
//                  {/* ... Vos 4 boutons filtres (pending, verified, not_submitted, all) ... */}
//                  <TouchableOpacity style={[styles.filterButton, filterStatus === 'pending' && styles.filterButtonActive]} onPress={() => setFilterStatus('pending')} disabled={loading || refreshing} > /* ... */ </TouchableOpacity>
//                  <TouchableOpacity style={[styles.filterButton, filterStatus === 'verified' && styles.filterButtonActive]} onPress={() => setFilterStatus('verified')} disabled={loading || refreshing} > /* ... */ </TouchableOpacity>
//                  <TouchableOpacity style={[styles.filterButton, filterStatus === 'not_submitted' && styles.filterButtonActive]} onPress={() => setFilterStatus('not_submitted')} disabled={loading || refreshing} > /* ... */ </TouchableOpacity>
//                  <TouchableOpacity style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]} onPress={() => setFilterStatus('all')} disabled={loading || refreshing} > /* ... */ </TouchableOpacity>
//             </View>
//             {/* ------------------------------------ */}

//             {/* --- AJOUT BARRE DE RECHERCHE --- */}
//            <View style={styles.searchContainer}>
//                <SearchIcon size={20} color="#6b7280" style={styles.searchIcon} />
//                <TextInput
//                    style={styles.searchInput}
//                    placeholder="Rechercher (nom, titulaire, banque, IBAN...)"
//                    value={searchTerm}
//                    onChangeText={setSearchTerm}
//                    placeholderTextColor="#9ca3af"
//                    clearButtonMode="while-editing"
//                    autoCapitalize="none"
//                    autoCorrect={false}
//                />
//            </View>
//             {/* ----------------------------- */}


//             {/* Affichage Erreur Chargement */}
//             {error && !loading && (
//                  <View style={styles.errorContainer}>
//                      {/* ... Error UI ... */}
//                  </View>
//              )}

//             {/* Affichage Liste */}
//             {!error && (
//                 <FlatList
//                     data={accountsInfo}
//                     renderItem={renderItem}
//                     keyExtractor={(item) => item.user_id}
//                     contentContainerStyle={styles.listContainer}
//                     ListHeaderComponent={loading && accountsInfo.length === 0 ? <ActivityIndicator style={{ marginTop: 20}} size="large" color="#0891b2" /> : null}
//                     ListEmptyComponent={
//                         !loading ? (<View style={styles.emptyContainer}><Banknote size={48} color="#cbd5e1" />
//                             {/* Message Vide (gère la recherche) */}
//                             <Text style={styles.emptyText}>
//                                  {searchTerm ? `Aucun résultat pour "${searchTerm}" avec le filtre '${filterStatus}'.` :
//                                   filterStatus === 'pending' ? "Aucun RIB en attente." :
//                                   filterStatus === 'verified' ? "Aucun RIB vérifié." :
//                                   filterStatus === 'not_submitted' ? "Tous les hôtes/hostpros ont soumis un RIB." :
//                                   "Aucune information trouvée."}
//                             </Text>
//                         </View>) : null
//                     }
//                     refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0891b2']} tintColor={'#0891b2'} />}
//                 />
//             )}
//         </SafeAreaView>
//     );
// }

// // --- Styles --- (Inclure TOUS les styles + searchContainer, searchInput, searchIcon)
// const styles = StyleSheet.create({
//     // ... Collez ici TOUS les styles de la version précédente ...
//      container: { flex: 1, backgroundColor: '#f1f5f9' },
//      loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
//      errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//      errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
//      retryButton: { flexDirection: 'row', gap: 8, backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10 },
//      retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },

//      filterBar: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', gap: 10, },
//      filterButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f9fafb', gap: 4, minHeight: 42 },
//      filterButtonActive: { backgroundColor: '#0891b2', borderColor: '#06b6d4', },
//      filterButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#374151', textAlign: 'center' },
//      filterButtonTextActive: { color: '#ffffff', },
//      filterTextActive: { color: '#ffffff' },

//       // --- Styles Barre de Recherche ---
//       searchContainer: {
//           flexDirection: 'row',
//           alignItems: 'center',
//           backgroundColor: '#ffffff', // Fond blanc
//           paddingVertical: 8,
//           paddingHorizontal: 16,
//           borderBottomWidth: 1,
//           borderBottomColor: '#e5e7eb', // Séparateur comme les filtres
//       },
//       searchIcon: {
//           marginRight: 10,
//       },
//       searchInput: {
//           flex: 1,
//           height: 40, // Hauteur standard
//           fontFamily: 'Montserrat-Regular',
//           fontSize: 15,
//           color: '#1f293b', // Texte sombre
//           backgroundColor: '#f1f5f9', // Fond léger pour le distinguer
//           borderRadius: 8, // Bords arrondis
//           paddingHorizontal: 10, // Padding interne
//       },
//       // --------------------------------

//      listContainer: { flexGrow: 1, padding: 10, paddingBottom: 30 },
//      itemContainer: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
//      userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
//      avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e5e7eb' },
//      userDetails: { flex: 1 },
//      userName: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1f2937' },
//      userIdLink: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#0891b2', marginTop: 2 },
//      bankDetailsGroup: { marginVertical: 8 },
//      bankDetails: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, paddingVertical: 2 },
//      detailLabel: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#6b7280', marginRight: 8 },
//      detailValue: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: '#374151', flexShrink: 1, textAlign: 'right' },
//      ibanText: { fontFamily: 'monospace', fontSize: 14 },

//      notSubmittedContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, paddingHorizontal: 10, marginVertical: 8, backgroundColor: '#f1f5f9', borderRadius: 8, gap: 8, borderWidth: 1, borderColor: '#e2e8f0', },
//      notSubmittedText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#64748b', fontStyle: 'italic', },

//      actionsContainer: { flexDirection: 'row', gap: 10, marginTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16, justifyContent: 'flex-end' },
//      actionButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 40, flexDirection: 'row' },
//      approveButton: { backgroundColor: '#10b981', borderColor: '#059669', borderWidth: 1 },
//      actionButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#ffffff' },
//      actionButtonDisabled: { opacity: 0.6 },

//      verifiedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', },
//      verifiedText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: '#059669', },

//      emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30, marginTop: 50 },
//      emptyText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#9ca3af', marginTop: 16, textAlign: 'center' }
// });




// Dans /home/project/app/admin/payout-verifications.tsx
// VERSION FINALE avec 4 FILTRES + RECHERCHE via RPC

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, SafeAreaView, FlatList, TouchableOpacity, Image,
    Alert, ActivityIndicator, RefreshControl, StyleSheet, TextInput // TextInput ajouté
} from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase'; // Vérifier chemin
import { useAuth } from '@/hooks/useAuth'; // Vérifier chemin
import { useDebounce } from '@/hooks/useDebounce'; // <<< IMPORTER useDebounce
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    Banknote, CheckCircle, AlertCircle, UserCircle as UserIconLucide, Clock,
    BadgeCheck, XCircle, ShieldAlert, RefreshCcw, List, HelpCircle, Search as SearchIcon // Ajout SearchIcon
} from 'lucide-react-native';
// Assurez-vous que les polices sont chargées globalement ou importez useFonts ici si nécessaire

// Interface étendue pour gérer les deux types de retour RPC
interface CombinedAccountInfo {
    id?: string; // ID du compte bancaire (absent si non soumis)
    user_id: string; // ID utilisateur (toujours présent)
    account_holder?: string;
    bank_name?: string;
    iban?: string;
    created_at?: string; // Date soumission RIB (absent si non soumis)
    updated_at?: string; // Date vérification (absent si non soumis)
    verified?: boolean; // Statut vérification (non pertinent si non soumis)
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
    bankDetailsSubmitted: boolean; // Flag pour savoir si les détails bancaires ont été soumis
}

// Type pour le statut du filtre (4 états)
type FilterStatus = 'pending' | 'verified' | 'not_submitted' | 'all';

export default function PayoutVerificationScreen() {
    const { user: adminUser, isLoading: isLoadingAuth } = useAuth();
    const [accountsInfo, setAccountsInfo] = useState<CombinedAccountInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

    // --- États Filtre et Recherche ---
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // Délai de 500ms

    // --- Chargement (appelle la bonne RPC selon le filtre + recherche) ---
    const loadData = useCallback(async (statusFilter: FilterStatus, searchText: string, isRefresh = false) => {
        if (!adminUser) { setError("Admin non identifié."); return; }
        if (!isRefresh) {
            setLoading(true);
            setAccountsInfo([]); // Vider avant chargement
        }
        setError(null);
        const currentSearch = searchText.trim();
        console.log(`🚀 Fetching data for filter: ${statusFilter}, search: "${currentSearch}"...`);

        try {
            let data: any[] | null = null;
            let fetchError: any = null;
            let rpcName = '';
            let rpcParams: any = {};

            if (statusFilter === 'not_submitted') {
                // --- APPEL RPC 2 ---
                rpcName = 'get_hosts_without_bank_details';
                rpcParams = {
                    // p_target_roles: ['host', 'hostpro'], // Si non mis par défaut dans SQL
                    p_search_text: currentSearch
                };
                console.log("... calling", rpcName, "with params:", rpcParams);
                // ------------------
            } else {
                // --- APPEL RPC 1 ---
                rpcName = 'get_bank_accounts_for_admin_view';
                let statusParam: boolean | null = null;
                if (statusFilter === 'pending') statusParam = false;
                else if (statusFilter === 'verified') statusParam = true;
                // Si 'all', statusParam reste null

                rpcParams = {
                    p_verified_status: statusParam,
                    p_target_roles: ['host', 'hostpro'], // Paramètre rôle requis
                    p_search_text: currentSearch          // Paramètre recherche
                };
                console.log("... calling", rpcName, "with params:", rpcParams);
                // ------------------
            }

             // Exécution de l'appel RPC sélectionné
             const { data: rpcData, error: rpcError } = await supabase.rpc(rpcName, rpcParams);
             data = rpcData;
             fetchError = rpcError;

            if (fetchError) throw fetchError;

            // --- FORMATAGE DES DONNÉES (selon la RPC appelée) ---
            let formattedData: CombinedAccountInfo[] = [];
            if (statusFilter === 'not_submitted') {
                formattedData = (data || []).map((item: any) => ({
                    user_id: item.user_id,
                    profiles: { full_name: item.profile_full_name || null, avatar_url: item.profile_avatar_url || null, },
                    bankDetailsSubmitted: false // Flag
                }));
            } else {
                formattedData = (data || []).map((item: any) => ({
                    id: item.id, user_id: item.user_id, account_holder: item.account_holder, bank_name: item.bank_name, iban: item.iban, created_at: item.created_at, updated_at: item.updated_at, verified: item.verified,
                    profiles: { full_name: item.profile_full_name || null, avatar_url: item.profile_avatar_url || null, },
                    bankDetailsSubmitted: true // Flag
                }));
            }
            // ----------------------------------------------------

            console.log(`✅ Fetched ${formattedData.length || 0} items for filter: ${statusFilter}, search: "${currentSearch}"`);
            setAccountsInfo(formattedData);

        } catch (err: any) {
            console.error(`Error loading data for filter ${statusFilter} / search "${currentSearch}":`, err);
            // Afficher un message plus clair si la fonction RPC n'existe pas
            if (err.message?.includes('Could not find the function')) {
                 setError(`Erreur: La fonction RPC '${statusFilter === 'not_submitted' ? 'get_hosts_without_bank_details' : 'get_bank_accounts_for_admin_view'}' est introuvable ou ses paramètres sont incorrects. Vérifiez sa création et les permissions dans Supabase.`);
            } else {
                 setError(err.message || "Erreur lors de la récupération des données.");
            }
            setAccountsInfo([]);
        } finally {
            if (!isRefresh) setLoading(false);
            setRefreshing(false);
        }
    }, [adminUser]); // adminUser est une dépendance nécessaire

    // useEffect pour charger les données quand filtre OU recherche (décalée) change
    useEffect(() => {
        if (!isLoadingAuth && adminUser) {
            loadData(filterStatus, debouncedSearchTerm);
        }
    }, [isLoadingAuth, adminUser, filterStatus, debouncedSearchTerm, loadData]);

    // onRefresh (modifié pour inclure la recherche actuelle)
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData(filterStatus, searchTerm, true);
    }, [loadData, filterStatus, searchTerm]);

    // handleApproveBankAccount (Recharge 'pending' sans recherche spécifique)
     const handleApproveBankAccount = useCallback(async (bankAccountId: string) => {
         if (!adminUser?.id) return;
         setLoadingActionId(bankAccountId); setError(null);
         try {
             const { data: functionResponse, error: functionError } = await supabase.functions.invoke('approve-bank-details', { body: JSON.stringify({ bankAccountId: bankAccountId }) });
             if (functionError) throw new Error(functionError.message || "Erreur fonction approbation.");
             if (functionResponse?.error) throw new Error(functionResponse.error);
             Alert.alert("Succès", "Informations bancaires marquées comme vérifiées.");
             // Recharge la liste PENDING sans terme de recherche
             await loadData('pending', '', true);
             // Si l'utilisateur regardait "Tous", on rafraîchit "Tous" avec la recherche actuelle
             if (filterStatus === 'all') {
                 await loadData('all', searchTerm, true);
             }
         } catch (err: any) { console.error("Error approving bank details:", err); setError(err.message || "Erreur approbation."); Alert.alert("Erreur", err.message || "Impossible approuver."); }
         finally { setLoadingActionId(null); }
     }, [adminUser?.id, loadData, filterStatus, searchTerm]);

    // --- Rendu d'un élément (CORRIGÉ) ---
    const renderItem = ({ item }: { item: CombinedAccountInfo }) => {
        const isLoadingItemAction = loadingActionId === item.id;
        const defaultAvatar = 'https://ui-avatars.com/api/?name=?&background=random';

        return (
            <View style={styles.itemContainer}>
                {/* Infos Utilisateur (toujours présentes) */}
                <View style={styles.userInfo}>
                    <Image source={{ uri: item.profiles?.avatar_url || defaultAvatar }} style={styles.avatar} />
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{item.profiles?.full_name || 'Utilisateur Inconnu'}</Text>
                        <TouchableOpacity onPress={() => router.push(`/admin/users/${item.user_id}`)}>
                            <Text style={styles.userIdLink}>Voir profil (ID: {item.user_id.substring(0,8)}...)</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Affiche infos bancaires OU message "Non soumis" */}
                {item.bankDetailsSubmitted ? (
                    <View style={styles.bankDetailsGroup}>
                        <View style={styles.bankDetails}><Text style={styles.detailLabel}>Titulaire:</Text><Text style={styles.detailValue}>{item.account_holder}</Text></View>
                        <View style={styles.bankDetails}><Text style={styles.detailLabel}>Banque:</Text><Text style={styles.detailValue}>{item.bank_name}</Text></View>
                        <View style={styles.bankDetails}><Text style={styles.detailLabel}>IBAN/RIB:</Text><Text style={[styles.detailValue, styles.ibanText]}>{item.iban}</Text></View>
                    </View>
                ) : (
                    <View style={styles.notSubmittedContainer}>
                        <HelpCircle size={16} color="#64748b" />
                        <Text style={styles.notSubmittedText}>Aucune information bancaire soumise.</Text>
                    </View>
                )}

                {/* Bouton/Badge de Statut (conditionnel) */}
                {item.bankDetailsSubmitted && filterStatus === 'pending' && (
                   <View style={styles.actionsContainer}>
                       <TouchableOpacity
                           style={[styles.actionButton, styles.approveButton, isLoadingItemAction && styles.actionButtonDisabled]}
                           onPress={() => handleApproveBankAccount(item.id!)} // id! car il existe si bankDetailsSubmitted=true
                           disabled={isLoadingItemAction}>
                           {isLoadingItemAction ? <ActivityIndicator size="small" color="#ffffff"/> : <CheckCircle size={16} color="#ffffff" />}
                           <Text style={styles.actionButtonText}>Marquer comme Vérifié</Text>
                       </TouchableOpacity>
                   </View>
                )}
                {item.bankDetailsSubmitted && item.verified && (
                    <View style={styles.verifiedBadge}>
                        <BadgeCheck size={16} color="#10b981" />
                        <Text style={styles.verifiedText}>Vérifié le {format(new Date(item.updated_at!), 'dd/MM/yyyy', { locale: fr })}</Text> {/* updated_at! car il existe si verified=true */}
                    </View>
                )}
            </View>
        );
    };

    // --- Rendu Principal ---
    if (isLoadingAuth) { return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></View>; }
    if (!adminUser) { return <View style={styles.errorContainer}><Text style={styles.errorText}>Accès non autorisé</Text></View>; }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Vérification RIB/IBAN Hôtes' }} />

            {/* --- BARRE DE FILTRES (4 boutons) --- */}
            <View style={styles.filterBar}>
                 <TouchableOpacity style={[styles.filterButton, filterStatus === 'pending' && styles.filterButtonActive]} onPress={() => setFilterStatus('pending')} disabled={loading || refreshing} >
                     <Clock size={16} color={filterStatus === 'pending' ? '#ffffff' : '#f59e0b'} />
                     <Text style={[styles.filterButtonText, filterStatus === 'pending' && styles.filterButtonTextActive]}>En attente</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.filterButton, filterStatus === 'verified' && styles.filterButtonActive]} onPress={() => setFilterStatus('verified')} disabled={loading || refreshing} >
                     <BadgeCheck size={16} color={filterStatus === 'verified' ? '#ffffff' : '#10b981'} />
                     <Text style={[styles.filterButtonText, filterStatus === 'verified' && styles.filterButtonTextActive]}>Vérifiés</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.filterButton, filterStatus === 'not_submitted' && styles.filterButtonActive]} onPress={() => setFilterStatus('not_submitted')} disabled={loading || refreshing} >
                      <HelpCircle size={16} color={filterStatus === 'not_submitted' ? '#ffffff' : '#64748b'} />
                     <Text style={[styles.filterButtonText, filterStatus === 'not_submitted' && styles.filterTextActive]}>Non soumis</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]} onPress={() => setFilterStatus('all')} disabled={loading || refreshing} >
                     <List size={16} color={filterStatus === 'all' ? '#ffffff' : '#64748b'} />
                     <Text style={[styles.filterButtonText, filterStatus === 'all' && styles.filterTextActive]}>Tous</Text>
                 </TouchableOpacity>
            </View>
            {/* ------------------------------------ */}

            {/* --- BARRE DE RECHERCHE --- */}
           <View style={styles.searchContainer}>
               <SearchIcon size={20} color="#6b7280" style={styles.searchIcon} />
               <TextInput
                   style={styles.searchInput}
                   placeholder="Rechercher (nom, titulaire, banque, IBAN...)"
                   value={searchTerm}
                   onChangeText={setSearchTerm}
                   placeholderTextColor="#9ca3af"
                   clearButtonMode="while-editing"
                   autoCapitalize="none"
                   autoCorrect={false}
               />
           </View>
            {/* ----------------------------- */}

            {/* Affichage Erreur Chargement */}
            {error && !loading && (
                 <View style={styles.errorContainer}>
                     <AlertCircle size={48} color="#dc2626" />
                     <Text style={styles.errorText}>{error}</Text>
                     <TouchableOpacity style={styles.retryButton} onPress={() => loadData(filterStatus, searchTerm)}>
                         <RefreshCcw size={16} color="#ffffff" />
                         <Text style={styles.retryButtonText}>Réessayer</Text>
                     </TouchableOpacity>
                 </View>
             )}

            {/* Affichage Liste */}
            {!error && (
                <FlatList
                    data={accountsInfo}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.user_id}
                    contentContainerStyle={styles.listContainer}
                    ListHeaderComponent={loading && accountsInfo.length === 0 ? <ActivityIndicator style={{ marginTop: 20}} size="large" color="#0891b2" /> : null}
                    ListEmptyComponent={
                        !loading ? (<View style={styles.emptyContainer}><Banknote size={48} color="#cbd5e1" />
                            {/* Message Vide (gère la recherche) */}
                            <Text style={styles.emptyText}>
                                 {searchTerm ? `Aucun résultat pour "${searchTerm}" avec le filtre '${filterStatus}'.` :
                                  filterStatus === 'pending' ? "Aucun RIB en attente." :
                                  filterStatus === 'verified' ? "Aucun RIB vérifié." :
                                  filterStatus === 'not_submitted' ? "Tous les hôtes/hostpros ont soumis un RIB." :
                                  "Aucune information trouvée."}
                            </Text>
                        </View>) : null
                    }
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0891b2']} tintColor={'#0891b2'} />}
                />
            )}
        </SafeAreaView>
    );
}

// --- Styles --- (Ajout styles pour search*)
const styles = StyleSheet.create({
    // ... Coller TOUS les styles de la version précédente ici ...
     container: { flex: 1, backgroundColor: '#f1f5f9' },
     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
     errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
     errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
     retryButton: { flexDirection: 'row', gap: 8, backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10 },
     retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },

     filterBar: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', gap: 10, },
     filterButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#f9fafb', gap: 4, minHeight: 42 }, // minHeight pour alignement
     filterButtonActive: { backgroundColor: '#0891b2', borderColor: '#06b6d4', },
     filterButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#374151', textAlign: 'center' }, // Ajusté taille
     filterButtonTextActive: { color: '#ffffff', },
     filterTextActive: { color: '#ffffff' }, // Ajouté pour 'Tous' & 'Non soumis'

      // --- Styles Barre de Recherche ---
      searchContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#ffffff', // Fond blanc
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb', // Séparateur comme les filtres
      },
      searchIcon: {
          marginRight: 10,
      },
      searchInput: {
          flex: 1,
          height: 40, // Hauteur standard
          fontFamily: 'Montserrat-Regular',
          fontSize: 15,
          color: '#1f293b', // Texte sombre
          backgroundColor: '#f1f5f9', // Fond léger pour le distinguer
          borderRadius: 8, // Bords arrondis
          paddingHorizontal: 10, // Padding interne
      },
      // --------------------------------

     listContainer: { flexGrow: 1, padding: 10, paddingBottom: 30 },
     itemContainer: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
     userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
     avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e5e7eb' },
     userDetails: { flex: 1 },
     userName: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1f2937' },
     userIdLink: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#0891b2', marginTop: 2 },
     bankDetailsGroup: { marginVertical: 8 },
     bankDetails: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, paddingVertical: 2 },
     detailLabel: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#6b7280', marginRight: 8 },
     detailValue: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: '#374151', flexShrink: 1, textAlign: 'right' },
     ibanText: { fontFamily: 'monospace', fontSize: 14 },

     notSubmittedContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, paddingHorizontal: 10, marginVertical: 8, backgroundColor: '#f1f5f9', borderRadius: 8, gap: 8, borderWidth: 1, borderColor: '#e2e8f0', },
     notSubmittedText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#64748b', fontStyle: 'italic', },

     actionsContainer: { flexDirection: 'row', gap: 10, marginTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16, justifyContent: 'flex-end' },
     actionButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 40, flexDirection: 'row' },
     approveButton: { backgroundColor: '#10b981', borderColor: '#059669', borderWidth: 1 },
     actionButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#ffffff' },
     actionButtonDisabled: { opacity: 0.6 },

     verifiedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', },
     verifiedText: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: '#059669', },

     emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30, marginTop: 50 },
     emptyText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#9ca3af', marginTop: 16, textAlign: 'center' }
});