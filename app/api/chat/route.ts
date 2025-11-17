import { NextRequest, NextResponse } from 'next/server'

// Configure route timeout (60 seconds for AI API calls - balanced for speed and reliability)
export const maxDuration = 60
export const dynamic = 'force-dynamic'

// Helper function to create a fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 60000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - the AI service took too long to respond')
    }
    throw error
  }
}

// Retry function for handling 504 errors
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries: number = 2,
  timeoutMs: number = 60000
): Promise<Response> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Wait before retry (quick backoff: 0.5s, 1s for faster retries)
        await new Promise(resolve => setTimeout(resolve, 500 * attempt))
        console.log(`Retrying AI API request (attempt ${attempt + 1}/${maxRetries + 1})...`)
      }
      
      const response = await fetchWithTimeout(url, options, timeoutMs)
      
      // If 504 error and we have retries left, retry
      if (response.status === 504 && attempt < maxRetries) {
        console.log(`504 Gateway Timeout, retrying... (${attempt + 1}/${maxRetries})`)
        continue
      }
      
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // If timeout and we have retries left, retry
      if (lastError.message.includes('timeout') && attempt < maxRetries) {
        console.log(`Request timeout, retrying... (${attempt + 1}/${maxRetries})`)
        continue
      }
      
      // If last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch after retries')
}

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

    // Prepare messages with system prompt and handle images
    const formatMessage = (msg: any) => {
      if (msg.images && msg.images.length > 0) {
        // Format for vision models (OpenAI/DeepSeek vision format)
        const contentParts: any[] = [
          { type: 'text', text: msg.content || 'What is in this image?' }
        ]
        
        // Add images to content
        msg.images.forEach((imgBase64: string) => {
          // Use the original base64 string (already includes data:image/...;base64, prefix)
          // If it doesn't have the prefix, add a default one
          const imageUrl = imgBase64.includes('data:') 
            ? imgBase64 
            : `data:image/jpeg;base64,${imgBase64}`
          
          contentParts.push({
            type: 'image_url',
            image_url: {
              url: imageUrl
            }
          })
        })
        
        return {
          role: msg.role,
          content: contentParts
        }
      }
      return {
        role: msg.role,
        content: msg.content
      }
    }

    const messagesWithSystem = [
      { role: 'system', content: systemPrompt },
      ...messages.map(formatMessage)
    ]

    // Use vision model if images are present
    let modelToUse = finalModel
    const hasImages = messages.some((m: any) => m.images && m.images.length > 0)
    
    if (hasImages) {
      // Use vision-capable models
      if (isDeepSeek) {
        modelToUse = 'deepseek-chat' // DeepSeek supports vision
      } else {
        // OpenAI vision models
        modelToUse = 'gpt-4o' // or 'gpt-4-vision-preview'
      }
    }

    // Call AI API (DeepSeek or OpenAI) with timeout and retry logic
    const aiResponse = await fetchWithRetry(
      AI_ENDPOINT,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AI_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: messagesWithSystem,
          max_tokens: 2000,
          temperature: 0.7,
        }),
      },
      2, // Max 2 retries (3 total attempts) - balanced for speed and reliability
      60000 // 60 second timeout - balanced for speed and reliability
    )

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
      } else if (aiResponse.status === 504) {
        errorMessage = `❌ Gateway Timeout (504)

The AI service took too long to respond. This can happen when:
- The service is experiencing high load
- Your request is complex and needs more processing time
- Network connectivity issues

**What you can do:**
- Try again in a few moments
- Simplify your question if it's very complex
- Check your internet connection

I've automatically retried the request, but it still timed out. Please try again.`
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
    
    let errorMessage = `❌ Unexpected Error

Something went wrong while processing your request. Please try again.`

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = `❌ Request Timeout

The AI service took too long to respond (over 60 seconds). This can happen when:
- The service is experiencing high load
- Your question requires complex processing
- Network connectivity issues

**What you can do:**
- Try again in a few moments
- Break down complex questions into smaller parts
- Check your internet connection`
      } else if (error.message.includes('fetch')) {
        errorMessage = `❌ Network Error

Unable to connect to the AI service. This could be due to:
- Network connectivity issues
- The AI service being temporarily unavailable
- Firewall or proxy blocking the connection

**What you can do:**
- Check your internet connection
- Try again in a few moments
- Contact support if the issue persists`
      } else {
        errorMessage = `❌ Unexpected Error

${error.message}

Please try again. If this persists, the AI service may be experiencing issues.`
      }
    }
    
    return NextResponse.json(
      {
        response: errorMessage
      },
      { status: 500 }
    )
  }
}

