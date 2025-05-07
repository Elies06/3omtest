/*
  # Fix Admin Access and User Management
  
  1. Changes
    - Add RPC functions for admin checks
    - Fix user role queries
    - Update RLS policies
    
  2. Security
    - Enable RLS
    - Add proper policies
    - Ensure secure role management
*/

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  );
END;
$$;

-- Create function to get user roles with permissions
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid uuid)
RETURNS TABLE (
  role_name text,
  permissions text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if requesting user is admin or requesting their own roles
  IF NOT (is_admin() OR auth.uid() = user_uuid) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT 
    r.name,
    array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) as permissions
  FROM roles r
  JOIN user_roles ur ON ur.role_id = r.id
  LEFT JOIN role_permissions rp ON rp.role_id = r.id
  LEFT JOIN permissions p ON p.id = rp.permission_id
  WHERE ur.user_id = user_uuid
  GROUP BY r.name;
END;
$$;

-- Update RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "profiles_select"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "profiles_insert"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "profiles_update"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "profiles_delete"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Create policies for user_roles
CREATE POLICY "user_roles_select"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "user_roles_all"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_roles TO authenticated;

-- Ensure admin role exists and is assigned
DO $$
DECLARE
  v_admin_role_id uuid;
  v_admin_user_id uuid;
BEGIN
  -- Create admin role if it doesn't exist
  INSERT INTO roles (name, description)
  VALUES ('admin', 'Administrator with full access')
  ON CONFLICT (name) DO UPDATE 
  SET description = EXCLUDED.description
  RETURNING id INTO v_admin_role_id;

  -- Get admin user ID
  SELECT id INTO v_admin_user_id
  FROM auth.users
  WHERE email = 'admin@3ommy.com';

  -- If admin user exists, ensure they have admin role
  IF v_admin_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (v_admin_user_id, v_admin_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
END $$;