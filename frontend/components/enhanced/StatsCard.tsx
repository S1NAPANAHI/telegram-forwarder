import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'blue',
  loading = false
}) => {
  const colorClasses = {
    blue: 'from-telegram-500 to-telegram-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600'
  };

  const changeColors = {
    increase: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
    decrease: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700/50"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          {loading ? (
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          ) : (
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {value}
            </p>
          )}
          {change && !loading && (
            <div className="flex items-center">
              <span className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                changeColors[change.type]
              )}>
                {change.type === 'increase' ? '↗' : '↘'} {change.value}
              </span>
            </div>
          )}
        </div>
        <div className={clsx(
          'p-3 rounded-xl bg-gradient-to-r shadow-lg',
          colorClasses[color]
        )}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;