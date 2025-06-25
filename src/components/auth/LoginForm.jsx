import React, { useState } from 'react'
import { auth } from '../../lib/supabase'
import { FaGoogle, FaGithub, FaLinkedin } from 'react-icons/fa'

export default function LoginForm({ onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOAuthLogin = async (provider) => {
    try {
      setLoading(true)
      setError('')
      
      let result
      if (provider === 'google') {
        result = await auth.signInWithGoogle()
      } else if (provider === 'github') {
        result = await auth.signInWithGitHub()
      }

      if (result.error) {
        setError(result.error.message)
      }
      // On success, user will be redirected by OAuth flow
    } catch (err) {
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <FaLinkedin className="text-blue-600 text-4xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your LinkedIn account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
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
            <span className="px-2 bg-white text-gray-500">Professional Network</span>
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
            By signing in, you agree to LinkedIn's{' '}
            <a href="#" className="text-blue-600 hover:underline">
              User Agreement
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}