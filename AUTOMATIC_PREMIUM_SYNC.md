# Automatic Premium Sync for All Users

## How It Works

The system **automatically syncs premium status for ALL users** who purchase on Whop. Here's how:

1. **User purchases premium on Whop** (monthly or lifetime)
2. **Whop sends webhook** to `/api/whop/webhook` with purchase details
3. **Webhook automatically**:
   - Finds the user by email
   - Updates user metadata in Supabase
   - Updates `user_plans` table in database
   - User gets premium access immediately

## Setup Requirements

### 1. Webhook URL in Whop Dashboard

**CRITICAL:** Make sure your webhook URL is set in Whop:

1. Go to https://whop.com/dashboard
2. Navigate to your product → Settings → Webhooks
3. Set webhook URL to: `https://your-site.netlify.app/api/whop/webhook`
   (Replace with your actual Netlify domain)
4. Copy the webhook secret

### 2. Environment Variables in Netlify

Make sure these are set in Netlify Dashboard → Site Settings → Environment Variables:

```bash
WHOP_WEBHOOK_SECRET=your_webhook_secret_from_whop
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
```

### 3. Webhook Events Enabled

In Whop dashboard, make sure these events are enabled:
- ✅ `checkout.completed` - When purchase is completed
- ✅ `subscription.created` - When subscription is created
- ✅ `subscription.activated` - When subscription activates
- ✅ `subscription.cancelled` - When subscription is cancelled
- ✅ `subscription.expired` - When subscription expires

### 4. Database Table

Make sure `user_plans` table exists (see `SUPABASE_SETUP.md`)

## How It Works for Each User

**When ANY user purchases premium:**

1. Whop sends webhook → `/api/whop/webhook`
2. Webhook extracts customer email from purchase
3. Finds user in Supabase by email (case-insensitive)
4. Updates:
   - User metadata (`plan`, `plan_type`, `subscription_status`)
   - `user_plans` table (database record)
5. User automatically gets premium access

**No manual intervention needed!** It works for everyone automatically.

## Testing

### Test the Webhook

1. Make a test purchase on Whop
2. Check Netlify logs (Site → Functions → View logs)
3. You should see:
   ```
   Processing upgrade for: user@example.com Plan: plan_xxx
   ✅ Updated user_plans table with plan_type: pro_lifetime
   ✅ User user@example.com upgraded to pro_lifetime plan
   ```

### Verify User Got Premium

1. User logs out and logs back in (to refresh session)
2. Check browser console for:
   ```
   ✅ Premium plan detected from user_plans table
   ✅ User IS detected as premium
   ```

## Troubleshooting

### Webhook Not Firing

- **Check webhook URL** in Whop dashboard matches your Netlify domain
- **Check webhook secret** matches in Netlify environment variables
- **Check Netlify logs** for webhook errors
- **Test webhook** by making a purchase

### User Not Getting Premium

- **Check email matches** - The email in Whop purchase must match the email they signed up with
- **Check user exists** - User must sign up first before purchasing
- **Check logs** - Look for errors in Netlify function logs
- **Manual sync** - Use `/api/whop/sync` endpoint if webhook missed it

### User Not Found Error

If webhook says "User not found":
- User needs to **sign up first** with the same email they used on Whop
- After signing up, they can use `/api/whop/sync` to sync manually
- Or they can log out/in after webhook processes (if they sign up after purchase)

## Manual Sync (Backup)

If webhook doesn't fire or user signs up after purchase, use:

```javascript
fetch('https://your-site.netlify.app/api/whop/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
})
```

## Important Notes

- ✅ **Works automatically** for ALL users who purchase
- ✅ **No manual steps** needed for each user
- ✅ **Updates both** metadata and database
- ✅ **Handles** monthly and lifetime plans
- ✅ **Handles** cancellations automatically

The webhook is the primary method - it automatically handles every purchase!

