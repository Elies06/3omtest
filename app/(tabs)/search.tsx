// import { useState } from 'react';
// import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView, Platform, Image, Dimensions } from 'react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import { Search as SearchIcon, X, Shield, PartyPopper, Music, Dog, School as Pool, Thermometer, ShowerHead as Shower, Bath, Waves, Umbrella, Wifi, Car, Dumbbell, MapPin, Star, Users, List, Map as MapIcon } from 'lucide-react-native';
// import { ScrollView as GestureScrollView } from 'react-native-gesture-handler';
// import { router } from 'expo-router';
// import { SplashScreen } from 'expo-router';
// import Animated, { FadeInDown } from 'react-native-reanimated';

// const MapPlaceholder = ({ children }: { children: React.ReactNode }) => (
//   <View style={styles.mapPlaceholder}>
//     <Text style={styles.mapPlaceholderText}>
//       Carte interactive en cours de chargement...
//     </Text>
//     {children}
//   </View>
// );

// const CATEGORIES = [
//   {
//     id: 'superhost',
//     label: 'Superhôte',
//     description: 'Passez un moment chez nos hôtes reconnus.',
//     icon: Shield,
//   },
//   {
//     id: 'events',
//     label: 'Évènements',
//     description: 'Organisez votre évènement au bord d\'une piscine.',
//     icon: PartyPopper,
//   },
//   {
//     id: 'music',
//     label: 'Musique',
//     description: 'Baignez vous en musique.',
//     icon: Music,
//   },
//   {
//     id: 'pets',
//     label: 'Animaux',
//     description: 'Passez l\'après-midi sans oublier votre animal.',
//     icon: Dog,
//   },
// ];

// const AMENITIES = [
//   { id: 'indoor', label: 'Piscine intérieure', icon: Pool },
//   { id: 'heated', label: 'Piscine chauffée', icon: Thermometer },
//   { id: 'shower', label: 'Douche', icon: Shower },
//   { id: 'toilet', label: 'Toilette', icon: Bath },
//   { id: 'jacuzzi', label: 'Jacuzzi', icon: Waves },
//   { id: 'sauna', label: 'Sauna', icon: Dumbbell },
//   { id: 'sunbeds', label: 'Transats', icon: Umbrella },
//   { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
//   { id: 'parking', label: 'Parking', icon: Car },
// ];

// const POOLS = [
//   {
//     id: '1',
//     title: 'Villa avec Piscine Chauffée',
//     location: 'Marrakech, Gueliz',
//     price: 350,
//     rating: 4.8,
//     reviews: 24,
//     capacity: 8,
//     image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800',
//     amenities: ['heated', 'wifi', 'parking'],
//     isSuperhost: true,
//     coordinates: {
//       lat: 31.6295,
//       lng: -7.9811
//     }
//   },
//   {
//     id: '2',
//     title: 'Piscine Privée & Jardin',
//     location: 'Casablanca, Ain Diab',
//     price: 250,
//     rating: 4.6,
//     reviews: 18,
//     capacity: 6,
//     image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800',
//     amenities: ['sunbeds', 'wifi'],
//     isSuperhost: false,
//     coordinates: {
//       lat: 31.6315,
//       lng: -7.9831
//     }
//   },
//   {
//     id: '3',
//     title: 'Oasis Urbaine',
//     location: 'Rabat, Hay Riad',
//     price: 400,
//     rating: 4.9,
//     reviews: 32,
//     capacity: 10,
//     image: 'https://images.unsplash.com/photo-1542855816-98c09a6c2866?w=800',
//     amenities: ['heated', 'jacuzzi', 'parking', 'wifi'],
//     isSuperhost: true,
//     coordinates: {
//       lat: 31.6275,
//       lng: -7.9791
//     }
//   },
//   {
//     id: '4',
//     title: 'Riad avec Piscine',
//     location: 'Marrakech, Médina',
//     price: 300,
//     rating: 4.7,
//     reviews: 15,
//     capacity: 4,
//     image: 'https://images.unsplash.com/photo-1551024739-78e9d60c45ca?w=800',
//     amenities: ['indoor', 'wifi'],
//     isSuperhost: false,
//     coordinates: {
//       lat: 31.6335,
//       lng: -7.9851
//     }
//   },
// ];

