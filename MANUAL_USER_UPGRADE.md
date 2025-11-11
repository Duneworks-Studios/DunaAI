# Manual User Upgrade to Lifetime Premium

## Quick Upgrade Script

Run this SQL in **Supabase SQL Editor** to upgrade a user to Lifetime Premium:

### Step 1: Open Supabase SQL Editor

1. Go to: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run the Upgrade Script

Copy and paste the entire SQL from `UPGRADE_USER_TO_LIFETIME.sql` and run it.

Or use this quick version:

```sql
-- Upgrade user to Lifetime Premium
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get user ID by email
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = 'danielleebuckley@gmail.com';

    IF user_uuid IS NULL THEN
        RAISE NOTICE 'User not found. Please create the account first.';
        RETURN;
    END IF;

    -- Update user metadata
    UPDATE auth.users
    SET user_metadata = jsonb_build_object(
        'plan', 'pro',
        'plan_type', 'pro_lifetime',
        'subscription_status', 'active',
        'upgraded_at', NOW()::text
    ) || COALESCE(user_metadata, '{}'::jsonb)
    WHERE id = user_uuid;

    -- Update user_plans table
    INSERT INTO public.user_plans (
        user_id, plan_type, subscription_status, updated_at
    )
    VALUES (user_uuid, 'pro_lifetime', 'active', NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
        plan_type = 'pro_lifetime',
        subscription_status = 'active',
        updated_at = NOW();

    RAISE NOTICE 'User upgraded successfully!';
END $$;
```

### Step 3: Verify

Run this to check the upgrade worked:

```sql
SELECT 
    u.email,
    u.user_metadata->>'plan_type' as plan_type,
    up.plan_type as db_plan_type,
    up.subscription_status as status
FROM auth.users u
LEFT JOIN public.user_plans up ON u.id = up.user_id
WHERE u.email = 'danielleebuckley@gmail.com';
```

You should see:
- `plan_type`: `pro_lifetime`
- `status`: `active`

## Important Notes

1. **User must exist first**: The user needs to sign up at least once before running this script
2. **Email is case-sensitive**: Make sure the email matches exactly
3. **After upgrade**: The user will have unlimited messages and access to Coding Agent

## Alternative: Create User First (if doesn't exist)

If the user doesn't exist yet, they need to:
1. Go to your site
2. Click "Sign Up"
3. Create account with email: `danielleebuckley@gmail.com` and password: `DannyCool10`
4. Then run the upgrade script above

