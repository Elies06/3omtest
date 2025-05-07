// // Dans PROJECT/app/(tabs)/host/payout-settings.tsx - VERSION COMPLÈTE CORRIGÉE

// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//     View, Text, StyleSheet, TextInput, TouchableOpacity,
//     ScrollView, ActivityIndicator, Alert, SafeAreaView, Platform
// } from 'react-native';
// import { Stack, router } from 'expo-router';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/hooks/useAuth'; // Pour user, profile (nom), refreshProfile
// import { Banknote, Building, Save, User as UserIcon } from 'lucide-react-native';

// // Importer les polices si utilisées
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';

// // Interface pour les erreurs de formulaire
// type FormErrors = { [key: string]: string; };

// export default function PayoutSettingsScreen() {
//     // Récupérer l'utilisateur, son profil (pour le nom) et le loading global
//     const { user, profile, isLoading: isLoadingAuth, refreshProfile } = useAuth();

//     // États locaux pour les champs du formulaire
//     const [accountHolder, setAccountHolder] = useState(''); // Ajouté
//     const [bankName, setBankName] = useState('');
//     const [rib, setRib] = useState('');         // RIB tel que saisi

//     // États pour la gestion de l'écran
//     const [loadingAccountData, setLoadingAccountData] = useState(true); // Chargement spécifique aux données bancaires
//     const [isSaving, setIsSaving] = useState(false);
//     const [saveError, setSaveError] = useState<string | null>(null);
//     const [saveSuccess, setSaveSuccess] = useState(false);
//     const [formErrors, setFormErrors] = useState<FormErrors>({});

//     const [fontsLoaded, fontError] = useFonts({
//         'Montserrat-Bold': Montserrat_700Bold,
//         'Montserrat-SemiBold': Montserrat_600SemiBold,
//         'Montserrat-Regular': Montserrat_400Regular,
//     });

//     // --- Chargement des données bancaires existantes de l'hôte ---
//     const loadBankAccount = useCallback(async () => {
//         if (!user) { setLoadingAccountData(false); return; } // Pas besoin si pas d'user
//         setLoadingAccountData(true);
//         console.log("PayoutSettingsScreen: Fetching existing bank account data...");
//         try {
//             const { data, error } = await supabase
//                 .from('host_bank_accounts') // Lire depuis la nouvelle table
//                 .select('account_holder, bank_name, iban') // 'iban' contient le RIB
//                 .eq('user_id', user.id) // Utiliser l'ID de l'utilisateur connecté
//                 .maybeSingle(); // Il peut y avoir 0 ou 1 ligne

//             if (error && error.code !== 'PGRST116') throw error; // Ignorer "not found"

//             if (data) {
//                 console.log("PayoutSettingsScreen: Existing data found:", data);
//                 setAccountHolder(data.account_holder || profile?.full_name || ''); // Pré-remplir avec DB ou profil
//                 setBankName(data.bank_name || '');
//                 setRib(data.iban || ''); // Pré-remplir avec l'IBAN/RIB stocké
//             } else {
//                  console.log("PayoutSettingsScreen: No existing bank data found.");
//                  // Pré-remplir le nom du titulaire avec celui du profil si aucune donnée bancaire n'existe
//                  setAccountHolder(profile?.full_name || '');
//                  setBankName(''); // Assurer que les autres champs sont vides
//                  setRib('');
//             }
//         } catch (err: any) {
//             console.error("Error loading bank account data:", err);
//             setError("Erreur lors du chargement des informations bancaires existantes.");
//              // Pré-remplir au moins le nom si possible en cas d'erreur
//              setAccountHolder(profile?.full_name || '');
//         } finally {
//             setLoadingAccountData(false);
//         }
//     }, [user, profile?.full_name]); // Dépend de user et de son nom (du profil)

//     // Charger les données bancaires au montage ou si l'utilisateur change
//     useEffect(() => {
//         loadBankAccount();
//     }, [loadBankAccount]);

//     // --- Validation du formulaire ---
//     const validateForm = () => {
//         const errors: FormErrors = {};
//         const cleanedRib = rib.replace(/\s/g, ''); // Nettoyer les espaces pour validation

//          if (!accountHolder.trim()) errors.accountHolder = 'Le nom du titulaire est requis.';
//         if (!bankName.trim()) errors.bankName = 'Le nom de la banque est requis.';
//         if (!cleanedRib) {
//              errors.rib = 'Le RIB est requis.';
//          } else if (!/^\d{24}$/.test(cleanedRib)) { // Validation format 24 chiffres
//              errors.rib = 'Le RIB doit contenir exactement 24 chiffres.';
//          }
//         setFormErrors(errors);
//         return Object.keys(errors).length === 0; // Retourne true si pas d'erreurs
//     };

