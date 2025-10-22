import React, { forwardRef } from 'react'

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  variant?: 'default' | 'filled' | 'outline'
}

export const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(({
  label,
  error,
  icon,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none'
  
  const variantClasses = {
    default: 'bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-600/50 focus:border-blue-500 focus:ring-blue-500/20',
    filled: 'bg-gray-100/80 dark:bg-gray-700/80 border-transparent focus:border-blue-500 focus:ring-blue-500/20',
    outline: 'bg-transparent border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20'
  }
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`${baseClasses} ${variantClasses[variant]} ${icon ? 'pr-12' : ''} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 animate-slideDown">
          {error}
        </p>
      )}
    </div>
  )
})

ModernInput.displayName = 'ModernInput'