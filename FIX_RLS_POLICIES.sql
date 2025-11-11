-- Fix RLS Policies for user_plans table
-- Run this if users can't see their own plan data

-- First, check if the table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'user_plans'
);

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view their own plan" ON public.user_plans;
DROP POLICY IF EXISTS "Service role can manage plans" ON public.user_plans;
DROP POLICY IF EXISTS "Users can read their own plan" ON public.user_plans;

-- Create policy for users to view their own plan
CREATE POLICY "Users can view their own plan"
  ON public.user_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for service role to manage all plans
-- This allows the Admin API to update plans
CREATE POLICY "Service role can manage plans"
  ON public.user_plans
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_plans';

-- Test: Check if a user can see their plan
-- Replace 'user-id-here' with actual user ID
-- SELECT * FROM public.user_plans WHERE user_id = 'user-id-here';