//     // --- Sauvegarde via Edge Function ---
//     const handleSaveBankDetails = useCallback(async () => {
//         if (!user || !validateForm()) return; // Valider d'abord

//         setIsSaving(true); setSaveError(null); setSaveSuccess(false);
//         const cleanedRib = rib.replace(/\s/g, ''); // Nettoyer pour l'envoi

//         // Préparer le payload pour l'Edge Function
//         const bankDetailsPayload = {
//             account_holder: accountHolder.trim(), // Envoyer le nom du titulaire
//             bank_name: bankName.trim(),
//             bank_rib: cleanedRib // Envoyer le RIB nettoyé
//         };

//         console.log("Attempting to call update-bank-details Edge Function:", bankDetailsPayload);

//         try {
//             // --- APPEL RÉEL A L'EDGE FUNCTION ---
//             const { data: functionResponse, error: functionError } = await supabase.functions.invoke('update-bank-details', {
//                 // Envoyer les données dans le corps (body)
//                 body: JSON.stringify(bankDetailsPayload)
//             });

//             if (functionError) throw new Error(functionError.message || "Erreur réseau ou fonction introuvable.");
//             // Gérer l'erreur métier retournée par la fonction elle-même
//             if (functionResponse?.error) throw new Error(functionResponse.error);
//             // --- FIN APPEL RÉEL ---

//             console.log("✅ Bank details saved via Edge Function:", functionResponse?.savedData);
//             setSaveSuccess(true);
//             Alert.alert("Succès", "Informations bancaires enregistrées.");

//             // Rafraîchir le profil global si la sauvegarde réussit
//              if (refreshProfile) {
//                  console.log("Refreshing profile data after save...");
//                  await refreshProfile();
//              }

//         } catch (err: any) {
//             console.error("Error saving bank details:", err);
//             const errorMessage = err.message || "Erreur lors de la sauvegarde.";
//             setSaveError(errorMessage);
//             Alert.alert("Erreur", errorMessage);
//         } finally {
//             setIsSaving(false);
//         }

//     }, [user, accountHolder, bankName, rib, refreshProfile]); // Ajouter toutes les dépendances utilisées

//     // --- Rendu ---
//     // Combine tous les états de chargement pertinents pour cet écran
//     const isLoadingPage = isLoadingAuth || loadingAccountData || !fontsLoaded;

//     if (isLoadingPage && !fontError) {
//         return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
//     }
//     if (fontError) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
//     if (!user) { return ( <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Veuillez vous connecter.</Text></SafeAreaView> ); }

//     return (
//         <SafeAreaView style={styles.container}>
//             {/* S'assurer que le titre est bien défini par le layout parent Stack */}
//              <Stack.Screen options={{ title: 'Informations de Paiement' }} />

//             <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
//                  <Text style={styles.pageTitle}>Informations pour les Virements</Text>
//                  <Text style={styles.pageSubtitle}>
//                      Renseignez les informations de votre compte bancaire marocain (RIB 24 chiffres) pour recevoir les paiements de vos locations. Ces informations restent confidentielles.
//                  </Text>

//                  {/* Afficher l'erreur ou le succès de la sauvegarde */}
//                  {saveError && <Text style={styles.errorText}>{saveError}</Text>}
//                  {saveSuccess && <Text style={styles.successText}>Informations enregistrées !</Text>}

//                  {/* Champ Nom Titulaire du Compte */}
//                  <View style={styles.inputGroup}>
//                      <Text style={styles.label}>Nom du Titulaire du Compte *</Text>
//                      <View style={[styles.inputContainer, formErrors.accountHolder ? styles.inputError : null]}>
//                          <UserIcon size={20} color={formErrors.accountHolder ? '#dc2626' : '#64748b'} style={styles.inputIcon} />
//                          <TextInput
//                              style={styles.input}
//                              placeholder="Prénom Nom complet"
//                              value={accountHolder}
//                              onChangeText={(text) => { setAccountHolder(text); if(formErrors.accountHolder) setFormErrors(p => ({...p, accountHolder: ''})); }}
//                              editable={!isSaving} autoCapitalize="words" />
//                      </View>
//                       {formErrors.accountHolder && <Text style={styles.fieldErrorText}>{formErrors.accountHolder}</Text>}
//                  </View>

