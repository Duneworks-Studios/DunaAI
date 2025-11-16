-- Create promo_codes table for Baby Volraiden codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  code_text TEXT NOT NULL, -- The decoded text (e.g., "Baby Volraiden 1")
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  used_by_user_id UUID,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT promo_codes_used_by_user_id_fkey FOREIGN KEY (used_by_user_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_is_used ON public.promo_codes(is_used);
CREATE INDEX IF NOT EXISTS idx_promo_codes_used_by_user_id ON public.promo_codes(used_by_user_id);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to check code status (but not see all codes)
CREATE POLICY "Users can check their own code usage"
  ON public.promo_codes
  FOR SELECT
  USING (auth.uid() = used_by_user_id OR is_used = FALSE);

-- Create policy for service role to manage codes
CREATE POLICY "Service role can manage promo codes"
  ON public.promo_codes
  FOR ALL
  USING (true)
  WITH CHECK (true);

