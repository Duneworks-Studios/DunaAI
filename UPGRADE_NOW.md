# Upgrade Danielleebuckley2010@gmail.com NOW

## Quick Steps

### Step 1: Make Sure Service Role Key is Set

Check your `.env.local` file has:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

If not, get it from: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh/settings/api

### Step 2: Start Your Dev Server

```bash
npm run dev
```

### Step 3: Upgrade the User

**Option A: Use the script (easiest)**
```bash
./upgrade-danielle.sh
```

**Option B: Use curl**
```bash
curl -X POST http://localhost:3000/api/admin/upgrade-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com", "planType": "pro_lifetime"}'
```

**Option C: Use browser console**
1. Go to your site: http://localhost:3000
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
.then(data => {
  console.log('Result:', data)
  if (data.success) {
    alert('✅ User upgraded! User must log out and log back in.')
  } else {
    alert('❌ Error: ' + JSON.stringify(data))
  }
})
```

### Step 4: Verify Upgrade

Run the check endpoint:
```bash
curl -X POST http://localhost:3000/api/admin/check-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com"}'
```

You should see:
```json
{
  "isPremium": true,
  "metadata": {
    "plan_type": "pro_lifetime",
    "subscription_status": "active"
  },
  "user_plans_table": {
    "data": {
      "plan_type": "pro_lifetime",
      "subscription_status": "active"
    }
  }
}
```

### Step 5: User Must Log Out and Log Back In

**CRITICAL:** The user must:
1. **Log out** completely from the app
2. **Log back in** with `Danielleebuckley2010@gmail.com`
3. Premium status will now be active

### Step 6: Verify in App

After user logs back in:
1. Check browser console (F12) - should see `✅ Premium plan detected`
2. Check chat header - should show "Pro Plan • Unlimited"
3. Try Coding Agent - should work without premium modal
4. Send messages - should be unlimited

## Troubleshooting

### Error: "Supabase credentials not configured"
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Restart dev server: `npm run dev`

### Error: "User not found"
- User needs to sign up first at: http://localhost:3000/auth/signup
- Use email: `Danielleebuckley2010@gmail.com`

### Error: "Error updating user_plans table"
- Check if `user_plans` table exists (run SQL from `SUPABASE_SETUP.md`)
- Check RLS policies (run `FIX_RLS_POLICIES.sql`)

### User still shows free plan after upgrade
1. Verify upgrade worked (Step 4)
2. User must log out and log back in (Step 5)
3. Check browser console for debug messages
4. Clear browser cache and localStorage

## Expected Result

After completing all steps:
- ✅ Database shows `plan_type: "pro_lifetime"`
- ✅ Browser console shows `✅ Premium plan detected`
- ✅ Chat header shows "Pro Plan • Unlimited"
- ✅ No message limit
- ✅ Coding Agent is accessible