// const MapMarker = ({ price }: { price: number }) => (
//   <View style={styles.markerContainer}>
//     <Text style={styles.markerPrice}>{price} MAD</Text>
//   </View>
// );

// export default function SearchScreen() {
//   const [showFiltersModal, setShowFiltersModal] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
//   const [selectedFilters, setSelectedFilters] = useState({
//     categories: new Set(),
//     amenities: new Set(),
//     priceRange: { min: '', max: '' },
//   });

//   const [fontsLoaded] = useFonts({
//     'Montserrat-Bold': Montserrat_700Bold,
//     'Montserrat-SemiBold': Montserrat_600SemiBold,
//     'Montserrat-Regular': Montserrat_400Regular,
//   });

//   if (!fontsLoaded) {
//     return null;
//   }

//   const renderPoolCard = (pool: typeof POOLS[0], index: number) => (
//     <Animated.View
//       key={pool.id}
//       entering={FadeInDown.delay(index * 100).springify()}
//       style={styles.poolCard}
//     >
//       <TouchableOpacity
//         style={styles.poolCardContent}
//         onPress={() => router.push(`/pool/${pool.id}`)}
//       >
//         <Image
//           source={{ uri: pool.image }}
//           style={styles.poolImage}
//           resizeMode="cover"
//         />
        
//         {pool.isSuperhost && (
//           <View style={styles.superhostBadge}>
//             <Shield size={12} color="#ffffff" />
//             <Text style={styles.superhostText}>Superhôte</Text>
//           </View>
//         )}

//         <View style={styles.poolInfo}>
//           <View style={styles.poolHeader}>
//             <Text style={styles.poolTitle} numberOfLines={1}>
//               {pool.title}
//             </Text>
//             <View style={styles.ratingContainer}>
//               <Star size={16} color="#0891b2" fill="#0891b2" />
//               <Text style={styles.ratingText}>
//                 {pool.rating} ({pool.reviews})
//               </Text>
//             </View>
//           </View>

//           <View style={styles.locationRow}>
//             <MapPin size={14} color="#64748b" />
//             <Text style={styles.locationText}>{pool.location}</Text>
//           </View>

//           <View style={styles.poolDetails}>
//             <View style={styles.capacityContainer}>
//               <Users size={14} color="#64748b" />
//               <Text style={styles.capacityText}>{pool.capacity} pers. max</Text>
//             </View>
//             <Text style={styles.priceText}>
//               <Text style={styles.priceAmount}>{pool.price} MAD</Text>
//               <Text style={styles.priceUnit}>/heure</Text>
//             </Text>
//           </View>

//           <View style={styles.amenitiesRow}>
//             {pool.amenities.map((amenityId) => {
//               const amenity = AMENITIES.find(a => a.id === amenityId);
//               if (!amenity) return null;
//               const Icon = amenity.icon;
//               return (
//                 <View key={amenityId} style={styles.amenityChip}>
//                   <Icon size={12} color="#0891b2" />
//                   <Text style={styles.amenityChipText}>{amenity.label}</Text>
//                 </View>
//               );
//             })}
//           </View>
//         </View>
//       </TouchableOpacity>
//     </Animated.View>
//   );

//   const renderMap = () => (
//     <View style={styles.mapContainer}>
//       <MapPlaceholder>
//         {POOLS.map((pool) => (
//           <View key={pool.id} style={styles.markerContainer}>
//             <Text style={styles.markerPrice}>{pool.price} MAD</Text>
//           </View>
//         ))}
//       </MapPlaceholder>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.searchBar}>
//           <SearchIcon size={20} color="#64748b" />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Rechercher une piscine"
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             placeholderTextColor="#94a3b8"
//           />
//         </View>
//         <TouchableOpacity
//           style={styles.filterButton}
//           onPress={() => setShowFiltersModal(true)}
//         >
//           <Text style={styles.filterButtonText}>Filtres</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.viewToggle}>
//         <TouchableOpacity
//           style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
//           onPress={() => setViewMode('list')}
//         >
//           <List size={20} color={viewMode === 'list' ? '#ffffff' : '#64748b'} />
//           <Text style={[styles.toggleButtonText, viewMode === 'list' && styles.toggleButtonTextActive]}>
//             Liste
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
//           onPress={() => setViewMode('map')}
//         >
//           <MapIcon size={20} color={viewMode === 'map' ? '#ffffff' : '#64748b'} />
//           <Text style={[styles.toggleButtonText, viewMode === 'map' && styles.toggleButtonTextActive]}>
//             Carte
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <Modal
//         visible={showFiltersModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowFiltersModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Filtres</Text>
//               <TouchableOpacity
//                 style={styles.closeButton}
//                 onPress={() => setShowFiltersModal(false)}
//               >
//                 <X size={24} color="#1e293b" />
//               </TouchableOpacity>
//             </View>

