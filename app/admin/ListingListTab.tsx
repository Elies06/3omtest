
// // // Dans app/admin/ListingListTab.tsx 
// // import React, { useState, useEffect, useCallback } from 'react';
// // import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, RefreshControl, Platform } from 'react-native';
// // import { router } from 'expo-router';
// // import { supabase } from '@/lib/supabase'; // Vérifiez chemin
// // import { useAuth } from '@/hooks/useAuth'; // Vérifiez chemin
// // import {
// //     RefreshCcw, Check, X as XIcon,
// //     DollarSign, Users, Square, // Icônes pour la liste
// //     // Importer toutes les icônes d'équipements possibles définies dans iconMap
// //     Wifi, Car, Umbrella, Waves, Thermometer, ShowerHead, Bath, Flame, Warehouse, Grill
// // } from 'lucide-react-native';
// // import { format } from 'date-fns';
// // import { fr } from 'date-fns/locale';

// // // Map iconMap (Doit être cohérent avec les autres fichiers ou importé d'un lieu unique)
// // const iconMap: { [key: string]: React.ElementType } = { Wifi: Wifi, Car: Car, Umbrella: Umbrella, Waves: Waves, Thermometer: Thermometer, ShowerHead: ShowerHead, Bath: Bath, Flame: Flame, Warehouse: Warehouse, Grill: Grill };

// // // Interface pour les données reçues et formatées de la RPC
// // interface ManagedListing {
// //     id: string; title: string; created_at: string; owner_id: string; status: string;
// //     description?: string | null; location?: string | null; price_per_hour?: number | null; capacity?: number | null;
// //     approved_at?: string | null; approved_by?: string | null; rejected_at?: string | null; rejected_by?: string | null; rejection_reason?: string | null;
// //     profiles: { full_name: string | null } | null; // Via profile_full_name
// //     pool_images: { url: string; position: number }[] | null; // Via pool_images JSONB
// //     pool_amenities: { id: string; name: string; icon_name: string | null }[] | null; // Via pool_amenities JSONB
// // }

// // // Props attendues par le composant (avec TOUS les filtres)
// // interface ListingListTabProps {
// //     status: 'pending' | 'approved' | 'rejected';
// //     searchTerm?: string;
// //     selectedCity?: string | null;
// //     startDate?: Date | null;
// //     endDate?: Date | null;
// //     minPrice?: number | null; // <-- Filtre Prix Min
// //     maxPrice?: number | null; // <-- Filtre Prix Max
// //     selectedAmenityIdsFilter?: string[]; // <-- Filtre Équipements (tableau d'UUIDs)
// // }

// // export default function ListingListTab({ status, searchTerm, selectedCity, startDate, endDate, minPrice, maxPrice, selectedAmenityIdsFilter }: ListingListTabProps) {
// //     const { user: adminUser } = useAuth();
// //     const [listings, setListings] = useState<ManagedListing[]>([]);
// //     const [loading, setLoading] = useState(true);
// //     const [actionLoading, setActionLoading] = useState<string | null>(null);
// //     const [error, setError] = useState<string | null>(null);
// //     const [refreshing, setRefreshing] = useState(false);

// //     // Fonction pour charger les annonces via RPC (avec TOUS les filtres)
// //     const fetchListings = useCallback(async () => {
// //         if (!refreshing) setLoading(true);
// //         setError(null);

// //         // Préparer les paramètres pour la RPC
// //         const rpcParams = {
// //             p_search_text: searchTerm || '',
// //             p_status: status,
// //             p_city: selectedCity,
// //             p_start_date: startDate?.toISOString() || null,
// //             p_end_date: endDate?.toISOString() || null,
// //             p_min_price: minPrice,
// //             p_max_price: maxPrice,
// //             // Passer null si le tableau est vide pour correspondre au DEFAULT NULL du SQL
// //             p_amenity_ids: selectedAmenityIdsFilter && selectedAmenityIdsFilter.length > 0 ? selectedAmenityIdsFilter : null
// //         };

// //         try {
// //             console.log(`🚀 Calling RPC search_listings_admin with params:`, rpcParams);

// //             const { data, error: rpcError } = await supabase.rpc('search_listings_admin', rpcParams);

// //             if (rpcError) throw rpcError;

// //             console.log(`✅ RPC returned ${data?.length || 0} listings for status ${status}.`);

// //             // Formatage des données reçues (important pour correspondre à l'interface ManagedListing)
// //             const formattedData = (data || []).map((item: any) => ({ // Utiliser any ici car le retour RPC est moins typé par défaut
// //                 id: item.id,
// //                 title: item.title,
// //                 created_at: item.created_at,
// //                 owner_id: item.owner_id,
// //                 status: item.status,
// //                 description: item.description,
// //                 location: item.location,
// //                 price_per_hour: item.price_per_hour,
// //                 capacity: item.capacity,
// //                 approved_at: item.approved_at,
// //                 approved_by: item.approved_by,
// //                 rejected_at: item.rejected_at,
// //                 rejected_by: item.rejected_by,
// //                 rejection_reason: item.rejection_reason,
// //                 profiles: { full_name: item.profile_full_name || null },
// //                 pool_images: item.pool_images as { url: string; position: number }[] | null,
// //                 pool_amenities: item.pool_amenities as { id: string; name: string; icon_name: string | null }[] | null
// //             }));
// //             setListings(formattedData);

// //         } catch (err: any) {
// //              console.error(`Error calling RPC for ${status} listings:`, err);
// //              if (err.details) console.error("Supabase Error Details:", err.details);
// //              setError(err.message || `Erreur chargement via RPC (${status}).`);
// //              setListings([]);
// //         } finally {
// //             setLoading(false);
// //             setRefreshing(false);
// //         }
// //     // Inclure TOUS les filtres dans les dépendances
// //     }, [status, refreshing, searchTerm, selectedCity, startDate, endDate, minPrice, maxPrice, selectedAmenityIdsFilter]);

// //     // useEffect pour charger les données
// //     useEffect(() => { fetchListings(); }, [fetchListings]);

// //     // Fonctions d'action (Approve/Reject)
// //     // const handleApprove = async (listingId: string) => { if (!adminUser) return; setActionLoading(listingId); try { const { error } = await supabase.rpc('approve_listing', { listing_id: listingId, admin_id: adminUser.id }); if (error) throw error; Alert.alert("Succès", "Approuvée !"); fetchListings(); } catch (err: any) { console.error("Error approving:", err); Alert.alert("Erreur", `Échec approbation: ${err.message}`); } finally { setActionLoading(null); } };
// //     // const handleReject = (listingId: string) => { if (!adminUser) return; if (Platform.OS !== 'web') { Alert.prompt( "Motif", "Raison rejet (Optionnel)", [ { text: "Annuler", style: "cancel" }, { text: "Rejeter", onPress: async (reason) => { if (reason !== undefined) { await performReject(listingId, reason || null); } } }, ] ); } else { const reason = prompt("Motif rejet (optionnel) :"); if (reason !== null) { performReject(listingId, reason || null); } } };
// //     // const performReject = async (listingId: string, reason: string | null) => { setActionLoading(listingId); try { const { error } = await supabase.rpc('reject_listing', { listing_id: listingId, admin_id: adminUser!.id, reason: reason }); if (error) throw error; Alert.alert("Succès", "Rejetée."); fetchListings(); } catch (err: any) { console.error("Error rejecting:", err); Alert.alert("Erreur", `Échec rejet: ${err.message}`); } finally { setActionLoading(null); } };
// //   const handleApprove = async (listingId) => {
// //   if (!adminUser) return;
// //   setActionLoading(listingId);
  
// //   try {
// //     const { error } = await supabase.rpc('approve_listing', {
// //       admin_id: adminUser.id,     // ✅ Ajouté
// //       listing_id: listingId       // ✅ UUID valide
// //     });
    
// //     if (error) throw error;
// //     Alert.alert("Succès", "Annonce approuvée !");
// //     fetchListings();
// //   } catch (err) {
// //     console.error("Erreur lors de l'approbation:", err);
// //     Alert.alert("Erreur", `Échec d'approbation: ${err.message}`);
// //   } finally {
// //     setActionLoading(null);
// //   }
// // };
// //   const performReject = async (listingId, reason) => {
// //   setActionLoading(listingId);
  
