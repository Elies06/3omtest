// Dans PROJECT/app/admin/verifications/index.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  Text, 
  View, 
  Image, 
  ActivityIndicator, 
  Alert, 
  RefreshControl 
} from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  RefreshCcw, 
  UserCircle, 
  BadgeCheck, 
  AlertCircle 
} from 'lucide-react-native';
import { StyleSheet } from 'react-native';

// Interface pour les vérifications avec données utilisateur
interface VerificationWithUserRPC {
    id: string; // verification id
    user_id: string;
    status: 'pending' | 'approved' | 'rejected';
    document_type: string | null;
    document_number: string | null;
    rejection_reason?: string | null;
    created_at: string;
    // Champs joints
    user_full_name: string | null;
    user_avatar_url: string | null;
}

type VerificationStatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

// Constantes de Statut
const STATUS_COLORS: Record<string, string> = { 
  pending: '#f59e0b', 
  approved: '#10b981', 
  rejected: '#ef4444', 
  default: '#64748b' 
};

const STATUS_ICONS: { [key: string]: React.ElementType } = { 
  pending: Clock, 
  approved: BadgeCheck, 
  rejected: XCircle, 
  default: ShieldAlert 
};

const STATUS_LABELS: Record<string, string> = { 
  pending: 'En Attente', 
  approved: 'Approuvée', 
  rejected: 'Rejetée', 
  default: 'Inconnu' 
};

// Structure pour faciliter l'accès aux informations de statut
const STATUS_UI = {
  pending: { label: STATUS_LABELS.pending, color: STATUS_COLORS.pending, Icon: STATUS_ICONS.pending },
  approved: { label: STATUS_LABELS.approved, color: STATUS_COLORS.approved, Icon: STATUS_ICONS.approved },
  rejected: { label: STATUS_LABELS.rejected, color: STATUS_COLORS.rejected, Icon: STATUS_ICONS.rejected },
  default: { label: STATUS_LABELS.default, color: STATUS_COLORS.default, Icon: STATUS_ICONS.default }
};

