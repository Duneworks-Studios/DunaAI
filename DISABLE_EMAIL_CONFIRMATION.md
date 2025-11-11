# Disable Email Confirmation in Supabase

## Problem
After signing up, users are redirected back to the intro page because email confirmation is required, and the session isn't immediately available.

## Solution: Disable Email Confirmation (Development/Testing)

For development and testing, you can disable email confirmation so users are automatically logged in after signup.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh
   - Go to **Authentication** → **Providers** → **Email**

2. **Disable Email Confirmation**
   - Find the **"Confirm email"** toggle
   - Turn it **OFF** (disable)
   - Click **"Save"**

3. **Alternative: Auto-confirm Users**
   - Go to **Authentication** → **Settings**
   - Under **"User Management"**, enable **"Enable email confirmations"** = OFF
   - OR set **"Auto Confirm Users"** = ON

4. **Test the Signup Flow**
   - Sign up with a new email
   - You should be automatically logged in and redirected to `/chat`

## For Production

For production, you have two options:

### Option 1: Keep Email Confirmation (Recommended for Security)
- Leave email confirmation enabled
- Users will receive an email after signup
- They need to click the verification link to activate their account
- Then they can log in

### Option 2: Disable Email Confirmation (Less Secure)
- Disable email confirmation
- Users are automatically logged in after signup
- Faster onboarding, but less secure

## Current Behavior

After this fix:
- If email confirmation is **disabled**: Users are automatically logged in and redirected to `/chat`
- If email confirmation is **enabled**: Users see a success message and are redirected to login page to check their email

## Verify Settings

Check your Supabase settings:
1. Go to **Authentication** → **Providers** → **Email**
2. Check if **"Confirm email"** is enabled or disabled
3. This affects whether users need to verify their email before logging in