// //   try {
// //     const { error } = await supabase.rpc('reject_listing', {
// //       admin_id: adminUser.id,     // ✅ Ajouté
// //       listing_id: listingId,      // ✅ UUID valide
// //       reason: reason              // ✅ Motif optionnel
// //     });
    
// //     if (error) throw error;
// //     Alert.alert("Succès", "Annonce rejetée.");
// //     fetchListings();
// //   } catch (err) {
// //     console.error("Erreur lors du rejet:", err);
// //     Alert.alert("Erreur", `Échec du rejet: ${err.message}`);
// //   } finally {
// //     setActionLoading(null);
// //   }
// // };

// //     // Fonction de Navigation
// //     const handleNavigateToDetail = (listingId: string) => { router.push(`/admin/listing-detail/${listingId}`); };

// //     // Rendu d'un élément (avec les infos ajoutées)
// //     const renderItem = ({ item }: { item: ManagedListing }) => {
// //         const isLoadingAction = actionLoading === item.id;
// //         const imageUrl = item.pool_images?.[0]?.url || 'https://placehold.co/80x80?text=Pool';

// //         return (
// //             <View style={styles.listItem}>
// //                 <TouchableOpacity style={styles.itemClickableArea} onPress={() => handleNavigateToDetail(item.id)} disabled={isLoadingAction} >
// //                     <Image source={{ uri: imageUrl }} style={styles.itemImage} />
// //                     <View style={styles.itemContent}>
// //                         <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
// //                         <Text style={styles.itemOwner}>Par: {item.profiles?.full_name || 'ID: ' + item.owner_id.substring(0, 6)}</Text>
// //                         {/* Ligne Prix & Capacité */}
// //                         <View style={styles.itemPriceCapacityRow}>
// //                              {item.price_per_hour != null && ( <View style={styles.itemDetailChip}> <DollarSign size={12} color="#374151" /><Text style={styles.itemDetailChipText}>{item.price_per_hour} MAD/h</Text> </View> )}
// //                              {item.capacity != null && ( <View style={styles.itemDetailChip}> <Users size={12} color="#374151" /><Text style={styles.itemDetailChipText}>{item.capacity} pers.</Text> </View> )}
// //                         </View>
// //                         {/* Ligne Icônes Équipements */}
// //                         {item.pool_amenities && item.pool_amenities.length > 0 && (
// //                              <View style={styles.itemAmenitiesRow}>
// //                                 {item.pool_amenities.slice(0, 3).map(amenity => { if (!amenity) return null; const IconComponent = amenity.icon_name && iconMap[amenity.icon_name] ? iconMap[amenity.icon_name] : Square; return ( <View key={amenity.id} style={styles.amenityIconWrapper} ><IconComponent size={16} color={IconComponent === Square ? "#9ca3af" : "#0891b2"} strokeWidth={1.5} /></View> ); })}
// //                                 {item.pool_amenities.length > 3 && <Text style={styles.moreAmenitiesText}>...</Text>}
// //                              </View>
// //                         )}
// //                          {/* Affichage date/raison */}
// //                          {status === 'pending' && <Text style={styles.itemDate}>Soumis le: {new Date(item.created_at).toLocaleDateString()}</Text>}
// //                          {status === 'approved' && item.approved_at && <Text style={styles.itemDate}>Approuvé le: {new Date(item.approved_at).toLocaleDateString()}</Text>}
// //                          {status === 'rejected' && item.rejected_at && <Text style={styles.itemDate}>Rejeté le: {new Date(item.rejected_at).toLocaleDateString()}</Text>}
// //                          {status === 'rejected' && item.rejection_reason && <Text style={styles.itemReason} numberOfLines={1}>Motif: {item.rejection_reason}</Text>}
// //                     </View>
// //                 </TouchableOpacity>
// //                 {/* Boutons d'action */}
// //                 {status === 'pending' && ( <View style={styles.itemActions}> {isLoadingAction ? ( <ActivityIndicator color="#0891b2" style={styles.actionSpinner} /> ) : ( <> <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => handleApprove(item.id)} disabled={isLoadingAction}> <Check size={18} color="#ffffff" /> </TouchableOpacity> <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleReject(item.id)} disabled={isLoadingAction}> <XIcon size={18} color="#ffffff" /> </TouchableOpacity> </> )} </View> )}
// //             </View>
// //         );
// //     };

// //     // --- Rendu Principal du Composant ---
// //      if (loading && listings.length === 0) { return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></View>; }
// //      if (error) { return ( <View style={styles.errorContainer}> <Text style={styles.errorText}>{error}</Text> <TouchableOpacity onPress={()=>fetchListings()} style={styles.retryButton}> <RefreshCcw size={16} color="#ffffff" /> <Text style={styles.retryButtonText}>Réessayer</Text> </TouchableOpacity> </View> ); }
// //     return ( <FlatList data={listings} renderItem={renderItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.listContainer} ListEmptyComponent={ !loading ? ( <View style={styles.emptyContainer}> <Text style={styles.emptyText}>Aucune annonce avec le statut '{status}'.</Text> </View> ) : null } refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchListings(); }} colors={['#0891b2']} tintColor={'#0891b2'} /> } /> );
// // }

// // // --- Styles ---
// // const styles = StyleSheet.create({
// //     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
// //     errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
// //     errorText: { fontFamily: 'Montserrat-Regular', color: '#b91c1c', fontSize: 16, textAlign: 'center', marginBottom: 15 },
// //     retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10, gap: 8 },
// //     retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
// //     listContainer: { padding: 16, flexGrow: 1 },
// //     listItem: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: "#000", boxShadow: { width: 0, height: 1 }, boxShadow: 0.05, boxShadow: 2, elevation: 1 },
// //     itemClickableArea: { flexDirection: 'row', flex: 1, alignItems: 'center', marginRight: 8 },
// //     itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12, backgroundColor: '#e5e7eb' },
// //     itemContent: { flex: 1, justifyContent: 'center', gap: 4 },
// //     itemTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#111827' },
// //     itemOwner: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#4b5563' },
// //     itemDate: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#6b7280', marginTop: 2 },
// //     itemReason: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#ef4444', fontStyle: 'italic', marginTop: 2 },
// //     itemPriceCapacityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 4 },
// //     itemDetailChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, gap: 4 },
// //     itemDetailChipText: { fontFamily: 'Montserrat-Medium', fontSize: 11, color: '#4b5563' },
// //     itemAmenitiesRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
// //     amenityIconWrapper: {},
// //     moreAmenitiesText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#9ca3af', marginLeft: 2 },
// //     itemActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
// //     actionSpinner: { width: 82, height: 36, justifyContent: 'center', alignItems: 'center' },
// //     actionButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1.5, elevation: 2 },
// //     approveButton: { backgroundColor: '#10b981' },
// //     rejectButton: { backgroundColor: '#ef4444' },
// //     emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, marginTop: 50 },
// //     emptyText: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#6b7280', textAlign: 'center' },
// // });


// // // app/admin/ListingListTab.tsx
// // import React, { useState, useEffect, useCallback } from 'react';
// // import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, RefreshControl, Platform } from 'react-native';
// // import { router } from 'expo-router';
// // import { supabase } from '@/lib/supabase'; // Vérifiez chemin
// // import { useAuth } from '@/hooks/useAuth'; // Vérifiez chemin
// // import {
// //     RefreshCcw, Check, X as XIcon,
// //     DollarSign, Users, Square, // Icônes pour la liste
// //     // Importer toutes les icônes d'équipements possibles définies dans iconMap
// //     Wifi, Car, Umbrella, Waves, Thermometer, ShowerHead, Bath, Flame, Warehouse
// // } from 'lucide-react-native';
// // import { format } from 'date-fns';
// // import { fr } from 'date-fns/locale';

