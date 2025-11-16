# Promo Code System Setup Guide

This guide will help you set up the Baby Volraiden promo code system.

## Overview

The system includes:
- **10,000 promo codes** for "Baby Volraiden 1" through "Baby Volraiden 10000"
- **Special code** `QmFieSBWb2xyYWlkZW4gSXMgQSBDdXRpZSBXdXRpZQ==` that shows all available codes
- Each code upgrades a user to **Pro Lifetime** when redeemed
- Codes can only be used **once** and are tracked in the database

## Step 1: Create the Database Table

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Run the SQL from `CREATE_PROMO_CODES_TABLE.sql`:

```sql
-- Copy and paste the entire contents of CREATE_PROMO_CODES_TABLE.sql
```

This creates the `promo_codes` table with proper indexes and RLS policies.

## Step 2: Generate All Promo Codes

1. Make sure you have Node.js installed
2. Run the code generation script:

```bash
node scripts/generate-promo-codes.js
```

This will create `INSERT_PROMO_CODES.sql` with all 10,001 codes (including the special code).

## Step 3: Insert Codes into Database

1. Go back to Supabase **SQL Editor**
2. Open the generated `INSERT_PROMO_CODES.sql` file
3. Copy and paste the entire contents
4. Click **Run** to insert all codes

**Note:** This may take a few minutes since it's inserting 10,001 rows. The `ON CONFLICT DO NOTHING` clause ensures it's safe to run multiple times.

## Step 4: Verify Installation

Run this query in Supabase SQL Editor:

```sql
SELECT 
  COUNT(*) as total_codes,
  COUNT(*) FILTER (WHERE is_used = FALSE) as available_codes,
  COUNT(*) FILTER (WHERE is_used = TRUE) as used_codes
FROM public.promo_codes;
```

You should see:
- `total_codes`: 10001
- `available_codes`: 10001 (or less if any have been used)
- `used_codes`: 0 (initially)

## Step 5: Test the System

1. Log into your app
2. Click on your profile menu (top right)
3. Click **"Redeem Promo Code"**
4. Try entering: `QmFieSBWb2xyYWlkZW4gMQ==` (Baby Volraiden 1)
5. You should be upgraded to Pro Lifetime!

## Special Code

The code `QmFieSBWb2xyYWlkZW4gSXMgQSBDdXRpZSBXdXRpZQ==` (Baby Volraiden Is A Cutie Wutie) will:
- Show all available (unused) promo codes
- Display them in a scrollable list
- Allow you to click "Use" to copy and use any code

## Code Format

All codes are Base64 encoded versions of:
- `Baby Volraiden 1` → `QmFieSBWb2xyYWlkZW4gMQ==`
- `Baby Volraiden 2` → `QmFieSBWb2xyYWlkZW4gMg==`
- ... and so on up to 10000

## How It Works

1. **User enters code** → Validated against database
2. **Code checked** → Must exist and not be used
3. **User upgraded** → Plan set to `pro_lifetime` in both metadata and `user_plans` table
4. **Code marked as used** → Cannot be used again
5. **Error handling** → Shows "Invalid code" or "Code already used" messages

## Troubleshooting

### Codes not inserting?
- Make sure the `promo_codes` table exists first
- Check for any SQL errors in the Supabase console
- Try running in smaller batches if needed

### "Invalid code" error?
- Verify the code is correct (case-sensitive)
- Check that the code exists in the database
- Ensure the code hasn't been used already

### User not upgrading?
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set in environment variables
- Verify the `user_plans` table exists
- Check browser console for errors

## Security Notes

- Codes are stored in the database with proper RLS policies
- Only the service role can manage codes (for security)
- Users can only see codes they've used themselves
- All code redemption is logged with user ID and timestamp

## API Endpoint

The promo code redemption API is at:
```
POST /api/promo/redeem
Body: { code: string, userId: string }
```

Returns:
- Success: `{ success: true, message: "...", code: "...", user: {...} }`
- Error: `{ error: "..." }`
- Special code: `{ isSpecialCode: true, codes: [...] }`

