// Dans app/(tabs)/profile.js
// VERSION BASÉE SUR L'ANCIENNE STRUCTURE - CORRECTION ReferenceError actionLoading

import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform,
    ActivityIndicator, SafeAreaView, Alert // Imports RN nécessaires
} from 'react-native';
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { LogIn, LogOut, Settings, Star, Calendar, BadgeCheck, CircleAlert, ChevronRight, Clock, XCircle } from 'lucide-react-native';
import { Stack, router } from 'expo-router'; // Stack ajouté pour le titre
// import Animated, { FadeIn } from 'react-native-reanimated'; // Commenté par défaut
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

// Interface locale pour le statut
interface VerificationStatus {
    level: number;
    status: 'pending' | 'approved' | 'rejected';
    document_type?: string;
    rejection_reason?: string | null; // Permettre null
}

export default function ProfileScreen() {
    useEffect(() => {
      console.log("[ProfileScreen - Old Structure] COMPONENT MOUNTED");
      return () => {
          console.log("[ProfileScreen - Old Structure] COMPONENT UNMOUNTING");
      };
    }, []);

    // Utilisation du hook useAuth
    // Important : on récupère 'loading' et on le renomme 'authLoading'
    // On NE récupère PAS 'actionLoading' car il n'est pas fourni par toutes les versions de useAuth ou est redondant
    const { user, signOut, loading: authLoading, sessionInitialized } = useAuth() || {};

    // États locaux
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
    const [loading, setLoading] = useState(true); // Chargement local

    // Polices
    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // Fonction fetch locale
    const loadVerificationStatus = useCallback(async () => {
        if (!user || !user.id) { setLoading(false); return; }
        console.log("[ProfileScreen] loadVerificationStatus: Fetching for user:", user.id);
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('identity_verifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) { throw error; }
            console.log("[ProfileScreen] loadVerificationStatus: Fetched data:", data);
            setVerificationStatus(data);
        } catch (err) {
            console.error('[ProfileScreen] Error loading verification status:', err);
            setVerificationStatus(null);
        } finally {
            setLoading(false);
            console.log("[ProfileScreen] loadVerificationStatus: Finished.");
        }
    }, [user?.id]);

    // Effet pour charger le statut
    useEffect(() => {
        if (sessionInitialized && user) {
            loadVerificationStatus();
        } else if (sessionInitialized && !user) {
             setVerificationStatus(null);
             setLoading(false);
         }
    }, [user, sessionInitialized, loadVerificationStatus]);

    // --- Rendu ---
    console.log(`[ProfileScreen - Old Structure] RENDER - User: ${user?.id}, SessionInit: ${sessionInitialized}, FontsLoaded: ${fontsLoaded}, LoadingLocal: ${loading}`);

    if (!fontsLoaded || !sessionInitialized) {
        return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>;
    }
    if (fontError) {
        return <SafeAreaView style={styles.errorContainer}><Text style={styles.errorText}>Erreur de chargement des polices.</Text></SafeAreaView>;
    }

    if (!user) {
        // JSX pour non connecté...
        return (
             <SafeAreaView style={styles.container}>
                 <Stack.Screen options={{ headerShown: false }} />
                  <View style={styles.contentLogin}>
                     <Image source={{ uri: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800' }} style={styles.headerImage} />
                     <View style={styles.overlay} />
                     <View style={styles.messageContainer}>
                         <Text style={styles.title}>Connectez-vous</Text>
                         <Text style={styles.subtitle}>Accédez à votre profil, réservations et plus.</Text>
                         <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')} >
                             <LogIn size={20} color="#ffffff" />
                             <Text style={styles.loginButtonText}>Se connecter</Text>
                         </TouchableOpacity>
                         <TouchableOpacity onPress={() => router.push('/auth/register')} >
                             <Text style={styles.registerText}>Pas encore de compte ? <Text style={styles.registerLink}>S'inscrire</Text></Text>
                         </TouchableOpacity>
                     </View>
                  </View>
             </SafeAreaView>
         );
    }

    // --- Rendu Connecté ---
    const isVerifiedLocally = verificationStatus?.status === 'approved';

    const renderVerificationStatusCard = () => {
        if (loading) { /* ... Loader ... */
            return ( <View style={[styles.verificationCard, styles.verificationCardLoading]}><ActivityIndicator size="small" color="#64748b" /><Text style={styles.verificationTextLoading}>Chargement du statut...</Text></View> );
        }
        if (!verificationStatus) { /* ... Incitation ... */
             return ( <TouchableOpacity style={[styles.verificationCard, styles.verificationCardNeeded]} onPress={() => router.push('/profile/verify')}><View style={styles.verificationHeader}><CircleAlert size={24} color="#dc2626" /><Text style={[styles.verificationTitle, { color: '#b91c1c' }]}>Vérifiez votre identité</Text></View><Text style={[styles.verificationText, { color: '#b91c1c' }]}>La vérification est requise pour réserver ou proposer une piscine.</Text><View style={styles.verificationAction}><Text style={styles.verificationActionText}>Commencer la vérification</Text><ChevronRight size={20} color="#0891b2" /></View></TouchableOpacity> );
        }
        switch (verificationStatus.status) {
            case 'pending': /* ... Pending ... */
                return ( <View style={[styles.verificationCard, styles.verificationCardPending]}><View style={styles.verificationHeader}><Clock size={24} color="#d97706" /><Text style={[styles.verificationTitle, { color: '#854d0e' }]}>Vérification en cours</Text></View><Text style={[styles.verificationText, { color: '#854d0e' }]}>Votre demande est en cours d'examen.</Text></View> );
            case 'approved': /* ... Approved ... */
                 return ( <View style={[styles.verificationCard, styles.verificationCardApproved]}><View style={styles.verificationHeader}><BadgeCheck size={24} color="#059669" /><Text style={[styles.verificationTitle, { color: '#065f46' }]}>Identité vérifiée</Text></View><Text style={[styles.verificationText, { color: '#065f46' }]}>Vous pouvez profiter de toutes les fonctionnalités.</Text></View> );
            case 'rejected': /* ... Rejected ... */
                 return ( <TouchableOpacity style={[styles.verificationCard, styles.verificationCardRejected]} onPress={() => router.push('/profile/verify')}><View style={styles.verificationHeader}><XCircle size={24} color="#dc2626" /><Text style={[styles.verificationTitle, { color: '#991b1b' }]}>Vérification refusée</Text></View><Text style={[styles.verificationText, { color: '#991b1b' }]}>{verificationStatus.rejection_reason || 'Votre demande a été refusée. Veuillez vérifier vos documents.'}</Text><View style={styles.verificationAction}><Text style={[styles.verificationActionText, { color: '#b91c1c' }]}>Soumettre à nouveau</Text><ChevronRight size={20} color="#b91c1c" /></View></TouchableOpacity> );
            default: return null;
        }
    };

    // TRY...CATCH
    try {
        console.log("[ProfileScreen - Old Structure] Attempting to render main view for user:", user.id);
        return (
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ title: 'Mon Profil' }} />
                <ScrollView style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: user?.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent((user?.user_metadata?.full_name || user?.email || '?').charAt(0)) + '&background=random&color=fff' }}
                                style={styles.avatar}
                                onError={(e) => console.warn("Error loading avatar:", e.nativeEvent.error)}
                            />
                            {isVerifiedLocally ? ( <View style={[styles.verificationBadge, styles.verificationBadgeVerified]}><BadgeCheck size={16} color="#ffffff" /></View> ) : ( <View style={styles.verificationBadge}>{verificationStatus?.status === 'pending' ? <Clock size={14} color="#ffffff"/> : <CircleAlert size={16} color="#ffffff" />}</View> )}
                        </View>
                        <View style={styles.userInfo}>
                            <Text style={styles.userName} numberOfLines={1}>{user?.user_metadata?.full_name || 'Utilisateur'}</Text>
                            <Text style={styles.userEmail} numberOfLines={1}>{user?.email || 'Email inconnu'}</Text>
                        </View>
                    </View>

                    {/* Carte KYC */}
                    {renderVerificationStatusCard()}

                    {/* Menu */}
                    <View style={styles.menuSection}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/bookings')}>
                           <Calendar size={20} color="#475569" />
                           <Text style={styles.menuText}>Mes réservations</Text>
                           <ChevronRight size={20} color="#cbd5e1" style={styles.menuArrow} />
                       </TouchableOpacity>
                       <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert("TODO", "Page Mes Avis")}>
                           <Star size={20} color="#475569" />
                           <Text style={styles.menuText}>Mes avis</Text>
                           <ChevronRight size={20} color="#cbd5e1" style={styles.menuArrow} />
                       </TouchableOpacity>
                       <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/settings')}>
                           <Settings size={20} color="#475569" />
                           <Text style={styles.menuText}>Paramètres</Text>
                           <ChevronRight size={20} color="#cbd5e1" style={styles.menuArrow} />
                       </TouchableOpacity>
                       {/* Bouton Déconnexion - CORRECTION ICI */}
                       <TouchableOpacity
                           style={[styles.menuItem, styles.logoutButton]}
                           onPress={() => { if (signOut) signOut(); }}
                           // Utilise authLoading (renommé depuis loading de useAuth)
                           disabled={authLoading}
                       >
                           <LogOut size={20} color="#dc2626" />
                           {/* Utilise authLoading */}
                           <Text style={styles.logoutText}>{authLoading ? 'Déconnexion...' : 'Se déconnecter'}</Text>
                       </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    } catch (renderError) {
         console.error("!!!! ERREUR DE RENDU DANS ProfileScreen (Old Structure) !!!!", renderError);
         return (
             <SafeAreaView style={styles.errorContainer}>
                 <Stack.Screen options={{ title: 'Erreur' }} />
                 <CircleAlert size={40} color="#b91c1c" />
                 <Text style={styles.errorText}>Oups ! Erreur lors de l'affichage du profil.</Text>
                 {__DEV__ && <Text style={[styles.errorText, { fontSize: 12, marginTop: 10, color: '#991b1b' }]}>{(renderError as Error).message}</Text>}
             </SafeAreaView>
         );
    }
}

