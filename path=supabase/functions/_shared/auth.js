import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const verifyAuth = async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return { error: 'Missing authorization header' };
  
  const token = authHeader.split(' ')[1];
  if (!token) return { error: 'Malformed authorization header' };
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return { user };
  } catch (err) {
    return { error: 'Invalid token' };
  }
} 