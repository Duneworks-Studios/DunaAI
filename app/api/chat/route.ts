import { NextRequest, NextResponse } from 'next/server'

// Configure route timeout (180 seconds for AI API calls - very long for mobile/slow connections)
// Netlify allows up to 26 seconds on free tier, but Next.js can handle longer
export const maxDuration = 180
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // Ensure we're using Node.js runtime

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

// Retry function for handling 502, 503, and 504 errors with progressive timeout increases
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  maxRetries: number = 3,
  baseTimeoutMs: number = 60000
): Promise<Response> {
  let lastError: Error | null = null
  let lastResponse: Response | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Quick retry with minimal delay (0.5s, 1s, 1.5s) for faster recovery
        await new Promise(resolve => setTimeout(resolve, 500 * attempt))
        if (process.env.NODE_ENV === 'development') {
          console.log(`Retrying AI API request (attempt ${attempt + 1}/${maxRetries + 1})...`)
        }
      }
      
      // Use progressive timeouts - AI service often times out at 60s
      // Strategy: Start shorter, increase gradually to catch responses that are just slow
      // Try: 45s, 50s, 55s, 60s, 65s (avoid hitting 60s limit on first try)
      const currentTimeout = attempt === 0 
        ? 45000 // Start with 45s to avoid hitting AI service's 60s limit
        : 45000 + (5000 * attempt) // Add 5s per retry: 45s, 50s, 55s, 60s, 65s
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Attempt ${attempt + 1}: Using timeout of ${currentTimeout}ms`)
      }
      
      try {
        const response = await fetchWithTimeout(url, options, currentTimeout)
        
        // If we got a response, check if it's an error
        // Retry on 502 (Bad Gateway), 503 (Service Unavailable), and 504 (Gateway Timeout) - all indicate temporary issues
        if (!response.ok && (response.status === 502 || response.status === 503 || response.status === 504) && attempt < maxRetries) {
          const statusText = response.status === 502 ? 'Bad Gateway' : response.status === 503 ? 'Service Unavailable' : 'Gateway Timeout'
          if (process.env.NODE_ENV === 'development') {
            console.log(`${response.status} ${statusText} from AI service, retrying with longer timeout (${attempt + 1}/${maxRetries})...`)
          }
          lastResponse = response
          continue
        }
        
        return response
      } catch (fetchError) {
        // If fetch itself failed (network error, timeout, etc.), handle it
        if (fetchError instanceof Error) {
          lastError = fetchError
          // If it's a timeout and we have retries left, continue
          if (fetchError.message.includes('timeout') && attempt < maxRetries) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`Request timeout, retrying with longer timeout (${attempt + 1}/${maxRetries})...`)
            }
            continue
          }
        }
        throw fetchError
      }
    } catch (error) {
      // Catch any other errors
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // If timeout and we have retries left, retry with longer timeout
      if (lastError.message.includes('timeout') && attempt < maxRetries) {
        console.log(`Request timeout, retrying with longer timeout (${attempt + 1}/${maxRetries})...`)
        continue
      }
      
      // If last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError
      }
    }
  }
  
  // If we have a 502, 503, or 504 response, return it so it can be handled properly
  if (lastResponse && (lastResponse.status === 502 || lastResponse.status === 503 || lastResponse.status === 504)) {
    return lastResponse
  }
  
  throw lastError || new Error('Failed to fetch after retries')
}

export async function POST(request: NextRequest) {
  try {
    let requestData
    try {
      requestData = await request.json()
    } catch (parseError) {
      return NextResponse.json({
        response: `❌ Invalid Request

The request body is malformed or missing required data.

