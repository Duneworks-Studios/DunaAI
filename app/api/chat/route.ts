import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { messages, userId, agent = 'chat' } = await request.json()

    // Get AI service configuration
    // Support both DeepSeek and OpenAI
    const AI_ENDPOINT = process.env.AI_ENDPOINT || process.env.DEEPSEEK_API_URL || process.env.OPENAI_API_URL || 'https://api.deepseek.com/v1/chat/completions'
    const AI_TOKEN = process.env.AI_TOKEN || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY
    const AI_MODEL = process.env.AI_MODEL || 'deepseek-chat' // Default to DeepSeek

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('AI Configuration Check:')
      console.log('- AI_ENDPOINT:', AI_ENDPOINT)
      console.log('- AI_MODEL:', AI_MODEL)
      console.log('- AI_TOKEN exists:', !!AI_TOKEN)
      console.log('- AI_TOKEN starts with:', AI_TOKEN ? AI_TOKEN.substring(0, 7) + '...' : 'N/A')
    }

    // Check if AI service is configured
    if (!AI_TOKEN) {
      return NextResponse.json({
        response: `🤖 AI Service Not Configured

I'm currently running in placeholder mode because no AI service is connected.

To enable real AI responses:

1. **Get a DeepSeek API key** from https://platform.deepseek.com/api_keys
   OR **Get an OpenAI API key** from https://platform.openai.com/api-keys
2. **Add to your .env.local file:**
   \`\`\`
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   # OR
   OPENAI_API_KEY=sk-your-openai-api-key-here
   \`\`\`
3. **Restart the development server** (stop and restart \`npm run dev\`)

Once configured, I'll provide intelligent responses!

For now, you asked: "${messages[messages.length - 1]?.content || 'something'}"

What would you like to know?`
      })
    }

    // Auto-detect service type based on endpoint
    const isDeepSeek = AI_ENDPOINT.includes('deepseek.com')
    const finalModel = AI_MODEL || (isDeepSeek ? 'deepseek-chat' : 'gpt-4')
    
    if (process.env.NODE_ENV === 'development') {
      console.log('- Detected service:', isDeepSeek ? 'DeepSeek' : 'OpenAI')
      console.log('- Using model:', finalModel)
      console.log('- Agent type:', agent)
    }

    // Build system prompt based on agent type
    let systemPrompt = ''
    if (agent === 'coding') {
      systemPrompt = 'You are Duna Coding Agent, an expert AI assistant specialized in programming, software development, and technical problem-solving. You provide clear, concise, and accurate code solutions, explanations, and debugging help. Always write clean, well-documented code and explain your reasoning.'
    } else {
      systemPrompt = 'You are Duna, an intelligent AI assistant created by Duneworks Studios. You are helpful, friendly, and provide clear, accurate responses to user questions.'
    }

    // Prepare messages with system prompt
    const messagesWithSystem = [
      { role: 'system', content: systemPrompt },
      ...messages
    ]

    // Call AI API (DeepSeek or OpenAI)
    const aiResponse = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: finalModel,
        messages: messagesWithSystem,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => ({ error: { message: 'Unknown error' } }))
      console.error('AI API error:', aiResponse.status, errorData)
      
      let errorMessage = `❌ AI Service Error (${aiResponse.status})`
      
      if (aiResponse.status === 401) {
        const serviceName = AI_ENDPOINT.includes('deepseek') ? 'DeepSeek' : 'OpenAI'
        errorMessage = `❌ Authentication Failed (401)

Your ${serviceName} API key is invalid or expired.

**To fix this:**

1. **Check your API key** at ${AI_ENDPOINT.includes('deepseek') ? 'https://platform.deepseek.com/api_keys' : 'https://platform.openai.com/api-keys'}
2. **Verify it's correct** in your .env.local file:
   - Should be the complete key (no spaces or extra characters)
   - For DeepSeek: Use DEEPSEEK_API_KEY
   - For OpenAI: Should start with "sk-"
3. **Make sure you've restarted** the development server after adding the key
4. **Check your account** has available credits

**Common issues:**
- API key copied incorrectly (missing characters)
- API key expired or revoked
- Wrong API key (using a different account's key)
- Account has no credits/billing not set up`
      } else if (aiResponse.status === 429) {
        errorMessage = `❌ Rate Limit Exceeded (429)

You've hit the AI service rate limit. Please wait a moment and try again.

If this persists, check your usage limits.`
      } else if (aiResponse.status === 500) {
        errorMessage = `❌ AI Service Server Error (500)

The AI service servers are experiencing issues. Please try again in a moment.`
      } else {
        errorMessage = `❌ AI Service Error (${aiResponse.status})

${errorData?.error?.message || 'An unexpected error occurred'}

Please check your API configuration and try again.`
      }
      
      return NextResponse.json({
        response: errorMessage
      })
    }

    const data = await aiResponse.json()
    const response = data.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.'

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      {
        response: `❌ Unexpected Error

Something went wrong while processing your request. Please try again.

Error details: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    )
  }
}

