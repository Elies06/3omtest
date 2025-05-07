// import { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import { LogOut, Trash } from 'lucide-react-native';
// import { useAdmin } from '@/hooks/useAdmin';
// import { useAuth } from '@/hooks/useAuth';
// import { supabase } from '@/lib/supabase'; // Assure-toi que le fichier d'initialisation de Supabase est bien importé
// import Animated, { FadeIn } from 'react-native-reanimated';

// export default function UsersScreen() {
//   const { user } = useAuth();
//   const { hasRole, loading: adminLoading, error: adminError } = useAdmin();
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [fontsLoaded] = useFonts({
//     'Montserrat-Bold': Montserrat_700Bold,
//     'Montserrat-SemiBold': Montserrat_600SemiBold,
//     'Montserrat-Regular': Montserrat_400Regular,
//   });

//   // Vérifie si l'utilisateur est admin
//   useEffect(() => {
//     if (!adminLoading && !hasRole('admin')) {
//       setError("Vous n'avez pas les permissions pour voir cette page.");
//     }
//   }, [adminLoading, hasRole]);

//   // Charge la liste des utilisateurs
//   useEffect(() => {
//     async function fetchUsers() {
//       try {
//         const { data, error } = await supabase
//           .from('profiles') // Table où sont stockées les infos des utilisateurs
//           .select('id, name, email, user_roles (role_id, roles(name))')
//           .order('created_at', { ascending: false });

//         if (error) throw error;
//         setUsers(data);
//       } catch (err) {
//         setError("Erreur lors du chargement des utilisateurs.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchUsers();
//   }, []);

//   // Supprimer un utilisateur
//   async function deleteUser(userId) {
//     const { error } = await supabase.from('profiles').delete().eq('id', userId);
//     if (error) {
//       alert("Erreur lors de la suppression de l'utilisateur.");
//     } else {
//       setUsers(users.filter((u) => u.id !== userId));
//     }
//   }

//   if (!fontsLoaded) return null;

//   if (adminLoading || loading) {
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" color="#1e293b" />
//       </View>
//     );
//   }

//   if (adminError || error) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.errorText}>{adminError || error}</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Gestion des utilisateurs</Text>
//       <FlatList
//         data={users}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <Animated.View style={styles.userCard} entering={FadeIn}>
//             <View>
//               <Text style={styles.userName}>{item.name}</Text>
//               <Text style={styles.userEmail}>{item.email}</Text>
//               <Text style={styles.userRole}>{item.user_roles?.[0]?.roles?.name || 'Aucun rôle'}</Text>
//             </View>
//             <TouchableOpacity onPress={() => deleteUser(item.id)} style={styles.deleteButton}>
//               <Trash size={20} color="white" />
//             </TouchableOpacity>
//           </Animated.View>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#ffffff',
//   },
//   title: {
//     fontFamily: 'Montserrat-Bold',
//     fontSize: 24,
//     color: '#1e293b',
//     marginBottom: 16,
//   },
//   userCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#f8fafc',
//     padding: 16,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   userName: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 18,
//     color: '#1e293b',
//   },
//   userEmail: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#64748b',
//   },
//   userRole: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#059669',
//   },
//   deleteButton: {
//     backgroundColor: '#dc2626',
//     padding: 10,
//     borderRadius: 6,
//   },
//   errorText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#dc2626',
//     textAlign: 'center',
//     marginTop: 20,
//   },
// });


// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import { useRouter } from 'expo-router';
// import { supabase } from '@/lib/supabase';

// interface User {
//   id: string;
//   email: string;
//   profiles: {
//     first_name: string;
//     last_name: string;
//   };
//   user_roles: {
//     role: string;
//   }[];
// }

// export default function Users() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [fontsLoaded] = useFonts({
//     'Montserrat-Bold': Montserrat_700Bold,
//     'Montserrat-SemiBold': Montserrat_600SemiBold,
//     'Montserrat-Regular': Montserrat_400Regular,
//   });
//   const router = useRouter();

//   useEffect(() => {
//     async function fetchUsers() {
//       try {
//         const { data, error } = await supabase
//           .from('users')
//           .select(`
//             id, email,
//             profiles (first_name, last_name),
//             user_roles (role)
//           `);

//         if (error) {
//           console.error('Error fetching users:', error);
//         } else {
//           setUsers(data as User[]);
//         }
//       } catch (err) {
//         console.error('Unexpected error fetching users:', err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchUsers();
//   }, []);

//   if (!fontsLoaded) {
//     return null;
//   }

//   if (loading) {
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" color="#1e293b" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={users}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity style={styles.userItem} onPress={() => router.push(`/admin/users/${item.id}`)}>
//             <Text style={styles.email}>{item.email}</Text>
//             <Text style={styles.name}>{item.profiles?.first_name} {item.profiles?.last_name}</Text>
//             <Text style={styles.role}>{item.user_roles?.[0]?.role}</Text>
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#ffffff',
//   },
//   userItem: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e5e7eb',
//   },
//   email: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#374151',
//   },
//   name: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   role: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#6b7280',
//     marginTop: 5,
//   },
// });


// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import { useRouter } from 'expo-router';
// import { supabase } from '@/lib/supabase';
// import { useAdmin } from '@/hooks/useAdmin';

// interface User {
//   id: string;
//   email: string;
//   profiles: {
//     first_name: string;
//     last_name: string;
//   };
//   user_roles: {
//     role: string;
//   }[];
// }

// export default function Users() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [fontsLoaded] = useFonts({
//     'Montserrat-Bold': Montserrat_700Bold,
//     'Montserrat-SemiBold': Montserrat_600SemiBold,
//     'Montserrat-Regular': Montserrat_400Regular,
//   });
//   const router = useRouter();
//   const { hasPermission } = useAdmin();

//   const fetchUsers = useCallback(async () => {
//     try {
//       const { data, error } = await supabase
//         .from('users')
//         .select(`
//           id, 
//           email,
//           profiles (first_name, last_name),
//           user_roles (role)
//         `)
//         .order('created_at', { ascending: false });

//       if (error) throw error;
      
//       setUsers(data as User[]);
//     } catch (err) {
//       console.error('Error fetching users:', err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (hasPermission('manage_users')) {
//       fetchUsers();
//     } else {
//       router.replace('/admin');
//     }
//   }, [fetchUsers, hasPermission]);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchUsers();
//   }, [fetchUsers]);

//   const renderItem = useCallback(({ item }: { item: User }) => (
//     <TouchableOpacity 
//       style={styles.userItem} 
//       onPress={() => router.push(`/admin/users/${item.id}`)}
//       activeOpacity={0.7}
//     >
//       <View style={styles.userInfo}>
//         <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">
//           {item.email}
//         </Text>
//         <Text style={styles.name}>
//           {item.profiles?.first_name} {item.profiles?.last_name}
//         </Text>
//       </View>
//       <View style={styles.roleBadge}>
//         <Text style={styles.roleText}>
//           {item.user_roles?.[0]?.role || 'Aucun rôle'}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   ), []);

//   const keyExtractor = useCallback((item: User) => item.id, []);

//   if (!fontsLoaded || loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#3b82f6" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={users}
//         keyExtractor={keyExtractor}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#3b82f6']}
//             tintColor="#3b82f6"
//           />
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
//           </View>
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9fafb',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   listContent: {
//     padding: 16,
//   },
//   userItem: {
//     backgroundColor: '#ffffff',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     elevation: 1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//   },
//   userInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   email: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#1f2937',
//     marginBottom: 4,
//   },
//   name: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   roleBadge: {
//     backgroundColor: '#e0f2fe',
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//   },
//   roleText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 12,
//     color: '#0369a1',
//     textTransform: 'capitalize',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   emptyText: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 16,
//     color: '#9ca3af',
//   },
// });

// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import { useRouter } from 'expo-router';
// import { supabase } from '@/lib/supabase';

// interface User {
//   id: string;
//   email: string;
//   profiles: {
//     full_name: string;
//     avatar_url: string;
//     city: string;
//   };
//   user_roles: {
//     role_id: string;
//     roles: {
//       name: string;
//       description: string;
//     };
//     created_at: string;
//   }[];
// }

// export default function Users() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [fontsLoaded] = useFonts({
//     'Montserrat-Bold': Montserrat_700Bold,
//     'Montserrat-SemiBold': Montserrat_600SemiBold,
//     'Montserrat-Regular': Montserrat_400Regular,
//   });
//   const router = useRouter();

//   const fetchUsers = useCallback(async () => {
//     try {
//       const { data, error } = await supabase
//         .from('users')
//         .select(`
//           id, 
//           email,
//           created_at,
//           profiles (
//             full_name,
//             avatar_url,
//             city
//           ),
//           user_roles (
//             role_id,
//             roles (
//               name,
//               description
//             ),
//             created_at
//           )
//         `)
//         .order('created_at', { ascending: false });

//       if (error || !data) {
//         throw error || new Error('Aucune donnée trouvée');
//       }
//       setUsers(data as User[]);
//     } catch (err) {
//       console.error('Error fetching users:', err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     setTimeout(() => {
//       fetchUsers();
//     }, 1000); // 1 seconde de délai
//   }, [fetchUsers]);

//   const renderItem = useCallback(({ item }: { item: User }) => (
//     <TouchableOpacity
//       style={styles.userItem}
//       onPress={() => router.push(`/admin/users/${item.id}`)}
//       activeOpacity={0.7}
//     >
//       <View style={styles.userInfo}>
//         <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">
//           {item.email}
//         </Text>
//         <Text style={styles.name}>
//           {item.profiles?.full_name || 'Nom non renseigné'}
//         </Text>
//       </View>
//       <View style={styles.roleBadge}>
//         <Text style={styles.roleText}>
//           {item.user_roles?.[0]?.roles?.name || 'Aucun rôle'}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   ), [router]);

//   const keyExtractor = useCallback((item: User) => item.id, []);

//   if (!fontsLoaded || loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#3b82f6" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={users}
//         keyExtractor={keyExtractor}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#3b82f6']}
//             tintColor="#3b82f6"
//           />
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
//           </View>
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9fafb',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   listContent: {
//     padding: 16,
//   },
//   userItem: {
//     backgroundColor: '#ffffff',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     elevation: 1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//   },
//   userInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   email: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#1f2937',
//     marginBottom: 4,
//   },
//   name: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   roleBadge: {
//     backgroundColor: '#e0f2fe',
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//   },
//   roleText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 12,
//     color: '#0369a1',
//     textTransform: 'capitalize',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   emptyText: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 16,
//     color: '#9ca3af',
//   },
// });


// Fichier : project/app/admin/users.tsx (Corrigé)

// Fichier : project/app/admin/users.tsx (Correction 2)

// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import { useRouter } from 'expo-router';
// import { supabase } from '@/lib/supabase';

// // Interface mise à jour : profiles est un objet unique OU null
// interface UserProfile {
//   full_name: string | null;
//   avatar_url: string | null;
//   city: string | null;
// }

// // ... (Interfaces UserRole et UserRoleLink restent les mêmes) ...
// interface UserRole {
//   name: string | null;
//   description: string | null;
// }

// interface UserRoleLink {
//   role_id: string;
//   roles: UserRole | null;
//   created_at: string;
// }

// // Interface principale mise à jour
// interface User {
//   id: string;
//   email: string | null;
//   created_at: string;
//   profiles: UserProfile | null; // Le profil peut être null si la jointure échoue (même si peu probable)
//   user_roles: UserRoleLink[];
// }


// export default function Users() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [fontsLoaded] = useFonts({
//     'Montserrat-Bold': Montserrat_700Bold,
//     'Montserrat-SemiBold': Montserrat_600SemiBold,
//     'Montserrat-Regular': Montserrat_400Regular,
//   });
//   const router = useRouter();

//   const fetchUsers = useCallback(async () => {
//     try {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('users') // Toujours commencer par 'users'
//         .select(`
//           id,
//           email,
//           created_at,
//           profiles ( 
//             full_name,
//             avatar_url,
//             city
//           ),
//           user_roles (
//             role_id,
//             roles (
//               name,
//               description
//             ),
//             created_at
//           )
//         `)
//         .order('created_at', { ascending: false });

//       if (error) {
//         console.error('Supabase fetch users error:', error);
//         throw error;
//       }
//       if (!data) {
//         throw new Error('Aucune donnée trouvée');
//       }

//       // Le type User devrait correspondre maintenant
//       setUsers(data);

//     } catch (err: any) {
//       console.error('Error fetching users:', err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchUsers();
//   }, [fetchUsers]);

//   // L'accès item.profiles?.full_name est maintenant correct
//   const renderItem = useCallback(({ item }: { item: User }) => (
//     <TouchableOpacity
//       style={styles.userItem}
//       onPress={() => router.push(`/admin/users/${item.id}`)}
//       activeOpacity={0.7}
//     >
//       <View style={styles.userInfo}>
//         <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">
//           {item.email || 'Email non disponible'}
//         </Text>
//         <Text style={styles.name}>
//           {/* Utiliser l'optional chaining car profiles peut être null */}
//           {item.profiles?.full_name || 'Nom non renseigné'}
//         </Text>
//       </View>
//       <View style={styles.roleBadge}>
//         <Text style={styles.roleText}>
//           {item.user_roles?.[0]?.roles?.name || 'Aucun rôle'}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   ), [router]);

//   // ... (keyExtractor, return, et styles restent les mêmes) ...
//   const keyExtractor = useCallback((item: User) => item.id, []);

//   if (!fontsLoaded || (loading && users.length === 0)) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#3b82f6" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={users}
//         keyExtractor={keyExtractor}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#3b82f6']}
//             tintColor="#3b82f6"
//           />
//         }
//         ListEmptyComponent={
//           !loading && (
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
//             </View>
//           )
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f9fafb',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   listContent: {
//     padding: 16,
//   },
//   userItem: {
//     backgroundColor: '#ffffff',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     elevation: 1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//   },
//   userInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   email: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#1f2937',
//     marginBottom: 4,
//   },
//   name: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   roleBadge: {
//     backgroundColor: '#e0f2fe',
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//   },
//   roleText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 12,
//     color: '#0369a1',
//     textTransform: 'capitalize',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     marginTop: 50,
//   },
//   emptyText: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 16,
//     color: '#9ca3af',
//   },
// }); la liste est vide



// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native'; // Ajout de Alert
// import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
// import { useRouter } from 'expo-router';
// import { supabase } from '@/lib/supabase';

// // Interfaces (Assurez-vous qu'elles correspondent bien à ce que vous voulez afficher)
// interface UserProfile {
//   full_name: string | null;
//   avatar_url: string | null;
//   city: string | null;
// }

// interface UserRole {
//   id: string; // Ajout de l'ID si la fonction RPC le renvoie
//   name: string | null;
//   description: string | null;
// }

// // Ajustement basé sur le JSONB retourné par la fonction RPC
// interface UserRoleDataFromRPC {
//     id: string;
//     name: string | null;
//     description: string | null;
// }

// // Interface principale qui correspond à ce que le composant utilise
// interface DisplayUser {
//   id: string;
//   email: string | null;
//   created_at: string;
//   // Ces champs sont maintenant remplis par le mappage
//   full_name: string | null;
//   avatar_url: string | null;
//   city: string | null;
//   role_name: string | null; // Simplifié pour afficher le premier rôle
// }


// export default function Users() {
//   // Utiliser la nouvelle interface DisplayUser pour l'état
//   const [users, setUsers] = useState<DisplayUser[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState<string | null>(null); // Pour afficher les erreurs
//   const [fontsLoaded] = useFonts({
//     'Montserrat-Bold': Montserrat_700Bold,
//     'Montserrat-SemiBold': Montserrat_600SemiBold,
//     'Montserrat-Regular': Montserrat_400Regular,
//   });
//   const router = useRouter();

//   const fetchUsers = useCallback(async () => {
//     setError(null); // Réinitialiser l'erreur
//     setLoading(true); // Mettre en chargement au début
//     try {
//       console.log("Appel RPC: admin_get_users");
//       // === MODIFICATION ICI ===
//       // Appel de la fonction PostgreSQL via rpc()
//       // Assurez-vous que le nom 'admin_get_users' est correct
//       const { data: rpcData, error: rpcError } = await supabase.rpc('admin_get_users');
//       // ========================

//       if (rpcError) {
//         console.error('Supabase fetch users via RPC error:', rpcError);
//         // Gérer spécifiquement l'erreur d'autorisation
//         if (rpcError.message.includes('Not authorized')) {
//            setError('Accès refusé : Seuls les admins peuvent voir cette page.');
//            setUsers([]); // Vider la liste
//         } else {
//            setError(`Erreur Supabase: ${rpcError.message}`);
//            setUsers([]);
//         }
//         return; // Sortir si erreur
//       }
//       if (!rpcData) {
//         console.warn('Aucune donnée retournée par la fonction admin_get_users');
//         setUsers([]); // Vider si pas de données
//         return;
//       }

//       console.log("Données brutes RPC reçues:", rpcData.length, "utilisateurs");

//       // Mapper les données RPC à l'interface DisplayUser attendue par le composant
//       const formattedUsers: DisplayUser[] = rpcData.map((user: any) => {
//         // Safely parse roles if it's a string, otherwise assume it's already an array/object
//         let parsedRoles: UserRoleDataFromRPC[] = [];
//         if (typeof user.roles === 'string') {
//             try {
//                 parsedRoles = JSON.parse(user.roles);
//             } catch (e) {
//                 console.error(`Failed to parse roles JSON for user ${user.id}:`, user.roles);
//             }
//         } else if (Array.isArray(user.roles)) {
//             parsedRoles = user.roles;
//         }

//         return {
//           id: user.id,
//           email: user.email,
//           created_at: user.created_at,
//           // Accès directs aux propriétés retournées par la fonction RPC
//           full_name: user.full_name,
//           avatar_url: user.avatar_url,
//           city: user.city,
//           // Prendre le nom du premier rôle (simplification pour l'affichage)
//           role_name: parsedRoles?.[0]?.name || 'Aucun rôle',
//         };
//       });

//       console.log("Données formatées:", formattedUsers.length, "utilisateurs");
//       setUsers(formattedUsers);

//     } catch (err: any) {
//       console.error('Error fetching users:', err);
//       setError(err.message || 'Une erreur inattendue est survenue.');
//       setUsers([]); // Vider en cas d'erreur
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchUsers();
//   }, [fetchUsers]);

//   // Adapter renderItem à la nouvelle interface DisplayUser
//   const renderItem = useCallback(({ item }: { item: DisplayUser }) => (
//     <TouchableOpacity
//       style={styles.userItem}
//       onPress={() => router.push(`/admin/users/${item.id}`)} // Assurez-vous que cette route existe
//       activeOpacity={0.7}
//     >
//       <View style={styles.userInfo}>
//         <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">
//           {item.email || 'Email non disponible'}
//         </Text>
//         <Text style={styles.name}>
//           {item.full_name || 'Nom non renseigné'}
//         </Text>
//       </View>
//       <View style={styles.roleBadge}>
//         <Text style={styles.roleText}>
//           {item.role_name} {/* Utilisation directe de role_name */}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   ), [router]);

//   const keyExtractor = useCallback((item: DisplayUser) => item.id, []);

//   // Affichage pendant le chargement des polices ou des données initiales
//   if (!fontsLoaded || (loading && users.length === 0 && !error)) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#3b82f6" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Afficher l'erreur si elle existe */}
//       {error && (
//         <View style={styles.errorContainer}>
//             <Text style={styles.errorText}>{error}</Text>
//         </View>
//        )}
//       <FlatList
//         data={users}
//         keyExtractor={keyExtractor}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#3b82f6']}
//             tintColor="#3b82f6"
//           />
//         }
//         ListEmptyComponent={
//           !loading && !error && ( // N'afficher que si pas en chargement et pas d'erreur
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
//             </View>
//           )
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   // ... (vos styles existants) ...
//   errorContainer: { // Style pour le message d'erreur
//       backgroundColor: '#fee2e2',
//       padding: 10,
//       margin: 16,
//       borderRadius: 8,
//       alignItems: 'center',
//   },
//   errorText: {
//       color: '#b91c1c',
//       fontFamily: 'Montserrat-SemiBold',
//       fontSize: 14,
//   },
//   // ... (le reste de vos styles) ...
//   container: {
//     flex: 1,
//     backgroundColor: '#f9fafb',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   listContent: {
//     padding: 16,
//   },
//   userItem: {
//     backgroundColor: '#ffffff',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     elevation: 1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//   },
//   userInfo: {
//     flex: 1,
//     marginRight: 12,
//   },
//   email: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 16,
//     color: '#1f2937',
//     marginBottom: 4,
//   },
//   name: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   roleBadge: {
//     backgroundColor: '#e0f2fe',
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//   },
//   roleText: {
//     fontFamily: 'Montserrat-SemiBold',
//     fontSize: 12,
//     color: '#0369a1',
//     textTransform: 'capitalize',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     marginTop: 50,
//   },
//   emptyText: {
//     fontFamily: 'Montserrat-Regular',
//     fontSize: 16,
//     color: '#9ca3af',
//   },
// });
// Dans app/admin/users.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
    SafeAreaView, RefreshControl, Platform, TextInput, ScrollView // Assurez-vous que ScrollView est importé
} from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '@/lib/supabase'; // Vérifiez chemin
import { useAuth } from '@/hooks/useAuth'; // Vérifiez chemin
import { useFonts, Montserrat_700Bold, Montserrat_600SemiBold, Montserrat_400Regular } from '@expo-google-fonts/montserrat';
import { ChevronLeft, ChevronRight, RefreshCcw, Search as SearchIcon, X as XIcon } from 'lucide-react-native';
import { useDebounce } from '@/hooks/useDebounce'; // Vérifiez chemin

// Interface pour les Rôles (pour les onglets)
interface RoleTabInfo {
    key: string;
    label: string;
}

// Interface Utilisateur Affiché
interface DisplayUser {
    id: string; email: string | null; full_name: string | null; avatar_url: string | null; city: string | null; created_at: string;
    roles: { id: string; name: string; }[] | null;
    role_name?: string; // Premier rôle pour affichage simple
    total_records?: number;
}

const PAGE_SIZE = 20;

export default function AdminUsersScreen() {
    const { user: adminUser } = useAuth();
    const [users, setUsers] = useState<DisplayUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);

    // États Onglets/Filtres
    const [roleTabsData, setRoleTabsData] = useState<RoleTabInfo[]>([]);
    const [loadingTabs, setLoadingTabs] = useState(true);
    const [tabsError, setTabsError] = useState<string | null>(null);
    const [activeTabKey, setActiveTabKey] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [fontsLoaded, fontError] = useFonts({
        'Montserrat-Bold': Montserrat_700Bold,
        'Montserrat-SemiBold': Montserrat_600SemiBold,
        'Montserrat-Regular': Montserrat_400Regular,
    });

    // Fetch des Rôles pour les Onglets
    const fetchRoleTabs = useCallback(async () => {
        setLoadingTabs(true); setTabsError(null); console.log("🚀 Fetching roles for tabs...");
        try {
            const { data, error } = await supabase.from('roles').select('name').order('name');
            if (error) throw error;
            const tabs = data?.map(role => ({ key: role.name, label: role.name.charAt(0).toUpperCase() + role.name.slice(1) })) || [];
            console.log(`✅ Loaded ${tabs.length} roles for tabs.`); setRoleTabsData(tabs);
        } catch (err: any) { console.error("Error fetching role tabs:", err); setTabsError("Erreur chargement des rôles."); }
        finally { setLoadingTabs(false); }
    }, []);

    // Fetch des Utilisateurs via RPC
    const fetchUsers = useCallback(async (pageNum: number, tabKey: string, currentSearch: string, isRefresh = false) => {
        if (!adminUser) { setError("Accès admin requis."); setLoading(false); return; }
        if (!isRefresh) setLoadingMore(pageNum > 0);
        if (pageNum === 0 && !isRefresh) setLoading(true);
        setError(null);
        const rpcParams = { p_role_name: tabKey === 'all' ? null : tabKey, p_search_text: currentSearch || '', p_page: pageNum, p_page_size: PAGE_SIZE };
        try {
            console.log(`🚀 Calling RPC admin_get_users with params:`, rpcParams);
            const { data, error: rpcError } = await supabase.rpc('admin_get_users', rpcParams);
            if (rpcError) throw rpcError;
            const results = data as DisplayUser[] || [];
            const count = results.length > 0 ? results[0].total_records ?? 0 : 0;
            console.log(`✅ RPC users page ${pageNum} (Tab: ${tabKey}, Search: "${currentSearch}"): Found ${results.length}. Total: ${count}`);
            setError(null);
            const formattedUsers = results.map(({ total_records, roles, ...rest }) => ({ ...rest, roles: roles, role_name: roles?.[0]?.name || 'N/A' }));
            if (pageNum === 0 || isRefresh) { setUsers(formattedUsers); } else { setUsers(formattedUsers); }
            setTotalCount(count);
        } catch (err: any) { console.error("Error calling/processing admin_get_users RPC:", err); setError(err.message || "Erreur chargement utilisateurs."); setUsers([]); setTotalCount(0); }
        finally { setLoading(false); setLoadingMore(false); setRefreshing(false); }
    }, [adminUser]);

    // Charger rôles au montage
    useEffect(() => { if (fontsLoaded && !fontError && adminUser) { fetchRoleTabs(); } }, [fontsLoaded, fontError, adminUser, fetchRoleTabs]);

    // useEffect principal pour fetch des utilisateurs
    useEffect(() => { if ((!loadingTabs || tabsError) && fontsLoaded && !fontError && adminUser) { setPage(0); fetchUsers(0, activeTabKey, debouncedSearchTerm); } }, [loadingTabs, tabsError, fontsLoaded, fontError, adminUser, fetchUsers, activeTabKey, debouncedSearchTerm]);

    // useEffect pour la pagination
    useEffect(() => { if (!loading && !loadingTabs && page > 0) { fetchUsers(page, activeTabKey, debouncedSearchTerm); } }, [page, loading, loadingTabs, activeTabKey, debouncedSearchTerm, fetchUsers]);

    // Fonctions pagination et refresh
    const goToNextPage = () => { if (!loadingMore && (page + 1) * PAGE_SIZE < totalCount) { setPage(p => p + 1); } };
    const goToPrevPage = () => { if (!loadingMore && page > 0) { setPage(p => p - 1); } };
    const onRefresh = useCallback(() => { setRefreshing(true); setPage(0); fetchUsers(0, activeTabKey, debouncedSearchTerm, true); }, [fetchUsers, activeTabKey, debouncedSearchTerm]);

    // Rendu d'un item
    const renderItem = useCallback(({ item }: { item: DisplayUser }) => ( <TouchableOpacity style={styles.userItem} onPress={() => router.push(`/admin/users/${item.id}`)} activeOpacity={0.7} > <View style={styles.userInfo}> <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail">{item.email || 'N/A'}</Text> <Text style={styles.name}>{item.full_name || 'Nom non renseigné'}</Text> </View> <View style={styles.roleBadge}><Text style={styles.roleText}>{item.role_name}</Text></View> </TouchableOpacity> ), [router]);
    const keyExtractor = useCallback((item: DisplayUser) => item.id, []);

    // Construire dynamiquement les onglets
    const TABS_TO_DISPLAY = useMemo(() => { const tabs: RoleTabInfo[] = [{ key: 'all', label: 'Tous' }]; tabs.push(...roleTabsData); return tabs; }, [roleTabsData]);

    // --- Rendu ---
    if ((!fontsLoaded && !fontError) || (loadingTabs && !tabsError)) { return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#0891b2" /></SafeAreaView>; }
    if (fontError) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Erreur polices.</Text></SafeAreaView>; }
    if (!adminUser && !loading && !loadingTabs) { return <SafeAreaView style={styles.loadingContainer}><Text style={styles.errorText}>Accès admin requis.</Text></SafeAreaView>; }

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Gestion Utilisateurs' }} />
            {(error || tabsError) && !loading && ( <View style={styles.errorBanner}><Text style={styles.errorBannerText}>{error || tabsError}</Text><TouchableOpacity onPress={() => error ? fetchUsers(page, activeTabKey, debouncedSearchTerm) : fetchRoleTabs()} style={styles.retryIcon}><RefreshCcw size={16} color="#b91c1c" /></TouchableOpacity></View> )}

            {/* Barre de Recherche */}
            <View style={styles.controlsContainer}>
                <View style={styles.searchBarContainer}> <SearchIcon size={20} color="#6b7280" style={styles.searchIcon}/> <TextInput style={styles.searchInput} placeholder="Chercher email, nom..." value={searchTerm} onChangeText={setSearchTerm} autoCapitalize="none" autoCorrect={false} placeholderTextColor="#9ca3af" /> {searchTerm ? ( <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearSearchButton}><XIcon size={18} color="#6b7280" /></TouchableOpacity> ) : null} </View>
            </View>

            {/* Barre d'Onglets Scrollable (Correction Scrollbar) */}
            <View style={styles.tabBarContainer}>
                 <ScrollView
                    horizontal={true}
                    // showsHorizontalScrollIndicator={false} // <<< Ligne Supprimée
                    contentContainerStyle={styles.tabBarScrollContent}
                 >
                    {TABS_TO_DISPLAY.map((tab) => (
                        <TouchableOpacity key={tab.key} style={[ styles.tabItem, activeTabKey === tab.key && styles.tabItemActive ]} onPress={() => { if (activeTabKey !== tab.key && !loading) { setActiveTabKey(tab.key); } }} disabled={loading || loadingTabs} >
                            <Text style={[ styles.tabLabel, activeTabKey === tab.key && styles.tabLabelActive ]}>{tab.label}</Text>
                        </TouchableOpacity>
                    ))}
                 </ScrollView>
            </View>

            {/* Loader principal OU Liste */}
             {(loading && page === 0 && !refreshing) ? ( <ActivityIndicator size="large" color="#0891b2" style={styles.mainLoader} /> )
             : (
                 <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={ !loadingMore && !error && !tabsError ? <View style={styles.emptyContainer}><Text style={styles.emptyText}>Aucun utilisateur trouvé.</Text></View> : null }
                    refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0891b2']} tintColor={'#0891b2'} /> }
                    ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.listLoadingIndicator} color="#0891b2"/> : null}
                 />
             )}

            {/* Contrôles de Pagination */}
             {(!loading || page > 0) && totalCount > PAGE_SIZE && (
                 <View style={styles.paginationContainer}>
                    <TouchableOpacity style={[styles.paginationButton, page === 0 && styles.paginationButtonDisabled]} onPress={goToPrevPage} disabled={page === 0 || loadingMore || loading}> <ChevronLeft size={20} color={page === 0 ? '#9ca3af' : '#0891b2'} /> <Text style={[styles.paginationButtonText, page === 0 && styles.paginationButtonTextDisabled]}>Préc.</Text> </TouchableOpacity>
                    <Text style={styles.paginationText}>Page {page + 1} / {Math.ceil(totalCount / PAGE_SIZE)}</Text>
                    <TouchableOpacity style={[styles.paginationButton, (page + 1) * PAGE_SIZE >= totalCount && styles.paginationButtonDisabled]} onPress={goToNextPage} disabled={(page + 1) * PAGE_SIZE >= totalCount || loadingMore || loading}> <Text style={[styles.paginationButtonText, (page + 1) * PAGE_SIZE >= totalCount && styles.paginationButtonTextDisabled]}>Suiv.</Text> <ChevronRight size={20} color={(page + 1) * PAGE_SIZE >= totalCount ? '#9ca3af' : '#0891b2'} /> </TouchableOpacity>
                 </View>
             )}
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    mainLoader: { flex: 1, justifyContent: 'center', alignItems: 'center'},
    errorText: { fontFamily: 'Montserrat-Regular', color: '#b91c1c', fontSize: 16, textAlign: 'center', padding: 20 },
    errorBanner: { backgroundColor: '#fee2e2', paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#fecaca' },
    errorBannerText: { color: '#b91c1c', fontFamily: 'Montserrat-Regular', fontSize: 13, flexShrink: 1, marginRight: 10 },
    retryIcon: { padding: 4 },
    controlsContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 10, height: 44 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#1e293b', height: '100%' },
    clearSearchButton: { padding: 4, marginLeft: 4 },
    // Styles TabBar Scrollable
    tabBarContainer: { backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', boxShadow: "#000", boxShadow: { width: 0, height: 1 }, boxShadow: 0.05, boxShadow: 2, elevation: 1 },
    tabBarScrollContent: { flexDirection: 'row' },
    tabItem: { paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabItemActive: { borderBottomColor: '#0891b2' },
    tabLabel: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#6b7280', textAlign: 'center', whiteSpace: 'nowrap' },
    tabLabelActive: { fontFamily: 'Montserrat-SemiBold', color: '#0891b2' },
    // Styles Liste et Items
    listContent: { paddingVertical: 16, paddingHorizontal: 16, flexGrow: 1 },
    userItem: { backgroundColor: '#ffffff', borderRadius: 8, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 1, shadowColor: '#000', boxShadow: { width: 0, height: 1 }, boxShadow: 0.05, boxShadow: 2, borderWidth: 1, borderColor: '#e5e7eb' },
    userInfo: { flex: 1, marginRight: 12 },
    email: { fontFamily: 'Montserrat-SemiBold', fontSize: 15, color: '#1f2937', marginBottom: 4 },
    name: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#6b7280' },
    roleBadge: { backgroundColor: '#e0f2fe', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
    roleText: { fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: '#0369a1', textTransform: 'capitalize' },
    emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { textAlign: 'center', fontFamily: 'Montserrat-Regular', color: '#6b7280', fontSize: 16 },
    paginationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#ffffff' },
    paginationButton: { flexDirection: 'row', alignItems: 'center', padding: 8, gap: 4 },
    paginationButtonDisabled: { opacity: 0.4 },
    paginationButtonText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#0891b2' },
    paginationButtonTextDisabled: { color: '#9ca3af' },
    paginationText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#374151' },
    listLoadingIndicator: { marginVertical: 20 }
});