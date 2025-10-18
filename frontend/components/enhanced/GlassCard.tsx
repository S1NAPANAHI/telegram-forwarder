import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  gradient?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true,
  padding = 'lg',
  blur = 'lg',
  gradient = false,
  onClick
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md', 
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  const baseClasses = `
    ${blurClasses[blur]}
    bg-white/10 dark:bg-gray-900/20 
    border border-white/20 dark:border-gray-700/30
    rounded-2xl shadow-2xl
    ${gradient ? 'bg-gradient-to-br from-white/20 to-white/5 dark:from-gray-800/30 dark:to-gray-900/10' : ''}
    ${hover ? 'hover:bg-white/15 dark:hover:bg-gray-800/30 hover:border-white/30 dark:hover:border-gray-600/40' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    transition-all duration-300 ease-out
    ${paddingClasses[padding]}
    ${className}
  `;

  if (onClick) {
    return (
      <motion.div
        className={baseClasses}
        onClick={onClick}
        whileHover={{ scale: hover ? 1.02 : 1, y: -2 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={baseClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;