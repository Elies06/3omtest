// Dans app/admin/users/edit/[id].tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, SafeAreaView, ActivityIndicator, Alert, Image } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase'; // Vérifiez chemin
import { useAuth } from '@/hooks/useAuth'; // Pour le token admin
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { ChevronLeft, Save } from 'lucide-react-native'; // Icônes
import Animated, { FadeIn } from 'react-native-reanimated';
// Interface pour les données utilisateur à éditer
interface UserEditData {
    email: string | null;
    full_name: string | null;
    city: string | null;
    avatar_url: string | null; // Affiché mais non éditable pour l'instant
}

export default function EditUserScreen() {
    const { id: userId } = useLocalSearchParams<{ id: string }>();
    const { session, user: adminUser } = useAuth(); // Besoin de session pour le token

    // États pour les données initiales et le formulaire
    const [initialData, setInitialData] = useState<UserEditData | null>(null);
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [city, setCity] = useState('');

    // États généraux
    const [loadingData, setLoadingData] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // Charger les données initiales de l'utilisateur
    const fetchInitialUserData = useCallback(async () => {
        if (!userId) { setError("ID utilisateur manquant."); setLoadingData(false); return; }
        setLoadingData(true); setError(null);
        console.log(`🚀 Fetching initial data for user edit: ${userId}`);
        try {
            // Récupérer profil et email (via public.users)
            const [profileRes, userRes] = await Promise.all([
                supabase.from('profiles').select('full_name, city, avatar_url').eq('user_id', userId).maybeSingle(),
                supabase.schema('public').from('users').select('email').eq('id', userId).maybeSingle()
            ]);

            // Gestion erreurs fetch
            if (profileRes.error && profileRes.error.code !== 'PGRST116') throw profileRes.error;
            if (userRes.error && userRes.error.code !== 'PGRST116') throw userRes.error;
            if (!profileRes.data && !userRes.data) throw new Error("Utilisateur introuvable.");

            const initial = {
                email: userRes.data?.email || null,
                full_name: profileRes.data?.full_name || null,
                city: profileRes.data?.city || null,
                avatar_url: profileRes.data?.avatar_url || null,
            };

            setInitialData(initial);
            // Pré-remplir le formulaire
            setEmail(initial.email || '');
            setFullName(initial.full_name || '');
            setCity(initial.city || '');

            console.log("✅ Initial user data loaded for edit:", initial);

        } catch (err: any) { console.error('Error loading initial user data:', err); setError(err.message || "Erreur chargement données."); }
        finally { setLoadingData(false); }
    }, [userId]);

    useEffect(() => { if (fontsLoaded && !fontError && userId) { fetchInitialUserData(); } }, [userId, fontsLoaded, fontError, fetchInitialUserData]);


    // Fonction de Sauvegarde (appelle l'Edge Function)
    const handleSave = async () => {
        if (!userId || !initialData) return; // Ne devrait pas arriver si données chargées

        setIsSaving(true); setError(null);

        // Construire l'objet updateData UNIQUEMENT avec les champs modifiés
        const updateData: Partial<UserEditData> = {};
        const currentEmail = email.trim();
        const currentFullName = fullName.trim();
        const currentCity = city.trim();

        if (currentEmail !== (initialData.email || '')) { updateData.email = currentEmail || null; } // Permet de vider
        if (currentFullName !== (initialData.full_name || '')) { updateData.full_name = currentFullName || null; }
        if (currentCity !== (initialData.city || '')) { updateData.city = currentCity || null; }
        // Ajouter d'autres champs si éditables

        // Ne rien faire si aucun champ n'a changé
        if (Object.keys(updateData).length === 0) {
            Alert.alert("Info", "Aucune modification détectée.");
            setIsSaving(false);
            return;
        }

        console.log(`💾 Saving updates for user ${userId}:`, updateData);

        try {
            const token = session?.access_token;
            if (!token) throw new Error("Token admin absent.");

            // Appel à l'Edge Function 'update-user-admin'
            const { error: functionError, data } = await supabase.functions.invoke(
                'update-user-admin',
                {
                    body: {
                        targetUserId: userId,
                        updateData: updateData // Envoyer uniquement les champs modifiés
                    }
                }
            );

            if (functionError) { let message = functionError.message; try { const parsed = JSON.parse(message); message = parsed.error || message; } catch(e) {} throw new Error(message); }

            console.log("Update function response:", data);
            Alert.alert("Succès", data?.message || "Utilisateur mis à jour.");
            router.back(); // Revenir à l'écran de détail après succès

        } catch (err: any) {
            console.error('Error saving user updates:', err);
            Alert.alert("Erreur", `Sauvegarde échouée: ${err.message}`);
            setError(`Erreur sauvegarde: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };


    // --- Rendu ---
     if (!fontsLoaded || loadingData) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
     if (fontError) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
     if (error || !initialData) { return ( <SafeAreaView style={styles.container}> <Stack.Screen options={{ title: 'Erreur' }} /> <View style={styles.header}><TouchableOpacity style={styles.backButton} onPress={router.back}><ChevronLeft size={24} color="#1e293b" /></TouchableOpacity><Text style={styles.headerTitle}>Erreur</Text><View style={{width:40}}/></View><View style={styles.errorContainer}><Text style={styles.errorText}>{error || "Impossible de charger les données initiales."}</Text><TouchableOpacity style={styles.buttonLink} onPress={router.back}><Text style={styles.buttonLinkText}>Retour</Text></TouchableOpacity></View> </SafeAreaView> ); }


    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: `Modifier ${initialData.full_name || initialData.email || 'Utilisateur'}` }} />
             <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}> <ChevronLeft size={24} color="#1e293b" /> </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>Modifier Utilisateur</Text>
                {/* Bouton Enregistrer dans Header ? Ou en bas ? Pour l'instant en bas */}
                <View style={{width: 40}} />
             </View>

            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                 {/* Afficher l'erreur de sauvegarde si elle existe */}
                 {error && <View style={styles.errorBanner}><Text style={styles.errorBannerText}>{error}</Text></View>}

                <View style={styles.form}>
                     {initialData.avatar_url && (
                        <View style={styles.avatarContainer}>
                             <Image source={{ uri: initialData.avatar_url }} style={styles.avatar} />
                             <Text style={styles.avatarLabel}>(Avatar non modifiable ici)</Text>
                        </View>
                     )}

                     <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nom Complet</Text>
                        <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Nom et Prénom"
                            editable={!isSaving}
                            textContentType="name"
                            autoCapitalize="words"
                         />
                     </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Adresse Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="email@example.com"
                            editable={!isSaving}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="emailAddress"
                         />
                         <Text style={styles.inputNote}>Modifier l'email peut nécessiter une re-vérification par l'utilisateur.</Text>
                     </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Ville (Profil)</Text>
                        <TextInput
                            style={styles.input}
                            value={city}
                            onChangeText={setCity}
                            placeholder="Ville"
                            editable={!isSaving}
                            textContentType="addressCity"
                            autoCapitalize="words"
                         />
                     </View>

                     {/* Ajouter d'autres champs modifiables ici si nécessaire */}

                </View>
            </ScrollView>

             {/* Footer avec bouton Enregistrer */}
             <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                     {isSaving ? <ActivityIndicator color="#ffffff" /> : <Save size={20} color="#fff" />}
                     <Text style={styles.saveButtonText}>{isSaving ? 'Sauvegarde...' : 'Enregistrer Modifications'}</Text>
                 </TouchableOpacity>
             </View>

        </SafeAreaView>
    );
}

// --- Styles --- (Inspirés de EditListingScreen)
const styles = StyleSheet.create({
     container: { flex: 1, backgroundColor: '#f9fafb' },
     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
     errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20},
     errorText: { fontFamily: 'Montserrat-Regular', color: '#b91c1c', fontSize: 16, textAlign: 'center', marginBottom: 15 },
     errorBanner: { backgroundColor: '#fee2e2', padding: 12, marginHorizontal: 16, marginBottom: 16, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca'},
     errorBannerText: { color: '#b91c1c', fontFamily: 'Montserrat-Regular', textAlign: 'center', fontSize: 13 },
     header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: Platform.OS === 'android' ? 40 : 60, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
     backButton: { padding: 8, width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
     headerTitle: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', flex: 1, textAlign: 'center', marginRight: 48 },
     content: { flex: 1 },
     form: { padding: 16, gap: 20 },
     avatarContainer: { alignItems: 'center', marginBottom: 10 },
     avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#e5e7eb', marginBottom: 8 },
     avatarLabel: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
     inputGroup: { gap: 6 },
     label: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#374151' },
     input: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#111827', backgroundColor: '#ffffff', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', minHeight: 50 },
     inputNote: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: '#6b7280', marginTop: 4 },
     footer: { padding: 16, paddingBottom: Platform.OS === 'web' ? 16 : 34, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
     saveButton: { backgroundColor: '#0891b2', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 52, flexDirection: 'row', gap: 8 },
     saveButtonDisabled: { backgroundColor: '#9ca3af', opacity: 0.7 },
     saveButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
     buttonLink: { marginTop: 15, paddingVertical: 10 },
     buttonLinkText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#0891b2', textAlign: 'center' },
});