// // // Map des icônes
// // const iconMap: { [key: string]: React.ElementType } = {
// //     Wifi: Wifi, 
// //     Car: Car, 
// //     Umbrella: Umbrella, 
// //     Waves: Waves,
// //     Thermometer: Thermometer, 
// //     ShowerHead: ShowerHead, 
// //     Bath: Bath,
// //     Flame: Flame, 
// //     Warehouse: Warehouse
// // };

// // // Interface pour les données
// // interface ManagedListing {
// //     id: string;
// //     title: string;
// //     created_at: string;
// //     owner_id: string;
// //     status: string;
// //     description?: string | null;
// //     location?: string | null;
// //     price_per_hour?: number | null;
// //     capacity?: number | null;
// //     approved_at?: string | null;
// //     approved_by?: string | null;
// //     rejected_at?: string | null;
// //     rejected_by?: string | null;
// //     rejection_reason?: string | null;
// //     profiles: { full_name: string | null } | null;
// //     pool_images: { url: string; position: number }[] | null;
// //     pool_amenities: { id: string; name: string; icon_name: string | null }[] | null;
// // }

// // // Props du composant
// // interface ListingListTabProps {
// //     status: 'pending' | 'approved' | 'rejected' | null;
// //     searchTerm?: string;
// //     selectedCity?: string | null;
// //     startDate?: Date | null;
// //     endDate?: Date | null;
// //     minPrice?: number | null;
// //     maxPrice?: number | null;
// //     selectedAmenityIdsFilter?: string[];
// // }

// // export default function ListingListTab({
// //     status,
// //     searchTerm,
// //     selectedCity,
// //     startDate,
// //     endDate,
// //     minPrice,
// //     maxPrice,
// //     selectedAmenityIdsFilter
// // }: ListingListTabProps) {
// //     const { user: adminUser } = useAuth();
// //     const [listings, setListings] = useState<ManagedListing[]>([]);
// //     const [loading, setLoading] = useState(true);
// //     const [actionLoading, setActionLoading] = useState<string | null>(null);
// //     const [error, setError] = useState<string | null>(null);
// //     const [refreshing, setRefreshing] = useState(false);

// //     // Chargement des annonces
// //     const fetchListings = useCallback(async () => {
// //         if (!refreshing) setLoading(true);
// //         setError(null);
// //         const rpcParams = {
// //             p_search_text: searchTerm || '',
// //             p_status: status,
// //             p_city: selectedCity,
// //             p_start_date: startDate?.toISOString() || null,
// //             p_end_date: endDate?.toISOString() || null,
// //             p_min_price: minPrice,
// //             p_max_price: maxPrice,
// //             p_amenity_ids: selectedAmenityIdsFilter && selectedAmenityIdsFilter.length > 0 ? selectedAmenityIdsFilter : null
// //         };
// //         try {
// //             const { data, error } = await supabase.rpc('search_listings_admin', rpcParams);
// //             if (error) throw error;
// //             const formattedData = (data || []).map((item: any) => ({
// //                 id: item.id,
// //                 title: item.title,
// //                 created_at: item.created_at,
// //                 owner_id: item.owner_id,
// //                 status: item.status,
// //                 description: item.description,
// //                 location: item.location,
// //                 price_per_hour: item.price_per_hour,
// //                 capacity: item.capacity,
// //                 approved_at: item.approved_at,
// //                 approved_by: item.approved_by,
// //                 rejected_at: item.rejected_at,
// //                 rejected_by: item.rejected_by,
// //                 rejection_reason: item.rejection_reason,
// //                 profiles: { full_name: item.profile_full_name || null },
// //                 pool_images: item.pool_images as { url: string; position: number }[] | null,
// //                 pool_amenities: item.pool_amenities as { id: string; name: string; icon_name: string | null }[] | null
// //             }));
// //             setListings(formattedData);
// //         } catch (err: any) {
// //             console.error(`Erreur lors du chargement des annonces (${status}):`, err);
// //             if (err.details) console.error("Détails de l'erreur:", err.details);
// //             setError(err.message || `Erreur lors du chargement via RPC (${status}).`);
// //             setListings([]);
// //         } finally {
// //             setLoading(false);
// //             setRefreshing(false);
// //         }
// //     }, [status, refreshing, searchTerm, selectedCity, startDate, endDate, minPrice, maxPrice, selectedAmenityIdsFilter]);

// //     useEffect(() => {
// //         fetchListings();
// //     }, [fetchListings]);

// //     // Actions d'approbation/rejet
// //     const handleApprove = async (listingId: string) => {
// //         if (!adminUser) return;
// //         setActionLoading(listingId);
// //         try {
// //             await supabase.rpc('approve_listing', { admin_id: adminUser.id, listing_id: listingId });
// //             Alert.alert("Succès", "Annonce approuvée !");
// //             fetchListings();
// //         } catch (err: any) {
// //             console.error("Erreur lors de l'approbation:", err);
// //             Alert.alert("Erreur", `Échec d'approbation: ${err.message}`);
// //         } finally {
// //             setActionLoading(null);
// //         }
// //     };

// //     const performReject = async (listingId: string, reason: string | null) => {
// //         setActionLoading(listingId);
// //         try {
// //             await supabase.rpc('reject_listing', { admin_id: adminUser!.id, listing_id: listingId, reason });
// //             Alert.alert("Succès", "Annonce rejetée.");
// //             fetchListings();
// //         } catch (err: any) {
// //             console.error("Erreur lors du rejet:", err);
// //             Alert.alert("Erreur", `Échec du rejet: ${err.message}`);
// //         } finally {
// //             setActionLoading(null);
// //         }
// //     };

// //     const handleReject = (listingId: string) => {
// //         if (Platform.OS !== 'web') {
// //             Alert.prompt(
// //                 "Motif",
// //                 "Raison du rejet (optionnel)",
// //                 [
// //                     { text: "Annuler", style: "cancel" },
// //                     { text: "Rejeter", onPress: async (reason) => performReject(listingId, reason || null) }
// //                 ]
// //             );
// //         } else {
// //             const reason = prompt("Motif du rejet (optionnel):");
// //             if (reason !== null) performReject(listingId, reason || null);
// //         }
// //     };

// //     // Navigation
// //     const handleNavigateToDetail = (listingId: string) => {
// //         router.push(`/admin/listing-detail/${listingId}`);
// //     };

// //     // Rendu d'un élément
// //     const renderItem = ({ item }: { item: ManagedListing }) => {
// //         const isLoadingAction = actionLoading === item.id;
// //         const imageUrl = item.pool_images?.[0]?.url || 'https://placehold.co/80x80?text=Pool';
// //         return (
// //             <View style={styles.listItem}>
// //                 <TouchableOpacity style={styles.itemClickableArea} onPress={() => handleNavigateToDetail(item.id)} disabled={isLoadingAction}>
// //                     <Image source={{ uri: imageUrl }} style={styles.itemImage} />
// //                     <View style={styles.itemContent}>
// //                         <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
// //                         <Text style={styles.itemOwner}>Par: {item.profiles?.full_name || 'ID: ' + item.owner_id.substring(0, 6)}</Text>
// //                         {/* Prix et capacité */}
// //                         <View style={styles.itemPriceCapacityRow}>
// //                             {item.price_per_hour != null && (
// //                                 <View style={styles.itemDetailChip}>
// //                                     <DollarSign size={12} color="#374151" />
// //                                     <Text style={styles.itemDetailChipText}>{item.price_per_hour} MAD/h</Text>
// //                                 </View>
// //                             )}
// //                             {item.capacity != null && (
// //                                 <View style={styles.itemDetailChip}>
// //                                     <Users size={12} color="#374151" />
// //                                     <Text style={styles.itemDetailChipText}>{item.capacity} pers.</Text>
// //                                 </View>
// //                             )}
// //                         </View>
// //                         {/* Équipements */}
// //                         {item.pool_amenities && item.pool_amenities.length > 0 && (
// //                             <View style={styles.itemAmenitiesRow}>
// //                                 {item.pool_amenities.slice(0, 3).map(amenity => {
// //                                     const IconComponent = amenity.icon_name && iconMap[amenity.icon_name] ? iconMap[amenity.icon_name] : Square;
// //                                     return (
// //                                         <View key={amenity.id} style={styles.amenityIconWrapper}>
// //                                             <IconComponent size={16} color={IconComponent === Square ? "#9ca3af" : "#0891b2"} strokeWidth={1.5} />
// //                                         </View>
// //                                     );
// //                                 })}
// //                                 {item.pool_amenities.length > 3 && <Text style={styles.moreAmenitiesText}>...</Text>}
// //                             </View>
// //                         )}
// //                         {/* Dates et motifs */}
// //                         {status === 'pending' && <Text style={styles.itemDate}>Soumis le: {new Date(item.created_at).toLocaleDateString()}</Text>}
// //                         {status === 'approved' && item.approved_at && <Text style={styles.itemDate}>Approuvé le: {new Date(item.approved_at).toLocaleDateString()}</Text>}
// //                         {status === 'rejected' && item.rejected_at && <Text style={styles.itemDate}>Rejeté le: {new Date(item.rejected_at).toLocaleDateString()}</Text>}
// //                         {status === 'rejected' && item.rejection_reason && <Text style={styles.itemReason}>Motif: {item.rejection_reason}</Text>}
// //                     </View>
// //                 </TouchableOpacity>
// //                 {/* Boutons d'action */}
// //                 {status === 'pending' && (
// //                     <View style={styles.itemActions}>
// //                         {isLoadingAction ? (
// //                             <ActivityIndicator color="#0891b2" style={styles.actionSpinner} />
// //                         ) : (
// //                             <>
// //                                 <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => handleApprove(item.id)}>
// //                                     <Check size={18} color="#ffffff" />
// //                                 </TouchableOpacity>
// //                                 <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleReject(item.id)}>
// //                                     <XIcon size={18} color="#ffffff" />
// //                                 </TouchableOpacity>
// //                             </>
// //                         )}
// //                     </View>
// //                 )}
// //             </View>
// //         );
// //     };

