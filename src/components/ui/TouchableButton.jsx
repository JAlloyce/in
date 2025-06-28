import { motion } from 'framer-motion'
import React from 'react'

export function TouchableButton({ children, onClick, variant = 'primary', ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        min-h-[44px] min-w-[44px] 
        flex items-center justify-center
        px-4 py-3 rounded-lg font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variant === 'primary' 
          ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500' 
          : 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500'
        }
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
} 