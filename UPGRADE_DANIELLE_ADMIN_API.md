# Upgrade User Using Admin API (Recommended)

## Problem
Direct SQL updates to `raw_user_meta_data` don't always sync to the client session immediately.

## Solution: Use Admin API Endpoint

I've created an admin API endpoint that uses Supabase's Admin API to update user metadata properly.

### Step 1: Add Service Role Key to Environment

Make sure you have `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**To find your service role key:**
1. Go to Supabase Dashboard: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh/settings/api
2. Find **"service_role"** key (NOT the anon key)
3. Copy it and add to `.env.local`

### Step 2: Upgrade User via API

**Option A: Use curl (from terminal)**

```bash
curl -X POST http://localhost:3000/api/admin/upgrade-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com", "planType": "pro_lifetime"}'
```

**Option B: Use the browser console (if logged in as admin)**

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

**Option C: Create a simple admin page (if needed)**

### Step 3: User Must Refresh Session

After upgrading:
1. User should **log out** completely
2. **Log back in**
3. Premium status should now be active

## Why This Works Better

- ✅ Uses Supabase Admin API (proper way to update users)
- ✅ Updates both `user_metadata` and `user_plans` table
- ✅ Metadata syncs immediately to client sessions
- ✅ More reliable than direct SQL updates

## Alternative: Fix SQL Script to Use Admin Functions

If you prefer SQL, you can also create a Supabase function that uses the admin API internally.

## Security Note

⚠️ **Important:** The Admin API endpoint should be protected in production. Add authentication/authorization before deploying.

For now, it's fine for development/testing.

