


// // app/admin/manage-listings.tsx
// import React, { useState, useCallback, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   ActivityIndicator,
//   TextInput,
//   Platform,
//   Modal,
//   Alert,
//   Image
// } from 'react-native';
// import { useFonts } from 'expo-font';
// import {
//   Montserrat_700Bold,
//   Montserrat_600SemiBold,
//   Montserrat_400Regular
// } from '@expo-google-fonts/montserrat';
// import { supabase } from '@/lib/supabase';
// import { useRouter } from 'expo-router';
// import { useAuth } from '@/hooks/useAuth';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import { Picker } from '@react-native-picker/picker';

// // Types
// interface City {
//   id: string;
//   name: string;
// }

// interface Amenity {
//   id: string;
//   name: string;
// }

// // Onglets avec "Tous"
// const TABS = [
//   { status: null, label: 'Tous' },
//   { status: 'pending', label: 'En attente' },
//   { status: 'approved', label: 'En ligne' },
//   { status: 'rejected', label: 'Rejetées' }
// ] as const;

// type ListingStatus = typeof TABS[number]['status'];

// export default function ManageListingsScreen() {
//   const [activeTabStatus, setActiveTabStatus] = useState<ListingStatus>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCity, setSelectedCity] = useState<City | null>(null);
//   const [startDate, setStartDate] = useState<Date | null>(null);
//   const [endDate, setEndDate] = useState<Date | null>(null);
//   const [minPrice, setMinPrice] = useState<number | null>(null);
//   const [maxPrice, setMaxPrice] = useState<number | null>(null);
//   const [selectedAmenityIdsFilter, setSelectedAmenityIdsFilter] = useState<string[]>([]);
//   const [isFilterModalVisible, setFilterModalVisible] = useState(false);
//   const [tempSearchTerm, setTempSearchTerm] = useState('');
//   const [tempSelectedCity, setTempSelectedCity] = useState<string>('');
//   const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
//   const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
//   const [tempMinPrice, setTempMinPrice] = useState<string>('');
//   const [tempMaxPrice, setTempMaxPrice] = useState<string>('');
//   const [tempSelectedAmenityIds, setTempSelectedAmenityIds] = useState<Set<string>>(new Set());
//   const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
//   const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
//   const [loadingCities, setLoadingCities] = useState(true);
//   const [cities, setCities] = useState<City[]>([]);
//   const [loadingAmenities, setLoadingAmenities] = useState(true);
//   const [amenities, setAmenities] = useState<Amenity[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [listings, setListings] = useState<any[]>([]);
//   const [isLoadingAction, setIsLoadingAction] = useState<string | null>(null);
//   const { user } = useAuth();
//   const router = useRouter();
//   // Référence pour suivre si une requête est en cours
//   const activeRequestRef = useRef<boolean>(false);
//   // Référence pour stocker la dernière requête en attente
//   const pendingTabRequestRef = useRef<ListingStatus | null>(null);

//   const [fontsLoaded] = useFonts({
//     'Montserrat-Bold': Montserrat_700Bold,
//     'Montserrat-SemiBold': Montserrat_600SemiBold,
//     'Montserrat-Regular': Montserrat_400Regular
//   });

//   const fetchListings = useCallback(async (forceReload = false) => {
//     if (!user) return;
    
//     // Si une requête est déjà en cours et qu'il ne s'agit pas d'un forceReload
//     if (activeRequestRef.current && !forceReload) {
//       console.log("Une requête est déjà en cours, stockage de la nouvelle requête pour plus tard");
//       pendingTabRequestRef.current = activeTabStatus;
//       return;
//     }
    
//     // Marquer le début d'une requête
//     activeRequestRef.current = true;
//     setLoading(true);
//     setError(null);
    
//     // Pour debug - montrer clairement quel statut est chargé
//     console.log(`🔄 CHARGEMENT DES ANNONCES POUR LE STATUT: ${activeTabStatus}`);
    
//     const rpcParams = {
//       p_search_text: searchTerm || '',
//       p_status: activeTabStatus,
//       p_city: selectedCity?.id || null,
//       p_start_date: startDate?.toISOString() || null,
//       p_end_date: endDate?.toISOString() || null,
//       p_min_price: minPrice,
//       p_max_price: maxPrice,
//       p_amenity_ids: selectedAmenityIdsFilter.length > 0 ? selectedAmenityIdsFilter : null
//     };
    
//     console.log('Paramètres RPC:', rpcParams);
    
//     try {
//       // Important: vider la liste avant le chargement pour éviter de voir des données obsolètes
//       setListings([]);
      
//       const { data, error } = await supabase.rpc('search_listings_admin', rpcParams);
      
//       // Ne mettre à jour les données que si la requête est toujours pertinente
//       if (pendingTabRequestRef.current !== null) {
//         console.log("Une autre requête a été demandée pendant le chargement - celle-ci est ignorée");
//         // Ne pas mettre à jour l'état, une autre requête va démarrer
//       } else {
//         console.log('Réponse RPC:', {
//           success: !!data && !error,
//           count: data?.length || 0,
//           statuses: data?.map(item => item.status),
//           error: error?.message
//         });
        
//         if (error) throw error;
        
//         if (!data || data.length === 0) {
//           console.log('Aucune annonce trouvée pour ce statut:', activeTabStatus);
//           setError('Aucune annonce trouvée pour ce statut.');
//           setListings([]);
//         } else {
//           setListings(data || []);
//         }
//       }
//     } catch (err: any) {
//       console.error(`Erreur lors de la recherche des annonces (${activeTabStatus}):`, err);
//       setError(err.message || 'Impossible de charger les annonces');
//       setListings([]);
//     } finally {
//       // Marquer la fin de la requête
//       activeRequestRef.current = false;
//       setLoading(false);
      
//       // Vérifier s'il y a une requête en attente
//       if (pendingTabRequestRef.current !== null) {
//         const nextTab = pendingTabRequestRef.current;
//         pendingTabRequestRef.current = null;
//         console.log(`Exécution de la requête en attente pour l'onglet: ${nextTab}`);
//         // Petit délai pour permettre la mise à jour de l'interface
//         setTimeout(() => {
//           fetchListings(true);
//         }, 50);
//       }
//     }
//   }, [user, activeTabStatus, searchTerm, selectedCity, startDate, endDate, minPrice, maxPrice, selectedAmenityIdsFilter]);

