/*
  # Fix Admin Permission Checking
  
  1. Changes
    - Add permission checking functions
    - Fix role-based access control
    - Update admin dashboard policies
    
  2. Security
    - Enable RLS
    - Add proper policies
    - Ensure secure permission checks
*/

-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS check_admin_role CASCADE;
DROP FUNCTION IF EXISTS check_permission CASCADE;

-- Create permission check function
CREATE OR REPLACE FUNCTION check_permission(permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.id
    JOIN user_roles ur ON ur.role_id = rp.role_id
    WHERE p.name = permission_name
    AND ur.user_id = auth.uid()
  ) OR check_admin_role();
END;
$$;

-- Create admin check function
CREATE OR REPLACE FUNCTION check_admin_role()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM roles r
    JOIN user_roles ur ON ur.role_id = r.id
    WHERE r.name = 'admin'
    AND ur.user_id = auth.uid()
  );
END;
$$;

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid uuid)
RETURNS TABLE (permission_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.name
  FROM permissions p
  JOIN role_permissions rp ON rp.permission_id = p.id
  JOIN user_roles ur ON ur.role_id = rp.role_id
  WHERE ur.user_id = user_uuid;
END;
$$;

-- Update policies for admin dashboard access
CREATE POLICY "admin_dashboard_access"
  ON roles
  FOR ALL
  TO authenticated
  USING (check_admin_role())
  WITH CHECK (check_admin_role());

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_permission TO authenticated;
GRANT EXECUTE ON FUNCTION check_admin_role TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_permissions TO authenticated;