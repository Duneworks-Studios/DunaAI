# Quick Upgrade Guide - User Not Found in user_plans Table

## Problem
"No rows returned" means the user doesn't have a record in the `user_plans` table yet.

## Solution: Use Admin API to Upgrade

The Admin API will create the record in `user_plans` table automatically.

### Step 1: Verify User Exists

Run this SQL in Supabase to check if the user exists:
```sql
SELECT id, email, created_at 
FROM auth.users 
WHERE LOWER(email) = LOWER('Danielleebuckley2010@gmail.com');
```

If this returns no rows, the user needs to **sign up first**.

### Step 2: Upgrade via Admin API

**Make sure you have `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`**

Then run this command (if server is running locally):
```bash
curl -X POST http://localhost:3000/api/admin/upgrade-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com", "planType": "pro_lifetime"}'
```

**Or from browser console:**
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
.then(data => {
  console.log('Upgrade result:', data)
  if (data.success) {
    alert('✅ User upgraded! Please tell user to LOG OUT and LOG BACK IN.')
  } else {
    alert('❌ Error: ' + JSON.stringify(data))
  }
})
```

### Step 3: Verify Upgrade

Run this SQL to verify:
```sql
SELECT 
    u.email,
    u.raw_user_meta_data->>'plan_type' as metadata_plan_type,
    up.plan_type as table_plan_type,
    up.subscription_status
FROM auth.users u
LEFT JOIN public.user_plans up ON u.id = up.user_id
WHERE LOWER(u.email) = LOWER('Danielleebuckley2010@gmail.com');
```

You should now see:
- `metadata_plan_type`: `pro_lifetime`
- `table_plan_type`: `pro_lifetime`
- `subscription_status`: `active`

### Step 4: User Must Refresh

**CRITICAL:** User must:
1. **Log out** completely
2. **Log back in**
3. Premium will be active

## If User Doesn't Exist

If the SQL query shows no user exists:
1. User needs to sign up at: `https://your-site.com/auth/signup`
2. Use email: `Danielleebuckley2010@gmail.com`
3. Then run the upgrade API

## If Upgrade Fails

Check the error message:
- **"User not found"** → User needs to sign up first
- **"Supabase credentials not configured"** → Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- **"Error updating user_plans table"** → Check if table exists (run `SUPABASE_SETUP.md` SQL)

## Expected Result

After upgrade and user logs back in:
- ✅ Chat header shows "Pro Plan • Unlimited"
- ✅ No message limit
- ✅ Coding Agent is accessible
- ✅ Browser console shows `✅ Premium plan detected`