//                  {/* Champ Nom de la Banque */}
//                  <View style={styles.inputGroup}>
//                      <Text style={styles.label}>Nom de la Banque *</Text>
//                      <View style={[styles.inputContainer, formErrors.bankName ? styles.inputError : null]}>
//                          <Building size={20} color={formErrors.bankName ? '#dc2626' : '#64748b'} style={styles.inputIcon} />
//                          <TextInput
//                              style={styles.input}
//                              placeholder="Ex: BMCE, Attijariwafa..."
//                              value={bankName}
//                              onChangeText={(text) => { setBankName(text); if(formErrors.bankName) setFormErrors(p => ({...p, bankName: ''})); }}
//                              editable={!isSaving} autoCapitalize="words" />
//                      </View>
//                       {formErrors.bankName && <Text style={styles.fieldErrorText}>{formErrors.bankName}</Text>}
//                  </View>

//                  {/* Champ RIB */}
//                  <View style={styles.inputGroup}>
//                      <Text style={styles.label}>RIB (24 chiffres) *</Text>
//                      <View style={[styles.inputContainer, formErrors.rib ? styles.inputError : null]}>
//                          <Banknote size={20} color={formErrors.rib ? '#dc2626' : '#64748b'} style={styles.inputIcon} />
//                          <TextInput
//                              style={styles.input}
//                              placeholder="Les 24 chiffres attachés"
//                              value={rib}
//                              onChangeText={(text) => { setRib(text); if(formErrors.rib) setFormErrors(p => ({...p, rib: ''})); }}
//                              editable={!isSaving} keyboardType="numeric" maxLength={28} />
//                      </View>
//                       {formErrors.rib && <Text style={styles.fieldErrorText}>{formErrors.rib}</Text>}
//                  </View>

//                   {/* Bouton Sauvegarder */}
//                   <TouchableOpacity
//                       style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
//                       onPress={handleSaveBankDetails}
//                       disabled={isSaving} >
//                       {isSaving ? <ActivityIndicator color="#ffffff" size="small"/> : <Save size={20} color="#fff" />}
//                       <Text style={styles.saveButtonText}>{isSaving ? 'Enregistrement...' : 'Enregistrer mes Informations'}</Text>
//                   </TouchableOpacity>

//             </ScrollView>
//         </SafeAreaView>
//     );
// }

// // --- Styles --- (Fusionnés et nettoyés)
// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: '#f9fafb' },
//     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
//     content: { flex: 1, padding: 20 },
//     pageTitle: { fontFamily: 'Montserrat-Bold', fontSize: 22, color: '#1e293b', marginBottom: 8, textAlign: 'center'},
//     pageSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#64748b', marginBottom: 32, textAlign: 'center', lineHeight: 21 },
//     inputGroup: { marginBottom: 20 },
//     label: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#374151', marginBottom: 8 },
//     inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', height: 52 },
//     inputIcon: { marginHorizontal: 12 },
//     input: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#111827', height: '100%' },
//     inputError: { borderColor: '#dc2626' },
//     saveButton: { backgroundColor: '#059669', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 52, flexDirection: 'row', gap: 8, marginTop: 10 },
//     saveButtonDisabled: { backgroundColor: '#9ca3af', opacity: 0.7 },
//     saveButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
//     errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20},
//     errorText: { color: '#dc2626', fontFamily: 'Montserrat-Regular', fontSize: 14, marginBottom: 15, textAlign: 'center' },
//     successText: { color: '#16a34a', fontFamily: 'Montserrat-SemiBold', fontSize: 14, marginBottom: 15, textAlign: 'center', backgroundColor: '#dcfce7', padding: 10, borderRadius: 6},
//     fieldErrorText: { color: '#dc2626', fontFamily: 'Montserrat-Regular', fontSize: 13, marginTop: 4 },
//      buttonLink: { marginTop: 15, paddingVertical: 10 },
//      buttonLinkText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2', textAlign: 'center' },
// });






// Dans PROJECT/app/(tabs)/host/payout-settings.tsx - Version avec bouton dynamique

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert, SafeAreaView, Platform
} from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Banknote, Building, Save, User as UserIcon } from 'lucide-react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';

// Interface simple pour les erreurs de formulaire
type FormErrors = { [key: string]: string; };

