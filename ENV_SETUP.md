# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

## Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"

# Database (if using direct connection)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.jjfjzpcnclccmjwdglgh.supabase.co:5432/postgres"

# AI Service
AI_TOKEN="your_ai_service_token"
AI_ENDPOINT="https://api.openai.com/v1/chat/completions"  # Optional: Your AI endpoint URL

# Whop Integration (already configured in components)
# NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY="https://whop.com/checkout/plan_vhBLiFWs6AJNx?d2c=true"
# NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME="https://whop.com/checkout/plan_nAv9o4mMRgV37?d2c=true"
```

## Supabase Setup

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or use existing
3. Go to Settings → API
4. Copy the Project URL and anon/public key
5. Add them to `.env.local`

## Database Tables

You'll need to create these tables in Supabase:

### user_messages table
```sql
CREATE TABLE user_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_messages_user_date ON user_messages(user_id, created_at);
```

### chat_messages table (optional, for persistent chat history)
```sql
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, created_at);
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-domain.com/auth/callback`
4. Add credentials to Supabase Authentication → Providers → Google

## AI Service Integration

Update `/app/api/chat/route.ts` to connect to your AI service:

- OpenAI: Use the OpenAI SDK
- Anthropic: Use the Anthropic SDK
- Custom: Update the fetch call to your endpoint

