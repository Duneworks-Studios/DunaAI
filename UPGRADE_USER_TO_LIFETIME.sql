-- Upgrade user to Lifetime Premium
-- Run this in Supabase SQL Editor

-- Step 1: Find the user by email
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get user ID by email
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = 'danielleebuckley@gmail.com';

    IF user_uuid IS NULL THEN
        RAISE NOTICE 'User not found. Please create the account first by signing up.';
        RETURN;
    END IF;

    RAISE NOTICE 'Found user: %', user_uuid;

    -- Step 2: Update user metadata to premium lifetime
    UPDATE auth.users
    SET 
        raw_user_meta_data = jsonb_build_object(
            'plan', 'pro',
            'plan_type', 'pro_lifetime',
            'subscription_status', 'active',
            'upgraded_at', NOW()::text
        ) || COALESCE(raw_user_meta_data, '{}'::jsonb)
    WHERE id = user_uuid;

    RAISE NOTICE 'Updated user metadata';

    -- Step 3: Insert or update user_plans table
    INSERT INTO public.user_plans (
        user_id,
        plan_type,
        subscription_status,
        updated_at
    )
    VALUES (
        user_uuid,
        'pro_lifetime',
        'active',
        NOW()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        plan_type = 'pro_lifetime',
        subscription_status = 'active',
        updated_at = NOW();

    RAISE NOTICE 'User upgraded to Lifetime Premium successfully!';
    RAISE NOTICE 'User ID: %', user_uuid;
    RAISE NOTICE 'Email: danielleebuckley@gmail.com';
    RAISE NOTICE 'Plan: pro_lifetime';
    RAISE NOTICE 'Status: active';
END $$;

-- Verify the upgrade
SELECT 
    u.email,
    u.raw_user_meta_data->>'plan' as plan,
    u.raw_user_meta_data->>'plan_type' as plan_type,
    u.raw_user_meta_data->>'subscription_status' as subscription_status,
    up.plan_type as db_plan_type,
    up.subscription_status as db_status
FROM auth.users u
LEFT JOIN public.user_plans up ON u.id = up.user_id
WHERE u.email = 'danielleebuckley@gmail.com';

