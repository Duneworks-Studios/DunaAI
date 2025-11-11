# Quick Upgrade on Netlify

## Fastest Method: Browser Console

1. **Go to your Netlify site** (e.g., `https://your-site.netlify.app`)

2. **Open browser console** (F12)

3. **Run this code** (replace `your-site.netlify.app` with your actual URL):
```javascript
// Upgrade user
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
  console.log('Upgrade result:', data)
  if (data.success) {
    alert('✅ User upgraded! Tell user to LOG OUT and LOG BACK IN.')
  } else {
    alert('❌ Error: ' + JSON.stringify(data))
  }
})
```

4. **Verify it worked**:
```javascript
// Check user status
fetch('https://your-site.netlify.app/api/admin/check-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'Danielleebuckley2010@gmail.com'
  })
})
.then(r => r.json())
.then(data => {
  console.log('User status:', data)
  if (data.isPremium) {
    console.log('✅ User is premium!')
  } else {
    console.log('❌ User is not premium')
  }
})
```

5. **User must log out and log back in**

## Important: Environment Variables

Make sure in Netlify Dashboard:
- **Site settings** → **Environment variables**
- Has `SUPABASE_SERVICE_ROLE_KEY`
- **Redeploy** after adding/changing environment variables

## If It Doesn't Work

1. Check Netlify logs for errors
2. Verify environment variables are set
3. Make sure site is redeployed
4. Try upgrading via SQL in Supabase (see `UPGRADE_DANIELLE_TO_LIFETIME.sql`)

