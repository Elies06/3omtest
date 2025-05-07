// Dans app/admin/roles.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
    ActivityIndicator, Alert, SafeAreaView, TextInput, ScrollView, Platform
} from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase'; // Vérifiez chemin
import { useAuth } from '@/hooks/useAuth'; // Vérifiez chemin
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { Edit, X as XIcon, CheckSquare, Square, PlusCircle } from 'lucide-react-native';

// Interfaces
interface Permission {
    id: string;
    name: string;
    description: string | null;
}

interface RoleWithPermissions {
    id: string;
    name: string;
    description: string | null;
    role_permissions: { permission_id: string }[]; // Supabase retourne un tableau d'objets
}

interface EditingRole {
    id: string;
    name: string;
    currentPermissionIds: Set<string>; // IDs initiaux
}

export default function RolesPermissionsScreen() {
    const { user: adminUser } = useAuth(); // Pour vérifier les droits admin si besoin plus tard
    const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // États pour l'ajout de rôle
    const [newRoleName, setNewRoleName] = useState('');
    const [isAddingRole, setIsAddingRole] = useState(false);

    // États pour la modale d'édition
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRole, setEditingRole] = useState<EditingRole | null>(null);
    const [tempPermissionIds, setTempPermissionIds] = useState<Set<string>>(new Set());
    const [isSavingPermissions, setIsSavingPermissions] = useState(false);

    const [fontsLoaded, fontError] = useFonts({ /* ... */ });

    // Fonctions de Fetch
    const fetchRoles = useCallback(async () => {
        console.log("🚀 Fetching roles with permissions...");
        const { data, error: fetchError } = await supabase
            .from('roles')
            // Sélectionner le rôle et les IDs des permissions liées via la table jointe
            .select('id, name, description, role_permissions ( permission_id )')
            .order('name', { ascending: true });

        if (fetchError) throw fetchError;
        console.log(`✅ Found ${data?.length || 0} roles.`);
        setRoles(data || []);
    }, []);

    const fetchPermissions = useCallback(async () => {
        console.log("🚀 Fetching all permissions...");
        const { data, error: fetchError } = await supabase
            .from('permissions')
            .select('id, name, description')
            .order('name', { ascending: true });

        if (fetchError) throw fetchError;
        console.log(`✅ Found ${data?.length || 0} permissions.`);
        setPermissions(data || []);
    }, []);

    // Chargement initial
    const loadData = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            await Promise.all([fetchRoles(), fetchPermissions()]);
        } catch (err: any) {
            console.error("Error loading roles/permissions:", err);
            setError(err.message || "Erreur lors du chargement des données.");
        } finally {
            setLoading(false);
        }
    }, [fetchRoles, fetchPermissions]);

    useEffect(() => {
        if (fontsLoaded && !fontError) {
            loadData();
        }
    }, [loadData, fontsLoaded, fontError]);

    // Fonctions pour la Modale
    const openEditModal = (role: RoleWithPermissions) => {
        const currentIds = new Set(role.role_permissions.map(rp => rp.permission_id));
        setEditingRole({ id: role.id, name: role.name, currentPermissionIds: currentIds });
        setTempPermissionIds(new Set(currentIds)); // Initialiser les permissions temporaires
        setIsModalVisible(true);
    };

    const closeEditModal = () => {
        setIsModalVisible(false);
        setEditingRole(null);
        setTempPermissionIds(new Set());
    };

    const handlePermissionToggle = (permissionId: string) => {
        setTempPermissionIds(currentIds => {
            const newIds = new Set(currentIds);
            if (newIds.has(permissionId)) {
                newIds.delete(permissionId);
            } else {
                newIds.add(permissionId);
            }
            return newIds;
        });
    };

    const savePermissions = async () => {
        if (!editingRole) return;
        setIsSavingPermissions(true); setError(null); // Utiliser un état de sauvegarde spécifique à la modale

        const permissionIdsArray = Array.from(tempPermissionIds);
        console.log(`💾 Saving permissions for role ${editingRole.id}:`, permissionIdsArray);

        try {
            // Appel de la fonction RPC pour synchroniser les permissions
            const { error: rpcError } = await supabase.rpc(
                'set_role_permissions', // Assurez-vous que le nom est correct
                {
                    p_role_id: editingRole.id,
                    p_permission_ids: permissionIdsArray
                }
            );

            if (rpcError) throw rpcError;

            console.log("✅ Permissions updated successfully.");
            Alert.alert("Succès", `Permissions pour le rôle "${editingRole.name}" mises à jour.`);
            closeEditModal();
            fetchRoles(); // Recharger les rôles pour voir les changements (ou maj locale)

        } catch (err: any) {
            console.error("Error saving permissions:", err);
            Alert.alert("Erreur", `Sauvegarde échouée: ${err.message || 'Erreur inconnue'}`);
            setError(`Erreur sauvegarde permissions: ${err.message}`); // Afficher l'erreur dans la modale ? Ou globalement ?
        } finally {
            setIsSavingPermissions(false);
        }
    };

    // Fonction pour Ajouter un Rôle
    const handleAddNewRole = async () => {
        const name = newRoleName.trim();
        if (!name) {
            Alert.alert("Erreur", "Veuillez entrer un nom pour le nouveau rôle.");
            return;
        }
        setIsAddingRole(true); setError(null);
        try {
            const { error: insertError } = await supabase
                .from('roles')
                .insert({ name: name }) // Ajoute juste le nom pour l'instant
                .select()
                .single(); // Pour vérifier l'insertion

            if (insertError) {
                 // Gérer l'erreur de nom unique
                 if (insertError.code === '23505') { // Code pour violation unique
                    throw new Error(`Le rôle "${name}" existe déjà.`);
                 }
                throw insertError;
            }

            Alert.alert("Succès", `Rôle "${name}" ajouté. Vous pouvez maintenant éditer ses permissions.`);
            setNewRoleName(''); // Vider le champ
            fetchRoles(); // Recharger la liste des rôles

        } catch (err: any) {
            console.error("Error adding new role:", err);
            Alert.alert("Erreur", `Ajout échoué: ${err.message || 'Erreur inconnue'}`);
            setError(`Erreur ajout rôle: ${err.message}`);
        } finally {
            setIsAddingRole(false);
        }
    };


    // --- Rendu ---
    if (loading || !fontsLoaded) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
    if (fontError) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur chargement polices.</Text></SafeAreaView>; }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Rôles & Permissions' }} />

            {/* Affichage Erreur Générale */}
             {error && !isModalVisible && ( // N'afficher que si la modale n'est pas visible pour éviter superposition
                <View style={styles.errorBanner}><Text style={styles.errorBannerText}>{error}</Text></View>
             )}

            {/* Section Ajout Rôle */}
             <View style={styles.addRoleContainer}>
                <TextInput
                    style={styles.addRoleInput}
                    placeholder="Nom du nouveau rôle"
                    value={newRoleName}
                    onChangeText={setNewRoleName}
                    editable={!isAddingRole}
                    placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity
                    style={[styles.addRoleButton, isAddingRole && styles.addRoleButtonDisabled]}
                    onPress={handleAddNewRole}
                    disabled={isAddingRole || !newRoleName.trim()}
                >
                    {isAddingRole ? <ActivityIndicator size="small" color="#fff" /> : <PlusCircle size={20} color="#fff" />}
                    <Text style={styles.addRoleButtonText}>Ajouter</Text>
                </TouchableOpacity>
             </View>


            {/* Liste des Rôles */}
            <FlatList
                data={roles}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.roleItem}>
                        <View style={styles.roleInfo}>
                            <Text style={styles.roleName}>{item.name}</Text>
                            <Text style={styles.roleDescription}>{item.description || 'Pas de description'}</Text>
                            <Text style={styles.rolePermissionCount}>
                                {item.role_permissions?.length || 0} permission(s) associée(s)
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => openEditModal(item)}
                        >
                            <Edit size={20} color="#0891b2" />
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Aucun rôle défini.</Text>}
                contentContainerStyle={styles.listContainer}
            />

            {/* === MODALE POUR ÉDITER LES PERMISSIONS === */}
            {editingRole && (
                <Modal
                    visible={isModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={closeEditModal}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Permissions pour "{editingRole.name}"</Text>
                                <TouchableOpacity style={styles.closeButton} onPress={closeEditModal}>
                                    <XIcon size={24} color="#1e293b" />
                                </TouchableOpacity>
                            </View>

                            {/* Afficher erreur spécifique à la sauvegarde ici ? */}
                             {error && isModalVisible && (
                                <Text style={[styles.errorText, {fontSize: 13, marginBottom: 10}]}>{error}</Text>
                             )}

                            {/* Liste scrollable des permissions */}
                            <ScrollView style={styles.modalScroll}>
                                {permissions.length > 0 ? permissions.map((perm) => {
                                    const isSelected = tempPermissionIds.has(perm.id);
                                    return (
                                        <TouchableOpacity
                                            key={perm.id}
                                            style={styles.permissionRow}
                                            onPress={() => handlePermissionToggle(perm.id)}
                                            disabled={isSavingPermissions}
                                        >
                                            {isSelected ? (
                                                <CheckSquare size={22} color="#0891b2" />
                                            ) : (
                                                <Square size={22} color="#6b7280" />
                                            )}
                                            <View style={styles.permissionTextContainer}>
                                                <Text style={[styles.permissionName, isSelected && styles.permissionNameSelected]}>{perm.name}</Text>
                                                 {perm.description && <Text style={styles.permissionDescription}>{perm.description}</Text>}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }) : <Text>Aucune permission définie dans le système.</Text>}
                            </ScrollView>

                            {/* Footer Modale */}
                            <View style={styles.modalFooter}>
                                <TouchableOpacity style={styles.resetButton} onPress={closeEditModal} disabled={isSavingPermissions}>
                                    <Text style={styles.resetButtonText}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.applyButton, isSavingPermissions && styles.applyButtonDisabled]} onPress={savePermissions} disabled={isSavingPermissions}>
                                    {isSavingPermissions ? <ActivityIndicator color="#fff" /> : <Text style={styles.applyButtonText}>Sauvegarder</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            {/* === FIN MODALE === */}

        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
     container: { flex: 1, backgroundColor: '#f8fafc' }, // Fond légèrement différent
     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
     errorText: { fontFamily: 'Montserrat-Regular', color: '#b91c1c', fontSize: 16, textAlign: 'center', padding: 20 },
     errorBanner: { backgroundColor: '#fee2e2', paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#fecaca'},
     errorBannerText: { color: '#b91c1c', fontFamily: 'Montserrat-Regular', textAlign: 'center', fontSize: 13 },
     addRoleContainer: {
        flexDirection: 'row',
        padding: 16,
        paddingBottom: 10, // Moins d'espace en bas
        gap: 10,
        backgroundColor: '#fff', // Fond blanc pour se détacher
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
     },
     addRoleInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
        height: 44, // Hauteur fixe
     },
     addRoleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#059669', // Vert
        paddingHorizontal: 15,
        borderRadius: 8,
        height: 44,
        gap: 6,
        justifyContent: 'center',
     },
     addRoleButtonDisabled: { backgroundColor: '#9ca3af' },
     addRoleButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
     },
     listContainer: { padding: 16, flexGrow: 1 },
     roleItem: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#e5e7eb',
     },
     roleInfo: { flex: 1, marginRight: 10 },
     roleName: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#111827', marginBottom: 2 },
     roleDescription: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#6b7280', marginBottom: 4 },
     rolePermissionCount: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
     editButton: { padding: 8 }, // Zone de clic plus grande
     emptyText: { textAlign: 'center', marginTop: 40, fontFamily: 'Montserrat-Regular', color: '#6b7280' },

     // Styles Modale
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: Platform.OS === 'ios' ? 40 : 30, maxHeight: '90%', minHeight: 300 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', flexShrink: 1, marginRight: 10 },
    closeButton: { padding: 8 },
    modalScroll: { flex: 1, marginTop: 16 },
    permissionRow: { flexDirection: 'row', alignItems: 'flex-start', /* Aligner en haut */ gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    permissionTextContainer: { flex: 1 }, // Pour que le texte prenne l'espace
    permissionName: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#374151' },
    permissionNameSelected: { fontFamily: 'Montserrat-SemiBold', color: '#111827' },
    permissionDescription: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#6b7280', marginTop: 2 },
    modalFooter: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 10 },
    resetButton: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    resetButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#475569' },
    applyButton: { flex: 2, paddingVertical: 12, borderRadius: 10, backgroundColor: '#0891b2', alignItems: 'center', justifyContent: 'center' },
    applyButtonDisabled: { backgroundColor: '#9ca3af' },
    applyButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
});