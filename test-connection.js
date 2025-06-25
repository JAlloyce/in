import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Testing Supabase Connection')
console.log('==============================')
console.log('URL:', supabaseUrl)
console.log('Service Key:', supabaseServiceKey ? '✓ Present' : '✗ Missing')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testConnection() {
  try {
    // Test 1: Try to query system tables
    console.log('\n🔸 Test 1: Query information_schema...')
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', { sql_query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'" })
    
    if (tablesError) {
      console.log('   RPC exec_sql not available:', tablesError.message)
    } else {
      console.log('   ✅ Tables found:', tables)
    }

    // Test 2: Try to access auth users (should work with service key)
    console.log('\n🔸 Test 2: Query auth.users...')
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.log('   Error accessing users:', usersError.message)
    } else {
      console.log('   ✅ Users count:', users.users.length)
    }

    // Test 3: Try direct table access
    console.log('\n🔸 Test 3: Try to access profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.log('   Profiles table not found (expected):', profilesError.message)
    } else {
      console.log('   ✅ Profiles table exists with data:', profiles)
    }

    // Test 4: Try storage
    console.log('\n🔸 Test 4: Try to access storage...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.log('   Storage access error:', bucketsError.message)
    } else {
      console.log('   ✅ Storage buckets:', buckets.map(b => b.name))
    }

  } catch (error) {
    console.error('Connection test failed:', error.message)
  }
}

testConnection()