//   const fetchCities = useCallback(async () => {
//     setLoadingCities(true);
//     try {
//       const { data, error } = await supabase.from('cities').select('id, name').order('name', { ascending: true });
//       if (error) throw error;
//       setCities(data || []);
//     } catch (err: any) {
//       console.error('Erreur lors du chargement des villes:', err);
//     } finally {
//       setLoadingCities(false);
//     }
//   }, []);

//   const fetchAmenities = useCallback(async () => {
//     setLoadingAmenities(true);
//     try {
//       const { data, error } = await supabase.from('amenities').select('id, name').order('name');
//       if (error) throw error;
//       setAmenities(data || []);
//     } catch (err: any) {
//       console.error('Erreur lors du chargement des équipements:', err);
//     } finally {
//       setLoadingAmenities(false);
//     }
//   }, []);

//   const fetchListingDetails = useCallback((listingId: string) => {
//     router.push(`/admin/listing-detail/${listingId}`);
//   }, [router]);

//   const openFilterModal = () => {
//     setTempSearchTerm(searchTerm);
//     setTempSelectedCity(selectedCity?.id || '');
//     setTempStartDate(startDate);
//     setTempEndDate(endDate);
//     setTempMinPrice(minPrice?.toString() || '');
//     setTempMaxPrice(maxPrice?.toString() || '');
//     setFilterModalVisible(true);
//   };

//   const applyFilters = () => {
//     setSearchTerm(tempSearchTerm);
//     setSelectedCity(cities.find(city => city.id === tempSelectedCity) || null);
//     setStartDate(tempStartDate);
//     setEndDate(tempEndDate);
//     setMinPrice(tempMinPrice ? parseInt(tempMinPrice, 10) : null);
//     setMaxPrice(tempMaxPrice ? parseInt(tempMaxPrice, 10) : null);
//     setSelectedAmenityIdsFilter(Array.from(tempSelectedAmenityIds));
//     setFilterModalVisible(false);
//     fetchListings(true); // Force reload avec les nouveaux filtres
//   };

//   const clearAllFilters = () => {
//     setSearchTerm('');
//     setSelectedCity(null);
//     setStartDate(null);
//     setEndDate(null);
//     setMinPrice(null);
//     setMaxPrice(null);
//     setTempSelectedAmenityIds(new Set());
//     setFilterModalVisible(false);
//     fetchListings(true); // Force reload après reset des filtres
//   };

//   const handleAmenityToggleFilter = (amenityId: string) => {
//     setTempSelectedAmenityIds(currentIds => {
//       const newIds = new Set(currentIds);
//       if (newIds.has(amenityId)) {
//         newIds.delete(amenityId);
//       } else {
//         newIds.add(amenityId);
//       }
//       return newIds;
//     });
//   };

//   const handleTabChange = (newStatus: ListingStatus) => {
//     console.log('Changement d\'onglet:', newStatus);
    
//     // Annuler toute requête en attente
//     pendingTabRequestRef.current = null;
    
//     // Mettre à jour le statut actif
//     setActiveTabStatus(newStatus);
    
//     // Vider les listings immédiatement pour éviter de voir des données anciennes
//     setListings([]);
    
//     // Forcer le chargement des nouvelles données
//     setTimeout(() => {
//       fetchListings(true);
//     }, 50);
//   };

//   const showStartDatePicker = () => setStartDatePickerVisibility(true);
//   const hideStartDatePicker = () => setStartDatePickerVisibility(false);
//   const handleStartDateConfirm = (date: Date) => {
//     setTempStartDate(date);
//     hideStartDatePicker();
//   };

//   const showEndDatePicker = () => setEndDatePickerVisibility(true);
//   const hideEndDatePicker = () => setEndDatePickerVisibility(false);
//   const handleEndDateConfirm = (date: Date) => {
//     setTempEndDate(date);
//     hideEndDatePicker();
//   };

//   const handleApprove = async (listingId: string) => {
//     setIsLoadingAction(listingId);
//     try {
//       await supabase.from('pool_listings').update({ status: 'approved' }).eq('id', listingId);
//       fetchListings(true); // Forcer une actualisation après l'action
//     } catch (err: any) {
//       console.error("Erreur lors de l'approbation:", err);
//       Alert.alert("Erreur", "Impossible d'approuver cette annonce.");
//     } finally {
//       setIsLoadingAction(null);
//     }
//   };

//   const handleReject = async (listingId: string) => {
//     if (Platform.OS === 'ios') {
//       // Alert.prompt est uniquement disponible sur iOS
//       Alert.prompt(
//         'Motif du rejet',
//         'Raison du rejet (optionnel)',
//         [
//           { text: 'Annuler', style: 'cancel' },
//           {
//             text: 'Rejeter',
//             onPress: async (reason) => {
//               if (!reason?.trim()) {
//                 Alert.alert('Erreur', 'Veuillez indiquer une raison.');
//                 return;
//               }
//               setIsLoadingAction(listingId);
//               try {
//                 await supabase.from('pool_listings').update({ status: 'rejected', rejection_reason: reason }).eq('id', listingId);
//                 fetchListings(true); // Forcer une actualisation après l'action
//               } catch (err: any) {
//                 console.error("Erreur lors du rejet:", err);
//                 Alert.alert("Erreur", "Impossible de rejeter cette annonce.");
//               } finally {
//                 setIsLoadingAction(null);
//               }
//             }
//           }
//         ],
//         'plain-text'
//       );
//     } else {
//       // Pour Android et Web, utilisez prompt
//       const reason = prompt('Motif du rejet (obligatoire):');
//       if (reason === null) {
//         // L'utilisateur a annulé
//         return;
//       }
      
//       if (!reason.trim()) {
//         Alert.alert('Erreur', 'Veuillez indiquer une raison.');
//         return;
//       }
      
//       setIsLoadingAction(listingId);
//       try {
//         await supabase.from('pool_listings').update({ status: 'rejected', rejection_reason: reason }).eq('id', listingId);
//         fetchListings(true);
//       } catch (err: any) {
//         console.error("Erreur lors du rejet:", err);
//         Alert.alert("Erreur", "Impossible de rejeter cette annonce.");
//       } finally {
//         setIsLoadingAction(null);
//       }
//     }
//   };

//   // Effet pour charger les données initiales
//   useEffect(() => {
//     if (user) {
//       console.log("🔄 Chargement initial des données");
//       fetchCities();
//       fetchAmenities();
//       fetchListings();
//     }
//   }, [user, fetchCities, fetchAmenities, fetchListings]);

