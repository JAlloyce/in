import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function NotificationBadge({ count = 0, max = 99, className = '' }) {
  const [displayCount, setDisplayCount] = useState(count)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (count !== displayCount) {
      setIsAnimating(true)
      setTimeout(() => {
        setDisplayCount(count)
        setIsAnimating(false)
      }, 150)
    }
  }, [count, displayCount])

  if (count === 0) return null

  const formattedCount = count > max ? `${max}+` : count.toString()

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: isAnimating ? 1.2 : 1 }}
        exit={{ scale: 0 }}
        className={`
          absolute -top-2 -right-2 min-w-[20px] h-5 
          bg-red-500 text-white text-xs font-bold
          rounded-full flex items-center justify-center
          px-1 ${className}
        `}
      >
        {formattedCount}
      </motion.div>
    </AnimatePresence>
  )
} 