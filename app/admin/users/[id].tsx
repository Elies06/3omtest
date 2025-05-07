// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
//     ActivityIndicator, Alert, SafeAreaView, Image, TextInput, Modal,
//     Dimensions // Assurez-vous que Dimensions est importé
// } from 'react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import {
//     ChevronLeft, Shield, CircleAlert as AlertCircle, BadgeCheck, MapPin, Mail,
//     User as UserIcon, KeyRound, RefreshCcw, Trash2, Edit, X as CloseIcon,
//     Clock, CheckCircle as CheckCircle2, XCircle // Icônes ajoutées pour statuts
// } from 'lucide-react-native';
// import { router, useLocalSearchParams, Stack } from 'expo-router';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/hooks/useAuth';
// import Animated, { FadeIn } from 'react-native-reanimated';
// import { FlatList } from 'react-native-gesture-handler';

// // --- Interfaces ---
// interface UserVerification { id: string; level: number; status: 'pending' | 'approved' | 'rejected'; document_type: string; document_number: string; rejection_reason?: string | null; document_front_path: string | null; document_back_path: string | null; user_face_path: string | null; }
// interface UserData { id: string; email: string | null; full_name: string | null; city: string | null; roles: string[]; verifications: UserVerification[]; avatar_url?: string | null; }
// interface RoleInfo { id: string; name: string; }
// interface RoleRequest { id: string; user_id: string; requested_role: string; status: 'pending' | 'approved' | 'rejected'; created_at: string; rejection_reason?: string | null; }
// // ------------------

// // --- Constantes ---

// const screenWidth = Dimensions.get('window').width;
// const sectionHorizontalPadding = 20 * 2;
// const sectionHorizontalMargin = 10 * 2;
// const imageDisplayWidth = screenWidth - sectionHorizontalMargin - sectionHorizontalPadding;
// const imageDisplayHeight = 200;
// const STATUS_COLORS: Record<string, string> = { draft: '#64748b', pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444', deleted: '#9ca3af' };
// const STATUS_ICONS: { [key: string]: React.ElementType } = { draft: Clock, pending: Clock, approved: BadgeCheck, rejected: XCircle, deleted: Trash2 };
// const STATUS_LABELS: Record<string, string> = { draft: 'Brouillon', pending: 'En attente', approved: 'Approuvée', rejected: 'Rejetée', deleted: 'Supprimée' };
// // ------------------

// export default function UserDetailsScreen() {
//     // --- States ---
//     const { id: userId } = useLocalSearchParams<{ id: string }>();
//     const { user: adminUser, session } = useAuth();
//     const [userData, setUserData] = useState<UserData | null>(null);
//     const [loading, setLoading] = useState(true); // Chargement global données user/verifs/signedUrls
//     const [error, setError] = useState<string | null>(null);
//     const [rolesError, setRolesError] = useState<string | null>(null);
//     const [selectedRoles, setSelectedRoles] = useState<string[]>([]); // Pour l'édition
//     const [availableRoles, setAvailableRoles] = useState<RoleInfo[]>([]);
//     const [loadingRoles, setLoadingRoles] = useState(true); // Chargement spécifique roles disponibles
//     const [isSavingRoles, setIsSavingRoles] = useState(false);
//     const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]); // Pour demandes de rôle
//     const [loadingRoleRequests, setLoadingRoleRequests] = useState(true); // Chargement spécifique demandes rôle
//     const [loadingAction, setLoadingAction] = useState(false); // Pour toutes actions (Approve/Reject ID ou Role)
//     const [isResettingPassword, setIsResettingPassword] = useState(false);
//     const [isResetConfirmModalVisible, setResetConfirmModalVisible] = useState(false);
//     const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
//     const [isDeletingUser, setIsDeletingUser] = useState(false);
//     const [isDeleteUserModalVisible, setDeleteUserModalVisible] = useState(false);
//     const [isImageModalVisible, setImageModalVisible] = useState(false);
//     const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
//     const [fontsLoaded, fontError] = useFonts({ /* ... */ });

//     // --- Fetch Data ---
//     const loadUserDataAndVerifications = useCallback(async () => {
//         if (!userId) return;
//         setLoading(true); setError(null); console.time('loadUserData');
//         try {
//             const [profileRes, rolesRes, verificationsRes, userRes] = await Promise.all([
//                 supabase.from('profiles').select('*, avatar_url, intended_role').eq('user_id', userId).maybeSingle(),
//                 supabase.from('user_roles').select('roles(id, name)').eq('user_id', userId),
//                 supabase.from('identity_verifications').select('*, id, document_front_path, document_back_path, user_face_path').eq('user_id', userId).order('created_at', { ascending: false }),
//                 supabase.schema('public').from('users').select('email, created_at').eq('id', userId).maybeSingle()
//             ]);

//             if (profileRes.error && profileRes.error.code !== 'PGRST116') throw profileRes.error;
//             if (rolesRes.error) throw rolesRes.error;
//             if (verificationsRes.error) throw verificationsRes.error;
//             if (userRes.error && userRes.error.code !== 'PGRST116') throw userRes.error;

//             let verificationsRaw = (verificationsRes.data || []) as UserVerification[];
//             const profile = profileRes.data; const userAuthData = userRes.data; const roles = rolesRes.data || [];
//             if (!profile && !userAuthData) throw new Error("Profil/user introuvable.");

//             console.log('[DEBUG] Données brutes verificationsRes:', JSON.stringify(verificationsRes.data, null, 2)); // LOG AJOUTÉ

//             let verificationsWithSignedUrls = [...verificationsRaw]; const pathsToSign: string[] = []; const avatarPath = profile?.avatar_url;
//             verificationsRaw.forEach(verif => { if (verif.document_front_path) pathsToSign.push(verif.document_front_path); if (verif.document_back_path) pathsToSign.push(verif.document_back_path); if (verif.user_face_path) pathsToSign.push(verif.user_face_path); }); if (avatarPath && !pathsToSign.includes(avatarPath)) pathsToSign.push(avatarPath);
//             const uniquePathsToSign = [...new Set(pathsToSign)]; let signedUrlsMap: { [key: string]: string | null } = {}; let signedAvatarUrl: string | null = avatarPath;
//             if (uniquePathsToSign.length > 0) { const BUCKET_NAME = 'identity-documents'; try { const { data: resp, error: funcErr } = await supabase.functions.invoke('get-signed-urls', { body: { bucket: BUCKET_NAME, paths: uniquePathsToSign } }); if (funcErr) throw funcErr; if (resp && resp.signedUrls) { signedUrlsMap = resp.signedUrls; if (avatarPath) signedAvatarUrl = signedUrlsMap[avatarPath] || avatarPath; verificationsWithSignedUrls = verificationsRaw.map(v => ({ ...v, document_front_path: v.document_front_path ? (signedUrlsMap[v.document_front_path] || null) : null, document_back_path: v.document_back_path ? (signedUrlsMap[v.document_back_path] || null) : null, user_face_path: v.user_face_path ? (signedUrlsMap[v.user_face_path] || null) : null, })); } } catch (invokeErr) { console.error("Erreur invoke func:", invokeErr); setError("Erreur URLs images."); } }

//             console.log('[DEBUG] Vérifications finales avant état (verificationsWithSignedUrls):', JSON.stringify(verificationsWithSignedUrls, null, 2)); // LOG AJOUTÉ

//             const currentRoles = roles.map(r => r.roles?.name).filter(Boolean) as string[];
//             setUserData({ id: userId, email: userAuthData?.email || null, full_name: profile?.full_name || null, city: profile?.city || null, roles: currentRoles, verifications: verificationsWithSignedUrls, avatar_url: signedAvatarUrl });
//             setSelectedRoles(currentRoles); // Initialise l'état pour l'éditeur de rôles

//         } catch (err: any) { console.error('Erreur loadUserDataAndVerifications:', err); setError(err.message || "Erreur chargement données user/verifs."); }
//         finally { setLoading(false); console.timeEnd('loadUserData'); }
//     }, [userId]);

//     const loadAvailableRoles = useCallback(async () => { setLoadingRoles(true); setRolesError(null); try { console.log("[DEBUG] Fetching available roles..."); const { data, error } = await supabase.from('roles').select('id, name').order('name'); if (error) throw error; setAvailableRoles(data || []); console.log("[DEBUG] Available roles fetched."); } catch (err: any) { console.error('Error loading available roles:', err); setRolesError(err.message || "Erreur chargement rôles dispo."); } finally { setLoadingRoles(false); } }, []);

//     const loadRoleRequests = useCallback(async () => { if (!userId) return; setLoadingRoleRequests(true); setError(null); /* Reset l'erreur globale ? */ try { console.log("[DEBUG] Fetching role requests history..."); const { data, error } = await supabase.from('role_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; setRoleRequests(data || []); console.log(`[DEBUG] ${data?.length ?? 0} role request(s) history found.`); } catch (err: any) { console.error('Error loading role requests:', err); setError(err.message || "Erreur chargement demandes rôle."); } finally { setLoadingRoleRequests(false); } }, [userId]);

//     // Effet pour charger toutes les données initiales
//     useEffect(() => {
//         if (userId && fontsLoaded && !fontError) {
//             loadUserDataAndVerifications(); // Charge user, roles actuels, verifs, signed URLs
//             loadAvailableRoles(); // Charge la liste des rôles possibles pour l'éditeur
//             loadRoleRequests(); // Charge l'historique des demandes de rôle
//         } else if (!userId && fontsLoaded) {
//             setError("ID utilisateur manquant."); setLoading(false); setLoadingRoles(false); setLoadingRoleRequests(false);
//         }
//     }, [userId, fontsLoaded, fontError, loadUserDataAndVerifications, loadAvailableRoles, loadRoleRequests]); // Dépendances MAJ

