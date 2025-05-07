// // // // // // import { Tabs } from 'expo-router';
// // // // // // import { Chrome as Home, Search, PartyPopper, User } from 'lucide-react-native';

// // // // // // export default function TabLayout() {
// // // // // //   return (
// // // // // //     <Tabs
// // // // // //       screenOptions={{
// // // // // //         headerShown: false,
// // // // // //         tabBarStyle: {
// // // // // //           backgroundColor: '#ffffff',
// // // // // //           borderTopWidth: 1,
// // // // // //           borderTopColor: '#f0f0f0',
// // // // // //         },
// // // // // //         tabBarActiveTintColor: '#0891b2',
// // // // // //         tabBarInactiveTintColor: '#64748b',
// // // // // //       }}>
// // // // // //       <Tabs.Screen
// // // // // //         name="index"
// // // // // //         options={{
// // // // // //           title: 'Accueil',
// // // // // //           tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
// // // // // //         }}
// // // // // //       />
// // // // // //       <Tabs.Screen
// // // // // //         name="search"
// // // // // //         options={{
// // // // // //           title: 'Rechercher',
// // // // // //           tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
// // // // // //         }}
// // // // // //       />
// // // // // //       <Tabs.Screen
// // // // // //         name="events"
// // // // // //         options={{
// // // // // //           title: 'Événements',
// // // // // //           tabBarIcon: ({ color, size }) => <PartyPopper size={size} color={color} />,
// // // // // //         }}
// // // // // //       />
// // // // // //       <Tabs.Screen
// // // // // //         name="profile"
// // // // // //         options={{
// // // // // //           title: 'Profil',
// // // // // //           tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
// // // // // //         }}
// // // // // //       />
// // // // // //     </Tabs>
// // // // // //   );
// // // // // // }




// // // // // // import React, { useState, useEffect, useCallback } from 'react';
// // // // // // import { Tabs, useSegments, router } from 'expo-router'; // Importer useSegments et router
// // // // // // import { ActivityIndicator, View, StyleSheet } from 'react-native'; // Importer ActivityIndicator et View
// // // // // // import {
// // // // // //     Chrome as Home, Search, PartyPopper, User,
// // // // // //     School as HostIcon, // Icône Tableau de bord Hôte (ou LayoutGrid, etc.)
// // // // // //     Briefcase as BecomeHostIcon // Icône Devenir Hôte (ou PlusSquare, etc.)
// // // // // // } from 'lucide-react-native';
// // // // // // import { useAuth } from '@/hooks/useAuth'; // Importer votre hook d'authentification
// // // // // // import { supabase } from '@/lib/supabase'; // Importer Supabase

// // // // // // export default function TabLayout() {
// // // // // //     // --- NOUVEAU: Récupération user et état session ---
// // // // // //     const { user, sessionInitialized } = useAuth();
// // // // // //     const [userRoles, setUserRoles] = useState<string[]>([]);
// // // // // //     const [isLoadingRoles, setIsLoadingRoles] = useState(true);
// // // // // //     const segments = useSegments(); // Pour la protection de route optionnelle
// // // // // //     // -------------------------------------------------

// // // // // //     // --- NOUVEAU: Fonction pour charger les rôles ---
// // // // // //     const loadUserRoles = useCallback(async () => {
// // // // // //         // Ne fait rien si pas d'utilisateur ou si session pas prête
// // // // // //         if (!sessionInitialized || !user) {
// // // // // //             setUserRoles([]);
// // // // // //             setIsLoadingRoles(false); // Considérer comme chargé (pas de rôles)
// // // // // //             return;
// // // // // //         }

// // // // // //         // Éviter de recharger inutilement si les rôles sont déjà connus pour cet utilisateur
// // // // // //         // Note: ceci peut être omis si `useAdmin` gère déjà la mise en cache/mémoïsation
// // // // // //         // if (userRoles.length > 0 && !isLoadingRoles) {
// // // // // //         //      return;
// // // // // //         // }

// // // // // //         setIsLoadingRoles(true);
// // // // // //         console.log("[TabLayout] Fetching user roles...");
// // // // // //         try {
// // // // // //             const { data: rolesResult, error: rpcError } = await supabase.rpc(
// // // // // //                 'get_user_roles',
// // // // // //                 { user_uuid: user.id }
// // // // // //             );
// // // // // //             if (rpcError) throw rpcError;
// // // // // //             const roles = (rolesResult || []).map((r: { role_name: string }) => r.role_name).filter(Boolean);
// // // // // //             setUserRoles(roles);
// // // // // //             console.log("[TabLayout] User roles:", roles);
// // // // // //         } catch (err) {
// // // // // //             console.error('[TabLayout] Error loading user roles:', err);
// // // // // //             setUserRoles([]); // Reset en cas d'erreur
// // // // // //         } finally {
// // // // // //             setIsLoadingRoles(false);
// // // // // //         }
// // // // // //     }, [user, sessionInitialized]); // Re-exécuter si l'utilisateur ou l'état d'initialisation change
// // // // // //     // ---------------------------------------------

// // // // // //     // --- NOUVEAU: Charger les rôles au montage ou quand user/session change ---
// // // // // //     useEffect(() => {
// // // // // //         loadUserRoles();
// // // // // //     }, [loadUserRoles]); // Dépend de la fonction useCallback
// // // // // //     // --------------------------------------------------------------------

// // // // // //     // --- NOUVEAU: Logique pour déterminer quel onglet afficher ---
// // // // // //     // Est-ce un hôte vérifié ?
// // // // // //     const isHost = user && userRoles.some(role => ['host', 'hostpro'].includes(role));
// // // // // //     // Est-ce un utilisateur connecté non-hôte (pour voir "Devenir Hôte") ?
// // // // // //     const isPotentialHost = user && userRoles.some(role => ['usernotverified', 'swimmer'].includes(role));
// // // // // //     // Vous pouvez affiner : par exemple, si un 'swimmer' ne peut JAMAIS devenir hôte, retirez-le de isPotentialHost.
// // // // // //     // const isPotentialHost = user && userRoles.includes('usernotverified');
// // // // // //     // -----------------------------------------------------------

// // // // // //     // --- Optionnel: Redirection si l'utilisateur est sur le mauvais onglet ---
// // // // // //     // (Peut être utile si la navigation directe via URL est possible)
// // // // // //     useEffect(() => {
// // // // // //         if (!isLoadingRoles && user) {
// // // // // //             const currentTab = segments[segments.length - 1];

// // // // // //             if (currentTab === 'host/(dashboard)' && !isHost) {
// // // // // //                 console.warn("[TabLayout] Accès non autorisé à l'onglet host, redirection...");
// // // // // //                 console.error("!!! REDIRECTION VERS / DEPUIS [NOM DU FICHIER] !!! Raison: [...]");   router.replace('/') ;  // Redirige vers l'accueil
// // // // // //             }
// // // // // //             if (currentTab === 'become-host' && !isPotentialHost && !isHost /* Admin? */) {
// // // // // //                  console.warn("[TabLayout] Accès non autorisé à l'onglet become-host, redirection...");
// // // // // //                  console.error("!!! REDIRECTION VERS / DEPUIS [NOM DU FICHIER] !!! Raison: [...]");   router.replace('/') ;  // Redirige vers l'accueil
// // // // // //             }
// // // // // //         }
// // // // // //     }, [segments, user, isLoadingRoles, isHost, isPotentialHost, router]);
// // // // // //     // ---------------------------------------------------------------------


// // // // // //      // --- Afficher un chargement global tant que la session ou les rôles ne sont pas prêts ---
// // // // // //      if (!sessionInitialized || (user && isLoadingRoles)) {
// // // // // //          return (
// // // // // //              <View style={styles.loadingContainer}>
// // // // // //                  <ActivityIndicator size="large" color="#0891b2" />
// // // // // //              </View>
// // // // // //          );
// // // // // //      }
// // // // // //      // ------------------------------------------------------------------------------------

// // // // // //     return (
// // // // // //         <Tabs
// // // // // //             screenOptions={{
// // // // // //                 headerShown: false,
// // // // // //                 tabBarStyle: {
// // // // // //                     backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f0f0f0',
// // // // // //                     height: 60, paddingBottom: 5, paddingTop: 5, // Ajustements potentiels pour l'apparence
// // // // // //                 },
// // // // // //                 tabBarActiveTintColor: '#0891b2',
// // // // // //                 tabBarInactiveTintColor: '#64748b',
// // // // // //                 tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 10 } // Style de label
// // // // // //             }}>
// // // // // //             {/* Onglets Communs */}
// // // // // //             <Tabs.Screen
// // // // // //                 name="index"
// // // // // //                 options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Home size={size} color={color} />, }}
// // // // // //             />
// // // // // //             <Tabs.Screen
// // // // // //                 name="search"
// // // // // //                 options={{ title: 'Rechercher', tabBarIcon: ({ color, size }) => <Search size={size} color={color} />, }}
// // // // // //             />
// // // // // //             <Tabs.Screen
// // // // // //                 name="events"
// // // // // //                 options={{ title: 'Événements', tabBarIcon: ({ color, size }) => <PartyPopper size={size} color={color} />, }}
// // // // // //             />

// // // // // //             {/* --- Onglets Conditionnels --- */}
// // // // // //             {!isLoadingRoles && user && ( // Assurer que user existe et rôles chargés
// // // // // //                 <>
// // // // // //                     {/* Onglet "Devenir Hôte" si usernotverified ou swimmer */}
// // // // // //                     {isPotentialHost && (
// // // // // //                         <Tabs.Screen
// // // // // //                             name="become-host" // <- Correspond au fichier app/(tabs)/become-host.tsx
// // // // // //                             options={{
// // // // // //                                 title: 'Devenir Hôte',
// // // // // //                                 tabBarIcon: ({ color, size }) => <BecomeHostIcon size={size} color={color} />,
// // // // // //                             }}
// // // // // //                         />
// // // // // //                     )}

// // // // // //                     {/* Onglet "Espace Hôte" si host ou hostpro */}
// // // // // //                     {isHost && (
// // // // // //                         <Tabs.Screen
// // // // // //                             // Important: Le nom pointe vers le dossier du layout imbriqué
// // // // // //                             name="host/(dashboard)" // <- Pointe vers app/(tabs)/host/(dashboard)/_layout.tsx
// // // // // //                             options={{
// // // // // //                                 title: 'Espace Hôte', // Ou "Mon Espace", "Dashboard"
// // // // // //                                 tabBarIcon: ({ color, size }) => <HostIcon size={size} color={color} />,
// // // // // //                             }}
// // // // // //                         />
// // // // // //                     )}
// // // // // //                 </>
// // // // // //             )}
// // // // // //              {/* --- Fin Onglets Conditionnels --- */}


// // // // // //             {/* Onglet Profil (toujours affiché si connecté ?) */}
// // // // // //             {/* Vous pourriez aussi le conditionner si nécessaire */}
// // // // // //             <Tabs.Screen
// // // // // //                 name="profile" // <= Doit pointer vers app/(tabs)/profile.tsx ou app/(tabs)/profile/index.tsx
// // // // // //                 options={{
// // // // // //                     title: 'Profil',
// // // // // //                     tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
// // // // // //                 }}
// // // // // //             />
// // // // // //         </Tabs>
// // // // // //     );
// // // // // // }

