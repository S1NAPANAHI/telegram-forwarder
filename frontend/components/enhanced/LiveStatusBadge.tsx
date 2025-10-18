import React from 'react';
import { motion } from 'framer-motion';

interface LiveStatusBadgeProps {
  status: 'active' | 'inactive' | 'error' | 'warning' | 'connecting';
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showPulse?: boolean;
}

const LiveStatusBadge: React.FC<LiveStatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showLabel = true,
  showPulse = true
}) => {
  const statusConfig = {
    active: {
      color: 'bg-green-400',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-700',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    inactive: {
      color: 'bg-gray-400',
      textColor: 'text-gray-700 dark:text-gray-300',
      borderColor: 'border-gray-200 dark:border-gray-700',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20'
    },
    error: {
      color: 'bg-red-400',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-700',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    warning: {
      color: 'bg-yellow-400',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    connecting: {
      color: 'bg-blue-400',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-blue-200 dark:border-blue-700',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    }
  };

  const sizeConfig = {
    sm: {
      dot: 'w-2 h-2',
      text: 'text-xs',
      padding: 'px-2 py-1',
      gap: 'space-x-1'
    },
    md: {
      dot: 'w-3 h-3',
      text: 'text-sm',
      padding: 'px-3 py-1.5',
      gap: 'space-x-2'
    },
    lg: {
      dot: 'w-4 h-4',
      text: 'text-base',
      padding: 'px-4 py-2',
      gap: 'space-x-3'
    }
  };

  const config = statusConfig[status];
  const sizing = sizeConfig[size];

  return (
    <div className={`inline-flex items-center ${sizing.gap} ${sizing.padding} 
                    ${config.bgColor} ${config.borderColor} ${config.textColor}
                    border rounded-full transition-all duration-200`}>
      <div className="relative">
        <motion.div 
          className={`${sizing.dot} rounded-full ${config.color}`}
          animate={showPulse && (status === 'active' || status === 'connecting') ? {
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {showPulse && (status === 'active' || status === 'connecting') && (
          <motion.div 
            className={`absolute inset-0 ${sizing.dot} rounded-full ${config.color} opacity-30`}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
      {showLabel && (
        <span className={`${sizing.text} font-medium`}>
          {label}
        </span>
      )}
    </div>
  );
};

export default LiveStatusBadge;