//   // Fonction de retentative explicite qui vide d'abord la liste
//   const retryFetchListings = () => {
//     setListings([]);
//     fetchListings(true);
//   };

//   if (!fontsLoaded) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0891b2" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Barre de filtres */}
//       <View style={styles.controlsContainer}>
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Rechercher une annonce..."
//           value={searchTerm}
//           onChangeText={setSearchTerm}
//         />
//         <TouchableOpacity style={styles.filterButton} onPress={openFilterModal}>
//           <Text style={styles.filterButtonText}>Filtrer</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Onglets */}
//       <View style={styles.tabBar}>
//         {TABS.map((tab) => (
//           <TouchableOpacity
//             key={tab.status || 'all'}
//             style={[styles.tabItem, activeTabStatus === tab.status && styles.tabItemActive]}
//             onPress={() => handleTabChange(tab.status)}
//           >
//             <Text style={[styles.tabLabel, activeTabStatus === tab.status && styles.tabLabelActive]}>
//               {tab.label}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Liste d'annonces */}
//       <ScrollView style={styles.scrollContent}>
//         <View style={styles.listContainer}>
//           {loading ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#0891b2" />
//               <Text style={styles.loadingText}>Chargement des annonces...</Text>
//             </View>
//           ) : error ? (
//             <View style={styles.errorContainer}>
//               <Text style={styles.errorText}>{error}</Text>
//               <TouchableOpacity style={styles.retryButton} onPress={retryFetchListings}>
//                 <Text style={styles.retryButtonText}>Réessayer</Text>
//               </TouchableOpacity>
//             </View>
//           ) : listings.length === 0 ? (
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyText}>Aucune annonce trouvée pour ce statut.</Text>
//               <TouchableOpacity style={styles.retryButton} onPress={retryFetchListings}>
//                 <Text style={styles.retryButtonText}>Réessayer</Text>
//               </TouchableOpacity>
//             </View>
//           ) : (
//             listings.map((listing) => (
//               <TouchableOpacity
//                 key={listing.id}
//                 style={styles.listingCard}
//                 onPress={() => fetchListingDetails(listing.id)}
//                 disabled={isLoadingAction === listing.id}
//               >
//                 {/* Entête avec image et infos principales */}
//                 <View style={styles.listingHeader}>
//                   <Image 
//                     source={{ uri: listing.first_image_url || 'https://placehold.co/120x120?text=Pool' }} 
//                     style={styles.listingImage} 
//                   />
//                   <View style={styles.listingHeaderContent}>
//                     <Text style={styles.listingTitle}>{listing.title}</Text>
//                     <Text style={styles.listingLocation}>
//                       <Text style={styles.locationLabel}>Lieu: </Text>
//                       {listing.location || 'Non spécifié'}
//                     </Text>
                    
//                     {/* Prix et capacité mis en évidence */}
//                     <View style={styles.detailsRow}>
//                       <View style={styles.detailItem}>
//                         <Text style={styles.detailLabel}>Prix:</Text>
//                         <Text style={styles.detailValue}>{listing.price_per_hour} MAD/h</Text>
//                       </View>
//                       <View style={styles.detailItem}>
//                         <Text style={styles.detailLabel}>Capacité:</Text>
//                         <Text style={styles.detailValue}>{listing.capacity || '?'} pers.</Text>
//                       </View>
//                     </View>
                    
//                     {/* Badge de statut */}
//                     <View style={[
//                       styles.statusBadge, 
//                       listing.status === 'pending' ? styles.pendingBadge : 
//                       listing.status === 'approved' ? styles.approvedBadge :
//                       styles.rejectedBadge
//                     ]}>
//                       <Text style={styles.statusText}>
//                         {listing.status === 'pending' ? 'En attente' : 
//                          listing.status === 'approved' ? 'Approuvée' : 'Rejetée'}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
                
//                 {/* Informations propriétaire */}
//                 <View style={styles.ownerSection}>
//                   <Text style={styles.ownerTitle}>Propriétaire:</Text>
//                   <Text style={styles.ownerName}>{listing.owner_name || 'Inconnu'}</Text>
//                   {listing.owner_email && (
//                     <Text style={styles.ownerEmail}>{listing.owner_email}</Text>
//                   )}
//                 </View>
                
//                 {/* Date de création */}
//                 <Text style={styles.dateInfo}>
//                   Créée le: {new Date(listing.created_at).toLocaleDateString()}
//                 </Text>
                
//                 {/* Raison de rejet si applicable */}
//                 {listing.status === 'rejected' && listing.rejection_reason && (
//                   <View style={styles.rejectionContainer}>
//                     <Text style={styles.rejectionTitle}>Raison du refus:</Text>
//                     <Text style={styles.rejectionReason}>{listing.rejection_reason}</Text>
//                   </View>
//                 )}
                
//                 {/* Actions pour annonces en attente */}
//                 {listing.status === 'pending' && (
//                   <View style={styles.listingActions}>
//                     {isLoadingAction === listing.id ? (
//                       <ActivityIndicator size="small" color="#0891b2" style={{ marginVertical: 10 }} />
//                     ) : (
//                       <>
//                         <TouchableOpacity 
//                           style={styles.approveButton} 
//                           onPress={() => handleApprove(listing.id)}
//                         >
//                           <Text style={styles.buttonText}>Approuver</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity 
//                           style={styles.rejectButton} 
//                           onPress={() => handleReject(listing.id)}
//                         >
//                           <Text style={styles.buttonText}>Rejeter</Text>
//                         </TouchableOpacity>
//                       </>
//                     )}
//                   </View>
//                 )}
//               </TouchableOpacity>
//             ))
//           )}
//         </View>
//       </ScrollView>

//       {/* Modale de filtres */}
//       <Modal
//         visible={isFilterModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setFilterModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Filtres</Text>
//               <TouchableOpacity style={styles.closeButton} onPress={() => setFilterModalVisible(false)}>
//                 <Text style={{ fontSize: 24 }}>×</Text>
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={styles.modalScroll}>
//               {/* Section Ville */}
//               <View style={styles.modalSection}>
//                 <Text style={styles.modalSectionTitle}>Filtrer par ville</Text>
//                 {loadingCities ? (
//                   <ActivityIndicator />
//                 ) : (
//                   <View style={styles.pickerContainerModal}>
//                     <Picker
//                       selectedValue={tempSelectedCity}
//                       onValueChange={(itemValue) => setTempSelectedCity(itemValue as string)}
//                       style={styles.picker}
//                     >
//                       <Picker.Item label="Toutes les villes" value="" />
//                       {cities.map((city) => (
//                         <Picker.Item key={city.id} label={city.name} value={city.id} />
//                       ))}
//                     </Picker>
//                   </View>
//                 )}
//               </View>

