-- Remove Supabase Integration Triggers for ExamCraft
-- This script removes the automatic triggers that conflict with manual user creation

-- =============================================
-- Drop Triggers
-- =============================================

-- Drop the trigger functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Drop the trigger functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_update();
DROP FUNCTION IF EXISTS public.handle_user_delete();

-- =============================================
-- Update RLS Policies
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
DROP POLICY IF EXISTS "Service role can delete users" ON public.users;

-- Create new policies for manual user management
CREATE POLICY "Service role can manage all users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- Keep Helper Functions (but remove trigger dependencies)
-- =============================================

-- Function to get user by Supabase auth ID (keep this)
CREATE OR REPLACE FUNCTION public.get_user_by_auth_id(auth_id UUID)
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  institution VARCHAR,
  field_of_study VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_login TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.institution,
    u.field_of_study,
    u.created_at,
    u.updated_at,
    u.last_login
  FROM public.users u
  WHERE u.supabase_auth_id = auth_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile (keep this)
CREATE OR REPLACE FUNCTION public.update_user_profile(
  auth_id UUID,
  new_first_name VARCHAR DEFAULT NULL,
  new_last_name VARCHAR DEFAULT NULL,
  new_institution VARCHAR DEFAULT NULL,
  new_field_of_study VARCHAR DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.users
  SET
    first_name = COALESCE(new_first_name, first_name),
    last_name = COALESCE(new_last_name, last_name),
    institution = COALESCE(new_institution, institution),
    field_of_study = COALESCE(new_field_of_study, field_of_study),
    updated_at = CURRENT_TIMESTAMP
  WHERE supabase_auth_id = auth_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Comments
-- =============================================

COMMENT ON COLUMN public.users.supabase_auth_id IS 'Links to auth.users.id for Supabase authentication';
COMMENT ON FUNCTION public.get_user_by_auth_id(UUID) IS 'Get user by Supabase auth ID';
COMMENT ON FUNCTION public.update_user_profile(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR) IS 'Update user profile by auth ID'; 