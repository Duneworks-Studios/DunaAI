# Upgrade Danielle to Lifetime Premium

## Quick Steps

1. **Go to Supabase SQL Editor**
   - Navigate to: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh/sql/new
   - Or go to: **SQL Editor** → **New Query**

2. **Copy and Paste the SQL Script**
   - Open the file `UPGRADE_DANIELLE_TO_LIFETIME.sql`
   - Copy all the SQL code
   - Paste it into the Supabase SQL Editor

3. **Run the Script**
   - Click **"Run"** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
   - Wait for the script to complete

4. **Verify the Upgrade**
   - Check the output messages - you should see:
     - ✅ Found user
     - ✅ Updated user metadata
     - ✅ Updated user_plans table
     - 🎉 SUCCESS! User upgraded to Lifetime Premium!

5. **Check the Results**
   - The script will show a verification query at the end
   - You should see:
     - `plan_type`: `pro_lifetime`
     - `subscription_status`: `active`
     - `db_plan_type`: `pro_lifetime`
     - `db_status`: `active`

## What This Does

- Updates the user's metadata in `auth.users` table to set:
  - `plan`: `pro`
  - `plan_type`: `pro_lifetime`
  - `subscription_status`: `active`

- Updates or creates a record in `public.user_plans` table with:
  - `plan_type`: `pro_lifetime`
  - `subscription_status`: `active`
  - `updated_at`: Current timestamp

## Important Notes

- **User must exist first**: The user with email `Danielleebuckley2010@gmail.com` must have signed up before running this script
- **If user doesn't exist**: The script will show an error message and exit safely
- **No data loss**: The script merges with existing user metadata, so it won't overwrite other data
- **Immediate effect**: The upgrade takes effect immediately after running the script

## Troubleshooting

**Error: User not found**
- Make sure the user has signed up first
- Check the email spelling: `Danielleebuckley2010@gmail.com`
- Check if the user exists in the `auth.users` table

**Error: Table doesn't exist**
- Make sure you've run the SQL setup scripts first (see `SUPABASE_SETUP.md`)
- The `user_plans` table must exist

**Error: Permission denied**
- Make sure you're using the Supabase SQL Editor (has admin access)
- Don't run this from a client application

## Verify It Worked

After running the script, the user should:
1. Log into the application
2. See "Pro Plan • Unlimited" in the chat interface
3. Have unlimited access to both Chat Agent and Coding Agent
4. No message limits

---

**Email**: `Danielleebuckley2010@gmail.com`  
**Plan**: `pro_lifetime`  
**Status**: `active`

