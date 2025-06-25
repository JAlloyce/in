import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'

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

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current URL to extract any error or code parameters
        const urlParams = new URLSearchParams(window.location.search)
        const error = urlParams.get('error')
        const errorDescription = urlParams.get('error_description')

        if (error) {
          setError(errorDescription || 'Authentication failed')
          setLoading(false)
          return
        }

        // Handle OAuth callback - check for code and exchange for session
        const code = urlParams.get('code')
        
        if (code) {
          console.log('✅ OAuth code received, exchanging for session...')
          
          // For OAuth callback, we need to wait a moment for the session to be established
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const { session, error: sessionError } = await auth.getSession()

          if (sessionError) {
            console.error('Session error after OAuth:', sessionError)
            setError('Failed to establish session after OAuth')
            setLoading(false)
            return
          }

          if (session?.user) {
            console.log('✅ OAuth authentication successful:', session.user.email)
            console.log('Provider:', session.user.app_metadata?.provider)
            console.log('User metadata:', session.user.user_metadata)
            
            // Give time for database triggers to create profile
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Redirect to home page after successful authentication
            navigate('/', { replace: true })
          } else {
            console.warn('⚠️ No session found after code exchange')
            setError('Authentication completed but no session was created')
            setLoading(false)
          }
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
        setError('Authentication failed. Please try again.')
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