import React, { useState, useEffect } from 'react'
import { ModernCard } from '../components/ui/ModernCard'
import { ModernButton } from '../components/ui/ModernButton'
import { ModernInput } from '../components/ui/ModernInput'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  EyeIcon,
  ShareIcon,
  HeartIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline'
import Layout from '../components/Layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';

interface Message {
  id: string
  content: string
  sourceChannel: string
  sourceChannelUsername: string
  timestamp: string
  mediaType?: 'photo' | 'video' | 'document' | 'audio'
  mediaCount?: number
  views: number
  forwards: number
  reactions?: number
  isForwarded: boolean
  forwardedTo: string[]
  keywords: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
}

type TimeFilter = 'all' | 'last-hour' | 'today' | 'yesterday' | 'week'
type MediaFilter = 'all' | 'text' | 'photo' | 'video' | 'document' | 'audio'
type StatusFilter = 'all' | 'forwarded' | 'not-forwarded'

export default function FeedModern() {
  const { t } = useTranslation('common');
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today')
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const timeFilters = [
    { key: 'all' as const, label: t('allTime') || 'همه زمان' },
    { key: 'last-hour' as const, label: t('lastHour') || 'ساعت گذشته' },
    { key: 'today' as const, label: t('today') || 'امروز' },
    { key: 'yesterday' as const, label: t('yesterday') || 'دیروز' },
    { key: 'week' as const, label: t('lastWeek') || 'هفته گذشته' }
  ]

  const mediaFilters = [
    { key: 'all' as const, label: t('allTypes') || 'همه انواع', icon: null },
    { key: 'text' as const, label: t('text') || 'متن', icon: ChatBubbleLeftRightIcon },
    { key: 'photo' as const, label: t('images') || 'تصاویر', icon: PhotoIcon },
    { key: 'video' as const, label: t('video') || 'ویدیو', icon: VideoCameraIcon },
    { key: 'document' as const, label: t('file') || 'فایل', icon: DocumentIcon },
    { key: 'audio' as const, label: t('audio') || 'صوت', icon: SpeakerWaveIcon }
  ]

  useEffect(() => {
    loadMessages()
    const interval = autoRefresh ? setInterval(loadMessages, 30000) : null
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const loadMessages = () => {
    // Simulate API call
    setTimeout(() => {
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'آخرین به‌روزرسانی هوش مصنوعی گوگل قابلیت تشخیص عاطفه از روی متن را بهبود بخشیده است. این فناوری می‌تواند در تحلیل نظرات کاربران بسیار مفید باشد.',
          sourceChannel: 'کانال تکنولوژی',
          sourceChannelUsername: '@tech_channel',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          views: 2450,
          forwards: 89,
          reactions: 156,
          isForwarded: true,
          forwardedTo: ['کانال AI', 'گروه برنامه‌نویسان'],
          keywords: ['هوش مصنوعی', 'گوگل'],
          sentiment: 'positive'
        },
        {
          id: '2',
          content: 'معرفی بهترین اپلیکیشن‌های موبایل برای یادگیری زبان انگلیسی',
          sourceChannel: 'کانال آموزشی',
          sourceChannelUsername: '@education_channel',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          mediaType: 'photo',
          mediaCount: 5,
          views: 1890,
          forwards: 45,
          reactions: 89,
          isForwarded: false,
          forwardedTo: [],
          keywords: ['آموزش', 'انگلیسی'],
          sentiment: 'positive'
        },
        {
          id: '3',
          content: 'امروز قیمت بیت کوین به 45000 دلار رسید. این باعث نگرانی از بازگشت به بازار نزولی شده.',
          sourceChannel: 'کانال اقتصاد',
          sourceChannelUsername: '@economy_news',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          views: 5670,
          forwards: 234,
          reactions: 67,
          isForwarded: true,
          forwardedTo: ['کانال مالی'],
          keywords: ['بیت کوین', 'اقتصاد'],
          sentiment: 'negative'
        },
        {
          id: '4',
          content: 'ویدیو آموزش کامل React برای مبتدیان - قسمت اول',
          sourceChannel: 'کانال برنامه‌نویسی',
          sourceChannelUsername: '@programming_fa',
          timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
          mediaType: 'video',
          mediaCount: 1,
          views: 3240,
          forwards: 156,
          reactions: 245,
          isForwarded: true,
          forwardedTo: ['گروه توسعه', 'کانال آموزشی'],
          keywords: ['React', 'برنامه‌نویسی'],
          sentiment: 'positive'
        },
        {
          id: '5',
          content: 'فایل PDF کتاب «تمیز کد: درس‌نامه نوشتن کد تمیز» به زبان فارسی',
          sourceChannel: 'کتابخانه برنامه‌نویسان',
          sourceChannelUsername: '@dev_library',
          timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
          mediaType: 'document',
          mediaCount: 1,
          views: 1560,
          forwards: 89,
          reactions: 123,
          isForwarded: false,
          forwardedTo: [],
          keywords: ['کتاب', 'برنامه‌نویسی'],
          sentiment: 'neutral'
        }
      ]
      setMessages(mockMessages)
      setLoading(false)
    }, 1000)
  }

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sourceChannel.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMedia = mediaFilter === 'all' || 
                        (mediaFilter === 'text' && !message.mediaType) ||
                        message.mediaType === mediaFilter
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'forwarded' && message.isForwarded) ||
                         (statusFilter === 'not-forwarded' && !message.isForwarded)
    return matchesSearch && matchesMedia && matchesStatus
  })

  const getMediaIcon = (mediaType?: string) => {
    switch (mediaType) {
      case 'photo':
        return <PhotoIcon className="w-5 h-5 text-green-500" />
      case 'video':
        return <VideoCameraIcon className="w-5 h-5 text-red-500" />
      case 'document':
        return <DocumentIcon className="w-5 h-5 text-blue-500" />
      case 'audio':
        return <SpeakerWaveIcon className="w-5 h-5 text-purple-500" />
      default:
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getSentimentColor = (sentiment: Message['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-500/10'
      case 'negative':
        return 'text-red-600 bg-red-500/10'
      default:
        return 'text-gray-600 bg-gray-500/10'
    }
  }

  const getSentimentLabel = (sentiment: Message['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'مثبت'
      case 'negative':
        return 'منفی'
      default:
        return 'خنثی'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
    
    if (diffMinutes < 1) return 'همین الآن'
    if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} ساعت پیش`
    return date.toLocaleDateString('fa-IR')
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('fa-IR')
  }

  return (
    <Layout title={t('messageFeed') || 'Message Feed'}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('messageFeed') || 'خوراک پیام‌ها'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('viewAndManageAllIncomingMessages') || 'مشاهدو و مدیریت تمام پیام‌های دریافتی'}
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
                {t('autoRefresh') || 'به‌روزرسانی خودکار'}
              </label>
            </div>
            <ModernButton variant="secondary" onClick={loadMessages}>
              <ArrowPathIcon className="w-5 h-5 ml-2" />
              {t('refresh') || 'به‌روزرسانی'}
            </ModernButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <ModernCard variant="glass">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('search') || 'جستجو'}
              </h3>
              <ModernInput
                placeholder={t('searchMessagesPlaceholder') || 'جستجو در پیام‌ها...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </ModernCard>

            {/* Time Filter */}
            <ModernCard variant="glass">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('time') || 'زمان'}
              </h3>
              <div className="space-y-2">
                {timeFilters.map(filter => (
                  <button
                    key={filter.key}
                    onClick={() => setTimeFilter(filter.key)}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      timeFilter === filter.key
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </ModernCard>

            {/* Media Filter */}
            <ModernCard variant="glass">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('contentType') || 'نوع محتوا'}
              </h3>
              <div className="space-y-2">
                {mediaFilters.map(filter => {
                  const Icon = filter.icon
                  return (
                    <button
                      key={filter.key}
                      onClick={() => setMediaFilter(filter.key)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        mediaFilter === filter.key
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>{filter.label}</span>
                    </button>
                  )
                })}
              </div>
            </ModernCard>

            {/* Status Filter */}
            <ModernCard variant="glass">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('forwardingStatus') || 'وضعیت فوروارد'}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    statusFilter === 'all'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {t('all') || 'همه'}
                </button>
                <button
                  onClick={() => setStatusFilter('forwarded')}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    statusFilter === 'forwarded'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {t('forwarded') || 'فوروارد شده'}
                </button>
                <button
                  onClick={() => setStatusFilter('not-forwarded')}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    statusFilter === 'not-forwarded'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {t('notForwarded') || 'فوروارد نشده'}
                </button>
              </div>
            </ModernCard>
          </div>

          {/* Messages List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text={t('loadingMessages') || 'در حال بارگذاری پیام‌ها...'} />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((message, index) => (
                  <ModernCard
                    key={message.id}
                    variant="glass"
                    className="animate-slideUp hover-lift transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getMediaIcon(message.mediaType)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {message.sourceChannel}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {message.sourceChannelUsername}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSentimentColor(message.sentiment)}`}>
                              {getSentimentLabel(message.sentiment)}
                            </span>
                          </div>
                          <span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <ClockIcon className="w-4 h-4 ml-1" />
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                          {message.content}
                        </p>
                        
                        {message.mediaCount && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {message.mediaType === 'photo' && `${formatNumber(message.mediaCount)} ${t('image')}`}
                            {message.mediaType === 'video' && `${formatNumber(message.mediaCount)} ${t('video')}`}
                            {message.mediaType === 'document' && `${formatNumber(message.mediaCount)} ${t('file')}`}
                            {message.mediaType === 'audio' && `${formatNumber(message.mediaCount)} ${t('audioFile')}`}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <EyeIcon className="w-4 h-4" />
                              {formatNumber(message.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <ShareIcon className="w-4 h-4" />
                              {formatNumber(message.forwards)}
                            </span>
                            {message.reactions && (
                              <span className="flex items-center gap-1">
                                <HeartIcon className="w-4 h-4" />
                                {formatNumber(message.reactions)}
                              </span>
                            )}
                          </div>
                          
                          {message.isForwarded && (
                            <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs">
                              {t('forwardedTo')} {message.forwardedTo.length} {t('destination')}
                            </span>
                          )}
                        </div>
                        
                        {message.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {message.keywords.map((keyword, keywordIndex) => (
                              <span
                                key={keywordIndex}
                                className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-xs"
                              >
                                #{keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </ModernCard>
                ))}
                
                {filteredMessages.length === 0 && (
                  <ModernCard variant="glass" className="text-center py-12">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('noMessagesToShow') || 'پیامی برای نمایش وجود ندارد'}
                    </p>
                  </ModernCard>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'en', ['common'])),
  },
});