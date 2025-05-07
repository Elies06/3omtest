// // // // // // // // // // // // // import { useEffect, useState } from 'react';
// // // // // // // // // // // // // import { supabase } from '@/lib/supabase';
// // // // // // // // // // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // // // // // // // // // export interface Permission {
// // // // // // // // // // // // //   name: string;
// // // // // // // // // // // // // }

// // // // // // // // // // // // // export function useAdmin() {
// // // // // // // // // // // // //   const { user: authUser, session } = useAuth();
// // // // // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // // // // //   const [error, setError] = useState(null);
// // // // // // // // // // // // //   const [userRoles, setUserRoles] = useState<string[]>([]);
// // // // // // // // // // // // //   const [userPermissions, setUserPermissions] = useState<string[]>([]);
// // // // // // // // // // // // //   const [users, setUsers] = useState([]);

// // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // //     if (authUser && session) {
// // // // // // // // // // // // //       loadUserRolesAndPermissions();
// // // // // // // // // // // // //     } else {
// // // // // // // // // // // // //       setLoading(false);
// // // // // // // // // // // // //       setUserRoles([]);
// // // // // // // // // // // // //       setUserPermissions([]);
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   }, [authUser, session]);

// // // // // // // // // // // // //   const loadUserRolesAndPermissions = async () => {
// // // // // // // // // // // // //     try {
// // // // // // // // // // // // //       if (!authUser || !session) {
// // // // // // // // // // // // //         throw new Error('Not authenticated');
// // // // // // // // // // // // //       }

// // // // // // // // // // // // //       const { data: userRolesData, error: userRolesError } = await supabase
// // // // // // // // // // // // //         .from('user_roles')
// // // // // // // // // // // // //         .select(`roles (name)`)
// // // // // // // // // // // // //         .eq('user_id', authUser.id);

// // // // // // // // // // // // //       if (userRolesError) {
// // // // // // // // // // // // //         console.error('Supabase error:', userRolesError);
// // // // // // // // // // // // //         throw userRolesError;
// // // // // // // // // // // // //       }

// // // // // // // // // // // // //       console.log('userRolesData:', userRolesData); // Log pour vérification

// // // // // // // // // // // // //       // Utilisation d'une sécurité pour les valeurs nulles
// // // // // // // // // // // // //       const roles = userRolesData?.map(ur => ur.roles?.name || 'Unknown Role') || [];

