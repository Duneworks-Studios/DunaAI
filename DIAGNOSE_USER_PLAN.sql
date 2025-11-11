-- Diagnose User Plan Status
-- Run this to see what the database thinks the user's plan is

SELECT 
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at,
    -- Check raw_user_meta_data
    u.raw_user_meta_data->>'plan' as metadata_plan,
    u.raw_user_meta_data->>'plan_type' as metadata_plan_type,
    u.raw_user_meta_data->>'subscription_status' as metadata_status,
    u.raw_user_meta_data as full_metadata,
    -- Check user_plans table
    up.id as plan_table_id,
    up.plan_type as plan_table_type,
    up.subscription_status as plan_table_status,
    up.updated_at as plan_updated_at,
    -- Check if RLS allows access
    auth.uid() as current_user_id,
    CASE 
        WHEN auth.uid() = u.id THEN 'User can see their own data'
        ELSE 'User cannot see this data (RLS issue)'
    END as rls_status
FROM auth.users u
LEFT JOIN public.user_plans up ON u.id = up.user_id
WHERE u.email = 'Danielleebuckley2010@gmail.com';

-- Also check what the current authenticated user sees
SELECT 
    up.user_id,
    up.plan_type,
    up.subscription_status,
    up.updated_at
FROM public.user_plans up
WHERE up.user_id IN (
    SELECT id FROM auth.users WHERE email = 'Danielleebuckley2010@gmail.com'
);