**What you can do:**
- Refresh the page and try again
- Clear your browser cache
- Contact support if the issue persists`
      }, { status: 400 })
    }
    
    const { messages, userId, agent = 'chat' } = requestData
    
    // Input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({
        response: '❌ Invalid Request: Messages array is required and must not be empty'
      }, { status: 400 })
    }
    
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      return NextResponse.json({
        response: '❌ Invalid Request: User ID is required'
      }, { status: 400 })
    }
    
    // Validate agent type
    const validAgents = ['meta-advanced', 'meta', 'universe', 'galaxy', 'jupiter', 'luna', 'nova-advanced', 'nova', 'chat']
    const validAgent = validAgents.includes(agent) ? agent : 'chat'
    
    // Limit message history length to prevent abuse
    const MAX_MESSAGES = 100
    const limitedMessages = messages.slice(-MAX_MESSAGES)
    
    // Validate message structure and content length
    const MAX_MESSAGE_LENGTH = 50000 // 50KB per message
    for (const msg of limitedMessages) {
      if (!msg || typeof msg !== 'object') {
        return NextResponse.json({
          response: '❌ Invalid Request: Each message must be an object'
        }, { status: 400 })
      }
      if (msg.content && typeof msg.content === 'string' && msg.content.length > MAX_MESSAGE_LENGTH) {
        return NextResponse.json({
          response: `❌ Invalid Request: Message content exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`
        }, { status: 400 })
      }
      if (msg.role && !['user', 'assistant', 'system'].includes(msg.role)) {
        return NextResponse.json({
          response: '❌ Invalid Request: Message role must be "user", "assistant", or "system"'
        }, { status: 400 })
      }
    }
    
    // CRITICAL: Strip images from all messages except the last one
    // This prevents API errors when message history contains images
    // We must completely remove the images property, not just set it to undefined
    const sanitizedMessages = limitedMessages.map((msg: any, index: number) => {
      const isLastMessage = index === messages.length - 1
      if (isLastMessage && msg.images && Array.isArray(msg.images) && msg.images.length > 0) {
        // Keep images only in the last message if it has images
        return {
          role: msg.role,
          content: msg.content || '',
          images: msg.images
        }
      } else {
        // Completely remove images property from all other messages
        // Create a new object without the images property
        const { images, ...messageWithoutImages } = msg
        return {
          role: messageWithoutImages.role,
          content: messageWithoutImages.content || ''
          // Explicitly omit images property
        }
      }
    })

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
      // Never log full tokens, even in development
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
      console.log('- Agent type:', validAgent)
    }

    // Build system prompt based on agent type
    // Agent types: meta-advanced, meta, universe, galaxy, jupiter, luna, nova-advanced, nova
    let systemPrompt = ''
    
    switch (validAgent) {
      case 'meta-advanced':
        // Best agent - highest quality, most advanced
        systemPrompt = `You are Duna AI Meta Advanced, the most advanced and highest quality AI assistant. You provide exceptionally detailed, comprehensive, and insightful responses with the highest level of accuracy and depth.

**General Responses:**
- Provide exceptionally detailed, well-researched responses with expert-level understanding
- Think deeply, consider multiple perspectives, and provide nuanced, high-quality answers
- Structure responses with clear sections, bullet points, and logical flow
- Include relevant examples, analogies, and real-world applications
- Anticipate follow-up questions and provide comprehensive context
- Use professional, articulate language while remaining accessible

**Code Responses:**
- Write production-ready, clean, efficient, and well-documented code
- Follow best practices, design patterns, and industry standards
- Include comprehensive comments, type hints, error handling, and edge cases
- Provide multiple solutions when appropriate (optimized, readable, alternative approaches)
- Explain the reasoning, trade-offs, and performance considerations
- Include usage examples, test cases, and potential improvements
- Format code with proper indentation, naming conventions, and structure
- Consider security, scalability, and maintainability in all code solutions`
        break
      case 'meta':
        // 2nd best - very advanced, fast and simpler but still advanced
        systemPrompt = `You are Duna AI Meta, a highly advanced AI assistant that provides fast, efficient, and sophisticated responses. You balance speed with depth, offering clear and concise yet comprehensive answers.

**General Responses:**
- Provide detailed, well-structured responses with strong analytical thinking
- Break down complex topics into understandable insights while maintaining high quality
- Use clear sections, examples, and practical applications
- Consider multiple perspectives and provide balanced, nuanced answers
- Maintain professional tone with excellent clarity

**Code Responses:**
- Write clean, efficient, well-documented code following best practices
- Include clear comments, error handling, and type hints where appropriate
- Provide explanations of the approach, key concepts, and trade-offs
- Include usage examples and consider edge cases
- Format code professionally with proper structure and naming conventions
- Balance code quality with readability and maintainability`
        break
      case 'universe':
        // 3rd best - high level for advanced questions
        systemPrompt = `You are Duna AI Universe, a high-level AI assistant specialized in handling advanced questions and providing sophisticated responses. You excel at complex problem-solving, deep analysis, and providing expert-level insights.

