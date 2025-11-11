# Quick Upgrade: Danielleebuckley2010@gmail.com to Lifetime Premium

## Method 1: Use Admin API Endpoint (RECOMMENDED)

This is the most reliable method as it uses Supabase's Admin API which properly syncs metadata.

### Step 1: Make sure you have the service role key

Add to `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get it from: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh/settings/api
(Look for "service_role" key, NOT the anon key)

### Step 2: Call the upgrade API

**Option A: From terminal (if running locally)**
```bash
curl -X POST http://localhost:3000/api/admin/upgrade-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com", "planType": "pro_lifetime"}'
```

**Option B: From browser console**
1. Open your site
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

### Step 3: User must refresh

1. User logs out
2. User logs back in
3. Premium status should be active

## Method 2: Use SQL Script (if Admin API doesn't work)

### Step 1: Run SQL in Supabase

1. Go to: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh/sql/new
2. Copy and paste `UPGRADE_DANIELLE_TO_LIFETIME.sql`
3. Run it

### Step 2: Verify it worked

Run this verification query:
```sql
SELECT 
    u.email,
    u.raw_user_meta_data->>'plan_type' as plan_type,
    up.plan_type as db_plan_type,
    up.subscription_status as db_status
FROM auth.users u
LEFT JOIN public.user_plans up ON u.id = up.user_id
WHERE u.email = 'Danielleebuckley2010@gmail.com';
```

Expected:
- `plan_type`: `pro_lifetime`
- `db_plan_type`: `pro_lifetime`
- `db_status`: `active`

### Step 3: User must refresh

1. User logs out completely
2. User logs back in
3. Check browser console for debug messages
4. Premium should be active

## Troubleshooting

### If it still shows 20 messages:

1. **Check browser console** (F12) for debug messages:
   - Look for: `✅ Premium plan detected from user_plans table`
   - Look for: `✅ Premium plan detected from user_metadata`
   - Look for: `ℹ️ User metadata: {...}`

2. **Verify database** - Run the verification SQL above

3. **Check RLS policies** - Make sure `user_plans` table has the correct policies:
   ```sql
   -- Check policies
   SELECT * FROM pg_policies WHERE tablename = 'user_plans';
   ```

4. **Force refresh session**:
   - User clears browser cache
   - User logs out
   - User logs back in
   - Check again

5. **Check if user_plans table exists**:
   ```sql
   SELECT * FROM public.user_plans WHERE user_id IN (
     SELECT id FROM auth.users WHERE email = 'Danielleebuckley2010@gmail.com'
   );
   ```

## Expected Result

After upgrade and refresh, user should see:
- ✅ "Pro Plan • Unlimited" in chat header
- ✅ No message count limit
- ✅ Access to Coding Agent (no premium modal)
- ✅ Console shows: `✅ Premium plan detected from user_plans table`

## If Nothing Works

1. Check Supabase logs for errors
2. Verify the user exists: `SELECT * FROM auth.users WHERE email = 'Danielleebuckley2010@gmail.com';`
3. Check RLS policies allow user to read their own plan
4. Try the Admin API method (Method 1) - it's more reliable

