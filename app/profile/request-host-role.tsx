// Dans app/profile/request-host-role.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Montserrat_700Bold, Montserrat_400Regular, useFonts } from '@expo-google-fonts/montserrat';
import { CheckCircle, Send } from 'lucide-react-native';

export default function RequestHostRoleScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

     const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    const handleRequestSubmit = async () => {
        if (!user) {
            Alert.alert("Erreur", "Utilisateur non connecté.");
            return;
        }
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Vérifier si une demande 'pending' existe déjà pour éviter doublons
            const { data: existingRequest, error: checkError } = await supabase
                .from('role_requests')
                .select('id')
                .eq('user_id', user.id)
                .eq('requested_role', 'host')
                .eq('status', 'pending')
                .maybeSingle();

            if (checkError) throw checkError;

            if (existingRequest) {
                Alert.alert("Demande existante", "Vous avez déjà une demande en cours pour devenir hôte.");
                setSuccess(true); // Considérer comme un succès car la demande existe
                return;
            }

            // Insérer la nouvelle demande
            const { error: insertError } = await supabase
                .from('role_requests')
                .insert({
                    user_id: user.id,
                    requested_role: 'host', // Demande pour le rôle 'host'
                    status: 'pending'
                });

            if (insertError) throw insertError;

            setSuccess(true);
            Alert.alert("Demande envoyée", "Votre demande pour devenir hôte a été envoyée. Elle sera examinée par notre équipe.");
            // Optionnel: rediriger après un délai ou laisser l'utilisateur naviguer
            // setTimeout(() => router.back(), 2000);

        } catch (err: any) {
            console.error("Erreur lors de la demande de rôle:", err);
            setError(err.message || "Une erreur est survenue.");
            Alert.alert("Erreur", err.message || "Impossible d'envoyer la demande.");
        } finally {
            setLoading(false);
        }
    };

     if (!fontsLoaded && !fontError) { return null }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: "Devenir Hôte" }} />
            <View style={styles.content}>
                {success ? (
                    <>
                        <CheckCircle size={60} color="#059669" style={styles.icon}/>
                        <Text style={styles.title}>Demande Envoyée !</Text>
                        <Text style={styles.message}>
                            Votre demande pour devenir hôte a bien été enregistrée et est en cours d'examen. Vous serez notifié une fois traitée.
                        </Text>
                         <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                            <Text style={styles.buttonText}>Retour</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Send size={60} color="#0891b2" style={styles.icon}/>
                        <Text style={styles.title}>Prêt à devenir Hôte ?</Text>
                        <Text style={styles.message}>
                            En confirmant, vous demandez à changer votre rôle de Baigneur à Hôte.
                            Cela vous permettra de créer des annonces une fois votre compte approuvé pour cette fonction.
                            Assurez-vous d'avoir déjà vérifié votre identité si ce n'est pas le cas.
                        </Text>
                        {error && <Text style={styles.errorText}>{error}</Text>}
                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleRequestSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.buttonText}>Confirmer la demande</Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} disabled={loading}>
                             <Text style={styles.cancelButtonText}>Annuler</Text>
                         </TouchableOpacity>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    icon: { marginBottom: 24 },
    title: { fontFamily: 'Montserrat-Bold', fontSize: 24, color: '#1e293b', textAlign: 'center', marginBottom: 16 },
    message: { fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#4b5563', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
    button: { backgroundColor: '#0891b2', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 12 },
    buttonDisabled: { backgroundColor: '#94a3b8' },
    buttonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
    cancelButton: { paddingVertical: 12, },
    cancelButtonText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b', textDecorationLine: 'underline' },
    errorText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#dc2626', textAlign: 'center', marginBottom: 16 },
});