// //     if (loading && listings.length === 0) {
// //         return (
// //             <View style={styles.loadingContainer}>
// //                 <ActivityIndicator size="large" color="#0891b2" />
// //             </View>
// //         );
// //     }

// //     if (error) {
// //         return (
// //             <View style={styles.errorContainer}>
// //                 <Text style={styles.errorText}>{error}</Text>
// //                 <TouchableOpacity onPress={fetchListings} style={styles.retryButton}>
// //                     <RefreshCcw size={16} color="#ffffff" />
// //                     <Text style={styles.retryButtonText}>Réessayer</Text>
// //                 </TouchableOpacity>
// //             </View>
// //         );
// //     }

// //     return (
// //         <FlatList
// //             data={listings}
// //             renderItem={renderItem}
// //             keyExtractor={(item) => item.id}
// //             contentContainerStyle={styles.listContainer}
// //             ListEmptyComponent={
// //                 !loading ? (
// //                     <View style={styles.emptyContainer}>
// //                         <Text style={styles.emptyText}>Aucune annonce trouvée.</Text>
// //                     </View>
// //                 ) : null
// //             }
// //             refreshControl={
// //                 <RefreshControl
// //                     refreshing={refreshing}
// //                     onRefresh={() => {
// //                         setRefreshing(true);
// //                         fetchListings();
// //                     }}
// //                     colors={['#0891b2']}
// //                     tintColor={'#0891b2'}
// //                 />
// //             }
// //         />
// //     );
// // }

// // // Styles complets
// // const styles = StyleSheet.create({
// //     loadingContainer: { 
// //         flex: 1, 
// //         justifyContent: 'center', 
// //         alignItems: 'center', 
// //         padding: 20 
// //     },
// //     errorContainer: { 
// //         flex: 1, 
// //         justifyContent: 'center', 
// //         alignItems: 'center', 
// //         padding: 20 
// //     },
// //     errorText: { 
// //         fontFamily: 'Montserrat-Regular', 
// //         color: '#b91c1c', 
// //         fontSize: 16, 
// //         textAlign: 'center', 
// //         marginBottom: 15 
// //     },
// //     retryButton: { 
// //         flexDirection: 'row', 
// //         alignItems: 'center', 
// //         backgroundColor: '#0891b2', 
// //         paddingVertical: 10, 
// //         paddingHorizontal: 20, 
// //         borderRadius: 8, 
// //         marginTop: 10, 
// //         gap: 8 
// //     },
// //     retryButtonText: { 
// //         fontFamily: 'Montserrat-SemiBold', 
// //         fontSize: 14, 
// //         color: '#ffffff' 
// //     },
// //     listContainer: { 
// //         padding: 16, 
// //         flexGrow: 1 
// //     },
// //     listItem: { 
// //         backgroundColor: '#ffffff', 
// //         borderRadius: 12, 
// //         padding: 12, 
// //         marginBottom: 12, 
// //         flexDirection: 'row', 
// //         alignItems: 'center',
// //         shadowColor: "#000",
// //         shadowOffset: { 
// //             width: 0, 
// //             height: 1 
// //         },
// //         shadowOpacity: 0.05,
// //         shadowRadius: 2,
// //         elevation: 1
// //     },
// //     itemClickableArea: { 
// //         flexDirection: 'row', 
// //         flex: 1, 
// //         alignItems: 'center', 
// //         marginRight: 8 
// //     },
// //     itemImage: { 
// //         width: 60, 
// //         height: 60, 
// //         borderRadius: 8, 
// //         marginRight: 12, 
// //         backgroundColor: '#e5e7eb' 
// //     },
// //     itemContent: { 
// //         flex: 1, 
// //         justifyContent: 'center', 
// //         gap: 4 
// //     },
// //     itemTitle: { 
// //         fontFamily: 'Montserrat-SemiBold', 
// //         fontSize: 15, 
// //         color: '#111827' 
// //     },
// //     itemOwner: { 
// //         fontFamily: 'Montserrat-Regular', 
// //         fontSize: 13, 
// //         color: '#4b5563' 
// //     },
// //     itemDate: { 
// //         fontFamily: 'Montserrat-Regular', 
// //         fontSize: 12, 
// //         color: '#6b7280', 
// //         marginTop: 2 
// //     },
// //     itemReason: { 
// //         fontFamily: 'Montserrat-Regular', 
// //         fontSize: 12, 
// //         color: '#ef4444', 
// //         fontStyle: 'italic', 
// //         marginTop: 2 
// //     },
// //     itemPriceCapacityRow: { 
// //         flexDirection: 'row', 
// //         flexWrap: 'wrap', 
// //         gap: 8, 
// //         marginTop: 4, 
// //         marginBottom: 4 
// //     },
// //     itemDetailChip: { 
// //         flexDirection: 'row', 
// //         alignItems: 'center', 
// //         backgroundColor: '#f3f4f6', 
// //         paddingHorizontal: 6, 
// //         paddingVertical: 3, 
// //         borderRadius: 6, 
// //         gap: 4 
// //     },
// //     itemDetailChipText: { 
// //         fontFamily: 'Montserrat-Medium', 
// //         fontSize: 11, 
// //         color: '#4b5563' 
// //     },
// //     itemAmenitiesRow: { 
// //         flexDirection: 'row', 
// //         alignItems: 'center', 
// //         gap: 6, 
// //         marginTop: 6 
// //     },
// //     amenityIconWrapper: {},
// //     moreAmenitiesText: { 
// //         fontFamily: 'Montserrat-SemiBold', 
// //         fontSize: 14, 
// //         color: '#9ca3af', 
// //         marginLeft: 2 
// //     },
// //     itemActions: { 
// //         flexDirection: 'row', 
// //         alignItems: 'center', 
// //         gap: 10 
// //     },
// //     actionSpinner: { 
// //         width: 82, 
// //         height: 36, 
// //         justifyContent: 'center', 
// //         alignItems: 'center' 
// //     },
// //     actionButton: { 
// //         width: 36, 
// //         height: 36, 
// //         borderRadius: 18, 
// //         justifyContent: 'center', 
// //         alignItems: 'center', 
// //         shadowColor: "#000", 
// //         shadowOffset: { 
// //             width: 0, 
// //             height: 1 
// //         }, 
// //         shadowOpacity: 0.1, 
// //         shadowRadius: 1.5, 
// //         elevation: 2 
// //     },
// //     approveButton: { 
// //         backgroundColor: '#10b981' 
// //     },
// //     rejectButton: { 
// //         backgroundColor: '#ef4444' 
// //     },
// //     emptyContainer: { 
// //         flexGrow: 1, 
// //         justifyContent: 'center', 
// //         alignItems: 'center', 
// //         padding: 20, 
// //         marginTop: 50 
// //     },
// //     emptyText: { 
// //         fontFamily: 'Montserrat-Regular', 
// //         fontSize: 16, 
// //         color: '#6b7280', 
// //         textAlign: 'center' 
// //     }
// // });