export default function PayoutSettingsScreen() {
    // Récupérer user, profile (pour nom), isLoading global, et refreshProfile
    const { user, profile, isLoading, refreshProfile } = useAuth();

    // États locaux pour les champs du formulaire
    const [accountHolder, setAccountHolder] = useState('');
    const [bankName, setBankName] = useState('');
    const [rib, setRib] = useState('');
    // --- AJOUT: État pour mémoriser si données initiales existaient ---
    const [initialRibLoaded, setInitialRibLoaded] = useState<string>('');
    // ------------------------------------------------------------------

    // États pour la gestion de l'écran
    const [loadingAccountData, setLoadingAccountData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // --- Chargement des données bancaires existantes ---
    const loadBankAccount = useCallback(async () => {
        if (!user) { setLoadingAccountData(false); return; }
        setLoadingAccountData(true);
        console.log("PayoutSettingsScreen: Fetching existing bank account data...");
        try {
            const { data, error } = await supabase
                .from('host_bank_accounts')
                .select('account_holder, bank_name, iban') // 'iban' contient le RIB
                .eq('user_id', user.id)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                console.log("PayoutSettingsScreen: Existing data found:", data);
                setAccountHolder(data.account_holder || profile?.full_name || '');
                setBankName(data.bank_name || '');
                setRib(data.iban || '');
                // --- MODIFIÉ: Mémoriser le RIB initial ---
                setInitialRibLoaded(data.iban || '');
                // --------------------------------------
            } else {
                 console.log("PayoutSettingsScreen: No existing bank data found.");
                 setAccountHolder(profile?.full_name || ''); // Pré-remplir juste le nom
                 setBankName('');
                 setRib('');
                 // --- MODIFIÉ: Assurer que initialRibLoaded est vide ---
                 setInitialRibLoaded('');
                 // -----------------------------------------------
            }
        } catch (err: any) {
            console.error("Error loading bank account data:", err);
            setError("Erreur lors du chargement des informations bancaires.");
            setAccountHolder(profile?.full_name || ''); // Fallback nom
            setInitialRibLoaded(''); // Reset en cas d'erreur
        } finally {
            setLoadingAccountData(false);
        }
    }, [user, profile?.full_name]);

    useEffect(() => {
        loadBankAccount();
    }, [loadBankAccount]);

    // --- Validation (inchangée) ---
    const validateForm = () => {
        const errors: FormErrors = {};
        const cleanedRib = rib.replace(/\s/g, '');
         if (!accountHolder.trim()) errors.accountHolder = 'Le nom du titulaire est requis.';
        if (!bankName.trim()) errors.bankName = 'Le nom de la banque est requis.';
        if (!cleanedRib) { errors.rib = 'Le RIB est requis.'; }
        else if (!/^\d{24}$/.test(cleanedRib)) { errors.rib = 'Le RIB doit contenir exactement 24 chiffres.'; }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // --- Sauvegarde via Edge Function (inchangée, appelle toujours 'update-bank-details') ---
    const handleSaveBankDetails = useCallback(async () => {
        if (!user || !validateForm()) return;
        setIsSaving(true); setSaveError(null); setSaveSuccess(false);
        const cleanedRib = rib.replace(/\s/g, '');
        const bankDetailsPayload = { account_holder: accountHolder.trim(), bank_name: bankName.trim(), bank_rib: cleanedRib };
        console.log("Attempting to call update-bank-details Edge Function:", bankDetailsPayload);
        try {
            const { data: functionResponse, error: functionError } = await supabase.functions.invoke('update-bank-details', { body: JSON.stringify(bankDetailsPayload) });
            if (functionError) throw new Error(functionError.message || "Erreur réseau ou fonction.");
            if (functionResponse?.error) throw new Error(functionResponse.error);
            console.log("✅ Bank details saved via Edge Function:", functionResponse?.savedData);
            setSaveSuccess(true);
            setInitialRibLoaded(cleanedRib); // Mettre à jour l'état initial après succès
            setFormErrors({});
            Alert.alert("Succès", "Informations bancaires enregistrées.");
            if (refreshProfile) { await refreshProfile(); }
        } catch (err: any) { console.error("Error saving bank details:", err); setSaveError(err.message || "Erreur sauvegarde."); Alert.alert("Erreur", err.message || "Impossible de sauvegarder."); }
        finally { setIsSaving(false); }
    }, [user, accountHolder, bankName, rib, refreshProfile]);

    // --- Rendu ---
    const isLoadingPage = isLoading || loadingAccountData || !fontsLoaded; // isLoading global

    if (isLoadingPage && !fontError) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
    if (fontError) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
    if (!user) { return ( <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Veuillez vous connecter.</Text></SafeAreaView> ); }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Infos de Paiement' }} />
            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                 <Text style={styles.pageTitle}>Informations pour les Virements</Text>
                 <Text style={styles.pageSubtitle}>Renseignez les informations de votre compte bancaire marocain (RIB 24 chiffres) pour recevoir les paiements.</Text>

                 {saveError && <Text style={styles.errorText}>{saveError}</Text>}
                 {saveSuccess && <Text style={styles.successText}>Informations enregistrées !</Text>}

                 {/* Champ Nom Titulaire */}
                  <View style={styles.inputGroup}>
                      <Text style={styles.label}>Nom du Titulaire du Compte *</Text>
                      <View style={[styles.inputContainer, formErrors.accountHolder ? styles.inputError : null]}>
                          <UserIcon size={20} color={formErrors.accountHolder ? '#dc2626' : '#64748b'} style={styles.inputIcon} />
                          <TextInput style={styles.input} placeholder="Prénom Nom complet" value={accountHolder} onChangeText={(text) => { setAccountHolder(text); if(formErrors.accountHolder) setFormErrors(p => ({...p, accountHolder: ''})); }} editable={!isSaving} autoCapitalize="words" />
                      </View>
                       {formErrors.accountHolder && <Text style={styles.fieldErrorText}>{formErrors.accountHolder}</Text>}
                  </View>

                 {/* Champ Nom Banque */}
                 <View style={styles.inputGroup}>
                     <Text style={styles.label}>Nom de la Banque *</Text>
                     <View style={[styles.inputContainer, formErrors.bankName ? styles.inputError : null]}>
                         <Building size={20} color={formErrors.bankName ? '#dc2626' : '#64748b'} style={styles.inputIcon} />
                         <TextInput style={styles.input} placeholder="Ex: BMCE, Attijariwafa..." value={bankName} onChangeText={(text) => { setBankName(text); if(formErrors.bankName) setFormErrors(p => ({...p, bankName: ''})); }} editable={!isSaving} autoCapitalize="words" />
                     </View>
                      {formErrors.bankName && <Text style={styles.fieldErrorText}>{formErrors.bankName}</Text>}
                 </View>

                 {/* Champ RIB */}
                 <View style={styles.inputGroup}>
                     <Text style={styles.label}>RIB (24 chiffres) *</Text>
                     <View style={[styles.inputContainer, formErrors.rib ? styles.inputError : null]}>
                         <Banknote size={20} color={formErrors.rib ? '#dc2626' : '#64748b'} style={styles.inputIcon} />
                         <TextInput style={styles.input} placeholder="Les 24 chiffres attachés" value={rib} onChangeText={(text) => { setRib(text); if(formErrors.rib) setFormErrors(p => ({...p, rib: ''})); }} editable={!isSaving} keyboardType="numeric" maxLength={28} />
                     </View>
                      {formErrors.rib && <Text style={styles.fieldErrorText}>{formErrors.rib}</Text>}
                 </View>

                  {/* Bouton Sauvegarder */}
                  <TouchableOpacity
                      style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                      onPress={handleSaveBankDetails}
                      disabled={isSaving} >
                      {isSaving ? <ActivityIndicator color="#ffffff" size="small"/> : <Save size={20} color="#fff" />}
                      <Text style={styles.saveButtonText}>
                          {isSaving
                              ? 'Enregistrement...'
                              // --- TEXTE DYNAMIQUE ---
                              : initialRibLoaded // Si un RIB avait été chargé
                              ? 'Modifier mes Informations' // Texte si MAJ
                              : 'Enregistrer mes Informations' // Texte si 1ère sauvegarde
                              // ----------------------
                           }
                       </Text>
                  </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles --- (Assurez-vous que cet objet est complet et correct)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    content: { flex: 1, padding: 20 },
    pageTitle: { fontFamily: 'Montserrat-Bold', fontSize: 22, color: '#1e293b', marginBottom: 8, textAlign: 'center'},
    pageSubtitle: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#64748b', marginBottom: 32, textAlign: 'center', lineHeight: 21 },
    inputGroup: { marginBottom: 20 },
    label: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#374151', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', height: 52 },
    inputIcon: { marginHorizontal: 12 },
    input: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#111827', height: '100%' },
    inputError: { borderColor: '#dc2626' },
    saveButton: { backgroundColor: '#059669', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 52, flexDirection: 'row', gap: 8, marginTop: 10 },
    saveButtonDisabled: { backgroundColor: '#9ca3af', opacity: 0.7 },
    saveButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20},
    errorText: { color: '#dc2626', fontFamily: 'Montserrat-Regular', fontSize: 14, marginBottom: 15, textAlign: 'center' },
    successText: { color: '#16a34a', fontFamily: 'Montserrat-SemiBold', fontSize: 14, marginBottom: 15, textAlign: 'center', backgroundColor: '#dcfce7', padding: 10, borderRadius: 6},
    fieldErrorText: { color: '#dc2626', fontFamily: 'Montserrat-Regular', fontSize: 13, marginTop: 4 },
     buttonLink: { marginTop: 15, paddingVertical: 10 },
     buttonLinkText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2', textAlign: 'center' },
});