# Create User Account Guide

## Problem: "Invalid login" error

This means the account doesn't exist yet. You need to **sign up first** before you can log in.

## Solution: Create the Account

### Option 1: Sign Up Through Your Website (Recommended)

1. Go to your Netlify site (or localhost:3000)
2. Click **"Sign Up"** button
3. Enter:
   - **Email**: `danielleebuckley@gmail.com`
   - **Password**: `DannyCool10`
   - **Confirm Password**: `DannyCool10`
4. Click **"Sign Up"**
5. Check your email for verification (if email verification is enabled)
6. After signing up, run the upgrade SQL script to give them lifetime premium

### Option 2: Create User in Supabase Dashboard

1. Go to **Supabase Dashboard**: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"** → **"Create new user"**
4. Enter:
   - **Email**: `danielleebuckley@gmail.com`
   - **Password**: `DannyCool10`
   - **Auto Confirm User**: ✅ (check this box)
5. Click **"Create User"**
6. Then run the upgrade SQL script

### Option 3: Use Supabase Auth Admin API (Advanced)

You can create a user programmatically using the Supabase Admin API, but this requires server-side code with the service role key.

## After Creating the Account

Once the account exists, run this SQL to upgrade to Lifetime Premium:

```sql
-- Run in Supabase SQL Editor
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = 'danielleebuckley@gmail.com';

    IF user_uuid IS NULL THEN
        RAISE NOTICE 'User not found. Create account first.';
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
    INSERT INTO public.user_plans (user_id, plan_type, subscription_status, updated_at)
    VALUES (user_uuid, 'pro_lifetime', 'active', NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
        plan_type = 'pro_lifetime',
        subscription_status = 'active',
        updated_at = NOW();

    RAISE NOTICE '✅ User upgraded to Lifetime Premium!';
END $$;
```

## Check if User Exists

Run this to see if the user exists:

```sql
SELECT 
    email,
    email_confirmed_at,
    created_at,
    user_metadata->>'plan_type' as plan_type
FROM auth.users
WHERE email = 'danielleebuckley@gmail.com';
```

If this returns no rows, the account doesn't exist yet.

## Troubleshooting

**"Invalid login credentials"**
- Account doesn't exist → Sign up first
- Wrong password → Reset password or create new account
- Email not verified → Check email for verification link

**"User not found" in SQL**
- Account doesn't exist → Create it first via signup or Supabase dashboard
- Email typo → Check email spelling

## Quick Steps Summary

1. ✅ Go to your site
2. ✅ Click "Sign Up"
3. ✅ Enter email: `danielleebuckley@gmail.com`
4. ✅ Enter password: `DannyCool10`
5. ✅ Complete signup
6. ✅ Run upgrade SQL script
7. ✅ User now has Lifetime Premium! 🎉