export default function AdminVerificationScreen() {
    const { user: adminUser, isLoading: isLoadingAuth } = useAuth();
    const [verifications, setVerifications] = useState<VerificationWithUserRPC[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState<VerificationStatusFilter>('pending');
    const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

    // Chargement des Vérifications via RPC
    const loadVerifications = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        setError(null);
        const statusToFilter = filterStatus === 'all' ? null : filterStatus;
        console.log(`🚀 Calling RPC get_admin_verifications with filter: ${statusToFilter ?? 'all'}`);

        try {
            // Appel à la fonction RPC
            const { data, error: rpcError } = await supabase.rpc('get_admin_verifications', {
                filter_status: statusToFilter
            });

            if (rpcError) throw rpcError;

            console.log(`✅ Found ${data?.length || 0} verifications via RPC.`);
            setVerifications((data as VerificationWithUserRPC[]) || []);

        } catch (err: any) {
            console.error('Error loading verifications via RPC:', err);
            if (err.message.includes('permission denied')) { 
              setError("Erreur: Permission refusée pour exécuter la fonction RPC."); 
            }
            else if (err.message.includes('does not exist')) { 
              setError("Erreur: La fonction RPC est introuvable."); 
            }
            else { 
              setError(err.message || "Erreur chargement des vérifications."); 
            }
            setVerifications([]);
        } finally {
            if (!isRefresh) setLoading(false);
            setRefreshing(false);
        }
    }, [filterStatus]);

    // Effet pour charger les données
    useEffect(() => { 
      if (!isLoadingAuth && adminUser) { 
        loadVerifications(); 
      } else if (!isLoadingAuth && !adminUser) { 
        setLoading(false); 
        setError("Accès Admin requis."); 
      } 
    }, [isLoadingAuth, adminUser, loadVerifications]);

    // Rafraîchissement
    const onRefresh = useCallback(() => { 
      setRefreshing(true); 
      loadVerifications(true); 
    }, [loadVerifications]);

    // Actions Admin (approve/reject)
    const handleVerificationAction = useCallback(async (verificationId: string, action: 'approve' | 'reject') => {
        if (!adminUser?.id) return;
        
        setLoadingActionId(verificationId);
        
        let rejectionReason = null;
        if (action === 'reject') {
          // Demander la raison du rejet
          Alert.prompt(
            "Raison du rejet",
            "Veuillez indiquer la raison du rejet de cette vérification",
            async (reason) => {
              if (!reason?.trim()) {
                Alert.alert("Erreur", "Une raison est requise pour rejeter une vérification");
                setLoadingActionId(null);
                return;
              }
              
              rejectionReason = reason.trim();
              try {
                const { error } = await supabase.rpc(`${action}_verification`, {
                  verification_id: verificationId,
                  admin_id: adminUser.id,
                  rejection_reason: rejectionReason
                });
                
                if (error) throw error;
                
                // Succès
                Alert.alert(
                  action === 'approve' ? "Vérification approuvée" : "Vérification rejetée",
                  action === 'approve' ? "La vérification a été approuvée avec succès" : `La vérification a été rejetée avec la raison: "${rejectionReason}"`
                );
                
                // Recharger les données
                loadVerifications();
              } catch (err: any) {
                Alert.alert("Erreur", `Erreur lors de l'action: ${err.message}`);
              } finally {
                setLoadingActionId(null);
              }
            },
            "plain-text"
          );
        } else {
          // Pour l'approbation, pas besoin de raison
          try {
            const { error } = await supabase.rpc(`${action}_verification`, {
              verification_id: verificationId,
              admin_id: adminUser.id
            });
            
            if (error) throw error;
            
            // Succès
            Alert.alert(
              "Vérification approuvée",
              "La vérification a été approuvée avec succès"
            );
            
            // Recharger les données
            loadVerifications();
          } catch (err: any) {
            Alert.alert("Erreur", `Erreur lors de l'action: ${err.message}`);
          } finally {
            setLoadingActionId(null);
          }
        }
    }, [adminUser?.id, loadVerifications]);

    // Rendu d'un élément de la liste
    const renderVerificationItem = ({ item }: { item: VerificationWithUserRPC }) => {
        const statusInfo = STATUS_UI[item.status] || STATUS_UI.default;
        const isLoadingItemAction = loadingActionId === item.id;
        const defaultAvatar = 'https://ui-avatars.com/api/?name=?&background=random';

        const formattedDate = item.created_at 
          ? format(new Date(item.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })
          : 'Date inconnue';

        return (
            <View style={styles.itemContainer}>
                {/* Infos Utilisateur */}
                <View style={styles.userInfo}>
                    <Image source={{ uri: item.user_avatar_url || defaultAvatar }} style={styles.avatar} />
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{item.user_full_name || 'Utilisateur Inconnu'}</Text>
                        <Text style={styles.userId}>ID: {item.user_id}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => router.push(`/admin/users/${item.user_id}`)} 
                      style={styles.viewProfileButton}
                    >
                      <UserCircle size={16} color="#0891b2"/>
                    </TouchableOpacity>
                </View>
                
                {/* Détails de vérification */}
                <View style={styles.gridDetails}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Statut:</Text>
                        <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
                            {React.createElement(statusInfo.Icon, { size: 14, color: statusInfo.color })}
                            <Text style={[styles.statusText, { color: statusInfo.color }]}>
                                {statusInfo.label}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Date:</Text>
                        <Text style={styles.detailValue}>{formattedDate}</Text>
                    </View>
                    {item.document_type && (
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Type:</Text>
                            <Text style={styles.detailValue}>{item.document_type}</Text>
                        </View>
                    )}
                    {item.document_number && (
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>N°:</Text>
                            <Text style={styles.detailValue}>{item.document_number}</Text>
                        </View>
                    )}
                </View>
                
                {/* Raison du rejet si applicable */}
                {item.status === 'rejected' && item.rejection_reason && (
                    <View style={styles.rejectionReason}>
                        <Text style={styles.rejectionReasonLabel}>Raison du rejet:</Text>
                        <Text style={styles.rejectionReasonText}>{item.rejection_reason}</Text>
                    </View>
                )}
                
                {/* Note pour les images (à implémenter) */}
                <Text style={styles.imagesNote}>
                    Documentation disponible dans l'interface détaillée
                </Text>
                
                {/* Boutons d'action pour les vérifications en attente */}
                {item.status === 'pending' && (
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.rejectButton, isLoadingItemAction && styles.actionButtonDisabled]}
                            onPress={() => handleVerificationAction(item.id, 'reject')}
                            disabled={isLoadingItemAction}
                        >
                            {isLoadingItemAction ? (
                                <ActivityIndicator size="small" color="#b91c1c" />
                            ) : (
                                <>
                                    <XCircle size={14} color="#b91c1c" />
                                    <Text style={styles.rejectButtonText}>Rejeter</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[styles.actionButton, styles.approveButton, isLoadingItemAction && styles.actionButtonDisabled]}
                            onPress={() => handleVerificationAction(item.id, 'approve')}
                            disabled={isLoadingItemAction}
                        >
                            {isLoadingItemAction ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <>
                                    <CheckCircle2 size={14} color="#ffffff" />
                                    <Text style={styles.actionButtonText}>Approuver</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    // Rendu Principal
    if (isLoadingAuth) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
            </SafeAreaView>
        );
    }

    if (!adminUser) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Accès Admin requis.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Gestion Vérifications KYC' }} />
            
            {/* Barre de Filtres */}
            <View style={styles.filterBar}>
                {(['pending', 'approved', 'rejected', 'all'] as VerificationStatusFilter[]).map(status => (
                    <TouchableOpacity 
                        key={status} 
                        style={[
                            styles.filterButton, 
                            filterStatus === status && styles.filterButtonActive
                        ]} 
                        onPress={() => setFilterStatus(status)}
                    >
                        <Text 
                            style={[
                                styles.filterButtonText, 
                                filterStatus === status && styles.filterButtonTextActive
                            ]}
                        >
                            {status === 'all' ? 'Tout' : STATUS_LABELS[status] || status}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            {/* Affichage d'erreur */}
            {error && !loading && (
                <View style={styles.errorContainer}>
                    <AlertCircle size={30} color="#dc2626" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => loadVerifications()}
                    >
                        <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            )}
            
            {/* Liste des vérifications */}
            {!error && (
                <FlatList
                    data={verifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderVerificationItem}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#0891b2']}
                            tintColor="#0891b2"
                        />
                    }
                    ListEmptyComponent={
                        loading ? (
                            <View style={styles.emptyContainer}>
                                <ActivityIndicator size="large" color="#0891b2" />
                            </View>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <ShieldAlert size={40} color="#9ca3af" />
                                <Text style={styles.emptyText}>
                                    Aucune vérification {filterStatus !== 'all' ? STATUS_LABELS[filterStatus] : ''} trouvée
                                </Text>
                            </View>
                        )
                    }
                />
            )}
        </SafeAreaView>
    );
}