//             <GestureScrollView style={styles.modalScroll}>
//               <View style={styles.modalSection}>
//                 <Text style={styles.sectionTitle}>Catégories</Text>
//                 <View style={styles.categoriesGrid}>
//                   {CATEGORIES.map((category) => {
//                     const Icon = category.icon;
//                     return (
//                       <TouchableOpacity 
//                         key={category.id}
//                         style={styles.categoryCard}
//                       >
//                         <View style={styles.categoryIcon}>
//                           <Icon size={24} color="#0891b2" />
//                         </View>
//                         <Text style={styles.categoryLabel}>{category.label}</Text>
//                         <Text style={styles.categoryDescription}>
//                           {category.description}
//                         </Text>
//                       </TouchableOpacity>
//                     );
//                   })}
//                 </View>
//               </View>

//               <View style={styles.modalSection}>
//                 <Text style={styles.sectionTitle}>Équipements</Text>
//                 <View style={styles.amenitiesGrid}>
//                   {AMENITIES.map((amenity) => {
//                     const Icon = amenity.icon;
//                     return (
//                       <TouchableOpacity 
//                         key={amenity.id}
//                         style={styles.amenityCard}
//                       >
//                         <Icon size={24} color="#64748b" />
//                         <Text style={styles.amenityLabel}>{amenity.label}</Text>
//                       </TouchableOpacity>
//                     );
//                   })}
//                 </View>
//               </View>

//               <View style={styles.modalSection}>
//                 <Text style={styles.sectionTitle}>Prix</Text>
//                 <View style={styles.priceRangeContainer}>
//                   <View style={styles.priceInputContainer}>
//                     <Text style={styles.priceInputLabel}>Min</Text>
//                     <TextInput
//                       style={styles.priceInput}
//                       placeholder="0"
//                       keyboardType="numeric"
//                       placeholderTextColor="#94a3b8"
//                     />
//                     <Text style={styles.priceCurrency}>MAD</Text>
//                   </View>
//                   <View style={styles.priceSeparator} />
//                   <View style={styles.priceInputContainer}>
//                     <Text style={styles.priceInputLabel}>Max</Text>
//                     <TextInput
//                       style={styles.priceInput}
//                       placeholder="1000"
//                       keyboardType="numeric"
//                       placeholderTextColor="#94a3b8"
//                     />
//                     <Text style={styles.priceCurrency}>MAD</Text>
//                   </View>
//                 </View>
//               </View>
//             </GestureScrollView>

//             <View style={styles.modalFooter}>
//               <TouchableOpacity 
//                 style={styles.resetButton}
//                 onPress={() => {
//                   // Reset filters logic
//                 }}
//               >
//                 <Text style={styles.resetButtonText}>Réinitialiser</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={styles.applyButton}
//                 onPress={() => {
//                   setShowFiltersModal(false);
//                   // Apply filters logic
//                 }}
//               >
//                 <Text style={styles.applyButtonText}>Appliquer</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {viewMode === 'list' ? (
//         <ScrollView style={styles.content}>
//           <View style={styles.poolsGrid}>
//             {POOLS.map((pool, index) => renderPoolCard(pool, index))}
//           </View>
//         </ScrollView>
//       ) : (
//         renderMap()
//       )}
//     </View>
//   );
// }

