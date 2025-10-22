import React from 'react'
import { ModernCard } from './ui/ModernCard'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon?: React.ReactNode
  description?: string
  trend?: number[]
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow'
  loading?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  description,
  trend,
  color = 'blue',
  loading = false
}) => {
  const colorClasses = {
    blue: {
      icon: 'text-blue-600 bg-blue-500/10',
      change: 'text-blue-600',
      trend: '#3b82f6'
    },
    green: {
      icon: 'text-green-600 bg-green-500/10',
      change: 'text-green-600',
      trend: '#10b981'
    },
    purple: {
      icon: 'text-purple-600 bg-purple-500/10',
      change: 'text-purple-600',
      trend: '#8b5cf6'
    },
    red: {
      icon: 'text-red-600 bg-red-500/10',
      change: 'text-red-600',
      trend: '#ef4444'
    },
    yellow: {
      icon: 'text-yellow-600 bg-yellow-500/10',
      change: 'text-yellow-600',
      trend: '#f59e0b'
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600 dark:text-green-400'
      case 'decrease':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return '↗'
      case 'decrease':
        return '↘'
      default:
        return '→'
    }
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString('fa-IR')
    }
    return val
  }

  if (loading) {
    return (
      <ModernCard variant="glass" className="animate-fadeIn">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </ModernCard>
    )
  }

  return (
    <ModernCard 
      variant="glass" 
      className="hover-lift card-hover transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
              {formatValue(value)}
            </h3>
            {change && (
              <span className={`text-sm font-medium flex items-center ${getChangeColor()}`}>
                <span className="mr-1">{getChangeIcon()}</span>
                {change}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-xl ${colorClasses[color].icon} group-hover:scale-110 transition-transform duration-200`}>
            {icon}
          </div>
        )}
      </div>
      
      {/* Mini Trend Chart */}
      {trend && trend.length > 0 && (
        <div className="mt-4 h-8 flex items-end gap-1">
          {trend.map((point, index) => (
            <div
              key={index}
              className={`flex-1 rounded-t transition-all duration-500 hover:opacity-80`}
              style={{
                height: `${(point / Math.max(...trend)) * 100}%`,
                backgroundColor: colorClasses[color].trend,
                animationDelay: `${index * 50}ms`
              }}
            />
          ))}
        </div>
      )}
    </ModernCard>
  )
}