// // // // // // // Style simple pour le chargement
// // // // // // const styles = StyleSheet.create({
// // // // // //     loadingContainer: {
// // // // // //         flex: 1,
// // // // // //         justifyContent: 'center',
// // // // // //         alignItems: 'center',
// // // // // //         backgroundColor: '#ffffff', // Ou couleur de fond de l'app
// // // // // //     }
// // // // // // });
// // // // // // import React, { useState, useEffect, useCallback } from 'react';
// // // // // // import { Tabs, useSegments, router } from 'expo-router';
// // // // // // import { ActivityIndicator, View, StyleSheet } from 'react-native';
// // // // // // import {
// // // // // //     Chrome as Home, Search, PartyPopper, User,
// // // // // //     School as HostIcon,       // Icône pour Espace Hôte
// // // // // //     Briefcase as BecomeHostIcon // Icône pour Devenir Hôte
// // // // // // } from 'lucide-react-native';
// // // // // // import { useAuth } from '@/hooks/useAuth';
// // // // // // import { supabase } from '@/lib/supabase';

// // // // // // export default function TabLayout() {
// // // // // //     const { user, sessionInitialized } = useAuth();
// // // // // //     const [userRoles, setUserRoles] = useState<string[]>([]);
// // // // // //     const [isLoadingRoles, setIsLoadingRoles] = useState(true);
// // // // // //     const segments = useSegments();

// // // // // //     // Fonction pour charger les rôles
// // // // // //     const loadUserRoles = useCallback(async () => {
// // // // // //         if (!sessionInitialized || !user) { setUserRoles([]); setIsLoadingRoles(false); return; }
// // // // // //         setIsLoadingRoles(true); console.log("[TabLayout] Fetching user roles...");
// // // // // //         try {
// // // // // //             const { data: rolesResult, error: rpcError } = await supabase.rpc('get_user_roles', { user_uuid: user.id });
// // // // // //             if (rpcError) throw rpcError;
// // // // // //             const roles = (rolesResult || []).map((r: { role_name: string }) => r.role_name).filter(Boolean);
// // // // // //             // Comparaison pour éviter mise à jour état inutile si rôles identiques
// // // // // //             if (JSON.stringify(roles) !== JSON.stringify(userRoles)) {
// // // // // //                 setUserRoles(roles); console.log("[TabLayout] User roles updated:", roles);
// // // // // //             } else {
// // // // // //                 console.log("[TabLayout] User roles unchanged."); setIsLoadingRoles(false);
// // // // // //             }
// // // // // //         } catch (err) { console.error('[TabLayout] Error loading user roles:', err); setUserRoles([]); }
// // // // // //         finally { setIsLoadingRoles(false); }
// // // // // //     }, [user, sessionInitialized, userRoles]); // dépendance userRoles ajoutée pour comparaison

// // // // // //     // Charger les rôles
// // // // // //     useEffect(() => { loadUserRoles(); }, [loadUserRoles]);

// // // // // //     // Conditions d'affichage
// // // // // //     const isHost = user && userRoles.some(role => ['host', 'hostpro'].includes(role));
// // // // // //     const isPotentialHost = user && userRoles.some(role => ['usernotverified', 'swimmer'].includes(role));

// // // // // //     // Optionnel: Protection de Route
// // // // // //     useEffect(() => { if (!isLoadingRoles && user) { const currentRouteBase = segments[1]; if (currentRouteBase === 'host' && segments[2] === '(dashboard)' && !isHost) { console.warn("[TabLayout] Redirecting: Not host..."); console.error("!!! REDIRECTION VERS / DEPUIS [NOM DU FICHIER] !!! Raison: [...]");   router.replace('/') ;  } else if (currentRouteBase === 'become-host' && !isPotentialHost && !isHost) { console.warn("[TabLayout] Redirecting: Not potential host..."); console.error("!!! REDIRECTION VERS / DEPUIS [NOM DU FICHIER] !!! Raison: [...]");   router.replace('/') ;  } } }, [segments, user, isLoadingRoles, isHost, isPotentialHost, router]);

// // // // // //     // État de chargement
// // // // // //      if (!sessionInitialized || (user && isLoadingRoles)) {
// // // // // //          return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></View>;
// // // // // //      }

// // // // // //     return (
// // // // // //         <Tabs
// // // // // //             screenOptions={{
// // // // // //                 headerShown: false,
// // // // // //                 tabBarStyle: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f0f0f0', height: 60, paddingBottom: 5, paddingTop: 5, },
// // // // // //                 tabBarActiveTintColor: '#0891b2',
// // // // // //                 tabBarInactiveTintColor: '#64748b',
// // // // // //                 tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 10 }
// // // // // //             }}>

// // // // // //             {/* Onglets Communs */}
// // // // // //             <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Home size={size} color={color} />, }} />
// // // // // //             <Tabs.Screen name="search" options={{ title: 'Rechercher', tabBarIcon: ({ color, size }) => <Search size={size} color={color} />, }} />
// // // // // //             <Tabs.Screen name="events" options={{ title: 'Événements', tabBarIcon: ({ color, size }) => <PartyPopper size={size} color={color} />, }} />

// // // // // //             {/* Onglet pour masquer /host */}
// // // // // //             <Tabs.Screen name="host" options={{ href: null }} />

// // // // // //             {/* --- Onglets Conditionnels (Corrigé SANS fragment) --- */}
// // // // // //             {!isLoadingRoles && user && isPotentialHost && (
// // // // // //                 <Tabs.Screen
// // // // // //                     name="become-host" // -> app/(tabs)/become-host.tsx
// // // // // //                     options={{
// // // // // //                         title: 'Devenir Hôte',
// // // // // //                         tabBarIcon: ({ color, size }) => <BecomeHostIcon size={size} color={color} />,
// // // // // //                     }}
// // // // // //                 />
// // // // // //             )}
// // // // // //             {!isLoadingRoles && user && isHost && (
// // // // // //                  <Tabs.Screen
// // // // // //                     name="host/(dashboard)" // -> app/(tabs)/host/(dashboard)/_layout.tsx
// // // // // //                     options={{
// // // // // //                         title: 'Espace Hôte',
// // // // // //                         tabBarIcon: ({ color, size }) => <HostIcon size={size} color={color} />,
// // // // // //                     }}
// // // // // //                 />
// // // // // //             )}
// // // // // //              {/* --- Fin Onglets Conditionnels --- */}

// // // // // //             {/* Onglet Profil */}
// // // // // //             {/* On pourrait aussi le conditionner avec {user && ...} si non visible quand déconnecté */}
// // // // // //             <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />

// // // // // //         </Tabs>
// // // // // //     );
// // // // // // }

// // // // // // // Style simple pour le chargement
// // // // // // const styles = StyleSheet.create({
// // // // // //     loadingContainer: {
// // // // // //         flex: 1,
// // // // // //         justifyContent: 'center',
// // // // // //         alignItems: 'center',
// // // // // //         backgroundColor: '#ffffff', // Ou couleur de fond de l'app
// // // // // //     }
// // // // // // });


// // // // // // import React, { useState, useEffect, useCallback } from 'react';
// // // // // // import { Tabs, useSegments, router } from 'expo-router';
// // // // // // import { ActivityIndicator, View, StyleSheet } from 'react-native';
// // // // // // import {
// // // // // //     Chrome as Home, Search, PartyPopper, User,
// // // // // //     School as HostIcon,       // Icône pour Espace Hôte
// // // // // //     Briefcase as BecomeHostIcon // Icône pour Devenir Hôte
// // // // // // } from 'lucide-react-native';
// // // // // // import { useAuth } from '@/hooks/useAuth';
// // // // // // import { supabase } from '@/lib/supabase';

// // // // // // export default function TabLayout() {
// // // // // //     // --- Récupération user et état session ---
// // // // // //     const { user, sessionInitialized } = useAuth();
// // // // // //     const [userRoles, setUserRoles] = useState<string[]>([]);
// // // // // //     const [isLoadingRoles, setIsLoadingRoles] = useState(true);
// // // // // //     const segments = useSegments(); // Pour la protection de route optionnelle

// // // // // //     // --- Fonction pour charger les rôles ---
// // // // // //     const loadUserRoles = useCallback(async () => {
// // // // // //         if (!sessionInitialized || !user) { // Ne charger que si session prête ET user connecté
// // // // // //             setUserRoles([]);
// // // // // //             setIsLoadingRoles(false);
// // // // // //             return;
// // // // // //         }
// // // // // //         // Si les rôles sont déjà connus pour cet user et qu'on ne recharge pas activement, on sort
// // // // // //         // (Évite des re-fetch inutiles si userRoles est déjà dans les dépendances de useEffect)
// // // // // //         // Note : Peut nécessiter une logique de rafraîchissement si les rôles changent PENDANT la session.
// // // // // //         if (userRoles.length > 0 && !isLoadingRoles) {
// // // // // //              // Optionnel : re-vérifier si l'ID utilisateur a changé pour forcer un re-fetch si nécessaire
// // // // // //              // console.log("[TabLayout] Roles already potentially loaded, skipping fetch unless user changed.");
// // // // // //              // return; // Décommenter si vous voulez éviter le re-fetch systématique
// // // // // //         }

// // // // // //         setIsLoadingRoles(true);
// // // // // //         console.log("[TabLayout] Fetching user roles...");
// // // // // //         try {
// // // // // //             const { data: rolesResult, error: rpcError } = await supabase.rpc(
// // // // // //                 'get_user_roles', { user_uuid: user.id }
// // // // // //             );
// // // // // //             if (rpcError) throw rpcError;
// // // // // //             const roles = (rolesResult || []).map((r: { role_name: string }) => r.role_name).filter(Boolean);
// // // // // //             // Mise à jour seulement si les rôles ont changé pour éviter boucle de rendu
// // // // // //             if (JSON.stringify(roles) !== JSON.stringify(userRoles)) {
// // // // // //                  setUserRoles(roles);
// // // // // //                  console.log("[TabLayout] User roles fetched/updated:", roles);
// // // // // //             } else {
// // // // // //                  console.log("[TabLayout] User roles fetched but unchanged.");
// // // // // //             }
// // // // // //         } catch (err) {
// // // // // //             console.error('[TabLayout] Error loading user roles:', err);
// // // // // //             setUserRoles([]); // Reset en cas d'erreur
// // // // // //         } finally {
// // // // // //             setIsLoadingRoles(false);
// // // // // //         }
// // // // // //      // Retiré userRoles des dépendances ici pour éviter boucle potentielle si màj état déclenche màj useCallback
// // // // // //     }, [user, sessionInitialized]);

// // // // // //     // --- Charger les rôles au montage ou quand user/session change ---
// // // // // //     useEffect(() => {
// // // // // //         loadUserRoles();
// // // // // //     }, [loadUserRoles]); // Se redéclenche si user/sessionInitialized changent via useCallback

// // // // // //     // --- Conditions d'affichage ---
// // // // // //     const isHost = user && userRoles.some(role => ['host', 'hostpro'].includes(role));
// // // // // //     const isPotentialHost = user && userRoles.some(role => ['usernotverified', 'swimmer'].includes(role));

// // // // // //     // --- Protection de Route (Optionnelle mais recommandée) ---
// // // // // //     useEffect(() => {
// // // // // //         // Attendre que les rôles soient chargés et que l'utilisateur soit défini
// // // // // //         if (isLoadingRoles || !sessionInitialized) return;

// // // // // //         const currentRouteBase = segments[1]; // Le segment après (tabs), ex: 'index', 'host', 'become-host'
// // // // // //         const currentSubRoute = segments[2]; // Ex: '(dashboard)' si dans /host/(dashboard)