// // app/admin/ListingListTab.tsx
// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, RefreshControl, Platform } from 'react-native';
// import { router } from 'expo-router';
// import { supabase } from '@/lib/supabase'; 
// import { useAuth } from '@/hooks/useAuth'; 
// import {
//     RefreshCcw, Check, X as XIcon,
//     DollarSign, Users, Square, 
//     Wifi, Car, Umbrella, Waves, Thermometer, ShowerHead, Bath, Flame, Warehouse
// } from 'lucide-react-native';

// // Map des icônes
// const iconMap: { [key: string]: React.ElementType } = {
//     Wifi, Car, Umbrella, Waves, Thermometer, ShowerHead, Bath, Flame, Warehouse
// };

// // Interface pour les données
// interface ManagedListing {
//     id: string;
//     title: string;
//     created_at: string;
//     owner_id: string;
//     status: string;
//     description?: string | null;
//     location?: string | null;
//     price_per_hour?: number | null;
//     capacity?: number | null;
//     approved_at?: string | null;
//     approved_by?: string | null;
//     rejected_at?: string | null;
//     rejected_by?: string | null;
//     rejection_reason?: string | null;
//     owner_name?: string | null;
//     owner_email?: string | null;
//     first_image_url?: string | null;
// }

// // Props du composant
// interface ListingListTabProps {
//     status: 'pending' | 'approved' | 'rejected' | null;
//     searchTerm?: string;
//     selectedCity?: string | null;
//     startDate?: Date | null;
//     endDate?: Date | null;
//     minPrice?: number | null;
//     maxPrice?: number | null;
//     selectedAmenityIdsFilter?: string[];
// }

// export default function ListingListTab({
//     status,
//     searchTerm,
//     selectedCity,
//     startDate,
//     endDate,
//     minPrice,
//     maxPrice,
//     selectedAmenityIdsFilter
// }: ListingListTabProps) {
//     const { user: adminUser } = useAuth();
//     const [listings, setListings] = useState<ManagedListing[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [actionLoading, setActionLoading] = useState<string | null>(null);
//     const [error, setError] = useState<string | null>(null);
//     const [refreshing, setRefreshing] = useState(false);

//     // Chargement des annonces
//     const fetchListings = useCallback(async () => {
//         if (!refreshing) setLoading(true);
//         setError(null);
        
//         const rpcParams = {
//             p_search_text: searchTerm || '',
//             p_status: status,
//             p_city: selectedCity,
//             p_start_date: startDate?.toISOString() || null,
//             p_end_date: endDate?.toISOString() || null,
//             p_min_price: minPrice,
//             p_max_price: maxPrice,
//             p_amenity_ids: selectedAmenityIdsFilter && selectedAmenityIdsFilter.length > 0 ? selectedAmenityIdsFilter : null
//         };
        
//         console.log('Paramètres RPC:', rpcParams);
        
//         try {
//             const { data, error } = await supabase.rpc('search_listings_admin', rpcParams);
            
//             console.log('Réponse RPC:', {
//                 success: !!data && !error,
//                 count: data?.length || 0,
//                 statuses: data?.map(item => item.status),
//                 error: error?.message
//             });
            
//             if (error) throw error;
            
//             if (!data || data.length === 0) {
//                 console.log('Aucune annonce trouvée pour ce statut:', status);
//                 setListings([]);
//                 setError('Aucune annonce trouvée pour ce statut.');
//             } else {
//                 setListings(data);
//                 setError(null);
//             }
//         } catch (err: any) {
//             console.error(`Erreur lors du chargement des annonces (${status}):`, err);
//             if (err.details) console.error("Détails de l'erreur:", err.details);
//             setError(err.message || `Erreur lors du chargement via RPC (${status}).`);
//             setListings([]);
//         } finally {
//             setLoading(false);
//             setRefreshing(false);
//         }
//     }, [status, refreshing, searchTerm, selectedCity, startDate, endDate, minPrice, maxPrice, selectedAmenityIdsFilter]);

//     // Important : ajout d'une dépendance au status pour réagir aux changements d'onglet
//     useEffect(() => {
//         console.log("Effect triggered with status:", status);
//         fetchListings();
//     }, [fetchListings, status]);

//     // Actions d'approbation/rejet
//     const handleApprove = async (listingId: string) => {
//         if (!adminUser) return;
//         setActionLoading(listingId);
//         try {
//             await supabase.from('pool_listings').update({ status: 'approved' }).eq('id', listingId);
//             fetchListings();
//         } catch (err: any) {
//             console.error("Erreur lors de l'approbation:", err);
//             Alert.alert("Erreur", `Échec d'approbation: ${err.message}`);
//         } finally {
//             setActionLoading(null);
//         }
//     };

//     const performReject = async (listingId: string, reason: string | null) => {
//         setActionLoading(listingId);
//         try {
//             await supabase.from('pool_listings').update({ 
//                 status: 'rejected', 
//                 rejection_reason: reason 
//             }).eq('id', listingId);
//             fetchListings();
//         } catch (err: any) {
//             console.error("Erreur lors du rejet:", err);
//             Alert.alert("Erreur", `Échec du rejet: ${err.message}`);
//         } finally {
//             setActionLoading(null);
//         }
//     };

//     const handleReject = (listingId: string) => {
//         if (Platform.OS === 'ios') {
//             Alert.prompt(
//                 "Motif du rejet",
//                 "Raison du rejet (obligatoire)",
//                 [
//                     { text: "Annuler", style: "cancel" },
//                     { 
//                         text: "Rejeter", 
//                         onPress: (reason) => {
//                             if (!reason?.trim()) {
//                                 Alert.alert('Erreur', 'Veuillez indiquer une raison.');
//                                 return;
//                             }
//                             performReject(listingId, reason);
//                         }
//                     }
//                 ],
//                 'plain-text'
//             );
//         } else {
//             const reason = prompt("Motif du rejet (obligatoire):");
//             if (reason === null) {
//                 // L'utilisateur a annulé
//                 return;
//             }
            
//             if (!reason.trim()) {
//                 Alert.alert('Erreur', 'Veuillez indiquer une raison.');
//                 return;
//             }
            
//             performReject(listingId, reason);
//         }
//     };

//     // Navigation
//     const handleNavigateToDetail = (listingId: string) => {
//         router.push(`/admin/listing-detail/${listingId}`);
//     };

//     // Rendu d'un élément
//     const renderItem = ({ item }: { item: ManagedListing }) => {
//         const isLoadingAction = actionLoading === item.id;
        
//         return (
//             <TouchableOpacity
//                 style={styles.listingCard}
//                 onPress={() => handleNavigateToDetail(item.id)}
//                 disabled={isLoadingAction}
//             >
//                 {/* Entête avec image et infos principales */}
//                 <View style={styles.listingHeader}>
//                     <Image 
//                         source={{ uri: item.first_image_url || 'https://placehold.co/120x120?text=Pool' }} 
//                         style={styles.listingImage} 
//                     />
//                     <View style={styles.listingHeaderContent}>
//                         <Text style={styles.listingTitle}>{item.title}</Text>
//                         <Text style={styles.listingLocation}>
//                             <Text style={styles.locationLabel}>Lieu: </Text>
//                             {item.location || 'Non spécifié'}
//                         </Text>
                        
