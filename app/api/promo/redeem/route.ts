import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Special code that shows all available codes
const SPECIAL_CODE = 'QmFieSBWb2xyYWlkZW4gSXMgQSBDdXRpZSBXdXRpZQ=='

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json()

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Code and userId are required' },
        { status: 400 }
      )
    }

    // Get service role key from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase credentials not configured' },
        { status: 500 }
      )
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Handle special code - show all codes with status
    if (code === SPECIAL_CODE) {
      // Check if table exists first
      const { data: allCodes, error: codesError } = await supabaseAdmin
        .from('promo_codes')
        .select('code, code_text, is_used, used_at, used_by_user_id')
        .order('code_text', { ascending: true })

      if (codesError) {
        // Check if it's a "table doesn't exist" error
        if (codesError.message?.includes('Could not find the table') || 
            codesError.message?.includes('relation') ||
            codesError.code === '42P01') {
          return NextResponse.json(
            { 
              error: 'The promo_codes table has not been created yet. Please run the CREATE_PROMO_CODES_TABLE.sql script in your Supabase SQL Editor first.',
              needsSetup: true
            },
            { status: 404 }
          )
        }
        return NextResponse.json(
          { error: `Failed to fetch codes: ${codesError.message}` },
          { status: 500 }
        )
      }

      const availableCodes = allCodes?.filter(c => !c.is_used) || []
      const usedCodes = allCodes?.filter(c => c.is_used) || []

      return NextResponse.json({
        success: true,
        isSpecialCode: true,
        message: 'All promo codes with status:',
        totalCodes: allCodes?.length || 0,
        availableCodes: availableCodes.length,
        usedCodes: usedCodes.length,
        codes: allCodes?.map(c => ({
          code: c.code,
          text: c.code_text,
          isUsed: c.is_used,
          usedAt: c.used_at,
          usedBy: c.used_by_user_id
        })) || []
      })
    }

    // Check if code exists and is valid
    const { data: promoCode, error: codeError } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .maybeSingle()

    if (codeError) {
      // Check if it's a "table doesn't exist" error
      if (codeError.message?.includes('Could not find the table') || 
          codeError.message?.includes('relation') ||
          codeError.code === '42P01') {
        return NextResponse.json(
          { 
            error: 'The promo_codes table has not been created yet. Please run the CREATE_PROMO_CODES_TABLE.sql script in your Supabase SQL Editor first.',
            needsSetup: true
          },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: `Failed to check code: ${codeError.message}` },
        { status: 500 }
      )
    }

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Invalid promo code' },
        { status: 404 }
      )
    }

    // Check if code is already used
    if (promoCode.is_used) {
      return NextResponse.json(
        { error: 'This promo code has already been used' },
        { status: 400 }
      )
    }

    // Get user
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = userData.user

    // Mark code as used
    const { error: updateCodeError } = await supabaseAdmin
      .from('promo_codes')
      .update({
        is_used: true,
        used_by_user_id: userId,
        used_at: new Date().toISOString(),
      })
      .eq('code', code)

    if (updateCodeError) {
      return NextResponse.json(
        { error: `Failed to mark code as used: ${updateCodeError.message}` },
        { status: 500 }
      )
    }

    // Upgrade user to pro_lifetime
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          ...user.user_metadata,
          plan: 'pro',
          plan_type: 'pro_lifetime',
          subscription_status: 'active',
          upgraded_at: new Date().toISOString(),
          promo_code_used: promoCode.code_text,
        },
      }
    )

    if (updateError) {
      // Try to revert code usage if user update fails
      await supabaseAdmin
        .from('promo_codes')
        .update({
          is_used: false,
          used_by_user_id: null,
          used_at: null,
        })
        .eq('code', code)

      return NextResponse.json(
        { error: `Failed to upgrade user: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Update user_plans table
    try {
      await supabaseAdmin
        .from('user_plans')
        .upsert({
          user_id: userId,
          plan_type: 'pro_lifetime',
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
    } catch (error) {
      console.error('Error updating user_plans table:', error)
      // Continue even if this fails
    }

    return NextResponse.json({
      success: true,
      message: `Successfully redeemed code: ${promoCode.code_text}`,
      code: promoCode.code_text,
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        plan_type: 'pro_lifetime',
      },
    })
  } catch (error) {
    console.error('Error redeeming promo code:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}

