
// app/(tabs)/_layout.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Tabs, useSegments, router } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import {
    Chrome as Home, Search, PartyPopper, User,
    School as HostIcon,
    Briefcase as BecomeHostIcon,
    MessageCircle,
    Calendar as BookingsIcon
} from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
    const { user, sessionInitialized, isLoading: isAuthLoading, userRoles: contextUserRoles } = useAuth();
    const segments = useSegments();

    // État pour tracking des redirections
    const [redirectInProgress, setRedirectInProgress] = useState(false);
    const previousRouteRef = useRef<string | null>(null);
    const previousRolesRef = useRef<string[]>([]);
    const [rolesStable, setRolesStable] = useState(false);

    // Conditions d'affichage basées directement sur contextUserRoles
    const isHost = user && contextUserRoles.some(role => ['host', 'hostpro'].includes(role));
    const isPotentialHost = user && contextUserRoles.some(role => ['usernotverified', 'swimmer'].includes(role));
    const isVerified = user && !contextUserRoles.includes('usernotverified');

    // Attendre que les rôles soient stables
    useEffect(() => {
        if (!sessionInitialized || isAuthLoading) {
            setRolesStable(false);
            return;
        }

        // Vérifier si les rôles ont changé
        if (JSON.stringify(previousRolesRef.current) !== JSON.stringify(contextUserRoles)) {
            console.log(`[TabLayout] Roles changed: ${previousRolesRef.current.join(', ')} -> ${contextUserRoles.join(', ')}`);
            previousRolesRef.current = contextUserRoles;
            setRolesStable(false);
            
            // Attendre un court délai pour s'assurer que les rôles sont stables
            const timer = setTimeout(() => {
                setRolesStable(true);
                console.log("[TabLayout] Roles are now stable");
            }, 300);
            
            return () => clearTimeout(timer);
        } else {
            setRolesStable(true);
        }
    }, [contextUserRoles, sessionInitialized, isAuthLoading]);

    // Protection de Route
    useEffect(() => {
        // Ne pas traiter si les données ne sont pas prêtes ou si les rôles ne sont pas stables
        if (!sessionInitialized || isAuthLoading || redirectInProgress || !rolesStable) {
            return;
        }

        // Vérifier si les segments sont valides - minimum 2 segments pour les tabs
        if (!segments || segments.length < 2) {
            return;
        }

        const currentRouteBase = segments[1];
        const currentFullRoute = segments.join('/');
        
        // Vérifier si nous sommes sur la même route
        if (previousRouteRef.current === currentFullRoute) {
            return;
        }
        
        previousRouteRef.current = currentFullRoute;
        
        // Toujours autoriser profile si l'utilisateur est connecté
        if (currentRouteBase === 'profile' && user) {
            return;
        }
        
        if (user) {
            let shouldRedirect = false;
            let redirectTo = '';
            
            // Protection des routes spécifiques
            if (currentRouteBase === 'host' && !isHost) {
                console.log(`[TabLayout] User is not a host, redirecting from ${currentRouteBase}`);
                shouldRedirect = true;
                redirectTo = '/(tabs)/';
            }
            else if (currentRouteBase === 'become-host' && !isPotentialHost && !isHost) {
                console.log(`[TabLayout] User is not eligible for become-host, redirecting from ${currentRouteBase}`);
                shouldRedirect = true;
                redirectTo = '/(tabs)/';
            }
            else if (currentRouteBase === 'bookings' && isHost) {
                const isAlreadyOnHostBookings = segments.length >= 3 && segments[2] === 'host';
                if (!isAlreadyOnHostBookings) {
                    shouldRedirect = true;
                    redirectTo = '/(tabs)/host/(dashboard)/bookings';
                }
            }
            
            if (shouldRedirect && redirectTo) {
                setRedirectInProgress(true);
                console.log(`[TabLayout] Redirecting to ${redirectTo}, user roles: ${contextUserRoles.join(', ')}`);
                
                // Utiliser un timeout pour éviter les problèmes de navigation immédiate
                setTimeout(() => {
                    router.replace(redirectTo);
                    // Réinitialiser le flag après un délai
                    setTimeout(() => {
                        setRedirectInProgress(false);
                    }, 500);
                }, 100);
            }
        }
    }, [segments, user, isAuthLoading, isHost, isPotentialHost, sessionInitialized, redirectInProgress, rolesStable, contextUserRoles]);

    // État de Chargement Initial
    if (!sessionInitialized || isAuthLoading || !rolesStable) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0891b2" />
            </View>
        );
    }

    // Rendu des Onglets
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: { 
                backgroundColor: '#ffffff', 
                borderTopWidth: 1, 
                borderTopColor: '#f0f0f0',
                height: 60,
                paddingBottom: 5, 
                paddingTop: 5
            },
            tabBarActiveTintColor: '#0891b2',
            tabBarInactiveTintColor: '#64748b',
            tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 10 }
        }}>
            {/* Onglets toujours visibles */}
            <Tabs.Screen name="index" options={{ 
                title: 'Accueil', 
                tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> 
            }} />
            
            <Tabs.Screen name="search" options={{ 
                title: 'Rechercher', 
                tabBarIcon: ({ color, size }) => <Search size={size} color={color} /> 
            }} />
            
            <Tabs.Screen name="events/index" options={{ 
                title: 'Événements', 
                tabBarIcon: ({ color, size }) => <PartyPopper size={size} color={color} /> 
            }} />
            
            {/* Onglet Réservations */}
            <Tabs.Screen name="bookings" options={{ 
                title: 'Réservations', 
                tabBarIcon: ({ color, size }) => <BookingsIcon size={size} color={color} />,
                href: user ? undefined : null
            }} />
            
            {/* Onglet Conversations */}
            <Tabs.Screen name="conversations" options={{ 
                title: 'Messages', 
                tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
                href: user ? undefined : null
            }} />
            
            {/* Onglet Devenir Hôte */}
            <Tabs.Screen name="become-host" options={{ 
                title: 'Devenir Hôte', 
                tabBarIcon: ({ color, size }) => <BecomeHostIcon size={size} color={color} />,
                href: (user && isPotentialHost && !isHost) || !user ? undefined : null
            }} />
            
            {/* Onglet Espace Hôte */}
            <Tabs.Screen name="host" options={{ 
                title: 'Espace Hôte', 
                tabBarIcon: ({ color, size }) => <HostIcon size={size} color={color} />,
                href: (user && isHost) ? undefined : null
            }} />
            
            {/* Onglet Profil */}
            <Tabs.Screen name="profile" options={{ 
                title: 'Profil', 
                tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                href: user ? undefined : null
            }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff'
    }
});
