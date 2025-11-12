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

**When ANY user purchases premium (Monthly or Lifetime):**

1. **User clicks checkout** on your site (while logged in)
2. **User completes purchase** on Whop checkout page
3. **Whop sends webhook** → `/api/whop/webhook` with purchase details
4. **Webhook automatically**:
   - Extracts customer email from purchase (handles multiple event structures)
   - Extracts plan ID to determine Monthly vs Lifetime
   - Finds user in Supabase by email (case-insensitive, efficient lookup)
   - Determines plan type: `pro` (Monthly) or `pro_lifetime` (Lifetime)
   - Updates user metadata (`plan`, `plan_type`, `subscription_status`, `whop_plan_id`)
   - Updates `user_plans` table (database record)
   - Verifies the update was successful
5. **User automatically gets premium access** - no manual steps needed!

**No manual intervention needed!** It works for everyone automatically.

### Plan Detection

The webhook automatically detects:
- **Monthly Plan** (`plan_vhBLiFWs6AJNx`) → Sets `plan_type: 'pro'`
- **Lifetime Plan** (`plan_nAv9o4mMRgV37`) → Sets `plan_type: 'pro_lifetime'`

Detection works by:
- Matching plan IDs
- Checking plan names for "lifetime" keyword
- Handling various Whop event data structures

## Testing

### Test the Webhook

1. Make a test purchase on Whop (Monthly or Lifetime)
2. Check Netlify logs (Site → Functions → View logs) or server logs
3. You should see detailed logs like:
   ```
   🔔 Whop Webhook Event: { type: 'checkout.completed', customerEmail: '...', planId: '...' }
   📦 Processing upgrade for: user@example.com Plan ID: plan_xxx
   ✅ Found user by email: user@example.com
   📋 Plan Type Detected: pro_lifetime (Plan ID: plan_nAv9o4mMRgV37, Is Lifetime: true)
   ✅ Updated user_plans table with plan_type: pro_lifetime
   ✅ User user@example.com upgraded to pro_lifetime plan
   📊 Verification: { metadataPlanType: 'pro_lifetime', databasePlanType: 'pro_lifetime', ... }
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
- ✅ **Updates both** metadata and database table
- ✅ **Automatically detects** Monthly vs Lifetime plans
- ✅ **Handles** cancellations and expirations automatically
- ✅ **Robust email matching** - handles various Whop event structures
- ✅ **Efficient user lookup** - uses direct email lookup when possible
- ✅ **Comprehensive logging** - easy to debug issues
- ✅ **Verification** - confirms updates were successful

The webhook is the primary method - it automatically handles every purchase!

## Technical Details

### Event Types Handled

- `checkout.completed` - When user completes purchase
- `subscription.created` - When subscription is created
- `subscription.activated` - When subscription activates
- `subscription.cancelled` - When subscription is cancelled
- `subscription.expired` - When subscription expires
- `subscription.deactivated` - When subscription is deactivated

### Data Extraction

The webhook extracts data from multiple possible locations in the Whop event:
- Customer email: `customer.email`, `customer_email`, `email`, `user.email`, `membership.user.email`
- Plan ID: `plan.id`, `plan_id`, `membership.plan.id`, `subscription.plan.id`
- Subscription ID: `subscription.id`, `subscription_id`, `id`, `membership.id`

This ensures compatibility with different Whop API versions and event structures.

