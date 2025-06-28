import React, { useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { HiRefresh } from 'react-icons/hi'

export function PullToRefresh({ onRefresh, children }) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 100], [0, 1])
  const scale = useTransform(y, [0, 100], [0.8, 1])

  const handleDragEnd = async (event, info) => {
    if (info.offset.y > 100 && !isRefreshing) {
      setIsRefreshing(true)
      await onRefresh()
      setIsRefreshing(false)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Pull indicator */}
      <motion.div 
        style={{ opacity, scale }}
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full
                   flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full text-white z-10"
      >
        <HiRefresh className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`} />
      </motion.div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.3, bottom: 0 }}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  )
} 