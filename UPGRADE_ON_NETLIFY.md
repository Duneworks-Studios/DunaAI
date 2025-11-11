# Upgrade User on Netlify

## Step 1: Get Your Netlify URL

Your Netlify site URL should be something like:
- `https://your-site-name.netlify.app`
- Or your custom domain

## Step 2: Make Sure Environment Variables are Set in Netlify

Go to Netlify Dashboard:
1. Go to: https://app.netlify.com
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Make sure you have:
   - `SUPABASE_SERVICE_ROLE_KEY` (required for Admin API)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Important:** After adding/changing environment variables, you need to **redeploy** your site.

## Step 3: Upgrade User via Netlify API

### Option A: Use Browser Console (Easiest)

1. Go to your Netlify site (e.g., `https://your-site.netlify.app`)
2. Open browser console (F12)
3. Run this (replace with your actual Netlify URL):
```javascript
fetch('https://your-site.netlify.app/api/admin/upgrade-user', {
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

### Option B: Use curl from Terminal

Replace `your-site.netlify.app` with your actual Netlify URL:
```bash
curl -X POST https://your-site.netlify.app/api/admin/upgrade-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com", "planType": "pro_lifetime"}'
```

### Option C: Use Postman or HTTP Client

- URL: `https://your-site.netlify.app/api/admin/upgrade-user`
- Method: `POST`
- Headers: `Content-Type: application/json`
- Body:
```json
{
  "email": "Danielleebuckley2010@gmail.com",
  "planType": "pro_lifetime"
}
```

## Step 4: Verify Upgrade

Check if the upgrade worked:
```javascript
fetch('https://your-site.netlify.app/api/admin/check-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'Danielleebuckley2010@gmail.com'
  })
})
.then(r => r.json())
.then(console.log)
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

## Step 5: User Must Log Out and Log Back In

**CRITICAL:** After upgrading:
1. User must **log out** completely from your Netlify site
2. User must **log back in** with `Danielleebuckley2010@gmail.com`
3. Premium status will now be active

## Troubleshooting

### Error: "Supabase credentials not configured"
- Make sure `SUPABASE_SERVICE_ROLE_KEY` is set in Netlify environment variables
- **Redeploy your site** after adding environment variables
- Go to: Netlify Dashboard → Site settings → Environment variables

### Error: "User not found"
- User needs to sign up first on your Netlify site
- Check email spelling (case doesn't matter)

### Error: 404 Not Found
- Make sure your Netlify site is deployed with the latest code
- Check that the API route exists: `/api/admin/upgrade-user`
- Try redeploying your site

### Error: CORS or Network Error
- Make sure you're using the correct Netlify URL
- Check that your site is accessible
- Try from browser console on the actual site (not localhost)

## Security Note

⚠️ **Important:** The Admin API endpoint should be protected in production. Consider adding:
- API key authentication
- Rate limiting
- IP whitelist

For now, it's accessible to anyone who knows the endpoint. Consider adding authentication later.

## Quick Checklist

- [ ] Netlify site is deployed
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in Netlify environment variables
- [ ] Site has been redeployed after adding environment variables
- [ ] Upgrade API called successfully
- [ ] Verified upgrade worked (Step 4)
- [ ] User logged out and back in (Step 5)
- [ ] Premium status is active in app

## Alternative: Use Supabase SQL Editor

If the API doesn't work, you can still upgrade via SQL:

1. Go to: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh/sql/new
2. Run `UPGRADE_DANIELLE_TO_LIFETIME.sql`
3. User must log out and log back in