**General Responses:**
- Provide sophisticated, well-analyzed responses with strong analytical thinking
- Demonstrate comprehensive understanding and expert-level insights
- Structure responses clearly with logical flow and relevant examples
- Consider multiple angles and provide balanced perspectives
- Use professional language with clear explanations

**Code Responses:**
- Write professional, well-structured code with good documentation
- Follow best practices and include error handling
- Provide clear explanations of the solution approach
- Include comments and usage examples
- Format code properly with consistent style
- Consider performance and maintainability`
        break
      case 'galaxy':
        // 4th best - simpler and fast
        systemPrompt = `You are Duna AI Galaxy, an efficient AI assistant that provides fast, clear, and straightforward responses. You focus on delivering practical, actionable answers quickly while maintaining good quality.

**General Responses:**
- Provide clear, practical responses with good structure
- Simplify complex topics while maintaining accuracy
- Use examples and clear explanations
- Focus on actionable insights and useful information
- Maintain friendly, professional tone

**Code Responses:**
- Write clean, functional code with clear structure
- Include basic comments and error handling
- Provide brief explanations of the approach
- Include simple usage examples
- Format code consistently
- Focus on readability and functionality`
        break
      case 'jupiter':
        // 5th best - simple questions, fast
        systemPrompt = `You are Duna AI Jupiter, a fast and efficient AI assistant optimized for simple questions and quick responses. You provide clear, direct answers with good accuracy.

**General Responses:**
- Provide clear, direct responses with good structure
- Focus on speed and clarity while maintaining helpful, accurate responses
- Use simple examples and straightforward explanations
- Keep responses concise but informative
- Maintain friendly, approachable tone

**Code Responses:**
- Write clear, functional code with basic structure
- Include essential comments
- Provide simple explanations
- Format code consistently
- Focus on getting the job done correctly`
        break
      case 'luna':
        // 6th best - coding and advanced responses
        systemPrompt = `You are Duna AI Luna, an expert AI assistant specialized in coding and advanced technical responses. You excel at programming, software development, debugging, and technical problem-solving.

**General Responses:**
- Provide detailed technical responses with expert-level understanding
- Explain complex technical concepts clearly and thoroughly
- Use technical terminology appropriately with clear explanations
- Structure responses with clear sections and examples
- Consider practical applications and real-world scenarios

**Code Responses:**
- Write production-quality, well-architected code following best practices
- Include comprehensive documentation, type hints, and error handling
- Provide detailed explanations of architecture, design decisions, and trade-offs
- Include multiple solution approaches, performance analysis, and optimization tips
- Add comprehensive comments, usage examples, and test cases
- Consider security, scalability, maintainability, and industry standards
- Format code professionally with consistent style and naming conventions
- Explain debugging strategies, common pitfalls, and best practices`
        break
      case 'nova-advanced':
        // Free - 2nd last - moderate but speedy and advanced
        systemPrompt = `You are Duna AI Nova Advanced, a capable AI assistant that provides moderate-depth responses while maintaining speed and efficiency. You balance quality with responsiveness.

**General Responses:**
- Provide helpful, accurate responses with good detail when needed
- Structure responses clearly with examples
- Balance thoroughness with efficiency
- Use clear, friendly language
- Focus on practical, useful information

**Code Responses:**
- Write functional, readable code with good structure
- Include basic comments and error handling
- Provide clear explanations of the approach
- Include simple usage examples
- Format code consistently
- Focus on correctness and readability`
        break
      case 'nova':
        // Free - last - regular questions
        systemPrompt = `You are Duna AI Nova, a helpful AI assistant created by Duneworks Studios. You provide clear, accurate responses to regular questions.

**General Responses:**
- Provide clear, helpful responses with good structure
- Use simple examples and straightforward explanations
- Maintain friendly, informative tone
- Focus on being helpful and reliable for everyday queries
- Keep responses concise and relevant

