# Step-by-Step: Upgrade Danielleebuckley2010@gmail.com to Premium

## Prerequisites

1. Make sure you have `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` file
2. Get it from: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh/settings/api
3. Restart your dev server after adding the key

## Step 1: Check Current Status

First, let's see what's currently in the database:

**Option A: Use the check endpoint (if server is running)**
```bash
curl -X POST http://localhost:3000/api/admin/check-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com"}'
```

**Option B: Run SQL in Supabase**
1. Go to: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh/sql/new
2. Run `CHECK_DANIELLE_STATUS.sql`

This will show you:
- What's in `user_metadata`
- What's in `user_plans` table
- Whether the user is currently premium

## Step 2: Verify user_plans Table Exists

Run this SQL in Supabase:
```sql
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'user_plans'
);
```

If it returns `false`, create the table using `SUPABASE_SETUP.md`.

## Step 3: Upgrade User

**Option A: Use Admin API (RECOMMENDED)**

```bash
curl -X POST http://localhost:3000/api/admin/upgrade-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com", "planType": "pro_lifetime"}'
```

Expected response:
```json
{
  "success": true,
  "message": "User Danielleebuckley2010@gmail.com upgraded to pro_lifetime",
  "user": {
    "id": "...",
    "email": "Danielleebuckley2010@gmail.com",
    "plan_type": "pro_lifetime",
    "subscription_status": "active"
  }
}
```

**Option B: Use SQL Script**

1. Go to Supabase SQL Editor
2. Run `UPGRADE_DANIELLE_TO_LIFETIME.sql`
3. Check for any errors

## Step 4: Verify Upgrade Worked

Run the check again:
```bash
curl -X POST http://localhost:3000/api/admin/check-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com"}'
```

You should see:
- `isPremium: true`
- `metadata.plan_type: "pro_lifetime"`
- `metadata.subscription_status: "active"`
- `user_plans_table.data.plan_type: "pro_lifetime"`

## Step 5: Fix RLS Policies (if needed)

If the check shows the data is in the database but the app can't see it, run:

1. Go to Supabase SQL Editor
2. Run `FIX_RLS_POLICIES.sql`

This ensures users can read their own plan data.

## Step 6: User Must Refresh Session

**CRITICAL:** The user MUST:
1. **Log out** completely from the app
2. **Clear browser cache** (optional but recommended)
3. **Log back in**
4. Premium status will now be active

## Step 7: Verify in App

After the user logs back in:
1. Open browser console (F12)
2. Look for: `✅ Premium plan detected from user_plans table`
3. Check chat header - should show "Pro Plan • Unlimited"
4. Try accessing Coding Agent - should work without premium modal
5. Send messages - should be unlimited

## Troubleshooting

### Issue: "User not found"
- Make sure the user has signed up
- Check email spelling (case doesn't matter now)

### Issue: "Supabase credentials not configured"
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Restart dev server

### Issue: "Error updating user_plans table"
- Check if table exists (Step 2)
- Check RLS policies (Step 5)
- Run `FIX_RLS_POLICIES.sql`

### Issue: User still shows free plan after upgrade
1. Verify upgrade worked (Step 4)
2. User must log out and log back in (Step 6)
3. Check browser console for debug messages
4. Check RLS policies (Step 5)

### Issue: Browser console shows "❌ User is NOT detected as premium"
1. Check what the console shows:
   - `📊 User plans table check:` - What does it show?
   - `📊 User metadata check:` - What does it show?
2. Verify database has correct data (Step 4)
3. Check RLS policies (Step 5)
4. User must log out and log back in (Step 6)

## Expected Result

After completing all steps:
- ✅ Database shows `plan_type: "pro_lifetime"` and `subscription_status: "active"`
- ✅ Browser console shows `✅ Premium plan detected`
- ✅ Chat header shows "Pro Plan • Unlimited"
- ✅ No message limit
- ✅ Coding Agent is accessible
- ✅ No premium upgrade modals

## Quick Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`
- [ ] Dev server is running
- [ ] Checked current status (Step 1)
- [ ] Verified `user_plans` table exists (Step 2)
- [ ] Upgraded user (Step 3)
- [ ] Verified upgrade worked (Step 4)
- [ ] Fixed RLS policies if needed (Step 5)
- [ ] User logged out and back in (Step 6)
- [ ] Verified in app (Step 7)

If you've completed all steps and it still doesn't work, check the browser console for specific error messages.

