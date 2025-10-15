import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated';
  padding?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className,
  variant = 'default',
  padding = true,
  hover = false,
  onClick
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-soft',
    glass: 'bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/20 shadow-lg',
    elevated: 'bg-white dark:bg-gray-800 shadow-strong border border-gray-100 dark:border-gray-700'
  };

  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
  const paddingClasses = padding ? 'p-6' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const MotionComponent = onClick ? motion.button : motion.div;

  return (
    <MotionComponent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      onClick={onClick}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        paddingClasses,
        clickableClasses,
        className
      )}
    >
      {children}
    </MotionComponent>
  );
};

export default ModernCard;