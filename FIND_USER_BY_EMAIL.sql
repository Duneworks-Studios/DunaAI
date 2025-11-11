-- Find user by email (check if they exist)
-- Run this to verify the user exists in auth.users

SELECT 
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    u.raw_user_meta_data->>'plan' as metadata_plan,
    u.raw_user_meta_data->>'plan_type' as metadata_plan_type,
    u.raw_user_meta_data->>'subscription_status' as metadata_status,
    u.raw_user_meta_data as full_metadata
FROM auth.users u
WHERE LOWER(u.email) = LOWER('Danielleebuckley2010@gmail.com');

-- If this returns no rows, the user doesn't exist - they need to sign up first
-- If this returns a row, the user exists but might not have a plan record

-- Check if user_plans table has ANY data
SELECT COUNT(*) as total_plans FROM public.user_plans;

-- Check if this specific user has a plan (even if email query didn't work)
-- Replace 'user-id-here' with the actual user ID from above
-- SELECT * FROM public.user_plans WHERE user_id = 'user-id-here';

