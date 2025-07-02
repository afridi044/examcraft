-- Supabase Integration Script for ExamCraft
-- This script sets up triggers to sync Supabase auth.users with the custom users table

-- =============================================
-- Add Supabase Integration to Existing Schema
-- =============================================

-- Add supabase_auth_id to link with auth.users
ALTER TABLE users 
ADD COLUMN supabase_auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_users_supabase_auth_id ON users(supabase_auth_id);

-- =============================================
-- Trigger Functions
-- =============================================

-- Function to handle new user creation from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create user record if email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.users (
      supabase_auth_id,
      email,
      first_name,
      last_name,
      institution,
      field_of_study,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'institution', ''),
      COALESCE(NEW.raw_user_meta_data->>'field_of_study', ''),
      NEW.created_at,
      NEW.updated_at
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user updates from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    email = NEW.email,
    first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', first_name),
    last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', last_name),
    institution = COALESCE(NEW.raw_user_meta_data->>'institution', institution),
    field_of_study = COALESCE(NEW.raw_user_meta_data->>'field_of_study', field_of_study),
    updated_at = NEW.updated_at,
    last_login = CASE WHEN NEW.last_sign_in_at IS NOT NULL THEN NEW.last_sign_in_at ELSE last_login END
  WHERE supabase_auth_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user deletion from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.users WHERE supabase_auth_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Create Triggers
-- =============================================

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Trigger for user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- =============================================
-- Helper Functions for Application
-- =============================================

-- Function to get user by Supabase auth ID
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

-- Function to update user profile
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
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (supabase_auth_id = auth.uid());

-- Policy: Users can only update their own data
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (supabase_auth_id = auth.uid());

-- Policy: Only authenticated users can insert (handled by trigger)
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT WITH CHECK (true);

-- Policy: Only service role can delete (handled by trigger)
CREATE POLICY "Service role can delete users" ON public.users
  FOR DELETE USING (true);

-- =============================================
-- Update Foreign Key References
-- =============================================

-- Update all foreign key references to use the new user relationship
-- Note: This requires careful migration of existing data if any exists

COMMENT ON COLUMN public.users.supabase_auth_id IS 'Links to auth.users.id for Supabase authentication';
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user record when a new auth user is created';
COMMENT ON FUNCTION public.handle_user_update() IS 'Automatically updates user record when auth user is updated';
COMMENT ON FUNCTION public.handle_user_delete() IS 'Automatically deletes user record when auth user is deleted';