// const { width } = Dimensions.get('window');

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     padding: 20,
//     paddingTop: Platform.OS === 'web' ? 20 : 60,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f1f5f9',
//   },
//   searchBar: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8fafc',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   searchInput: {
//     flex: 1,
//     marginLeft: 12,
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 16,
//     color: '#1e293b',
//   },
//   filterButton: {
//     backgroundColor: '#0891b2',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   filterButtonText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#ffffff',
//   },
//   content: {
//     flex: 1,
//   },
//   poolsGrid: {
//     padding: 20,
//     gap: 20,
//   },
//   poolCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     overflow: 'hidden',
//     ...Platform.select({
//       web: {
//         boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
//       },
//       default: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//         elevation: 3,
//       },
//     }),
//   },
//   poolCardContent: {
//     flex: 1,
//   },
//   poolImage: {
//     width: '100%',
//     height: 200,
//   },
//   superhostBadge: {
//     position: 'absolute',
//     top: 12,
//     left: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#0891b2',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   superhostText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 12,
//     color: '#ffffff',
//   },
//   poolInfo: {
//     padding: 16,
//   },
//   poolHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   poolTitle: {
//     flex: 1,
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     color: '#1e293b',
//     marginRight: 8,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   ratingText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 14,
//     color: '#1e293b',
//   },
//   locationRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginBottom: 12,
//   },
//   locationText: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#64748b',
//   },
//   poolDetails: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   capacityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   capacityText: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#64748b',
//   },
//   priceText: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#64748b',
//   },
//   priceAmount: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     color: '#0891b2',
//   },
//   priceUnit: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#64748b',
//   },
//   amenitiesRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   amenityChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     backgroundColor: '#f0f9ff',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   amenityChipText: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 12,
//     color: '#0891b2',
//   },
//   viewToggle: {
//     flexDirection: 'row',
//     padding: 12,
//     gap: 8,
//     backgroundColor: '#f8fafc',
//     margin: 20,
//     borderRadius: 12,
//   },
//   toggleButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   toggleButtonActive: {
//     backgroundColor: '#0891b2',
//   },
//   toggleButtonText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 14,
//     color: '#64748b',
//   },
//   toggleButtonTextActive: {
//     color: '#ffffff',
//   },
//   mapContainer: {
//     flex: 1,
//     height: '100%',
//   },
//   markerContainer: {
//     backgroundColor: '#0891b2',
//     padding: 8,
//     borderRadius: 8,
//     borderWidth: 2,
//     borderColor: '#ffffff',
//   },
//   markerPrice: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 12,
//     color: '#ffffff',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//     marginTop: Platform.OS === 'web' ? 60 : 100,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 20,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 24,
//     color: '#1e293b',
//   },
//   closeButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#f8fafc',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalScroll: {
//     flex: 1,
//   },
//   modalSection: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     color: '#1e293b',
//     marginBottom: 16,
//   },
//   categoriesGrid: {
//     gap: 16,
//   },
//   categoryCard: {
//     backgroundColor: '#f8fafc',
//     borderRadius: 16,
//     padding: 16,
//   },
//   categoryIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#e0f2fe',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   categoryLabel: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#1e293b',
//     marginBottom: 4,
//   },
//   categoryDescription: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#64748b',
//   },
//   amenitiesGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 12,
//   },
//   amenityCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     backgroundColor: '#f8fafc',
//     padding: 12,
//     borderRadius: 12,
//     width: '48%',
//   },
//   amenityLabel: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#1e293b',
//   },
//   priceRangeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//   },
//   priceInputContainer: {
//     flex: 1,
//     backgroundColor: '#f8fafc',
//     borderRadius: 12,
//     padding: 12,
//   },
//   priceInputLabel: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 12,
//     color: '#64748b',
//     marginBottom: 4,
//   },
//   priceInput: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#1e293b',
//   },
//   priceCurrency: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 12,
//     color: '#64748b',
//     marginTop: 4,
//   },
//   priceSeparator: {
//     width: 16,
//     height: 2,
//     backgroundColor: '#e2e8f0',
//   },
//   modalFooter: {
//     flexDirection: 'row',
//     gap: 12,
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#f1f5f9',
//   },
//   resetButton: {
//     flex: 1,
//     paddingVertical: 16,
//     borderRadius: 12,
//     backgroundColor: '#f1f5f9',
//     alignItems: 'center',
//   },
//   resetButtonText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#64748b',
//   },
//   applyButton: {
//     flex: 2,
//     paddingVertical: 16,
//     borderRadius: 12,
//     backgroundColor: '#0891b2',
//     alignItems: 'center',
//   },
//   applyButtonText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#ffffff',
//   },
//   mapPlaceholder: {
//     flex: 1,
//     backgroundColor: '#f8fafc',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   mapPlaceholderText: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 16,
//     color: '#64748b',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
// });

