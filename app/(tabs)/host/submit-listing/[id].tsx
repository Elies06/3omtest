// import { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import { ChevronLeft, Info } from 'lucide-react-native';
// import { router, useLocalSearchParams } from 'expo-router';
// import { SplashScreen } from 'expo-router';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/hooks/useAuth';
// import Animated, { FadeIn } from 'react-native-reanimated';

// SplashScreen.preventAutoHideAsync();

// type PoolListing = {
//   id: string;
//   title: string;
//   description: string;
//   location: string;
//   price_per_hour: number;
//   capacity: number;
//   status: string;
// };

// export default function SubmitListing() {
//   const { id } = useLocalSearchParams();
//   const { user } = useAuth();
//   const [listing, setListing] = useState<PoolListing | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [fontsLoaded] = useFonts({
//     'Montserrat-Bold': Montserrat_700Bold,
//     'Montserrat-SemiBold': Montserrat_600SemiBold,
//     'Montserrat-Regular': Montserrat_400Regular,
//   });

//   useEffect(() => {
//     loadListing();
//   }, [id]);

//   const loadListing = async () => {
//     try {
//       if (!user) throw new Error('Not authenticated');

//       const { data, error: fetchError } = await supabase
//         .from('pool_listings')
//         .select('*')
//         .eq('id', id)
//         .eq('owner_id', user.id)
//         .single();

//       if (fetchError) throw fetchError;
//       if (!data) throw new Error('Listing not found');

//       setListing(data);
//     } catch (err: any) {
//       console.error('Error loading listing:', err);
//       setError(err.message);
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       if (!user) throw new Error('Not authenticated');
//       if (!listing) throw new Error('No listing found');

//       const { error: updateError } = await supabase
//         .from('pool_listings')
//         .update({ status: 'pending' })
//         .eq('id', listing.id)
//         .eq('owner_id', user.id);

//       if (updateError) throw updateError;

//       router.replace('/host/dashboard');
//     } catch (err: any) {
//       console.error('Error submitting listing:', err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!fontsLoaded || !listing) {
//     return null;
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => router.back()}
//         >
//           <ChevronLeft size={24} color="#1e293b" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Soumettre l'annonce</Text>
//       </View>

//       <ScrollView style={styles.content}>
//         <Animated.View 
//           entering={FadeIn.delay(200)}
//           style={styles.preview}
//         >
//           <Image
//             source={{ uri: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' }}
//             style={styles.previewImage}
//           />

//           <View style={styles.previewContent}>
//             <Text style={styles.previewTitle}>{listing.title}</Text>
//             <Text style={styles.previewLocation}>{listing.location}</Text>
            
//             <View style={styles.previewDetails}>
//               <Text style={styles.previewPrice}>
//                 {listing.price_per_hour} MAD
//                 <Text style={styles.priceUnit}>/heure</Text>
//               </Text>
//               <Text style={styles.previewCapacity}>
//                 {listing.capacity} pers. max
//               </Text>
//             </View>

//             <Text style={styles.previewDescription}>
//               {listing.description}
//             </Text>
//           </View>
//         </Animated.View>

//         <View style={styles.infoCard}>
//           <Info size={24} color="#0891b2" />
//           <Text style={styles.infoTitle}>
//             Processus de validation
//           </Text>
//           <Text style={styles.infoText}>
//             Votre annonce sera examinée par notre équipe de modération. Nous vérifions :{'\n\n'}
//             • La qualité et la clarté des informations{'\n'}
//             • La conformité aux règles de la plateforme{'\n'}
//             • La cohérence des prix{'\n'}
//             • La sécurité des installations
//           </Text>
//         </View>

//         {error && (
//           <View style={styles.errorContainer}>
//             <Text style={styles.errorText}>{error}</Text>
//           </View>
//         )}
//       </ScrollView>

