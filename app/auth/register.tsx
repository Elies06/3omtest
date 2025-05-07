
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  useFonts,
  Montserrat_700Bold,
  Montserrat_600SemiBold,
  Montserrat_400Regular,
} from '@expo-google-fonts/montserrat';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  CircleAlert as AlertCircle,
  CircleCheck as CheckCircle2,
  MapPin,
  School as Pool,
  Users,
  WifiOff,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { SplashScreen } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth'; // Assurez-vous que le chemin est correct
import { Picker } from '@react-native-picker/picker';
import { supabase } from '@/lib/supabase'; // Assurez-vous que le chemin est correct

type ProfileType = 'swimmer' | 'host';

const PASSWORD_RULES = {
  minLength: 8,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumbers: /\d/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
};

export default function RegisterScreen() {
  const { signUp, loading: authLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    profileType: '' as ProfileType,
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    requirements: [] as string[],
  });

  // --- États pour les villes ---
  const [cities, setCities] = useState<{id: string; name: string}[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  const [fontsLoaded, fontError] = useFonts({
    'Montserrat-Bold': Montserrat_700Bold,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Regular': Montserrat_400Regular,
  });

  // --- Effet pour masquer le SplashScreen ---
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // --- Effet pour charger les villes depuis SUPABASE ---
  useEffect(() => {
    const fetchCitiesFromSupabase = async () => {
      setIsLoadingCities(true);
      setCitiesError(null);
      console.log("Fetching cities from Supabase...");

      try {
        let { data: fetchedCities, error: supabaseError } = await supabase
          .from('cities') // Nom de votre table
          .select('id, name') // Sélectionner l'ID et le nom
          .order('name', { ascending: true }); // Trier par nom

        if (supabaseError) {
          throw supabaseError;
        }

        if (fetchedCities) {
          if (fetchedCities.length > 0 && (fetchedCities[0].id === undefined || fetchedCities[0].name === undefined)) {
               console.warn("Supabase response objects might be missing 'id' or 'name' keys. Check your select query and table structure.");
               setCities([]);
           } else {
               setCities(fetchedCities as {id: string; name: string}[]);
           }
        } else {
           setCities([]);
        }

      } catch (error: any) {
        console.error("Erreur lors du chargement des villes via Supabase:", error);
        setCitiesError(error.message || "Impossible de charger la liste des villes.");
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCitiesFromSupabase();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null; // Ou un écran de chargement si vous préférez
  }

  // --- Fonctions Utilitaires ---

   const checkPasswordStrength = (password: string) => {
     const requirements = [];
     let score = 0;

     if (password.length >= PASSWORD_RULES.minLength) {
       score++;
       requirements.push('8 caractères minimum');
     }
     if (PASSWORD_RULES.hasUpperCase.test(password)) {
       score++;
       requirements.push('Une majuscule');
     }
     if (PASSWORD_RULES.hasLowerCase.test(password)) {
       score++;
       requirements.push('Une minuscule');
     }
     if (PASSWORD_RULES.hasNumbers.test(password)) {
       score++;
       requirements.push('Un chiffre');
     }
     if (PASSWORD_RULES.hasSpecialChar.test(password)) {
       score++;
       requirements.push('Un caractère spécial');
     }
     return { score, requirements };
   };

   const validateForm = () => {
     const newErrors: Record<string, string> = {};

     if (!formData.name.trim()) {
       newErrors.name = 'Le nom est requis';
     } else if (formData.name.trim().length < 2) {
       newErrors.name = 'Le nom doit contenir au moins 2 caractères';
     }

     if (!formData.email.trim()) {
       newErrors.email = "L'email est requis";
     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
       newErrors.email = "Format d'email invalide";
     }

     if (!formData.city) {
       newErrors.city = 'La ville est requise';
     }

     if (!formData.profileType) {
       newErrors.profileType = 'Le type de profil est requis';
     }

     if (!formData.password) {
       newErrors.password = 'Le mot de passe est requis';
     } else {
       const strength = checkPasswordStrength(formData.password);
       if (strength.score < 4) {
         newErrors.password =
           'Le mot de passe ne respecte pas les critères de sécurité';
       }
     }

     if (formData.password !== formData.confirmPassword) {
       newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
     }

     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };

   const handlePasswordChange = (text: string) => {
     setFormData({ ...formData, password: text });
     setPasswordStrength(checkPasswordStrength(text));
     if (errors.password) {
       setErrors({ ...errors, password: '' });
     }
   };

   const handleSubmit = async () => {
     if (validateForm()) {
       await signUp(formData.email, formData.password, {
         full_name: formData.name,
         city_id: formData.city, // Envoi de l'ID de la ville
         profile_type: formData.profileType,
       });
     }
   };

  // --- Rendu du JSX ---
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
         <ArrowLeft size={24} color="#1e293b" />
       </TouchableOpacity>
       <View style={styles.content}>
         <Animated.View entering={FadeInDown.delay(200).springify()}>
           <Text style={styles.title}>Créer un compte</Text>
           <Text style={styles.subtitle}>
             Rejoignez la communauté 3ommy et commencez à profiter de nos
             piscines
           </Text>
         </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          style={styles.form}
        >
          {/* Affichage de l'erreur d'authentification (si présente) */}
          {authError && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color="#dc2626" />
              <Text style={styles.errorText}>{authError}</Text>
            </View>
          )}

          {/* --- Champ Nom --- */}
          <View style={styles.inputGroup}>
             <View style={styles.inputContainer}>
               <User size={20} color="#64748b" style={styles.inputIcon} />
               <TextInput
                 style={styles.input}
                 placeholder="Nom complet"
                 value={formData.name}
                 onChangeText={(text) => {
                   setFormData({ ...formData, name: text });
                   if (errors.name) {
                     setErrors({ ...errors, name: '' });
                   }
                 }}
                 placeholderTextColor="#94a3b8"
               />
             </View>
             {errors.name && (
               <View style={styles.fieldError}>
                 <AlertCircle size={16} color="#dc2626" />
                 <Text style={styles.fieldErrorText}>{errors.name}</Text>
               </View>
             )}
          </View>

          {/* --- Champ Email --- */}
          <View style={styles.inputGroup}>
             <View style={styles.inputContainer}>
               <Mail size={20} color="#64748b" style={styles.inputIcon} />
               <TextInput
                 style={styles.input}
                 placeholder="Email"
                 keyboardType="email-address"
                 autoCapitalize="none"
                 value={formData.email}
                 onChangeText={(text) => {
                   setFormData({ ...formData, email: text });
                   if (errors.email) {
                     setErrors({ ...errors, email: '' });
                   }
                 }}
                 placeholderTextColor="#94a3b8"
               />
             </View>
             {errors.email && (
               <View style={styles.fieldError}>
                 <AlertCircle size={16} color="#dc2626" />
                 <Text style={styles.fieldErrorText}>{errors.email}</Text>
               </View>
             )}
          </View>

          {/* --- Champ Ville (Picker dynamique Supabase) --- */}
          <View style={styles.inputGroup}>
            <View style={[styles.pickerContainer, citiesError && styles.pickerContainerError]}>
              <MapPin size={20} color={citiesError ? "#dc2626" : "#64748b"} style={styles.inputIcon} />

              {isLoadingCities ? (
                <ActivityIndicator size="small" color="#64748b" style={styles.pickerLoading} />
              ) : citiesError ? (
                 <View style={styles.pickerErrorContainer}>
                     <WifiOff size={18} color="#dc2626" />
                     <Text style={styles.pickerErrorText}>Erreur chargement</Text>
                 </View>
              ) : (
                <Picker
                  selectedValue={formData.city}
                  style={styles.picker}
                  onValueChange={(itemValue, itemIndex) => {
                    if (itemValue !== "") {
                      setFormData({ ...formData, city: itemValue });
                      if (errors.city) {
                        setErrors({ ...errors, city: '' });
                      }
                    }
                  }}
                  dropdownIconColor="#64748b"
                  prompt="Sélectionnez votre ville"
                  enabled={!isLoadingCities && !citiesError}
                >
                  <Picker.Item label="-- Sélectionnez votre ville --" value="" style={styles.pickerItemPlaceholder} />
                  {cities.map((city) => (
                    <Picker.Item key={city.id} label={city.name} value={city.id} style={styles.pickerItem}/>
                  ))}
                </Picker>
              )}
            </View>
            {errors.city && !isLoadingCities && (
              <View style={styles.fieldError}>
                <AlertCircle size={16} color="#dc2626" />
                <Text style={styles.fieldErrorText}>{errors.city}</Text>
              </View>
            )}
             {citiesError && !isLoadingCities && (
                <View style={styles.fieldError}>
                    <AlertCircle size={16} color="#dc2626" />
                    <Text style={[styles.fieldErrorText, { flexShrink: 1 }]}>{citiesError}</Text>
                </View>
             )}
          </View>

          {/* --- Champ Type de profil --- */}
          <View style={styles.inputGroup}>
              <Text style={styles.label}>Type de profil</Text>
              <View style={styles.profileTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.profileTypeButton,
                    formData.profileType === 'swimmer' &&
                      styles.profileTypeButtonActive,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, profileType: 'swimmer' });
                    if (errors.profileType) {
                      setErrors({ ...errors, profileType: '' });
                    }
                  }}
                >
                  <Users
                    size={24}
                    color={
                      formData.profileType === 'swimmer' ? '#ffffff' : '#64748b'
                    }
                  />
                  <Text
                    style={[
                      styles.profileTypeText,
                      formData.profileType === 'swimmer' &&
                        styles.profileTypeTextActive,
                    ]}
                  >
                    Baigneur
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.profileTypeButton,
                    formData.profileType === 'host' &&
                      styles.profileTypeButtonActive,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, profileType: 'host' });
                    if (errors.profileType) {
                      setErrors({ ...errors, profileType: '' });
                    }
                  }}
                >
                  <Pool
                    size={24}
                    color={
                      formData.profileType === 'host' ? '#ffffff' : '#64748b'
                    }
                  />
                  <Text
                    style={[
                      styles.profileTypeText,
                      formData.profileType === 'host' &&
                        styles.profileTypeTextActive,
                    ]}
                  >
                    Propriétaire
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.profileType && (
                <View style={styles.fieldError}>
                  <AlertCircle size={16} color="#dc2626" />
                  <Text style={styles.fieldErrorText}>{errors.profileType}</Text>
                </View>
              )}
          </View>

          {/* --- Champ Mot de passe --- */}
          <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={handlePasswordChange}
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#64748b" />
                  ) : (
                    <Eye size={20} color="#64748b" />
                  )}
                </TouchableOpacity>
              </View>
              {passwordStrength.score > 0 && (
                <View style={styles.passwordStrength}>
                  <View style={styles.strengthBars}>
                    {[...Array(5)].map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.strengthBar,
                          index < passwordStrength.score &&
                            styles.strengthBarActive,
                          index < passwordStrength.score &&
                            styles[
                              `strengthBar${passwordStrength.score}` as keyof typeof styles
                            ],
                        ]}
                      />
                    ))}
                  </View>
                  <View style={styles.requirementsList}>
                    {passwordStrength.requirements.map((req, index) => (
                      <View key={index} style={styles.requirementItem}>
                        <CheckCircle2 size={16} color="#059669" />
                        <Text style={styles.requirementText}>{req}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
             {errors.password && (
               <View style={styles.fieldError}>
                 <AlertCircle size={16} color="#dc2626" />
                 <Text style={styles.fieldErrorText}>{errors.password}</Text>
               </View>
             )}
          </View>

          {/* --- Champ Confirmer Mot de passe --- */}
          <View style={styles.inputGroup}>
              <View style={styles.inputContainer}>
                <Lock size={20} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmer le mot de passe"
                  secureTextEntry={!showConfirmPassword}
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    setFormData({ ...formData, confirmPassword: text });
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: '' });
                    }
                  }}
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#64748b" />
                  ) : (
                    <Eye size={20} color="#64748b" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <View style={styles.fieldError}>
                  <AlertCircle size={16} color="#dc2626" />
                  <Text style={styles.fieldErrorText}>
                    {errors.confirmPassword}
                  </Text>
                </View>
              )}
          </View>

          {/* --- Bouton Créer compte --- */}
           <TouchableOpacity
             style={[
               styles.registerButton,
               (authLoading || isLoadingCities) && styles.registerButtonDisabled,
             ]}
             onPress={handleSubmit}
             disabled={authLoading || isLoadingCities}
           >
             {authLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.registerButtonText}>Créer mon compte</Text>
              )}
           </TouchableOpacity>


          {/* --- Footer --- */}
           <View style={styles.footer}>
              <Text style={styles.footerText}>
                Déjà membre ?{' '}
                <Text
                  style={styles.footerLink}
                  onPress={() => !(authLoading || isLoadingCities) && router.push('/auth/login')}
                >
                  Se connecter
                </Text>
              </Text>
           </View>

        </Animated.View>
      </View>
    </ScrollView>
  );
}