/// Dans app/(tabs)/search.tsx (ou le chemin de votre écran de recherche)
import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView,
    Platform, Image, Dimensions, ActivityIndicator, FlatList, SafeAreaView
} from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import {
    Search as SearchIcon, X as XIcon, Filter, List, Map as MapIcon, AlertCircle, MapPin, Users, Star,
    CheckSquare, Square, // Pour les checkboxes équipements
    // S'assurer que les icônes pour iconMap sont importées si utilisées dans les filtres (pas le cas ici)
    Wifi, Car, Umbrella, Waves, Thermometer, ShowerHead as Shower, Bath, Flame, Warehouse, Grill, Pool, Dumbbell
} from 'lucide-react-native';
import { ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import { router, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';

// --- Interfaces ---
interface PublicListing {
    id: string; title: string; location: string | null; price_per_hour: number | null; capacity: number | null; first_image_url: string | null;
}
interface Amenity { id: string; name: string; } // Pour la liste des filtres

// MapPlaceholder & MapMarker (inchangés)
const MapPlaceholder = ({ children }: { children: React.ReactNode }) => ( <View style={styles.mapPlaceholder}><Text style={styles.mapPlaceholderText}>Carte indisponible</Text>{children}</View> );
const MapMarker = ({ price }: { price: number }) => ( <View style={styles.markerContainer}><Text style={styles.markerPrice}>{price} MAD</Text></View> );


export default function SearchScreen() {
    // États UI
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchTerm = useDebounce(searchQuery, 500);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    // --- États pour les Filtres ---
    const [appliedFilters, setAppliedFilters] = useState<{ amenities: string[]; minPrice: number | null; maxPrice: number | null; }>({ amenities: [], minPrice: null, maxPrice: null });
    const [tempFilters, setTempFilters] = useState<{ amenities: Set<string>; priceRange: { min: string; max: string }; }>({ amenities: new Set(), priceRange: { min: '', max: '' } });

    // État pour les équipements disponibles
    const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
    const [loadingAmenities, setLoadingAmenities] = useState(true);
    const [amenitiesError, setAmenitiesError] = useState<string | null>(null);

    // États données & chargement/erreur liste
    const [listings, setListings] = useState<PublicListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [fontsLoaded, fontError] = useFonts({ 'Montserrat-Bold': Montserrat_700Bold, 'Montserrat-SemiBold': Montserrat_600SemiBold, 'Montserrat-Regular': Montserrat_400Regular });

    // --- Fonctions Fetch ---
    const fetchAmenities = useCallback(async () => { setLoadingAmenities(true); setAmenitiesError(null); try { console.log("🚀 Fetching amenities for filter modal..."); const { data, error } = await supabase.from('amenities').select('id, name').order('name'); if (error) throw error; setAvailableAmenities(data || []); console.log(`✅ Loaded ${data?.length || 0} amenities.`); } catch (err: any) { console.error("Error loading amenities:", err); setAmenitiesError("Erreur chargement."); } finally { setLoadingAmenities(false); } }, []);

    // fetchPublicListings (appelle RPC avec tous les filtres)
    const fetchPublicListings = useCallback(async (searchTermToUse: string, currentFilters: typeof appliedFilters) => {
        setLoading(true); setError(null);
        const rpcParams = {
            p_search_text: searchTermToUse || '', 
            p_city: null, p_start_date: null, p_end_date: null, // Filtres non utilisés pour l'instant
            p_min_price: currentFilters.minPrice,
            p_max_price: currentFilters.maxPrice,
            p_amenity_ids: currentFilters.amenities.length > 0 ? currentFilters.amenities : null
        };
        console.log(`🚀 Calling RPC search_public_listings with params:`, rpcParams);
        try {
            const { data, error: rpcError } = await supabase.rpc('search_public_listings', rpcParams);
            if (rpcError) throw rpcError;
            setListings((data as PublicListing[]) || []);
        } catch (err: any) { console.error("Error calling search RPC:", err); setError(err.message || "Erreur recherche."); setListings([]); }
        finally { setLoading(false); }
    }, []);

    // Charger équipements au montage
    useEffect(() => { fetchAmenities(); }, [fetchAmenities]);

    // useEffect qui déclenche le fetch basé sur le terme décalé ET les filtres appliqués
    useEffect(() => { if (fontsLoaded && !fontError) { fetchPublicListings(debouncedSearchTerm, appliedFilters); } }, [fontsLoaded, fontError, fetchPublicListings, debouncedSearchTerm, appliedFilters]);

    // --- Gestion Modale Filtres ---
    const openFilterModal = () => { setTempFilters({ amenities: new Set(appliedFilters.amenities), priceRange: { min: appliedFilters.minPrice?.toString() || '', max: appliedFilters.maxPrice?.toString() || '' } }); setShowFiltersModal(true); };
    const applyFilters = () => { const parsedMin = parseInt(tempFilters.priceRange.min, 10); const parsedMax = parseInt(tempFilters.priceRange.max, 10); setAppliedFilters({ amenities: Array.from(tempFilters.amenities), minPrice: isNaN(parsedMin) ? null : parsedMin, maxPrice: isNaN(parsedMax) ? null : parsedMax }); setShowFiltersModal(false); };
    const resetTemporaryFilters = () => { setTempFilters({ amenities: new Set(), priceRange: { min: '', max: '' } }); };
    const clearAllFilters = () => { setSearchQuery(''); setAppliedFilters({ amenities: [], minPrice: null, maxPrice: null }); setShowFiltersModal(false); /* Le useEffect relancera le fetch */ };
    const handleAmenityToggleFilter = (amenityId: string) => { setTempFilters(current => { const newSet = new Set(current.amenities); if (newSet.has(amenityId)) newSet.delete(amenityId); else newSet.add(amenityId); return { ...current, amenities: newSet }; }); };
    const handlePriceChange = (type: 'min' | 'max', value: string) => { const numericValue = value.replace(/[^0-9]/g, ''); setTempFilters(current => ({ ...current, priceRange: { ...current.priceRange, [type]: numericValue } })); };
    const filtersAreActive = appliedFilters.amenities.length > 0 || appliedFilters.minPrice != null || appliedFilters.maxPrice != null;

    // --- Rendu ---
    if (!fontsLoaded && !fontError) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
    if (fontError) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur chargement polices.</Text></SafeAreaView>; }

    // Rendu carte annonce
    const renderPoolCard = ({ item, index }: { item: PublicListing, index: number }) => { const imageUrl = item.first_image_url || 'https://placehold.co/800x400?text=Image+Indisponible'; return ( <Animated.View entering={FadeInDown.delay(index * 50).springify()} style={styles.poolCard} > <TouchableOpacity style={styles.poolCardContent} onPress={() => router.push(`/pool/${item.id}`)} > <Image source={{ uri: imageUrl }} style={styles.poolImage} resizeMode="cover" /> <View style={styles.poolInfo}> <View style={styles.poolHeader}> <Text style={styles.poolTitle} numberOfLines={1}>{item.title}</Text> </View> <View style={styles.locationRow}> <MapPin size={14} color="#64748b" /> <Text style={styles.locationText}>{item.location || 'Lieu non défini'}</Text> </View> <View style={styles.poolDetails}> <View style={styles.capacityContainer}> <Users size={14} color="#64748b" /> <Text style={styles.capacityText}>{item.capacity ?? '?'} pers. max</Text> </View> <Text style={styles.priceText}> <Text style={styles.priceAmount}>{item.price_per_hour || 'N/A'} MAD</Text> <Text style={styles.priceUnit}>/heure</Text> </Text> </View> </View> </TouchableOpacity> </Animated.View> ); };
    // Rendu Carte
    const renderMap = () => ( <View style={styles.mapContainer}><MapPlaceholder /></View> );

    // Rendu Principal
    return (
        <SafeAreaView style={styles.container}>
             <Stack.Screen options={{ title: 'Rechercher une Piscine' }} />
             <View style={styles.header}>
                 <View style={styles.searchBar}> <SearchIcon size={20} color="#64748b" /> <TextInput style={styles.searchInput} placeholder="Rechercher..." value={searchQuery} onChangeText={setSearchQuery} autoCapitalize="none" autoCorrect={false} placeholderTextColor="#94a3b8" /> </View>
                 <TouchableOpacity style={styles.filterButton} onPress={openFilterModal}> <Filter size={18} color="#ffffff"/> <Text style={styles.filterButtonText}>Filtres</Text>{filtersAreActive && <View style={styles.filterActiveDot}/>} </TouchableOpacity>
             </View>
             <View style={styles.viewToggle}>
                 <TouchableOpacity style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]} onPress={() => setViewMode('list')} > <List size={20} color={viewMode === 'list' ? '#ffffff' : '#64748b'} /> <Text style={[styles.toggleButtonText, viewMode === 'list' && styles.toggleButtonTextActive]}> Liste </Text> </TouchableOpacity>
                 <TouchableOpacity style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]} onPress={() => setViewMode('map')} > <MapIcon size={20} color={viewMode === 'map' ? '#ffffff' : '#64748b'} /> <Text style={[styles.toggleButtonText, viewMode === 'map' && styles.toggleButtonTextActive]}> Carte </Text> </TouchableOpacity>
             </View>

             {/* Modale Filtres (Connectée) */}
             <Modal visible={showFiltersModal} animationType="slide" transparent={true} onRequestClose={() => setShowFiltersModal(false)} >
                 <View style={styles.modalOverlay}>
                     <View style={styles.modalContent}>
                         <View style={styles.modalHeader}><Text style={styles.modalTitle}>Filtres</Text><TouchableOpacity style={styles.closeButton} onPress={() => setShowFiltersModal(false)}><XIcon size={24} color="#1e293b" /></TouchableOpacity></View>
                         <GestureScrollView style={styles.modalScroll}>
                             {/* Section Équipements Dynamique */}
                              <View style={styles.modalSection}>
                                 <Text style={styles.sectionTitle}>Équipements</Text>
                                 {loadingAmenities ? <ActivityIndicator /> : amenitiesError ? <Text style={styles.errorTextPicker}>{amenitiesError}</Text> : (
                                     <View style={styles.amenitiesContainerModal}>
                                         {availableAmenities.length === 0 && <Text style={styles.noItemsText}>Aucun équipement</Text>}
                                         {availableAmenities.map((amenity) => {
                                             const isSelected = tempFilters.amenities.has(amenity.id);
                                             return (
                                                 <TouchableOpacity key={amenity.id} style={[styles.amenityChipModal, isSelected && styles.amenityChipModalSelected]} onPress={() => handleAmenityToggleFilter(amenity.id)}>
                                                     {isSelected ? <CheckSquare size={18} color="#0891b2" /> : <Square size={18} color="#6b7280" />}
                                                     <Text style={[styles.amenityLabelModal, isSelected && styles.amenityLabelModalSelected]}>{amenity.name}</Text>
                                                 </TouchableOpacity>
                                             );
                                         })}
                                     </View>
                                 )}
                             </View>
                             {/* Section Prix */}
                              <View style={styles.modalSection}>
                                <Text style={styles.sectionTitle}>Prix par heure</Text>
                                <View style={styles.priceRangeContainerModal}>
                                    <View style={styles.priceInputContainerModal}><Text style={styles.filterLabel}>Min (MAD)</Text><TextInput style={styles.priceInputModal} placeholder="0" value={tempFilters.priceRange.min} onChangeText={(text) => handlePriceChange('min', text)} keyboardType="numeric" placeholderTextColor="#9ca3af" /></View>
                                     <View style={styles.priceSeparatorModal}><Text>-</Text></View>
                                     <View style={styles.priceInputContainerModal}><Text style={styles.filterLabel}>Max (MAD)</Text><TextInput style={styles.priceInputModal} placeholder="Aucun" value={tempFilters.priceRange.max} onChangeText={(text) => handlePriceChange('max', text)} keyboardType="numeric" placeholderTextColor="#9ca3af" /></View>
                                </View>
                              </View>
                               {/* Ajouter d'autres sections de filtre ici si besoin (ex: Catégories si dynamiques) */}
                         </GestureScrollView>
                          {/* Footer Modale */}
                         <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.resetButton} onPress={resetTemporaryFilters}><Text style={styles.resetButtonText}>Réinitialiser</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}><Text style={styles.applyButtonText}>Appliquer Filtres</Text></TouchableOpacity>
                         </View>
                     </View>
                 </View>
             </Modal>

            {/* Affichage Liste ou Carte */}
            {viewMode === 'list' ? (
                  loading ? ( <ActivityIndicator size="large" color="#0891b2" style={{ flex: 1, marginTop: 50 }} /> )
                : error ? ( <View style={styles.errorContainer}><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={() => fetchPublicListings(debouncedSearchTerm, appliedFilters)} style={styles.retryButton}><Text style={styles.retryButtonText}>Réessayer</Text></TouchableOpacity></View> ) // Bouton réessayer en cas d'erreur
                : ( <FlatList data={listings} renderItem={renderPoolCard} keyExtractor={(item) => item.id} style={styles.content} contentContainerStyle={styles.poolsGrid} ListEmptyComponent={<View style={{marginTop: 50}}><Text style={styles.emptyText}>Aucune piscine trouvée.</Text></View>} /> )
            ) : ( renderMap() )}
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20},
    errorText: { fontFamily: 'Montserrat-Regular', color: '#dc2626', fontSize: 16, textAlign: 'center', marginBottom: 15 }, // Marge basse pour bouton retry
    retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0891b2', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10, gap: 8 },
    retryButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, paddingTop: Platform.OS === 'web' ? 10 : 50, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#ffffff'},
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 12, height: 44 },
    searchInput: { flex: 1, marginLeft: 10, fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#1e293b' },
    filterButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0891b2', paddingHorizontal: 16, borderRadius: 10, height: 44, justifyContent: 'center' },
    filterButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#ffffff' },
    filterActiveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#facc15', marginLeft: 4 },
    content: { flex: 1 },
    poolsGrid: { padding: 16, gap: 16, flexGrow: 1 }, // flexGrow pour empty list
    poolCard: { backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
    poolCardContent: { flex: 1 },
    poolImage: { width: '100%', height: 180, backgroundColor: '#e0e0e0' },
    poolInfo: { padding: 12 },
    poolHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
    poolTitle: { flex: 1, fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#1e293b', marginRight: 8 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
    locationText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#64748b' },
    poolDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    capacityContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    capacityText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#64748b' },
    priceText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#64748b' },
    priceAmount: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#0891b2' },
    priceUnit: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#64748b' },
    viewToggle: { flexDirection: 'row', padding: 8, gap: 8, backgroundColor: '#f1f5f9', marginHorizontal: 20, marginVertical: 10, borderRadius: 10 },
    toggleButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8 },
    toggleButtonActive: { backgroundColor: '#0891b2' },
    toggleButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: '#64748b' },
    toggleButtonTextActive: { color: '#ffffff' },
    mapContainer: { flex: 1 },
    markerContainer: { backgroundColor: '#0891b2', padding: 8, borderRadius: 8, borderWidth: 2, borderColor: '#ffffff' },
    markerPrice: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: '#ffffff' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, paddingBottom: Platform.OS === 'ios' ? 40 : 30, maxHeight: '85%', minHeight: 400 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    modalTitle: { fontFamily: 'Montserrat-Bold', fontSize: 20, color: '#1e293b' },
    closeButton: { padding: 8 },
    modalScroll: { flexShrink: 1, marginTop: 16 },
    modalSection: { marginBottom: 24 },
    sectionTitle: { fontFamily: 'Montserrat-Bold', fontSize: 16, color: '#374151', marginBottom: 12 }, // Style réutilisé
    errorTextPicker: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#b91c1c', textAlign: 'center' }, // Centré pour erreur amenities
    noItemsText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#6b7280', fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 },
    // Styles Filtre Équipements Modale
    amenitiesContainerModal: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    amenityChipModal: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: 'transparent' },
    amenityChipModalSelected: { backgroundColor: '#e0f2fe', borderColor: '#7dd3fc' },
    amenityLabelModal: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#374151' },
    amenityLabelModalSelected: { fontFamily: 'Montserrat-SemiBold', color: '#0c4a6e' },
    // Styles Filtre Prix Modale
    priceRangeContainerModal: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    priceInputContainerModal: { flex: 1 },
    priceInputModal: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#111827', backgroundColor: '#f8fafc', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', height: 45 },
    priceSeparatorModal: { fontFamily: 'Montserrat-Regular', color: '#9ca3af', alignSelf: 'flex-end', paddingBottom: 10 },
    filterLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: '#4b5563', marginBottom: 4 },
    // Styles Footer Modale
    modalFooter: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 10 },
    resetButton: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    resetButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#475569' },
    applyButton: { flex: 2, paddingVertical: 12, borderRadius: 10, backgroundColor: '#0891b2', alignItems: 'center', justifyContent: 'center' },
    applyButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
    mapPlaceholder: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', padding: 20 },
    mapPlaceholderText: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
    emptyText: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 50, padding: 20 },
});