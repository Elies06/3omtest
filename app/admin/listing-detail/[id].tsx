

// app/admin/listing-detail/[id].tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Montserrat_400Regular, Montserrat_600SemiBold, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { 
  ChevronLeft, Wifi, Car, Umbrella, Waves, Thermometer, ShowerHead, Bath, Flame,
  Warehouse, Coffee, UtensilsCrossed, Party, Shield, Info, Gift, Crown, Square,
  Edit, Trash2, CalendarDays
} from 'lucide-react-native';

// Map des icônes
const iconMap = {
  Wifi, 
  Car, 
  Umbrella, 
  Waves, 
  Thermometer, 
  ShowerHead, 
  Bath, 
  Flame,
  Warehouse, 
  Coffee, 
  UtensilsCrossed, 
  Party, 
  Shield, 
  Info,
  Gift, 
  Crown,
  Square
};

// Interface pour les extras
interface Extra {
  extra_id: string;
  price: number;
  pool_extras: {
    name: string;
    description: string | null;
    icon_name: string | null;
    category: string;
  };
}

// Interface pour les horaires
interface Schedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

// Interface pour les détails de l'annonce
interface ListingDetail {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  price_per_hour: number | null;
  capacity: number | null;
  status: string;
  owner_id: string;
  created_at: string;
  owner_presence: string | null;
  access_method: string | null;
  access_instructions: string | null;
  privacy_level: string | null;
  environment: string | null;
  wifi_available: boolean | null;
  wifi_code: string | null;
  pool_type: string | null;
  heated: boolean | null;
  night_lighting: boolean | null;
  water_treatment: string | null;
  pool_length: number | null;
  pool_width: number | null;
  pool_depth_min: number | null;
  pool_depth_max: number | null;
  food_allowed: string | null;
  music_allowed: string | null;
  photos_allowed: string | null;
  pets_allowed: string | null;
  min_age: string | null;
  accepted_groups: string[] | null;
  profiles: {
    full_name: string;
    avatar_url: string | null;
    city: string | null;
    email?: string | null;
  } | null;
  pool_images: { id: string; url: string; position: number }[];
  pool_amenities: { amenities: { id: string; name: string; icon_name: string } | null }[];
  pool_availability_schedules: Schedule[];
  pool_listing_extras: Extra[] | null;
  bookings: {
    id: string;
    user_id: string;
    start_time: string;
    end_time: string;
    status: string;
    guest_count: number;
    total_price: number;
  }[];
}

