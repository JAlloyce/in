import React from 'react'
import { useSwipeGesture } from '../../hooks/useSwipeGesture'
import { motion } from 'framer-motion'

export function MessageItem({ message, onDelete }) {
  const swipeHandlers = useSwipeGesture(
    () => onDelete?.(message.id), // Swipe left to delete
    null
  )

  return (
    <motion.div 
      {...swipeHandlers}
      className="relative bg-white p-4 border-b border-gray-100 transition-transform duration-200"
      whileHover={{ backgroundColor: '#f9fafb' }}
    >
      {message.content}
    </motion.div>
  )
} 