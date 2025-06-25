/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Futuristic color palette
        neon: {
          cyan: '#00d9ff',
          purple: '#7c3aed',
          pink: '#f72585',
          green: '#10b981',
          amber: '#f59e0b',
          blue: '#3b82f6',
        },
        // Glassmorphism colors
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(0, 0, 0, 0.2)',
        }
      },
      animation: {
        // Custom animations for futuristic effects
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'neural-pulse': 'neuralPulse 1.5s infinite',
        'data-flow': 'dataFlow 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { 
            'box-shadow': '0 0 5px theme(colors.neon.cyan), 0 0 10px theme(colors.neon.cyan), 0 0 15px theme(colors.neon.cyan)' 
          },
          '100%': { 
            'box-shadow': '0 0 10px theme(colors.neon.cyan), 0 0 20px theme(colors.neon.cyan), 0 0 30px theme(colors.neon.cyan)' 
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { 
            'box-shadow': '0 0 20px theme(colors.neon.cyan)' 
          },
          '50%': { 
            'box-shadow': '0 0 40px theme(colors.neon.cyan), 0 0 60px theme(colors.neon.cyan)' 
          },
        },
        gradientShift: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        neuralPulse: {
          '0%, 100%': { 
            opacity: '0.5',
            transform: 'scale(1)' 
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.05)' 
          },
        },
        dataFlow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neural-grid': `
          linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'neural-grid': '20px 20px',
      },
      fontFamily: {
        'neural': ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderWidth: {
        '3': '3px',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [
    // Custom plugin for futuristic utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-glow': {
          'text-shadow': `0 0 10px currentColor, 0 0 20px currentColor`,
        },
        '.border-glow': {
          'box-shadow': `0 0 10px theme('colors.neon.cyan'), inset 0 0 10px theme('colors.neon.cyan')`,
        },
        '.bg-neural': {
          background: `
            linear-gradient(135deg, theme('colors.gray.900') 0%, theme('colors.blue.900') 50%, theme('colors.purple.900') 100%),
            theme('backgroundImage.neural-grid')
          `,
          'background-size': `cover, theme('backgroundSize.neural-grid')`,
        },
        '.glassmorphism': {
          background: 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
        '.dark-glassmorphism': {
          background: 'rgba(0, 0, 0, 0.2)',
          'backdrop-filter': 'blur(20px)',
          '-webkit-backdrop-filter': 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.5)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
