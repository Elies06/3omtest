import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface Permission {
  name: string;
}

export function useAdmin() {
  const { user: authUser, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (authUser && session) {
      loadUserRolesAndPermissions();
    } else {
      setLoading(false);
      setUserRoles([]);
      setUserPermissions([]);
    }
  }, [authUser, session]);

  const loadUserRolesAndPermissions = async () => {
    try {
      if (!authUser || !session) {
        throw new Error('Not authenticated');
      }

      // Get user roles and permissions using RPC function
      const { data: isAdminResult, error: isAdminError } = await supabase
        .rpc('is_admin');

      if (isAdminError) throw isAdminError;

      // Get user roles and permissions
      const { data: userRolesData, error: userRolesError } = await supabase
        .rpc('get_user_roles', { user_uuid: authUser.id });

      if (userRolesError) throw userRolesError;

      const roles = userRolesData?.map(ur => ur.role_name) || [];
      const permissions = userRolesData?.flatMap(ur => ur.permissions || []) || [];

      setUserRoles(roles);
      setUserPermissions(permissions);

    } catch (err: any) {
      console.error('Error loading roles and permissions:', err);
      setError(err.message || 'Error loading roles and permissions');
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission) || hasRole('admin');
  };

  const getUsers = async () => {
    try {
      if (!authUser || !session) {
        throw new Error('Not authenticated');
      }

      if (!hasRole('admin')) {
        throw new Error('Unauthorized access');
      }

      // 1. Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          avatar_url,
          city
        `);

      if (profilesError) throw profilesError;

      // 2. Call the Edge Function to get users with roles
      const { data: usersWithRoles, error: usersWithRolesError } = await supabase.functions.invoke('get-users-with-roles', {
        body: { userIds: profiles.map(p => p.user_id) },
      });

      if (usersWithRolesError) {
        console.error('Error calling Edge Function:', usersWithRolesError);
        throw new Error('Error loading users with roles');
      }

      // 3. Combine the data
      const formattedUsers = profiles?.map(profile => {
        const userData = usersWithRoles?.data?.find(user => user.id === profile.user_id);

        return {
          id: profile.user_id,
          email: userData?.email || 'N/A',
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          city: profile.city,
          created_at: userData?.created_at || 'N/A',
          user_roles: userData?.roles || []
        };
      }) || [];

      setUsers(formattedUsers);
      return formattedUsers;

    } catch (err: any) {
      console.error('Error loading users:', err);
      throw new Error(err.message || 'Error loading users');
    }
  };

  const updateUserRoles = async (userId: string, roles: string[]) => {
    try {
      if (!hasRole('admin')) {
        throw new Error('Unauthorized access');
      }

      // Get role IDs
      const { data: roleIds, error: roleError } = await supabase
        .from('roles')
        .select('id, name')
        .in('name', roles);

      if (roleError) throw roleError;

      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Insert new roles
      if (roleIds && roleIds.length > 0) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(
            roleIds.map(role => ({
              user_id: userId,
              role_id: role.id
            }))
          );

        if (insertError) throw insertError;
      }

      return true;
    } catch (err: any) {
      console.error('Error updating user roles:', err);
      throw new Error(err.message || 'Error updating user roles');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      if (!hasRole('admin')) {
        throw new Error('Unauthorized access');
      }

      const { error } = await supabase
        .from('auth.users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      return true;
    } catch (err: any) {
      console.error('Error deleting user:', err);
      throw new Error(err.message || 'Error deleting user');
    }
  };

    return {
    loading,
    error,
    hasRole,
    hasPermission,
    getUsers,
    updateUserRoles,
    deleteUser,
    users,
    userRoles,
    userPermissions,
  };
}
