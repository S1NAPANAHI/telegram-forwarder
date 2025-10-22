import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ModernButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  gradient?: boolean;
  glow?: boolean;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  fullWidth = false,
  gradient = false,
  glow = false
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-xl
    transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    relative overflow-hidden
    ${fullWidth ? 'w-full' : ''}
  `;

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  const variantClasses = {
    primary: gradient
      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md',
    ghost: 'bg-transparent hover:bg-white/10 text-white border border-white/30',
    danger: gradient
      ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg'
      : 'bg-red-500 hover:bg-red-600 text-white shadow-lg',
    success: gradient
      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg'
      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg',
    warning: gradient
      ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg'
      : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg'
  };

  const glowClasses = {
    primary: 'hover:shadow-blue-500/25',
    secondary: 'hover:shadow-white/25',
    ghost: 'hover:shadow-white/25',
    danger: 'hover:shadow-red-500/25',
    success: 'hover:shadow-emerald-500/25',
    warning: 'hover:shadow-amber-500/25'
  };

  const hoverClasses = disabled || loading ? '' : 'hover:scale-105 active:scale-95';
  const focusClasses = {
    primary: 'focus:ring-blue-500',
    secondary: 'focus:ring-white',
    ghost: 'focus:ring-white',
    danger: 'focus:ring-red-500',
    success: 'focus:ring-emerald-500',
    warning: 'focus:ring-amber-500'
  };

  const shimmerEffect = gradient || variant === 'primary';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${hoverClasses}
        ${focusClasses[variant]}
        ${glow ? `hover:shadow-2xl ${glowClasses[variant]}` : ''}
        ${className}
      `}
    >
      {/* Shimmer Effect */}
      {shimmerEffect && (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        </div>
      )}

      {/* Content */}
      <div className="relative flex items-center justify-center space-x-2">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <i className={`${icon} ${loading ? 'animate-spin' : ''}`} />
        )}

        {/* Loading Spinner */}
        {loading && !icon && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        )}

        {/* Button Text */}
        <span className={loading && !icon ? 'ml-2' : ''}>
          {children}
        </span>

        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <i className={`${icon} ${loading ? 'animate-spin' : ''}`} />
        )}
      </div>
    </motion.button>
  );
};

export default ModernButton;