//     // --- Handlers (Fonctions d'action) ---
//     const handleRoleToggle = (roleName: string) => { setSelectedRoles(current => current.includes(roleName) ? current.filter(r => r !== roleName) : [...current, roleName]); };
//     const handleSaveRoles = useCallback(async () => { if (!userId || !userData) return; setIsSavingRoles(true); setRolesError(null); try { const { data: rolesMap, error: rolesError } = await supabase.from('roles').select('id, name').in('name', selectedRoles); if (rolesError) throw rolesError; const roleIdsToInsert = rolesMap?.map(r => r.id) || []; await supabase.from('user_roles').delete().eq('user_id', userId); if (roleIdsToInsert.length > 0) { const { error: insertError } = await supabase.from('user_roles').insert(roleIdsToInsert.map(roleId => ({ user_id: userId, role_id: roleId }))); if (insertError) throw insertError; } Alert.alert("Succès", "Rôles utilisateur mis à jour."); setUserData(prev => prev ? {...prev, roles: [...selectedRoles]} : null); setSelectedRoles([...selectedRoles]); } catch (err: any) { console.error('Error updating roles:', err); setRolesError(err.message || "Erreur MAJ rôles."); Alert.alert("Erreur", err.message || "Impossible MAJ rôles."); } finally { setIsSavingRoles(false); } }, [selectedRoles, userId, userData]);
//     const handleVerificationAction = useCallback(async (verificationId: string, action: 'approve' | 'reject') => { if (!userId || !adminUser?.id) return; setLoadingAction(true); setError(null); try { const rpcName = action === 'approve' ? 'approve_verification' : 'reject_verification'; const params: any = { verification_uuid: verificationId, admin_uuid: adminUser.id }; if (action === 'reject') { const reason = await new Promise<string>((resolve) => { Alert.prompt("Raison Rejet ID", "Indiquez la raison :", [{ text: "Annuler", style: "cancel", onPress: () => resolve('') },{ text: "Confirmer", onPress: (text) => resolve(text || 'Raison non fournie') }], "plain-text", "Document invalide"); }); if (!reason.trim()) { setLoadingAction(false); Alert.alert("Attention", "Raison requise."); return; } params.reason = reason; } const { error } = await supabase.rpc(rpcName, params); if (error) throw error; Alert.alert("Succès", `Vérification ID ${action === 'approve' ? 'approuvée' : 'rejetée'}.`); await loadUserDataAndVerifications(); await loadRoleRequests(); } catch (err: any) { console.error('Error updating ID verification:', err); setError(err.message || `Échec action ID.`); Alert.alert("Erreur", `Échec action ID: ${err.message || 'Erreur'}`); } finally { setLoadingAction(false); } }, [userId, adminUser, loadUserDataAndVerifications, loadRoleRequests]);
//     const handleRoleRequestAction = useCallback(async (requestId: string, action: 'approve' | 'reject') => { if (!adminUser?.id) return; let reason = ''; if (action === 'reject') { reason = await new Promise<string>((resolve) => { Alert.prompt("Raison Rejet Demande", "Indiquez la raison:", [{ text: "Annuler", style: "cancel", onPress: () => resolve('') },{ text: "Confirmer", onPress: (text) => resolve(text || 'Raison non fournie') }], "plain-text", ""); }); if (!reason.trim()) { Alert.alert("Attention", "Raison requise."); return; } } setLoadingAction(true); setError(null); try { const rpcName = action === 'approve' ? 'approve_role_request' : 'reject_role_request'; const params: any = { request_id: requestId, admin_id: adminUser.id }; if (action === 'reject') { params.reason = reason; } const { data: rpcResponse, error: rpcError } = await supabase.rpc(rpcName, params); if (rpcError) throw rpcError; Alert.alert("Succès", `Demande rôle ${action === 'approve' ? 'approuvée' : 'rejetée'}. ${typeof rpcResponse === 'string' ? rpcResponse : ''}`); await loadUserDataAndVerifications(); await loadRoleRequests(); } catch (err: any) { console.error(`Error ${action} role request:`, err); setError(err.message || `Échec action demande.`); Alert.alert("Erreur", `Échec ${action}: ${err.message || 'Erreur'}`); } finally { setLoadingAction(false); } }, [adminUser, loadUserDataAndVerifications, loadRoleRequests]);
//     const openImageModal = (url: string | null) => { console.log('[DEBUG] openImageModal appelé avec URL:', url); if (url) { setSelectedImageUrl(url); setImageModalVisible(true); } };
//   const handlePasswordReset = () => { if (!userData?.id || !userData?.email) { Alert.alert("Erreur", "Données utilisateur introuvables."); return; } console.log("Opening password reset modal..."); setResetConfirmModalVisible(true); };
//     const confirmPasswordReset = async () => { setResetConfirmModalVisible(false); if (!userData?.id || !userData?.email) return; setIsResettingPassword(true); setError(null); setResetSuccessMessage(null); try { const token = session?.access_token; if (!token) throw new Error("Token admin absent."); const { error: functionError, data } = await supabase.functions.invoke('bright-action', { body: { targetUserId: userData.id } }); if (functionError) { let message = functionError.message; try { const parsed = JSON.parse(message); message = parsed.error || message; } catch (e) {} throw new Error(message); } console.log("Reset function response:", data); setResetSuccessMessage(data?.message || "Lien envoyé."); setTimeout(() => setResetSuccessMessage(null), 5000); } catch (err: any) { console.error('Error triggering password reset:', err); Alert.alert("Erreur", `Échec envoi: ${err.message}`); setError(`Erreur reset MDP: ${err.message}`); } finally { setIsResettingPassword(false); } };
//     const handleDeleteUserConfirmation = () => { if (!userData) return; setDeleteUserModalVisible(true); };
//     const performDeleteUser = async () => { if (!userData?.id) return; setDeleteUserModalVisible(false); setIsDeletingUser(true); setError(null); try { const token = session?.access_token; if (!token) throw new Error("Token admin absent."); const { error: functionError, data } = await supabase.functions.invoke('delete-user-admin', { body: { targetUserId: userData.id } }); if (functionError) { let message = functionError.message; try { const parsed = JSON.parse(message); message = parsed.error || message; } catch (e) {} throw new Error(message); } console.log("Delete function response:", data); Alert.alert("Succès", data?.message || `Utilisateur supprimé.`); router.replace('/admin/users'); } catch (err: any) { console.error('Error deleting user:', err); Alert.alert("Erreur", `Échec suppression: ${err.message}`); setError(`Erreur suppression: ${err.message}`); } finally { setIsDeletingUser(false); } };

//     // --- Rendu ---
//     if (!fontsLoaded) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; } // Simplifié: attendre polices d'abord
//     if (fontError) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
//     // Afficher chargement si userData n'est pas prêt (même si erreur par ailleurs)
//     if (loading || !userData) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
//     // Si plus en chargement mais toujours pas de userData (et pas d'erreur gérée), cas étrange
//     if (!userData) return null;

//      // --- Log pour l'état avant rendu des rôles ---
//      console.log(`[DEBUG Render] loading: ${loading}, loadingRoles: ${loadingRoles}, userData.roles:`, userData?.roles);
//      // -------------------------------------------

//     return (
//         <SafeAreaView style={styles.container}>
//             <Stack.Screen options={{ title: userData.full_name || userData.email || 'Détail Utilisateur' }} />
//             {/* Header */}
//             <View style={styles.header}><TouchableOpacity style={styles.backButton} onPress={() => router.back()}><ChevronLeft size={24} color="#1e293b" /></TouchableOpacity><Text style={styles.headerTitle} numberOfLines={1}>{userData.full_name || 'Détail Utilisateur'}</Text><View style={{width: 40}} /></View>
//             {/* Error Banner */}
//             {error && (<View style={styles.errorBanner}><Text style={styles.errorBannerText}>{error}</Text><TouchableOpacity onPress={() => { setError(null); loadUserDataAndVerifications(); loadAvailableRoles(); loadRoleRequests(); }} style={styles.retryIcon}><RefreshCcw size={18} color="#b91c1c" /></TouchableOpacity></View> )}

//              <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
//                 {/* User Info */}
//                 <Animated.View entering={FadeIn.delay(100)} style={styles.userInfo} >{userData.avatar_url ? (<Image source={{uri: userData.avatar_url}} style={styles.avatarLarge} onError={(e) => console.log("Erreur avatar:", e.nativeEvent.error)} />) : (<View style={[styles.avatarLarge, styles.avatarPlaceholder]}><UserIcon size={40} color="#9ca3af" /></View>)}<Text style={styles.userName}>{userData.full_name || '(Nom non renseigné)'}</Text><Text style={styles.userEmail}>{userData.email || '(Email non trouvé)'}</Text>{userData.city && (<View style={styles.locationRow}><MapPin size={16} color="#64748b" /><Text style={styles.locationText}>{userData.city}</Text></View>)}</Animated.View>

//                 {/* --- Section Rôles (Restaurée et Complète) --- */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionTitle}>Rôles Utilisateur</Text>
//                     {rolesError && <Text style={styles.errorTextSmall}>{rolesError}</Text>}

//                     {/* Affichage Rôles Actuels (utilise userData.roles qui est chargé par loadUserData) */}
//                     <Text style={styles.subSectionTitle}>Rôles Actuels :</Text>
//                      {/* Pas besoin de loading spécifique ici, userData.roles est dispo si userData l'est */}
//                      <View style={styles.rolesGrid}>
//                         {userData.roles.length > 0 ? userData.roles.map(role => (
//                              <View key={role} style={[styles.roleOption, styles.roleDisplayOnly]}>
//                                  <Shield size={20} color='#0369a1' />
//                                  <Text style={[styles.roleOptionText, styles.roleDisplayText]}>{role}</Text>
//                              </View>
//                          )) : <Text style={styles.noItemsText}>Aucun rôle assigné.</Text>}
//                      </View>

//                     {/* Modification des Rôles (utilise availableRoles) */}
//                      <Text style={styles.subSectionTitle}>Modifier les Rôles :</Text>
//                      {loadingRoles ? <ActivityIndicator color="#0891b2" style={{height: 40}}/> : (
//                         <>
//                              <View style={styles.rolesGrid}>
//                                  {availableRoles.map(role => (
//                                      <TouchableOpacity key={role.id} style={[ styles.roleOption, selectedRoles.includes(role.name) ? styles.roleOptionSelected : null ]} onPress={() => handleRoleToggle(role.name)} disabled={isSavingRoles} >
//                                          <Shield size={20} color={selectedRoles.includes(role.name) ? '#ffffff' : '#64748b'} />
//                                          <Text style={[ styles.roleOptionText, selectedRoles.includes(role.name) ? styles.roleOptionTextSelected : null ]}>{role.name}</Text>
//                                      </TouchableOpacity>
//                                  ))}
//                                  {availableRoles.length === 0 && <Text style={styles.noItemsText}>Aucun rôle disponible.</Text>}
//                              </View>
//                              <TouchableOpacity style={[styles.saveButton, (isSavingRoles || loadingRoles) && styles.saveButtonDisabled]} onPress={handleSaveRoles} disabled={isSavingRoles || loadingRoles} >
//                                  {isSavingRoles ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveButtonText}>Enregistrer Rôles</Text> }
//                              </TouchableOpacity>
//                          </>
//                      )}
//                  </View>
//                  {/* --- Fin Section Rôles --- */}

//                 {/* --- Section Actions Administrateur (Restaurée) --- */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionTitle}>Actions Administrateur</Text>
//                     <TouchableOpacity style={[styles.actionButton, styles.resetButton, (isResettingPassword || loadingAction) && styles.actionButtonDisabled]} onPress={handlePasswordReset} disabled={isResettingPassword || loadingAction}>
//                         {isResettingPassword ? <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8}} /> : <KeyRound size={18} color="#ffffff" style={{ marginRight: 8}} />}
//                         <Text style={styles.actionButtonText}>Réinitialiser Mot de Passe</Text>
//                     </TouchableOpacity>
//                     {resetSuccessMessage && (<View style={styles.successBanner}><Text style={styles.successText}>{resetSuccessMessage}</Text></View>)}
//                     <TouchableOpacity style={[styles.actionButton, styles.editButton, {marginTop: 10}, loadingAction && styles.actionButtonDisabled]} disabled={loadingAction} onPress={() => router.push(`/admin/users/edit/${userId}`)}>
//                         <Edit size={18} color="#ffffff" style={{ marginRight: 8}} />
//                         <Text style={styles.actionButtonText}>Modifier Profil/Infos</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity style={[styles.actionButton, styles.deleteButton, {marginTop: 10}, (isDeletingUser || loadingAction) && styles.actionButtonDisabled]} onPress={handleDeleteUserConfirmation} disabled={isDeletingUser || loadingAction} >
//                          {isDeletingUser ? <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8}} /> : <Trash2 size={18} color="#ffffff" style={{ marginRight: 8}} />}
//                         <Text style={styles.actionButtonText}>Supprimer Utilisateur</Text>
//                     </TouchableOpacity>
//                 </View>
//                  {/* --- Fin Actions Administrateur --- */}