//               {/* Section Dates */}
//               <View style={styles.modalSection}>
//                 <Text style={styles.modalSectionTitle}>Filtrer par date</Text>
//                 <View style={styles.dateFilterContainerModal}>
//                   <View style={styles.dateInputGroupModal}>
//                     <Text style={styles.filterLabel}>Après le :</Text>
//                     <TouchableOpacity onPress={showStartDatePicker} style={styles.dateButtonModal}>
//                       <Text style={styles.dateButtonTextModal}>
//                         {tempStartDate ? tempStartDate.toLocaleDateString() : 'Choisir...'}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                   <View style={styles.dateInputGroupModal}>
//                     <Text style={styles.filterLabel}>Avant le :</Text>
//                     <TouchableOpacity onPress={showEndDatePicker} style={styles.dateButtonModal}>
//                       <Text style={styles.dateButtonTextModal}>
//                         {tempEndDate ? tempEndDate.toLocaleDateString() : 'Choisir...'}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </View>

//               {/* Section Prix */}
//               <View style={styles.modalSection}>
//                 <Text style={styles.modalSectionTitle}>Filtrer par prix</Text>
//                 <View style={styles.priceRangeContainerModal}>
//                   <View style={styles.priceInputContainerModal}>
//                     <Text style={styles.filterLabel}>Min (MAD)</Text>
//                     <TextInput
//                       style={styles.priceInputModal}
//                       placeholder="0"
//                       value={tempMinPrice}
//                       onChangeText={setTempMinPrice}
//                       keyboardType="numeric"
//                     />
//                   </View>
//                   <View style={styles.priceSeparatorModal}>
//                     <Text>-</Text>
//                   </View>
//                   <View style={styles.priceInputContainerModal}>
//                     <Text style={styles.filterLabel}>Max (MAD)</Text>
//                     <TextInput
//                       style={styles.priceInputModal}
//                       placeholder="∞"
//                       value={tempMaxPrice}
//                       onChangeText={setTempMaxPrice}
//                       keyboardType="numeric"
//                     />
//                   </View>
//                 </View>
//               </View>

//               {/* Section Équipements */}
//               <View style={styles.modalSection}>
//                 <Text style={styles.modalSectionTitle}>Filtrer par équipements</Text>
//                 {loadingAmenities ? (
//                   <ActivityIndicator />
//                 ) : (
//                   <View style={styles.amenitiesContainerModal}>
//                     {amenities.map((amenity) => {
//                       const isSelected = tempSelectedAmenityIds.has(amenity.id);
//                       return (
//                         <TouchableOpacity
//                           key={amenity.id}
//                           style={[styles.amenityChipModal, isSelected && styles.amenityChipModalSelected]}
//                           onPress={() => handleAmenityToggleFilter(amenity.id)}
//                         >
//                           <Text
//                             style={[styles.amenityLabelModal, isSelected && styles.amenityLabelModalSelected]}
//                           >
//                             {amenity.name}
//                           </Text>
//                         </TouchableOpacity>
//                       );
//                     })}
//                   </View>
//                 )}
//               </View>
//             </ScrollView>

//             {/* Boutons de la modale */}
//             <View style={styles.modalFooter}>
//               <TouchableOpacity style={styles.resetButton} onPress={clearAllFilters}>
//                 <Text style={styles.resetButtonText}>Réinitialiser</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
//                 <Text style={styles.applyButtonText}>Appliquer</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>

//         {/* Sélecteurs de date */}
//         <DateTimePickerModal
//           isVisible={isStartDatePickerVisible}
//           mode="date"
//           onConfirm={handleStartDateConfirm}
//           onCancel={hideStartDatePicker}
//         />
//         <DateTimePickerModal
//           isVisible={isEndDatePickerVisible}
//           mode="date"
//           onConfirm={handleEndDateConfirm}
//           onCancel={hideEndDatePicker}
//         />
//       </Modal>
//     </View>
//   );
// }

