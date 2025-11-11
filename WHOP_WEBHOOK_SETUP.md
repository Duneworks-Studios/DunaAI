# Whop Webhook Setup Guide

## Overview

This guide explains how to set up Whop webhooks to automatically upgrade users to Pro when they purchase a subscription.

## Step 1: Get Your Webhook Secret

1. Go to your Whop dashboard: https://whop.com/dashboard
2. Navigate to your product settings
3. Go to "Webhooks" section
4. Create a new webhook endpoint
5. Copy the webhook secret

## Step 2: Configure Environment Variables

Add to your `.env.local`:

```bash
WHOP_WEBHOOK_SECRET=your_webhook_secret_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` is needed for the webhook to update user metadata. Get it from:
- Supabase Dashboard → Settings → API → Service Role Key (keep this secret!)

## Step 3: Set Up Webhook URL

In your Whop dashboard, set the webhook URL to:

```
https://your-domain.com/api/whop/webhook
```

For local development, use a tool like ngrok:
```bash
ngrok http 3000
# Then use: https://your-ngrok-url.ngrok.io/api/whop/webhook
```

## Step 4: Configure Webhook Events

Enable these events in Whop:
- `checkout.completed` - When a user completes a purchase
- `subscription.created` - When a subscription is created
- `subscription.cancelled` - When a subscription is cancelled
- `subscription.expired` - When a subscription expires

## Step 5: Create Database Tables

Make sure you've created the `user_plans` table (see `SUPABASE_SETUP.md`).

## Step 6: Test the Webhook

1. Make a test purchase in Whop
2. Check your server logs for webhook events
3. Verify the user's plan is updated in Supabase

## How It Works

1. User purchases Pro plan on Whop
2. Whop sends webhook to `/api/whop/webhook`
3. Webhook verifies signature
4. Finds user by email
5. Updates user metadata and `user_plans` table
6. User automatically gets Pro access

## Troubleshooting

- **401 Unauthorized**: Check webhook secret matches
- **User not found**: Make sure user email matches Whop customer email
- **Plan not updating**: Check Supabase service role key is correct
- **Table errors**: Make sure `user_plans` table exists (see SUPABASE_SETUP.md)

