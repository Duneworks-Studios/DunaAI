-- Fix existing tables - Safe to run multiple times
-- This SQL handles cases where tables/constraints already exist

-- Drop existing constraint if it exists (safe)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_messages_user_id_fkey'
    ) THEN
        ALTER TABLE public.user_messages DROP CONSTRAINT user_messages_user_id_fkey;
    END IF;
END $$;

-- Create user_messages table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraint (only if table exists and constraint doesn't)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_messages_user_id_fkey'
    ) THEN
        ALTER TABLE public.user_messages 
        ADD CONSTRAINT user_messages_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes (IF NOT EXISTS handles duplicates)
CREATE INDEX IF NOT EXISTS idx_user_messages_user_id ON public.user_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON public.user_messages(created_at);

-- Enable RLS
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies (safe)
DROP POLICY IF EXISTS "Users can view their own messages" ON public.user_messages;
CREATE POLICY "Users can view their own messages"
  ON public.user_messages
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own messages" ON public.user_messages;
CREATE POLICY "Users can insert their own messages"
  ON public.user_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create user_plans table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_plans (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  subscription_id TEXT,
  whop_plan_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add constraint for user_plans (only if doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_plans_user_id_fkey'
    ) THEN
        ALTER TABLE public.user_plans 
        ADD CONSTRAINT user_plans_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add check constraint for plan_type
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_plans_plan_type_check'
    ) THEN
        ALTER TABLE public.user_plans 
        ADD CONSTRAINT user_plans_plan_type_check 
        CHECK (plan_type IN ('free', 'pro', 'pro_lifetime'));
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON public.user_plans(user_id);

-- Enable RLS
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view their own plan" ON public.user_plans;
CREATE POLICY "Users can view their own plan"
  ON public.user_plans
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage plans" ON public.user_plans;
CREATE POLICY "Service role can manage plans"
  ON public.user_plans
  FOR ALL
  USING (true)
  WITH CHECK (true);

