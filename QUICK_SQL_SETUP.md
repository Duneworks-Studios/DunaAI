# Quick SQL Setup Guide for Supabase

## Step-by-Step Instructions

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Select your project: **jjfjzpcnclccmjwdglgh**

### Step 2: Open SQL Editor
1. In the left sidebar, click on **"SQL Editor"** (it has a `</>` icon)
2. Click the **"New query"** button (top right)

### Step 3: Copy and Paste SQL

Copy the entire SQL block below and paste it into the SQL Editor:

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

### Step 4: Run the SQL
1. Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
2. Wait for the query to complete
3. You should see "Success. No rows returned" or similar success message

### Step 5: Verify Tables Were Created
1. In the left sidebar, click on **"Table Editor"**
2. You should now see two new tables:
   - `user_messages` (with columns: id, user_id, created_at)
   - `user_plans` (with columns: id, user_id, plan_type, subscription_status, etc.)

## Troubleshooting

**If you get an error:**
- **"permission denied"** → Make sure you're logged in as the project owner
- **"relation already exists"** → The table already exists, that's okay! The `IF NOT EXISTS` prevents errors
- **"syntax error"** → Make sure you copied the entire SQL block, including all semicolons

**To check if tables exist:**
- Go to Table Editor and look for `user_messages` and `user_plans`
- If they're there, you're all set! ✅

## What This Does

- **user_messages**: Tracks every message sent by users (for the 20/day limit)
- **user_plans**: Stores user subscription status (free/pro) for automatic premium detection

After running this SQL, your app will be able to:
- ✅ Track message counts accurately
- ✅ Enforce 20 messages/day limit for free users
- ✅ Automatically upgrade users to Pro when they purchase
- ✅ Detect premium status from database