export default function ListingDetailScreen() {
  const { id: listingId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  
  const [listingDetail, setListingDetail] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Montserrat-Bold': Montserrat_700Bold,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Regular': Montserrat_400Regular,
  });

  // Fonction pour récupérer les détails du listing
  const fetchListingDetail = useCallback(async () => {
    if (!listingId) {
      setError("ID de l'annonce manquant");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data: listingData, error: listingError } = await supabase
        .from('pool_listings')
        .select(`
          *,
          pool_images (
            id,
            url,
            position
          ),
          pool_amenities (
            amenities (
              id,
              name,
              icon_name
            )
          ),
          pool_availability_schedules (
            day_of_week,
            start_time,
            end_time
          ),
          pool_listing_extras (
            extra_id,
            price,
            pool_extras (
              name,
              description,
              icon_name,
              category
            )
          ),
          bookings (
            id,
            user_id,
            start_time,
            end_time,
            status,
            guest_count,
            total_price
          )
        `)
        .eq('id', listingId)
        .single();

      if (listingError) {
        if (listingError.code === 'PGRST116') {
          throw new Error("Annonce introuvable.");
        }
        throw listingError;
      }

      if (!listingData) {
        throw new Error("Aucune donnée reçue.");
      }

      // Récupérer le profil du propriétaire
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, city')
        .eq('user_id', listingData.owner_id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn("Erreur lors de la récupération du profil:", profileError);
      }

      // Mapping sécurisé avec valeurs par défaut
      const formattedData: ListingDetail = {
        ...listingData,
        pool_images: listingData.pool_images || [],
        pool_amenities: listingData.pool_amenities || [],
        pool_availability_schedules: listingData.pool_availability_schedules || [],
        pool_listing_extras: listingData.pool_listing_extras || [],
        bookings: listingData.bookings || [],
        profiles: profileData || {
          full_name: 'Nom non disponible',
          avatar_url: null,
          city: null
        }
      };

      setListingDetail(formattedData);
    } catch (err: any) {
      console.error('Erreur lors du chargement:', err);
      setError(err.message || "Erreur de chargement");
      setListingDetail(null);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  // Effet pour charger les données
  useEffect(() => {
    if (fontsLoaded && !fontError && listingId) {
      fetchListingDetail();
    } else if (!listingId && fontsLoaded) {
      setError("ID non fourni.");
      setLoading(false);
    }
  }, [listingId, fetchListingDetail, fontsLoaded, fontError]);

  // Navigation vers l'édition
  const navigateToEdit = () => {
    if (listingDetail) {
      router.push(`/admin/edit-listing/${listingDetail.id}`);
    } else {
      Alert.alert("Erreur", "Données non chargées.");
    }
  };

  // Navigation vers les réservations
  const navigateToBookings = () => {
    if (listingDetail?.id) {
      router.push(`/admin/listing-bookings/${listingDetail.id}`);
    } else {
      Alert.alert("Erreur", "ID de l'annonce non disponible pour voir les réservations.");
    }
  };

  // Logique de suppression
  const handleDeleteConfirmation = () => {
    if (!listingDetail) return;
    setDeleteModalVisible(true);
  };

  const performDelete = async (idToDelete: string) => {
    setDeleteModalVisible(false);
    setIsDeleting(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('pool_listings')
        .update({ 
          status: 'deleted', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', idToDelete);

      if (updateError) throw updateError;
      
      Alert.alert("Succès", "Annonce marquée comme supprimée.");
      router.replace('/admin/manage-listings');
    } catch (err: any) {
      console.error("Error deleting listing:", err);
      setError(`Erreur suppression: ${err.message}`);
      Alert.alert("Erreur", `La suppression a échoué: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helpers
  const getBookingStatusStyle = (status: string | null | undefined) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return styles.statusConfirmed;
      case 'pending': return styles.statusPending;
      case 'cancelled':
      case 'canceled': return styles.statusCancelled;
      default: return {};
    }
  };

  // Obtenir le nom du jour à partir du numéro
  const getDayName = (day: number): string => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[day % 7] || `Jour ${day}`;
  };

  // Obtenir les options depuis le code
  const getOptionLabel = (value: string | null, type: string): string => {
    if (!value) return 'Non spécifié';
    
    const options: { [key: string]: { [key: string]: string } } = {
      owner_presence: {
        present: 'Présent pendant la baignade',
        available: 'Disponible au besoin',
        absent: 'Absent (locataire autonome)',
        nearby: 'À proximité'
      },
      access_method: {
        owner: 'Accès par le propriétaire',
        lockbox: 'Boîte à clés',
        code: 'Code d\'accès'
      },
      privacy_level: {
        none: 'Aucun vis-à-vis',
        partial: 'Partiellement isolé',
        complete: 'Totalement privé'
      },
      environment: {
        garden: 'Jardin',
        terrace: 'Terrasse',
        rooftop: 'Rooftop'
      },
      pool_type: {
        inground: 'Piscine enterrée',
        aboveground: 'Piscine hors-sol',
        natural: 'Piscine naturelle',
        other: 'Autre'
      },
      water_treatment: {
        chlorine: 'Chlore',
        salt: 'Sel',
        bromine: 'Brome',
        other: 'Autre'
      },
      food_allowed: {
        allowed: 'Autorisée',
        restricted: 'Autorisée (loin de la piscine)',
        forbidden: 'Interdite'
      },
      music_allowed: {
        yes: 'Oui',
        yes_limited: 'Oui (limitée en volume)',
        no: 'Non'
      },
      pets_allowed: {
        none: 'Aucun',
        small: 'Petits animaux uniquement',
        all: 'Tous'
      },
      min_age: {
        all: 'Tous âges',
        children_supervised: 'Enfants avec surveillance',
        teenagers: 'Adolescents (13+)',
        adults: 'Adultes uniquement (18+)'
      }
    };

    return options[type]?.[value] || value;
  };

  // Rendu
  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
      </View>
    );
  }

  if (fontError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Erreur chargement polices</Text>
      </View>
    );
  }

  if (!listingDetail || error) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Erreur' }} />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.canGoBack() ? router.back() : router.replace('/admin/manage-listings')}
          >
            <ChevronLeft size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Erreur</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Erreur de chargement"}</Text>
          <TouchableOpacity 
            style={styles.buttonLink} 
            onPress={() => router.replace('/admin/manage-listings')}
          >
            <Text style={styles.buttonLinkText}>Retour à la gestion</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: listingDetail.title || 'Détail Annonce',
          headerRight: () => (
            <TouchableOpacity 
              onPress={navigateToEdit} 
              style={{ marginRight: 15 }} 
              disabled={isDeleting}
            >
              <Edit size={24} color={isDeleting ? '#9ca3af' : '#0891b2'} />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          {listingDetail.pool_images && listingDetail.pool_images.length > 0 ? (
            <ScrollView 
              horizontal 
              style={styles.carousel}
              showsHorizontalScrollIndicator={false}
            >
              {listingDetail.pool_images.map((image) => (
                <Image 
                  key={image.id}
                  source={{ uri: image.url }} 
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>Aucune photo disponible</Text>
            </View>
          )}
        </View>

        {/* Informations principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Description: </Text> 
            {listingDetail.description || 'Non spécifiée'}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Prix par heure: </Text> 
            {listingDetail.price_per_hour ? `${listingDetail.price_per_hour} MAD` : 'Non spécifié'}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Capacité: </Text> 
            {listingDetail.capacity ? `${listingDetail.capacity} personnes` : 'Non spécifiée'}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Statut: </Text> 
            <Text style={[
              styles.statusText,
              listingDetail.status === 'approved' ? styles.statusApproved :
              listingDetail.status === 'pending' ? styles.statusPending :
              listingDetail.status === 'rejected' ? styles.statusRejected :
              styles.statusOther
            ]}>
              {listingDetail.status}
            </Text>
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Créé le: </Text> 
            {new Date(listingDetail.created_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Propriétaire */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Propriétaire</Text>
          <View style={styles.ownerContainer}>
            {listingDetail.profiles?.avatar_url ? (
              <Image 
                source={{ uri: listingDetail.profiles.avatar_url }} 
                style={styles.ownerAvatar} 
              />
            ) : (
              <View style={styles.ownerAvatarPlaceholder}>
                <Text style={styles.ownerAvatarPlaceholderText}>
                  {listingDetail.profiles?.full_name?.charAt(0) || '?'}
                </Text>
              </View>
            )}
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>
                {listingDetail.profiles?.full_name || 'Nom non disponible'}
              </Text>
              <Text style={styles.ownerDetail}>ID: {listingDetail.owner_id.substring(0, 8)}...</Text>
              {listingDetail.profiles?.city && (
                <Text style={styles.ownerDetail}>Ville: {listingDetail.profiles.city}</Text>
              )}
              {listingDetail.profiles?.email && (
                <Text style={styles.ownerDetail}>Email: {listingDetail.profiles.email}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Caractéristiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Caractéristiques</Text>
          <View style={styles.characteristicsContainer}>
            <View style={styles.charRow}>
              <Text style={styles.charLabel}>Type de piscine:</Text>
              <Text style={styles.charValue}>
                {getOptionLabel(listingDetail.pool_type, 'pool_type')}
              </Text>
            </View>
            
            {(listingDetail.pool_length || listingDetail.pool_width) && (
              <View style={styles.charRow}>
                <Text style={styles.charLabel}>Dimensions:</Text>
                <Text style={styles.charValue}>
                  {listingDetail.pool_length ? `${listingDetail.pool_length}m` : '?'}
                  {' x '}
                  {listingDetail.pool_width ? `${listingDetail.pool_width}m` : '?'}
                </Text>
              </View>
            )}
            
            {(listingDetail.pool_depth_min || listingDetail.pool_depth_max) && (
              <View style={styles.charRow}>
                <Text style={styles.charLabel}>Profondeur:</Text>
                <Text style={styles.charValue}>
                  {listingDetail.pool_depth_min ? `${listingDetail.pool_depth_min}m` : '?'}
                  {' à '}
                  {listingDetail.pool_depth_max ? `${listingDetail.pool_depth_max}m` : '?'}
                </Text>
              </View>
            )}
            
            <View style={styles.charRow}>
              <Text style={styles.charLabel}>Traitement de l'eau:</Text>
              <Text style={styles.charValue}>
                {getOptionLabel(listingDetail.water_treatment, 'water_treatment')}
              </Text>
            </View>
            
            <View style={styles.charRow}>
              <Text style={styles.charLabel}>Chauffée:</Text>
              <Text style={styles.charValue}>{listingDetail.heated ? 'Oui' : 'Non'}</Text>
            </View>
            
            <View style={styles.charRow}>
              <Text style={styles.charLabel}>Éclairage nocturne:</Text>
              <Text style={styles.charValue}>{listingDetail.night_lighting ? 'Oui' : 'Non'}</Text>
            </View>
          </View>
        </View>

        {/* Équipements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Équipements</Text>
          {listingDetail.pool_amenities && listingDetail.pool_amenities.length > 0 ? (
            <View style={styles.amenitiesContainer}>
              {listingDetail.pool_amenities.map((pa, index) => {
                const hasAmenity = pa?.amenities;
                if (!hasAmenity) return null;
                
                const iconKey = pa.amenities.icon_name || 'Square';
                const IconComponent = iconMap[iconKey] ? iconMap[iconKey] : Square;
                
                return (
                  <View key={pa.amenities.id || index} style={styles.amenityItem}>
                    <View style={styles.amenityIconContainer}>
                      <IconComponent size={18} color="#0891b2" />
                    </View>
                    <Text style={styles.amenityText}>
                      {pa.amenities.name || 'Équipement sans nom'}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.noItemsText}>Aucun équipement spécifié.</Text>
          )}
        </View>

        {/* Services et Extras */}
        {listingDetail.pool_listing_extras && listingDetail.pool_listing_extras.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services et Extras</Text>
            <View style={styles.extrasContainer}>
              {listingDetail.pool_listing_extras.map((extra, index) => {
                const hasExtra = extra?.pool_extras;
                if (!hasExtra) return null;
                
                const iconKey = extra.pool_extras.icon_name || 'Info';
                const IconComponent = iconMap[iconKey] ? iconMap[iconKey] : Info;
                
                return (
                  <View key={extra.extra_id || index} style={styles.extraItem}>
                    <View style={styles.extraHeader}>
                      <View style={styles.extraTitleContainer}>
                        <View style={styles.extraIconContainer}>
                          <IconComponent size={18} color="#0891b2" />
                        </View>
                        <Text style={styles.extraTitle}>
                          {extra.pool_extras.name || 'Sans nom'}
                        </Text>
                      </View>
                      <Text style={styles.extraPrice}>{extra.price} MAD</Text>
                    </View>
                    {extra.pool_extras.description && (
                      <Text style={styles.extraDescription}>
                        {extra.pool_extras.description}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Disponibilités */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilités</Text>
          {listingDetail.pool_availability_schedules && 
           listingDetail.pool_availability_schedules.length > 0 ? (
            <View style={styles.schedulesContainer}>
              {listingDetail.pool_availability_schedules.map((schedule, index) => (
                <View key={index} style={styles.scheduleItem}>
                  <Text style={styles.dayName}>{getDayName(schedule.day_of_week)}</Text>
                  <Text style={styles.timeRange}>
                    {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noItemsText}>Aucun horaire défini.</Text>
          )}
        </View>

        {/* Réservations récentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Réservations Récentes</Text>
          {listingDetail.bookings && listingDetail.bookings.length > 0 ? (
            <View style={styles.bookingsContainer}>
              {listingDetail.bookings.map((booking) => (
                <TouchableOpacity 
                  key={booking.id} 
                  style={styles.bookingItem}
                  onPress={() => router.push(`/admin/booking/${booking.id}`)}
                >
                  <View style={styles.bookingHeader}>
                    <Text style={styles.bookingDate}>
                      {new Date(booking.start_time).toLocaleDateString()}
                    </Text>
                    <Text style={[
                      styles.bookingStatus,
                      getBookingStatusStyle(booking.status)
                    ]}>
                      {booking.status}
                    </Text>
                  </View>
                  <View style={styles.bookingDetails}>
                    <Text style={styles.bookingDetail}>
                      <Text style={styles.bookingDetailLabel}>Horaire: </Text>
                      {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                      {new Date(booking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                    <Text style={styles.bookingDetail}>
                      <Text style={styles.bookingDetailLabel}>Participants: </Text>
                      {booking.guest_count}
                    </Text>
                    <Text style={styles.bookingDetail}>
                      <Text style={styles.bookingDetailLabel}>Total: </Text>
                      {booking.total_price} MAD
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={navigateToBookings}
              >
                <CalendarDays size={16} color="#0891b2" />
                <Text style={styles.viewAllButtonText}>
                  Voir toutes les réservations
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.noItemsText}>Aucune réservation trouvée.</Text>
          )}
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.deleteButton, isDeleting && styles.disabledButton]} 
            onPress={handleDeleteConfirmation}
            disabled={isDeleting}
          >
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>
              Supprimer l'annonce
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de confirmation de suppression */}
      {deleteModalVisible && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirmer la suppression</Text>
              <Text style={styles.modalMessage}>
                Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setDeleteModalVisible(false)}
                  disabled={isDeleting}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmDeleteButton, isDeleting && styles.disabledButton]} 
                  onPress={() => performDelete(listingDetail.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmDeleteButtonText}>Supprimer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'Montserrat-Regular',
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonLink: {
    padding: 14,
    backgroundColor: '#0891b2',
    borderRadius: 8,
  },
  buttonLinkText: {
    fontFamily: 'Montserrat-SemiBold',
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  headerTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: '#1e293b',
    marginLeft: 12,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  carousel: {
    height: 200,
    marginBottom: 8,
  },
  carouselImage: {
    width: 280,
    height: 200,
    borderRadius: 8,
    marginRight: 8,
  },
  noImageContainer: {
    height: 200,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  noImageText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#64748b',
  },
  detailText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 10,
    lineHeight: 20,
  },
  detailLabel: {
    fontFamily: 'Montserrat-SemiBold',
    color: '#374151',
  },
  statusText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
  },
  statusApproved: {
    color: '#059669',
  },
  statusPending: {
    color: '#b45309',
  },
  statusRejected: {
    color: '#b91c1c',
  },
  statusOther: {
    color: '#64748b',
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  ownerAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerAvatarPlaceholderText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    color: '#64748b',
  },
  ownerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  ownerName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  ownerDetail: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  characteristicsContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  charRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  charLabel: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#4b5563',
  },
  charValue: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#1e293b',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  amenityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  amenityText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  noItemsText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 12,
  },
  extrasContainer: {
    gap: 12,
  },
  extraItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  extraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  extraTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  extraIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  extraTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#0c4a6e',
  },
  extraPrice: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: '#0891b2',
  },
  extraDescription: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  schedulesContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 4,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dayName: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#4b5563',
  },
  timeRange: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#1e293b',
  },
  bookingsContainer: {
    gap: 12,
  },
  bookingItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  bookingDate: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#1e293b',
  },
  bookingStatus: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusConfirmed: {
    color: '#059669',
    backgroundColor: '#d1fae5',
  },
  statusPending: {
    color: '#b45309',
    backgroundColor: '#fef3c7',
  },
  statusCancelled: {
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
  },
  bookingDetails: {
    gap: 4,
  },
  bookingDetail: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#4b5563',
  },
  bookingDetailLabel: {
    fontFamily: 'Montserrat-SemiBold',
    color: '#4b5563',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#0891b2',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  viewAllButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 14,
    color: '#0891b2',
  },
  actionsContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 15,
    color: '#4b5563',
  },
  confirmDeleteButton: {
    backgroundColor: '#ef4444',
  },
  confirmDeleteButtonText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  }
});