// // // // // //         // Si l'utilisateur est chargé (non null)
// // // // // //         if (user) {
// // // // // //             // S'il est sur un écran "host" mais n'a pas le rôle host -> Accueil
// // // // // //             if (currentRouteBase === 'host' && currentSubRoute === '(dashboard)' && !isHost) {
// // // // // //                 console.warn("[TabLayout] Redirecting: Not a host, cannot access host/(dashboard).");
// // // // // //                 console.error("!!! REDIRECTION VERS / DEPUIS [NOM DU FICHIER] !!! Raison: [...]");   router.replace('/') ; 
// // // // // //             }
// // // // // //             // S'il est sur "become-host" mais n'est pas un "potential host" (et n'est pas déjà host non plus) -> Accueil
// // // // // //             else if (currentRouteBase === 'become-host' && !isPotentialHost && !isHost) {
// // // // // //                  console.warn("[TabLayout] Redirecting: Should not be on become-host tab.");
// // // // // //                  console.error("!!! REDIRECTION VERS / DEPUIS [NOM DU FICHIER] !!! Raison: [...]");   router.replace('/') ; 
// // // // // //             }
// // // // // //         }
// // // // // //         // Optionnel : Si l'utilisateur n'est PAS connecté et essaie d'accéder à autre chose que 'index', 'search', 'events' ?
// // // // // //         // else if (!user && !['index', 'search', 'events'].includes(currentRouteBase)) {
// // // // // //         //      console.warn("[TabLayout] Redirecting: Not logged in, cannot access:", currentRouteBase);
// // // // // //         //      console.error("!!! REDIRECTION VERS / DEPUIS [NOM DU FICHIER] !!! Raison: [...]");   router.replace('/') ; 
// // // // // //         // }

// // // // // //     }, [segments, user, isLoadingRoles, isHost, isPotentialHost, router, sessionInitialized]); // Ajouter sessionInitialized


// // // // // //     // --- État de Chargement Initial ---
// // // // // //     // Attend que la session soit vérifiée ET que les rôles soient chargés si user existe
// // // // // //      if (!sessionInitialized || (user && isLoadingRoles)) {
// // // // // //          return (
// // // // // //              <View style={styles.loadingContainer}>
// // // // // //                  <ActivityIndicator size="large" color="#0891b2" />
// // // // // //              </View>
// // // // // //          );
// // // // // //      }
// // // // // //     // ------------------------------------

// // // // // //     // --- Rendu des Onglets ---
// // // // // //     return (
// // // // // //         <Tabs
// // // // // //             screenOptions={{
// // // // // //                 headerShown: false,
// // // // // //                 tabBarStyle: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f0f0f0', height: 60, paddingBottom: 5, paddingTop: 5, },
// // // // // //                 tabBarActiveTintColor: '#0891b2',
// // // // // //                 tabBarInactiveTintColor: '#64748b',
// // // // // //                 tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 10 }
// // // // // //             }}>

// // // // // //             {/* Onglets Communs */}
// // // // // //             <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Home size={size} color={color} />, }} />
// // // // // //             <Tabs.Screen name="search" options={{ title: 'Rechercher', tabBarIcon: ({ color, size }) => <Search size={size} color={color} />, }} />
// // // // // //             <Tabs.Screen name="events" options={{ title: 'Événements', tabBarIcon: ({ color, size }) => <PartyPopper size={size} color={color} />, }} />

// // // // // //             {/* Onglet pour masquer /host (important!) */}
// // // // // //             <Tabs.Screen name="host" options={{ href: null }} />

// // // // // //             {/* --- Onglets Conditionnels (Syntaxe Corrigée) --- */}
// // // // // //             {/* Affiche seulement si chargement terminé ET utilisateur connecté */}
// // // // // //             {!isLoadingRoles && user && (
// // // // // //                 <>
// // // // // //                     {isPotentialHost && (
// // // // // //                         <Tabs.Screen
// // // // // //                             name="become-host" // -> app/(tabs)/become-host.tsx
// // // // // //                             options={{ title: 'Devenir Hôte', tabBarIcon: ({ color, size }) => <BecomeHostIcon size={size} color={color} /> }}
// // // // // //                         />
// // // // // //                     )}
// // // // // //                     {isHost && (
// // // // // //                          <Tabs.Screen
// // // // // //                             name="host/(dashboard)" // <- Pointe vers le groupe de layout imbriqué
// // // // // //                             options={{ title: 'Espace Hôte', tabBarIcon: ({ color, size }) => <HostIcon size={size} color={color} /> }}
// // // // // //                          />
// // // // // //                      )}
// // // // // //                  </>
// // // // // //             )}
// // // // // //              {/* --- Fin Onglets Conditionnels --- */}


// // // // // //             {/* Onglet Profil */}
// // // // // //             {/* Conditionner l'affichage si l'utilisateur doit être connecté pour voir le profil */}
// // // // // //             {user && (
// // // // // //                 <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />
// // // // // //             )}

// // // // // //         </Tabs>
// // // // // //     );
// // // // // // }

// // // // // // // Style simple pour le chargement
// // // // // // const styles = StyleSheet.create({
// // // // // //     loadingContainer: {
// // // // // //         flex: 1,
// // // // // //         justifyContent: 'center',
// // // // // //         alignItems: 'center',
// // // // // //         backgroundColor: '#ffffff', // Ou couleur de fond de l'app
// // // // // //     }
// // // // // // });
// // // // // // import React, { useState, useEffect, useCallback } from 'react';

// // // // // // import { Tabs, useSegments, router } from 'expo-router';

// // // // // // import { ActivityIndicator, View, StyleSheet } from 'react-native';

// // // // // // import {

// // // // // //     Chrome as Home, Search, PartyPopper, User,

// // // // // //     School as HostIcon,       // Icône pour Espace Hôte

// // // // // //     Briefcase as BecomeHostIcon // Icône pour Devenir Hôte

// // // // // // } from 'lucide-react-native';

// // // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // // import { supabase } from '@/lib/supabase';



// // // // // // export default function TabLayout() {

// // // // // //     // --- Compteur de rendu pour débogage ---

// // // // // //     const renderCount = React.useRef(0);

// // // // // //     renderCount.current += 1;

// // // // // //     console.log("[TabLayout] Render count:", renderCount.current);



// // // // // //     // --- Récupération user et état session ---

// // // // // //     const { user, sessionInitialized } = useAuth();

// // // // // //     const [userRoles, setUserRoles] = useState([]);

// // // // // //     const [isLoadingRoles, setIsLoadingRoles] = useState(true);

// // // // // //     const segments = useSegments(); // Pour la protection de route optionnelle



// // // // // //     // --- Fonction pour charger les rôles ---

// // // // // //     const loadUserRoles = useCallback(async () => {

// // // // // //         if (!sessionInitialized || !user) { // Ne charger que si session prête ET user connecté

// // // // // //             setUserRoles([]);

// // // // // //             setIsLoadingRoles(false);

// // // // // //             return;

// // // // // //         }



// // // // // //         setIsLoadingRoles(true);

// // // // // //         console.log("[TabLayout] Fetching user roles...");

// // // // // //         try {

// // // // // //             const { data: rolesResult, error: rpcError } = await supabase.rpc(

// // // // // //                 'get_user_roles', { user_uuid: user.id }

// // // // // //             );

// // // // // //             if (rpcError) throw rpcError;

// // // // // //             const roles = (rolesResult || []).map((r) => r.role_name).filter(Boolean);

            

// // // // // //             // Utilisation de la fonction d'état qui reçoit l'état précédent, évitant la dépendance à userRoles

// // // // // //             setUserRoles(prevRoles => {

// // // // // //                 const prevRolesStr = JSON.stringify(prevRoles);

// // // // // //                 const newRolesStr = JSON.stringify(roles);

                

// // // // // //                 if (prevRolesStr !== newRolesStr) {

// // // // // //                     console.log("[TabLayout] User roles fetched/updated:", roles);

// // // // // //                     return roles;

// // // // // //                 } else {

// // // // // //                     console.log("[TabLayout] User roles fetched but unchanged.");

// // // // // //                     return prevRoles;

// // // // // //                 }

// // // // // //             });

// // // // // //         } catch (err) {

// // // // // //             console.error('[TabLayout] Error loading user roles:', err);

// // // // // //             setUserRoles([]); // Reset en cas d'erreur

// // // // // //         } finally {

// // // // // //             setIsLoadingRoles(false);

// // // // // //         }

// // // // // //     }, [user, sessionInitialized]); // Suppression de userRoles des dépendances



// // // // // //     // --- Charger les rôles au montage ou quand user/session change ---

// // // // // //     useEffect(() => {

// // // // // //         loadUserRoles();

// // // // // //     }, [loadUserRoles]); // Se redéclenche si user/sessionInitialized changent via useCallback



// // // // // //     // --- Conditions d'affichage ---

// // // // // //     const isHost = user && userRoles.some(role => ['host', 'hostpro'].includes(role));

// // // // // //     const isPotentialHost = user && userRoles.some(role => ['usernotverified', 'swimmer'].includes(role));



// // // // // //     // --- Protection de Route (Optionnelle mais recommandée) ---

// // // // // //     useEffect(() => {

// // // // // //         // Sécurité pour éviter de traiter les segments non définis

// // // // // //         if (!segments || segments.length < 2 || isLoadingRoles || !sessionInitialized) return;



// // // // // //         const currentRouteBase = segments[1]; // Le segment après (tabs), ex: 'index', 'host', 'become-host'

// // // // // //         const currentSubRoute = segments[2]; // Ex: '(dashboard)' si dans /host/(dashboard)



// // // // // //         // Si l'utilisateur est chargé (non null)

// // // // // //         if (user) {

// // // // // //             // S'il est sur un écran "host" mais n'a pas le rôle host -> Accueil

// // // // // //             if (currentRouteBase === 'host' && !isHost) {

// // // // // //                 console.warn("[TabLayout] Redirecting: Not a host, cannot access host route.");

// // // // // //                 console.error("!!! REDIRECTION VERS / DEPUIS [NOM DU FICHIER] !!! Raison: [...]");   router.replace('/') ; 

// // // // // //             }

// // // // // //             // S'il est sur "become-host" mais n'est pas un "potential host" (et n'est pas déjà host non plus) -> Accueil

// // // // // //             else if (currentRouteBase === 'become-host' && !isPotentialHost && !isHost) {

// // // // // //                  console.warn("[TabLayout] Redirecting: Should not be on become-host tab.");

// // // // // //                  console.error("!!! REDIRECTION VERS / DEPUIS [NOM DU FICHIER] !!! Raison: [...]");   router.replace('/') ; 

// // // // // //             }

// // // // // //         }

// // // // // //     }, [segments, user, isLoadingRoles, isHost, isPotentialHost, router, sessionInitialized]);





// // // // // //     // --- État de Chargement Initial ---

// // // // // //     // Attend que la session soit vérifiée ET que les rôles soient chargés si user existe

// // // // // //      if (!sessionInitialized || (user && isLoadingRoles)) {

// // // // // //          return (

// // // // // //              <View style={styles.loadingContainer}>

// // // // // //                  <ActivityIndicator size="large" color="#0891b2" />

// // // // // //              </View>

// // // // // //          );

// // // // // //      }

// // // // // //     // ------------------------------------


// // // // // // // --- Rendu des Onglets ---
// // // // // //     return (
// // // // // //         <Tabs
// // // // // //             screenOptions={{
// // // // // //                 headerShown: false,
// // // // // //                 tabBarStyle: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f0f0f0', height: 60, paddingBottom: 5, paddingTop: 5, },
// // // // // //                 tabBarActiveTintColor: '#0891b2',
// // // // // //                 tabBarInactiveTintColor: '#64748b',
// // // // // //                 tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 10 }
// // // // // //             }}>

