import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenu, HiX } from 'react-icons/hi'

export function MobileDrawer({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        <HiMenu className="w-6 h-6" />
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Drawer Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[80vw] bg-white shadow-xl z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
} 