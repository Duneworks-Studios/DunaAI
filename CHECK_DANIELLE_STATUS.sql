-- Check Danielle's current status in database
-- Run this to see exactly what's in the database

-- Check auth.users table
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'plan' as metadata_plan,
    u.raw_user_meta_data->>'plan_type' as metadata_plan_type,
    u.raw_user_meta_data->>'subscription_status' as metadata_status,
    u.raw_user_meta_data as full_metadata
FROM auth.users u
WHERE u.email = 'Danielleebuckley2010@gmail.com';

-- Check user_plans table
SELECT 
    up.id,
    up.user_id,
    up.plan_type,
    up.subscription_status,
    up.updated_at,
    u.email
FROM public.user_plans up
JOIN auth.users u ON up.user_id = u.id
WHERE u.email = 'Danielleebuckley2010@gmail.com';

-- If no rows returned, the user_plans table doesn't have a record for this user