// // // // // //             {/* Onglets Communs */}
// // // // // //             <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Home size={size} color={color} />, }} />
// // // // // //             <Tabs.Screen name="search" options={{ title: 'Rechercher', tabBarIcon: ({ color, size }) => <Search size={size} color={color} />, }} />
// // // // // //             <Tabs.Screen name="events/index" options={{ title: 'Événements', tabBarIcon: ({ color, size }) => <PartyPopper size={size} color={color} />, }} />

// // // // // //             {/* --- Onglets Conditionnels (Corrigés) --- */}
// // // // // //             {!isLoadingRoles && user && (
// // // // // //                 <>
// // // // // //                     {/* Affiche 'Devenir Hôte' SEULEMENT si potentiel ET PAS déjà hôte */}
// // // // // //                     {isPotentialHost && !isHost && ( 
// // // // // //                         <Tabs.Screen
// // // // // //                             name="become-host" // -> app/(tabs)/become-host.tsx
// // // // // //                             options={{ title: 'Devenir Hôte', tabBarIcon: ({ color, size }) => <BecomeHostIcon size={size} color={color} /> }}
// // // // // //                         />
// // // // // //                     )}
// // // // // //                     {/* Affiche 'Espace Hôte' si l'utilisateur est hôte */}
// // // // // //                     {isHost && (
// // // // // //                          <Tabs.Screen
// // // // // //                              name="host/dashboard" // Correction pour pointer vers le fichier réel dashboard.tsx
// // // // // //                              options={{ title: 'Espace Hôte', tabBarIcon: ({ color, size }) => <HostIcon size={size} color={color} /> }}
// // // // // //                          />
// // // // // //                      )}
// // // // // //                  </>
// // // // // //             )}
// // // // // //             {/* --- Fin Onglets Conditionnels --- */}

// // // // // //             {/* Onglet Profil */}
// // // // // //             {user && (
// // // // // //                 <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />
// // // // // //             )}

// // // // // //         </Tabs>
// // // // // //     );
// // // // // // }

// // // // // // // Style simple pour le chargement
// // // // // // const styles = StyleSheet.create({
// // // // // //     loadingContainer: {
// // // // // //         flex: 1,
// // // // // //         justifyContent: 'center',
// // // // // //         alignItems: 'center',
// // // // // //         backgroundColor: '#ffffff', // Ou couleur de fond de l'app
// // // // // //     }
// // // // // // });


// // // // // import React, { useMemo } from 'react'; // Importer useMemo
// // // // // import { Tabs } from 'expo-router';
// // // // // import { ActivityIndicator, View, StyleSheet } from 'react-native';
// // // // // import {
// // // // //     Chrome as Home, Search, PartyPopper, User,
// // // // //     School as HostIcon,
// // // // //     Briefcase as BecomeHostIcon
// // // // // } from 'lucide-react-native';
// // // // // import { useAuth } from '@/hooks/useAuth'; // Utiliser le hook mis à jour

// // // // // export default function TabLayout() {
// // // // //     // --- Récupération état global depuis useAuth ---
// // // // //     // Note: isLoading combine maintenant chargement session ET rôles
// // // // //     const { user, sessionInitialized, userRoles, isLoading } = useAuth();

// // // // //     // --- Conditions d'affichage dérivées de userRoles ---
// // // // //     // Utiliser useMemo pour éviter de recalculer à chaque rendu si userRoles ne change pas
// // // // //     const isHost = useMemo(() =>
// // // // //         userRoles.some(role => ['host', 'hostpro'].includes(role)),
// // // // //         [userRoles] // Recalculer seulement si userRoles change
// // // // //     );
// // // // //     const isPotentialHost = useMemo(() =>
// // // // //         userRoles.some(role => ['usernotverified', 'swimmer'].includes(role)),
// // // // //         [userRoles] // Recalculer seulement si userRoles change
// // // // //     );

// // // // //     // --- État de Chargement Initial (utilise isLoading de useAuth) ---
// // // // //     if (!sessionInitialized || isLoading) {
// // // // //         return (
// // // // //             <View style={styles.loadingContainer}>
// // // // //                 <ActivityIndicator size="large" color="#0891b2" />
// // // // //             </View>
// // // // //         );
// // // // //     }
// // // // //     // ------------------------------------

// // // // //     // --- Construire la liste des écrans dynamiquement (pour éviter warning Expo Router) ---
// // // // //     const screens = [];

// // // // //     // Onglets Communs
// // // // //     screens.push(<Tabs.Screen key="index" name="index" options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Home size={size} color={color} />, }} />);
// // // // //     screens.push(<Tabs.Screen key="search" name="search" options={{ title: 'Rechercher', tabBarIcon: ({ color, size }) => <Search size={size} color={color} />, }} />);
// // // // //     screens.push(<Tabs.Screen key="events" name="events/index" options={{ title: 'Événements', tabBarIcon: ({ color, size }) => <PartyPopper size={size} color={color} />, }} />);

// // // // //     // Onglets Conditionnels
// // // // //     if (user) { // Vérifier si l'utilisateur est connecté
// // // // //         if (isPotentialHost && !isHost) {
// // // // //             screens.push(
// // // // //                 <Tabs.Screen
// // // // //                     key="become-host"
// // // // //                     name="become-host"
// // // // //                     options={{ title: 'Devenir Hôte', tabBarIcon: ({ color, size }) => <BecomeHostIcon size={size} color={color} /> }}
// // // // //                 />
// // // // //             );
// // // // //         }
// // // // //         if (isHost) {
// // // // //             screens.push(
// // // // //                 <Tabs.Screen
// // // // //                     key="host-dashboard"
// // // // //                     name="host" // Assurez-vous que ce chemin correspond à votre fichier
// // // // //                     options={{ title: 'Espace Hôte', tabBarIcon: ({ color, size }) => <HostIcon size={size} color={color} /> }}
// // // // //                 />
// // // // //             );
// // // // //         }
// // // // //          // Onglet Profil (si connecté)
// // // // //         screens.push(<Tabs.Screen key="profile" name="profile" options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />);
// // // // //     }


// // // // //     // --- Rendu des Onglets ---
// // // // //     return (
// // // // //         <Tabs
// // // // //             screenOptions={{
// // // // //                 headerShown: false,
// // // // //                 tabBarStyle: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f0f0f0', height: 60, paddingBottom: 5, paddingTop: 5, },
// // // // //                 tabBarActiveTintColor: '#0891b2',
// // // // //                 tabBarInactiveTintColor: '#64748b',
// // // // //                 tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 10 }
// // // // //             }}>
// // // // //             {screens}
// // // // //         </Tabs>
// // // // //     );
// // // // // }

// // // // // // Style simple pour le chargement
// // // // // const styles = StyleSheet.create({
// // // // //     loadingContainer: {
// // // // //         flex: 1,
// // // // //         justifyContent: 'center',
// // // // //         alignItems: 'center',
// // // // //         backgroundColor: '#ffffff',
// // // // //     }
// // // // // });
// // // // // TabLayout.tsx - Version corrigée selon toutes les règles

// // // // // import React, { useMemo } from 'react';
// // // // // import { Tabs } from 'expo-router';
// // // // // import { ActivityIndicator, View, StyleSheet } from 'react-native';
// // // // // import {
// // // // //     Chrome as Home, Search, PartyPopper, User,
// // // // //     School as HostIcon,
// // // // //     Briefcase as BecomeHostIcon
// // // // // } from 'lucide-react-native';
// // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // export default function TabLayout() {
// // // // //     const { user, sessionInitialized, userRoles, isLoading } = useAuth();

// // // // //     const isHost = useMemo(() =>
// // // // //         // Vérifie si l'utilisateur a le rôle 'host' ou 'hostpro'
// // // // //         // S'assure que userRoles existe même si vide
// // // // //         (userRoles || []).some(role => ['host', 'hostpro'].includes(role)),
// // // // //         [userRoles]
// // // // //     );

// // // // //     // État de chargement initial
// // // // //     if (!sessionInitialized || isLoading) {
// // // // //         return (
// // // // //             <View style={styles.loadingContainer}>
// // // // //                 <ActivityIndicator size="large" color="#0891b2" />
// // // // //             </View>
// // // // //         );
// // // // //     }

// // // // //     // Construire dynamiquement la liste des écrans
// // // // //     const screens = [];

// // // // //     // 1. Onglets Toujours Publics
// // // // //     screens.push(
// // // // //         <Tabs.Screen
// // // // //             key="index"
// // // // //             name="index"
// // // // //             options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }}
// // // // //         />
// // // // //     );
// // // // //     screens.push(
// // // // //         <Tabs.Screen
// // // // //             key="search"
// // // // //             name="search"
// // // // //             options={{ title: 'Rechercher', tabBarIcon: ({ color, size }) => <Search size={size} color={color} /> }}
// // // // //         />
// // // // //     );
// // // // //     // Supposons que 'Events' est aussi toujours public
// // // // //     screens.push(
// // // // //         <Tabs.Screen
// // // // //             key="events"
// // // // //             name="events/index" // Assurez-vous que le nom correspond à votre structure de fichiers
// // // // //             options={{ title: 'Événements', tabBarIcon: ({ color, size }) => <PartyPopper size={size} color={color} /> }}
// // // // //         />
// // // // //     );

// // // // //     // 2. Onglet "Devenir Hôte"
// // // // //     // Visible si : l'utilisateur N'EST PAS connecté OU (il EST connecté ET il N'EST PAS hôte)
// // // // //     if (!user || (user && !isHost)) {
// // // // //         screens.push(
// // // // //             <Tabs.Screen
// // // // //                 key="become-host"
// // // // //                 name="become-host"
// // // // //                 options={{ title: 'Devenir Hôte', tabBarIcon: ({ color, size }) => <BecomeHostIcon size={size} color={color} /> }}
// // // // //             />
// // // // //         );
// // // // //     }

// // // // //     // 3. Onglet "Espace Hôte" (Tableau de bord)
// // // // //     // Visible si : l'utilisateur EST connecté ET il EST hôte
// // // // //     if (user && isHost) {
// // // // //         screens.push(
// // // // //             <Tabs.Screen
// // // // //                 key="host-dashboard"
// // // // //                 name="host" // Assurez-vous que le nom correspond à votre structure (ex: 'host/index')
// // // // //                 options={{ title: 'Espace Hôte', tabBarIcon: ({ color, size }) => <HostIcon size={size} color={color} /> }}
// // // // //             />
// // // // //         );
// // // // //     }

// // // // //     // 4. Onglet "Profil"
// // // // //     // Visible si : l'utilisateur EST connecté
// // // // //     if (user) {
// // // // //         screens.push(
// // // // //             <Tabs.Screen
// // // // //                 key="profile"
// // // // //                 name="profile"
// // // // //                 options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }}
// // // // //             />
// // // // //         );
// // // // //     }

// // // // //     // Rendu des onglets
// // // // //     return (
// // // // //         <Tabs
// // // // //             screenOptions={{
// // // // //                 headerShown: false,
// // // // //                 tabBarStyle: { /* ... vos styles ... */ },
// // // // //                 tabBarActiveTintColor: '#0891b2',
// // // // //                 tabBarInactiveTintColor: '#64748b',
// // // // //                 tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 10 }
// // // // //             }}
// // // // //         >
// // // // //             {screens}
// // // // //         </Tabs>
// // // // //     );
// // // // // }

// // // // // const styles = StyleSheet.create({
// // // // //     loadingContainer: {
// // // // //         flex: 1,
// // // // //         justifyContent: 'center',
// // // // //         alignItems: 'center',
// // // // //         backgroundColor: '#ffffff',
// // // // //     }
// // // // // });



// // // // // // app/(tabs)/_layout.tsx (TabLayout)

