/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Telegram-inspired primary palette
        telegram: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#24A1DE', // Main Telegram Blue
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0',
          900: '#0d47a1',
        },
        // Enhanced success/error colors
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#00C851',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF6B35',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#FF3547',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Keep existing colors for compatibility
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#24A1DE', // Updated to match telegram
          600: '#1e88e5',
          700: '#1976d2',
          800: '#1565c0',
          900: '#0d47a1',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#FF3547',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -2px rgba(0, 0, 0, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'strong': '0 10px 40px -4px rgba(0, 0, 0, 0.2), 0 20px 60px -8px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 0 1px rgba(36, 161, 222, 0.1), 0 4px 16px rgba(36, 161, 222, 0.12)',
        'telegram': '0 4px 16px rgba(36, 161, 222, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'bounce-soft': 'bounceSoft 0.6s ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(36, 161, 222, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(36, 161, 222, 0.8)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-telegram': 'linear-gradient(135deg, #24A1DE 0%, #1976d2 100%)',
      },
    },
  },
  plugins: [
    // Custom utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.scrollbar-thin': {
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: theme('colors.gray.100'),
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme('colors.gray.300'),
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme('colors.gray.400'),
          },
          '.dark &::-webkit-scrollbar-track': {
            background: theme('colors.gray.800'),
          },
          '.dark &::-webkit-scrollbar-thumb': {
            background: theme('colors.gray.600'),
          },
          '.dark &::-webkit-scrollbar-thumb:hover': {
            background: theme('colors.gray.500'),
          },
        },
        '.glass-effect': {
          'background': 'rgba(255, 255, 255, 0.25)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.18)',
        },
        '.dark .glass-effect': {
          'background': 'rgba(0, 0, 0, 0.25)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #24A1DE 0%, #1976d2 100%)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.btn-primary': {
          'background': 'linear-gradient(135deg, #24A1DE 0%, #1976d2 100%)',
          'color': 'white',
          'padding': '0.75rem 1.5rem',
          'border-radius': '0.75rem',
          'font-weight': '500',
          'transition': 'all 0.2s ease-in-out',
          'box-shadow': '0 4px 16px rgba(36, 161, 222, 0.25)',
          '&:hover': {
            'transform': 'translateY(-1px)',
            'box-shadow': '0 8px 25px rgba(36, 161, 222, 0.35)',
          },
          '&:active': {
            'transform': 'translateY(0)',
          },
          '&:focus': {
            'outline': 'none',
            'ring': '2px',
            'ring-color': theme('colors.telegram.500'),
            'ring-offset': '2px',
          }
        },
        '.card-elevated': {
          'background': theme('colors.white'),
          'border-radius': theme('borderRadius.2xl'),
          'box-shadow': theme('boxShadow.soft'),
          'border': `1px solid ${theme('colors.gray.100')}`,
          '.dark &': {
            'background': theme('colors.gray.800'),
            'border-color': theme('colors.gray.700'),
          }
        },
        '.input-modern': {
          'background': theme('colors.gray.50'),
          'border': `1px solid ${theme('colors.gray.200')}`,
          'border-radius': theme('borderRadius.xl'),
          'padding': '0.875rem 1rem',
          'font-size': theme('fontSize.sm[0]'),
          'transition': 'all 0.2s ease-in-out',
          '&:focus': {
            'outline': 'none',
            'border-color': theme('colors.telegram.500'),
            'box-shadow': theme('boxShadow.glow'),
            'background': theme('colors.white'),
          },
          '.dark &': {
            'background': theme('colors.gray.800'),
            'border-color': theme('colors.gray.600'),
            'color': theme('colors.gray.100'),
          },
          '.dark &:focus': {
            'background': theme('colors.gray.700'),
            'border-color': theme('colors.telegram.500'),
          }
        }
      }
      addUtilities(newUtilities)
    }
  ],
}