//                         {/* Prix et capacité mis en évidence */}
//                         <View style={styles.detailsRow}>
//                             <View style={styles.detailItem}>
//                                 <Text style={styles.detailLabel}>Prix:</Text>
//                                 <Text style={styles.detailValue}>{item.price_per_hour} MAD/h</Text>
//                             </View>
//                             <View style={styles.detailItem}>
//                                 <Text style={styles.detailLabel}>Capacité:</Text>
//                                 <Text style={styles.detailValue}>{item.capacity || '?'} pers.</Text>
//                             </View>
//                         </View>
                        
//                         {/* Badge de statut */}
//                         <View style={[
//                             styles.statusBadge, 
//                             item.status === 'pending' ? styles.pendingBadge : 
//                             item.status === 'approved' ? styles.approvedBadge :
//                             styles.rejectedBadge
//                         ]}>
//                             <Text style={styles.statusText}>
//                                 {item.status === 'pending' ? 'En attente' : 
//                                 item.status === 'approved' ? 'Approuvée' : 'Rejetée'}
//                             </Text>
//                         </View>
//                     </View>
//                 </View>
                
//                 {/* Informations propriétaire */}
//                 <View style={styles.ownerSection}>
//                     <Text style={styles.ownerTitle}>Propriétaire:</Text>
//                     <Text style={styles.ownerName}>{item.owner_name || 'Inconnu'}</Text>
//                     {item.owner_email && (
//                         <Text style={styles.ownerEmail}>{item.owner_email}</Text>
//                     )}
//                 </View>
                
//                 {/* Date de création */}
//                 <Text style={styles.dateInfo}>
//                     Créée le: {new Date(item.created_at).toLocaleDateString()}
//                 </Text>
                
//                 {/* Raison de rejet si applicable */}
//                 {item.status === 'rejected' && item.rejection_reason && (
//                     <View style={styles.rejectionContainer}>
//                         <Text style={styles.rejectionTitle}>Raison du refus:</Text>
//                         <Text style={styles.rejectionReason}>{item.rejection_reason}</Text>
//                     </View>
//                 )}
                
//                 {/* Actions pour annonces en attente */}
//                 {item.status === 'pending' && (
//                     <View style={styles.listingActions}>
//                         {isLoadingAction === item.id ? (
//                             <ActivityIndicator size="small" color="#0891b2" style={{ marginVertical: 10 }} />
//                         ) : (
//                             <>
//                                 <TouchableOpacity 
//                                     style={styles.approveButton} 
//                                     onPress={() => handleApprove(item.id)}
//                                 >
//                                     <Text style={styles.buttonText}>Approuver</Text>
//                                 </TouchableOpacity>
//                                 <TouchableOpacity 
//                                     style={styles.rejectButton} 
//                                     onPress={() => handleReject(item.id)}
//                                 >
//                                     <Text style={styles.buttonText}>Rejeter</Text>
//                                 </TouchableOpacity>
//                             </>
//                         )}
//                     </View>
//                 )}
//             </TouchableOpacity>
//         );
//     };

//     // Rendu du corps principal du composant
//     if (loading && !refreshing && listings.length === 0) {
//         return (
//             <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#0891b2" />
//                 <Text style={styles.loadingText}>Chargement des annonces...</Text>
//             </View>
//         );
//     }

//     return (
//         <View style={{ flex: 1 }}>
//             {error && !listings.length ? (
//                 <View style={styles.errorContainer}>
//                     <Text style={styles.errorText}>{error}</Text>
//                     <TouchableOpacity onPress={fetchListings} style={styles.retryButton}>
//                         <RefreshCcw size={16} color="#ffffff" />
//                         <Text style={styles.retryButtonText}>Réessayer</Text>
//                     </TouchableOpacity>
//                 </View>
//             ) : (
//                 <FlatList
//                     data={listings}
//                     renderItem={renderItem}
//                     keyExtractor={(item) => item.id}
//                     contentContainerStyle={styles.listContainer}
//                     ListEmptyComponent={
//                         !loading ? (
//                             <View style={styles.emptyContainer}>
//                                 <Text style={styles.emptyText}>Aucune annonce trouvée.</Text>
//                             </View>
//                         ) : null
//                     }
//                     refreshControl={
//                         <RefreshControl
//                             refreshing={refreshing}
//                             onRefresh={() => {
//                                 setRefreshing(true);
//                                 fetchListings();
//                             }}
//                             colors={['#0891b2']}
//                             tintColor={'#0891b2'}
//                         />
//                     }
//                 />
//             )}
//         </View>
//     );
// }
// // Styles complets
// const styles = StyleSheet.create({
//     loadingContainer: { 
//         flex: 1, 
//         justifyContent: 'center', 
//         alignItems: 'center', 
//         padding: 20 
//     },
//     errorContainer: { 
//         flex: 1, 
//         justifyContent: 'center', 
//         alignItems: 'center', 
//         padding: 20 
//     },
//     errorText: { 
//         fontFamily: 'Montserrat-Regular', 
//         color: '#b91c1c', 
//         fontSize: 16, 
//         textAlign: 'center', 
//         marginBottom: 15 
//     },
//     retryButton: { 
//         flexDirection: 'row', 
//         alignItems: 'center', 
//         backgroundColor: '#0891b2', 
//         paddingVertical: 10, 
//         paddingHorizontal: 20, 
//         borderRadius: 8, 
//         marginTop: 10, 
//         gap: 8 
//     },
//     retryButtonText: { 
//         fontFamily: 'Montserrat-SemiBold', 
//         fontSize: 14, 
//         color: '#ffffff' 
//     },
//     listContainer: { 
//         padding: 16, 
//         flexGrow: 1 
//     },
//     listingCard: {
//         backgroundColor: '#ffffff',
//         borderRadius: 12,
//         padding: 16,
//         marginBottom: 16,
//         borderWidth: 1,
//         borderColor: '#e5e7eb',
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.05,
//         shadowRadius: 4,
//         elevation: 2
//     },
//     listingHeader: {
//         flexDirection: 'row',
//         marginBottom: 12
//     },
//     listingImage: {
//         width: 120,
//         height: 120,
//         borderRadius: 8,
//         backgroundColor: '#e5e7eb'
//     },
//     listingHeaderContent: {
//         flex: 1,
//         marginLeft: 16,
//         justifyContent: 'space-between'
//     },
//     listingTitle: {
//         fontFamily: 'Montserrat-Bold',
//         fontSize: 18,
//         color: '#1e293b',
//         marginBottom: 6
//     },
//     listingLocation: {
//         fontFamily: 'Montserrat-Regular',
//         fontSize: 15,
//         color: '#64748b',
//         marginBottom: 10
//     },
//     locationLabel: {
//         fontFamily: 'Montserrat-SemiBold',
//         color: '#334155'
//     },
//     detailsRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 12
//     },
//     detailItem: {
//         backgroundColor: '#f8fafc',
//         paddingHorizontal: 12,
//         paddingVertical: 8,
//         borderRadius: 8,
//         borderWidth: 1,
//         borderColor: '#e2e8f0',
//         minWidth: 100
//     },
//     detailLabel: {
//         fontFamily: 'Montserrat-SemiBold',
//         fontSize: 12,
//         color: '#64748b',
//         marginBottom: 2
//     },
//     detailValue: {
//         fontFamily: 'Montserrat-Bold',
//         fontSize: 16,
//         color: '#0c4a6e'
//     },
//     statusBadge: {
//         alignSelf: 'flex-start',
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         borderRadius: 16,
//         marginTop: 8
//     },
//     pendingBadge: {
//         backgroundColor: '#fef3c7',
//         borderWidth: 1,
//         borderColor: '#fde68a'
//     },
//     approvedBadge: {
//         backgroundColor: '#d1fae5',
//         borderWidth: 1,
//         borderColor: '#a7f3d0'
//     },
//     rejectedBadge: {
//         backgroundColor: '#fee2e2',
//         borderWidth: 1,
//         borderColor: '#fecaca'
//     },
//     statusText: {
//         fontFamily: 'Montserrat-SemiBold',
//         fontSize: 13,
//         textTransform: 'uppercase'
//     },
//     ownerSection: {
//         borderTopWidth: 1,
//         borderTopColor: '#f1f5f9',
//         paddingTop: 12,
//         marginTop: 4,
//         marginBottom: 8
//     },
//     ownerTitle: {
//         fontFamily: 'Montserrat-SemiBold',
//         fontSize: 14,
//         color: '#475569',
//         marginBottom: 4
//     },
//     ownerName: {
//         fontFamily: 'Montserrat-Regular',
//         fontSize: 15,
//         color: '#334155'
//     },
//     ownerEmail: {
//         fontFamily: 'Montserrat-Regular',
//         fontSize: 14,
//         color: '#64748b',
//         marginTop: 2
//     },
//     dateInfo: {
//         fontFamily: 'Montserrat-Regular',
//         fontSize: 14,
//         color: '#64748b',
//         marginBottom: 10
//     },
//     rejectionContainer: {
//         backgroundColor: '#fee2e2',
//         padding: 12,
//         borderRadius: 8,
//         borderLeftWidth: 3,
//         borderLeftColor: '#f87171',
//         marginTop: 8,
//         marginBottom: 8
//     },
//     rejectionTitle: {
//         fontFamily: 'Montserrat-SemiBold',
//         fontSize: 14,
//         color: '#b91c1c',
//         marginBottom: 4
//     },
//     rejectionReason: {
//         fontFamily: 'Montserrat-Regular',
//         fontSize: 14,
//         color: '#b91c1c'
//     },
//     listingActions: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginTop: 12,
//         gap: 12
//     },
//     approveButton: {
//         flex: 1,
//         backgroundColor: '#10b981',
//         paddingVertical: 12,
//         borderRadius: 8,
//         alignItems: 'center',
//         justifyContent: 'center'
//     },
//     rejectButton: {
//         flex: 1,
//         backgroundColor: '#ef4444',
//         paddingVertical: 12,
//         borderRadius: 8,
//         alignItems: 'center',
//         justifyContent: 'center'
//     },
//     buttonText: {
//         fontFamily: 'Montserrat-SemiBold',
//         fontSize: 15,
//         color: '#ffffff'
//     },
//     emptyContainer: { 
//         flexGrow: 1, 
//         justifyContent: 'center', 
//         alignItems: 'center', 
//         padding: 20, 
//         marginTop: 50 
//     },
//     emptyText: { 
//         fontFamily: 'Montserrat-Regular', 
//         fontSize: 16, 
//         color: '#6b7280', 
//         textAlign: 'center' 
//     }
// });


