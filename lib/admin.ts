import { supabase } from './supabase';

export async function checkAdminUser() {
  try {
    // First check if the user exists in auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Error getting current user:', authError);
      return {
        exists: false,
        error: authError
      };
    }

    if (!user) {
      return {
        exists: false,
        error: null
      };
    }

    // Then check if they have the admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select(`
        roles!inner(
          name
        )
      `)
      .eq('user_id', user.id)
      .eq('roles.name', 'admin')
      .single();

    // Ignore "no rows returned" error as it's expected for non-admin users
    if (roleError && roleError.code !== 'PGRST116') {
      console.error('Error checking admin role:', roleError);
      return {
        exists: false,
        error: roleError
      };
    }

    // If no admin role found and this is the admin email, create and assign the role
    if (!roleData && user.email === 'admin@3ommy.com') {
      // First check if admin role exists
      const { data: adminRole, error: adminRoleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'admin')
        .single();

      if (adminRoleError && adminRoleError.code !== 'PGRST116') {
        console.error('Error checking admin role:', adminRoleError);
        return {
          exists: false,
          error: adminRoleError
        };
      }

      let adminRoleId;

      // Create admin role if it doesn't exist
      if (!adminRole) {
        const { data: newRole, error: createRoleError } = await supabase
          .from('roles')
          .insert({
            name: 'admin',
            description: 'Administrator with full access'
          })
          .select()
          .single();

        if (createRoleError) {
          console.error('Error creating admin role:', createRoleError);
          return {
            exists: false,
            error: createRoleError
          };
        }

        adminRoleId = newRole.id;

        // Create default permissions
        const { error: permError } = await supabase
          .from('permissions')
          .insert([
            { name: 'manage_users', description: 'Can manage users' },
            { name: 'manage_roles', description: 'Can manage roles and permissions' },
            { name: 'manage_settings', description: 'Can manage system settings' },
            { name: 'view_analytics', description: 'Can view analytics' },
            { name: 'moderate_content', description: 'Can moderate content' }
          ]);

        if (permError) {
          console.error('Error creating permissions:', permError);
        }

        // Assign all permissions to admin role
        const { data: permissions } = await supabase
          .from('permissions')
          .select('id');

        if (permissions) {
          const rolePermissions = permissions.map(p => ({
            role_id: adminRoleId,
            permission_id: p.id
          }));

          const { error: rpError } = await supabase
            .from('role_permissions')
            .insert(rolePermissions);

          if (rpError) {
            console.error('Error assigning permissions:', rpError);
          }
        }
      } else {
        adminRoleId = adminRole.id;
      }

      // Assign admin role to user
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role_id: adminRoleId
        });

      if (assignError) {
        console.error('Error assigning admin role:', assignError);
        return {
          exists: false,
          error: assignError
        };
      }

      return {
        exists: true,
        error: null,
        user
      };
    }

    return {
      exists: !!roleData,
      error: null,
      user: roleData ? user : null
    };
  } catch (error) {
    console.error('Error in checkAdminUser:', error);
    return {
      exists: false,
      error
    };
  }
}