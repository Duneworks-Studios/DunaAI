-- Verify Premium Upgrade for Danielleebuckley2010@gmail.com
-- Run this to check if the upgrade worked

SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.raw_user_meta_data->>'plan' as plan,
    u.raw_user_meta_data->>'plan_type' as plan_type,
    u.raw_user_meta_data->>'subscription_status' as subscription_status,
    u.raw_user_meta_data as full_metadata,
    up.id as plan_id,
    up.plan_type as db_plan_type,
    up.subscription_status as db_status,
    up.updated_at as plan_updated_at
FROM auth.users u
LEFT JOIN public.user_plans up ON u.id = up.user_id
WHERE u.email = 'Danielleebuckley2010@gmail.com';

-- Expected results:
-- plan: 'pro'
-- plan_type: 'pro_lifetime'
-- subscription_status: 'active'
-- db_plan_type: 'pro_lifetime'
-- db_status: 'active'