//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={[styles.submitButton, loading && styles.submitButtonDisabled]}
//           onPress={handleSubmit}
//           disabled={loading}
//         >
//           <Text style={styles.submitButtonText}>
//             {loading ? 'Soumission en cours...' : 'Soumettre pour validation'}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 20,
//     paddingTop: Platform.OS === 'web' ? 20 : 60,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f1f5f9',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#f8fafc',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   headerTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 20,
//     color: '#1e293b',
//   },
//   content: {
//     flex: 1,
//   },
//   preview: {
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     overflow: 'hidden',
//     margin: 20,
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
//   previewImage: {
//     width: '100%',
//     height: 200,
//   },
//   previewContent: {
//     padding: 16,
//   },
//   previewTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 20,
//     color: '#1e293b',
//     marginBottom: 4,
//   },
//   previewLocation: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#64748b',
//     marginBottom: 12,
//   },
//   previewDetails: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   previewPrice: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     color: '#0891b2',
//   },
//   priceUnit: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#64748b',
//   },
//   previewCapacity: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#64748b',
//   },
//   previewDescription: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#1e293b',
//     lineHeight: 20,
//   },
//   infoCard: {
//     backgroundColor: '#f0f9ff',
//     margin: 20,
//     padding: 20,
//     borderRadius: 16,
//     gap: 12,
//   },
//   infoTitle: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 18,
//     color: '#0891b2',
//   },
//   infoText: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#1e293b',
//     lineHeight: 20,
//   },
//   errorContainer: {
//     backgroundColor: '#fef2f2',
//     margin: 20,
//     padding: 16,
//     borderRadius: 12,
//   },
//   errorText: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#dc2626',
//     textAlign: 'center',
//   },
//   footer: {
//     padding: 20,
//     backgroundColor: '#ffffff',
//     borderTopWidth: 1,
//     borderTopColor: '#f1f5f9',
//   },
//   submitButton: {
//     backgroundColor: '#0891b2',
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#94a3b8',
//   },
//   submitButtonText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#ffffff',
//   },
// });


import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Image, ActivityIndicator, Alert // Ajouté ActivityIndicator, Alert
} from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { ChevronLeft, Info, AlertCircle } from 'lucide-react-native'; // Ajouté AlertCircle pour l'erreur
import { router, useLocalSearchParams, SplashScreen } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth'; // Assurez-vous que ce hook expose user, sessionInitialized, loading
import Animated, { FadeIn } from 'react-native-reanimated';

SplashScreen.preventAutoHideAsync(); // Garder visible pendant le chargement initial

// Interface pour les données de l'annonce à soumettre
// Assurez-vous qu'elle correspond aux colonnes de votre table 'pool_listings'
type PoolListing = {
  id: string; // Généralement UUID
  title: string;
  description: string | null; // Peut être null
  location: string | null; // Peut être null
  price_per_hour: number | null; // Peut être null
  capacity: number | null; // Peut être null
  status: string; // 'draft', 'pending', 'approved', 'rejected', etc.
  images?: string[]; // Supposons une colonne 'images' de type text[] pour l'aperçu
  // Ajoutez d'autres champs si nécessaire
};