//                  {/* --- Section Demandes de Changement de Rôle (Historique Complet) --- */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionTitle}>Historique Demandes de Rôle</Text>
//                     {loadingRoleRequests ? ( // Indicateur pendant le chargement des demandes
//                         <ActivityIndicator color="#0891b2" style={{marginTop: 15}} />
//                     ) : roleRequests.length === 0 ? (
//                         <Text style={styles.noItemsText}>Aucune demande de changement de rôle.</Text>
//                     ) : (
//                         <FlatList
//                             data={roleRequests} keyExtractor={(item) => item.id} scrollEnabled={false}
//                             renderItem={({ item: request }) => {
//                                 const ReqIcon = STATUS_ICONS[request.status] || AlertCircle; const reqIconColor = STATUS_COLORS[request.status] || '#64748b'; const reqBadgeBgColor = `${reqIconColor}1A`; const reqStatusLabel = STATUS_LABELS[request.status] || request.status;
//                                 return ( <View key={request.id} style={styles.requestCard}><View style={styles.requestHeader}><Text style={styles.requestInfo}>Demande rôle: <Text style={styles.roleText}>{request.requested_role}</Text></Text><View style={[styles.statusBadge, { backgroundColor: reqBadgeBgColor }]}><ReqIcon size={14} color={reqIconColor} style={{ marginRight: 4 }}/><Text style={[styles.statusText, { color: reqIconColor }]}>{reqStatusLabel}</Text></View></View><Text style={styles.dateText}>Demandé le: {new Date(request.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>{(request.status === 'rejected') && request.rejection_reason && ( <View style={styles.rejectionReason}><Text style={styles.rejectionReasonLabel}>Motif Rejet:</Text><Text style={styles.rejectionReasonText}>{request.rejection_reason}</Text></View> )}{request.status === 'pending' && (<View style={styles.requestActions}><TouchableOpacity style={[styles.actionButtonSmall, styles.approveButton, loadingAction && styles.actionButtonDisabled]} onPress={() => handleRoleRequestAction(request.id, 'approve')} disabled={loadingAction}><CheckCircle2 size={16} color="#ffffff" style={{ marginRight: 4 }}/><Text style={styles.actionButtonText}>Approuver</Text></TouchableOpacity><TouchableOpacity style={[styles.actionButtonSmall, styles.rejectButton, loadingAction && styles.actionButtonDisabled]} onPress={() => handleRoleRequestAction(request.id, 'reject')} disabled={loadingAction}><XCircle size={16} color="#b91c1c" style={{ marginRight: 4 }}/><Text style={[styles.actionButtonText, styles.rejectButtonText]}>Rejeter</Text></TouchableOpacity></View> )}</View> );
//                              }} />
//                     )}
//                 </View>
//                 {/* --- Fin Section Demandes --- */}

//                 {/* --- Section Vérifications Identité (Complète) --- */}
//                 <View style={styles.section}>
//                     <Text style={styles.sectionTitle}>Historique Vérifications Identité</Text>
//                     {/* Afficher même si loadingAction, mais boutons désactivés */}
//                     {userData.verifications.length === 0 && !loading ? ( // Vérifier !loading ici
//                          <Text style={styles.noVerifications}>Aucune demande de vérification.</Text>
//                     ) : (
//                     <FlatList
//                          data={userData.verifications} keyExtractor={item => item.id} scrollEnabled={false}
//                          renderItem={({ item: verification }) => {
//                             const VerifIcon = STATUS_ICONS[verification.status] || AlertCircle; const verifIconColor = STATUS_COLORS[verification.status] || '#64748b'; const verifBadgeBgColor = `${verifIconColor}1A`; const verifStatusLabel = STATUS_LABELS[verification.status] || verification.status;
//                             return (
//                                 <View key={verification.id} style={styles.verificationCard}>
//                                     <View style={styles.verificationHeader}><View style={styles.verificationInfo}><Text style={styles.verificationLevel}>Niveau {verification.level}</Text><View style={[styles.statusBadge, { backgroundColor: verifBadgeBgColor }]}><VerifIcon size={14} color={verifIconColor} style={{marginRight:4}} /><Text style={[styles.statusText, { color: verifIconColor }]}>{verifStatusLabel}</Text></View></View><Text style={styles.documentInfo}>{verification.document_type} - {verification.document_number || 'N/A'}</Text></View>
//                                     {verification.status === 'rejected' && verification.rejection_reason && (<View style={styles.rejectionReason}><Text style={styles.rejectionReasonLabel}>Raison Rejet:</Text><Text style={styles.rejectionReasonText}>{verification.rejection_reason}</Text></View>)}
//                                     <View style={styles.imagesSection}>{verification.document_front_path ? (<View style={styles.imageContainer}><Text style={styles.imageLabel}>Recto Doc:</Text><TouchableOpacity onPress={() => openImageModal(verification.document_front_path)}><Image source={{ uri: verification.document_front_path }} style={styles.verificationImage} resizeMode="contain" onError={(e) => console.error(`Erreur image ${verification.id} (recto):`, e.nativeEvent.error)}/></TouchableOpacity></View>) : <View style={styles.imageContainer}><Text style={styles.imageLabel}>Recto Doc: (Absent)</Text></View>}{verification.document_back_path ? (<View style={styles.imageContainer}><Text style={styles.imageLabel}>Verso Doc:</Text><TouchableOpacity onPress={() => openImageModal(verification.document_back_path)}><Image source={{ uri: verification.document_back_path }} style={styles.verificationImage} resizeMode="contain" onError={(e) => console.error(`Erreur image ${verification.id} (verso):`, e.nativeEvent.error)}/></TouchableOpacity></View>): <View style={styles.imageContainer}><Text style={styles.imageLabel}>Verso Doc: (Absent)</Text></View>}{verification.user_face_path ? (<View style={styles.imageContainer}><Text style={styles.imageLabel}>Visage:</Text><TouchableOpacity onPress={() => openImageModal(verification.user_face_path)}><Image source={{ uri: verification.user_face_path }} style={styles.verificationImage} resizeMode="contain" onError={(e) => console.error(`Erreur image ${verification.id} (visage):`, e.nativeEvent.error)}/></TouchableOpacity></View>): <View style={styles.imageContainer}><Text style={styles.imageLabel}>Visage: (Absent)</Text></View>}</View>
//                                     {verification.status === 'pending' && (<View style={styles.verificationActions}><TouchableOpacity style={[styles.actionButtonSmall, styles.approveButton, (loading || loadingAction) && styles.actionButtonDisabled]} onPress={() => handleVerificationAction(verification.id, 'approve')} disabled={loading || loadingAction} ><CheckCircle2 size={16} color="#ffffff" style={{ marginRight: 4 }}/><Text style={styles.actionButtonText}>Approuver ID</Text></TouchableOpacity><TouchableOpacity style={[styles.actionButtonSmall, styles.rejectButton, (loading || loadingAction) && styles.actionButtonDisabled]} onPress={() => handleVerificationAction(verification.id, 'reject')} disabled={loading || loadingAction} ><XCircle size={16} color="#b91c1c" style={{ marginRight: 4 }}/><Text style={[styles.actionButtonText, styles.rejectButtonText]}>Rejeter ID</Text></TouchableOpacity></View>)}
//                                 </View> );
//                         }} />
//                      )}
//                 </View>
//                 {/* --- Fin Verifications Identité --- */}

//              </ScrollView>

//             {/* --- Modals --- */}
//             {/* Modale Image */}
//             <Modal visible={isImageModalVisible} transparent={true} animationType="fade" onRequestClose={() => setImageModalVisible(false)} >
//                  <SafeAreaView style={styles.imageModalOverlay}>
//                     <TouchableOpacity style={styles.closeButton} onPress={() => setImageModalVisible(false)}><CloseIcon size={24} color="#333" /></TouchableOpacity>
//                     {selectedImageUrl ? (
//                         <Image source={{ uri: selectedImageUrl }} style={styles.fullScreenImage} resizeMode="contain" /> // Utilise le style standard en %
//                     ) : (
//                         <ActivityIndicator color="#ffffff"/> // Indicateur si l'URL n'est pas prête
//                     )}
//                  </SafeAreaView>
//             </Modal>
//              {/* Modale Reset MDP */}
//             <Modal visible={isResetConfirmModalVisible} transparent={true} animationType="fade" onRequestClose={() => !isResettingPassword && setResetConfirmModalVisible(false)} ><View style={styles.customModalOverlay}><View style={styles.customModalContent}><KeyRound size={24} color="#f59e0b" style={{ alignSelf: 'center', marginBottom: 12 }}/><Text style={styles.customModalTitle}>Réinitialiser Mot de Passe</Text><Text style={styles.customModalMessage}>Envoyer lien à <Text style={{ fontFamily: 'Montserrat-SemiBold' }}>{userData?.email || ''}</Text> ?</Text><View style={styles.customModalActions}><TouchableOpacity style={[styles.customModalButton, styles.cancelButton]} onPress={() => setResetConfirmModalVisible(false)} disabled={isResettingPassword}><Text style={styles.cancelButtonText}>Annuler</Text></TouchableOpacity><TouchableOpacity style={[styles.customModalButton, styles.confirmResetButton, isResettingPassword && styles.actionButtonDisabled]} onPress={confirmPasswordReset} disabled={isResettingPassword}>{isResettingPassword ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmResetButtonText}>Confirmer</Text> }</TouchableOpacity></View></View></View></Modal>
//              {/* Modale Delete User */}
//                        <Modal visible={isDeleteUserModalVisible} transparent={true} animationType="fade" onRequestClose={() => !isDeletingUser && setDeleteUserModalVisible(false)} ><View style={styles.customModalOverlay}><View style={styles.customModalContent}><Trash2 size={24} color="#dc2626" style={{ alignSelf: 'center', marginBottom: 12 }}/><Text style={styles.customModalTitle}>Confirmer Suppression</Text><Text style={styles.customModalMessage}>Supprimer <Text style={{ fontFamily: 'Montserrat-SemiBold' }}>{userData?.full_name || userData?.email || 'cet utilisateur'}</Text> ?{'\n\n'}Action irréversible.</Text><View style={styles.customModalActions}><TouchableOpacity style={[styles.customModalButton, styles.cancelButton]} onPress={() => setDeleteUserModalVisible(false)} disabled={isDeletingUser}><Text style={styles.cancelButtonText}>Annuler</Text></TouchableOpacity><TouchableOpacity style={[styles.customModalButton, styles.confirmDeleteButton, isDeletingUser && styles.actionButtonDisabled]} onPress={performDeleteUser} disabled={isDeletingUser}>{isDeletingUser ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.confirmDeleteButtonText}>Supprimer Déf.</Text>}</TouchableOpacity></View></View></View></Modal>

//             {/* --- Fin Modals --- */}

//         </SafeAreaView>
//     );
// }

// // --- Styles ---
// // Assurez-vous que tous les styles nécessaires sont inclus ici
// const styles = StyleSheet.create({
//     // Styles Images (Largeur Fixe Calculée + Hauteur Fixe)
//     imagesSection: { flexDirection: 'column', gap: 20, marginTop: 12, marginBottom: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
//     imageContainer: { width: '100%', alignItems: 'flex-start', marginBottom: 10, },
//     imageLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#475569', marginBottom: 6, alignSelf: 'flex-start', },
//     verificationImage: { width: imageDisplayWidth, height: imageDisplayHeight, resizeMode: 'contain', borderRadius: 8, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', },

