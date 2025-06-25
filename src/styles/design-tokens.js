/**
 * Design Tokens for LinkedIn Clone
 * 
 * Centralized design system tokens for consistent spacing, typography,
 * colors, and component sizing across the application.
 */

export const designTokens = {
  // Spacing Scale (4px base unit)
  spacing: {
    xs: '4px',     // 0.25rem
    sm: '8px',     // 0.5rem  
    md: '12px',    // 0.75rem
    lg: '16px',    // 1rem
    xl: '24px',    // 1.5rem
    '2xl': '32px', // 2rem
    '3xl': '48px', // 3rem
    '4xl': '64px', // 4rem
  },

  // Typography Scale
  typography: {
    fonts: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'ui-monospace', 'monospace'],
    },
    sizes: {
      xs: '12px',   // 0.75rem
      sm: '14px',   // 0.875rem
      base: '16px', // 1rem
      lg: '18px',   // 1.125rem
      xl: '20px',   // 1.25rem
      '2xl': '24px', // 1.5rem
      '3xl': '30px', // 1.875rem
      '4xl': '36px', // 2.25rem
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // Color Palette
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
    },
  },

  // Component Sizing
  components: {
    button: {
      heights: {
        sm: '32px',  // h-8
        md: '40px',  // h-10  
        lg: '48px',  // h-12
      },
      padding: {
        sm: '8px 12px',
        md: '10px 16px',
        lg: '12px 24px',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
      },
    },
    input: {
      heights: {
        sm: '32px',
        md: '40px',
        lg: '48px',
      },
      padding: {
        sm: '8px 12px',
        md: '10px 16px', 
        lg: '12px 20px',
      },
    },
    card: {
      padding: {
        sm: '12px',
        md: '16px',
        lg: '24px',
      },
      borderRadius: '8px',
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    },
    avatar: {
      sizes: {
        xs: '24px',
        sm: '32px', 
        md: '40px',
        lg: '48px',
        xl: '64px',
        '2xl': '80px',
      },
    },
    icon: {
      sizes: {
        xs: '12px', // w-3 h-3
        sm: '16px', // w-4 h-4
        md: '20px', // w-5 h-5  
        lg: '24px', // w-6 h-6
        xl: '32px', // w-8 h-8
      },
    },
  },

  // Layout Grid
  layout: {
    container: {
      maxWidth: '1280px', // max-w-7xl
      padding: {
        mobile: '16px',   // px-4
        tablet: '24px',   // px-6
        desktop: '32px',  // px-8
      },
    },
    grid: {
      gaps: {
        sm: '12px',  // gap-3
        md: '16px',  // gap-4
        lg: '24px',  // gap-6
        xl: '32px',  // gap-8
      },
    },
    breakpoints: {
      sm: '640px',
      md: '768px', 
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },

  // Animation & Transitions
  motion: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modal: 40,
    popover: 50,
    tooltip: 60,
  },
}

export default designTokens 