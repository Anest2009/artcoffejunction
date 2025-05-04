-- SQL script to create three staff accounts (one for each counter type)
-- Run this in the Supabase SQL Editor

-- First, create the users in the auth.users table
-- Note: This requires admin privileges and may need to be done through the Supabase dashboard UI instead

-- Then create the corresponding entries in the users table
INSERT INTO public.users (id, email, name, role, counter_type, created_at)
VALUES 
  -- Coffee Counter Staff
  ('00000000-0000-0000-0000-000000000001', 'coffee@cafe.com', 'Coffee Staff', 'staff', 'coffee', NOW()),
  
  -- Pastry Counter Staff
  ('00000000-0000-0000-0000-000000000002', 'pastry@cafe.com', 'Pastry Staff', 'staff', 'pastry', NOW()),
  
  -- Bar Counter Staff
  ('00000000-0000-0000-0000-000000000003', 'bar@cafe.com', 'Bar Staff', 'staff', 'bar', NOW());

-- Note: After running this script, you'll need to create the corresponding auth users in Supabase
-- Go to Authentication > Users in the Supabase dashboard
-- Click "Add User" and use these same emails with password "password123"
-- Make sure to use the same UUIDs as specified above