// // // // // import React, { useMemo } from 'react';
// // // // // import { Tabs } from 'expo-router';
// // // // // import { ActivityIndicator, View, StyleSheet } from 'react-native';
// // // // // import {
// // // // //     Chrome as Home, Search, PartyPopper, User,
// // // // //     School as HostIcon, // Assurez-vous que HostIcon est importé
// // // // //     Briefcase as BecomeHostIcon // Assurez-vous que BecomeHostIcon est importé
// // // // // } from 'lucide-react-native';
// // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // export default function TabLayout() {
// // // // //     const { user, sessionInitialized, userRoles, isLoading } = useAuth();

// // // // //     const isHost = useMemo(() =>
// // // // //         (userRoles || []).some(role => ['host', 'hostpro'].includes(role)),
// // // // //         [userRoles]
// // // // //     );

// // // // //     if (!sessionInitialized || isLoading) {
// // // // //         return ( <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></View> );
// // // // //     }

// // // // //     const screens = [];

// // // // //     // 1. Onglets Toujours Publics
// // // // //     screens.push(<Tabs.Screen key="index" name="index" options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }} />);
// // // // //     screens.push(<Tabs.Screen key="search" name="search" options={{ title: 'Rechercher', tabBarIcon: ({ color, size }) => <Search size={size} color={color} /> }} />);
// // // // //     screens.push(<Tabs.Screen key="events" name="events/index" options={{ title: 'Événements', tabBarIcon: ({ color, size }) => <PartyPopper size={size} color={color} /> }} />);

// // // // //     // 2. Onglet "Devenir Hôte" (Conditionnel)
// // // // //     if (!user || (user && !isHost)) {
// // // // //         screens.push(<Tabs.Screen key="become-host" name="become-host" options={{ title: 'Devenir Hôte', tabBarIcon: ({ color, size }) => <BecomeHostIcon size={size} color={color} /> }} />);
// // // // //     }

// // // // //     // 3. Onglet "Espace Hôte" - Défini ici, mais href est conditionnel
// // // // //     screens.push(
// // // // //         <Tabs.Screen
// // // // //             key="host-dashboard" // Gardez une clé unique
// // // // //             name="host"         // Doit correspondre au nom du dossier/fichier (app/(tabs)/host)
// // // // //             options={{
// // // // //                 title: 'Espace Hôte',
// // // // //                 tabBarIcon: ({ color, size }) => <HostIcon size={size} color={color} />, // Utiliser l'icône Hôte

// // // // //                 // --- CONDITION HREF ICI ---
// // // // //                 // Si l'utilisateur est connecté ET est un hôte, on laisse Expo générer le lien (href: undefined)
// // // // //                 // Sinon (non connecté OU non hôte), on met href à null pour masquer l'onglet
// // // // //                 href: (user && isHost) ? undefined : null,
// // // // //                 // -------------------------
// // // // //             }}
// // // // //         />
// // // // //     );

// // // // //     // 4. Onglet "Profil" (Conditionnel)
// // // // //     if (user) {
// // // // //         screens.push(<Tabs.Screen key="profile" name="profile" options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />);
// // // // //     }

// // // // //     // Log pour déboguer les hrefs finaux
// // // // //     console.log('TabLayout - Final screens config:', screens.map(s => ({ key: s.key, name: s.props.name, href: s.props.options?.href })));

// // // // //     return (
// // // // //         <Tabs screenOptions={ { /* ... vos screenOptions ... */ } }>
// // // // //             {screens}
// // // // //         </Tabs>
// // // // //     );
// // // // // }

// // // // // const styles = StyleSheet.create({
// // // // //     loadingContainer: { /* ... */ }
// // // // // });









// // // // // import React, { useMemo } from 'react';
// // // // // import { Tabs } from 'expo-router';
// // // // // import { ActivityIndicator, View, StyleSheet } from 'react-native';
// // // // // import {
// // // // //     Chrome as Home, 
// // // // //     Search, 
// // // // //     PartyPopper, 
// // // // //     User,
// // // // //     School as HostIcon,
// // // // //     Briefcase as BecomeHostIcon
// // // // // } from 'lucide-react-native';
// // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // export default function TabLayout() {
// // // // //     const { user, sessionInitialized, userRoles, isLoading } = useAuth();

// // // // //     const isHost = useMemo(() => 
// // // // //         (userRoles || []).some(role => ['host', 'hostpro'].includes(role)),
// // // // //         [userRoles]
// // // // //     );

// // // // //     // Affichage pendant le chargement initial
// // // // //     if (!sessionInitialized || isLoading) {
// // // // //         return (
// // // // //             <View style={styles.loadingContainer}>
// // // // //                 <ActivityIndicator size="large" color="#0891b2" />
// // // // //             </View>
// // // // //         );
// // // // //     }

// // // // //     // Tableau pour construire les écrans d'onglets dynamiquement
// // // // //     const screens = [];

// // // // //     // 1. Onglets Toujours Publics (ou visibles par tous)
// // // // //     screens.push(
// // // // //         <Tabs.Screen 
// // // // //             key="index" 
// // // // //             name="index" 
// // // // //             options={{ 
// // // // //                 title: 'Accueil', 
// // // // //                 tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> 
// // // // //             }} 
// // // // //         />
// // // // //     );
    
// // // // //     screens.push(
// // // // //         <Tabs.Screen 
// // // // //             key="search" 
// // // // //             name="search" 
// // // // //             options={{ 
// // // // //                 title: 'Rechercher', 
// // // // //                 tabBarIcon: ({ color, size }) => <Search size={size} color={color} /> 
// // // // //             }} 
// // // // //         />
// // // // //     );
    
// // // // //     screens.push(
// // // // //         <Tabs.Screen 
// // // // //             key="events" 
// // // // //             name="events/index" 
// // // // //             options={{ 
// // // // //                 title: 'Événements', 
// // // // //                 tabBarIcon: ({ color, size }) => <PartyPopper size={size} color={color} /> 
// // // // //             }} 
// // // // //         />
// // // // //     );

// // // // //     // 2. Onglet "Devenir Hôte" (ajout dynamique basé sur la logique)
// // // // //     //    Visible si : non connecté OU (connecté ET non hôte)
// // // // //     if (!user || (user && !isHost)) {
// // // // //         screens.push(
// // // // //             <Tabs.Screen 
// // // // //                 key="become-host" 
// // // // //                 name="become-host" 
// // // // //                 options={{ 
// // // // //                     title: 'Devenir Hôte', 
// // // // //                     tabBarIcon: ({ color, size }) => <BecomeHostIcon size={size} color={color} /> 
// // // // //                 }} 
// // // // //             />
// // // // //         );
// // // // //     }

// // // // //     // 3. Onglet "Espace Hôte" - Toujours défini mais masqué via href si besoin
// // // // //     //    Ceci gère le cas où le fichier app/(tabs)/host existe
// // // // //     screens.push(
// // // // //         <Tabs.Screen
// // // // //             key="host-dashboard"
// // // // //             name="host"
// // // // //             options={{
// // // // //                 title: 'Espace Hôte',
// // // // //                 tabBarIcon: ({ color, size }) => <HostIcon size={size} color={color} />,
// // // // //                 // Condition : Masquer l'onglet (href=null) si non connecté OU pas un hôte
// // // // //                 href: (user && isHost) ? undefined : null,
// // // // //             }}
// // // // //         />
// // // // //     );

// // // // //     // 4. Onglet "Profil" (visible uniquement si connecté)
// // // // //     if (user) {
// // // // //         screens.push(
// // // // //             <Tabs.Screen 
// // // // //                 key="profile" 
// // // // //                 name="profile" 
// // // // //                 options={{ 
// // // // //                     title: 'Profil', 
// // // // //                     tabBarIcon: ({ color, size }) => <User size={size} color={color} /> 
// // // // //                 }} 
// // // // //             />
// // // // //         );
// // // // //     }

// // // // //     return (
// // // // //         <Tabs
// // // // //             screenOptions={{
// // // // //                 headerShown: false,
// // // // //                 tabBarStyle: {
// // // // //                     backgroundColor: '#ffffff',
// // // // //                     borderTopWidth: 1,
// // // // //                     borderTopColor: '#f0f0f0',
// // // // //                     height: 60,
// // // // //                     paddingBottom: 5,
// // // // //                     paddingTop: 5
// // // // //                 },
// // // // //                 tabBarActiveTintColor: '#0891b2',
// // // // //                 tabBarInactiveTintColor: '#64748b',
// // // // //                 tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 10 }
// // // // //             }}
// // // // //         >
// // // // //             {screens}
// // // // //             {user && isHost && (
// // // // //                 <Tabs.Screen
// // // // //                     name="become-host"
// // // // //                     options={{ href: null }}
// // // // //                 />
// // // // //             )}
// // // // //         </Tabs>
// // // // //     );
// // // // // }

// // // // // const styles = StyleSheet.create({
// // // // //     loadingContainer: {
// // // // //         flex: 1,
// // // // //         justifyContent: 'center',
// // // // //         alignItems: 'center',
// // // // //         backgroundColor: '#ffffff',
// // // // //     }
// // // // // });

// // // // // Dans app/(tabs)/_layout.js
// // // // // Gestion des onglets principaux et de la visibilité basée sur les rôles
// // // // // VERSION OPTIMISÉE: Évite les rendus superflus et corrige la logique des routes

// // // // import React, { useState, useEffect, useRef, useMemo } from 'react';
// // // // import { Tabs, useSegments, router } from 'expo-router';
// // // // import { ActivityIndicator, View, StyleSheet } from 'react-native';
// // // // import {
// // // //     Home,
// // // //     Search,
// // // //     PartyPopper, 
// // // //     User,
// // // //     School as HostIcon,
// // // //     Briefcase as BecomeHostIcon,
// // // //     BookMarked, 
// // // //     MessageSquare 
// // // // } from 'lucide-react-native';
// // // // import { useAuth } from '@/hooks/useAuth';

// // // // export default function TabLayout() {
// // // //     // Pour le débogage du nombre de rendus
// // // //     const renderCount = useRef(0);
// // // //     renderCount.current += 1;
// // // //     console.log("[TabLayout] Render count:", renderCount.current);

// // // //     // Récupération des données d'authentification avec le hook useAuth
// // // //     const { 
// // // //         user, 
// // // //         sessionInitialized, 
// // // //         isLoading: isAuthLoading, 
// // // //         userRoles: contextUserRoles 
// // // //     } = useAuth();

// // // //     // État local pour les rôles utilisateur (plus sûr que de se fier uniquement au contexte)
// // // //     const [localUserRoles, setLocalUserRoles] = useState(contextUserRoles || []);
    
// // // //     // État pour suivre le chargement des rôles
// // // //     const [isLoadingRoles, setIsLoadingRoles] = useState(true);
    
// // // //     // Segments pour la navigation
// // // //     const segments = useSegments();

// // // //     // Synchronisation des rôles depuis le contexte vers l'état local
// // // //     useEffect(() => {
// // // //         // Compare les tableaux en JSON pour éviter des mises à jour inutiles
// // // //         if (JSON.stringify(contextUserRoles) !== JSON.stringify(localUserRoles)) {
// // // //             console.log("[TabLayout] Syncing roles from context:", contextUserRoles);
// // // //             setLocalUserRoles(contextUserRoles || []);
// // // //         }
        
// // // //         // Mise à jour de l'état de chargement des rôles
// // // //         if (sessionInitialized && !isAuthLoading) {
// // // //             setIsLoadingRoles(false);
// // // //         } else {
// // // //             setIsLoadingRoles(true);
// // // //         }
// // // //     }, [contextUserRoles, sessionInitialized, isAuthLoading, localUserRoles]);

