const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'Inter', ...fontFamily.sans],
        persian: ['Vazirmatn', 'system-ui'],
        english: ['Inter', 'system-ui'],
        mono: ['Fira Code', 'Monaco', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      colors: {
        // Persian-inspired color palette
        persian: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        // Enhanced color palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      lineHeight: {
        'extra-loose': '2.5',
        '12': '3rem',
      },
      letterSpacing: {
        'extra-wide': '0.1em',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',
        'rotate-in': 'rotateIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
        'language-switch': 'languageSwitch 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.8)', opacity: '0' },
        },
        rotateIn: {
          '0%': { transform: 'rotate(-180deg)', opacity: '0' },
          '100%': { transform: 'rotate(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        languageSwitch: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
      },
      backdropBlur: {
        '4xl': '72px',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
        'persian': '0 4px 20px rgba(20, 184, 166, 0.2)',
        'persian-lg': '0 8px 40px rgba(20, 184, 166, 0.3)',
      },
      gradientColorStops: {
        'persian-gradient': {
          '0%': '#14b8a6',
          '50%': '#0d9488',
          '100%': '#0f766e',
        },
      },
      transitionProperty: {
        'width': 'width',
        'height': 'height',
        'spacing': 'margin, padding',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
      supports: {
        'backdrop-blur': 'backdrop-filter: blur(0)',
        'grid': 'display: grid',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    // RTL Plugin
    function ({ addUtilities, addComponents, theme }) {
      // RTL utilities
      addUtilities({
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
        // Persian text utilities
        '.text-persian': {
          fontFamily: theme('fontFamily.persian'),
          direction: 'rtl',
          lineHeight: '1.8',
          letterSpacing: '0.02em',
        },
        '.text-english': {
          fontFamily: theme('fontFamily.english'),
          direction: 'ltr',
          lineHeight: '1.6',
        },
        // RTL-aware spacing
        '.space-x-reverse > * + *': {
          '--tw-space-x-reverse': '1',
        },
        '.divide-x-reverse > * + *': {
          '--tw-divide-x-reverse': '1',
        },
        // Persian numbers
        '.numbers-persian': {
          fontVariantNumeric: 'lining-nums',
          fontFeatureSettings: '"locl"',
        },
        // RTL-aware margins and padding
        '.ms-auto': {
          'margin-inline-start': 'auto',
        },
        '.me-auto': {
          'margin-inline-end': 'auto',
        },
        '.ps-4': {
          'padding-inline-start': '1rem',
        },
        '.pe-4': {
          'padding-inline-end': '1rem',
        },
        // Persian form inputs
        '.input-persian': {
          fontFamily: theme('fontFamily.persian'),
          direction: 'rtl',
          textAlign: 'right',
          lineHeight: '1.8',
        },
        // Glass effects
        '.glass-persian': {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
        },
        // Persian shadows
        '.shadow-persian': {
          boxShadow: theme('boxShadow.persian'),
        },
        '.shadow-persian-lg': {
          boxShadow: theme('boxShadow.persian-lg'),
        },
      })

      // Persian components
      addComponents({
        '.btn-persian': {
          fontFamily: theme('fontFamily.persian'),
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          borderRadius: theme('borderRadius.lg'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'all 0.3s ease',
          background: `linear-gradient(135deg, ${theme('colors.persian.500')}, ${theme('colors.persian.600')})`,
          color: theme('colors.white'),
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.persian-lg'),
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        '.card-persian': {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: theme('borderRadius.xl'),
          padding: theme('spacing.6'),
          boxShadow: theme('boxShadow.persian'),
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme('boxShadow.persian-lg'),
          },
        },
        '.input-field-persian': {
          fontFamily: theme('fontFamily.persian'),
          direction: 'rtl',
          textAlign: 'right',
          width: '100%',
          borderRadius: theme('borderRadius.lg'),
          border: `1px solid ${theme('colors.gray.300')}`,
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          fontSize: theme('fontSize.sm'),
          lineHeight: '1.8',
          transition: 'all 0.2s ease',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.persian.500'),
            boxShadow: `0 0 0 3px ${theme('colors.persian.500')}33`,
          },
          '&::placeholder': {
            color: theme('colors.gray.400'),
            opacity: '1',
          },
        },
      })
    },
  ],
}
