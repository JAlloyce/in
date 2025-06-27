import { motion } from 'framer-motion';

/**
 * Mobile-Optimized Loading Spinner Component
 * 
 * Features:
 * - Responsive sizing for mobile/desktop
 * - Accessibility compliant with ARIA labels
 * - Smooth animations optimized for mobile
 * - Multiple variants and sizes
 * - Reduced motion support
 */

// Define static widths outside component to prevent re-creation
const SKELETON_WIDTHS = ['60%', '75%', '85%', '65%', '90%'];

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary', 
  text = 'Loading...', 
  showText = true,
  className = '',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6 md:w-8 md:h-8',
    lg: 'w-8 h-8 md:w-12 md:h-12',
    xl: 'w-12 h-12 md:w-16 md:h-16'
  };

  const variantClasses = {
    primary: 'border-blue-600',
    secondary: 'border-gray-600',
    success: 'border-green-600',
    warning: 'border-yellow-600',
    danger: 'border-red-600'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm md:text-base',
    lg: 'text-base md:text-lg',
    xl: 'text-lg md:text-xl'
  };

  const spinner = (
    <motion.div
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        border-2 border-t-transparent rounded-full
        ${className}
      `}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
        willChange: "transform"
      }}
      style={{ willChange: "transform" }}
      aria-hidden="true"
    />
  );

  const content = (
    <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
      {spinner}
      {showText && (
        <motion.p
          className={`
            ${textSizeClasses[size]}
            text-gray-600 font-medium text-center
          `}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        className="fixed inset-0 bg-white/80 backdrop-blur-sm z-loading flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="status"
        aria-live="polite"
        aria-label={text}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div
      className="flex items-center justify-center p-4"
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      {content}
    </div>
  );
};

// Inline Loading Spinner for buttons and small spaces
export const InlineSpinner = ({ size = 'sm', variant = 'primary', className = '' }) => (
  <motion.div
    className={`
      ${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}
      ${variant === 'white' ? 'border-white' : 'border-current'}
      border-2 border-t-transparent rounded-full
      ${className}
    `}
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: "linear",
      willChange: "transform"
    }}
    style={{ willChange: "transform" }}
    aria-hidden="true"
  />
);

// Skeleton Loading Component
export const SkeletonLoader = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`} role="status" aria-label="Loading content">
    {[...Array(lines)].map((_, index) => (
      <motion.div
        key={index}
        className="h-4 bg-gray-200 rounded animate-pulse"
        style={{
          width: SKELETON_WIDTHS[index % SKELETON_WIDTHS.length]
        }}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: index * 0.1
        }}
      />
    ))}
  </div>
);

// Card Skeleton for feed items
export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow border border-gray-200 p-4 md:p-6 ${className}`}>
    <div className="flex items-start space-x-3 mb-4">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
      </div>
    </div>
    <SkeletonLoader lines={3} />
  </div>
);

export default LoadingSpinner; 