// // // //     // Détermination des rôles avec useMemo pour éviter des calculs inutiles
// // // //     const { isHost, canBecomeHost } = useMemo(() => {
// // // //         const isHostValue = user && localUserRoles.some(role => 
// // // //             ['host', 'hostpro'].includes(role)
// // // //         );
        
// // // //         // Simplification: peut devenir hôte si connecté et pas déjà hôte
// // // //         const canBecomeHostValue = user && !isHostValue;
        
// // // //         return { isHost: isHostValue, canBecomeHost: canBecomeHostValue };
// // // //     }, [user, localUserRoles]);

// // // //     // Protection des routes - Redirection si accès non autorisé
// // // //     useEffect(() => {
// // // //         // Ne rien faire tant que tout n'est pas chargé
// // // //         if (!sessionInitialized || isLoadingRoles) {
// // // //             console.log("[TabLayout] Waiting for session initialization or roles loading...");
// // // //             return;
// // // //         }

// // // //         // Vérifier que les segments sont valides
// // // //         if (!segments || segments.length < 2) {
// // // //             console.log("[TabLayout] Invalid segments, skipping route protection.");
// // // //             return;
// // // //         }

// // // //         const currentRouteBase = segments[1];
// // // //         console.log(`[TabLayout] Current route: ${currentRouteBase}`, {
// // // //             isHost,
// // // //             canBecomeHost,
// // // //             userLoggedIn: !!user
// // // //         });

// // // //         // Logique de redirection pour utilisateur connecté
// // // //         if (user) {
// // // //             // Cas 1: Utilisateur sur route 'host' mais pas hôte
// // // //             if (currentRouteBase === 'host' && !isHost) {
// // // //                 console.warn("[TabLayout] Redirecting: User is not authorized to access host area");
// // // //                 router.replace('/');
// // // //                 return;
// // // //             }
            
// // // //             // Cas 2: Utilisateur sur 'become-host' mais déjà hôte
// // // //             else if (currentRouteBase === 'become-host' && isHost) {
// // // //                 console.warn("[TabLayout] Redirecting: Host trying to access become-host area");
// // // //                 router.replace('/');
// // // //                 return;
// // // //             }
// // // //         } 
// // // //         // Logique pour utilisateur non connecté
// // // //         else {
// // // //             // Rediriger vers login si tente d'accéder à une zone protégée
// // // //             if (['profile', 'bookings', 'conversations', 'host'].includes(currentRouteBase)) {
// // // //                 console.warn(`[TabLayout] Redirecting to login: Anonymous user accessing ${currentRouteBase}`);
// // // //                 router.replace('/auth/login');
// // // //                 return;
// // // //             }
// // // //         }
// // // //     }, [segments, user, isLoadingRoles, isHost, sessionInitialized, router]);

// // // //     // Affichage du loader pendant l'initialisation
// // // //     if (!sessionInitialized || isAuthLoading || isLoadingRoles) {
// // // //         return (
// // // //             <View style={styles.loadingContainer}>
// // // //                 <ActivityIndicator size="large" color="#0891b2" />
// // // //             </View>
// // // //         );
// // // //     }

// // // //     // Rendu des onglets avec gestion conditionnelle de l'affichage
// // // //     return (
// // // //         <Tabs screenOptions={{
// // // //             headerShown: false,
// // // //             tabBarStyle: { 
// // // //                 backgroundColor: '#ffffff', 
// // // //                 borderTopWidth: 1, 
// // // //                 borderTopColor: '#f0f0f0', 
// // // //                 height: 60, 
// // // //                 paddingBottom: 5, 
// // // //                 paddingTop: 5 
// // // //             },
// // // //             tabBarActiveTintColor: '#0891b2',
// // // //             tabBarInactiveTintColor: '#64748b',
// // // //             tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 10 }
// // // //         }}>
// // // //             {/* Onglets Toujours Visibles */}
// // // //             <Tabs.Screen 
// // // //                 name="index" 
// // // //                 options={{ 
// // // //                     title: 'Accueil', 
// // // //                     tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> 
// // // //                 }} 
// // // //             />
            
// // // //             <Tabs.Screen 
// // // //                 name="search" 
// // // //                 options={{ 
// // // //                     title: 'Rechercher', 
// // // //                     tabBarIcon: ({ color, size }) => <Search size={size} color={color} /> 
// // // //                 }} 
// // // //             />
            
// // // //             {/* Onglets Visibles si Connecté */}
// // // //             <Tabs.Screen 
// // // //                 name="bookings" 
// // // //                 options={{ 
// // // //                     title: 'Réservations', 
// // // //                     tabBarIcon: ({ color, size }) => <BookMarked size={size} color={color} />,
// // // //                     href: user ? undefined : null // undefined permet à Expo Router de générer le href automatiquement
// // // //                 }} 
// // // //             />
            
// // // //             <Tabs.Screen 
// // // //                 name="conversations" 
// // // //                 options={{ 
// // // //                     title: 'Messages', 
// // // //                     tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
// // // //                     href: user ? undefined : null
// // // //                 }} 
// // // //             />
            
// // // //             <Tabs.Screen 
// // // //                 name="profile" 
// // // //                 options={{ 
// // // //                     title: 'Profil', 
// // // //                     tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
// // // //                     href: user ? undefined : null
// // // //                 }} 
// // // //             />

// // // //             {/* Onglets Conditionnels Rôles */}
// // // //             <Tabs.Screen 
// // // //                 name="become-host" 
// // // //                 options={{ 
// // // //                     title: 'Devenir Hôte', 
// // // //                     tabBarIcon: ({ color, size }) => <BecomeHostIcon size={size} color={color} />,
// // // //                     href: canBecomeHost ? undefined : null
// // // //                 }} 
// // // //             />
            
// // // //             <Tabs.Screen 
// // // //                 name="host" 
// // // //                 options={{ 
// // // //                     title: 'Espace Hôte', 
// // // //                     tabBarIcon: ({ color, size }) => <HostIcon size={size} color={color} />,
// // // //                     href: (user && isHost) ? undefined : null
// // // //                 }} 
// // // //             />
// // // //         </Tabs>
// // // //     );
// // // // }

// // // // const styles = StyleSheet.create({
// // // //     loadingContainer: { 
// // // //         flex: 1, 
// // // //         justifyContent: 'center', 
// // // //         alignItems: 'center', 
// // // //         backgroundColor: '#ffffff' 
// // // //     }
// // // // });



// // // // // Dans app/(tabs)/_layout.js
// // // // // Gestion des onglets principaux et de la visibilité basée sur les rôles
// // // // // VERSION CORRIGÉE : Logique des onglets affinée selon connexion et rôle

// // // // import React, { useState, useEffect, useRef, useMemo } from 'react';
// // // // import { Tabs, useSegments, router } from 'expo-router';
// // // // import { ActivityIndicator, View, StyleSheet } from 'react-native';
// // // // import {
// // // //     Home,
// // // //     Search,
// // // //     PartyPopper, // Assurez-vous d'avoir un écran events/index.tsx si vous utilisez cet onglet
// // // //     User,
// // // //     School as HostIcon,
// // // //     Briefcase as BecomeHostIcon,
// // // //     BookMarked, // Ajout pour l'onglet Réservations
// // // //     MessageSquare // Ajout pour l'onglet Conversations
// // // // } from 'lucide-react-native';
// // // // import { useAuth } from '@/hooks/useAuth'; // Assurez-vous que le chemin est correct

// // // // export default function TabLayout() {
// // // //     const renderCount = useRef(0);
// // // //     renderCount.current += 1;
// // // //     console.log("[TabLayout] Render count:", renderCount.current);

// // // //     const { user, sessionInitialized, isLoading: isAuthLoading, userRoles } = useAuth();
// // // //     const segments = useSegments();

// // // //     // --- Conditions d'affichage basées sur les rôles (utilisant useMemo) ---
// // // //     const isHost = useMemo(() =>
// // // //         user && (userRoles || []).some(role => ['host', 'hostpro'].includes(role)),
// // // //         [user, userRoles]
// // // //     );
// // // //     // Condition pour afficher "Devenir Hôte" : Non connecté OU connecté mais PAS hôte
// // // //     const showBecomeHost = useMemo(() => !user || (user && !isHost), [user, isHost]);

// // // //     // --- Protection de Route (Optionnelle mais peut rester pour sécurité) ---
// // // //     // Cette logique empêche l'accès direct via URL si le rôle ne correspond pas
// // // //     useEffect(() => {
// // // //         if (!sessionInitialized || isAuthLoading) {
// // // //             console.log("[TabLayout Redirection Check] Waiting for session init or auth loading...");
// // // //             return;
// // // //         }

// // // //         if (user && segments && segments.length >= 2) {
// // // //              const currentRouteBase = segments[1];
// // // //              if (currentRouteBase === 'host' && !isHost) {
// // // //                  console.warn("[TabLayout] Redirecting: Non-host tried to access host route.");
// // // //                  router.replace('/');
// // // //              }
// // // //              else if (currentRouteBase === 'become-host' && isHost) {
// // // //                   console.warn("[TabLayout] Redirecting: Host tried to access become-host route.");
// // // //                   router.replace('/');
// // // //              }
// // // //         }
// // // //     }, [sessionInitialized, isAuthLoading, segments, user, isHost, router]);

// // // //     // --- État de Chargement Initial ---
// // // //     if (!sessionInitialized || isAuthLoading) {
// // // //         return (
// // // //             <View style={styles.loadingContainer}>
// // // //                 <ActivityIndicator size="large" color="#0891b2" />
// // // //             </View>
// // // //         );
// // // //     }

// // // //     // --- Rendu des Onglets ---
// // // //     return (
// // // //         <Tabs screenOptions={{
// // // //             headerShown: false,
// // // //             tabBarStyle: { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f0f0f0', height: 60, paddingBottom: 5, paddingTop: 5 },
// // // //             tabBarActiveTintColor: '#0891b2',
// // // //             tabBarInactiveTintColor: '#64748b',
// // // //             tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 10 }
// // // //         }}>
// // // //             {/* Onglets Toujours Visibles */}
// // // //             <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }} />
// // // //             <Tabs.Screen name="search" options={{ title: 'Rechercher', tabBarIcon: ({ color, size }) => <Search size={size} color={color} /> }} />
// // // //             {/* <Tabs.Screen name="events/index" options={{ title: 'Événements', tabBarIcon: ({ color, size }) => <PartyPopper size={size} color={color} /> }} /> */}

// // // //             {/* Onglet Réservations : Visible si connecté. Pointe toujours vers bookings.tsx (qui gère la redirection interne pour les hôtes) */}
// // // //             <Tabs.Screen name="bookings" options={{ title: 'Réservations', tabBarIcon: ({ color, size }) => <BookMarked size={size} color={color} />, href: user ? undefined : null }} />

// // // //             {/* Onglets Messages et Profil : Visibles si connecté */}
// // // //             <Tabs.Screen name="conversations" options={{ title: 'Messages', tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />, href: user ? undefined : null }} />
// // // //             <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <User size={size} color={color} />, href: user ? undefined : null }} />

// // // //             {/* Onglet Devenir Hôte : Visible si non connecté OU connecté mais pas hôte */}
// // // //             <Tabs.Screen name="become-host" options={{ title: 'Devenir Hôte', tabBarIcon: ({ color, size }) => <BecomeHostIcon size={size} color={color} />, href: showBecomeHost ? undefined : null }} />

