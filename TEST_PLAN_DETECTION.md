# Test Plan Detection

## Quick Test Script

Run this in the browser console (F12) while logged in as the user:

```javascript
// Test plan detection
async function testPlan() {
  const supabase = window.supabase || (await import('@supabase/supabase-js')).createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  
  console.log('=== USER INFO ===')
  console.log('User ID:', user?.id)
  console.log('Email:', user?.email)
  console.log('User Metadata:', user?.user_metadata)
  
  // Check user_plans table
  const { data: planData, error: planError } = await supabase
    .from('user_plans')
    .select('*')
    .eq('user_id', user?.id)
    .single()
  
  console.log('=== USER PLANS TABLE ===')
  console.log('Plan Data:', planData)
  console.log('Plan Error:', planError)
  
  // Check if premium
  const isPro = planData?.plan_type === 'pro' || 
                planData?.plan_type === 'pro_lifetime' ||
                user?.user_metadata?.plan_type === 'pro' ||
                user?.user_metadata?.plan_type === 'pro_lifetime' ||
                user?.user_metadata?.plan === 'pro'
  
  console.log('=== RESULT ===')
  console.log('Is Premium:', isPro)
  console.log('Plan Type:', planData?.plan_type || user?.user_metadata?.plan_type)
}

testPlan()
```

This will show you exactly what the app is seeing.

