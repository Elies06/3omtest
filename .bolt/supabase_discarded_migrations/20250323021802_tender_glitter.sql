/*
  # Fix Admin Queries and Permissions
  
  1. Changes
    - Add proper RLS policies for admin access
    - Fix user role queries
    - Add necessary indexes
    
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

-- Update RLS policies for profiles
CREATE POLICY "profiles_select"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    is_admin()
  );

-- Update RLS policies for user_roles
CREATE POLICY "user_roles_select"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    is_admin()
  );

CREATE POLICY "user_roles_all"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create necessary indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;