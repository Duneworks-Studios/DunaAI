# Fix: Premium Upgrade Not Showing

## Problem
After running the SQL upgrade script, the user still sees "20 messages/day" limit instead of unlimited.

## Solutions

### Solution 1: User Needs to Refresh/Re-login

The user metadata is stored in the database, but the client-side session might have cached the old data.

**Steps:**
1. User should **log out** completely
2. **Log back in** with the same email
3. The new premium status should now be detected

### Solution 2: Verify the Upgrade Actually Worked

Run this SQL to check if the upgrade was successful:

```sql
SELECT 
    u.email,
    u.raw_user_meta_data->>'plan_type' as plan_type,
    u.raw_user_meta_data->>'subscription_status' as subscription_status,
    up.plan_type as db_plan_type,
    up.subscription_status as db_status
FROM auth.users u
LEFT JOIN public.user_plans up ON u.id = up.user_id
WHERE u.email = 'Danielleebuckley2010@gmail.com';
```

**Expected Results:**
- `plan_type`: `pro_lifetime`
- `subscription_status`: `active`
- `db_plan_type`: `pro_lifetime`
- `db_status`: `active`

If these are correct, the upgrade worked - the user just needs to refresh.

### Solution 3: Re-run the Upgrade Script

If the verification shows the upgrade didn't work:

1. Go to Supabase SQL Editor
2. Run `UPGRADE_DANIELLE_TO_LIFETIME.sql` again
3. Check for any errors
4. Run the verification query above
5. User should log out and log back in

### Solution 4: Check Browser Console

1. User should open browser console (F12)
2. Look for messages like:
   - `✅ Premium plan detected from user_plans table`
   - `✅ Premium plan detected from user_metadata`
   - `ℹ️ User metadata: {...}`
3. This will show what the app is detecting

### Solution 5: Force Refresh User Session

If the user is logged in, they can:
1. Open browser console (F12)
2. Run: `localStorage.clear()` (this will log them out)
3. Log back in
4. Premium status should now be active

## Common Issues

**Issue:** `user_plans` table doesn't exist
- **Fix:** Run the SQL setup from `SUPABASE_SETUP.md` to create the table

**Issue:** RLS (Row Level Security) blocking access
- **Fix:** Check that RLS policies are set correctly in `SUPABASE_SETUP.md`

**Issue:** User metadata not syncing
- **Fix:** User must log out and log back in for metadata to refresh

## Quick Test

After the user logs back in, they should see:
- "Pro Plan • Unlimited" in the chat header
- No message count limit
- Access to Coding Agent (no premium modal)

If they still see "Free Plan • X/20 messages", the upgrade didn't work or they need to refresh.