// Styles
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 },
    retryButton: { backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10 },
    retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
    // Filtres
    filterBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, paddingHorizontal: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    filterButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16 },
    filterButtonActive: { backgroundColor: '#e0f2fe' },
    filterButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#374151' },
    filterButtonTextActive: { color: '#0c4a6e' },
    // Liste
    listContainer: { flexGrow: 1, padding: 10 },
    itemContainer: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e5e7eb' },
    userDetails: { flex: 1 },
    userName: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1f2937' },
    userId: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#6b7280' },
    viewProfileButton: { padding: 6 },
    // Détails en grille
    gridDetails: { flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    detailItem: { flexDirection: 'row', alignItems: 'center', width: '48%', marginBottom: 6 },
    detailLabel: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#6b7280', marginRight: 4 },
    detailValue: { fontFamily: 'Montserrat-Medium', fontSize: 13, color: '#374151', flexShrink: 1 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10, },
    statusText: { fontFamily: 'Montserrat-SemiBold', fontSize: 11, textTransform: 'capitalize' },
    rejectionReason: { backgroundColor: '#fee2e2', padding: 8, borderRadius: 6, marginTop: 8, borderWidth: 1, borderColor: '#fecaca'},
    rejectionReasonLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: '#991b1b', marginBottom: 2 },
    rejectionReasonText: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#991b1b' },
    imagesNote: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', marginVertical: 10},
    actionsContainer: { flexDirection: 'row', gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 12, justifyContent: 'flex-end' },
    actionButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 38, borderWidth: 1, borderColor: 'transparent', flexDirection: 'row' },
    approveButton: { backgroundColor: '#10b981', borderColor: '#059669' },
    rejectButton: { backgroundColor: '#fee2e2', borderColor: '#fca5a5'},
    viewUserButton: { backgroundColor: '#e5e7eb', borderColor: '#d1d5db', paddingHorizontal: 8},
    actionButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#ffffff' },
    rejectButtonText: { color: '#b91c1c' },
    viewUserButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#4b5563'},
    actionButtonDisabled: { opacity: 0.6 },
    emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30, marginTop: 50 },
    emptyText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#9ca3af', marginTop: 16, textAlign: 'center' },
});