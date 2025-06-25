import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('No authorization header', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY'),
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    // Parse request body
    const { message, conversationHistory } = await req.json()
    
    if (!message || typeof message !== 'string') {
      return new Response('Invalid message', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Get Perplexity API key from environment
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!perplexityApiKey) {
      console.error('PERPLEXITY_API_KEY not configured')
      return new Response('AI service not configured', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    // Build messages array for Perplexity
    const messages = [
      {
        role: 'system',
        content: `You are a helpful AI assistant integrated into a LinkedIn-like professional networking platform. 
        You help users with their workspace tasks, provide career advice, help with professional networking, 
        and assist with content creation. Be professional, concise, and helpful.`
      }
    ]

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory.slice(-10)) // Limit context to last 10 messages
    }

    // Add user's new message
    messages.push({
      role: 'user',
      content: message
    })

    // Call Perplexity API
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        return_citations: true,
        return_images: false,
        search_recency_filter: 'month', // Use recent information
      })
    })

    if (!perplexityResponse.ok) {
      const error = await perplexityResponse.text()
      console.error('Perplexity API error:', error)
      return new Response('AI service error', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    const perplexityData = await perplexityResponse.json()
    
    // Extract the assistant's response
    const assistantMessage = perplexityData.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    
    // Save the conversation to database
    const { error: saveError } = await supabase
      .from('workspace_ai_chats')
      .insert([
        {
          user_id: user.id,
          message: message,
          role: 'user'
        },
        {
          user_id: user.id,
          message: assistantMessage,
          role: 'assistant',
          response: JSON.stringify({
            citations: perplexityData.citations,
            usage: perplexityData.usage
          })
        }
      ])

    if (saveError) {
      console.error('Failed to save chat history:', saveError)
      // Continue anyway - don't fail the request
    }

    // Return the response
    return new Response(
      JSON.stringify({
        message: assistantMessage,
        citations: perplexityData.citations || [],
        usage: perplexityData.usage,
        model: perplexityData.model
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('AI chat error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
}) 