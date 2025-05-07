/*
  # Fix Admin Access and Permissions
  
  1. Changes
    - Add function to get users for admin
    - Fix admin role check
    - Add proper RLS policies
    
  2. Security
    - Maintain secure access control
    - Add proper admin checks
*/

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS get_users_for_admin();
DROP FUNCTION IF EXISTS is_admin();

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  );
$$;

-- Create function to get all users (admin only)
CREATE OR REPLACE FUNCTION get_users_for_admin()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  avatar_url text,
  city text,
  roles jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if requesting user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    p.full_name,
    p.avatar_url,
    p.city,
    COALESCE(
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'id', r.id,
          'name', r.name,
          'description', r.description
        )
      ) FILTER (WHERE r.id IS NOT NULL),
      '[]'::jsonb
    ) as roles
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  LEFT JOIN user_roles ur ON ur.user_id = au.id
  LEFT JOIN roles r ON r.id = ur.role_id
  GROUP BY au.id, au.email, p.full_name, p.avatar_url, p.city
  ORDER BY au.created_at DESC;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_for_admin TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Ensure admin role exists
INSERT INTO roles (name, description)
VALUES ('admin', 'Administrator with full access')
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description;

-- Ensure admin@3ommy.com has admin role if they exist
DO $$
DECLARE
  v_user_id uuid;
  v_admin_role_id uuid;
BEGIN
  -- Get admin user ID if exists
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'admin@3ommy.com';

  -- Get admin role ID
  SELECT id INTO v_admin_role_id
  FROM roles
  WHERE name = 'admin';

  -- If both exist, ensure admin role is assigned
  IF v_user_id IS NOT NULL AND v_admin_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (v_user_id, v_admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
END $$;