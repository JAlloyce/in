import React from 'react'
import { motion } from 'framer-motion'

export function ProfileProgress({ profile }) {
  const calculateProgress = () => {
    const fields = [
      profile.name,
      profile.headline,
      profile.about,
      profile.location,
      profile.avatar_url,
      profile.experience?.length > 0,
      profile.education?.length > 0,
      profile.skills?.length > 0
    ]
    
    const completed = fields.filter(Boolean).length
    return Math.round((completed / fields.length) * 100)
  }

  const progress = calculateProgress()
  
  const suggestions = [
    { field: 'avatar', label: 'Add profile photo', completed: !!profile.avatar_url },
    { field: 'headline', label: 'Add headline', completed: !!profile.headline },
    { field: 'about', label: 'Write about section', completed: !!profile.about },
    { field: 'experience', label: 'Add work experience', completed: profile.experience?.length > 0 },
    { field: 'education', label: 'Add education', completed: profile.education?.length > 0 }
  ]

  if (progress === 100) return null

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 sm:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Complete your profile</h3>
        <span className="text-sm font-medium text-blue-600">{progress}%</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <motion.div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      
      {/* Suggestions */}
      <div className="space-y-2">
        {suggestions.filter(s => !s.completed).slice(0, 3).map((suggestion) => (
          <button
            key={suggestion.field}
            className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-white/50 transition-colors text-left"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-sm text-gray-700">{suggestion.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
} 