//     // Styles Role Requests
//     requestCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e0f2fe' },
//     requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
//     requestInfo: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#374151', flexShrink: 1 },
//     roleText: { fontFamily: 'Montserrat-SemiBold', textTransform: 'capitalize' },
//     dateText: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#6b7280', marginBottom: 12 },
//     requestActions: { flexDirection: 'row', gap: 12, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12, },

//     // Styles Communs (Status, Boutons, etc.)
//     statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, alignSelf: 'flex-start' },
//     statusBadgepending: { backgroundColor: '#fef3c7' }, statusBadgeapproved: { backgroundColor: '#dcfce7' }, statusBadgerejected: { backgroundColor: '#fee2e2' },
//     statusText: { fontFamily: 'Montserrat-SemiBold', fontSize: 12 },
//     statusTextpending: { color: '#b45309' }, statusTextapproved: { color: '#16a34a' }, statusTextrejected: { color: '#dc2626' },
//     actionButtonSmall: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 40, minWidth: 110, borderWidth: 1, borderColor: 'transparent', flexDirection: 'row' },
//     approveButton: { backgroundColor: '#10b981', borderColor: '#059669' },
//     rejectButton: { backgroundColor: '#fee2e2', borderColor: '#fca5a5'},
//     actionButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
//     rejectButtonText: { color: '#b91c1c' },
//     actionButtonDisabled: { opacity: 0.5 },
//     rejectionReason: { backgroundColor: '#fee2e2', padding: 10, borderRadius: 6, marginTop: 8, marginBottom: 12, borderWidth: 1, borderColor: '#fecaca'},
//     rejectionReasonLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#991b1b', marginBottom: 2 },
//     rejectionReasonText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#991b1b' },

//     // Styles pour l'édition de rôles
//     roleDisplayOnly: { backgroundColor: '#e0f2fe', borderColor: '#bae6fd'},
//     roleDisplayText: { color: '#0369a1' },
//     subSectionTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#334155', marginTop: 24, marginBottom: 12, borderTopColor: '#e5e7eb', borderTopWidth: 1, paddingTop: 16 },

//     // Styles Modale Image
//     imageModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center', },
//     fullScreenImage: { width: '95%', height: '80%', }, // Retour aux % pour la modale image (le _FixTest est retiré)
//     closeButton: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 30, right: 15, backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 10, borderRadius: 20, zIndex: 10, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', },
//     // ... (Ajouter ici TOUS les autres styles de votre dernière version fonctionnelle) ...
//     container: { flex: 1, backgroundColor: '#f8fafc' }, loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }, errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#f8fafc'}, errorText: { fontFamily: 'Montserrat-Regular', color: '#b91c1c', fontSize: 16, textAlign: 'center', marginBottom: 15 }, errorTextSmall: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#b91c1c', textAlign: 'center', marginBottom: 10 }, errorBanner: { backgroundColor: '#fee2e2', paddingVertical: 12, paddingHorizontal: 16, marginHorizontal: 16, marginTop: 10, marginBottom: 5, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#fecaca' }, errorBannerText: { color: '#b91c1c', fontFamily: 'Montserrat-Regular', fontSize: 13, flexShrink: 1, marginRight: 10 }, retryIcon: { padding: 4 }, successBanner: { backgroundColor: '#dcfce7', paddingVertical: 10, paddingHorizontal: 16, marginHorizontal: 0, marginTop: 12, borderRadius: 8, borderWidth: 1, borderColor: '#bbf7d0' }, successText: { color: '#15803d', fontFamily: 'Montserrat-SemiBold', fontSize: 13, textAlign: 'center' }, header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? 25 : 15, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }, backButton: { padding: 8, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }, headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', flex: 1, textAlign: 'center', marginHorizontal: 10 }, content: { flex: 1 }, userInfo: { padding: 20, alignItems: 'center', backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', marginBottom: 10 }, avatarLarge: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#e5e7eb', marginBottom: 12 }, avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' }, userEmail: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginBottom: 4 }, userName: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#1e293b', marginBottom: 8, textAlign: 'center' }, locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }, locationText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b' }, section: { padding: 20, backgroundColor: '#ffffff', marginBottom: 10, borderRadius: 8, marginHorizontal: 10 }, sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 16 }, rolesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }, roleOption: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f1f5f9', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb' }, roleOptionSelected: { backgroundColor: '#0891b2', borderColor: '#06b6d4' }, roleOptionText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#475569' }, roleOptionTextSelected: { color: '#ffffff' }, saveButton: { backgroundColor: '#059669', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 }, saveButtonDisabled: { backgroundColor: '#9ca3af', opacity: 0.7 }, saveButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' }, verificationCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' }, verificationHeader: { gap: 6, marginBottom: 12 }, verificationInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, verificationLevel: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#1e293b' }, documentInfo: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', marginTop: 4 }, verificationActions: { flexDirection: 'row', gap: 15, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12, justifyContent: 'center', }, actionButton: { flexDirection: 'row', paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48 }, resetButton: { backgroundColor: '#f59e0b' }, editButton: { backgroundColor: '#3b82f6' }, deleteButton: { backgroundColor: '#ef4444' }, noVerifications: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#6b7280', textAlign: 'center', fontStyle: 'italic', paddingVertical: 20 }, noItemsText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#6b7280', fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 }, buttonLink: { marginTop: 20, paddingVertical: 10 }, buttonLinkText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2', textAlign: 'center' }, customModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }, customModalContent: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, width: '90%', maxWidth: 400, boxShadow: "#000", boxShadow: { width: 0, height: 2 }, boxShadow: 0.25, boxShadow: 4, elevation: 5 }, customModalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1f2937', marginBottom: 12, textAlign: 'center' }, customModalMessage: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#4b5563', textAlign: 'center', marginBottom: 24, lineHeight: 20 }, customModalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 10 }, customModalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, cancelButton: { backgroundColor: '#e5e7eb' }, cancelButtonText: { fontFamily: 'Montserrat-SemiBold', color: '#4b5563' }, confirmResetButton: { backgroundColor: '#f59e0b' }, confirmResetButtonText: { fontFamily: 'Montserrat-SemiBold', color: '#ffffff' }, confirmDeleteButton: { backgroundColor: '#ef4444' }, confirmDeleteButtonText: { fontFamily: 'Montserrat-SemiBold', color: '#ffffff' },
//     // fullScreenImage_FixTest retiré, on utilise fullScreenImage standard
//     fullScreenImage: { width: '95%', height: '80%', backgroundColor: 'black' }, // Fond noir pour mieux voir si image charge pas
// });

// Dans /app/admin/users/[id].tsx (ou le chemin correct pour les détails utilisateur admin)
// VERSION CORRIGÉE avec Modale pour Raison de Rejet

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
    ActivityIndicator, Alert, SafeAreaView, Image, TextInput, Modal,
    Dimensions
} from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import {
    ChevronLeft, Shield, CircleAlert as AlertCircle, BadgeCheck, MapPin, Mail,
    User as UserIcon, KeyRound, RefreshCcw, Trash2, Edit, X as CloseIcon,
    Clock, CheckCircle as CheckCircle2, XCircle
} from 'lucide-react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FlatList } from 'react-native-gesture-handler';

// --- Interfaces ---
interface UserVerification { 
    id: string; 
    level: number; 
    status: 'pending' | 'approved' | 'rejected'; 
    document_type: string; 
    document_number: string; 
    rejection_reason?: string | null; 
    document_front_path: string | null; 
    document_back_path: string | null; 
    user_face_path: string | null;
    created_at: string;
    id_front_url?: string;
    id_back_url?: string;
    selfie_url?: string;
}

interface UserData { 
    id: string; 
    email: string | null; 
    full_name: string | null; 
    city: string | null; 
    roles: string[]; 
    verifications: UserVerification[]; 
    avatar_url?: string | null;
}

interface RoleInfo { 
    id: string; 
    name: string;
    display_name?: string;
}

interface RoleRequest { 
    id: string; 
    user_id: string; 
    requested_role: string;
    role_name?: string;
    status: 'pending' | 'approved' | 'rejected'; 
    created_at: string; 
    rejection_reason?: string | null;
}
// ------------------

// --- Constantes ---
const screenWidth = Dimensions.get('window').width;
const sectionHorizontalPadding = 20 * 2;
const sectionHorizontalMargin = 10 * 2;
const imageDisplayWidth = screenWidth - sectionHorizontalMargin - sectionHorizontalPadding;
const imageDisplayHeight = 200;
const STATUS_COLORS: Record<string, string> = { 
    draft: '#64748b', 
    pending: '#f59e0b', 
    approved: '#10b981', 
    rejected: '#ef4444', 
    deleted: '#9ca3af' 
};
const STATUS_ICONS: { [key: string]: React.ElementType } = { 
    draft: Clock, 
    pending: Clock, 
    approved: BadgeCheck, 
    rejected: XCircle, 
    deleted: Trash2 
};
const STATUS_LABELS: Record<string, string> = { 
    draft: 'Brouillon', 
    pending: 'En attente', 
    approved: 'Approuvée', 
    rejected: 'Rejetée', 
    deleted: 'Supprimée' 
};
// ------------------