// // // // // // // // // // // // //       setUserRoles(roles);
// // // // // // // // // // // // //       setUserPermissions([]); // Les permissions ne sont pas utilisées ici
// // // // // // // // // // // // //     } catch (err: any) {
// // // // // // // // // // // // //       console.error('Error loading roles and permissions:', err);
// // // // // // // // // // // // //       setError(err.message || 'Error loading roles and permissions');
// // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // //       setLoading(false);
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const hasRole = (role: string): boolean => {
// // // // // // // // // // // // //     return userRoles.includes(role);
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const hasPermission = (permission: string): boolean => {
// // // // // // // // // // // // //     return userPermissions.includes(permission) || hasRole('admin');
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const getUsers = async () => {
// // // // // // // // // // // // //     try {
// // // // // // // // // // // // //       if (!authUser || !session) {
// // // // // // // // // // // // //         throw new Error('Not authenticated');
// // // // // // // // // // // // //       }

// // // // // // // // // // // // //       if (!hasRole('admin')) {
// // // // // // // // // // // // //         throw new Error('Unauthorized access');
// // // // // // // // // // // // //       }

// // // // // // // // // // // // //       const { data: usersData, error: usersError } = await supabase
// // // // // // // // // // // // //         .from('users')
// // // // // // // // // // // // //         .select(`
// // // // // // // // // // // // //           id,
// // // // // // // // // // // // //           email,
// // // // // // // // // // // // //           created_at,
// // // // // // // // // // // // //           profiles (
// // // // // // // // // // // // //             full_name,
// // // // // // // // // // // // //             avatar_url,
// // // // // // // // // // // // //             city
// // // // // // // // // // // // //           ),
// // // // // // // // // // // // //           user_roles (
// // // // // // // // // // // // //             roles (
// // // // // // // // // // // // //               id,
// // // // // // // // // // // // //               name,
// // // // // // // // // // // // //               description
// // // // // // // // // // // // //             )
// // // // // // // // // // // // //           )
// // // // // // // // // // // // //         `);

// // // // // // // // // // // // //       if (usersError) throw usersError;

// // // // // // // // // // // // //       const formattedUsers = usersData?.map(user => ({
// // // // // // // // // // // // //         id: user.id,
// // // // // // // // // // // // //         email: user.email,
// // // // // // // // // // // // //         created_at: user.created_at,
// // // // // // // // // // // // //         full_name: user.profiles?.[0]?.full_name,
// // // // // // // // // // // // //         avatar_url: user.profiles?.[0]?.avatar_url,
// // // // // // // // // // // // //         city: user.profiles?.[0]?.city,
// // // // // // // // // // // // //         roles: user.user_roles?.map(ur => ur.roles) || []
// // // // // // // // // // // // //       })) || [];

// // // // // // // // // // // // //       setUsers(formattedUsers);
// // // // // // // // // // // // //       return formattedUsers;
// // // // // // // // // // // // //     } catch (err: any) {
// // // // // // // // // // // // //       console.error('Error loading users:', err);
// // // // // // // // // // // // //       throw new Error(err.message || 'Error loading users');
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const updateUserRoles = async (userId: string, roles: string[]) => {
// // // // // // // // // // // // //     try {
// // // // // // // // // // // // //       if (!hasRole('admin')) {
// // // // // // // // // // // // //         throw new Error('Unauthorized access');
// // // // // // // // // // // // //       }

// // // // // // // // // // // // //       const { data: roleIds, error: roleError } = await supabase
// // // // // // // // // // // // //         .from('roles')
// // // // // // // // // // // // //         .select('id, name')
// // // // // // // // // // // // //         .in('name', roles);

// // // // // // // // // // // // //       if (roleError) throw roleError;

// // // // // // // // // // // // //       const { error: deleteError } = await supabase
// // // // // // // // // // // // //         .from('user_roles')
// // // // // // // // // // // // //         .delete()
// // // // // // // // // // // // //         .eq('user_id', userId);

// // // // // // // // // // // // //       if (deleteError) throw deleteError;

// // // // // // // // // // // // //       if (roleIds && roleIds.length > 0) {
// // // // // // // // // // // // //         const { error: insertError } = await supabase
// // // // // // // // // // // // //           .from('user_roles')
// // // // // // // // // // // // //           .insert(
// // // // // // // // // // // // //             roleIds.map(role => ({
// // // // // // // // // // // // //               user_id: userId,
// // // // // // // // // // // // //               role_id: role.id
// // // // // // // // // // // // //             }))
// // // // // // // // // // // // //           );

// // // // // // // // // // // // //         if (insertError) throw insertError;
// // // // // // // // // // // // //       }

// // // // // // // // // // // // //       return true;
// // // // // // // // // // // // //     } catch (err: any) {
// // // // // // // // // // // // //       console.error('Error updating user roles:', err);
// // // // // // // // // // // // //       throw new Error(err.message || 'Error updating user roles');
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const deleteUser = async (userId: string) => {
// // // // // // // // // // // // //     try {
// // // // // // // // // // // // //       if (!hasRole('admin')) {
// // // // // // // // // // // // //         throw new Error('Unauthorized access');
// // // // // // // // // // // // //       }

// // // // // // // // // // // // //       const { error } = await supabase.auth.admin.deleteUser(userId);
// // // // // // // // // // // // //       if (error) throw error;
// // // // // // // // // // // // //       return true;
// // // // // // // // // // // // //     } catch (err: any) {
// // // // // // // // // // // // //       console.error('Error deleting user:', err);
// // // // // // // // // // // // //       throw new Error(err.message || 'Error deleting user');
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   return {
// // // // // // // // // // // // //     loading,
// // // // // // // // // // // // //     error,
// // // // // // // // // // // // //     hasRole,
// // // // // // // // // // // // //     hasPermission,
// // // // // // // // // // // // //     getUsers,
// // // // // // // // // // // // //     updateUserRoles,
// // // // // // // // // // // // //     deleteUser,
// // // // // // // // // // // // //     users,
// // // // // // // // // // // // //     userRoles,
// // // // // // // // // // // // //     userPermissions,
// // // // // // // // // // // // //   };
// // // // // // // // // // // // // }
// // // // // // // // // // // // import { useEffect, useState } from 'react';
// // // // // // // // // // // // import { supabase } from '@/lib/supabase';
// // // // // // // // // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // // // // // // // // export interface Permission {
// // // // // // // // // // // //   name: string;
// // // // // // // // // // // // }

// // // // // // // // // // // // export function useAdmin() {
// // // // // // // // // // // //   const { user: authUser, session } = useAuth();
// // // // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // // //   const [userRoles, setUserRoles] = useState<string[]>([]);
// // // // // // // // // // // //   const [userPermissions, setUserPermissions] = useState<string[]>([]);
// // // // // // // // // // // //   const [users, setUsers] = useState<any[]>([]);

// // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // //     if (authUser && session) {
// // // // // // // // // // // //       loadUserRolesAndPermissions();
// // // // // // // // // // // //     } else {
// // // // // // // // // // // //       setLoading(false);
// // // // // // // // // // // //       setUserRoles([]);
// // // // // // // // // // // //       setUserPermissions([]);
// // // // // // // // // // // //     }
// // // // // // // // // // // //   }, [authUser, session]);

// // // // // // // // // // // //   const loadUserRolesAndPermissions = async () => {
// // // // // // // // // // // //     try {
// // // // // // // // // // // //       if (!authUser || !session) {
// // // // // // // // // // // //         throw new Error('Not authenticated');
// // // // // // // // // // // //       }

// // // // // // // // // // // //       const { data: userRolesData, error: userRolesError } = await supabase
// // // // // // // // // // // //         .from('user_roles')
// // // // // // // // // // // //         .select(`roles (name)`)
// // // // // // // // // // // //         .eq('user_id', authUser.id);

// // // // // // // // // // // //       if (userRolesError) {
// // // // // // // // // // // //         console.error('Supabase error:', userRolesError);
// // // // // // // // // // // //         throw userRolesError;
// // // // // // // // // // // //       }

// // // // // // // // // // // //       const roles = userRolesData?.map((ur: any) => ur.roles?.name || 'Unknown Role') || [];

// // // // // // // // // // // //       setUserRoles(roles);
// // // // // // // // // // // //       setUserPermissions([]);
// // // // // // // // // // // //     } catch (err: any) {
// // // // // // // // // // // //       console.error('Error loading roles and permissions:', err);
// // // // // // // // // // // //       setError(err.message || 'Error loading roles and permissions');
// // // // // // // // // // // //     } finally {
// // // // // // // // // // // //       setLoading(false);
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const hasRole = (role: string): boolean => {
// // // // // // // // // // // //     return userRoles.includes(role);
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const hasPermission = (permission: string): boolean => {
// // // // // // // // // // // //     return userPermissions.includes(permission) || hasRole('admin');
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const checkAdminAccess = () => {
// // // // // // // // // // // //     if (!hasRole('admin')) {
// // // // // // // // // // // //       throw new Error('Unauthorized access');
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const getUsers = async () => {
// // // // // // // // // // // //     try {
// // // // // // // // // // // //       checkAdminAccess();

// // // // // // // // // // // //       const { data: usersData, error: usersError } = await supabase
// // // // // // // // // // // //         .from('users')
// // // // // // // // // // // //         .select(`
// // // // // // // // // // // //           id, email, created_at,
// // // // // // // // // // // //           profiles (full_name, avatar_url, city),
// // // // // // // // // // // //           user_roles (roles (id, name, description))
// // // // // // // // // // // //         `);

// // // // // // // // // // // //       if (usersError) throw usersError;

// // // // // // // // // // // //       const formattedUsers = usersData?.map((user: any) => ({
// // // // // // // // // // // //         id: user.id,
// // // // // // // // // // // //         email: user.email,
// // // // // // // // // // // //         created_at: user.created_at,
// // // // // // // // // // // //         full_name: user.profiles?.[0]?.full_name,
// // // // // // // // // // // //         avatar_url: user.profiles?.[0]?.avatar_url,
// // // // // // // // // // // //         city: user.profiles?.[0]?.city,
// // // // // // // // // // // //         roles: user.user_roles?.map((ur: any) => ur.roles) || [],
// // // // // // // // // // // //       })) || [];

// // // // // // // // // // // //       setUsers(formattedUsers);
// // // // // // // // // // // //       return formattedUsers;
// // // // // // // // // // // //     } catch (err: any) {
// // // // // // // // // // // //       console.error('Error loading users:', err);
// // // // // // // // // // // //       setError(err.message || 'Error loading users');
// // // // // // // // // // // //       return [];
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const updateUserRoles = async (userId: string, roles: string[]) => {
// // // // // // // // // // // //     try {
// // // // // // // // // // // //       checkAdminAccess();

// // // // // // // // // // // //       const { data: roleIds, error: roleError } = await supabase
// // // // // // // // // // // //         .from('roles')
// // // // // // // // // // // //         .select('id, name')
// // // // // // // // // // // //         .in('name', roles);

// // // // // // // // // // // //       if (roleError) throw roleError;

// // // // // // // // // // // //       const { error: deleteError } = await supabase
// // // // // // // // // // // //         .from('user_roles')
// // // // // // // // // // // //         .delete()
// // // // // // // // // // // //         .eq('user_id', userId);

// // // // // // // // // // // //       if (deleteError) throw deleteError;

// // // // // // // // // // // //       if (roleIds && roleIds.length > 0) {
// // // // // // // // // // // //         const { error: insertError } = await supabase
// // // // // // // // // // // //           .from('user_roles')
// // // // // // // // // // // //           .insert(
// // // // // // // // // // // //             roleIds.map((role: any) => ({
// // // // // // // // // // // //               user_id: userId,
// // // // // // // // // // // //               role_id: role.id,
// // // // // // // // // // // //             }))
// // // // // // // // // // // //           );

// // // // // // // // // // // //         if (insertError) throw insertError;
// // // // // // // // // // // //       }

// // // // // // // // // // // //       return true;
// // // // // // // // // // // //     } catch (err: any) {
// // // // // // // // // // // //       console.error('Error updating user roles:', err);
// // // // // // // // // // // //       setError(err.message || 'Error updating user roles');
// // // // // // // // // // // //       return false;
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const deleteUser = async (userId: string) => {
// // // // // // // // // // // //     try {
// // // // // // // // // // // //       checkAdminAccess();

// // // // // // // // // // // //       const { error } = await supabase.auth.admin.deleteUser(userId);
// // // // // // // // // // // //       if (error) throw error;
// // // // // // // // // // // //       return true;
// // // // // // // // // // // //     } catch (err: any) {
// // // // // // // // // // // //       console.error('Error deleting user:', err);
// // // // // // // // // // // //       setError(err.message || 'Error deleting user');
// // // // // // // // // // // //       return false;
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   return {
// // // // // // // // // // // //     loading,
// // // // // // // // // // // //     error,
// // // // // // // // // // // //     hasRole,
// // // // // // // // // // // //     hasPermission,
// // // // // // // // // // // //     getUsers,
// // // // // // // // // // // //     updateUserRoles,
// // // // // // // // // // // //     deleteUser,
// // // // // // // // // // // //     users,
// // // // // // // // // // // //     userRoles,
// // // // // // // // // // // //     userPermissions,
// // // // // // // // // // // //   };
// // // // // // // // // // // // }

// // // // // // // // // // // import { useEffect, useState } from 'react';
// // // // // // // // // // // import { supabase } from '@/lib/supabase';
// // // // // // // // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // // // // // // // export function useAdmin() {
// // // // // // // // // // //   const { user: authUser, session } = useAuth();
// // // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // //   const [userRoles, setUserRoles] = useState<string[]>([]);
// // // // // // // // // // //   const [userPermissions, setUserPermissions] = useState<string[]>([]);

// // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // //     if (authUser && session) {
// // // // // // // // // // //       loadUserRolesAndPermissions();
// // // // // // // // // // //     } else {
// // // // // // // // // // //       setLoading(false);
// // // // // // // // // // //       setUserRoles([]);
// // // // // // // // // // //       setUserPermissions([]);
// // // // // // // // // // //     }
// // // // // // // // // // //   }, [authUser, session]);

// // // // // // // // // // //   const loadUserRolesAndPermissions = async () => {
// // // // // // // // // // //     try {
// // // // // // // // // // //       if (!authUser || !session) {
// // // // // // // // // // //         throw new Error('Not authenticated');
// // // // // // // // // // //       }

// // // // // // // // // // //       const { data: userRolesData, error: userRolesError } = await supabase
// // // // // // // // // // //         .from('user_roles')
// // // // // // // // // // //         .select(`roles (name)`)
// // // // // // // // // // //         .eq('user_id', authUser.id);

// // // // // // // // // // //       if (userRolesError) {
// // // // // // // // // // //         console.error('Supabase error:', userRolesError);
// // // // // // // // // // //         throw userRolesError;
// // // // // // // // // // //       }

// // // // // // // // // // //       // Log pour vérification
// // // // // // // // // // //       console.log('userRolesData:', userRolesData);

// // // // // // // // // // //       const roles = userRolesData?.map((ur: any) => ur.roles?.name || 'Unknown Role') || [];

// // // // // // // // // // //       setUserRoles(roles);
// // // // // // // // // // //       setUserPermissions([]);
// // // // // // // // // // //     } catch (err: any) {
// // // // // // // // // // //       console.error('Error loading roles and permissions:', err);
// // // // // // // // // // //       setError(err.message || 'Error loading roles and permissions');
// // // // // // // // // // //     } finally {
// // // // // // // // // // //       setLoading(false);
// // // // // // // // // // //     }
// // // // // // // // // // //   };

// // // // // // // // // // //   const hasRole = (role: string): boolean => {
// // // // // // // // // // //     // Log pour vérification
// // // // // // // // // // //     console.log('userRoles:', userRoles);
// // // // // // // // // // //     console.log('Checking role:', role);

// // // // // // // // // // //     return userRoles.includes(role);
// // // // // // // // // // //   };

// // // // // // // // // // //   // ... (reste du code)
// // // // // // // // // // // } ya code d'erreur

// // // // // // // // // // // import { useEffect, useState } from 'react';
// // // // // // // // // // // import { supabase } from '@/lib/supabase';
// // // // // // // // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // // // // // // // export function useAdmin() {
// // // // // // // // // // //   const { user: authUser, session, sessionInitialized } = useAuth();
// // // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // // //   const [userRoles, setUserRoles] = useState<string[]>([]);
// // // // // // // // // // //   const [userPermissions, setUserPermissions] = useState<string[]>([]);

// // // // // // // // // // //   const hasRole = (role: string): boolean => {
// // // // // // // // // // //     // Add logging to help diagnose issues
// // // // // // // // // // //     console.log('Current user roles:', userRoles);
// // // // // // // // // // //     console.log('Checking for role:', role);
// // // // // // // // // // //     return userRoles.includes(role);
// // // // // // // // // // //   };

// // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // //     const loadRoles = async () => {
// // // // // // // // // // //       // Reset state at the start of loading
// // // // // // // // // // //       setLoading(true);
// // // // // // // // // // //       setError(null);

// // // // // // // // // // //       try {
// // // // // // // // // // //         // Only attempt to load roles if we have a user and session is initialized
// // // // // // // // // // //         if (!authUser || !sessionInitialized) {
// // // // // // // // // // //           setLoading(false);
// // // // // // // // // // //           return;
// // // // // // // // // // //         }

// // // // // // // // // // //         const { data: userRolesData, error: userRolesError } = await supabase
// // // // // // // // // // //           .from('user_roles')
// // // // // // // // // // //           .select(`roles (name)`)
// // // // // // // // // // //           .eq('user_id', authUser.id);

// // // // // // // // // // //         if (userRolesError) {
// // // // // // // // // // //           console.error('Supabase roles error:', userRolesError);
// // // // // // // // // // //           setError(userRolesError.message);
// // // // // // // // // // //           return;
// // // // // // // // // // //         }

// // // // // // // // // // //         // Safely extract role names
// // // // // // // // // // //         const roles = userRolesData?.map((ur: any) => 
// // // // // // // // // // //           ur.roles?.name || 'Unknown Role'
// // // // // // // // // // //         ) || [];

// // // // // // // // // // //         console.log('Loaded roles:', roles);
// // // // // // // // // // //         setUserRoles(roles);
// // // // // // // // // // //       } catch (err: any) {
// // // // // // // // // // //         console.error('Error in loadRoles:', err);
// // // // // // // // // // //         setError(err.message || 'Error loading roles');
// // // // // // // // // // //       } finally {
// // // // // // // // // // //         setLoading(false);
// // // // // // // // // // //       }
// // // // // // // // // // //     };

// // // // // // // // // // //     loadRoles();
// // // // // // // // // // //   }, [authUser, sessionInitialized]);

// // // // // // // // // // //   return {
// // // // // // // // // // //     loading,
// // // // // // // // // // //     error,
// // // // // // // // // // //     hasRole,
// // // // // // // // // // //     userRoles,
// // // // // // // // // // //     userPermissions,
// // // // // // // // // // //   };
// // // // // // // // // // // }

// // // // // // // // // // import { useEffect, useState } from 'react';
// // // // // // // // // // import { supabase } from '@/lib/supabase';
// // // // // // // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // // // // // // export function useAdmin() {
// // // // // // // // // //   const { user: authUser, session, sessionInitialized } = useAuth();
// // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // // //   const [userRoles, setUserRoles] = useState<string[]>([]);
// // // // // // // // // //   const [userPermissions, setUserPermissions] = useState<string[]>([]);

// // // // // // // // // //   const hasRole = (role: string): boolean => {
// // // // // // // // // //     console.log('Current user roles:', userRoles);
// // // // // // // // // //     console.log('Checking for role:', role);
// // // // // // // // // //     return userRoles.includes(role);
// // // // // // // // // //   };

// // // // // // // // // //   useEffect(() => {
// // // // // // // // // //     const loadRoles = async () => {
// // // // // // // // // //       setLoading(true);
// // // // // // // // // //       setError(null);

// // // // // // // // // //       try {
// // // // // // // // // //         if (!authUser || !sessionInitialized) {
// // // // // // // // // //           setLoading(false);
// // // // // // // // // //           return;
// // // // // // // // // //         }

// // // // // // // // // //         const { data: userRolesData, error: userRolesError } = await supabase
// // // // // // // // // //           .from('user_roles')
// // // // // // // // // //           .select(`roles (name)`)
// // // // // // // // // //           .eq('user_id', authUser.id);

// // // // // // // // // //         if (userRolesError) {
// // // // // // // // // //           console.error('Supabase roles error:', userRolesError);
// // // // // // // // // //           setError('Failed to load user roles. Please try again.'); // Message utilisateur
// // // // // // // // // //           return;
// // // // // // // // // //         }

// // // // // // // // // //         const roles = userRolesData?.map((ur: any) => ur.roles?.name || 'Unknown Role') || [];

// // // // // // // // // //         console.log('Loaded roles:', roles);
// // // // // // // // // //         setUserRoles(roles);
// // // // // // // // // //       } catch (err: any) {
// // // // // // // // // //         console.error('Error in loadRoles:', err);
// // // // // // // // // //         setError('An unexpected error occurred. Please try again.'); // Message utilisateur
// // // // // // // // // //       } finally {
// // // // // // // // // //         setLoading(false);
// // // // // // // // // //       }
// // // // // // // // // //     };

// // // // // // // // // //     loadRoles();
// // // // // // // // // //   }, [authUser, sessionInitialized]);

// // // // // // // // // //   return {
// // // // // // // // // //     loading,
// // // // // // // // // //     error,
// // // // // // // // // //     hasRole,
// // // // // // // // // //     userRoles,
// // // // // // // // // //     userPermissions,
// // // // // // // // // //   };
// // // // // // // // // // }

// // // // // // // // // import { useEffect, useState } from 'react';
// // // // // // // // // import { supabase } from '@/lib/supabase';
// // // // // // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // // // // // export function useAdmin() {
// // // // // // // // //   const { user: authUser, session, sessionInitialized } = useAuth();
// // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // // //   const [userRoles, setUserRoles] = useState<string[]>([]);
// // // // // // // // //   const [userPermissions, setUserPermissions] = useState<string[]>([]);

// // // // // // // // //   const hasRole = (role: string): boolean => {
// // // // // // // // //     console.log('Current user roles:', userRoles);
// // // // // // // // //     console.log('Checking for role:', role);
// // // // // // // // //     return userRoles.includes(role);
// // // // // // // // //   };

// // // // // // // // //   const hasPermission = (permission: string): boolean => {
// // // // // // // // //     console.log('Current user permissions:', userPermissions);
// // // // // // // // //     console.log('Checking for permission:', permission);
// // // // // // // // //     return userPermissions.includes(permission) || hasRole('admin');
// // // // // // // // //   };

// // // // // // // // //   useEffect(() => {
// // // // // // // // //     const loadRolesAndPermissions = async () => {
// // // // // // // // //       setLoading(true);
// // // // // // // // //       setError(null);

// // // // // // // // //       try {
// // // // // // // // //         if (!authUser || !sessionInitialized) {
// // // // // // // // //           setLoading(false);
// // // // // // // // //           return;
// // // // // // // // //         }

// // // // // // // // //         const { data: userRolesData, error: userRolesError } = await supabase
// // // // // // // // //           .from('user_roles')
// // // // // // // // //           .select(`roles (name)`)
// // // // // // // // //           .eq('user_id', authUser.id);

// // // // // // // // //         if (userRolesError) {
// // // // // // // // //           console.error('Supabase roles error:', userRolesError);
// // // // // // // // //           setError('Failed to load user roles. Please try again.');
// // // // // // // // //           return;
// // // // // // // // //         }

// // // // // // // // //         const roles = userRolesData?.map((ur: any) => ur.roles?.name || 'Unknown Role') || [];
// // // // // // // // //         setUserRoles(roles);

// // // // // // // // //         // Ajoute ici la logique pour récupérer les permissions de l'utilisateur
// // // // // // // // //         // et les stocker dans userPermissions

// // // // // // // // //         console.log('Loaded roles:', roles);
// // // // // // // // //       } catch (err: any) {
// // // // // // // // //         console.error('Error in loadRolesAndPermissions:', err);
// // // // // // // // //         setError('An unexpected error occurred. Please try again.');
// // // // // // // // //       } finally {
// // // // // // // // //         setLoading(false);
// // // // // // // // //       }
// // // // // // // // //     };

// // // // // // // // //     loadRolesAndPermissions();
// // // // // // // // //   }, [authUser, sessionInitialized]);

// // // // // // // // //   return {
// // // // // // // // //     loading,
// // // // // // // // //     error,
// // // // // // // // //     hasRole,
// // // // // // // // //     hasPermission,
// // // // // // // // //     userRoles,
// // // // // // // // //     userPermissions,
// // // // // // // // //   };
// // // // // // // // // }

// // // // // // // // import { useEffect, useState } from 'react';
// // // // // // // // import { supabase } from '@/lib/supabase';
// // // // // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // // // // export function useAdmin() {
// // // // // // // //   const { user: authUser, session, sessionInitialized } = useAuth();
// // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // // // //   const [userRoles, setUserRoles] = useState<string[]>([]);
// // // // // // // //   const [userPermissions, setUserPermissions] = useState<string[]>([]);

// // // // // // // //   const hasRole = (role: string): boolean => {
// // // // // // // //     console.log('Current user roles:', userRoles);
// // // // // // // //     console.log('Checking for role:', role);
// // // // // // // //     return userRoles.includes(role);
// // // // // // // //   };

// // // // // // // //   const hasPermission = (permission: string): boolean => {
// // // // // // // //     console.log('Current user permissions:', userPermissions);
// // // // // // // //     console.log('Checking for permission:', permission);
// // // // // // // //     return userPermissions.includes(permission) || hasRole('admin');
// // // // // // // //   };

// // // // // // // //   useEffect(() => {
// // // // // // // //     const loadRolesAndPermissions = async () => {
// // // // // // // //       setLoading(true);
// // // // // // // //       setError(null);

// // // // // // // //       try {
// // // // // // // //         if (!authUser || !sessionInitialized) {
// // // // // // // //           setLoading(false);
// // // // // // // //           return;
// // // // // // // //         }

// // // // // // // //         const { data: userRolesData, error: userRolesError } = await supabase
// // // // // // // //           .from('user_roles')
// // // // // // // //           .select(`roles (id, name)`)
// // // // // // // //           .eq('user_id', authUser.id);

// // // // // // // //         if (userRolesError) {
// // // // // // // //           console.error('Supabase roles error:', userRolesError);
// // // // // // // //           setError('Failed to load user roles. Please try again.');
// // // // // // // //           return;
// // // // // // // //         }

// // // // // // // //         const roles = userRolesData?.map((ur: any) => ({
// // // // // // // //           id: ur.roles?.id,
// // // // // // // //           name: ur.roles?.name || 'Unknown Role',
// // // // // // // //         })) || [];
// // // // // // // //         setUserRoles(roles.map((role) => role.name));

// // // // // // // //         // Récupérer les permissions basées sur les rôles
// // // // // // // //         const roleIds = roles.map((role) => role.id);
// // // // // // // //         const { data: userPermissionsData, error: userPermissionsError } = await supabase
// // // // // // // //           .from('role_permissions')
// // // // // // // //           .select(`permissions (name)`)
// // // // // // // //           .in('role_id', roleIds);

// // // // // // // //         if (userPermissionsError) {
// // // // // // // //           console.error('Supabase permissions error:', userPermissionsError);
// // // // // // // //           setError('Failed to load user permissions. Please try again.');
// // // // // // // //           return;
// // // // // // // //         }

// // // // // // // //         const permissions = userPermissionsData?.map((up: any) => up.permissions?.name) || [];
// // // // // // // //         setUserPermissions(permissions);

// // // // // // // //         console.log('Loaded roles:', roles.map((role) => role.name));
// // // // // // // //         console.log('Loaded permissions:', permissions);
// // // // // // // //       } catch (err: any) {
// // // // // // // //         console.error('Error in loadRolesAndPermissions:', err);
// // // // // // // //         setError('An unexpected error occurred. Please try again.');
// // // // // // // //       } finally {
// // // // // // // //         setLoading(false);
// // // // // // // //       }
// // // // // // // //     };

// // // // // // // //     loadRolesAndPermissions();
// // // // // // // //   }, [authUser, sessionInitialized]);

// // // // // // // //   return {
// // // // // // // //     loading,
// // // // // // // //     error,
// // // // // // // //     hasRole,
// // // // // // // //     hasPermission,
// // // // // // // //     userRoles,
// // // // // // // //     userPermissions,
// // // // // // // //   };
// // // // // // // // }

// // // // // // // import { useEffect, useState } from 'react';
// // // // // // // import { supabase } from '@/lib/supabase';
// // // // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // // // export function useAdmin() {
// // // // // // //   // ... (votre code existant)

// // // // // // //   useEffect(() => {
// // // // // // //     const loadRolesAndPermissions = async () => {
// // // // // // //       setLoading(true);
// // // // // // //       setError(null);

// // // // // // //       try {
// // // // // // //         if (!authUser || !sessionInitialized) {
// // // // // // //           setLoading(false);
// // // // // // //           return;
// // // // // // //         }

// // // // // // //         const { data: userRolesData, error: userRolesError } = await supabase
// // // // // // //           .from('user_roles')
// // // // // // //           .select(`roles (id, name)`)
// // // // // // //           .eq('user_id', authUser.id);

// // // // // // //         if (userRolesError) {
// // // // // // //           console.error('Supabase roles error:', userRolesError);
// // // // // // //           setError('Failed to load user roles. Please try again.');
// // // // // // //           return;
// // // // // // //         }

// // // // // // //         const roles = userRolesData?.map((ur: any) => ({
// // // // // // //           id: ur.roles?.id,
// // // // // // //           name: ur.roles?.name || 'Unknown Role',
// // // // // // //         })) || [];
// // // // // // //         setUserRoles(roles.map((role) => role.name));

// // // // // // //         console.log('Roles before extracting roleIds:', roles); // Ajout du log

// // // // // // //         const roleIds = roles.map((role) => role.id).filter(id => id !== undefined);

// // // // // // //         if (roleIds.length > 0) {
// // // // // // //           const { data: userPermissionsData, error: userPermissionsError } = await supabase
// // // // // // //             .from('role_permissions')
// // // // // // //             .select(`permissions (name)`)
// // // // // // //             .in('role_id', roleIds);

// // // // // // //           if (userPermissionsError) {
// // // // // // //             console.error('Supabase permissions error:', userPermissionsError);
// // // // // // //             setError('Failed to load user permissions. Please try again.');
// // // // // // //             return;
// // // // // // //           }

// // // // // // //           const permissions = userPermissionsData?.map((up: any) => up.permissions?.name) || [];
// // // // // // //           setUserPermissions(permissions);

// // // // // // //           console.log('Loaded roles:', roles.map((role) => role.name));
// // // // // // //           console.log('Loaded permissions:', permissions);
// // // // // // //         } else {
// // // // // // //           console.warn('No valid role IDs found.');
// // // // // // //           setUserPermissions([]); // ou un autre comportement par défaut
// // // // // // //         }
// // // // // // //       } catch (err: any) {
// // // // // // //         console.error('Error in loadRolesAndPermissions:', err);
// // // // // // //         setError('An unexpected error occurred. Please try again.');
// // // // // // //       } finally {
// // // // // // //         setLoading(false);
// // // // // // //       }
// // // // // // //     };

// // // // // // //     loadRolesAndPermissions();
// // // // // // //   }, [authUser, sessionInitialized]);

// // // // // // //   return {
// // // // // // //     // ... (votre code existant)
// // // // // // //   };
// // // // // // // }


// // // // // // import { useEffect, useState } from 'react';
// // // // // // import { supabase } from '@/lib/supabase';
// // // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // // export function useAdmin() {
// // // // // //   const { user: authUser, session, sessionInitialized } = useAuth();
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [error, setError] = useState<string | null>(null);
// // // // // //   const [userRoles, setUserRoles] = useState<string[]>([]);
// // // // // //   const [userPermissions, setUserPermissions] = useState<string[]>([]);

// // // // // //   const hasRole = (role: string): boolean => {
// // // // // //     // ... (votre code existant)
// // // // // //   };

// // // // // //   const hasPermission = (permission: string): boolean => {
// // // // // //     // ... (votre code existant)
// // // // // //   };

// // // // // //   useEffect(() => {
// // // // // //     if (authUser && sessionInitialized) {
// // // // // //       const loadRolesAndPermissions = async () => {
// // // // // //         setLoading(true);
// // // // // //         setError(null);

// // // // // //         try {
// // // // // //           // ... (votre code existant)
// // // // // //         } catch (err: any) {
// // // // // //           // ... (votre code existant)
// // // // // //         } finally {
// // // // // //           setLoading(false);
// // // // // //         }
// // // // // //       };

// // // // // //       loadRolesAndPermissions();
// // // // // //     }
// // // // // //   }, [authUser, sessionInitialized]);

// // // // // //   return {
// // // // // //     loading,
// // // // // //     error,
// // // // // //     hasRole,
// // // // // //     hasPermission,
// // // // // //     userRoles,
// // // // // //     userPermissions,
// // // // // //   };
// // // // // // }


// // // // // import { useEffect, useState } from 'react';
// // // // // import { supabase } from '@/lib/supabase';
// // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // export function useAdmin() {
// // // // //   const { user: authUser, session, sessionInitialized } = useAuth();
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [error, setError] = useState<string | null>(null);
// // // // //   const [userRoles, setUserRoles] = useState<string[]>([]);
// // // // //   const [userPermissions, setUserPermissions] = useState<string[]>([]);
// // // // //   const [users, setUsers] = useState<any[]>([]);

// // // // //   const hasRole = (role: string): boolean => {
// // // // //     console.log('Current user roles:', userRoles);
// // // // //     console.log('Checking for role:', role);
// // // // //     return userRoles.includes(role);
// // // // //   };

// // // // //   const hasPermission = (permission: string): boolean => {
// // // // //     console.log('Current user permissions:', userPermissions);
// // // // //     console.log('Checking for permission:', permission);
// // // // //     return userPermissions.includes(permission) || hasRole('admin');
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     const loadRolesAndPermissions = async () => {
// // // // //       setLoading(true);
// // // // //       setError(null);

// // // // //       try {
// // // // //         if (!authUser || !sessionInitialized) {
// // // // //           setLoading(false);
// // // // //           return;
// // // // //         }

// // // // //         const { data: userRolesData, error: userRolesError } = await supabase
// // // // //           .from('user_roles')
// // // // //           .select(`roles (id, name)`)
// // // // //           .eq('user_id', authUser.id);

// // // // //         if (userRolesError) {
// // // // //           console.error('Supabase roles error:', userRolesError);
// // // // //           setError('Failed to load user roles. Please try again.');
// // // // //           return;
// // // // //         }

// // // // //         const roles = userRolesData?.map((ur: any) => ({
// // // // //           id: ur.roles?.id,
// // // // //           name: ur.roles?.name || 'Unknown Role',
// // // // //         })) || [];
// // // // //         setUserRoles(roles.map((role) => role.name));

// // // // //         const roleIds = roles.map((role) => role.id).filter((id) => id !== undefined);

// // // // //         if (roleIds.length > 0) {
// // // // //           const { data: userPermissionsData, error: userPermissionsError } = await supabase
// // // // //             .from('role_permissions')
// // // // //             .select(`permissions (name)`)
// // // // //             .in('role_id', roleIds);

// // // // //           if (userPermissionsError) {
// // // // //             console.error('Supabase permissions error:', userPermissionsError);
// // // // //             setError('Failed to load user permissions. Please try again.');
// // // // //             return;
// // // // //           }

// // // // //           const permissions = userPermissionsData?.map((up: any) => up.permissions?.name) || [];
// // // // //           setUserPermissions(permissions);

// // // // //           console.log('Loaded roles:', roles.map((role) => role.name));
// // // // //           console.log('Loaded permissions:', permissions);
// // // // //         } else {
// // // // //           console.warn('No valid role IDs found.');
// // // // //           setUserPermissions([]);
// // // // //         }
// // // // //       } catch (err: any) {
// // // // //         console.error('Error in loadRolesAndPermissions:', err);
// // // // //         setError('An unexpected error occurred. Please try again.');
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     };

// // // // //     loadRolesAndPermissions();
// // // // //   }, [authUser, sessionInitialized]);

// // // // //   const getUsers = async () => {
// // // // //     // ... (votre code getUsers)
// // // // //   };

// // // // //   const updateUserRoles = async (userId: string, roles: string[]) => {
// // // // //     // ... (votre code updateUserRoles)
// // // // //   };

// // // // //   const deleteUser = async (userId: string) => {
// // // // //     // ... (votre code deleteUser)
// // // // //   };

// // // // //   return {
// // // // //     loading,
// // // // //     error,
// // // // //     hasRole,
// // // // //     hasPermission,
// // // // //     getUsers,
// // // // //     updateUserRoles,
// // // // //     deleteUser,
// // // // //     users,
// // // // //     userRoles,
// // // // //     userPermissions,
// // // // //   };
// // // // // }

// // // // // import { useEffect, useState } from 'react';
// // // // // import { supabase } from '@/lib/supabase';
// // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // export function useAdmin() {
// // // // //   const { user: authUser, session, sessionInitialized, loading: authLoading } = useAuth();
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [error, setError] = useState<string | null>(null);
// // // // //   const [userRoles, setUserRoles] = useState<string>();
// // // // //   const [userPermissions, setUserPermissions] = useState<string>();
// // // // //   const [users, setUsers] = useState<any>();

// // // // //   const hasRole = (role: string): boolean => {
// // // // //     console.log('Current user roles:', userRoles);
// // // // //     console.log('Checking for role:', role);
// // // // //     return userRoles.includes(role);
// // // // //   };

// // // // //   const hasPermission = (permission: string): boolean => {
// // // // //     console.log('Current user permissions:', userPermissions);
// // // // //     console.log('Checking for permission:', permission);
// // // // //     return userPermissions.includes(permission) || hasRole('admin');
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     const loadRolesAndPermissions = async () => {
// // // // //       setLoading(true);
// // // // //       setError(null);

// // // // //       try {
// // // // //         if (!authUser?.id || !sessionInitialized) {
// // // // //           // Wait for both authUser and sessionInitialized to be available
// // // // //           if (!authLoading) {
// // // // //             setLoading(false);
// // // // //           }
// // // // //           return;
// // // // //         }

// // // // //         const { data: userRolesData, error: userRolesError } = await supabase
// // // // //           .from('user_roles')
// // // // //           .select(`roles (id, name)`)
// // // // //           .eq('user_id', authUser.id);

// // // // //         if (userRolesError) {
// // // // //           console.error('Supabase roles error:', userRolesError);
// // // // //           setError('Failed to load user roles. Please try again.');
// // // // //           return;
// // // // //         }

// // // // //         const roles = userRolesData?.map((ur: any) => ({
// // // // //           id: ur.roles?.id,
// // // // //           name: ur.roles?.name || 'Unknown Role',
// // // // //         })) ||;
// // // // //         setUserRoles(roles.map((role) => role.name));

// // // // //         const roleIds = roles.map((role) => role.id).filter((id) => id !== undefined);

// // // // //         if (roleIds.length > 0) {
// // // // //           const { data: userPermissionsData, error: userPermissionsError } = await supabase
// // // // //             .from('role_permissions')
// // // // //             .select(`permissions (name)`)
// // // // //             .in('role_id', roleIds);

// // // // //           if (userPermissionsError) {
// // // // //             console.error('Supabase permissions error:', userPermissionsError);
// // // // //             setError('Failed to load user permissions. Please try again.');
// // // // //             return;
// // // // //           }

// // // // //           const permissions = userPermissionsData?.map((up: any) => up.permissions?.name) ||;
// // // // //           setUserPermissions(permissions);

// // // // //           console.log('Loaded roles:', roles.map((role) => role.name));
// // // // //           console.log('Loaded permissions:', permissions);
// // // // //         } else {
// // // // //           console.warn('No valid role IDs found.');
// // // // //           setUserPermissions();
// // // // //         }
// // // // //       } catch (err: any) {
// // // // //         console.error('Error in loadRolesAndPermissions:', err);
// // // // //         setError('An unexpected error occurred. Please try again.');
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     };

// // // // //     // Call loadRolesAndPermissions when authUser?.id or sessionInitialized changes
// // // // //     if (sessionInitialized) {
// // // // //       loadRolesAndPermissions();
// // // // //     } else {
// // // // //       setLoading(true); // Keep loading true until session is initialized
// // // // //     }
// // // // //   }, [authUser?.id, sessionInitialized, authLoading]);

// // // // //   const getUsers = async () => {
// // // // //     // ... (votre code getUsers)
// // // // //   };

// // // // //   const updateUserRoles = async (userId: string, roles: string) => {
// // // // //     // ... (votre code updateUserRoles)
// // // // //   };

// // // // //   const deleteUser = async (userId: string) => {
// // // // //     // ... (votre code deleteUser)
// // // // //   };

// // // // //   return {
// // // // //     loading,
// // // // //     error,
// // // // //     hasRole,
// // // // //     hasPermission,
// // // // //     getUsers,
// // // // //     updateUserRoles,
// // // // //     deleteUser,
// // // // //     users,
// // // // //     userRoles,
// // // // //     userPermissions,
// // // // //   };
// // // // // }

// // // // // // project/hooks/useAdmin.ts
// // // // // import { useEffect, useState } from 'react';
// // // // // import { supabase } from '@/lib/supabase';
// // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // export function useAdmin() {
// // // // //   const { user: authUser, session, sessionInitialized, loading: authLoading } = useAuth();
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [error, setError] = useState<string | null>(null);
// // // // //   const [userRoles, setUserRoles] = useState<string>();
// // // // //   const [userPermissions, setUserPermissions] = useState<string>();
// // // // //   const [users, setUsers] = useState<any>();

// // // // //   const hasRole = (role: string): boolean => {
// // // // //     console.log('Current user roles:', userRoles);
// // // // //     console.log('Checking for role:', role);
// // // // //     return userRoles.includes(role);
// // // // //   };

// // // // //   const hasPermission = (permission: string): boolean => {
// // // // //     console.log('Current user permissions:', userPermissions);
// // // // //     return userPermissions.includes(permission) || hasRole('admin');
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     const loadRolesAndPermissions = async () => {
// // // // //       setLoading(true);
// // // // //       setError(null);

// // // // //       try {
// // // // //         if (!authUser?.id || !sessionInitialized) {
// // // // //           // Wait for both authUser and sessionInitialized to be available
// // // // //           if (!authLoading) {
// // // // //             setLoading(false);
// // // // //           }
// // // // //           return;
// // // // //         }

// // // // //         const { data: userRolesData, error: userRolesError } = await supabase
// // // // //           .from('user_roles')
// // // // //           .select(`roles (id, name)`)
// // // // //           .eq('user_id', authUser.id);

// // // // //         if (userRolesError) {
// // // // //           console.error('Supabase roles error:', userRolesError);
// // // // //           setError('Failed to load user roles. Please try again.');
// // // // //           return;
// // // // //         }

// // // // //         const roles = userRolesData?.map((ur: any) => ({
// // // // //           id: ur.roles?.id,
// // // // //           name: ur.roles?.name || 'Unknown Role',
// // // // //         })) ||
// // // // //         setUserRoles(roles.map((role) => role.name));

// // // // //         const roleIds = roles.map((role) => role.id).filter((id) => id !== undefined);

// // // // //         if (roleIds.length > 0) {
// // // // //           const { data: userPermissionsData, error: userPermissionsError } = await supabase
// // // // //             .from('role_permissions')
// // // // //             .select(`permissions (name)`)
// // // // //             .in('role_id', roleIds);

// // // // //           if (userPermissionsError) {
// // // // //             console.error('Supabase permissions error:', userPermissionsError);
// // // // //             setError('Failed to load user permissions. Please try again.');
// // // // //             return;
// // // // //           }

// // // // //           const permissions = userPermissionsData?.map((up: any) => up.permissions?.name) ||;
// // // // //           setUserPermissions(permissions);

// // // // //           console.log('Loaded roles:', roles.map((role) => role.name));
// // // // //           console.log('Loaded permissions:', permissions);
// // // // //         } else {
// // // // //           console.warn('No valid role IDs found.');
// // // // //           setUserPermissions();
// // // // //         }
// // // // //       } catch (err: any) {
// // // // //         console.error('Error in loadRolesAndPermissions:', err);
// // // // //         setError('An unexpected error occurred. Please try again.');
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     };

// // // // //     // Call loadRolesAndPermissions when authUser?.id or sessionInitialized changes
// // // // //     if (sessionInitialized) {
// // // // //       loadRolesAndPermissions();
// // // // //     } else {
// // // // //       setLoading(true); // Keep loading true until session is initialized
// // // // //     }
// // // // //   }, [authUser?.id, sessionInitialized, authLoading]);

// // // // //   const getUsers = async () => {
// // // // //     // ... (votre code getUsers)
// // // // //   };

// // // // //   const updateUserRoles = async (userId: string, roles: string) => {
// // // // //     // ... (votre code updateUserRoles)
// // // // //   };

// // // // //   const deleteUser = async (userId: string) => {
// // // // //     // ... (votre code deleteUser)
// // // // //   };

// // // // //   return {
// // // // //     loading,
// // // // //     error,
// // // // //     hasRole,
// // // // //     hasPermission,
// // // // //     getUsers,
// // // // //     updateUserRoles,
// // // // //     deleteUser,
// // // // //     users,
// // // // //     userRoles,
// // // // //     userPermissions,
// // // // //   };
// // // // // }

// // // // // import { useEffect, useState } from 'react';
// // // // // import { supabase } from '@/lib/supabase';
// // // // // import { useAuth } from '@/hooks/useAuth';

// // // // // interface Role {
// // // // //   id: string;
// // // // //   name: string;
// // // // // }

// // // // // interface Permission {
// // // // //   name: string;
// // // // // }

// // // // // interface UserRoleData {
// // // // //   roles: Role | null;
// // // // // }

// // // // // interface RolePermissionData {
// // // // //   permissions: Permission | null;
// // // // // }

// // // // // interface User {
// // // // //   id: string;
// // // // //   username: string;
// // // // //   email: string;
// // // // //   // Ajoute d'autres propriétés selon tes besoins
// // // // // }

// // // // // export function useAdmin() {
// // // // //   const { user: authUser, sessionInitialized, loading: authLoading } = useAuth();
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [error, setError] = useState<string | null>(null);
// // // // //   const [userRoles, setUserRoles] = useState<string[]>([]);
// // // // //   const [userPermissions, setUserPermissions] = useState<string[]>([]);
// // // // //   const [users, setUsers] = useState<User[]>([]);

// // // // //   const hasRole = (role: string): boolean => {
// // // // //     return userRoles.includes(role);
// // // // //   };

// // // // //   const hasPermission = (permission: string): boolean => {
// // // // //     return userPermissions.includes(permission) || hasRole('admin');
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     const loadRolesAndPermissions = async () => {
// // // // //       setLoading(true);
// // // // //       setError(null);

// // // // //       try {
// // // // //         if (!authUser?.id || !sessionInitialized) {
// // // // //           return;
// // // // //         }

// // // // //         const { data: userRolesData, error: userRolesError } = await supabase
// // // // //           .from('user_roles')
// // // // //           .select(`roles (id, name)`)
// // // // //           .eq('user_id', authUser.id);

// // // // //         if (userRolesError) {
// // // // //           console.error('Supabase roles error:', userRolesError);
// // // // //           setError('Failed to load user roles. Please try again.');
// // // // //           return;
// // // // //         }

// // // // //         if (!userRolesData) {
// // // // //           console.warn('No user roles found.');
// // // // //           setUserRoles([]);
// // // // //           setUserPermissions([]);
// // // // //           return;
// // // // //         }

// // // // //         const roles: Role[] = userRolesData
// // // // //           .map((ur: UserRoleData) => ({
// // // // //             id: ur.roles?.id || '',
// // // // //             name: ur.roles?.name || 'Unknown Role',
// // // // //           }))
// // // // //           .filter((role): role is Role => role.id !== '');

// // // // //         setUserRoles(roles.map((role) => role.name));

// // // // //         const roleIds = roles.map((role) => role.id);

// // // // //         if (roleIds.length > 0) {
// // // // //           const { data: userPermissionsData, error: userPermissionsError } = await supabase
// // // // //             .from('role_permissions')
// // // // //             .select(`permissions (name)`)
// // // // //             .in('role_id', roleIds);

// // // // //           if (userPermissionsError) {
// // // // //             console.error('Supabase permissions error:', userPermissionsError);
// // // // //             setError('Failed to load user permissions. Please try again.');
// // // // //             return;
// // // // //           }

// // // // //           if (!userPermissionsData) {
// // // // //             console.warn('No user permissions found for these roles.');
// // // // //             setUserPermissions([]);
// // // // //             return;
// // // // //           }

// // // // //           const permissions: string[] = userPermissionsData
// // // // //             .map((up: RolePermissionData) => up.permissions?.name || '')
// // // // //             .filter((name) => name !== '');
// // // // //           setUserPermissions(permissions);
// // // // //         } else {
// // // // //           console.warn('No valid role IDs found.');
// // // // //           setUserPermissions([]);
// // // // //         }
// // // // //       } catch (err: any) {
// // // // //         console.error('Error in loadRolesAndPermissions:', err);
// // // // //         if (err instanceof Error) {
// // // // //           setError(`An error occurred: ${err.message}`);
// // // // //         } else {
// // // // //           setError('An unexpected error occurred. Please try again.');
// // // // //         }
// // // // //       } finally {
// // // // //         setLoading(false);
// // // // //       }
// // // // //     };

// // // // //     if (sessionInitialized) {
// // // // //       loadRolesAndPermissions();
// // // // //     }
// // // // //   }, [authUser?.id, sessionInitialized]);

// // // // //   // ... (le reste de votre code useAdmin: getUsers, updateUserRoles, deleteUser)

// // // // //   return {
// // // // //     loading,
// // // // //     error,
// // // // //     hasRole,
// // // // //     hasPermission,
// // // // //     getUsers,
// // // // //     updateUserRoles,
// // // // //     deleteUser,
// // // // //     users,
// // // // //     userRoles,
// // // // //     userPermissions,
// // // // //   };
// // // // // } bug mais que sur l'accès admin


// // // // // import { useEffect, useState } from 'react';
// // // // // import { supabase } from '@/lib/supabase';
// // // // // import { useAuth } from '@/hooks/useAuth';
// // // // // // ... (interfaces)

// // // // // export function useAdmin() {
// // // // //   const { user: authUser, sessionInitialized, loading: authLoading } = useAuth();
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [error, setError] = useState<string | null>(null);
// // // // //   const [userRoles, setUserRoles] = useState<string[]>([]);
// // // // //   const [userPermissions, setUserPermissions] = useState<string[]>([]);
// // // // //   const [users, setUsers] = useState<User[]>([]);

// // // // //   const hasRole = (role: string): boolean => {
// // // // //     return userRoles.includes(role);
// // // // //   };

// // // // //   const hasPermission = (permission: string): boolean => {
// // // // //     return userPermissions.includes(permission) || hasRole('admin');
// // // // //   };

// // // // //   const getUsers = async () => {
// // // // //     setLoading(true);
// // // // //     setError(null);

// // // // //     try {
// // // // //       const { data, error: usersError } = await supabase.from('users').select('*');

// // // // //       if (usersError) {
// // // // //         console.error('Supabase users error:', usersError);
// // // // //         setError('Failed to load users. Please try again.');
// // // // //         return;
// // // // //       }

// // // // //       setUsers(data || []);
// // // // //     } catch (err: any) {
// // // // //       console.error('Error in getUsers:', err);
// // // // //       setError('An unexpected error occurred. Please try again.');
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   const updateUserRoles = async () => {
// // // // //     // ... (implémentation)
// // // // //   };

// // // // //   const deleteUser = async () => {
// // // // //     // ... (implémentation)
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     if (sessionInitialized) {
// // // // //       loadRolesAndPermissions();
// // // // //       getUsers();
// // // // //     }
// // // // //   }, [authUser?.id, sessionInitialized]);

// // // // //   return {
// // // // //     loading,
// // // // //     error,
// // // // //     hasRole,
// // // // //     hasPermission,
// // // // //     getUsers,
// // // // //     updateUserRoles,
// // // // //     deleteUser,
// // // // //     users,
// // // // //     userRoles,
// // // // //     userPermissions,
// // // // //   };
// // // // // } marche mais bug a ladmin
// // // // import { useEffect, useState, useRef } from 'react';
// // // // import { supabase } from '@/lib/supabase';
// // // // import { useAuth } from '@/hooks/useAuth';

// // // // // ... (interfaces)

// // // // export function useAdmin() {
// // // //   const { user: authUser, sessionInitialized, loading: authLoading } = useAuth();
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [error, setError] = useState<string | null>(null);
// // // //   const [userRoles, setUserRoles] = useState<string[]>([]);
// // // //   const [userPermissions, setUserPermissions] = useState<string[]>([]);
// // // //   const [users, setUsers] = useState<User[]>([]);
// // // //   const currentRolesRef = useRef<string[]>([]);
// // // //   const currentPermissionsRef = useRef<string[]>([]);
// // // //   const currentUsersRef = useRef<User[]>([]);

// // // //   // Définition de hasRole
// // // //   const hasRole = (role: string): boolean => {
// // // //     return userRoles.includes(role);
// // // //   };

// // // //   // Définition de hasPermission
// // // //   const hasPermission = (permission: string): boolean => {
// // // //     return userPermissions.includes(permission) || hasRole('admin');
// // // //   };

// // // //   // Définition de getUsers
// // // //   const getUsers = async () => {
// // // //     setLoading(true);
// // // //     setError(null);

// // // //     try {
// // // //       const { data, error: usersError } = await supabase.from('users').select('*');

// // // //       if (usersError) {
// // // //         console.error('Supabase users error:', usersError);
// // // //         setError('Failed to load users. Please try again.');
// // // //         return;
// // // //       }

// // // //       if (JSON.stringify(data) !== JSON.stringify(currentUsersRef.current)) {
// // // //         setUsers(data || []);
// // // //         currentUsersRef.current = data;
// // // //       }
// // // //     } catch (err: any) {
// // // //       console.error('Error in getUsers:', err);
// // // //       setError('An unexpected error occurred. Please try again.');
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   // Définition de updateUserRoles
// // // //   const updateUserRoles = async (userId: string, newRoles: string[]) => {
// // // //     setLoading(true);
// // // //     setError(null);

// // // //     try {
// // // //       // Supprimer les anciens rôles de l'utilisateur
// // // //       const { error: deleteError } = await supabase
// // // //         .from('user_roles')
// // // //         .delete()
// // // //         .eq('user_id', userId);

// // // //       if (deleteError) {
// // // //         console.error('Supabase delete roles error:', deleteError);
// // // //         setError('Failed to update user roles. Please try again.');
// // // //         return;
// // // //       }

// // // //       // Ajouter les nouveaux rôles de l'utilisateur
// // // //       const rolesToAdd = newRoles.map(roleName => ({
// // // //         user_id: userId,
// // // //         role_id: roleName, // Assure-toi que roleName est l'ID du rôle
// // // //       }));

// // // //       const { error: insertError } = await supabase
// // // //         .from('user_roles')
// // // //         .insert(rolesToAdd);

// // // //       if (insertError) {
// // // //         console.error('Supabase insert roles error:', insertError);
// // // //         setError('Failed to update user roles. Please try again.');
// // // //         return;
// // // //       }
// // // //     } catch (err: any) {
// // // //       console.error('Error in updateUserRoles:', err);
// // // //       setError('An unexpected error occurred. Please try again.');
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   // Définition de deleteUser
// // // //   const deleteUser = async (userId: string) => {
// // // //     setLoading(true);
// // // //     setError(null);

// // // //     try {
// // // //       const { error: deleteError } = await supabase
// // // //         .from('users')
// // // //         .delete()
// // // //         .eq('id', userId);

// // // //       if (deleteError) {
// // // //         console.error('Supabase delete user error:', deleteError);
// // // //         setError('Failed to delete user. Please try again.');
// // // //         return;
// // // //       }
// // // //     } catch (err: any) {
// // // //       console.error('Error in deleteUser:', err);
// // // //       setError('An unexpected error occurred. Please try again.');
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   // Définition de loadRolesAndPermissions
// // // //   const loadRolesAndPermissions = async () => {
// // // //     setLoading(true);
// // // //     setError(null);

// // // //     try {
// // // //       // Remplace ces requêtes par tes propres requêtes pour récupérer les rôles et permissions
// // // //       const { data: rolesData, error: rolesError } = await supabase.from('roles').select('name');
// // // //       const { data: permissionsData, error: permissionsError } = await supabase.from('permissions').select('name');

// // // //       if (rolesError || permissionsError) {
// // // //         console.error('Supabase roles/permissions error:', rolesError || permissionsError);
// // // //         setError('Failed to load roles and permissions. Please try again.');
// // // //         return;
// // // //       }

// // // //       const roles = rolesData.map(role => role.name);
// // // //       const permissions = permissionsData.map(permission => permission.name);

// // // //       if (JSON.stringify(roles) !== JSON.stringify(currentRolesRef.current)) {
// // // //         setUserRoles(roles);
// // // //         currentRolesRef.current = roles;
// // // //       }
// // // //       if (JSON.stringify(permissions) !== JSON.stringify(currentPermissionsRef.current)) {
// // // //         setUserPermissions(permissions);
// // // //         currentPermissionsRef.current = permissions;
// // // //       }
// // // //     } catch (err: any) {
// // // //       console.error('Error in loadRolesAndPermissions:', err);
// // // //       setError('An unexpected error occurred. Please try again.');
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     if (sessionInitialized) {
// // // //       loadRolesAndPermissions();
// // // //       getUsers();
// // // //     }
// // // //   }, [authUser?.id, sessionInitialized]);

// // // //   return {
// // // //     loading,
// // // //     error,
// // // //     hasRole,
// // // //     hasPermission,
// // // //     getUsers,
// // // //     updateUserRoles,
// // // //     deleteUser,
// // // //     users,
// // // //     userRoles,
// // // //     userPermissions,
// // // //   };
// // // // }
// // // // import { useState, useEffect, useCallback, useMemo } from 'react';
// // // // import { supabase } from '@/lib/supabase';
// // // // import { useAuth } from '@/hooks/useAuth';

// // // // export function useAdmin() {
// // // //   const { user: authUser, sessionInitialized } = useAuth();
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [error, setError] = useState<string | null>(null);
// // // //   const [userRoles, setUserRoles] = useState<string[]>([]);
// // // //   const [userPermissions, setUserPermissions] = useState<string[]>([]);

// // // //   const fetchUserRoles = useCallback(async () => {
// // // //     if (!authUser?.id || !sessionInitialized) return;
// // // //     setLoading(true);
// // // //     setError(null);
// // // //     try {
// // // //       const { data, error } = await supabase
// // // //         .from('user_roles')
// // // //         .select('roles (name)')
// // // //         .eq('user_id', authUser.id);
// // // //       if (error) {
// // // //         console.error('Supabase roles error:', error);
// // // //         setError(error.message);
// // // //       } else {
// // // //         const roles = data?.map(ur => ur.roles?.name).filter(Boolean) || []; // Ligne corrigée
// // // //         setUserRoles(roles);
// // // //       }
// // // //     } catch (err: any) {
// // // //       console.error('Error fetching user roles:', err);
// // // //       setError('Failed to load user roles.');
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   }, [authUser?.id, sessionInitialized]);

// // // //   const fetchUserPermissions = useCallback(async () => {
// // // //     if (!authUser?.id || !sessionInitialized) return;
// // // //     setLoading(true);
// // // //     setError(null);
// // // //     try {
// // // //       // Assuming you have a table 'role_permissions' linking roles to permissions
// // // //       const { data, error } = await supabase
// // // //         .from('role_permissions')
// // // //         .select('permissions (name)')
// // // //         .in('role_id', userRoles); // Use userRoles from state
// // // //       if (error) {
// // // //         console.error('Supabase permissions error:', error);
// // // //         setError(error.message);
// // // //       } else {
// // // //         const permissions = data?.map(rp => rp.permissions?.name || '') || [];
// // // //         setUserPermissions(permissions);
// // // //       }
// // // //     } catch (err: any) {
// // // //       console.error('Error fetching user permissions:', err);
// // // //       setError('Failed to load user permissions.');
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   }, [authUser?.id, sessionInitialized, userRoles]);

// // // //   useEffect(() => {
// // // //     fetchUserRoles();
// // // //     fetchUserPermissions();
// // // //   }, [fetchUserRoles, fetchUserPermissions]);

// // // //   const hasRole = useCallback((role: string): boolean => {
// // // //     return userRoles.includes(role);
// // // //   }, [userRoles]);

// // // //   const hasPermission = useCallback((permission: string): boolean => {
// // // //     return userPermissions.includes(permission) || hasRole('admin');
// // // //   }, [userPermissions, hasRole]);

// // // //   return useMemo(() => ({
// // // //     loading,
// // // //     error,
// // // //     hasRole,
// // // //     hasPermission,
// // // //     userRoles,
// // // //     userPermissions,
// // // //   }), [loading, error, hasRole, hasPermission, userRoles, userPermissions]);
// // // // }


// // // import { useState, useEffect, useCallback, useMemo } from 'react';
// // // import { supabase } from '@/lib/supabase';
// // // import { useAuth } from '@/hooks/useAuth';

// // // export function useAdmin() {
// // //   const { user: authUser, sessionInitialized } = useAuth();
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState<string | null>(null);
// // //   const [userRoles, setUserRoles] = useState<string[]>([]);
// // //   const [userPermissions, setUserPermissions] = useState<string[]>([]);

// // //   const fetchUserRoles = useCallback(async () => {
// // //     if (!authUser?.id || !sessionInitialized) return;
// // //     setLoading(true);
// // //     setError(null);
// // //     try {
// // //       const { data, error } = await supabase
// // //         .from('user_roles')
// // //         .select('roles (name)')
// // //         .eq('user_id', authUser.id);
// // //       if (error) {
// // //         console.error('Supabase roles error:', error);
// // //         setError(error.message);
// // //       } else {
// // //         const roles = data?.map(ur => ur.roles?.name).filter(Boolean) || [];
// // //         setUserRoles(roles);
// // //       }
// // //     } catch (err: any) {
// // //       console.error('Error fetching user roles:', err);
// // //       setError('Failed to load user roles.');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, [authUser?.id, sessionInitialized]);

// // //   const fetchUserPermissions = useCallback(async () => {
// // //     if (!authUser?.id || !sessionInitialized || userRoles.length === 0) return;
// // //     setLoading(true);
// // //     setError(null);
// // //     try {
// // //       // Assuming you have a table 'role_permissions' linking roles to permissions
// // //       const roleIds = await Promise.all(userRoles.map(async (role) => {
// // //         const { data } = await supabase
// // //           .from('roles')
// // //           .select('id')
// // //           .eq('name', role)
// // //           .single();
// // //         return data?.id;
// // //       }));

// // //       const { data, error } = await supabase
// // //         .from('role_permissions')
// // //         .select('permissions (name)')
// // //         .in('role_id', roleIds);
// // //       if (error) {
// // //         console.error('Supabase permissions error:', error);
// // //         setError(error.message);
// // //       } else {
// // //         const permissions = data?.map(rp => rp.permissions?.name || '') || [];
// // //         setUserPermissions(permissions);
// // //       }
// // //     } catch (err: any) {
// // //       console.error('Error fetching user permissions:', err);
// // //       setError('Failed to load user permissions.');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, [authUser?.id, sessionInitialized, userRoles]);

// // //   useEffect(() => {
// // //     if (sessionInitialized && authUser?.id) {
// // //       fetchUserRoles();
// // //       fetchUserPermissions();
// // //     }
// // //   }, [fetchUserRoles, fetchUserPermissions, sessionInitialized, authUser?.id]);

// // //   const hasRole = useCallback((role: string): boolean => {
// // //     return userRoles.includes(role);
// // //   }, [userRoles]);

// // //   const hasPermission = useCallback((permission: string): boolean => {
// // //     return userPermissions.includes(permission) || hasRole('admin');
// // //   }, [userPermissions, hasRole]);

// // //   return useMemo(() => ({
// // //     loading,
// // //     error,
// // //     hasRole,
// // //     hasPermission,
// // //     userRoles,
// // //     userPermissions,
// // //   }), [loading, error, hasRole, hasPermission, userRoles, userPermissions]);
// // // }

// // // import { useState, useEffect, useCallback, useMemo } from 'react';
// // // import { supabase } from '@/lib/supabase';
// // // import { useAuth } from '@/hooks/useAuth';

// // // export function useAdmin() {
// // //   const { user: authUser, sessionInitialized } = useAuth();
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState<string | null>(null);
// // //   const [userRoles, setUserRoles] = useState<string[]>([]);

// // //   const fetchUserRoles = useCallback(async () => {
// // //     console.log('🔍 Début fetchUserRoles');
// // //     console.log('User ID:', authUser?.id);
// // //     console.log('Session initialisée:', sessionInitialized);

// // //     if (!authUser?.id || !sessionInitialized) {
// // //       console.log('🚫 Conditions non remplies pour fetchUserRoles');
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     setError(null);

// // //     try {
// // //       // Requête pour récupérer les rôles de l'utilisateur
// // //       const { data, error } = await supabase
// // //         .from('user_roles')
// // //         .select('roles(name)')
// // //         .eq('user_id', authUser.id);

// // //       console.log('🧐 Résultat fetchUserRoles:', { data, error });

// // //       if (error) {
// // //         console.error('🔴 Erreur de récupération des rôles:', error);
// // //         setError(error.message);
// // //         setLoading(false);
// // //         return;
// // //       }

// // //       // Extraction des noms de rôles
// // //       const roles = data
// // //         ?.map(item => item.roles?.name)
// // //         .filter(Boolean) || [];

// // //       console.log('📋 Rôles récupérés:', roles);

// // //       setUserRoles(roles);
// // //       setLoading(false);

// // //     } catch (err: any) {
// // //       console.error('🚨 Erreur inattendue:', err);
// // //       setError(err.message || 'Erreur lors de la récupération des rôles');
// // //       setLoading(false);
// // //     }
// // //   }, [authUser?.id, sessionInitialized]);

// // //   useEffect(() => {
// // //     console.log('🔄 UseEffect useAdmin triggered');
// // //     fetchUserRoles();
// // //   }, [fetchUserRoles]);

// // //   const hasRole = useCallback((role: string): boolean => {
// // //     console.log(`🕵️ Vérification du rôle: ${role}`);
// // //     console.log('Rôles actuels:', userRoles);
// // //     return userRoles.includes(role);
// // //   }, [userRoles]);

// // //   return useMemo(() => ({
// // //     loading,
// // //     error,
// // //     hasRole,
// // //     userRoles,
// // //   }), [loading, error, hasRole, userRoles]);
// // // }
// // // import { useState, useEffect, useCallback, useMemo } from 'react';
// // // import { supabase } from '@/lib/supabase';
// // // import { useAuth } from '@/hooks/useAuth';

// // // export function useAdmin() {
// // //  const { user: authUser, sessionInitialized, session } = useAuth();
// // //  const [loading, setLoading] = useState(true);
// // //  const [error, setError] = useState<string | null>(null);
// // //  const [userRoles, setUserRoles] = useState<string[]>([]);
// // //  const [isAdmin, setIsAdmin] = useState(false);

// // //  const fetchUserRoles = useCallback(async () => {
// // //    console.log('🔍 Début fetchUserRoles', {
// // //      userId: authUser?.id,
// // //      sessionInitialized,
// // //      hasSession: !!session
// // //    });

// // //    // Modification clé : ajouter une vérification sur session
// // //    if (!session || !authUser?.id) {
// // //      console.log('🚫 Conditions non remplies pour fetchUserRoles');
// // //      setLoading(false);
// // //      return;
// // //    }

// // //    setLoading(true);
// // //    setError(null);
// // //    try {
// // //      const { data, error } = await supabase
// // //        .from('user_roles')
// // //        .select('roles(name)')
// // //        .eq('user_id', authUser.id)
// // //        .single(); // Ajout de .single() pour simplifier

// // //      console.log('🧐 Résultat fetchUserRoles:', { data, error });

// // //      if (error) {
// // //        console.error('🔴 Erreur de récupération des rôles:', error);
// // //        setError(error.message);
// // //        setLoading(false);
// // //        return;
// // //      }

// // //      const role = data?.roles?.name;
// // //      console.log('📋 Rôle récupéré:', role);

// // //      const roles = role ? [role] : [];
// // //      setUserRoles(roles);
// // //      setIsAdmin(roles.includes('admin'));
// // //      setLoading(false);
// // //    } catch (err: any) {
// // //      console.error('🚨 Erreur inattendue:', err);
// // //      setError(err.message || 'Erreur lors de la récupération des rôles');
// // //      setLoading(false);
// // //    }
// // //  }, [authUser?.id, session]);

// // //  useEffect(() => {
// // //    console.log('🔄 UseEffect useAdmin triggered');
// // //    fetchUserRoles();
// // //  }, [fetchUserRoles]);

// // //  const hasRole = useCallback((role: string): boolean => {
// // //    console.log(`🕵️ Vérification du rôle: ${role}`);
// // //    console.log('Rôles actuels:', userRoles);
// // //    return userRoles.includes(role);
// // //  }, [userRoles]);

// // //  return useMemo(() => ({
// // //    loading,
// // //    error,
// // //    hasRole,
// // //    userRoles,
// // //    isAdmin,
// // //  }), [loading, error, hasRole, userRoles, isAdmin]);
// // // }
// // import { useState, useEffect, useCallback, useMemo } from 'react';
// // import { supabase } from '@/lib/supabase';
// // import { useAuth } from '@/hooks/useAuth';

// // export function useAdmin() {
// //   const { user: authUser, session } = useAuth();
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);
// //   const [userRoles, setUserRoles] = useState<string[]>([]);

// //   const fetchUserRoles = useCallback(async () => {
// //     console.log('🔍 Début fetchUserRoles', {
// //       userId: authUser?.id,
// //       hasSession: !!session,
// //     });

// //     if (!authUser?.id || !session) {
// //       console.log('🚫 Conditions non remplies pour fetchUserRoles');
// //       setLoading(false);
// //       return;
// //     }

// //     setLoading(true);
// //     setError(null);

// //     try {
// //       const { data: userRolesData, error: userRolesError } = await supabase
// //         .from('user_roles')
// //         .select('roles (name)')
// //         .eq('user_id', authUser.id);

// //       console.log('🧐 Résultat fetchUserRoles:', { data: userRolesData, error: userRolesError });

// //       if (userRolesError) {
// //         console.error('🔴 Erreur de récupération des rôles:', userRolesError);
// //         throw new Error(`Erreur lors de la récupération des rôles: ${userRolesError.message}`);
// //       }

// //       const roles = userRolesData?.map((item) => item.roles?.name).filter(Boolean) || [];
// //       console.log('📋 Rôles récupérés:', roles);
// //       setUserRoles(roles);
// //     } catch (err: any) {
// //       console.error('🚨 Erreur inattendue:', err);
// //       setError(err.message || 'Erreur lors de la récupération des rôles');
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [authUser?.id, session]);

// //   useEffect(() => {
// //     console.log('🔄 UseEffect useAdmin triggered');
// //     fetchUserRoles();
// //   }, [fetchUserRoles]);

// //   const hasRole = useCallback(async (role: string): Promise<boolean> => {
// //     if (!authUser?.id) return false;

// //     try {
// //       const { data, error } = await supabase
// //         .rpc('hasrole', { role_name: role });

// //       if (error) {
// //         console.error('🔴 Erreur lors de la vérification du rôle:', error);
// //         throw new Error(`Erreur lors de la vérification du rôle: ${error.message}`);
// //       }
// //       return !!data;
// //     } catch (err: any) {
// //       console.error('🚨 Erreur lors de la vérification du rôle:', err);
// //       return false;
// //     }
// //   }, [authUser?.id]);

// //   return useMemo(() => ({
// //     loading,
// //     error,
// //     hasRole,
// //     userRoles,
// //   }), [loading, error, hasRole, userRoles]);
// // } pas d'admin pour le moment


// // // Dans project/hooks/useAdmin.ts
// // import { useState, useEffect, useCallback, useMemo } from 'react';
// // import { supabase } from '@/lib/supabase';
// // import { useAuth } from '@/hooks/useAuth'; // Assurez-vous d'importer useAuth

// // export function useAdmin() {
// //   // Récupérez TOUS les états pertinents de useAuth
// //   const { user: authUser, session, sessionInitialized, loading: authLoading } = useAuth();
// //   const [loading, setLoading] = useState(true); // Le chargement propre à useAdmin
// //   const [error, setError] = useState<string | null>(null);
// //   const [userRoles, setUserRoles] = useState<string[]>([]);

// //   const fetchUserRoles = useCallback(async () => {
// //     console.log('🔍 Tentative fetchUserRoles', {
// //       userId: authUser?.id,
// //       sessionInitialized,
// //       authLoading,
// //       hasSession: !!session,
// //     });

// //     // **Condition CLÉ:** Attendre que l'auth soit chargée ET initialisée ET qu'il y ait un utilisateur ET une session
// //     // Si authLoading est true OU si la session n'est pas initialisée OU s'il n'y a pas d'utilisateur OU pas de session, on attend.
// //     if (authLoading || !sessionInitialized || !authUser?.id || !session) {
// //       console.log('🚫 Conditions non remplies OU chargement auth en cours pour fetchUserRoles');
// //       // Important: Ne mettre setLoading(false) que si l'auth est prête mais qu'il manque l'utilisateur/session.
// //       // Si authLoading est true, on veut que useAdmin reste en état de chargement.
// //       if (sessionInitialized && !authLoading) {
// //           setLoading(false); // L'auth est prête, mais pas de user/session, donc useAdmin n'est plus en chargement.
// //           setUserRoles([]); // Assure que les rôles sont vides si on ne peut pas les charger
// //       }
// //       return; // Sortir tôt
// //     }

// //     // Si on arrive ici, l'auth est prête et on a un utilisateur/session
// //     console.log('✅ Conditions remplies pour fetchUserRoles. Lancement de la requête...');
// //     setLoading(true); // Commencer le chargement PROPRE à useAdmin (récupération des rôles)
// //     setError(null);

// //     try {
// //       const { data: userRolesData, error: userRolesError } = await supabase
// //         .from('user_roles')
// //         .select('roles (name)')
// //         .eq('user_id', authUser.id);

// //       console.log('🧐 Résultat fetchUserRoles:', { data: userRolesData, error: userRolesError });

// //       if (userRolesError) {
// //         console.error('🔴 Erreur de récupération des rôles:', userRolesError);
// //         throw new Error(`Erreur lors de la récupération des rôles: ${userRolesError.message}`);
// //       }

// //       const roles = userRolesData?.map((item) => item.roles?.name).filter(Boolean) || [];
// //       console.log('📋 Rôles récupérés:', roles);
// //       setUserRoles(roles); // Mettre à jour l'état des rôles

// //     } catch (err: any) {
// //       console.error('🚨 Erreur inattendue dans fetchUserRoles:', err);
// //       setError(err.message || 'Erreur lors de la récupération des rôles');
// //       setUserRoles([]); // Réinitialiser les rôles en cas d'erreur
// //     } finally {
// //       setLoading(false); // Terminer le chargement des rôles
// //     }
// //   }, [authUser?.id, session, sessionInitialized, authLoading]); // Inclure TOUTES les dépendances pertinentes

// //   useEffect(() => {
// //     console.log('🔄 UseEffect useAdmin triggered (dépendances changées)');
// //     // L'appel à fetchUserRoles ne s'exécutera que lorsque ses dépendances seront prêtes
// //     fetchUserRoles();
// //   }, [fetchUserRoles]); // fetchUserRoles est recréé quand ses dépendances (authUser?.id, session, sessionInitialized, authLoading) changent

// //   const hasRole = useCallback(async (role: string): Promise<boolean> => {
// //     // Vérification initiale : a-t-on un utilisateur authentifié ?
// //     if (!authUser?.id || !session) {
// //         console.log(`🚫 Vérification hasRole(${role}) échouée: Pas d'utilisateur/session`);
// //         return false;
// //     }

// //     // Appel RPC (assurez-vous que la fonction SQL 'hasrole' existe et est correcte)
// //     console.log(`🕵️ Vérification hasRole(${role}) via RPC`);
// //     try {
// //       const { data, error } = await supabase
// //         .rpc('hasrole', { role_name: role }); // Nom confirmé par vous

// //       if (error) {
// //         console.error(`🔴 Erreur RPC hasrole(${role}):`, error);
// //         return false; // Retourner false en cas d'erreur RPC
// //       }
// //       console.log(`✅ Résultat RPC hasrole(${role}):`, !!data);
// //       return !!data;
// //     } catch (err: any) {
// //       console.error(`🚨 Erreur lors de l'appel RPC hasrole(${role}):`, err);
// //       return false;
// //     }
// //   }, [authUser?.id, session]); // Dépend de l'existence d'un utilisateur/session

// //   // Mémoriser la valeur de retour pour éviter les re-renders inutiles
// //   return useMemo(() => ({
// //     loading: loading || authLoading, // Le hook admin est en chargement si l'auth l'est aussi ou si les rôles sont en cours de chargement
// //     error,
// //     hasRole,
// //     userRoles,
// //   }), [loading, authLoading, error, hasRole, userRoles]);
// // }

// // // Dans project/hooks/useAdmin.ts
// // import { useState, useEffect, useCallback, useMemo } from 'react';
// // import { supabase } from '@/lib/supabase';
// // import { useAuth } from '@/hooks/useAuth'; // Assurez-vous d'importer useAuth

// // export function useAdmin() {
// //   // Récupérez TOUS les états pertinents de useAuth
// //   const { user: authUser, session, sessionInitialized, loading: authLoading } = useAuth();
// //   const [loading, setLoading] = useState(true); // Le chargement propre à useAdmin
// //   const [error, setError] = useState<string | null>(null);
// //   const [userRoles, setUserRoles] = useState<string[]>([]);

// //   const fetchUserRoles = useCallback(async () => {
// //     console.log('🔍 Tentative fetchUserRoles', {
// //       userId: authUser?.id,
// //       sessionInitialized,
// //       authLoading,
// //       hasSession: !!session,
// //     });

// //     if (authLoading || !sessionInitialized || !authUser?.id || !session) {
// //       console.log('🚫 Conditions non remplies OU chargement auth en cours pour fetchUserRoles');
// //       if (sessionInitialized && !authLoading) {
// //           setLoading(false);
// //           setUserRoles([]);
// //       }
// //       return;
// //     }

// //     console.log('✅ Conditions remplies pour fetchUserRoles. Lancement de la requête...');
// //     setLoading(true);
// //     setError(null);

// //     try {
// //       const { data: userRolesData, error: userRolesError } = await supabase
// //         .from('user_roles')
// //         .select('roles (name)')
// //         .eq('user_id', authUser.id);

// //       console.log('🧐 Résultat fetchUserRoles:', { data: userRolesData, error: userRolesError });

// //       if (userRolesError) {
// //         console.error('🔴 Erreur de récupération des rôles:', userRolesError);
// //         throw new Error(`Erreur lors de la récupération des rôles: ${userRolesError.message}`);
// //       }

// //       const roles = userRolesData?.map((item) => item.roles?.name).filter(Boolean) || [];
// //       console.log('📋 Rôles récupérés:', roles);
// //       setUserRoles(roles);

// //     } catch (err: any) {
// //       console.error('🚨 Erreur inattendue dans fetchUserRoles:', err);
// //       setError(err.message || 'Erreur lors de la récupération des rôles');
// //       setUserRoles([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [authUser?.id, session, sessionInitialized, authLoading]);

// //   useEffect(() => {
// //     console.log('🔄 UseEffect useAdmin triggered (dépendances changées)');
// //     fetchUserRoles();
// //   }, [fetchUserRoles]);

// //   // Fonction pour vérifier un rôle (Appel RPC)
// //   const hasRole = useCallback(async (role: string): Promise<boolean> => {
// //     if (!authUser?.id || !session) {
// //         console.log(`🚫 Vérification hasRole(${role}) échouée: Pas d'utilisateur/session`);
// //         return false;
// //     }
// //     console.log(`🕵️ Vérification hasRole(${role}) via RPC`);
// //     try {
// //       // !! Vérifiez si c'est 'hasrole' ou 'has_role' dans votre DB !!
// //       const { data, error } = await supabase.rpc('hasrole', { role_name: role });
// //       if (error) {
// //         console.error(`🔴 Erreur RPC hasrole(${role}):`, error);
// //         return false;
// //       }
// //       console.log(`✅ Résultat RPC hasrole(${role}):`, !!data);
// //       return !!data;
// //     } catch (err: any) {
// //       console.error(`🚨 Erreur lors de l'appel RPC hasrole(${role}):`, err);
// //       return false;
// //     }
// //   }, [authUser?.id, session]);

// //   // ***** NOUVELLE FONCTION AJOUTÉE *****
// //   // Fonction pour vérifier une permission (Appel RPC vers votre fonction SQL)
// //   const hasPermission = useCallback(async (permission: string): Promise<boolean> => {
// //     if (!authUser?.id || !session) {
// //       console.log(`🚫 Vérification hasPermission(${permission}) échouée: Pas d'utilisateur/session`);
// //       return false;
// //     }
// //     console.log(`🕵️ Vérification hasPermission(${permission}) via RPC`);
// //     try {
// //       // Appel RPC vers votre fonction SQL check_user_permission
// //       const { data, error } = await supabase
// //         .rpc('check_user_permission', { permission_name: permission }); // <-- Appel de votre fonction SQL

// //       if (error) {
// //         console.error(`🔴 Erreur RPC check_user_permission(${permission}):`, error);
// //         return false; // Retourner false en cas d'erreur RPC
// //       }
// //       console.log(`✅ Résultat RPC check_user_permission(${permission}):`, !!data);
// //       return !!data; // La fonction SQL retourne true/false
// //     } catch (err: any) {
// //       console.error(`🚨 Erreur lors de l'appel RPC check_user_permission(${permission}):`, err);
// //       return false;
// //     }
// //   }, [authUser?.id, session]);
// //   // ***** FIN DE LA NOUVELLE FONCTION *****

// //   // Mémoriser la valeur de retour pour éviter les re-renders inutiles
// //   return useMemo(() => ({
// //     loading: loading || authLoading,
// //     error,
// //     hasRole,
// //     hasPermission, // <-- Exporter la fonction ajoutée
// //     userRoles,
// //   }), [loading, authLoading, error, hasRole, hasPermission, userRoles]); // <-- Ajouter hasPermission aux dépendances
// // }





// // Dans project/hooks/useAdmin.ts
// import { useState, useEffect, useCallback, useMemo } from 'react';
// import { supabase } from '@/lib/supabase';
// import { useAuth } from '@/hooks/useAuth'; // Assurez-vous d'importer useAuth

// export function useAdmin() {
//     const { user: authUser, session, sessionInitialized, loading: authLoading } = useAuth();
//     const [loadingRoles, setLoadingRoles] = useState(true); // Chargement spécifique aux rôles
//     const [rolesError, setRolesError] = useState<string | null>(null);
//     const [userRoles, setUserRoles] = useState<string[]>([]); // Stocke juste les noms

//     const fetchUserRoles = useCallback(async () => {
//         if (!sessionInitialized || authLoading || !authUser?.id) {
//             if (sessionInitialized && !authLoading && !authUser?.id) { setUserRoles([]); setLoadingRoles(false); }
//             else { setLoadingRoles(true); }
//             return;
//         }
//         console.log('[useAdmin] Fetching user roles for:', authUser.id);
//         setLoadingRoles(true); setRolesError(null);
//         try {
//             // Note: Utiliser get_user_roles pourrait être plus cohérent si elle existe et est fiable
//             // Mais la requête directe est aussi bien.
//             const { data, error } = await supabase
//                 .from('user_roles')
//                 .select('roles!inner(name)') // Jointure interne pour être sûr que le rôle existe
//                 .eq('user_id', authUser.id);

//             if (error) throw error;
//             const roles = data?.map((item) => item.roles?.name).filter(Boolean) as string[] || [];
//             console.log('[useAdmin] Roles fetched:', roles);
//             setUserRoles(roles);
//         } catch (err: any) { console.error('🚨 Error fetching user roles:', err); setRolesError(err.message || 'Erreur rôles'); setUserRoles([]); }
//         finally { setLoadingRoles(false); }
//     }, [authUser?.id, sessionInitialized, authLoading]); // Dépend de l'état d'authentification

//     useEffect(() => {
//         console.log('[useAdmin] Auth state change detected, fetching roles.');
//         fetchUserRoles();
//     }, [fetchUserRoles]); // Se redéclenche si l'état d'authentification change

//     // --- hasRole SIMPLIFIÉE ---
//     const hasRole = useCallback((role: string): boolean => {
//         const check = userRoles.includes(role); // Vérifie dans l'état local
//         console.log(`[useAdmin] Checking hasRole('${role}') against state [${userRoles.join(', ')}]:`, check);
//         return check;
//     }, [userRoles]); // Dépend de userRoles
//     // --------------------------

//     // hasPermission (inchangée, utilise RPC check_user_permission)
//     const hasPermission = useCallback(async (permission: string): Promise<boolean> => { /* ... comme avant ... */ if (!authUser?.id) return false; try { const { data, error } = await supabase.rpc('check_user_permission', { permission_name: permission }); if (error) { console.error(`🔴 RPC Error check_user_permission(${permission}):`, error); return false; } return !!data; } catch (err: any) { console.error(`🚨 RPC Call Error check_user_permission(${permission}):`, err); return false; } }, [authUser?.id]);

//     // Retour mémorisé
//     return useMemo(() => ({
//         loading: authLoading || loadingRoles, // Le hook est en chargement tant que l'auth OU les rôles chargent
//         error: rolesError, // Retourne l'erreur spécifique au chargement des rôles
//         hasRole,          // La fonction synchrone simplifiée
//         hasPermission,
//         userRoles,        // La liste des rôles
//     }), [authLoading, loadingRoles, rolesError, hasRole, hasPermission, userRoles]); // Inclure hasPermission ici aussi
// }





// // Dans PROJECT/hooks/useAdmin.ts
// import { useCallback, useMemo } from 'react';
// // Importez UNIQUEMENT useAuth pour obtenir les rôles et l'état de chargement
// import { useAuth } from '@/hooks/useAuth';
// // Importez supabase UNIQUEMENT si hasPermission est utilisé
// import { supabase } from '@/lib/supabase';


// export function useAdmin() {
//     // Obtenir l'état global depuis useAuth (source de vérité)
//     const { user, sessionInitialized, isLoading: authIsLoading, userRoles } = useAuth();

//     // --- hasRole utilise directement les userRoles de useAuth ---
//     const hasRole = useCallback((role: string): boolean => {
//         const check = userRoles.includes(role);
//         console.log(`[useAdmin simplified] Checking hasRole('${role}') using useAuth roles [${userRoles.join(', ')}]:`, check);
//         return check;
//     }, [userRoles]); // Dépend seulement des rôles de useAuth
//     // ---------------------------------------------------------

//     // --- hasPermission reste si nécessaire ---
//     // Si vous n'utilisez PAS hasPermission, vous pouvez supprimer cette fonction
//     // et même supprimer l'import de supabase de ce fichier.
//     const hasPermission = useCallback(async (permission: string): Promise<boolean> => {
//        if (!user?.id) return false;
//        try {
//            const { data, error } = await supabase.rpc('check_user_permission', { p_user_id: user.id, p_permission_name: permission }); // Assurez-vous que les params RPC sont corrects
//            if (error) { console.error(`🔴 RPC Error check_user_permission(${permission}):`, error); return false; }
//            return !!data;
//        } catch (err: any) { console.error(`🚨 RPC Call Error check_user_permission(${permission}):`, err); return false; }
//     }, [user?.id]);
//     // --------------------------------------

//     // Retourne les fonctions utiles et l'état de chargement global
//     return useMemo(() => ({
//         // Le chargement est simplement celui de useAuth
//         loading: !sessionInitialized || authIsLoading,
//         // Pas d'erreur spécifique aux rôles ici, useAuth gère les erreurs globales
//         error: null, // Ou propagez l'erreur de useAuth si nécessaire : error: authError
//         hasRole,
//         hasPermission, // Inclure seulement si utilisé
//         userRoles,     // Exporter les rôles de useAuth pour référence si besoin
//     }), [sessionInitialized, authIsLoading, hasRole, hasPermission, userRoles]);
// }


import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export function useAdmin() {
    // Get global state from useAuth (source of truth)
    const { user, sessionInitialized, loading: authIsLoading, userRoles, error: authError } = useAuth();
    
    // Add state for tracking permission checks
    const [permissionCache, setPermissionCache] = useState<Record<string, boolean>>({});
    const [isCheckingPermission, setIsCheckingPermission] = useState(false);
    
    // --- hasRole uses userRoles directly from useAuth ---
    const hasRole = useCallback((role: string | string[]): boolean => {
        if (Array.isArray(role)) {
            // If any of the roles match, return true
            return role.some(r => userRoles.includes(r));
        }
        return userRoles.includes(role);
    }, [userRoles]);
    
    // --- checkPermission - the async version ---
    const checkPermission = useCallback(async (permission: string): Promise<boolean> => {
        // Check for user session before making the call
        const currentUser = user;
        if (!currentUser?.id) {
            console.log("[useAdmin - checkPermission] No user session, returning false.");
            return false;
        }
        
        // Check if we already have this permission in cache
        if (permissionCache[permission] !== undefined) {
            return permissionCache[permission];
        }
        
        setIsCheckingPermission(true);
        
        try {
            console.log(`[useAdmin - checkPermission] Calling RPC check_user_permission with permission_name: ${permission}`);
            
            // Fixed RPC call: pass ONLY the permission_name parameter
            const { data, error } = await supabase.rpc('check_user_permission', {
                permission_name: permission
            });
            
            // Handle error returned by Supabase
            if (error) {
                console.error(`🔴 RPC Error check_user_permission(${permission}):`, error);
                setIsCheckingPermission(false);
                return false;
            }
            
            // Update cache with result
            setPermissionCache(prev => ({
                ...prev,
                [permission]: !!data
            }));
            
            setIsCheckingPermission(false);
            return !!data;
        } catch (err: any) {
            // Handle network or other errors during fetch call
            console.error(`🚨 Network/Call Error check_user_permission(${permission}):`, err);
            setIsCheckingPermission(false);
            return false;
        }
    }, [user?.id, permissionCache]);
    
    // --- hasPermission - synchronous version that uses the cache ---
    const hasPermission = useCallback((permission: string): boolean => {
        // Return from cache if available
        return permissionCache[permission] === true;
    }, [permissionCache]);
    
    // Return useful functions and global loading state
    return useMemo(() => ({
        loading: !sessionInitialized || authIsLoading || isCheckingPermission,
        error: authError,
        hasRole,
        hasPermission,      // Synchronous version
        checkPermission,    // Async version
        userRoles,
        permissionCache,    // Expose the cache in case needed
    }), [
        sessionInitialized, 
        authIsLoading, 
        authError, 
        hasRole, 
        hasPermission,
        checkPermission,
        userRoles,
        permissionCache,
        isCheckingPermission
    ]);
}