// app/admin/ListingListTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, RefreshControl, Platform } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase'; 
import { useAuth } from '@/hooks/useAuth'; 
import {
    RefreshCcw, Check, X as XIcon,
    DollarSign, Users, Square, 
    Wifi, Car, Umbrella, Waves, Thermometer, ShowerHead, Bath, Flame, Warehouse
} from 'lucide-react-native';

// Map des icônes
const iconMap: { [key: string]: React.ElementType } = {
    Wifi, Car, Umbrella, Waves, Thermometer, ShowerHead, Bath, Flame, Warehouse
};

// Interface pour les données
interface ManagedListing {
    id: string;
    title: string;
    created_at: string;
    owner_id: string;
    status: string;
    description?: string | null;
    location?: string | null;
    price_per_hour?: number | null;
    capacity?: number | null;
    approved_at?: string | null;
    approved_by?: string | null;
    rejected_at?: string | null;
    rejected_by?: string | null;
    rejection_reason?: string | null;
    owner_name?: string | null;
    owner_email?: string | null;
    first_image_url?: string | null;
}

// Props du composant
interface ListingListTabProps {
    status: 'pending' | 'approved' | 'rejected' | null;
    searchTerm?: string;
    selectedCity?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    selectedAmenityIdsFilter?: string[];
}