export default function UserDetailsScreen() {
    // --- States ---
    const { id: userId } = useLocalSearchParams<{ id: string }>();
    const { user: adminUser, session } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rolesError, setRolesError] = useState<string | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [availableRoles, setAvailableRoles] = useState<RoleInfo[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [isSavingRoles, setIsSavingRoles] = useState(false);
    const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([]);
    const [loadingRoleRequests, setLoadingRoleRequests] = useState(true);
    const [loadingAction, setLoadingAction] = useState(false);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [isResetConfirmModalVisible, setResetConfirmModalVisible] = useState(false);
    const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
    const [isDeletingUser, setIsDeletingUser] = useState(false);
    const [isDeleteUserModalVisible, setDeleteUserModalVisible] = useState(false);
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    // --- NOUVEAUX ÉTATS POUR LA MODALE DE REJET ---
    const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
    const [rejectionReasonInput, setRejectionReasonInput] = useState('');
    // Pour savoir quel élément on rejette (vérification ou demande de rôle)
    const [rejectActionInfo, setRejectActionInfo] = useState<{ type: 'verification' | 'role', id: string } | null>(null);
    // --------------------------------------------

    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // --- Fetch Data ---
    const loadUserDataAndVerifications = useCallback(async () => {
        if (!userId) return;
        setLoading(true); 
        setError(null); 
        console.time('loadUserData');
        
        try {
            const [profileRes, rolesRes, verificationsRes, userRes] = await Promise.all([
                supabase.from('profiles').select('*, avatar_url, intended_role').eq('user_id', userId).maybeSingle(),
                supabase.from('user_roles').select('roles(id, name)').eq('user_id', userId),
                supabase.from('identity_verifications').select('*, id, document_front_path, document_back_path, user_face_path').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.schema('public').from('users').select('email, created_at').eq('id', userId).maybeSingle()
            ]);

            if (profileRes.error && profileRes.error.code !== 'PGRST116') throw profileRes.error;
            if (rolesRes.error) throw rolesRes.error;
            if (verificationsRes.error) throw verificationsRes.error;
            if (userRes.error && userRes.error.code !== 'PGRST116') throw userRes.error;

            let verificationsRaw = (verificationsRes.data || []) as UserVerification[];
            const profile = profileRes.data; 
            const userAuthData = userRes.data; 
            const roles = rolesRes.data || [];
            
            if (!profile && !userAuthData) throw new Error("Profil/user introuvable.");

            console.log('[DEBUG] Données brutes verificationsRes:', JSON.stringify(verificationsRes.data, null, 2));

            let verificationsWithSignedUrls = [...verificationsRaw]; 
            const pathsToSign: string[] = []; 
            const avatarPath = profile?.avatar_url;
            
            verificationsRaw.forEach(verif => { 
                if (verif.document_front_path) pathsToSign.push(verif.document_front_path); 
                if (verif.document_back_path) pathsToSign.push(verif.document_back_path); 
                if (verif.user_face_path) pathsToSign.push(verif.user_face_path); 
            }); 
            
            if (avatarPath && !pathsToSign.includes(avatarPath)) pathsToSign.push(avatarPath);
            
            const uniquePathsToSign = [...new Set(pathsToSign)]; 
            let signedUrlsMap: { [key: string]: string | null } = {}; 
            let signedAvatarUrl: string | null = avatarPath;
            
            if (uniquePathsToSign.length > 0) { 
                const BUCKET_NAME = 'identity-documents'; 
                try { 
                    const { data: resp, error: funcErr } = await supabase.functions.invoke('get-signed-urls', { 
                        body: { bucket: BUCKET_NAME, paths: uniquePathsToSign } 
                    }); 
                    
                    if (funcErr) throw funcErr; 
                    
                    if (resp && resp.signedUrls) { 
                        signedUrlsMap = resp.signedUrls; 
                        if (avatarPath) signedAvatarUrl = signedUrlsMap[avatarPath] || avatarPath; 
                        
                        verificationsWithSignedUrls = verificationsRaw.map(v => ({ 
                            ...v, 
                            document_front_path: v.document_front_path ? (signedUrlsMap[v.document_front_path] || null) : null, 
                            document_back_path: v.document_back_path ? (signedUrlsMap[v.document_back_path] || null) : null, 
                            user_face_path: v.user_face_path ? (signedUrlsMap[v.user_face_path] || null) : null,
                            id_front_url: v.document_front_path ? (signedUrlsMap[v.document_front_path] || null) : null,
                            id_back_url: v.document_back_path ? (signedUrlsMap[v.document_back_path] || null) : null,
                            selfie_url: v.user_face_path ? (signedUrlsMap[v.user_face_path] || null) : null 
                        })); 
                    } 
                } catch (invokeErr) { 
                    console.error("Erreur invoke func:", invokeErr); 
                    setError("Erreur URLs images."); 
                } 
            }

            console.log('[DEBUG] Vérifications finales avant état (verificationsWithSignedUrls):', JSON.stringify(verificationsWithSignedUrls, null, 2));

            const currentRoles = roles.map(r => r.roles?.name).filter(Boolean) as string[];
            setUserData({ 
                id: userId, 
                email: userAuthData?.email || null, 
                full_name: profile?.full_name || null, 
                city: profile?.city || null, 
                roles: currentRoles, 
                verifications: verificationsWithSignedUrls, 
                avatar_url: signedAvatarUrl 
            });
            setSelectedRoles(currentRoles);

        } catch (err: any) { 
            console.error('Erreur loadUserDataAndVerifications:', err); 
            setError(err.message || "Erreur chargement données user/verifs."); 
        } finally { 
            setLoading(false); 
            console.timeEnd('loadUserData'); 
        }
    }, [userId]);

    const loadAvailableRoles = useCallback(async () => { 
        setLoadingRoles(true); 
        setRolesError(null); 
        
        try { 
            console.log("[DEBUG] Fetching available roles..."); 
            const { data, error } = await supabase.from('roles').select('id, name').order('name'); 
            
            if (error) throw error; 
            
            setAvailableRoles(data || []); 
            console.log("[DEBUG] Available roles fetched."); 
        } catch (err: any) { 
            console.error('Error loading available roles:', err); 
            setRolesError(err.message || "Erreur chargement rôles dispo."); 
        } finally { 
            setLoadingRoles(false); 
        } 
    }, []);

    const loadRoleRequests = useCallback(async () => { 
        if (!userId) return; 
        
        setLoadingRoleRequests(true); 
        setError(null); 
        
        try { 
            console.log("[DEBUG] Fetching role requests history..."); 
            const { data, error } = await supabase.from('role_requests')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false }); 
            
            if (error) throw error; 
            
            setRoleRequests(data || []); 
            console.log(`[DEBUG] ${data?.length ?? 0} role request(s) history found.`); 
        } catch (err: any) { 
            console.error('Error loading role requests:', err); 
            setError(err.message || "Erreur chargement demandes rôle."); 
        } finally { 
            setLoadingRoleRequests(false); 
        } 
    }, [userId]);

    // Effet pour charger toutes les données initiales
    useEffect(() => {
        if (userId && fontsLoaded && !fontError) {
            loadUserDataAndVerifications();
            loadAvailableRoles();
            loadRoleRequests();
        } else if (!userId && fontsLoaded) {
            setError("ID utilisateur manquant.");
            setLoading(false);
            setLoadingRoles(false);
            setLoadingRoleRequests(false);
        }
    }, [userId, fontsLoaded, fontError, loadUserDataAndVerifications, loadAvailableRoles, loadRoleRequests]);

    // --- Handlers ---
    const handleRoleToggle = (roleName: string) => {
        setSelectedRoles(current => 
            current.includes(roleName) 
                ? current.filter(r => r !== roleName) 
                : [...current, roleName]
        );
    };

    const handleSaveRoles = useCallback(async () => {
        if (!userId || !userData) return;
        
        setIsSavingRoles(true);
        setRolesError(null);
        
        try {
            const { data: rolesMap, error: rolesError } = await supabase
                .from('roles')
                .select('id, name')
                .in('name', selectedRoles);
                
            if (rolesError) throw rolesError;
            
            const roleIdsToInsert = rolesMap?.map(r => r.id) || [];
            
            await supabase.from('user_roles').delete().eq('user_id', userId);
            
            if (roleIdsToInsert.length > 0) {
                const { error: insertError } = await supabase.from('user_roles').insert(
                    roleIdsToInsert.map(roleId => ({ user_id: userId, role_id: roleId }))
                );
                if (insertError) throw insertError;
            }
            
            Alert.alert("Succès", "Rôles utilisateur mis à jour.");
            setUserData(prev => prev ? {...prev, roles: [...selectedRoles]} : null);
            setSelectedRoles([...selectedRoles]);
        } catch (err: any) {
            console.error('Error updating roles:', err);
            setRolesError(err.message || "Erreur MAJ rôles.");
            Alert.alert("Erreur", err.message || "Impossible MAJ rôles.");
        } finally {
            setIsSavingRoles(false);
        }
    }, [selectedRoles, userId, userData]);

    // --- handleVerificationAction MODIFIÉE pour utiliser la modale ---
    const handleVerificationAction = useCallback(async (verificationId: string, action: 'approve' | 'reject') => {
        if (!userId || !adminUser?.id) return;

        if (action === 'reject') {
            // Ouvre la modale au lieu d'appeler Alert.prompt
            setRejectActionInfo({ type: 'verification', id: verificationId });
            setRejectionReasonInput(''); // Réinitialise le champ
            setIsRejectModalVisible(true);
        } else { // Cas 'approve'
            setLoadingAction(true);
            setError(null);
            console.log(`Approving verification ${verificationId}`);
            try {
                const { error } = await supabase.rpc('approve_verification', { 
                    verification_uuid: verificationId, 
                    admin_uuid: adminUser.id 
                });
                
                if (error) throw error;
                
                Alert.alert("Succès", "Vérification ID approuvée.");
                await loadUserDataAndVerifications();
            } catch (err: any) {
                console.error('Error approving ID verification:', err);
                setError(err.message || `Échec approbation ID.`);
                Alert.alert("Erreur", `Échec approbation ID: ${err.message || 'Erreur'}`);
            } finally {
                setLoadingAction(false);
            }
        }
    }, [userId, adminUser, loadUserDataAndVerifications]);

    // --- handleRoleRequestAction MODIFIÉE pour utiliser la modale ---
    const handleRoleRequestAction = useCallback(async (requestId: string, action: 'approve' | 'reject') => {
        if (!adminUser?.id) return;

        if (action === 'reject') {
            // Ouvre la modale au lieu d'appeler Alert.prompt
            setRejectActionInfo({ type: 'role', id: requestId });
            setRejectionReasonInput('');
            setIsRejectModalVisible(true);
        } else { // Cas 'approve'
            setLoadingAction(true);
            setError(null);
            console.log(`Approving role request ${requestId}`);
            try {
                const { data: rpcResponse, error: rpcError } = await supabase.rpc('approve_role_request', { 
                    request_id: requestId, 
                    admin_id: adminUser.id 
                });
                
                if (rpcError) throw rpcError;
                
                Alert.alert("Succès", `Demande rôle approuvée. ${typeof rpcResponse === 'string' ? rpcResponse : ''}`);
                // Recharger toutes les données car les rôles ont pu changer
                await loadUserDataAndVerifications();
                await loadRoleRequests();
            } catch (err: any) {
                console.error(`Error approving role request:`, err);
                setError(err.message || `Échec approbation demande.`);
                Alert.alert("Erreur", `Échec approbation: ${err.message || 'Erreur'}`);
            } finally {
                setLoadingAction(false);
            }
        }
    }, [adminUser, loadUserDataAndVerifications, loadRoleRequests]);

   const confirmRejectionWithReason = async () => {
    if (!rejectActionInfo || !adminUser?.id) return;
    const reason = rejectionReasonInput.trim() || 'Raison non fournie'; // Raison par défaut
    const { type, id } = rejectActionInfo;
    setIsRejectModalVisible(false); // Ferme la modale
    setLoadingAction(true); // Indique une action en cours
    setError(null);
    try {
        let rpcName = '';
        let params: any = {}; // Initialisez un objet vide

        if (type === 'verification') {
            rpcName = 'reject_verification';
            params = {
                admin_uuid: adminUser.id, // CORRIGÉ: admin_uuid au lieu de admin_id
                reason: reason,
                verification_uuid: id
            };
        } else if (type === 'role') {
            rpcName = 'reject_role_request';
            // Notez que vous devriez vérifier aussi les noms exacts des paramètres pour cette fonction
            params = {
                admin_id: adminUser.id, // Ou peut-être aussi admin_uuid? Vérifiez la définition SQL
                reason: reason,
                request_id: id
            };
        } else {
            throw new Error("Type d'action de rejet inconnu");
        }
        
        console.log(`Calling RPC ${rpcName} with params:`, params);
        const { error } = await supabase.rpc(rpcName, params);
        if (error) throw error;
        
        Alert.alert("Succès", `${type === 'verification' ? 'Vérification ID' : 'Demande rôle'} rejetée.`);
        // Recharger les données après succès
        await loadUserDataAndVerifications(); // Toujours recharger les données user/verifs
        if (type === 'role') await loadRoleRequests(); // Recharger l'historique des rôles si besoin
    } catch (err: any) {
        console.error(`Error rejecting ${type}:`, err);
        setError(err.message || `Échec du rejet.`);
        Alert.alert("Erreur", `Échec du rejet: ${err.message || 'Erreur'}`);
    } finally {
        setLoadingAction(false); // Termine l'action
        setRejectActionInfo(null); // Réinitialise l'info
    }
};
    // --------------------------------------------------------------

    // --- Autres Handlers ---
    const openImageModal = (url: string | null) => { 
        console.log('[DEBUG] openImageModal appelé avec URL:', url); 
        if (url) { 
            setSelectedImageUrl(url); 
            setImageModalVisible(true); 
        } 
    };
    
    const handlePasswordReset = () => { 
        if (!userData?.id || !userData?.email) { 
            Alert.alert("Erreur", "Données utilisateur introuvables."); 
            return; 
        } 
        console.log("Opening password reset modal..."); 
        setResetConfirmModalVisible(true); 
    };
    
    const confirmPasswordReset = async () => { 
        setResetConfirmModalVisible(false); 
        
        if (!userData?.id || !userData?.email) return; 
        
        setIsResettingPassword(true); 
        setError(null); 
        setResetSuccessMessage(null); 
        
        try { 
            const token = session?.access_token; 
            if (!token) throw new Error("Token admin absent."); 
            
            const { error: functionError, data } = await supabase.functions.invoke('bright-action', { 
                body: { targetUserId: userData.id } 
            }); 
            
            if (functionError) { 
                let message = functionError.message; 
                try { 
                    const parsed = JSON.parse(message); 
                    message = parsed.error || message; 
                } catch (e) {} 
                throw new Error(message); 
            } 
            
            console.log("Reset function response:", data); 
            setResetSuccessMessage(data?.message || "Lien envoyé."); 
            setTimeout(() => setResetSuccessMessage(null), 5000); 
        } catch (err: any) { 
            console.error('Error triggering password reset:', err); 
            Alert.alert("Erreur", `Échec envoi: ${err.message}`); 
            setError(`Erreur reset MDP: ${err.message}`); 
        } finally { 
            setIsResettingPassword(false); 
        } 
    };
    
    const handleDeleteUserConfirmation = () => { 
        if (!userData) return; 
        setDeleteUserModalVisible(true); 
    };
    
    const performDeleteUser = async () => { 
        if (!userData?.id) return; 
        
        setDeleteUserModalVisible(false); 
        setIsDeletingUser(true); 
        setError(null); 
        
        try { 
            const token = session?.access_token; 
            if (!token) throw new Error("Token admin absent."); 
            
            const { error: functionError, data } = await supabase.functions.invoke('delete-user-admin', { 
                body: { targetUserId: userData.id } 
            }); 
            
            if (functionError) { 
                let message = functionError.message; 
                try { 
                    const parsed = JSON.parse(message); 
                    message = parsed.error || message; 
                } catch (e) {} 
                throw new Error(message); 
            } 
            
            console.log("Delete function response:", data); 
            Alert.alert("Succès", data?.message || `Utilisateur supprimé.`); 
            router.replace('/admin/users'); 
        } catch (err: any) { 
            console.error('Error deleting user:', err); 
            Alert.alert("Erreur", `Échec suppression: ${err.message}`); 
            setError(`Erreur suppression: ${err.message}`); 
        } finally { 
            setIsDeletingUser(false); 
        } 
    };
    // ---------------------------------

    // --- Rendu ---
    if (!fontsLoaded) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
            </SafeAreaView>
        );
    }
    
    if (fontError) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <Text style={styles.errorText}>Erreur polices.</Text>
            </SafeAreaView>
        );
    }
    
    if (loading || !userData) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
            </SafeAreaView>
        );
    }
    
    if (!userData) return null;

    // Log pour l'état avant rendu des rôles
    console.log(`[DEBUG Render] loading: ${loading}, loadingRoles: ${loadingRoles}, userData.roles:`, userData?.roles);

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: userData.full_name || userData.email || 'Détail Utilisateur' }} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ChevronLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {userData.full_name || 'Détail Utilisateur'}
                </Text>
                <View style={{width: 40}} />
            </View>
            
            {/* Error Banner */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{error}</Text>
                    <TouchableOpacity 
                        onPress={() => { 
                            setError(null); 
                            loadUserDataAndVerifications(); 
                            loadAvailableRoles(); 
                            loadRoleRequests(); 
                        }} 
                        style={styles.retryIcon}
                    >
                        <RefreshCcw size={18} color="#b91c1c" />
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* User Info */}
                <Animated.View entering={FadeIn.delay(100)} style={styles.userInfo}>
                    {userData.avatar_url ? (
                        <Image 
                            source={{uri: userData.avatar_url}} 
                            style={styles.avatarLarge} 
                            onError={(e) => console.log("Erreur avatar:", e.nativeEvent.error)} 
                        />
                    ) : (
                        <View style={[styles.avatarLarge, styles.avatarPlaceholder]}>
                            <UserIcon size={40} color="#9ca3af" />
                        </View>
                    )}
                    <Text style={styles.userName}>{userData.full_name || '(Nom non renseigné)'}</Text>
                    <Text style={styles.userEmail}>{userData.email || '(Email non trouvé)'}</Text>
                    {userData.city && (
                        <View style={styles.locationRow}>
                            <MapPin size={16} color="#64748b" />
                            <Text style={styles.locationText}>{userData.city}</Text>
                        </View>
                    )}
                </Animated.View>

                {/* Section Rôles */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rôles Utilisateur</Text>
                    {rolesError && <Text style={styles.errorTextSmall}>{rolesError}</Text>}

                    {/* Affichage Rôles Actuels */}
                    <Text style={styles.subSectionTitle}>Rôles Actuels :</Text>
                    <View style={styles.rolesGrid}>
                        {userData.roles.length > 0 ? userData.roles.map(role => (
                            <View key={role} style={[styles.roleOption, styles.roleDisplayOnly]}>
                                <Shield size={20} color='#0369a1' />
                                <Text style={[styles.roleOptionText, styles.roleDisplayText]}>{role}</Text>
                            </View>
                        )) : <Text style={styles.noItemsText}>Aucun rôle assigné.</Text>}
                    </View>

                    {/* Modification des Rôles */}
                    <Text style={styles.subSectionTitle}>Modifier les Rôles :</Text>
                    {loadingRoles ? <ActivityIndicator color="#0891b2" style={{height: 40}}/> : (
                        <>
                            <View style={styles.rolesGrid}>
                                {availableRoles.map(role => (
                                    <TouchableOpacity 
                                        key={role.id} 
                                        style={[ 
                                            styles.roleOption, 
                                            selectedRoles.includes(role.name) ? styles.roleOptionSelected : null 
                                        ]} 
                                        onPress={() => handleRoleToggle(role.name)} 
                                        disabled={isSavingRoles}
                                    >
                                        <Shield 
                                            size={20} 
                                            color={selectedRoles.includes(role.name) ? '#ffffff' : '#64748b'} 
                                        />
                                        <Text 
                                            style={[ 
                                                styles.roleOptionText, 
                                                selectedRoles.includes(role.name) ? styles.roleOptionTextSelected : null 
                                            ]}
                                        >
                                            {role.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                {availableRoles.length === 0 && (
                                    <Text style={styles.noItemsText}>Aucun rôle disponible.</Text>
                                )}
                            </View>
                            <TouchableOpacity 
                                style={[
                                    styles.saveButton, 
                                    (isSavingRoles || loadingRoles) && styles.saveButtonDisabled
                                ]} 
                                onPress={handleSaveRoles} 
                                disabled={isSavingRoles || loadingRoles}
                            >
                                {isSavingRoles ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Enregistrer Rôles</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                {/* Section Actions Administrateur */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions Administrateur</Text>
                    <TouchableOpacity 
                        style={[
                            styles.actionButton, 
                            styles.resetButton, 
                            (isResettingPassword || loadingAction) && styles.actionButtonDisabled
                        ]} 
                        onPress={handlePasswordReset} 
                        disabled={isResettingPassword || loadingAction}
                    >
                        {isResettingPassword ? (
                            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8}} />
                        ) : (
                            <KeyRound size={18} color="#ffffff" style={{ marginRight: 8}} />
                        )}
                        <Text style={styles.actionButtonText}>Réinitialiser Mot de Passe</Text>
                    </TouchableOpacity>
                    
                    {resetSuccessMessage && (
                        <View style={styles.successBanner}>
                            <Text style={styles.successText}>{resetSuccessMessage}</Text>
                        </View>
                    )}
                    
                    <TouchableOpacity 
                        style={[
                            styles.actionButton, 
                            styles.editButton, 
                            {marginTop: 10}, 
                            loadingAction && styles.actionButtonDisabled
                        ]} 
                        disabled={loadingAction} 
                        onPress={() => router.push(`/admin/users/edit/${userId}`)}
                    >
                        <Edit size={18} color="#ffffff" style={{ marginRight: 8}} />
                        <Text style={styles.actionButtonText}>Modifier Profil/Infos</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[
                            styles.actionButton, 
                            styles.deleteButton, 
                            {marginTop: 10}, 
                            (isDeletingUser || loadingAction) && styles.actionButtonDisabled
                        ]} 
                        onPress={handleDeleteUserConfirmation} 
                        disabled={isDeletingUser || loadingAction}
                    >
                        {isDeletingUser ? (
                            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8}} />
                        ) : (
                            <Trash2 size={18} color="#ffffff" style={{ marginRight: 8}} />
                        )}
                        <Text style={styles.actionButtonText}>Supprimer Utilisateur</Text>
                    </TouchableOpacity>
                </View>

                {/* Section Demandes de Changement de Rôle */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Historique Demandes de Rôle</Text>
                    {loadingRoleRequests ? (
                        <ActivityIndicator color="#0891b2" style={{marginTop: 15}} />
                    ) : roleRequests.length === 0 ? (
                        <Text style={styles.noItemsText}>Aucune demande de changement de rôle.</Text>
                    ) : (
                        <FlatList
                            data={roleRequests}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                            renderItem={({ item: request }) => {
                                const ReqIcon = STATUS_ICONS[request.status] || AlertCircle;
                                const reqIconColor = STATUS_COLORS[request.status] || '#64748b';
                                const reqBadgeBgColor = `${reqIconColor}1A`;
                                const reqStatusLabel = STATUS_LABELS[request.status] || request.status;
                                const roleName = request.role_name || request.requested_role;
                                
                                return (
                                    <View key={request.id} style={styles.requestCard}>
                                        <View style={styles.requestHeader}>
                                            <Text style={styles.requestInfo}>
                                                Demande rôle: <Text style={styles.roleText}>{roleName}</Text>
                                            </Text>
                                            <View style={[styles.statusBadge, { backgroundColor: reqBadgeBgColor }]}>
                                                <ReqIcon size={14} color={reqIconColor} style={{ marginRight: 4 }}/>
                                                <Text style={[styles.statusText, { color: reqIconColor }]}>
                                                    {reqStatusLabel}
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        <Text style={styles.dateText}>
                                            Demandé le: {new Date(request.created_at).toLocaleDateString('fr-FR', { 
                                                day: '2-digit', 
                                                month: 'short', 
                                                year: 'numeric' 
                                            })}
                                        </Text>
                                        
                                        {(request.status === 'rejected') && request.rejection_reason && (
                                            <View style={styles.rejectionReason}>
                                                <Text style={styles.rejectionReasonLabel}>Motif Rejet:</Text>
                                                <Text style={styles.rejectionReasonText}>{request.rejection_reason}</Text>
                                            </View>
                                        )}
                                        
                                        {request.status === 'pending' && (
                                            <View style={styles.requestActions}>
                                                <TouchableOpacity 
                                                    style={[
                                                        styles.actionButtonSmall, 
                                                        styles.approveButton, 
                                                        loadingAction && styles.actionButtonDisabled
                                                    ]} 
                                                    onPress={() => handleRoleRequestAction(request.id, 'approve')} 
                                                    disabled={loadingAction}
                                                >
                                                    <CheckCircle2 size={16} color="#ffffff" style={{ marginRight: 4 }}/>
                                                    <Text style={styles.actionButtonText}>Approuver</Text>
                                                </TouchableOpacity>
                                                
                                                <TouchableOpacity 
                                                    style={[
                                                        styles.actionButtonSmall, 
                                                        styles.rejectButton, 
                                                        loadingAction && styles.actionButtonDisabled
                                                    ]} 
                                                    onPress={() => handleRoleRequestAction(request.id, 'reject')} 
                                                    disabled={loadingAction}
                                                >
                                                    <XCircle size={16} color="#b91c1c" style={{ marginRight: 4 }}/>
                                                    <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
                                                        Rejeter
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                );
                            }}
                        />
                    )}
                </View>

                {/* Section Vérifications Identité */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Historique Vérifications Identité</Text>
                    {userData.verifications.length === 0 && !loading ? (
                        <Text style={styles.noVerifications}>Aucune demande de vérification.</Text>
                    ) : (
                        <FlatList
                            data={userData.verifications}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                            renderItem={({ item: verification }) => {
                                const VerifIcon = STATUS_ICONS[verification.status] || AlertCircle;
                                const verifIconColor = STATUS_COLORS[verification.status] || '#64748b';
                                const verifBadgeBgColor = `${verifIconColor}1A`;
                                const verifStatusLabel = STATUS_LABELS[verification.status] || verification.status;
                                
                                return (
                                    <View key={verification.id} style={styles.verificationCard}>
                                        <View style={styles.verificationHeader}>
                                            <View style={styles.verificationInfo}>
                                                <Text style={styles.verificationLevel}>Niveau {verification.level}</Text>
                                                <View style={[styles.statusBadge, { backgroundColor: verifBadgeBgColor }]}>
                                                    <VerifIcon size={14} color={verifIconColor} style={{marginRight:4}} />
                                                    <Text style={[styles.statusText, { color: verifIconColor }]}>
                                                        {verifStatusLabel}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={styles.documentInfo}>
                                                {verification.document_type} - {verification.document_number || 'N/A'}
                                            </Text>
                                        </View>
                                        
                                        {verification.status === 'rejected' && verification.rejection_reason && (
                                            <View style={styles.rejectionReason}>
                                                <Text style={styles.rejectionReasonLabel}>Raison Rejet:</Text>
                                                <Text style={styles.rejectionReasonText}>
                                                    {verification.rejection_reason}
                                                </Text>
                                            </View>
                                        )}
                                        
                                        <View style={styles.imagesSection}>
                                            {verification.document_front_path || verification.id_front_url ? (
                                                <View style={styles.imageContainer}>
                                                    <Text style={styles.imageLabel}>Recto Doc:</Text>
                                                    <TouchableOpacity onPress={() => openImageModal(
                                                        verification.id_front_url || verification.document_front_path
                                                    )}>
                                                        <Image 
                                                            source={{ 
                                                                uri: verification.id_front_url || verification.document_front_path 
                                                            }} 
                                                            style={styles.verificationImage} 
                                                            resizeMode="contain" 
                                                            onError={(e) => console.error(
                                                                `Erreur image ${verification.id} (recto):`, 
                                                                e.nativeEvent.error
                                                            )}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <View style={styles.imageContainer}>
                                                    <Text style={styles.imageLabel}>Recto Doc: (Absent)</Text>
                                                </View>
                                            )}
                                            
                                            {verification.document_back_path || verification.id_back_url ? (
                                                <View style={styles.imageContainer}>
                                                    <Text style={styles.imageLabel}>Verso Doc:</Text>
                                                    <TouchableOpacity onPress={() => openImageModal(
                                                        verification.id_back_url || verification.document_back_path
                                                    )}>
                                                        <Image 
                                                            source={{ 
                                                                uri: verification.id_back_url || verification.document_back_path 
                                                            }} 
                                                            style={styles.verificationImage} 
                                                            resizeMode="contain" 
                                                            onError={(e) => console.error(
                                                                `Erreur image ${verification.id} (verso):`, 
                                                                e.nativeEvent.error
                                                            )}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <View style={styles.imageContainer}>
                                                    <Text style={styles.imageLabel}>Verso Doc: (Absent)</Text>
                                                </View>
                                            )}
                                            
                                            {verification.user_face_path || verification.selfie_url ? (
                                                <View style={styles.imageContainer}>
                                                    <Text style={styles.imageLabel}>Visage:</Text>
                                                    <TouchableOpacity onPress={() => openImageModal(
                                                        verification.selfie_url || verification.user_face_path
                                                    )}>
                                                        <Image 
                                                            source={{ 
                                                                uri: verification.selfie_url || verification.user_face_path 
                                                            }} 
                                                            style={styles.verificationImage} 
                                                            resizeMode="contain" 
                                                            onError={(e) => console.error(
                                                                `Erreur image ${verification.id} (visage):`, 
                                                                e.nativeEvent.error
                                                            )}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <View style={styles.imageContainer}>
                                                    <Text style={styles.imageLabel}>Visage: (Absent)</Text>
                                                </View>
                                            )}
                                        </View>
                                        
                                        {verification.status === 'pending' && (
                                            <View style={styles.verificationActions}>
                                                <TouchableOpacity 
                                                    style={[
                                                        styles.actionButtonSmall, 
                                                        styles.approveButton, 
                                                        (loading || loadingAction) && styles.actionButtonDisabled
                                                    ]} 
                                                    onPress={() => handleVerificationAction(verification.id, 'approve')} 
                                                    disabled={loading || loadingAction}
                                                >
                                                    <CheckCircle2 size={16} color="#ffffff" style={{ marginRight: 4 }}/>
                                                    <Text style={styles.actionButtonText}>Approuver ID</Text>
                                                </TouchableOpacity>
                                                
                                                <TouchableOpacity 
                                                    style={[
                                                        styles.actionButtonSmall, 
                                                        styles.rejectButton, 
                                                        (loading || loadingAction) && styles.actionButtonDisabled
                                                    ]} 
                                                    onPress={() => handleVerificationAction(verification.id, 'reject')} 
                                                    disabled={loading || loadingAction}
                                                >
                                                    <XCircle size={16} color="#b91c1c" style={{ marginRight: 4 }}/>
                                                    <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
                                                        Rejeter ID
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                );
                            }}
                        />
                    )}
                </View>
            </ScrollView>

            {/* --- Modals --- */}
            {/* Modale Image */}
            <Modal
                visible={isImageModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setImageModalVisible(false)}
            >
                <SafeAreaView style={styles.imageModalOverlay}>
                    <TouchableOpacity 
                        style={styles.closeButton} 
                        onPress={() => setImageModalVisible(false)}
                    >
                        <CloseIcon size={24} color="#333" />
                    </TouchableOpacity>
                    {selectedImageUrl ? (
                        <Image 
                            source={{ uri: selectedImageUrl }} 
                            style={styles.fullScreenImage} 
                            resizeMode="contain" 
                        />
                    ) : (
                        <ActivityIndicator color="#ffffff"/>
                    )}
                </SafeAreaView>
            </Modal>
            
            {/* Modale Reset MDP */}
            <Modal
                visible={isResetConfirmModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => !isResettingPassword && setResetConfirmModalVisible(false)}
            >
                <View style={styles.customModalOverlay}>
                    <View style={styles.customModalContent}>
                        <KeyRound size={24} color="#f59e0b" style={{ alignSelf: 'center', marginBottom: 12 }}/>
                        <Text style={styles.customModalTitle}>Réinitialiser Mot de Passe</Text>
                        <Text style={styles.customModalMessage}>
                            Envoyer lien à <Text style={{ fontFamily: 'Montserrat-SemiBold' }}>
                                {userData?.email || ''}
                            </Text> ?
                        </Text>
                        <View style={styles.customModalActions}>
                            <TouchableOpacity 
                                style={[styles.customModalButton, styles.cancelButton]} 
                                onPress={() => setResetConfirmModalVisible(false)} 
                                disabled={isResettingPassword}
                            >
                                <Text style={styles.cancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[
                                    styles.customModalButton, 
                                    styles.confirmResetButton, 
                                    isResettingPassword && styles.actionButtonDisabled
                                ]} 
                                onPress={confirmPasswordReset} 
                                disabled={isResettingPassword}
                            >
                                {isResettingPassword ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.confirmResetButtonText}>Confirmer</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            
            {/* Modale Delete User */}
            <Modal
                visible={isDeleteUserModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => !isDeletingUser && setDeleteUserModalVisible(false)}
            >
                <View style={styles.customModalOverlay}>
                    <View style={styles.customModalContent}>
                        <Trash2 size={24} color="#dc2626" style={{ alignSelf: 'center', marginBottom: 12 }}/>
                        <Text style={styles.customModalTitle}>Confirmer Suppression</Text>
                        <Text style={styles.customModalMessage}>
                            Supprimer <Text style={{ fontFamily: 'Montserrat-SemiBold' }}>
                                {userData?.full_name || userData?.email || 'cet utilisateur'}
                            </Text> ?{'\n\n'}Action irréversible.
                        </Text>
                        <View style={styles.customModalActions}>
                            <TouchableOpacity 
                                style={[styles.customModalButton, styles.cancelButton]} 
                                onPress={() => setDeleteUserModalVisible(false)} 
                                disabled={isDeletingUser}
                            >
                                <Text style={styles.cancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[
                                    styles.customModalButton, 
                                    styles.confirmDeleteButton, 
                                    isDeletingUser && styles.actionButtonDisabled
                                ]} 
                                onPress={performDeleteUser} 
                                disabled={isDeletingUser}
                            >
                                {isDeletingUser ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.confirmDeleteButtonText}>Supprimer Déf.</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- AJOUT : Modale pour Raison Rejet --- */}
            <Modal
                visible={isRejectModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => !loadingAction && setIsRejectModalVisible(false)}
            >
                <View style={styles.customModalOverlay}>
                    <View style={styles.customModalContent}>
                        <XCircle size={24} color="#ef4444" style={{ alignSelf: 'center', marginBottom: 12 }}/>
                        <Text style={styles.customModalTitle}>Motif du Rejet</Text>
                        <Text style={styles.customModalMessage}>
                            Veuillez indiquer la raison du rejet pour {rejectActionInfo?.type === 'verification' ? 'la vérification' : 'la demande de rôle'} (optionnel mais recommandé).
                        </Text>
                        <TextInput
                            style={styles.reasonInput}
                            placeholder="Raison du rejet..."
                            value={rejectionReasonInput}
                            onChangeText={setRejectionReasonInput}
                            multiline
                            placeholderTextColor="#9ca3af"
                        />
                        <View style={styles.customModalActions}>
                            <TouchableOpacity
                                style={[styles.customModalButton, styles.cancelButton]}
                                onPress={() => setIsRejectModalVisible(false)}
                                disabled={loadingAction}
                            >
                                <Text style={styles.cancelButtonText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.customModalButton,
                                    styles.confirmRejectButton,
                                    loadingAction && styles.actionButtonDisabled
                                ]}
                                onPress={confirmRejectionWithReason}
                                disabled={loadingAction}
                            >
                                {loadingAction ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.confirmRejectButtonText}>Confirmer Rejet</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {/* --- Fin Modale Raison Rejet --- */}
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f8fafc' 
    },
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#f8fafc' 
    },
    errorContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 30, 
        backgroundColor: '#f8fafc'
    },
    errorText: { 
        fontFamily: 'Montserrat-Regular', 
        color: '#b91c1c', 
        fontSize: 16, 
        textAlign: 'center', 
        marginBottom: 15 
    },
    errorTextSmall: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 13, 
        color: '#b91c1c', 
        textAlign: 'center', 
        marginBottom: 10 
    },
    errorBanner: { 
        backgroundColor: '#fee2e2', 
        paddingVertical: 12, 
        paddingHorizontal: 16, 
        marginHorizontal: 16, 
        marginTop: 10, 
        marginBottom: 5, 
        borderRadius: 8, 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#fecaca' 
    },
    errorBannerText: { 
        color: '#b91c1c', 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 13, 
        flexShrink: 1, 
        marginRight: 10 
    },
    retryIcon: { 
        padding: 4 
    },
    successBanner: { 
        backgroundColor: '#dcfce7', 
        paddingVertical: 10, 
        paddingHorizontal: 16, 
        marginHorizontal: 0, 
        marginTop: 12, 
        borderRadius: 8, 
        borderWidth: 1, 
        borderColor: '#bbf7d0' 
    },
    successText: { 
        color: '#15803d', 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 13, 
        textAlign: 'center' 
    },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        paddingTop: Platform.OS === 'android' ? 25 : 15, 
        backgroundColor: '#ffffff', 
        borderBottomWidth: 1, 
        borderBottomColor: '#e5e7eb' 
    },
    backButton: { 
        padding: 8, 
        width: 40, 
        height: 40, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    headerTitle: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 18, 
        color: '#1e293b', 
        flex: 1, 
        textAlign: 'center', 
        marginHorizontal: 10 
    },
    content: { 
        flex: 1 
    },
    userInfo: { 
        padding: 20, 
        alignItems: 'center', 
        backgroundColor: '#ffffff', 
        borderBottomWidth: 1, 
        borderBottomColor: '#f1f5f9', 
        marginBottom: 10 
    },
    avatarLarge: { 
        width: 90, 
        height: 90, 
        borderRadius: 45, 
        backgroundColor: '#e5e7eb', 
        marginBottom: 12 
    },
    avatarPlaceholder: { 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    userEmail: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 14, 
        color: '#64748b', 
        marginBottom: 4 
    },
    userName: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 24, 
        color: '#1e293b', 
        marginBottom: 8, 
        textAlign: 'center' 
    },
    locationRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 4, 
        marginTop: 4 
    },
    locationText: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 14, 
        color: '#64748b' 
    },
    section: { 
        padding: 20, 
        backgroundColor: '#ffffff', 
        marginBottom: 10, 
        borderRadius: 8, 
        marginHorizontal: 10 
    },
    sectionTitle: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 18, 
        color: '#1e293b', 
        marginBottom: 16 
    },
    rolesGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 10, 
        marginBottom: 20 
    },
    roleOption: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 8, 
        backgroundColor: '#f1f5f9', 
        paddingVertical: 8, 
        paddingHorizontal: 12, 
        borderRadius: 20, 
        borderWidth: 1, 
        borderColor: '#e5e7eb' 
    },
    roleOptionSelected: { 
        backgroundColor: '#0891b2', 
        borderColor: '#06b6d4' 
    },
    roleOptionText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 14, 
        color: '#475569' 
    },
    roleOptionTextSelected: { 
        color: '#ffffff' 
    },
    saveButton: { 
        backgroundColor: '#059669', 
        paddingVertical: 14, 
        borderRadius: 10, 
        alignItems: 'center', 
        marginTop: 10 
    },
    saveButtonDisabled: { 
        backgroundColor: '#9ca3af', 
        opacity: 0.7 
    },
    saveButtonText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 16, 
        color: '#ffffff' 
    },
    verificationCard: { 
        backgroundColor: '#ffffff', 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 16, 
        borderWidth: 1, 
        borderColor: '#e5e7eb', 
        overflow: 'hidden' 
    },
    verificationHeader: { 
        gap: 6, 
        marginBottom: 12 
    },
    verificationInfo: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
    },
    verificationLevel: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 16, 
        color: '#1e293b' 
    },
    documentInfo: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 14, 
        color: '#64748b', 
        marginTop: 4 
    },
    verificationActions: { 
        flexDirection: 'row', 
        gap: 15, 
        marginTop: 12, 
        borderTopWidth: 1, 
        borderTopColor: '#f1f5f9', 
        paddingTop: 12, 
        justifyContent: 'center'
    },
    actionButton: { 
        flexDirection: 'row', 
        paddingVertical: 12, 
        borderRadius: 10, 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 8, 
        minHeight: 48 
    },
    resetButton: { 
        backgroundColor: '#f59e0b' 
    },
    editButton: { 
        backgroundColor: '#3b82f6' 
    },
    deleteButton: { 
        backgroundColor: '#ef4444' 
    },
    noVerifications: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 14, 
        color: '#6b7280', 
        textAlign: 'center', 
        fontStyle: 'italic', 
        paddingVertical: 20 
    },
    noItemsText: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 14, 
        color: '#6b7280', 
        fontStyle: 'italic', 
        textAlign: 'center', 
        paddingVertical: 10 
    },
    buttonLink: { 
        marginTop: 20, 
        paddingVertical: 10 
    },
    buttonLinkText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 16, 
        color: '#0891b2', 
        textAlign: 'center' 
    },
    customModalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    customModalContent: { 
        backgroundColor: '#ffffff', 
        borderRadius: 16, 
        padding: 24, 
        width: '90%', 
        maxWidth: 400, 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 4, 
        elevation: 5 
    },
    customModalTitle: { 
        fontFamily: 'Montserrat-Bold', 
        fontSize: 18, 
        color: '#1f2937', 
        marginBottom: 12, 
        textAlign: 'center' 
    },
    customModalMessage: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 14, 
        color: '#4b5563', 
        textAlign: 'center', 
        marginBottom: 24, 
        lineHeight: 20 
    },
    customModalActions: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        gap: 12, 
        marginTop: 10 
    },
    customModalButton: { 
        flex: 1, 
        paddingVertical: 12, 
        borderRadius: 8, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    cancelButton: { 
        backgroundColor: '#e5e7eb' 
    },
    cancelButtonText: { 
        fontFamily: 'Montserrat-SemiBold', 
        color: '#4b5563' 
    },
    confirmResetButton: { 
        backgroundColor: '#f59e0b' 
    },
    confirmResetButtonText: { 
        fontFamily: 'Montserrat-SemiBold', 
        color: '#ffffff' 
    },
    confirmDeleteButton: { 
        backgroundColor: '#ef4444' 
    },
    confirmDeleteButtonText: { 
        fontFamily: 'Montserrat-SemiBold', 
        color: '#ffffff' 
    },
    
    // --- STYLES POUR LA MODALE DE REJET ---
    reasonInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 20,
        color: '#1f293b',
    },
    confirmRejectButton: {
        backgroundColor: '#ef4444',
    },
    confirmRejectButtonText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 16,
        color: '#ffffff',
    },
    
    // --- Styles Images ---
    imagesSection: { 
        flexDirection: 'column', 
        gap: 20, 
        marginTop: 12, 
        marginBottom: 12, 
        borderTopWidth: 1, 
        borderTopColor: '#f1f5f9', 
        paddingTop: 16 
    },
    imageContainer: { 
        width: '100%', 
        alignItems: 'flex-start', 
        marginBottom: 10
    },
    imageLabel: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 13, 
        color: '#475569', 
        marginBottom: 6, 
        alignSelf: 'flex-start'
    },
    verificationImage: { 
        width: imageDisplayWidth, 
        height: imageDisplayHeight, 
        resizeMode: 'contain', 
        borderRadius: 8, 
        backgroundColor: '#f3f4f6', 
        borderWidth: 1, 
        borderColor: '#e5e7eb'
    },
    
    // --- Styles Role Requests ---
    requestCard: { 
        backgroundColor: '#ffffff', 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 16, 
        borderWidth: 1, 
        borderColor: '#e0f2fe' 
    },
    requestHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 8, 
        gap: 8 
    },
    requestInfo: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 14, 
        color: '#374151', 
        flexShrink: 1 
    },
    roleText: { 
        fontFamily: 'Montserrat-SemiBold', 
        textTransform: 'capitalize' 
    },
    dateText: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 12, 
        color: '#6b7280', 
        marginBottom: 12 
    },
    requestActions: { 
        flexDirection: 'row', 
        gap: 12, 
        marginTop: 12, 
        borderTopWidth: 1, 
        borderTopColor: '#f1f5f9', 
        paddingTop: 12
    },
    
    // --- Styles Communs (Status, Boutons, etc.) ---
    statusBadge: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 4, 
        paddingVertical: 4, 
        paddingHorizontal: 10, 
        borderRadius: 12, 
        alignSelf: 'flex-start' 
    },
    statusText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 12 
    },
    actionButtonSmall: { 
        paddingVertical: 10, 
        paddingHorizontal: 16, 
        borderRadius: 8, 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 6, 
        minHeight: 40, 
        minWidth: 110, 
        borderWidth: 1, 
        borderColor: 'transparent', 
        flexDirection: 'row' 
    },
    approveButton: { 
        backgroundColor: '#10b981', 
        borderColor: '#059669' 
    },
    rejectButton: { 
        backgroundColor: '#fee2e2', 
        borderColor: '#fca5a5'
    },
    actionButtonText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 14, 
        color: '#ffffff' 
    },
    rejectButtonText: { 
        color: '#b91c1c' 
    },
    actionButtonDisabled: { 
        opacity: 0.5 
    },
    rejectionReason: { 
        backgroundColor: '#fee2e2', 
        padding: 10, 
        borderRadius: 6, 
        marginTop: 8, 
        marginBottom: 12, 
        borderWidth: 1, 
        borderColor: '#fecaca'
    },
    rejectionReasonLabel: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 13, 
        color: '#991b1b', 
        marginBottom: 2 
    },
    rejectionReasonText: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 13, 
        color: '#991b1b' 
    },
    
    // --- Styles pour l'édition de rôles ---
    roleDisplayOnly: { 
        backgroundColor: '#e0f2fe', 
        borderColor: '#bae6fd'
    },
    roleDisplayText: { 
        color: '#0369a1' 
    },
    subSectionTitle: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 16, 
        color: '#334155', 
        marginTop: 24, 
        marginBottom: 12, 
        borderTopColor: '#e5e7eb', 
        borderTopWidth: 1, 
        paddingTop: 16 
    },
    
    // --- Styles Modale Image ---
    imageModalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0, 0, 0, 0.85)', 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    fullScreenImage: { 
        width: '95%', 
        height: '80%', 
        backgroundColor: 'black' 
    },
    closeButton: { 
        position: 'absolute', 
        top: Platform.OS === 'ios' ? 60 : 30, 
        right: 15, 
        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
        padding: 10, 
        borderRadius: 20, 
        zIndex: 10, 
        width: 40, 
        height: 40, 
        justifyContent: 'center', 
        alignItems: 'center'
    }
});