// --- Styles (Assurez-vous qu'ils sont complets et corrects) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', },
  contentContainer: { padding: 20, paddingBottom: 50, paddingTop: Platform.OS === 'ios' ? 60 : 40, },
  backButton: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, zIndex: 1, width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', },
  content: { maxWidth: 400, width: '100%', alignSelf: 'center', marginTop: 60, },
  title: { fontFamily: 'Montserrat-Bold', fontSize: 32, color: '#1e293b', marginBottom: 8, textAlign: 'center', },
  subtitle: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#64748b', marginBottom: 32, textAlign: 'center', },
  form: { gap: 16, },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', borderRadius: 12, padding: 16, },
  errorText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#dc2626', flex: 1, },
  inputGroup: { gap: 4, },
  label: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#1e293b', marginBottom: 8, paddingLeft: 4, },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#e2e8f0', height: 56, },
  inputIcon: { marginRight: 12, },
  input: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#1e293b', paddingVertical: Platform.OS === 'ios' ? 16 : 12, },
  eyeIcon: { padding: 8, },
  pickerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, paddingLeft: 16, paddingRight: Platform.OS === 'ios' ? 0 : 10, height: 56, borderWidth: 1, borderColor: '#e2e8f0', },
  pickerContainerError: { borderColor: '#fca5a5', backgroundColor: '#fef2f2', },
  pickerLoading: { flex: 1, paddingRight: 30, },
  pickerErrorContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingRight: 15, gap: 6, },
  pickerErrorText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#b91c1c', },
  picker: { flex: 1, height: '100%', color: '#1e293b', fontFamily: 'Montserrat-Regular', backgroundColor: 'transparent', marginRight: Platform.OS === 'ios' ? -15 : 0, },
  pickerItem: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#1e293b', },
  pickerItemPlaceholder: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#94a3b8', },
  profileTypeContainer: { flexDirection: 'row', gap: 12, },
  profileTypeButton: { flex: 1, flexDirection: 'column', alignItems: 'center', gap: 8, backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', },
  profileTypeButtonActive: { backgroundColor: '#0891b2', borderColor: '#0891b2', },
  profileTypeText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#64748b', },
  profileTypeTextActive: { color: '#ffffff', },
  fieldError: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, paddingHorizontal: 4, },
  fieldErrorText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#dc2626', flexShrink: 1 }, // Added flexShrink
  passwordStrength: { marginTop: 8, paddingHorizontal: 4, },
  strengthBars: { flexDirection: 'row', gap: 4, marginBottom: 8, },
  strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#e2e8f0', },
  strengthBarActive: {},
  strengthBar1: { backgroundColor: '#dc2626', },
  strengthBar2: { backgroundColor: '#f97316', },
  strengthBar3: { backgroundColor: '#facc15', },
  strengthBar4: { backgroundColor: '#a3e635', },
  strengthBar5: { backgroundColor: '#22c55e', },
  requirementsList: { gap: 4, },
  requirementItem: { flexDirection: 'row', alignItems: 'center', gap: 8, },
  requirementText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#475569', },
  registerButton: { backgroundColor: '#0891b2', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8, height: 56, },
  registerButtonDisabled: { backgroundColor: '#94a3b8', opacity: 0.7, },
  registerButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff', },
  footer: { marginTop: 32, alignItems: 'center', },
  footerText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', },
  footerLink: { fontFamily: 'Montserrat-SemiBold', color: '#0891b2', },
});