// --- Styles ---
// (Assurez-vous d'avoir la définition complète de vos styles ici)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    content: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8fafc' },
    errorText: { fontFamily: 'Montserrat-Regular', color: '#b91c1c', fontSize: 16, textAlign: 'center'},
    contentLogin: { flex: 1, alignItems: 'center', backgroundColor: '#FFF' },
    headerImage: { width: '100%', height: '50%', opacity: 0.7 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
    messageContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32, alignItems: 'center', paddingTop: 40 },
    title: { fontFamily: 'Montserrat-Bold', fontSize: 22, color: '#1e293b', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#64748b', textAlign: 'center', marginBottom: 28, lineHeight: 22 },
    loginButton: { backgroundColor: '#0891b2', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 10, width: '100%', marginBottom: 20, height: 52 },
    loginButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#ffffff' },
    registerText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b' },
    registerLink: { fontFamily: 'Montserrat-SemiBold', color: '#0891b2' },
    header: { paddingVertical: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    avatarContainer: { position: 'relative' },
    avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#e5e7eb' },
    verificationBadge: { position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: '#f59e0b', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ffffff' },
    verificationBadgeVerified: { backgroundColor: '#10b981' },
    userInfo: { flex: 1 },
    userName: { fontFamily: 'Montserrat-Bold', fontSize: 18, color: '#1e293b', marginBottom: 2 },
    userEmail: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b' },
    verificationCardLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#f1f5f9', borderColor: '#e2e8f0', minHeight: 80, paddingVertical: 16, marginHorizontal: 16, marginTop: 20, marginBottom: 8, borderRadius: 12, borderWidth: 1 },
    verificationTextLoading: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#64748b' },
    verificationCard: { marginHorizontal: 16, marginTop: 20, marginBottom: 8, padding: 16, borderRadius: 12, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, },
    verificationCardNeeded: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
    verificationCardPending: { backgroundColor: '#fefce8', borderColor: '#fef08a' },
    verificationCardApproved: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
    verificationCardRejected: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
    verificationHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    verificationTitle: { fontFamily: 'Montserrat-Bold', fontSize: 15, color: '#1e293b', flexShrink: 1 },
    verificationText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#374151', lineHeight: 19 },
    verificationAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e5e7eb', },
    verificationActionText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#0891b2' },
    menuSection: { paddingTop: 24, paddingBottom: 40, paddingHorizontal: 16, gap: 12, },
    menuItem: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#ffffff', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', },
    menuText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#374151', flex: 1 },
    menuArrow: { marginLeft: 'auto' },
    logoutButton: { marginTop: 20, backgroundColor: '#fee2e2', borderColor: '#fecaca' },
    logoutText: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: '#dc2626' },
    refreshButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginHorizontal: 16, marginTop: 8, marginBottom: 12, paddingVertical: 8,
        borderRadius: 8, backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd',
    },
    refreshButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#0891b2', },
});