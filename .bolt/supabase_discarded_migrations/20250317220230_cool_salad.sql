/*
  # Reset Users and Create Default Users
  
  1. Changes
    - Delete all existing users and related data
    - Create default users for each role
    - Set up proper role assignments
    
  2. Security
    - Ensure proper password hashing
    - Set up proper role-based access
*/

-- Temporarily disable the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- First, delete all existing data
DELETE FROM auth.users CASCADE;

-- Create default users
DO $$
DECLARE
  v_admin_id uuid;
  v_host_id uuid;
  v_swimmer_id uuid;
  v_admin_role_id uuid;
  v_host_role_id uuid;
  v_swimmer_role_id uuid;
BEGIN
  -- Get role IDs
  SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'admin';
  SELECT id INTO v_host_role_id FROM public.roles WHERE name = 'host';
  SELECT id INTO v_swimmer_role_id FROM public.roles WHERE name = 'swimmer';

  -- Create admin user
  v_admin_id := gen_random_uuid();
  INSERT INTO auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_current,
    email_change_token_new,
    phone_change_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_admin_id,
    'admin@3ommy.com',
    crypt('Admin123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Admin User", "profile_type": "admin"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    '',
    ''
  );

  -- Create host user
  v_host_id := gen_random_uuid();
  INSERT INTO auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_current,
    email_change_token_new,
    phone_change_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_host_id,
    'host@3ommy.com',
    crypt('Host123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Host User", "profile_type": "host"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    '',
    ''
  );

  -- Create swimmer user
  v_swimmer_id := gen_random_uuid();
  INSERT INTO auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_current,
    email_change_token_new,
    phone_change_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_swimmer_id,
    'swimmer@3ommy.com',
    crypt('Swimmer123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Swimmer User", "profile_type": "swimmer"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    '',
    ''
  );

  -- Create profiles for each user
  INSERT INTO public.profiles (user_id, full_name)
  VALUES 
    (v_admin_id, 'Admin User'),
    (v_host_id, 'Host User'),
    (v_swimmer_id, 'Swimmer User');

  -- Assign roles
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES 
    (v_admin_id, v_admin_role_id),
    (v_host_id, v_host_role_id),
    (v_swimmer_id, v_swimmer_role_id);

END $$;

-- Re-enable the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_created();