export default function ListingListTab({
    status,
    searchTerm,
    selectedCity,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    selectedAmenityIdsFilter
}: ListingListTabProps) {
    const { user: adminUser } = useAuth();
    const [listings, setListings] = useState<ManagedListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    // Nouvel état pour suivre si le fetch initial pour le statut actuel a été effectué
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    // Chargement des annonces - version améliorée
    const fetchListings = useCallback(async (forceReset = false) => {
        // Si un rafraîchissement est déjà en cours, on ne relance pas un chargement
        if (refreshing && !forceReset) return;
        
        // Marquer le début du chargement
        if (!refreshing || forceReset) {
            setLoading(true);
            // Si c'est un forceReset ou changement de statut, on réinitialise les données
            if (forceReset) {
                setListings([]);
            }
        }
        
        setError(null);
        
        // Log de diagnostic
        console.log(`Chargement des annonces avec le statut: ${status}, forceReset: ${forceReset}`);
        
        const rpcParams = {
            p_search_text: searchTerm || '',
            p_status: status,
            p_city: selectedCity,
            p_start_date: startDate?.toISOString() || null,
            p_end_date: endDate?.toISOString() || null,
            p_min_price: minPrice,
            p_max_price: maxPrice,
            p_amenity_ids: selectedAmenityIdsFilter && selectedAmenityIdsFilter.length > 0 ? selectedAmenityIdsFilter : null
        };
        
        console.log('Paramètres RPC:', rpcParams);
        
        try {
            const { data, error } = await supabase.rpc('search_listings_admin', rpcParams);
            
            console.log('Réponse RPC:', {
                success: !!data && !error,
                count: data?.length || 0,
                statuses: data?.map(item => item.status),
                error: error?.message
            });
            
            if (error) throw error;
            
            if (!data || data.length === 0) {
                console.log('Aucune annonce trouvée pour ce statut:', status);
                setListings([]);
                setError('Aucune annonce trouvée pour ce statut.');
            } else {
                console.log(`✅ ${data.length} annonces chargées pour le statut: ${status}`);
                setListings(data);
                setError(null);
            }
            
            // Marquer que le chargement initial est terminé
            setInitialFetchDone(true);
        } catch (err: any) {
            console.error(`❌ Erreur lors du chargement des annonces (${status}):`, err);
            if (err.details) console.error("Détails de l'erreur:", err.details);
            setError(err.message || `Erreur lors du chargement via RPC (${status}).`);
            setListings([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [status, refreshing, searchTerm, selectedCity, startDate, endDate, minPrice, maxPrice, selectedAmenityIdsFilter]);

    // Effet pour réagir au changement de statut
    useEffect(() => {
        console.log("Changement de statut détecté:", status);
        // Réinitialiser l'état de chargement initial lors d'un changement de statut
        setInitialFetchDone(false);
        // Vider les annonces lors du changement de statut pour éviter de voir
        // les anciennes données pendant le chargement des nouvelles
        setListings([]);
        // Forcer le rechargement des données avec un petit délai pour
        // s'assurer que le changement d'état est bien pris en compte
        setTimeout(() => {
            fetchListings(true);
        }, 50);
    }, [status]); // Uniquement dépendant du statut pour éviter des déclenchements en boucle

    // Effet secondaire pour charger les données au montage du composant
    useEffect(() => {
        if (adminUser && !initialFetchDone) {
            fetchListings();
        }
    }, [adminUser, initialFetchDone, fetchListings]);

    // Actions d'approbation/rejet
    const handleApprove = async (listingId: string) => {
        if (!adminUser) return;
        setActionLoading(listingId);
        try {
            await supabase.from('pool_listings').update({ status: 'approved' }).eq('id', listingId);
            // Rafraîchir les données après l'action
            fetchListings(true);
        } catch (err: any) {
            console.error("Erreur lors de l'approbation:", err);
            Alert.alert("Erreur", `Échec d'approbation: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const performReject = async (listingId: string, reason: string | null) => {
        setActionLoading(listingId);
        try {
            await supabase.from('pool_listings').update({ 
                status: 'rejected', 
                rejection_reason: reason 
            }).eq('id', listingId);
            // Rafraîchir les données après l'action
            fetchListings(true);
        } catch (err: any) {
            console.error("Erreur lors du rejet:", err);
            Alert.alert("Erreur", `Échec du rejet: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = (listingId: string) => {
        if (Platform.OS === 'ios') {
            Alert.prompt(
                "Motif du rejet",
                "Raison du rejet (obligatoire)",
                [
                    { text: "Annuler", style: "cancel" },
                    { 
                        text: "Rejeter", 
                        onPress: (reason) => {
                            if (!reason?.trim()) {
                                Alert.alert('Erreur', 'Veuillez indiquer une raison.');
                                return;
                            }
                            performReject(listingId, reason);
                        }
                    }
                ],
                'plain-text'
            );
        } else {
            const reason = prompt("Motif du rejet (obligatoire):");
            if (reason === null) {
                // L'utilisateur a annulé
                return;
            }
            
            if (!reason.trim()) {
                Alert.alert('Erreur', 'Veuillez indiquer une raison.');
                return;
            }
            
            performReject(listingId, reason);
        }
    };

    // Navigation
    const handleNavigateToDetail = (listingId: string) => {
        router.push(`/admin/listing-detail/${listingId}`);
    };

    // Fonction pour forcer un rafraîchissement complet
    const handleForceRefresh = () => {
        setRefreshing(true);
        fetchListings(true);
    };

    // Rendu d'un élément
    const renderItem = ({ item }: { item: ManagedListing }) => {
        const isLoadingAction = actionLoading === item.id;
        
        return (
            <TouchableOpacity
                style={styles.listingCard}
                onPress={() => handleNavigateToDetail(item.id)}
                disabled={isLoadingAction}
            >
                {/* Entête avec image et infos principales */}
                <View style={styles.listingHeader}>
                    <Image 
                        source={{ uri: item.first_image_url || 'https://placehold.co/120x120?text=Pool' }} 
                        style={styles.listingImage} 
                    />
                    <View style={styles.listingHeaderContent}>
                        <Text style={styles.listingTitle}>{item.title}</Text>
                        <Text style={styles.listingLocation}>
                            <Text style={styles.locationLabel}>Lieu: </Text>
                            {item.location || 'Non spécifié'}
                        </Text>
                        
                        {/* Prix et capacité mis en évidence */}
                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Prix:</Text>
                                <Text style={styles.detailValue}>{item.price_per_hour} MAD/h</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Capacité:</Text>
                                <Text style={styles.detailValue}>{item.capacity || '?'} pers.</Text>
                            </View>
                        </View>
                        
                        {/* Badge de statut */}
                        <View style={[
                            styles.statusBadge, 
                            item.status === 'pending' ? styles.pendingBadge : 
                            item.status === 'approved' ? styles.approvedBadge :
                            styles.rejectedBadge
                        ]}>
                            <Text style={styles.statusText}>
                                {item.status === 'pending' ? 'En attente' : 
                                item.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                            </Text>
                        </View>
                    </View>
                </View>
                
                {/* Informations propriétaire */}
                <View style={styles.ownerSection}>
                    <Text style={styles.ownerTitle}>Propriétaire:</Text>
                    <Text style={styles.ownerName}>{item.owner_name || 'Inconnu'}</Text>
                    {item.owner_email && (
                        <Text style={styles.ownerEmail}>{item.owner_email}</Text>
                    )}
                </View>
                
                {/* Date de création */}
                <Text style={styles.dateInfo}>
                    Créée le: {new Date(item.created_at).toLocaleDateString()}
                </Text>
                
                {/* Raison de rejet si applicable */}
                {item.status === 'rejected' && item.rejection_reason && (
                    <View style={styles.rejectionContainer}>
                        <Text style={styles.rejectionTitle}>Raison du refus:</Text>
                        <Text style={styles.rejectionReason}>{item.rejection_reason}</Text>
                    </View>
                )}
                
                {/* Actions pour annonces en attente */}
                {item.status === 'pending' && (
                    <View style={styles.listingActions}>
                        {isLoadingAction === item.id ? (
                            <ActivityIndicator size="small" color="#0891b2" style={{ marginVertical: 10 }} />
                        ) : (
                            <>
                                <TouchableOpacity 
                                    style={styles.approveButton} 
                                    onPress={() => handleApprove(item.id)}
                                >
                                    <Text style={styles.buttonText}>Approuver</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.rejectButton} 
                                    onPress={() => handleReject(item.id)}
                                >
                                    <Text style={styles.buttonText}>Rejeter</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // Rendu du corps principal du composant avec affichage amélioré
    if (loading && !refreshing && listings.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
                <Text style={styles.loadingText}>Chargement des annonces...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {error && !listings.length ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={() => fetchListings(true)} style={styles.retryButton}>
                        <RefreshCcw size={16} color="#ffffff" />
                        <Text style={styles.retryButtonText}>Réessayer</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={listings}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        !loading ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Aucune annonce trouvée.</Text>
                                <TouchableOpacity onPress={handleForceRefresh} style={styles.retryButton}>
                                    <RefreshCcw size={16} color="#ffffff" />
                                    <Text style={styles.retryButtonText}>Rafraîchir</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleForceRefresh}
                            colors={['#0891b2']}
                            tintColor={'#0891b2'}
                        />
                    }
                />
            )}
        </View>
    );
}

// Styles complets
const styles = StyleSheet.create({
    loadingContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    loadingText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#64748b',
        marginTop: 8
    },
    errorContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    errorText: { 
        fontFamily: 'Montserrat-Regular', 
        color: '#b91c1c', 
        fontSize: 16, 
        textAlign: 'center', 
        marginBottom: 15 
    },
    retryButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#0891b2', 
        paddingVertical: 10, 
        paddingHorizontal: 20, 
        borderRadius: 8, 
        marginTop: 10, 
        gap: 8 
    },
    retryButtonText: { 
        fontFamily: 'Montserrat-SemiBold', 
        fontSize: 14, 
        color: '#ffffff' 
    },
    listContainer: { 
        padding: 16, 
        flexGrow: 1 
    },
    listingCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    },
    listingHeader: {
        flexDirection: 'row',
        marginBottom: 12
    },
    listingImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        backgroundColor: '#e5e7eb'
    },
    listingHeaderContent: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'space-between'
    },
    listingTitle: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 18,
        color: '#1e293b',
        marginBottom: 6
    },
    listingLocation: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 15,
        color: '#64748b',
        marginBottom: 10
    },
    locationLabel: {
        fontFamily: 'Montserrat-SemiBold',
        color: '#334155'
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    detailItem: {
        backgroundColor: '#f8fafc',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        minWidth: 100
    },
    detailLabel: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 12,
        color: '#64748b',
        marginBottom: 2
    },
    detailValue: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 16,
        color: '#0c4a6e'
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginTop: 8
    },
    pendingBadge: {
        backgroundColor: '#fef3c7',
        borderWidth: 1,
        borderColor: '#fde68a'
    },
    approvedBadge: {
        backgroundColor: '#d1fae5',
        borderWidth: 1,
        borderColor: '#a7f3d0'
    },
    rejectedBadge: {
        backgroundColor: '#fee2e2',
        borderWidth: 1,
        borderColor: '#fecaca'
    },
    statusText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 13,
        textTransform: 'uppercase'
    },
    ownerSection: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
        marginTop: 4,
        marginBottom: 8
    },
    ownerTitle: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: '#475569',
        marginBottom: 4
    },
    ownerName: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 15,
        color: '#334155'
    },
    ownerEmail: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#64748b',
        marginTop: 2
    },
    dateInfo: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#64748b',
        marginBottom: 10
    },
    rejectionContainer: {
        backgroundColor: '#fee2e2',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#f87171',
        marginTop: 8,
        marginBottom: 8
    },
    rejectionTitle: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: '#b91c1c',
        marginBottom: 4
    },
    rejectionReason: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#b91c1c'
    },
    listingActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 12
    },
    approveButton: {
        flex: 1,
        backgroundColor: '#10b981',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    rejectButton: {
        flex: 1,
        backgroundColor: '#ef4444',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 15,
        color: '#ffffff'
    },
    emptyContainer: { 
        flexGrow: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20, 
        marginTop: 50 
    },
    emptyText: { 
        fontFamily: 'Montserrat-Regular', 
        fontSize: 16, 
        color: '#6b7280', 
        textAlign: 'center',
        marginBottom: 20
    }
});