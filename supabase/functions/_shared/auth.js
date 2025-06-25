import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function getUser(request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('No authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    throw new Error('Invalid token')
  }

  return {
    id: data.user.id,
    email: data.user.email,
    user_metadata: data.user.user_metadata
  }
}

export async function requireAuth(request) {
  try {
    return await getUser(request)
  } catch (error) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export function createErrorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export function createSuccessResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

export async function getUserProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error(`Failed to get user profile: ${error.message}`)
  }

  return data
}

export async function validateInput(schema, data) {
  // Basic validation - check required fields and formats
  for (const [key, rules] of Object.entries(schema)) {
    const value = data[key]

    if (rules.includes('required') && (!value || value === '')) {
      throw new Error(`${key} is required`)
    }

    if (rules.includes('email') && value && !isValidEmail(value)) {
      throw new Error(`${key} must be a valid email`)
    }

    if (rules.includes('uuid') && value && !isValidUUID(value)) {
      throw new Error(`${key} must be a valid UUID`)
    }
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export async function checkRateLimit(userId, action, limit = 10) {
  // Simple rate limiting implementation
  const key = `rate_limit:${userId}:${action}`
  const now = Date.now()
  const window = 60000 // 1 minute

  try {
    const { data } = await supabaseAdmin
      .from('rate_limits')
      .select('count, created_at')
      .eq('user_id', userId)
      .eq('action', action)
      .gte('created_at', new Date(now - window).toISOString())
      .single()

    if (data && data.count >= limit) {
      return false
    }

    // Update or insert rate limit record
    await supabaseAdmin
      .from('rate_limits')
      .upsert({
        user_id: userId,
        action,
        count: (data?.count || 0) + 1,
        created_at: new Date().toISOString()
      })

    return true
  } catch {
    // If rate_limits table doesn't exist, allow the request
    return true
  }
}