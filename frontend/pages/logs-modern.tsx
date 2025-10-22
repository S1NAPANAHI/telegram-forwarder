import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { ModernNavigation } from '../components/layout/ModernNavigation'
import { ModernCard } from '../components/ui/ModernCard'
import { ModernButton } from '../components/ui/ModernButton'
import { ModernInput } from '../components/ui/ModernInput'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'success' | 'warning' | 'error'
  message: string
  source: string
  details?: string
}

type LogLevel = 'all' | 'info' | 'success' | 'warning' | 'error'

export default function LogsModern() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const logLevels: { key: LogLevel; label: string; count: number }[] = [
    { key: 'all', label: 'همه', count: logs.length },
    { key: 'info', label: 'اطلاعات', count: logs.filter(log => log.level === 'info').length },
    { key: 'success', label: 'موفق', count: logs.filter(log => log.level === 'success').length },
    { key: 'warning', label: 'هشدار', count: logs.filter(log => log.level === 'warning').length },
    { key: 'error', label: 'خطا', count: logs.filter(log => log.level === 'error').length }
  ]

  useEffect(() => {
    // Initial load
    loadLogs()
    
    // Auto refresh every 10 seconds if enabled
    const interval = autoRefresh ? setInterval(loadLogs, 10000) : null
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const loadLogs = () => {
    // Simulate API call
    setTimeout(() => {
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          level: 'success',
          message: 'پیام با موفقیت فوروارد شد',
          source: 'کانال تکنولوژی',
          details: 'فوروارد به 3 مقصد'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          level: 'warning',
          message: 'چند تلاش ناموفق برای اتصال',
          source: 'کانال اخبار',
          details: '3 تلاش انجام شده - مجدد تلاش خواهد شد'
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          level: 'error',
          message: 'خطا در اتصال به سرور',
          source: 'سرویس ارسال',
          details: 'Connection timeout after 30 seconds'
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          level: 'info',
          message: 'شروع فرآیند فوروارد خودکار',
          source: 'سیستم',
          details: 'فعالسازی همه قوانین فعال'
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          level: 'success',
          message: 'به‌روزرسانی کانال با موفقیت انجام شد',
          source: 'کانال ورزشی',
          details: 'اطلاعات کانال به‌روزرسانی شد'
        }
      ]
      setLogs(mockLogs)
      setLoading(false)
    }, 500)
  }

  const filteredLogs = logs.filter(log => {
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesLevel && matchesSearch
  })

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-600" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-600" />
    }
  }

  const getLogStyle = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10'
      case 'error':
        return 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10'
      default:
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    })
  }

  return (
    <>
      <Head>
        <title>گزارشات - تلگرام فوروارد</title>
        <meta name="description" content="مشاهده گزارشات و لاگ‌های سیستم" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <ModernNavigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                گزارشات سیستم
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                مشاهده و ردیابی تمام فعالیت‌های سیستم
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-600 dark:text-gray-400">
                  به‌روزرسانی خودکار
                </label>
              </div>
              <ModernButton variant="secondary" onClick={loadLogs}>
                <ArrowPathIcon className="w-5 h-5 ml-2" />
                به‌روزرسانی
              </ModernButton>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="space-y-6">
              {/* Search */}
              <ModernCard variant="glass">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  جستجو
                </h3>
                <ModernInput
                  placeholder="جستجو در گزارشات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                />
              </ModernCard>

              {/* Level Filter */}
              <ModernCard variant="glass">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  فیلتر سطح
                </h3>
                <div className="space-y-2">
                  {logLevels.map(level => (
                    <button
                      key={level.key}
                      onClick={() => setSelectedLevel(level.key)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        selectedLevel === level.key
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <span>{level.label}</span>
                      <span className="bg-gray-200/50 dark:bg-gray-700/50 px-2 py-0.5 rounded text-xs">
                        {level.count}
                      </span>
                    </button>
                  ))}
                </div>
              </ModernCard>
            </div>

            {/* Logs List */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" text="در حال بارگذاری گزارشات..." />
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLogs.map((log, index) => (
                    <ModernCard
                      key={log.id}
                      variant="glass"
                      className={`border-l-4 ${getLogStyle(log.level)} animate-slideUp`}
                      style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getLogIcon(log.level)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-gray-900 dark:text-white font-medium">
                              {log.message}
                            </p>
                            <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <ClockIcon className="w-4 h-4 ml-1" />
                              {formatTime(log.timestamp)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>منبع: {log.source}</span>
                          </div>
                          
                          {log.details && (
                            <div className="bg-gray-100/50 dark:bg-gray-800/50 rounded-lg p-3 mt-3">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {log.details}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </ModernCard>
                  ))}
                  
                  {filteredLogs.length === 0 && (
                    <ModernCard variant="glass" className="text-center py-12">
                      <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        گزارشی برای نمایش وجود ندارد
                      </p>
                    </ModernCard>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}