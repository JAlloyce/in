import React from 'react'

export function SkeletonLoader({ type = 'post' }) {
  const skeletons = {
    post: (
      <div className="bg-white rounded-lg shadow p-6 mb-4 animate-pulse">
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-48 bg-gray-200 rounded-lg mb-4" />
        <div className="flex space-x-4">
          <div className="h-8 bg-gray-200 rounded w-16" />
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      </div>
    ),
    
    profile: (
      <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
        <div className="h-32 bg-gray-200" />
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full -mt-10" />
            <div className="flex-1 mt-4">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    
    message: (
      <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-xs p-3 rounded-lg ${
              i % 2 === 0 ? 'bg-gray-200' : 'bg-blue-200'
            }`}>
              <div className="h-4 bg-gray-300 rounded w-full mb-1" />
              <div className="h-4 bg-gray-300 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return skeletons[type] || skeletons.post
}

// Usage component for feed skeletons
export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <SkeletonLoader key={i} type="post" />
      ))}
    </div>
  )
} 