**Code Responses:**
- Write functional, clear code
- Include basic comments where helpful
- Provide simple explanations
- Format code consistently
- Focus on correctness and clarity`
        break
      default:
        // Fallback to default
        systemPrompt = 'You are Duna, an intelligent AI assistant created by Duneworks Studios. You are helpful, friendly, and provide clear, accurate responses to user questions. For code, write clean, well-documented code with explanations.'
    }

    // Validate images before processing (do this once, not in formatMessage)
    const lastMessage = sanitizedMessages[sanitizedMessages.length - 1]
    if (lastMessage && lastMessage.images && Array.isArray(lastMessage.images) && lastMessage.images.length > 0) {
      // Validate image count (max 4 images)
      if (lastMessage.images.length > 4) {
        return NextResponse.json({
          response: '❌ Invalid Request: Maximum 4 images allowed per message'
        }, { status: 400 })
      }
      
      // Validate image size and format
      const MAX_IMAGE_SIZE = 20 * 1024 * 1024 // 20MB per image
      for (const imgBase64 of lastMessage.images) {
        if (typeof imgBase64 !== 'string') {
          return NextResponse.json({
            response: '❌ Invalid Request: Image data must be a string'
          }, { status: 400 })
        }
        
        // Estimate base64 size (base64 is ~33% larger than binary)
        const base64Size = imgBase64.length * 0.75
        if (base64Size > MAX_IMAGE_SIZE) {
          return NextResponse.json({
            response: `❌ Invalid Request: Image size exceeds maximum of ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
          }, { status: 400 })
        }
        
        // Validate base64 format
        if (!imgBase64.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/i) && 
            !imgBase64.match(/^[A-Za-z0-9+/=]+$/)) {
          return NextResponse.json({
            response: '❌ Invalid Request: Invalid image format. Only JPEG, PNG, GIF, and WebP are supported'
          }, { status: 400 })
        }
      }
    }

    // Prepare messages with system prompt and handle images
    // CRITICAL: Only include images in the LAST message to avoid format issues with message history
    const formatMessage = (msg: any, index: number, isLastMessage: boolean) => {
      // Double-check: Only process images for the last message (current message being sent)
      // Even if images property exists, ignore it unless it's the last message
      if (isLastMessage && msg.images && Array.isArray(msg.images) && msg.images.length > 0) {
        // Format for vision models (OpenAI/DeepSeek vision format)
        const contentParts: any[] = [
          { type: 'text', text: msg.content || 'What is in this image?' }
        ]
        
        // Add images to content (already validated above)
        for (const imgBase64 of msg.images) {
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
        }
        
        return {
          role: msg.role,
          content: contentParts
        }
      }
      // For ALL other messages (history), ALWAYS return only text content
      // Never include images, even if the property exists
      return {
        role: msg.role,
        content: msg.content || ''
      }
    }

    // Format messages - only include images in the last message
    // Use sanitizedMessages to ensure no images in history
    // CRITICAL: Final verification - ensure no images in history
    const formattedMessages = sanitizedMessages.map((msg: any, index: number) => {
      const isLastMessage = index === sanitizedMessages.length - 1
      
      // Defensive check: If this is NOT the last message, ensure images property doesn't exist
      if (!isLastMessage) {
        // Create a completely clean message object without images property
        const cleanMsg = {
          role: msg.role,
          content: msg.content || ''
        }
        return formatMessage(cleanMsg, index, false)
      }
      
      // Only the last message can have images
      return formatMessage(msg, index, true)
    })

    const messagesWithSystem = [
      { role: 'system', content: systemPrompt },
      ...formattedMessages
    ]

    // Use vision model if images are present in the last message only
    let modelToUse = finalModel
    const lastMessage = sanitizedMessages[sanitizedMessages.length - 1]
    const hasImages = lastMessage && lastMessage.images && lastMessage.images.length > 0
    
    if (hasImages) {
      // Use vision-capable models
      if (isDeepSeek) {
        modelToUse = 'deepseek-chat' // DeepSeek supports vision
      } else {
        // OpenAI vision models
        modelToUse = 'gpt-4o' // or 'gpt-4-vision-preview'
      }
    }

    // Optimize message history for mobile - limit context to reduce request size
    const optimizedMessages = messagesWithSystem.length > 10 
      ? [
          messagesWithSystem[0], // Keep system prompt
          ...messagesWithSystem.slice(-9) // Keep last 9 messages (recent context)
        ]
      : messagesWithSystem

    // FINAL SAFETY CHECK: Verify no images in history before sending to AI
    // This is a critical check to prevent API errors
    const finalMessages = optimizedMessages.map((msg: any, index: number) => {
      const isLastMessage = index === optimizedMessages.length - 1
      
      // If this is the system prompt, return as-is
      if (msg.role === 'system') {
        return msg
      }
      
      // If this is NOT the last message, ensure it has NO images property
      if (!isLastMessage) {
        // Create a completely clean message - only role and content
        return {
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        }
      }
      
      // Last message can have images (already formatted correctly)
      return msg
    })

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
          messages: finalMessages, // Use final verified messages (no images in history)
          max_tokens: 1500, // Reduced for faster responses on mobile
          temperature: 0.7,
          stream: false, // Ensure streaming is off for reliability
        }),
      },
      4, // Max 4 retries (5 total attempts) - more retries with shorter timeouts
      50000 // Base 50 second timeout, increases to 55s, 60s, 65s, 70s on retries
    )

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => ({ error: { message: 'Unknown error' } }))
      console.error('AI API error:', aiResponse.status, errorData)
      
      let errorMessage = `❌ AI Service Error (${aiResponse.status})`
      
      // Check if this is an image-related error (400 with image_url or deserialize error)
      if (aiResponse.status === 400) {
        const errorText = JSON.stringify(errorData).toLowerCase()
        const isImageError = errorText.includes('image_url') || 
                            errorText.includes('deserialize') ||
                            errorText.includes('image')
        
        if (isImageError) {
          errorMessage = `🖼️ Duna AI is having trouble processing your image.
          
The image format may not be supported, or the AI service is having issues analyzing images right now.

**What you can try:**
- Try a different image format (JPEG, PNG)
- Make sure the image isn't too large
- Try again in a few moments
- If the issue persists, the AI service may not support image analysis with your current configuration`
          
          return NextResponse.json({
            response: errorMessage
          })
        }
      }
      
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
      } else if (aiResponse.status === 502) {
        errorMessage = `❌ Bad Gateway (502)

The AI service gateway received an invalid response from an upstream server. This is usually a temporary issue.

**I've automatically retried 5 times, but the gateway is still experiencing issues.**

**This usually means:**
- The AI service backend is temporarily unavailable
- There's a communication issue between gateway and backend servers
- The service is experiencing infrastructure problems

**What you can do:**
- **Wait 30-60 seconds and try again** (gateway issues usually resolve quickly)
- Try a simpler, shorter question
- Check your internet connection
- If the issue persists, the service may be experiencing extended downtime

**Note:** This is a temporary infrastructure issue with the AI service provider. Please try again in a moment.`
      } else if (aiResponse.status === 503) {
        errorMessage = `❌ Service Unavailable (503)

The AI service is temporarily overloaded or unavailable. This is usually temporary.

**I've automatically retried 5 times, but the service is still unavailable.**

**This usually means:**
- The AI service is experiencing high traffic
- The service is temporarily down for maintenance
- Your request couldn't be processed due to server load

**What you can do:**
- **Wait 30-60 seconds and try again** (the service usually recovers quickly)
- Try a simpler, shorter question
- Check your internet connection
- If the issue persists, the service may be experiencing extended downtime

**Note:** This is a temporary issue with the AI service provider, not your configuration. Please try again in a moment.`
      } else if (aiResponse.status === 504) {
        errorMessage = `❌ Gateway Timeout (504)

The AI service took too long to respond. This can happen on mobile or slower connections.

**I've automatically retried 5 times with optimized timeouts, but the service is still timing out.**

**This usually means:**
- The AI service is experiencing high load
- Your mobile connection is very slow
- The request is too complex

**What you can do:**
- **Wait 10-15 seconds and try again** (the service may recover quickly)
- Check your internet connection (try switching to WiFi if on mobile data)
- Try a simpler, shorter question
- The service should work - this is usually temporary

**Note:** I've optimized the request for faster responses. Please try again in a moment.`
      } else {
        errorMessage = `❌ AI Service Error (${aiResponse.status})

${errorData?.error?.message || 'An unexpected error occurred'}

Please check your API configuration and try again.`
      }
      
      return NextResponse.json({
        response: errorMessage
      })
    }

    let data
    try {
      data = await aiResponse.json()
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      return NextResponse.json({
        response: `❌ Invalid Response from AI Service

The AI service returned an invalid response format.

**What you can do:**
- Try again in a few moments
- Check your API configuration
- Contact support if the issue persists`
      }, { status: 502 })
    }
    
    const response = data.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.'

    return NextResponse.json({ response })
    } catch (error) {
      // Log error details only in development to prevent information disclosure
      if (process.env.NODE_ENV === 'development') {
        console.error('Chat API error:', error)
      } else {
        console.error('Chat API error occurred')
      }
    
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

