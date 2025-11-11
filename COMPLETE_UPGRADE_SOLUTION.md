# Complete Solution: Upgrade User to Premium

## The Problem
After running SQL to upgrade a user, the app still shows "20 messages/day" limit.

## Root Cause
The user's session has **cached metadata**. Even though the database is updated, the client session needs to be refreshed.

## Solution: Use Admin API (BEST METHOD)

### Step 1: Add Service Role Key

Add to `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get it from: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh/settings/api
(Look for "service_role" key - it's different from the anon key)

### Step 2: Upgrade User via API

**Option A: From Terminal (if running locally)**
```bash
curl -X POST http://localhost:3000/api/admin/upgrade-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com", "planType": "pro_lifetime"}'
```

**Option B: From Browser Console**
1. Go to your site
2. Open browser console (F12)
3. Run:
```javascript
fetch('/api/admin/upgrade-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'Danielleebuckley2010@gmail.com',
    planType: 'pro_lifetime'
  })
})
.then(r => r.json())
.then(console.log)
```

### Step 3: User MUST Log Out and Log Back In

**This is critical!** The user's session has cached metadata. They need to:
1. Click "Logout"
2. Log back in
3. Premium status will now be active

## Alternative: Verify SQL Upgrade Worked

### Step 1: Run Verification SQL

Run `CHECK_DANIELLE_STATUS.sql` in Supabase SQL Editor to see:
- What's in `raw_user_meta_data`
- What's in `user_plans` table
- If the upgrade actually worked

### Step 2: Check Browser Console

After user logs back in, check browser console for:
- `✅ Premium plan detected from user_plans table`
- `✅ Premium plan detected from user_metadata`
- `✅ User IS detected as premium`

If you see `❌ User is NOT detected as premium`, check what the console shows.

## Debugging Steps

1. **Run verification SQL** - See what's actually in the database
2. **Check browser console** - See what the app is detecting
3. **User logs out and back in** - Refresh the session
4. **Check again** - Premium should be active

## Common Issues

**Issue:** User metadata is empty
- **Fix:** Run the SQL upgrade script again
- **Or:** Use the Admin API endpoint

**Issue:** user_plans table has no data
- **Fix:** Make sure the SQL script ran successfully
- **Check:** Run `CHECK_DANIELLE_STATUS.sql` to verify

**Issue:** RLS blocking access
- **Fix:** Make sure RLS policies are set up (see `SUPABASE_SETUP.md`)
- **Check:** Policy should allow users to read their own plan

**Issue:** Session not refreshing
- **Fix:** User must log out and log back in
- **Alternative:** Clear browser cache and localStorage

## Expected Result

After upgrade and refresh:
- Browser console shows: `✅ Premium plan detected`
- Chat header shows: "Pro Plan • Unlimited"
- No message count limit
- Access to Coding Agent

## Quick Test

1. Run upgrade (SQL or API)
2. User logs out
3. User logs back in
4. Check browser console for premium detection
5. Check chat header for "Pro Plan • Unlimited"

If it still doesn't work, check the console logs to see what's being detected.