// // Styles complets identiques à avant
// const styles = StyleSheet.create({
// container: { 
//     flex: 1, 
//     backgroundColor: '#f9fafb', 
//     paddingTop: Platform.OS === 'android' ? 25 : 0 
//   },
//   controlsContainer: { 
//     flexDirection: 'row', 
//     paddingHorizontal: 16, 
//     paddingVertical: 10, 
//     backgroundColor: '#ffffff', 
//     borderBottomWidth: 1, 
//     borderBottomColor: '#e5e7eb', 
//     alignItems: 'center', 
//     gap: 10 
//   },
//   searchInput: { 
//     flex: 1, 
//     fontFamily: 'Montserrat-Regular', 
//     fontSize: 15, 
//     backgroundColor: '#f8fafc', 
//     paddingHorizontal: 16, 
//     paddingVertical: 10, 
//     borderRadius: 8, 
//     borderWidth: 1, 
//     borderColor: '#e5e7eb' 
//   },
//   filterButton: { 
//     backgroundColor: '#0891b2', 
//     paddingHorizontal: 12, 
//     paddingVertical: 10, 
//     borderRadius: 8, 
//     alignItems: 'center' 
//   },
//   filterButtonText: { 
//     fontFamily: 'Montserrat-SemiBold', 
//     fontSize: 14, 
//     color: '#ffffff' 
//   },
//   tabBar: { 
//     flexDirection: 'row', 
//     backgroundColor: '#ffffff', 
//     borderBottomWidth: 1, 
//     borderBottomColor: '#e5e7eb', 
//     elevation: 1 
//   },
//   tabItem: { 
//     flex: 1, 
//     paddingVertical: 14, 
//     alignItems: 'center', 
//     borderBottomWidth: 3, 
//     borderBottomColor: 'transparent' 
//   },
//   tabItemActive: { 
//     borderBottomColor: '#0891b2' 
//   },
//   tabLabel: { 
//     fontFamily: 'Montserrat-Regular', 
//     fontSize: 14, 
//     color: '#6b7280' 
//   },
//   tabLabelActive: { 
//     fontFamily: 'Montserrat-SemiBold', 
//     color: '#0891b2' 
//   },
//   scrollContent: { 
//     paddingVertical: 16, 
//     paddingHorizontal: 16 
//   },
//     listingCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     padding: 16,
//    borderWidth: 1,
//     borderColor: '#e5e7eb',
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2
//   },
//   listingHeader: {
//     flexDirection: 'row',
//     marginBottom: 12
//   },
//   listingImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 8,
//     backgroundColor: '#e5e7eb'
//   },
//   listingHeaderContent: {
//     flex: 1,
//     marginLeft: 16,
//     justifyContent: 'space-between'
//   },
//   listingTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     color: '#1e293b',
//     marginBottom: 6
//   },
//   listingLocation: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 15,
//     color: '#64748b',
//     marginBottom: 10
//   },
//   locationLabel: {
//     fontFamily: 'Montserrat-SemiBold',
//     color: '#334155'
//   },
//   detailsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12
//   },
//   detailItem: {
//     backgroundColor: '#f8fafc',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#e2e8f0',
//     minWidth: 100
//   },
//   detailLabel: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 12,
//     color: '#64748b',
//     marginBottom: 2
//   },
//   detailValue: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 16,
//     color: '#0c4a6e'
//   },
//   statusBadge: {
//     alignSelf: 'flex-start',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginTop: 8
//   },
//   pendingBadge: {
//     backgroundColor: '#fef3c7',
//     borderWidth: 1,
//     borderColor: '#fde68a'
//   },
//   approvedBadge: {
//     backgroundColor: '#d1fae5',
//     borderWidth: 1,
//     borderColor: '#a7f3d0'
//   },
//   rejectedBadge: {
//     backgroundColor: '#fee2e2',
//     borderWidth: 1,
//     borderColor: '#fecaca'
//   },
//   statusText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 13,
//     textTransform: 'uppercase'
//   },
//   ownerSection: {
//     borderTopWidth: 1,
//     borderTopColor: '#f1f5f9',
//     paddingTop: 12,
//     marginTop: 4,
//     marginBottom: 8
//   },
//   ownerTitle: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 14,
//     color: '#475569',
//     marginBottom: 4
//   },
//   ownerName: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 15,
//     color: '#334155'
//   },
//   ownerEmail: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#64748b',
//     marginTop: 2
//   },
//   dateInfo: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#64748b',
//     marginBottom: 10
//   },
//   rejectionContainer: {
//     backgroundColor: '#fee2e2',
//     padding: 12,
//     borderRadius: 8,
//     borderLeftWidth: 3,
//     borderLeftColor: '#f87171',
//     marginTop: 8,
//     marginBottom: 8
//   },
//   rejectionTitle: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 14,
//     color: '#b91c1c',
//     marginBottom: 4
//   },
//   rejectionReason: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#b91c1c'
//   },
//   listingActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 12,
//     gap: 12
//   },
//   approveButton: {
//     flex: 1,
//     backgroundColor: '#10b981',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   rejectButton: {
//     flex: 1,
//     backgroundColor: '#ef4444',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   buttonText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 15,
//     color: '#ffffff'
//   },
//   listingTitle: { 
//     fontFamily: 'Montserrat-Bold', 
//     fontSize: 16, 
//     color: '#1e293b', 
//     marginBottom: 4 
//   },
//   listingCity: { 
//     fontFamily: 'Montserrat-Regular', 
//     fontSize: 14, 
//     color: '#64748b', 
//     marginBottom: 4 
//   },
//   listingPrice: { 
//     fontFamily: 'Montserrat-SemiBold', 
//     fontSize: 14, 
//     color: '#0891b2', 
//     marginBottom: 4 
//   },
//   listingStatus: { 
//     fontFamily: 'Montserrat-Regular', 
//     fontSize: 14, 
//     color: '#64748b', 
//     marginBottom: 8 
//   },
//   rejectionContainer: { 
//     backgroundColor: '#fee2e2', 
//     padding: 8, 
//     borderRadius: 8, 
//     borderLeftWidth: 3, 
//     borderLeftColor: '#f87171' 
//   },
//   rejectionTitle: { 
//     fontFamily: 'Montserrat-SemiBold', 
//     fontSize: 12, 
//     color: '#b91c1c', 
//     marginBottom: 2 
//   },
//   rejectionReason: { 
//     fontFamily: 'Montserrat-Regular', 
//     fontSize: 12, 
//     color: '#b91c1c' 
//   },
//   listingActions: { 
//     flexDirection: 'row', 
//     gap: 10, 
//     marginTop: 10 
//   },
//   approveButton: { 
//     flex: 1, 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     backgroundColor: '#10B981', 
//     paddingVertical: 6, 
//     paddingHorizontal: 10, 
//     borderRadius: 6, 
//     justifyContent: 'center' 
//   },
//   rejectButton: { 
//     flex: 1, 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     backgroundColor: '#EF4444', 
//     paddingVertical: 6, 
//     paddingHorizontal: 10, 
//     borderRadius: 6, 
//     justifyContent: 'center' 
//   },
//   buttonText: { 
//     color: '#fff', 
//     fontFamily: 'Montserrat-SemiBold', 
//     fontSize: 12, 
//     marginLeft: 4 
//   },
//   modalOverlay: { 
//     flex: 1, 
//     backgroundColor: 'rgba(0, 0, 0, 0.5)', 
//     justifyContent: 'flex-end' 
//   },
//   modalContent: { 
//     backgroundColor: '#ffffff', 
//     borderTopLeftRadius: 20, 
//     borderTopRightRadius: 20, 
//     maxHeight: '80%', 
//     padding: 16 
//   },
//   modalHeader: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     justifyContent: 'space-between', 
//     paddingBottom: 16, 
//     borderBottomWidth: 1, 
//     borderBottomColor: '#e5e7eb' 
//   },
//   modalTitle: { 
//     fontFamily: 'Montserrat-Bold', 
//     fontSize: 20, 
//     color: '#1e293b' 
//   },
//   closeButton: { 
//     padding: 8 
//   },
//   modalScroll: { 
//     flex: 1, 
//     marginTop: 16 
//   },
//   modalSection: { 
//     marginBottom: 20 
//   },
//   modalSectionTitle: { 
//     fontFamily: 'Montserrat-Bold', 
//     fontSize: 16, 
//     color: '#374151', 
//     marginBottom: 12 
//   },
//   pickerContainerModal: { 
//     backgroundColor: '#f8fafc', 
//     borderRadius: 8, 
//     borderWidth: 1, 
//     borderColor: '#d1d5db', 
//     height: 50, 
//     justifyContent: 'center' 
//   },
//   picker: { 
//     width: '100%', 
//     height: Platform.OS === 'android' ? 50 : undefined, 
//     color: '#111827' 
//   },
//   dateFilterContainerModal: { 
//     flexDirection: 'row', 
//     gap: 10, 
//     marginBottom: 10 
//   },
//   dateInputGroupModal: { 
//     flex: 1 
//   },
//   dateButtonModal: { 
//     backgroundColor: '#f8fafc', 
//     borderRadius: 8, 
//     borderWidth: 1, 
//     borderColor: '#d1d5db', 
//     height: 45, 
//     justifyContent: 'center', 
//     paddingHorizontal: 10 
//   },
//   dateButtonTextModal: { 
//     fontFamily: 'Montserrat-Regular', 
//     fontSize: 14, 
//     color: '#374151' 
//   },
//   filterLabel: { 
//     fontFamily: 'Montserrat-SemiBold', 
//     fontSize: 12, 
//     color: '#4b5563', 
//     marginBottom: 4 
//   },
//   priceRangeContainerModal: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     gap: 10 
//   },
//   priceInputContainerModal: { 
//     flex: 1 
//   },
//   priceInputModal: { 
//     fontFamily: 'Montserrat-Regular', 
//     fontSize: 16, 
//     color: '#111827', 
//     backgroundColor: '#f8fafc', 
//     paddingHorizontal: 14, 
//     paddingVertical: 10, 
//     borderRadius: 8, 
//     borderWidth: 1, 
//     borderColor: '#d1d5db', 
//     height: 45 
//   },
//   priceSeparatorModal: { 
//     fontFamily: 'Montserrat-Regular', 
//     color: '#9ca3af', 
//     alignSelf: 'flex-end', 
//     paddingBottom: 10 
//   },
//   amenitiesContainerModal: { 
//     flexDirection: 'row', 
//     flexWrap: 'wrap', 
//     gap: 10 
//   },
//   amenityChipModal: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     gap: 8, 
//     paddingVertical: 8, 
//     paddingHorizontal: 12, 
//     borderRadius: 20, 
//     backgroundColor: '#f1f5f9', 
//     borderWidth: 1, 
//     borderColor: '#e2e8f0' 
//   },
//   amenityChipModalSelected: { 
//     backgroundColor: '#e0f2fe', 
//     borderColor: '#7dd3fc' 
//   },
//  amenityLabelModal: { 
//     fontFamily: 'Montserrat-Regular', 
//     fontSize: 14, 
//     color: '#374151' 
//   },
//   amenityLabelModalSelected: { 
//     fontFamily: 'Montserrat-SemiBold', 
//     color: '#0c4a6e' 
//   },
//   modalFooter: { 
//     flexDirection: 'row', 
//     gap: 12, 
//     paddingTop: 16, 
//     borderTopWidth: 1, 
//     borderTopColor: '#f1f5f9', 
//     marginTop: 10 
//   },
//   resetButton: { 
//     flex: 1, 
//     paddingVertical: 12, 
//     borderRadius: 10, 
//     backgroundColor: '#f1f5f9', 
//     alignItems: 'center', 
//     justifyContent: 'center', 
//     borderWidth: 1, 
//     borderColor: '#e2e8f0' 
//   },
//   resetButtonText: { 
//     fontFamily: 'Montserrat-SemiBold', 
//     fontSize: 16, 
//     color: '#475569' 
//   },
//   applyButton: { 
//     flex: 2, 
//     paddingVertical: 12, 
//     borderRadius: 10, 
//     backgroundColor: '#0891b2', 
//     alignItems: 'center', 
//     justifyContent: 'center' 
//   },
//   applyButtonText: { 
//     fontFamily: 'Montserrat-SemiBold', 
//     fontSize: 16, 
//     color: '#ffffff' 
//   },
//   loadingContainer: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     backgroundColor: '#f8fafc' 
//   },
//   loadingText: { 
//     fontFamily: 'Montserrat-Regular', 
//     fontSize: 14, 
//     color: '#64748b',
//     marginTop: 8
//   },
//   errorContainer: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     padding: 20 
//   },
//   errorText: { 
//     fontFamily: 'Montserrat-Regular', 
//     color: '#b91c1c', 
//     fontSize: 16, 
//     textAlign: 'center' 
//   },
//   retryButton: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     gap: 8, 
//     backgroundColor: '#0891b2', 
//     paddingVertical: 10, 
//     paddingHorizontal: 20, 
//     borderRadius: 8, 
//     marginTop: 12 
//   },
//   retryButtonText: { 
//     fontFamily: 'Montserrat-SemiBold', 
//     fontSize: 14, 
//     color: '#ffffff' 
//   },
//   emptyContainer: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     padding: 20, 
//     marginTop: 50 
//   },
//   emptyText: { 
//     fontFamily: 'Montserrat-Regular', 
//     fontSize: 16, 
//     color: '#6b7280', 
//     textAlign: 'center' 
//   },
//   listContainer: { 
//     padding: 0, 
//     flexGrow: 1 
//   },
//   listingHeader: {
//     flexDirection: 'row',
//     marginBottom: 10,
//   },
//   listingImage: {
//     width: 70,
//     height: 70,
//     borderRadius: 8,
//     marginRight: 12,
//     backgroundColor: '#e5e7eb'
//   },
//   listingHeaderContent: {
//     flex: 1,
//     justifyContent: 'center'
//   }
// });


