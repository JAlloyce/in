import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiXCircle } from 'react-icons/hi'
import { useEffect } from 'react'

/**
 * Responsive Toast Notification Component
 * 
 * Features:
 * - Mobile-first responsive design
 * - Proper z-index management
 * - Touch-optimized dismiss button
 * - Accessibility compliant
 * - Auto-dismiss functionality
 */
const Toast = ({ 
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  dismissible = true,
  onDismiss,
  action
}) => {
  const icons = {
    success: HiCheckCircle,
    error: HiXCircle,
    warning: HiExclamationCircle,
    info: HiInformationCircle
  }

  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-400',
      title: 'text-green-800',
      message: 'text-green-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-400',
      title: 'text-red-800',
      message: 'text-red-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      message: 'text-yellow-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      message: 'text-blue-700'
    }
  }

  const Icon = icons[type]
  const style = styles[type]

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, id, onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`max-w-sm w-full ${style.bg} ${style.border} border rounded-lg shadow-lg p-4 mobile-safe`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${style.icon}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-base font-medium ${style.title} mb-1`}>
              {title}
            </h3>
          )}
          {message && (
            <p className={`text-sm ${style.message}`}>
              {message}
            </p>
          )}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        {dismissible && (
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onDismiss?.(id)}
              className={`inline-flex rounded-md ${style.bg} ${style.message} hover:${style.title} focus-visible touch-target`}
              aria-label="Dismiss notification"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Toast Container Component
 * Manages positioning and stacking of toasts
 */
export const ToastContainer = ({ toasts, onDismiss, position = 'top-right' }) => {
  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }

  return (
    <div className={`fixed ${positions[position]} z-toast pointer-events-none`}>
      <div className="flex flex-col space-y-4 pointer-events-auto">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onDismiss={onDismiss}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Toast 