// // // //             {/* Onglet Espace Hôte : Visible seulement si connecté ET hôte */}
// // // //             <Tabs.Screen name="host" options={{ title: 'Espace Hôte', tabBarIcon: ({ color, size }) => <HostIcon size={size} color={color} />, href: (user && isHost) ? undefined : null }} />

// // // //             {/* Écrans non visibles dans la barre mais faisant partie du layout (si nécessaire) */}
// // // //             {/* Exemple: <Tabs.Screen name="host/booking-details/[id]" options={{ href: null }} /> */}

// // // //         </Tabs>
// // // //     );
// // // // }

// // // // const styles = StyleSheet.create({
// // // //     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }
// // // // });



// // // // Dans app/(tabs)/_layout.js
// // // // Gestion des onglets principaux et de la visibilité basée sur les rôles
// // // // VERSION FINALE : Logique des onglets affinée selon connexion et rôle, cible onglet hôte corrigée

// // // import React, { useState, useEffect, useRef, useMemo } from 'react';
// // // import { Tabs, useSegments, router } from 'expo-router';
// // // import { ActivityIndicator, View, StyleSheet } from 'react-native';
// // // import {
// // //     Home,
// // //     Search,
// // //     PartyPopper, // Assurez-vous d'avoir un écran events/index.tsx si vous utilisez cet onglet
// // //     User,
// // //     School as HostIcon,
// // //     Briefcase as BecomeHostIcon,
// // //     BookMarked, // Ajout pour l'onglet Réservations
// // //     MessageSquare // Ajout pour l'onglet Conversations
// // // } from 'lucide-react-native';
// // // import { useAuth } from '@/hooks/useAuth'; // Assurez-vous que le chemin est correct

// // // export default function TabLayout() {
// // //     // --- Compteur de rendu pour débogage ---
// // //     const renderCount = useRef(0);
// // //     renderCount.current += 1;
// // //     console.log("[TabLayout] Render count:", renderCount.current);

// // //     // --- Récupération user et état session ---
// // //     // Utilise directement les valeurs du hook useAuth
// // //     const { user, sessionInitialized, isLoading: isAuthLoading, userRoles } = useAuth();
// // //     const segments = useSegments();

// // //     // --- Conditions d'affichage basées sur les rôles (utilisant useMemo) ---
// // //     const isHost = useMemo(() =>
// // //         user && (userRoles || []).some(role => ['host', 'hostpro'].includes(role)),
// // //         [user, userRoles] // Recalculer seulement si user ou userRoles change
// // //     );
// // //     // Condition pour afficher "Devenir Hôte" : Non connecté OU connecté mais PAS hôte
// // //     const showBecomeHost = useMemo(() => !user || (user && !isHost), [user, isHost]);

// // //     // --- Protection de Route (Optionnelle mais recommandée) ---
// // //     // Empêche l'accès manuel via URL à des sections non autorisées
// // //     useEffect(() => {
// // //         // GUARD : Attendre que la session soit initialisée ET que l'auth ne soit plus en chargement
// // //         if (!sessionInitialized || isAuthLoading) {
// // //             console.log("[TabLayout Redirection Check] Waiting for session init or auth loading...");
// // //             return; // Ne rien faire tant que tout n'est pas prêt
// // //         }

// // //         // Vérifier si les segments sont valides (au moins 2 pour une route d'onglet)
// // //         if (!segments || segments.length < 2) {
// // //             console.log("[TabLayout Redirection Check] Invalid segments, skipping check.");
// // //             return;
// // //         }

// // //         const currentRouteBase = segments[1]; // Le nom de l'onglet/route actuel
// // //         console.log(`[TabLayout Effect - DEBUG] Route check. Current Base: ${currentRouteBase}, isHost: ${isHost}, User: ${!!user}`);

// // //         if (user) { // Si l'utilisateur est connecté
// // //             // Si sur route 'host' mais PAS hôte -> Accueil
// // //             if (currentRouteBase === 'host' && !isHost) {
// // //                 console.warn("[TabLayout] Redirecting: User is on 'host' route but is NOT a host.");
// // //                 router.replace('/');
// // //                 return;
// // //             }
// // //             // Si sur route 'become-host' mais DÉJÀ hôte -> Accueil
// // //             else if (currentRouteBase === 'become-host' && isHost) {
// // //                  console.warn("[TabLayout] Redirecting: User is on 'become-host' route but IS already a host.");
// // //                  router.replace('/'); // Ou rediriger vers '/host/(dashboard)' si préférable
// // //                  return;
// // //             }
// // //         } else { // Si l'utilisateur n'est pas connecté
// // //              // Rediriger vers login si tente d'accéder à une zone protégée
// // //              if (['profile', 'bookings', 'conversations', 'host'].includes(currentRouteBase)) {
// // //                  console.warn(`[TabLayout] Redirecting to login: Anonymous user accessing protected tab '${currentRouteBase}'`);
// // //                  router.replace('/auth/login'); // Assurez-vous que ce chemin est correct
// // //                  return;
// // //              }
// // //         }
// // //     }, [sessionInitialized, isAuthLoading, segments, user, isHost, router]);

// // //     // --- État de Chargement Initial ---
// // //     if (!sessionInitialized || isAuthLoading) {
// // //         return (
// // //             <View style={styles.loadingContainer}>
// // //                 <ActivityIndicator size="large" color="#0891b2" />
// // //             </View>
// // //         );
// // //     }

// // //     // --- Rendu des Onglets ---
// // //     return (
// // //         <Tabs screenOptions={{
// // //             headerShown: false,
// // //             tabBarStyle: {
// // //                 backgroundColor: '#ffffff',
// // //                 borderTopWidth: 1,
// // //                 borderTopColor: '#f0f0f0',
// // //                 height: 60,
// // //                 paddingBottom: 5,
// // //                 paddingTop: 5
// // //             },
// // //             tabBarActiveTintColor: '#0891b2',
// // //             tabBarInactiveTintColor: '#64748b',
// // //             tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 10 }
// // //         }}>
// // //             {/* Onglets Toujours Visibles */}
// // //             <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }} />
// // //             <Tabs.Screen name="search" options={{ title: 'Rechercher', tabBarIcon: ({ color, size }) => <Search size={size} color={color} /> }} />
// // //             {/* <Tabs.Screen name="events/index" options={{ title: 'Événements', tabBarIcon: ({ color, size }) => <PartyPopper size={size} color={color} /> }} /> */}

// // //              {/* Onglets Visibles si Connecté */}
// // //              <Tabs.Screen name="bookings" options={{ title: 'Réservations', tabBarIcon: ({ color, size }) => <BookMarked size={size} color={color} />, href: user ? undefined : null }} />
// // //              <Tabs.Screen name="conversations" options={{ title: 'Messages', tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />, href: user ? undefined : null }} />
// // //              <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <User size={size} color={color} />, href: user ? undefined : null }} />

// // //             {/* Onglets Conditionnels Rôles */}
// // //             <Tabs.Screen
// // //                 name="become-host"
// // //                 options={{
// // //                     title: 'Devenir Hôte',
// // //                     tabBarIcon: ({ color, size }) => <BecomeHostIcon size={size} color={color} />,
// // //                     href: showBecomeHost ? undefined : null // Visible si !isHost (ou non connecté)
// // //                 }}
// // //             />
// // //             <Tabs.Screen
// // //                 // *** CORRECTION DU NAME ICI ***
// // //                 // Pointe vers le layout ou l'index du groupe (dashboard) dans host
// // //                 // Assurez-vous que ce chemin correspond à votre structure, ex: si vous avez app/(tabs)/host/dashboard.tsx, mettez "host/dashboard"
// // //                 name="host/(dashboard)"
// // //                 options={{
// // //                     title: 'Espace Hôte',
// // //                     tabBarIcon: ({ color, size }) => <HostIcon size={size} color={color} />,
// // //                     href: (user && isHost) ? undefined : null // Visible seulement si user est host
// // //                 }}
// // //             />
// // //              {/* Écran pour masquer le dossier 'host' de base s'il existe mais n'est pas un onglet */}
// // //              <Tabs.Screen name="host" options={{ href: null }} />

// // //         </Tabs>
// // //     );
// // // }

// // // const styles = StyleSheet.create({
// // //     loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }
// // // });

// // ///home/project/app/(tabs)/_layout.tsx

// // import React, { useState, useEffect, useRef } from 'react';
// // import { Tabs, useSegments, router } from 'expo-router';
// // import { ActivityIndicator, View, StyleSheet } from 'react-native';
// // import {
// //     Chrome as Home, Search, PartyPopper, User,
// //     School as HostIcon,
// //     Briefcase as BecomeHostIcon,
// //     MessageCircle, // Ajout icône Messages
// //     Calendar as BookingsIcon // Ajout icône Réservations
// // } from 'lucide-react-native';
// // import { useAuth } from '@/hooks/useAuth';

// // export default function TabLayout() {
// //     // --- Compteur de rendu pour débogage ---
// //     const renderCount = useRef(0);
// //     renderCount.current += 1;
// //     console.log("[TabLayout] Render count:", renderCount.current);

// //     // --- Récupération user et état session ---
// //     const { user, sessionInitialized, isLoading: isAuthLoading, userRoles: contextUserRoles } = useAuth();

// //     // --- État local pour les rôles et leur chargement ---
// //     const [localUserRoles, setLocalUserRoles] = useState(contextUserRoles || []);
// //     const [isLoadingRoles, setIsLoadingRoles] = useState(true);
// //     const segments = useSegments();

// //     // --- Synchroniser les rôles du contexte vers l'état local ---
// //     useEffect(() => {
// //         if (JSON.stringify(contextUserRoles) !== JSON.stringify(localUserRoles)) {
// //             console.log("[TabLayout] Syncing roles from context:", contextUserRoles);
// //             setLocalUserRoles(contextUserRoles || []);
// //         }
        
// //         if (sessionInitialized && !isAuthLoading) {
// //             setIsLoadingRoles(false);
// //         }
// //     }, [contextUserRoles, localUserRoles, sessionInitialized, isAuthLoading]);

// //     // --- Conditions d'affichage basées sur les rôles LOCAUX ---
// //     const isHost = user && localUserRoles.some(role => ['host', 'hostpro'].includes(role));
// //     const isPotentialHost = user && localUserRoles.some(role => ['usernotverified', 'swimmer'].includes(role));
// //     const isVerified = user && !localUserRoles.includes('usernotverified');

// //     // --- Protection de Route ---
// //     useEffect(() => {
// //         // Log des valeurs pour le débogage
// //         console.log(`[TabLayout Redirection Check START] Segments: ${JSON.stringify(segments)}, User: ${!!user}, isLoadingRoles: ${isLoadingRoles}, isHost: ${isHost}, isPotentialHost: ${isPotentialHost}, sessionInitialized: ${sessionInitialized}`);

// //         // ⚠️ Ne pas traiter la navigation tant que tout n'est pas prêt
// //         if (!sessionInitialized || isLoadingRoles) {
// //             console.log("[TabLayout Redirection Check] Waiting for session init or roles loading...");
// //             return;
// //         }

// //         // Vérifier si les segments sont valides
// //         if (!segments || segments.length < 2) {
// //             console.log("[TabLayout Redirection Check] Invalid segments, skipping check.");
// //             return;
// //         }

// //         const currentRouteBase = segments[1];
        
// //         // ⚠️ AJOUT CRUCIAL: Toujours autoriser profile si l'utilisateur est connecté
// //         if (currentRouteBase === 'profile' && user) {
// //             console.log("[TabLayout] Profile route with authenticated user, always allow access.");
// //             return; // Sortir immédiatement
// //         }

// //         console.log(`[TabLayout Effect - DEBUG] Route détectée => currentRouteBase: ${currentRouteBase}, Segments complets: ${JSON.stringify(segments)}`);
        
