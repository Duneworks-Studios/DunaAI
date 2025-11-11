-- Upgrade user to Lifetime Premium
-- Email: Danielleebuckley2010@gmail.com
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    user_uuid UUID;
    target_email TEXT := 'Danielleebuckley2010@gmail.com';
BEGIN
    -- Find the user's UUID by email
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = target_email;

    -- Check if user exists
    IF user_uuid IS NULL THEN
        RAISE NOTICE '❌ User with email % not found in auth.users table.', target_email;
        RAISE NOTICE 'Please make sure the user has signed up first.';
        RETURN;
    END IF;

    RAISE NOTICE '✅ Found user: %', user_uuid;
    RAISE NOTICE '📧 Email: %', target_email;

    -- Update raw_user_meta_data in auth.users table
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
        'plan', 'pro',
        'plan_type', 'pro_lifetime',
        'subscription_status', 'active',
        'upgraded_at', NOW()::text
    ) || COALESCE(raw_user_meta_data, '{}'::jsonb) -- Merge with existing metadata
    WHERE id = user_uuid;

    RAISE NOTICE '✅ Updated user metadata';

    -- Insert or update user_plans table
    INSERT INTO public.user_plans (user_id, plan_type, subscription_status, updated_at)
    VALUES (user_uuid, 'pro_lifetime', 'active', NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        plan_type = 'pro_lifetime',
        subscription_status = 'active',
        updated_at = NOW();

    RAISE NOTICE '✅ Updated user_plans table';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SUCCESS! User % upgraded to Lifetime Premium!', target_email;
    RAISE NOTICE '📋 Plan: pro_lifetime';
    RAISE NOTICE '✅ Status: active';
    RAISE NOTICE '🆔 User ID: %', user_uuid;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ An error occurred: %', SQLERRM;
        RAISE;
END $$;

-- Verify the upgrade
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.raw_user_meta_data->>'plan' as plan,
    u.raw_user_meta_data->>'plan_type' as plan_type,
    u.raw_user_meta_data->>'subscription_status' as subscription_status,
    up.plan_type as db_plan_type,
    up.subscription_status as db_status,
    up.updated_at as plan_updated_at
FROM auth.users u
LEFT JOIN public.user_plans up ON u.id = up.user_id
WHERE u.email = 'Danielleebuckley2010@gmail.com';