// app/admin/manage-listings.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Platform,
  Modal,
  Alert,
  Image
} from 'react-native';
import { useFonts } from 'expo-font';
import {
  Montserrat_700Bold,
  Montserrat_600SemiBold,
  Montserrat_400Regular
} from '@expo-google-fonts/montserrat';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import ListingListTab from './ListingListTab';

// Types
interface City {
  id: string;
  name: string;
}

interface Amenity {
  id: string;
  name: string;
}

// Onglets avec "Tous"
const TABS = [
  { status: null, label: 'Tous' },
  { status: 'pending', label: 'En attente' },
  { status: 'approved', label: 'En ligne' },
  { status: 'rejected', label: 'Rejetées' }
] as const;

type ListingStatus = typeof TABS[number]['status'];

export default function ManageListingsScreen() {
  const [activeTabStatus, setActiveTabStatus] = useState<ListingStatus>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedAmenityIdsFilter, setSelectedAmenityIdsFilter] = useState<string[]>([]);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [tempSearchTerm, setTempSearchTerm] = useState('');
  const [tempSelectedCity, setTempSelectedCity] = useState<string>('');
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [tempMinPrice, setTempMinPrice] = useState<string>('');
  const [tempMaxPrice, setTempMaxPrice] = useState<string>('');
  const [tempSelectedAmenityIds, setTempSelectedAmenityIds] = useState<Set<string>>(new Set());
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [loadingCities, setLoadingCities] = useState(true);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingAmenities, setLoadingAmenities] = useState(true);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [tabKey, setTabKey] = useState(Date.now()); // Clé pour forcer les rechargements
  const { user } = useAuth();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'Montserrat-Bold': Montserrat_700Bold,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Regular': Montserrat_400Regular
  });

  const fetchCities = useCallback(async () => {
    setLoadingCities(true);
    try {
      const { data, error } = await supabase.from('cities').select('id, name').order('name', { ascending: true });
      if (error) throw error;
      setCities(data || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des villes:', err);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const fetchAmenities = useCallback(async () => {
    setLoadingAmenities(true);
    try {
      const { data, error } = await supabase.from('amenities').select('id, name').order('name');
      if (error) throw error;
      setAmenities(data || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des équipements:', err);
    } finally {
      setLoadingAmenities(false);
    }
  }, []);

  const openFilterModal = () => {
    setTempSearchTerm(searchTerm);
    setTempSelectedCity(selectedCity?.id || '');
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setTempMinPrice(minPrice?.toString() || '');
    setTempMaxPrice(maxPrice?.toString() || '');
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    setSearchTerm(tempSearchTerm);
    setSelectedCity(cities.find(city => city.id === tempSelectedCity) || null);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setMinPrice(tempMinPrice ? parseInt(tempMinPrice, 10) : null);
    setMaxPrice(tempMaxPrice ? parseInt(tempMaxPrice, 10) : null);
    setSelectedAmenityIdsFilter(Array.from(tempSelectedAmenityIds));
    setFilterModalVisible(false);
    
    // Force le rechargement des composants d'onglet avec une nouvelle clé
    setTabKey(Date.now());
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCity(null);
    setStartDate(null);
    setEndDate(null);
    setMinPrice(null);
    setMaxPrice(null);
    setSelectedAmenityIdsFilter([]);
    setFilterModalVisible(false);
    
    // Force le rechargement des composants d'onglet avec une nouvelle clé
    setTabKey(Date.now());
  };

  const handleAmenityToggleFilter = (amenityId: string) => {
    setTempSelectedAmenityIds(currentIds => {
      const newIds = new Set(currentIds);
      if (newIds.has(amenityId)) {
        newIds.delete(amenityId);
      } else {
        newIds.add(amenityId);
      }
      return newIds;
    });
  };

  const handleTabChange = (newStatus: ListingStatus) => {
    console.log('Changement d\'onglet:', newStatus);
    setActiveTabStatus(newStatus);
    
    // Génère une nouvelle clé à chaque changement d'onglet
    setTabKey(Date.now());
  };

  const showStartDatePicker = () => setStartDatePickerVisibility(true);
  const hideStartDatePicker = () => setStartDatePickerVisibility(false);
  const handleStartDateConfirm = (date: Date) => {
    setTempStartDate(date);
    hideStartDatePicker();
  };

  const showEndDatePicker = () => setEndDatePickerVisibility(true);
  const hideEndDatePicker = () => setEndDatePickerVisibility(false);
  const handleEndDateConfirm = (date: Date) => {
    setTempEndDate(date);
    hideEndDatePicker();
  };

  // Effet pour charger les données de base
  useEffect(() => {
    if (user) {
      console.log("🔄 Chargement initial des données");
      fetchCities();
      fetchAmenities();
    }
  }, [user, fetchCities, fetchAmenities]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barre de filtres */}
      <View style={styles.controlsContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une annonce..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.filterButton} onPress={openFilterModal}>
          <Text style={styles.filterButtonText}>Filtrer</Text>
        </TouchableOpacity>
      </View>

      {/* Onglets */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.status || 'all'}
            style={[styles.tabItem, activeTabStatus === tab.status && styles.tabItemActive]}
            onPress={() => handleTabChange(tab.status)}
          >
            <Text style={[styles.tabLabel, activeTabStatus === tab.status && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenu de l'onglet sélectionné */}
      <ListingListTab
        key={`tab-${activeTabStatus}-${tabKey}`} // Clé unique pour forcer le remontage du composant
        status={activeTabStatus}
        searchTerm={searchTerm}
        selectedCity={selectedCity?.id}
        startDate={startDate}
        endDate={endDate}
        minPrice={minPrice}
        maxPrice={maxPrice}
        selectedAmenityIdsFilter={selectedAmenityIdsFilter}
      />

      {/* Modale de filtres */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setFilterModalVisible(false)}>
                <Text style={{ fontSize: 24 }}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Section Ville */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Filtrer par ville</Text>
                {loadingCities ? (
                  <ActivityIndicator />
                ) : (
                  <View style={styles.pickerContainerModal}>
                    <Picker
                      selectedValue={tempSelectedCity}
                      onValueChange={(itemValue) => setTempSelectedCity(itemValue as string)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Toutes les villes" value="" />
                      {cities.map((city) => (
                        <Picker.Item key={city.id} label={city.name} value={city.id} />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>

              {/* Section Dates */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Filtrer par date</Text>
                <View style={styles.dateFilterContainerModal}>
                  <View style={styles.dateInputGroupModal}>
                    <Text style={styles.filterLabel}>Après le :</Text>
                    <TouchableOpacity onPress={showStartDatePicker} style={styles.dateButtonModal}>
                      <Text style={styles.dateButtonTextModal}>
                        {tempStartDate ? tempStartDate.toLocaleDateString() : 'Choisir...'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.dateInputGroupModal}>
                    <Text style={styles.filterLabel}>Avant le :</Text>
                    <TouchableOpacity onPress={showEndDatePicker} style={styles.dateButtonModal}>
                      <Text style={styles.dateButtonTextModal}>
                        {tempEndDate ? tempEndDate.toLocaleDateString() : 'Choisir...'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Section Prix */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Filtrer par prix</Text>
                <View style={styles.priceRangeContainerModal}>
                  <View style={styles.priceInputContainerModal}>
                    <Text style={styles.filterLabel}>Min (MAD)</Text>
                    <TextInput
                      style={styles.priceInputModal}
                      placeholder="0"
                      value={tempMinPrice}
                      onChangeText={setTempMinPrice}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.priceSeparatorModal}>
                    <Text>-</Text>
                  </View>
                  <View style={styles.priceInputContainerModal}>
                    <Text style={styles.filterLabel}>Max (MAD)</Text>
                    <TextInput
                      style={styles.priceInputModal}
                      placeholder="∞"
                      value={tempMaxPrice}
                      onChangeText={setTempMaxPrice}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Section Équipements */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Filtrer par équipements</Text>
                {loadingAmenities ? (
                  <ActivityIndicator />
                ) : (
                  <View style={styles.amenitiesContainerModal}>
                    {amenities.map((amenity) => {
                      const isSelected = tempSelectedAmenityIds.has(amenity.id);
                      return (
                        <TouchableOpacity
                          key={amenity.id}
                          style={[styles.amenityChipModal, isSelected && styles.amenityChipModalSelected]}
                          onPress={() => handleAmenityToggleFilter(amenity.id)}
                        >
                          <Text
                            style={[styles.amenityLabelModal, isSelected && styles.amenityLabelModalSelected]}
                          >
                            {amenity.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Boutons de la modale */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetButton} onPress={clearAllFilters}>
                <Text style={styles.resetButtonText}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Sélecteurs de date */}
        <DateTimePickerModal
          isVisible={isStartDatePickerVisible}
          mode="date"
          onConfirm={handleStartDateConfirm}
          onCancel={hideStartDatePicker}
        />
        <DateTimePickerModal
          isVisible={isEndDatePickerVisible}
          mode="date"
          onConfirm={handleEndDateConfirm}
          onCancel={hideEndDatePicker}
        />
      </Modal>
    </View>
  );
}

// Styles complets
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f9fafb', 
    paddingTop: Platform.OS === 'android' ? 25 : 0 
  },
  controlsContainer: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    backgroundColor: '#ffffff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb', 
    alignItems: 'center', 
    gap: 10 
  },
  searchInput: { 
    flex: 1, 
    fontFamily: 'Montserrat-Regular', 
    fontSize: 15, 
    backgroundColor: '#f8fafc', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  filterButton: { 
    backgroundColor: '#0891b2', 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  filterButtonText: { 
    fontFamily: 'Montserrat-SemiBold', 
    fontSize: 14, 
    color: '#ffffff' 
  },
  tabBar: { 
    flexDirection: 'row', 
    backgroundColor: '#ffffff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb', 
    elevation: 1 
  },
  tabItem: { 
    flex: 1, 
    paddingVertical: 14, 
    alignItems: 'center', 
    borderBottomWidth: 3, 
    borderBottomColor: 'transparent' 
  },
  tabItemActive: { 
    borderBottomColor: '#0891b2' 
  },
  tabLabel: { 
    fontFamily: 'Montserrat-Regular', 
    fontSize: 14, 
    color: '#6b7280' 
  },
  tabLabelActive: { 
    fontFamily: 'Montserrat-SemiBold', 
    color: '#0891b2' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f8fafc' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#ffffff', 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    maxHeight: '80%', 
    padding: 16 
  },
  modalHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb' 
  },
  modalTitle: { 
    fontFamily: 'Montserrat-Bold', 
    fontSize: 20, 
    color: '#1e293b' 
  },
  closeButton: { 
    padding: 8 
  },
  modalScroll: { 
    flex: 1, 
    marginTop: 16 
  },
  modalSection: { 
    marginBottom: 20 
  },
  modalSectionTitle: { 
    fontFamily: 'Montserrat-Bold', 
    fontSize: 16, 
    color: '#374151', 
    marginBottom: 12 
  },
  pickerContainerModal: { 
    backgroundColor: '#f8fafc', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    height: 50, 
    justifyContent: 'center' 
  },
  picker: { 
    width: '100%', 
    height: Platform.OS === 'android' ? 50 : undefined, 
    color: '#111827' 
  },
  dateFilterContainerModal: { 
    flexDirection: 'row', 
    gap: 10, 
    marginBottom: 10 
  },
  dateInputGroupModal: { 
    flex: 1 
  },
  dateButtonModal: { 
    backgroundColor: '#f8fafc', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    height: 45, 
    justifyContent: 'center', 
    paddingHorizontal: 10 
  },
  dateButtonTextModal: { 
    fontFamily: 'Montserrat-Regular', 
    fontSize: 14, 
    color: '#374151' 
  },
  filterLabel: { 
    fontFamily: 'Montserrat-SemiBold', 
    fontSize: 12, 
    color: '#4b5563', 
    marginBottom: 4 
  },
  priceRangeContainerModal: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  },
  priceInputContainerModal: { 
    flex: 1 
  },
  priceInputModal: { 
    fontFamily: 'Montserrat-Regular', 
    fontSize: 16, 
    color: '#111827', 
    backgroundColor: '#f8fafc', 
    paddingHorizontal: 14, 
    paddingVertical: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    height: 45 
  },
  priceSeparatorModal: { 
    fontFamily: 'Montserrat-Regular', 
    color: '#9ca3af', 
    alignSelf: 'flex-end', 
    paddingBottom: 10 
  },
  amenitiesContainerModal: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10 
  },
  amenityChipModal: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 20, 
    backgroundColor: '#f1f5f9', 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  amenityChipModalSelected: { 
    backgroundColor: '#e0f2fe', 
    borderColor: '#7dd3fc' 
  },
  amenityLabelModal: { 
    fontFamily: 'Montserrat-Regular', 
    fontSize: 14, 
    color: '#374151' 
  },
  amenityLabelModalSelected: { 
    fontFamily: 'Montserrat-SemiBold', 
    color: '#0c4a6e' 
  },
  modalFooter: { 
    flexDirection: 'row', 
    gap: 12, 
    paddingTop: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9', 
    marginTop: 10 
  },
  resetButton: { 
    flex: 1, 
    paddingVertical: 12, 
    borderRadius: 10, 
    backgroundColor: '#f1f5f9', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  resetButtonText: { 
    fontFamily: 'Montserrat-SemiBold', 
    fontSize: 16, 
    color: '#475569' 
  },
  applyButton: { 
    flex: 2, 
    paddingVertical: 12, 
    borderRadius: 10, 
    backgroundColor: '#0891b2', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  applyButtonText: { 
    fontFamily: 'Montserrat-SemiBold', 
    fontSize: 16, 
    color: '#ffffff' 
  }
});