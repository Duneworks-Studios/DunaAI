-- Create user account and upgrade to Lifetime Premium
-- Note: This creates a user but they will need to set password via email verification
-- OR use Supabase Auth Admin API

-- Step 1: Check if user exists
DO $$
DECLARE
    user_uuid UUID;
    user_exists BOOLEAN;
BEGIN
    -- Check if user already exists
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'danielleebuckley@gmail.com'
    ) INTO user_exists;

    IF user_exists THEN
        RAISE NOTICE 'User already exists. Upgrading to premium...';
        
        -- Get user ID
        SELECT id INTO user_uuid
        FROM auth.users
        WHERE email = 'danielleebuckley@gmail.com';

        -- Update to premium
        UPDATE auth.users
        SET raw_user_meta_data = jsonb_build_object(
            'plan', 'pro',
            'plan_type', 'pro_lifetime',
            'subscription_status', 'active',
            'upgraded_at', NOW()::text
        ) || COALESCE(raw_user_meta_data, '{}'::jsonb)
        WHERE id = user_uuid;

        -- Update user_plans table
        INSERT INTO public.user_plans (user_id, plan_type, subscription_status, updated_at)
        VALUES (user_uuid, 'pro_lifetime', 'active', NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
            plan_type = 'pro_lifetime',
            subscription_status = 'active',
            updated_at = NOW();

        RAISE NOTICE '✅ User upgraded to Lifetime Premium!';
        RAISE NOTICE 'User ID: %', user_uuid;
    ELSE
        RAISE NOTICE '❌ User does not exist.';
        RAISE NOTICE 'Please sign up at your site first, then run this script again.';
        RAISE NOTICE 'Or use Supabase Dashboard → Authentication → Users → Add User';
    END IF;
END $$;

-- Verify user status
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.raw_user_meta_data->>'plan_type' as plan_type,
    u.raw_user_meta_data->>'subscription_status' as subscription_status,
    up.plan_type as db_plan_type,
    up.subscription_status as db_status
FROM auth.users u
LEFT JOIN public.user_plans up ON u.id = up.user_id
WHERE u.email = 'danielleebuckley@gmail.com';

