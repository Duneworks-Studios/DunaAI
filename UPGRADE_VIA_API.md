# Upgrade User via Admin API (EASIEST METHOD)

## Quick Upgrade for Danielleebuckley2010@gmail.com

### Step 1: Make sure service role key is set

Add to `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get it from: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh/settings/api
(Look for "service_role" key)

### Step 2: Call the upgrade API

**If running locally:**
```bash
curl -X POST http://localhost:3000/api/admin/upgrade-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com", "planType": "pro_lifetime"}'
```

**If deployed on Netlify:**
```bash
curl -X POST https://your-site.netlify.app/api/admin/upgrade-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com", "planType": "pro_lifetime"}'
```

**From browser console (while on your site):**
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
    alert('User upgraded! Please log out and log back in.')
  } else {
    alert('Error: ' + data.error)
  }
})
```

### Step 3: User must refresh

**IMPORTANT:** After upgrading, the user MUST:
1. **Log out** completely
2. **Log back in**
3. Premium status will now be active

## Why This Works

- Uses Supabase Admin API (proper way to update users)
- Updates both `user_metadata` AND `user_plans` table
- Metadata syncs properly when user refreshes session
- More reliable than direct SQL updates

## Expected Response

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

## Troubleshooting

**Error: "Supabase credentials not configured"**
- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Restart the dev server

**Error: "User not found"**
- User must sign up first
- Check email spelling

**User still shows 20 messages after upgrade**
- User must log out and log back in
- Check browser console for debug messages
- Run verification SQL to confirm upgrade worked

