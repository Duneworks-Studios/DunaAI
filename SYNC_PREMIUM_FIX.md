# Fix Premium Sync Issue

## Problem
When you purchase premium on Whop, it should automatically sync to your account, but sometimes the webhook doesn't fire or there's a sync issue.

## Solution: Manual Sync

I've created a sync endpoint that will manually sync your premium status. Here's how to use it:

### Option 1: Using the API Endpoint (Recommended)

**If running locally:**
```bash
curl -X POST http://localhost:3000/api/whop/sync \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com"}'
```

**If deployed (replace with your domain):**
```bash
curl -X POST https://your-domain.com/api/whop/sync \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com"}'
```

### Option 2: Using Browser Console

1. Go to your site
2. Open browser console (F12)
3. Run:
```javascript
fetch('/api/whop/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'Danielleebuckley2010@gmail.com'
  })
})
.then(r => r.json())
.then(console.log)
```

### Option 3: Using the Upgrade Endpoint

You can also use the existing upgrade endpoint:
```bash
curl -X POST http://localhost:3000/api/admin/upgrade-user \
  -H "Content-Type: application/json" \
  -d '{"email": "Danielleebuckley2010@gmail.com", "planType": "pro_lifetime"}'
```

## After Syncing

**IMPORTANT:** After the sync, you MUST:
1. **Log out** of your account
2. **Log back in**
3. Your premium status will now be active!

This is because your session has cached metadata. Logging out and back in refreshes the session with the updated premium status.

## What the Sync Endpoint Does

1. Finds your user account by email (case-insensitive)
2. Optionally checks Whop API if API key is configured
3. Updates your user metadata with premium status
4. Updates the `user_plans` table
5. Returns confirmation

## Troubleshooting

- **User not found**: Make sure you've signed up first with that email
- **Still not premium after sync**: Make sure you logged out and back in
- **API errors**: Check that `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`

## Future Prevention

The webhook should automatically handle future purchases. Make sure:
1. `WHOP_WEBHOOK_SECRET` is set in `.env.local`
2. Webhook URL is configured in Whop dashboard: `https://your-domain.com/api/whop/webhook`
3. Webhook events are enabled: `checkout.completed`, `subscription.created`, `subscription.activated`

