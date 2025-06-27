import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { FaGoogle, FaGithub } from 'react-icons/fa'
import IntruLogo from '../ui/IntruLogo'

export default function LoginForm({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const { signInWithProvider } = useAuth()

  const handleOAuthLogin = async (provider) => {
    try {
      setLoading(true)
      setError('')
      setDebugInfo('Starting OAuth flow...')
      
      console.log('🔍 OAuth Debug Info:')
      console.log('Provider:', provider)
      console.log('Current origin:', window.location.origin)
      
      setDebugInfo(`Calling signInWithProvider('${provider}')...`)
      
      // Use the AuthContext method which properly handles OAuth
      const result = await signInWithProvider(provider)

      console.log('🔍 OAuth Result:', result)

      if (result.error) {
        console.error('❌ OAuth Error Details:', result.error)
        setError(`OAuth Error: ${result.error.message}`)
        setDebugInfo(`Error: ${result.error.message}`)
      } else {
        console.log('✅ OAuth initiated successfully')
        setDebugInfo('OAuth URL generated, redirecting...')
        // The AuthContext will handle the redirect
        // Close the modal after successful initiation
        if (onClose) onClose()
      }
    } catch (err) {
      console.error('❌ Exception during OAuth:', err)
      setError('Authentication failed. Please try again.')
      setDebugInfo(`Exception: ${err.message}\nStack: ${err.stack}`)
    } finally {
      setLoading(false)
    }
  }

  const testSupabaseConnection = async () => {
    try {
      setDebugInfo('Testing Supabase connection...')
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        setDebugInfo(`Supabase connection failed: ${error.message}`)
      } else {
        setDebugInfo('Supabase connection successful!')
        console.log('✅ Supabase session data:', data)
      }
    } catch (err) {
      setDebugInfo(`Connection test failed: ${err.message}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <IntruLogo size="xl" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Intru</h2>
          <p className="text-gray-600">Connect with professionals and grow your network</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {debugInfo && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4 text-xs">
            <strong>Debug Info:</strong>
            <pre className="mt-2 whitespace-pre-wrap">{debugInfo}</pre>
          </div>
        )}

        <div className="space-y-4">
          {/* Debug Info */}
          <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded text-xs">
            <strong>Current Setup:</strong><br/>
            Origin: {window.location.origin}<br/>
            Redirect URL: {window.location.origin}/auth/callback<br/>
            <br/>
            <strong>Required in Google Cloud Console:</strong><br/>
            http://localhost:3000/auth/callback<br/>
            https://nuntsizvwfmjzucuubcd.supabase.co/auth/v1/callback
          </div>

          {/* Test Connection Button */}
          <button
            onClick={testSupabaseConnection}
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            🔧 Test Supabase Connection
          </button>

          {/* Google OAuth */}
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaGoogle className="text-red-500 mr-3" />
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          {/* GitHub OAuth */}
          <button
            onClick={() => handleOAuthLogin('github')}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaGithub className="text-gray-900 mr-3" />
            {loading ? 'Signing in...' : 'Continue with GitHub'}
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Debug Mode</span>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Close
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>
            Debug Mode Active - Check console for detailed logs
          </p>
        </div>
      </div>
    </div>
  )
}