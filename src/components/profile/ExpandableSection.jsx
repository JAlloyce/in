import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiChevronDown, HiPlus, HiPencil } from 'react-icons/hi'

export function ExpandableSection({ 
  title, 
  children, 
  defaultExpanded = false,
  onEdit,
  onAdd,
  itemCount = 0
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {itemCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {itemCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {onAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAdd()
              }}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <HiPlus className="w-5 h-5" />
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <HiPencil className="w-4 h-4" />
            </button>
          )}
          
          <HiChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6 pt-0 border-t border-gray-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 