// //         if (user) {
// //             console.log(`[TabLayout Redirection Check] User logged in. Current Route Base: ${currentRouteBase}`);
            
// //             // Protection des routes spécifiques
// //             if (currentRouteBase === 'host' && !isHost) {
// //                 console.warn("[TabLayout] Redirecting: User is on 'host' route but is NOT a host.");
// //                 router.replace('/');
// //                 return;
// //             }
// //             else if (currentRouteBase === 'become-host' && !isPotentialHost && !isHost) {
// //                 console.warn("[TabLayout] Redirecting: User is on 'become-host' route but is NOT eligible.");
// //                 router.replace('/');
// //                 return;
// //             }
// //             // Redirection pour les hôtes depuis l'onglet bookings vers host/bookings
// //             else if (currentRouteBase === 'bookings' && isHost) {
// //                 console.warn("[TabLayout] Redirecting: User is a host on 'bookings' route, sending to host bookings.");
// //                 router.replace('/(tabs)/host/(dashboard)/bookings');
// //                 return;
// //             }
// //             else {
// //                 console.log("[TabLayout Redirection Check] No redirection needed based on roles for this route.");
// //             }
// //         } else {
// //             console.log("[TabLayout Redirection Check] User not logged in, no role-based redirection needed here.");
// //         }

// //         console.log("[TabLayout Redirection Check END]");
// //     }, [segments, user, isLoadingRoles, isHost, isPotentialHost, sessionInitialized, localUserRoles]);

// //     // --- État de Chargement Initial ---
// //     if (!sessionInitialized || (user && isLoadingRoles)) {
// //         return (
// //             <View style={styles.loadingContainer}>
// //                 <ActivityIndicator size="large" color="#0891b2" />
// //             </View>
// //         );
// //     }

// //     // --- Rendu des Onglets ---
// //     return (
// //         <Tabs screenOptions={{
// //             headerShown: false,
// //             tabBarStyle: { 
// //                 backgroundColor: '#ffffff', 
// //                 borderTopWidth: 1, 
// //                 borderTopColor: '#f0f0f0',
// //                 height: 60,
// //                 paddingBottom: 5, 
// //                 paddingTop: 5
// //             },
// //             tabBarActiveTintColor: '#0891b2',
// //             tabBarInactiveTintColor: '#64748b',
// //             tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 10 }
// //         }}>
// //             {/* Onglets toujours visibles */}
// //             <Tabs.Screen name="index" options={{ 
// //                 title: 'Accueil', 
// //                 tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> 
// //             }} />
            
// //             <Tabs.Screen name="search" options={{ 
// //                 title: 'Rechercher', 
// //                 tabBarIcon: ({ color, size }) => <Search size={size} color={color} /> 
// //             }} />
            
// //             <Tabs.Screen name="events/index" options={{ 
// //                 title: 'Événements', 
// //                 tabBarIcon: ({ color, size }) => <PartyPopper size={size} color={color} /> 
// //             }} />
            
// //             {/* Onglet Réservations (visible seulement si connecté) */}
// //             <Tabs.Screen name="bookings" options={{ 
// //                 title: 'Réservations', 
// //                 tabBarIcon: ({ color, size }) => <BookingsIcon size={size} color={color} />,
// //                 href: (user) ? undefined : null // Affiché uniquement si connecté
// //             }} />
            
// //             {/* Onglet Messages (visible seulement si connecté) */}
// //             <Tabs.Screen name="messages" options={{ 
// //                 title: 'Messages', 
// //                 tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
// //                 href: (user) ? undefined : null // Affiché uniquement si connecté
// //             }} />
            
// //             {/* Onglets conditionnels, toujours présents mais visibilité gérée par options.href */}
// //             <Tabs.Screen name="become-host" options={{ 
// //                 title: 'Devenir Hôte', 
// //                 tabBarIcon: ({ color, size }) => <BecomeHostIcon size={size} color={color} />,
// //                 href: (!isLoadingRoles && ((user && isPotentialHost && !isHost) || !user)) ? undefined : null
// //                 // Affiché si utilisateur non-connecté OU swimmer connecté mais pas hôte
// //             }} />
            
// //             <Tabs.Screen name="host" options={{ 
// //                 title: 'Espace Hôte', 
// //                 tabBarIcon: ({ color, size }) => <HostIcon size={size} color={color} />,
// //                 href: (!isLoadingRoles && user && isHost) ? undefined : null
// //                 // Affiché uniquement si connecté ET hôte
// //             }} />
            
// //             <Tabs.Screen name="profile" options={{ 
// //                 title: 'Profil', 
// //                 tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
// //                 href: user ? undefined : null
// //                 // Affiché uniquement si connecté
// //             }} />
// //         </Tabs>
// //     );
// // }

// // // Style simple pour le chargement
// // const styles = StyleSheet.create({
// //     loadingContainer: {
// //         flex: 1,
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         backgroundColor: '#ffffff'
// //     }
// // });

// // app/(tabs)/_layout.tsx
// import React, { useState, useEffect, useRef } from 'react';
// import { Tabs, useSegments, router } from 'expo-router';
// import { ActivityIndicator, View, StyleSheet } from 'react-native';
// import {
//     Chrome as Home, Search, PartyPopper, User,
//     School as HostIcon,
//     Briefcase as BecomeHostIcon,
//     MessageCircle,
//     Calendar as BookingsIcon
// } from 'lucide-react-native';
// import { useAuth } from '@/hooks/useAuth';

// export default function TabLayout() {
//     const { user, sessionInitialized, isLoading: isAuthLoading, userRoles: contextUserRoles } = useAuth();
//     const segments = useSegments();

//     // État pour tracking des redirections
//     const [redirectInProgress, setRedirectInProgress] = useState(false);
//     const previousRouteRef = useRef<string | null>(null);
//     const previousRolesRef = useRef<string[]>([]);

//     // Conditions d'affichage basées directement sur contextUserRoles
//     const isHost = user && contextUserRoles.some(role => ['host', 'hostpro'].includes(role));
//     const isPotentialHost = user && contextUserRoles.some(role => ['usernotverified', 'swimmer'].includes(role));
//     const isVerified = user && !contextUserRoles.includes('usernotverified');

//     // Sauvegarder les rôles précédents pour comparaison
//     useEffect(() => {
//         if (JSON.stringify(previousRolesRef.current) !== JSON.stringify(contextUserRoles)) {
//             console.log(`[TabLayout] Roles changed: ${previousRolesRef.current.join(', ')} -> ${contextUserRoles.join(', ')}`);
//             previousRolesRef.current = contextUserRoles;
//         }
//     }, [contextUserRoles]);

//     // Protection de Route
//     useEffect(() => {
//         // Ne pas traiter si les données ne sont pas prêtes
//         if (!sessionInitialized || isAuthLoading || redirectInProgress) {
//             return;
//         }

//         // Vérifier si les segments sont valides - minimum 2 segments pour les tabs
//         if (!segments || segments.length < 2) {
//             return;
//         }

//         const currentRouteBase = segments[1];
//         const currentFullRoute = segments.join('/');
        
//         // Vérifier si nous sommes sur la même route
//         if (previousRouteRef.current === currentFullRoute) {
//             return;
//         }
        
//         previousRouteRef.current = currentFullRoute;
        
//         // Toujours autoriser profile si l'utilisateur est connecté
//         if (currentRouteBase === 'profile' && user) {
//             return;
//         }
        
//         if (user) {
//             let shouldRedirect = false;
//             let redirectTo = '';
            
//             // Protection des routes spécifiques
//             if (currentRouteBase === 'host' && !isHost) {
//                 shouldRedirect = true;
//                 redirectTo = '/(tabs)/';
//             }
//             else if (currentRouteBase === 'become-host' && !isPotentialHost && !isHost) {
//                 shouldRedirect = true;
//                 redirectTo = '/(tabs)/';
//             }
//             else if (currentRouteBase === 'bookings' && isHost) {
//                 const isAlreadyOnHostBookings = segments.length >= 3 && segments[2] === 'host';
//                 if (!isAlreadyOnHostBookings) {
//                     shouldRedirect = true;
//                     redirectTo = '/(tabs)/host/(dashboard)/bookings';
//                 }
//             }
            
//             if (shouldRedirect && redirectTo) {
//                 setRedirectInProgress(true);
//                 console.log(`[TabLayout] Redirecting to ${redirectTo}`);
                
//                 // Utiliser un timeout pour éviter les problèmes de navigation immédiate
//                 setTimeout(() => {
//                     router.replace(redirectTo);
//                     // Réinitialiser le flag après un délai
//                     setTimeout(() => {
//                         setRedirectInProgress(false);
//                     }, 500);
//                 }, 100);
//             }
//         }
//     }, [segments, user, isAuthLoading, isHost, isPotentialHost, sessionInitialized, redirectInProgress]);

//     // État de Chargement Initial
//     if (!sessionInitialized || isAuthLoading) {
//         return (
//             <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color="#0891b2" />
//             </View>
//         );
//     }

//     // Rendu des Onglets
//     return (
//         <Tabs screenOptions={{
//             headerShown: false,
//             tabBarStyle: { 
//                 backgroundColor: '#ffffff', 
//                 borderTopWidth: 1, 
//                 borderTopColor: '#f0f0f0',
//                 height: 60,
//                 paddingBottom: 5, 
//                 paddingTop: 5
//             },
//             tabBarActiveTintColor: '#0891b2',
//             tabBarInactiveTintColor: '#64748b',
//             tabBarLabelStyle: { fontFamily: 'Montserrat-SemiBold', fontSize: 10 }
//         }}>
//             {/* Onglets toujours visibles */}
//             <Tabs.Screen name="index" options={{ 
//                 title: 'Accueil', 
//                 tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> 
//             }} />
            
//             <Tabs.Screen name="search" options={{ 
//                 title: 'Rechercher', 
//                 tabBarIcon: ({ color, size }) => <Search size={size} color={color} /> 
//             }} />
            
//             <Tabs.Screen name="events/index" options={{ 
//                 title: 'Événements', 
//                 tabBarIcon: ({ color, size }) => <PartyPopper size={size} color={color} /> 
//             }} />
            
//             {/* Onglet Réservations */}
//             <Tabs.Screen name="bookings" options={{ 
//                 title: 'Réservations', 
//                 tabBarIcon: ({ color, size }) => <BookingsIcon size={size} color={color} />,
//                 href: user ? undefined : null
//             }} />
            
//             {/* Onglet Conversations */}
//             <Tabs.Screen name="conversations" options={{ 
//                 title: 'Messages', 
//                 tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} />,
//                 href: user ? undefined : null
//             }} />
            
//             {/* Onglet Devenir Hôte */}
//             <Tabs.Screen name="become-host" options={{ 
//                 title: 'Devenir Hôte', 
//                 tabBarIcon: ({ color, size }) => <BecomeHostIcon size={size} color={color} />,
//                 href: (user && isPotentialHost && !isHost) || !user ? undefined : null
//             }} />
            
//             {/* Onglet Espace Hôte */}
//             <Tabs.Screen name="host" options={{ 
//                 title: 'Espace Hôte', 
//                 tabBarIcon: ({ color, size }) => <HostIcon size={size} color={color} />,
//                 href: (user && isHost) ? undefined : null
//             }} />
            
//             {/* Onglet Profil */}
//             <Tabs.Screen name="profile" options={{ 
//                 title: 'Profil', 
//                 tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
//                 href: user ? undefined : null
//             }} />
//         </Tabs>
//     );
// }

// const styles = StyleSheet.create({
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#ffffff'
//     }
// });


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