export default function SubmitListing() {
  const { id } = useLocalSearchParams<{ id: string }>(); // ID de l'annonce
  const { user, sessionInitialized, loading: authLoading } = useAuth(); // États d'authentification
  const [listing, setListing] = useState<PoolListing | null>(null);
  const [loading, setLoading] = useState(true); // État de chargement pour CET écran
  const [submitting, setSubmitting] = useState(false); // État pour le bouton de soumission
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded, fontError] = useFonts({
    'Montserrat-Bold': Montserrat_700Bold,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Regular': Montserrat_400Regular,
  });

  // Fonction pour charger les détails de l'annonce
  const loadListing = useCallback(async () => {
    // Cette vérification est une sécurité, mais useEffect devrait déjà la garantir
    if (!user || !id) {
      console.warn("loadListing skipped: no user or id");
      setError("Utilisateur non connecté ou ID d'annonce manquant.");
      setLoading(false);
      SplashScreen.hideAsync();
      return;
    }

    setLoading(true);
    setError(null);
    console.log(`🚀 Fetching listing ID: ${id} for user: ${user.id}`);

    try {
      // Assurez-vous que la table est bien 'pool_listings' ou le nom correct
      const { data, error: fetchError } = await supabase
        .from('pool_listings')
        .select('*') // Récupérer toutes les colonnes pour l'aperçu
        .eq('id', id)
        .eq('owner_id', user.id) // Sécurité : Seul le propriétaire peut voir/soumettre son brouillon
        .single();

      if (fetchError) {
          if (fetchError.code === 'PGRST116') { // Code pour "No rows found"
              throw new Error("Annonce introuvable ou vous n'avez pas la permission de la voir.");
          }
          throw fetchError; // Autre erreur Supabase
      }
      if (!data) {
         // Devrait être couvert par l'erreur PGRST116 mais sécurité supplémentaire
         throw new Error('Annonce non trouvée.');
      }

      console.log("✅ Listing data received:", data);
      setListing(data as PoolListing); // Cast vers votre interface

    } catch (err: any) {
      console.error('Error loading listing:', err);
      setError(err.message);
      setListing(null);
    } finally {
      setLoading(false);
      SplashScreen.hideAsync();
    }
  }, [id, user]); // Dépend de id et user

  // useEffect pour charger les données UNIQUEMENT quand tout est prêt
  useEffect(() => {
    console.log("SubmitListing useEffect: Deps:", { id, fontsLoaded, fontError, sessionInitialized, authLoading, userExists: !!user });

    if (fontsLoaded && !fontError && sessionInitialized && !authLoading) {
      if (user && id) {
        console.log("Conditions met for loadListing, calling...");
        loadListing();
      } else if (!user) {
        console.log("Auth ready but no user found.");
        setError("Vous devez être connecté pour accéder à cette page.");
        setLoading(false);
        SplashScreen.hideAsync();
        // Optionnel : Rediriger vers login si pas connecté après initialisation
        // router.replace('/auth/login');
      } else if (!id) {
         console.log("Auth ready, user exists, but no listing ID.");
         setError("ID de l'annonce manquant.");
         setLoading(false);
         SplashScreen.hideAsync();
      }
    } else if (fontError) {
       console.error("Font loading error:", fontError);
       setError("Erreur de chargement des polices.");
       setLoading(false);
       SplashScreen.hideAsync();
    } else {
       console.log("Waiting for fonts or auth session...");
       // Garder l'indicateur de chargement principal actif
       if (!loading) setLoading(true);
    }
  }, [id, user, sessionInitialized, authLoading, fontsLoaded, fontError, loadListing]);

  // Fonction pour soumettre l'annonce
  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Erreur", "Vous devez être connecté pour soumettre.");
      return;
    }
    if (!listing) {
      Alert.alert("Erreur", "Les données de l'annonce n'ont pas pu être chargées.");
      return;
    }
    // Vérifier si l'annonce est déjà en attente ou approuvée ?
     if (listing.status === 'pending' || listing.status === 'approved') {
         Alert.alert("Info", "Cette annonce a déjà été soumise ou est approuvée.");
         // Rediriger ou simplement désactiver le bouton pourrait être mieux
         // router.replace('/host/dashboard');
         return;
     }


    setSubmitting(true); // Utiliser un état séparé pour le bouton
    setError(null);
    console.log(`Submitting listing ID: ${listing.id} for user: ${user.id}`);

    try {
      const { error: updateError } = await supabase
        .from('pool_listings') // Assurez-vous que c'est la bonne table
        .update({ status: 'pending' }) // Mettre le statut à "pending"
        .eq('id', listing.id)
        .eq('owner_id', user.id); // Sécurité : seul le propriétaire peut soumettre

      if (updateError) {
        console.error("Error updating listing status:", updateError);
        throw updateError;
      }

      console.log("✅ Listing submitted successfully.");
      Alert.alert("Succès", "Votre annonce a été soumise pour validation.");
      router.replace('/host/dashboard'); // Rediriger vers le tableau de bord hôte

    } catch (err: any) {
      console.error('Error submitting listing:', err);
      setError(err.message);
      Alert.alert("Erreur de Soumission", `La soumission a échoué : ${err.message}`);
    } finally {
      setSubmitting(false); // Arrêter le chargement du bouton
    }
  };

  // === Rendu ===

  // Affichage pendant le chargement initial (polices ou données)
  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
      </View>
    );
  }

  // Affichage si erreur de police ou erreur de chargement sans données
  if ((fontError && !listing) || (error && !listing)) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
           <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
             <ChevronLeft size={24} color="#1e293b" />
           </TouchableOpacity>
           <Text style={styles.headerTitle}>Erreur</Text>
        </View>
        <View style={styles.errorContainer}>
            <AlertCircle size={40} color="#dc2626" />
            <Text style={styles.errorText}>{error || "Erreur de chargement des polices."}</Text>
             {/* Bouton Réessayer seulement si l'erreur vient du chargement listing */}
             {error && error !== "Erreur de chargement des polices." && !error.includes("connecté") && !error.includes("manquant") && (
                 <TouchableOpacity style={styles.retryButton} onPress={loadListing}>
                     <Text style={styles.retryButtonText}>Réessayer</Text>
                 </TouchableOpacity>
              )}
        </View>
      </View>
    );
  }

  // Si pas de chargement, pas d'erreur, mais listing est null -> introuvable
   if (!listing) {
       return (
           <View style={styles.container}>
               <View style={styles.header}>
                   <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <ChevronLeft size={24} color="#1e293b" />
                   </TouchableOpacity>
                   <Text style={styles.headerTitle}>Introuvable</Text>
               </View>
               <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Annonce non trouvée ou inaccessible.</Text>
               </View>
           </View>
       );
   }


  // Rendu principal quand tout est prêt
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Soumettre l'annonce</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Aperçu de l'annonce */}
        <Animated.View
          entering={FadeIn.delay(200)}
          style={styles.preview}
        >
          <Image
            // Utiliser la première image du listing si disponible, sinon placeholder
            source={{ uri: listing.images?.[0] || 'https://placehold.co/800x400?text=Image+Piscine' }}
            style={styles.previewImage}
          />
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle}>{listing.title}</Text>
            <Text style={styles.previewLocation}>{listing.location || 'Lieu non spécifié'}</Text>
            <View style={styles.previewDetails}>
              <Text style={styles.previewPrice}>
                {listing.price_per_hour || '?'} MAD
                <Text style={styles.priceUnit}> /heure</Text>
              </Text>
              <Text style={styles.previewCapacity}>
                {listing.capacity || '?'} pers. max
              </Text>
            </View>
            <Text style={styles.previewDescription}>
              {listing.description || 'Pas de description.'}
            </Text>
          </View>
        </Animated.View>

        {/* Carte d'information */}
        <View style={styles.infoCard}>
          <Info size={24} color="#0891b2" style={{ marginTop: 4 }}/>
          <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Processus de validation</Text>
              <Text style={styles.infoText}>
                Votre annonce sera examinée par notre équipe. Nous vérifions :{'\n'}
                • La qualité des informations{'\n'}
                • La conformité aux règles{'\n'}
                • La cohérence des prix{'\n'}
                • La sécurité des installations
              </Text>
          </View>
        </View>

        {/* Affichage d'erreur spécifique à la soumission */}
        {error && error.includes("Soumission") && ( // Afficher seulement les erreurs de soumission ici
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer avec bouton */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting || listing.status === 'pending' || listing.status === 'approved'} // Désactiver si en cours ou déjà soumis/approuvé
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Soumission en cours...' :
             (listing.status === 'pending' ? 'Soumission en attente' :
              listing.status === 'approved' ? 'Annonce déjà approuvée' :
              'Soumettre pour validation')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f9fafb', // Fond légèrement gris
    },
    loadingContainer: {
       flex: 1,
       justifyContent: 'center',
       alignItems: 'center',
       backgroundColor: '#f9fafb',
    },
    errorContainer: {
        margin: 20,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fef2f2', // Rouge très clair
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    errorText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 14,
        color: '#b91c1c', // Rouge foncé
        textAlign: 'center',
        marginBottom: 10,
    },
     retryButton: {
        backgroundColor: '#0891b2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },
    retryButtonText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 14,
        color: '#ffffff',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: Platform.OS === 'web' ? 12 : 50, // Ajuster pour status bar
      backgroundColor: '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb', // Gris plus clair
    },
    backButton: {
      padding: 8, // Zone cliquable plus grande
    },
    headerTitle: {
      flex: 1, // Permet de centrer si besoin ou prend l'espace restant
      textAlign: 'center', // Centrer le titre
      fontFamily: 'Montserrat-Bold',
      fontSize: 18, // Un peu plus petit
      color: '#111827', // Noir plus doux
      marginLeft: -32, // Compenser le bouton retour pour un meilleur centrage
    },
    content: {
      flex: 1,
    },
    preview: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      margin: 16, // Marge uniforme
      overflow: 'hidden',
       ...Platform.select({
          web: {
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
          },
          default: {
            boxShadow: '#000',
            boxShadow: { width: 0, height: 2 },
            boxShadow: 0.05,
            boxShadow: 6,
            elevation: 2,
          },
       }),
    },
    previewImage: {
      width: '100%',
      height: 220, // Hauteur ajustée
      backgroundColor: '#e5e7eb',
    },
    previewContent: {
      padding: 16,
    },
    previewTitle: {
      fontFamily: 'Montserrat-Bold',
      fontSize: 22,
      color: '#111827',
      marginBottom: 4,
    },
    previewLocation: {
      fontFamily: 'Montserrat-Regular',
      fontSize: 14,
      color: '#6b7280', // Gris moyen
      marginBottom: 12,
    },
    previewDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#f3f4f6', // Séparateur léger
    },
    previewPrice: {
      fontFamily: 'Montserrat-Bold',
      fontSize: 18,
      color: '#0891b2',
    },
    priceUnit: {
      fontFamily: 'Montserrat-Regular',
      fontSize: 14,
      color: '#6b7280',
    },
    previewCapacity: {
      fontFamily: 'Montserrat-SemiBold', // Un peu plus gras
      fontSize: 14,
      color: '#4b5563', // Gris plus foncé
    },
    previewDescription: {
      fontFamily: 'Montserrat-Regular',
      fontSize: 14,
      color: '#374151', // Gris encore plus foncé
      lineHeight: 22, // Améliorer lisibilité
      marginTop: 8,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#f0f9ff', // Bleu très clair
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 20,
      borderRadius: 16,
      gap: 16, // Espace entre icône et texte
      borderWidth: 1,
      borderColor: '#e0f2fe', // Bordure bleue claire
    },
    infoTitle: {
      fontFamily: 'Montserrat-Bold',
      fontSize: 16, // Taille ajustée
      color: '#0369a1', // Bleu foncé
      marginBottom: 8,
    },
    infoText: {
      fontFamily: 'Montserrat-Regular',
      fontSize: 14,
      color: '#075985', // Bleu moyen
      lineHeight: 21,
    },
    footer: {
      padding: 16,
      paddingBottom: Platform.OS === 'web' ? 16 : 34, // Espace en bas
      backgroundColor: '#ffffff',
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
    },
    submitButton: {
      backgroundColor: '#0891b2',
      paddingVertical: 14, // Un peu moins haut
      borderRadius: 12,
      alignItems: 'center',
    },
    submitButtonDisabled: {
      backgroundColor: '#94a3b8',
      opacity: 0.7,
    },
    submitButtonText: {
      fontFamily: 'Montserrat-SemiBold',
      fontSize: 16,
      color: '#ffffff',
    },
});