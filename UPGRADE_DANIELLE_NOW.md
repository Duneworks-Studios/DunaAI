# Upgrade Danielleebuckley2010@gmail.com NOW

## Quick Steps

### Step 1: Check Current Status

Run this to see what's in the database:

```bash
curl -X POST http://localhost:3000/api/admin/check-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com"}'
```

Or from browser console:
```javascript
fetch('/api/admin/check-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'Danielleebuckley2010@gmail.com' })
})
.then(r => r.json())
.then(console.log)
```

### Step 2: Upgrade User

**Make sure you have `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`**

Then run:
```bash
curl -X POST http://localhost:3000/api/admin/upgrade-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com", "planType": "pro_lifetime"}'
```

Or from browser console:
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
    alert('✅ User upgraded! Please tell the user to LOG OUT and LOG BACK IN.')
  } else {
    alert('❌ Error: ' + JSON.stringify(data))
  }
})
```

### Step 3: Verify Upgrade

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

### Step 4: User Must Refresh

**CRITICAL:** The user MUST:
1. **Log out** completely
2. **Log back in**
3. Premium will now be active

## If It Still Doesn't Work

1. **Check browser console** - Look for debug messages
2. **Verify database** - Run the check endpoint
3. **Check RLS policies** - Make sure user_plans table is accessible
4. **Clear browser cache** - User should clear cache and localStorage

## Troubleshooting

**Error: "Supabase credentials not configured"**
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Restart dev server

**Error: "User not found"**
- User must sign up first
- Check email spelling (case-insensitive)

**User still shows free plan after upgrade**
- User must log out and log back in
- Check browser console for debug messages
- Verify upgrade worked using check endpoint

