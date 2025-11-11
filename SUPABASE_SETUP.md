# Supabase Database Setup Guide

## Required Database Table

To track user message limits, you need to create a `user_messages` table in your Supabase database.

### Step 1: Open Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar

### Step 2: Create the Table

Run this SQL query in the SQL Editor:

```sql
-- Create user_messages table
CREATE TABLE IF NOT EXISTS public.user_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_messages_user_id ON public.user_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON public.user_messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own messages
CREATE POLICY "Users can view their own messages"
  ON public.user_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own messages
CREATE POLICY "Users can insert their own messages"
  ON public.user_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Step 3: Verify the Table

After running the SQL:
1. Go to "Table Editor" in Supabase
2. You should see `user_messages` table
3. It should have columns: `id`, `user_id`, `created_at`

### Step 4: Test

The app will now be able to:
- Track daily message counts per user
- Enforce the 20 messages/day limit for free users
- Allow unlimited messages for Pro users

## Required: User Plan Tracking

Create the `user_plans` table to track Pro subscriptions and enable automatic premium upgrades:

```sql
-- Create user_plans table
CREATE TABLE IF NOT EXISTS public.user_plans (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'pro_lifetime')),
  subscription_status TEXT DEFAULT 'inactive',
  subscription_id TEXT,
  whop_plan_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON public.user_plans(user_id);

-- Enable RLS
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own plan
CREATE POLICY "Users can view their own plan"
  ON public.user_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for service role to update plans (for webhooks)
CREATE POLICY "Service role can manage plans"
  ON public.user_plans
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

**Note:** The last policy allows the service role (used by webhooks) to update plans. This is necessary for automatic premium upgrades.

## Troubleshooting

If you see errors like:
- `Could not find the table 'public.user_messages'` → Run the SQL above
- `permission denied` → Check RLS policies are set up correctly
- `relation does not exist` → Make sure you're in the correct database/schema

The app will continue to work without this table, but message limits won't be tracked.

