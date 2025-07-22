-- Migration: Remove password_hash column from users table
-- This script removes the password_hash column since we use Supabase Auth for password management

-- =============================================
-- Remove password_hash column
-- =============================================

-- Drop the password_hash column
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- =============================================
-- Update any existing indexes or constraints
-- =============================================

-- The email index remains the same
-- CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- Verify the change
-- =============================================

-- Check the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE users IS 'User profiles linked to Supabase Auth users. Passwords are managed by Supabase Auth.';
COMMENT ON COLUMN users.email IS 'User email (must match Supabase Auth email)';
COMMENT ON COLUMN users.supabase_auth_id IS 'Links to auth.users.id for Supabase authentication'; 