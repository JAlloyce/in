import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, supabase } from '../lib/supabase'

/**
 * OAuth Callback Page
 * 
 * Handles the OAuth redirect from Google/GitHub and processes
 * the authentication code exchange for a session
 */
export default function AuthCallback() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Extract common session establishment logic
  const handleSessionEstablishment = async (flowType) => {
    console.log(`✅ ${flowType} authentication initiated...`);
    
    // Retry mechanism for session establishment
    let retries = 0;
    const maxRetries = 5;
    let session = null;
    
    while (retries < maxRetries && !session) {
      const result = await auth.getSession();
      session = result.session;
      if (!session) {
        const delay = Math.min(1000 * Math.pow(2, retries), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      }
    }
    
    if (!session?.user) {
      throw new Error('Authentication completed but no session was created');
    }
    
    console.log(`✅ ${flowType} authentication successful:`, session.user.email);
    console.log('Provider:', session.user.app_metadata?.provider);
    
    // Poll the DB until the "profiles" row exists (instead of a fixed timeout)
    let profileCreated = false;
    let attempts = 0;
    while (!profileCreated && attempts < 10) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();
      if (profile) {
        profileCreated = true;
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
    }
    
    return session;
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current URL to extract any error or code parameters
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        const error = urlParams.get('error') || hashParams.get('error')
        const errorDescription = urlParams.get('error_description') || hashParams.get('error_description')

        if (error) {
          setError(errorDescription || 'Authentication failed')
          setLoading(false)
          return
        }

        // Handle OAuth callback - check for code (PKCE) or access_token (implicit flow)
        const code = urlParams.get('code')
        const accessToken = hashParams.get('access_token')
        
        if (code) {
          await handleSessionEstablishment('OAuth code exchange');
          navigate('/', { replace: true });
        } else if (accessToken) {
          await handleSessionEstablishment('Implicit flow');
          navigate('/', { replace: true });
        } else {
          // No code parameter - might be a direct access
          console.log('ℹ️ No OAuth code found, checking existing session...')
          
          const { session, error: sessionError } = await auth.getSession()
          
          if (session?.user) {
            console.log('✅ Existing session found')
            navigate('/', { replace: true })
          } else {
            setError('No authentication code or session found')
            setLoading(false)
          }
        }
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError(err.message || 'Authentication failed. Please try again.')
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Completing authentication...
            </h2>
            <p className="text-gray-600">
              Please wait while we sign you in.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}