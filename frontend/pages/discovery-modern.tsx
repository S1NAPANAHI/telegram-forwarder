import React, { useState, useEffect } from 'react'
import { ModernCard } from '../components/ui/ModernCard'
import { ModernButton } from '../components/ui/ModernButton'
import { ModernInput } from '../components/ui/ModernInput'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeAltIcon,
  HashtagIcon,
  FireIcon,
  TrendingUpIcon
} from '@heroicons/react/24/outline'
import Layout from '../components/Layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';

interface Channel {
  id: string
  name: string
  username: string
  description: string
  members: number
  category: string
  language: string
  isVerified: boolean
  lastPost: string
  postsPerDay: number
  engagementRate: number
  isAdded: boolean
  tags: string[]
}

type CategoryFilter = 'all' | 'tech' | 'news' | 'entertainment' | 'education' | 'business'
type SortBy = 'members' | 'activity' | 'engagement' | 'recent'

export default function DiscoveryModern() {
  const { t } = useTranslation('common');
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('members')
  const [showOnlyNotAdded, setShowOnlyNotAdded] = useState(false)

  const categories = [
    { key: 'all' as const, label: t('all') || 'همه', icon: GlobeAltIcon },
    { key: 'tech' as const, label: t('technology') || 'تکنولوژی', icon: HashtagIcon },
    { key: 'news' as const, label: t('news') || 'اخبار', icon: ChatBubbleLeftRightIcon },
    { key: 'entertainment' as const, label: t('entertainment') || 'سرگرمی', icon: FireIcon },
    { key: 'education' as const, label: t('education') || 'آموزش', icon: UsersIcon },
    { key: 'business' as const, label: t('business') || 'کسب و کار', icon: TrendingUpIcon }
  ]

  const sortOptions = [
    { key: 'members' as const, label: t('membersCount') || 'تعداد اعضا' },
    { key: 'activity' as const, label: t('activity') || 'فعالیت' },
    { key: 'engagement' as const, label: t('engagementRate') || 'میزان تعامل' },
    { key: 'recent' as const, label: t('mostRecent') || 'جدیدترین' }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setChannels([
        {
          id: '1',
          name: 'کانال تکنولوژی ایران',
          username: '@iran_tech_news',
          description: 'آخرین اخبار و نوآوری‌های تکنولوژی ایران و جهان',
          members: 125430,
          category: 'tech',
          language: 'fa',
          isVerified: true,
          lastPost: '2 ساعت پیش',
          postsPerDay: 8,
          engagementRate: 4.2,
          isAdded: false,
          tags: ['تکنولوژی', 'ایران', 'نوآوری']
        },
        {
          id: '2',
          name: 'پایتون فارسی',
          username: '@python_farsi',
          description: 'آموزش برنامه‌نویسی پایتون به زبان فارسی',
          members: 89240,
          category: 'education',
          language: 'fa',
          isVerified: false,
          lastPost: '1 ساعت پیش',
          postsPerDay: 5,
          engagementRate: 6.8,
          isAdded: true,
          tags: ['پایتون', 'برنامه‌نویسی', 'آموزش']
        },
        {
          id: '3',
          name: 'اخبار فناوری',
          username: '@tech_news_daily',
          description: 'خبرهای روزانه دنیای فناوری و تکنولوژی',
          members: 156890,
          category: 'news',
          language: 'fa',
          isVerified: true,
          lastPost: '30 دقیقه پیش',
          postsPerDay: 12,
          engagementRate: 3.5,
          isAdded: false,
          tags: ['اخبار', 'فناوری', 'تکنولوژی']
        },
        {
          id: '4',
          name: 'استارت‌آپ ایران',
          username: '@startup_iran',
          description: 'خبرها و تحلیل‌های اکوسیستم استارت‌آپی ایران',
          members: 67320,
          category: 'business',
          language: 'fa',
          isVerified: false,
          lastPost: '4 ساعت پیش',
          postsPerDay: 3,
          engagementRate: 5.1,
          isAdded: false,
          tags: ['استارت‌آپ', 'کسب و کار', 'ایران']
        },
        {
          id: '5',
          name: 'فیلم و سینما',
          username: '@cinema_persian',
          description: 'آخرین فیلم‌ها، سریال‌ها و معرفی آثار سینمایی',
          members: 234560,
          category: 'entertainment',
          language: 'fa',
          isVerified: true,
          lastPost: '1 روز پیش',
          postsPerDay: 6,
          engagementRate: 7.3,
          isAdded: true,
          tags: ['فیلم', 'سینما', 'سرگرمی']
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredChannels = channels
    .filter(channel => {
      const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           channel.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           channel.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || channel.category === categoryFilter
      const matchesAddedFilter = !showOnlyNotAdded || !channel.isAdded
      return matchesSearch && matchesCategory && matchesAddedFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'members':
          return b.members - a.members
        case 'activity':
          return b.postsPerDay - a.postsPerDay
        case 'engagement':
          return b.engagementRate - a.engagementRate
        case 'recent':
          return new Date(b.lastPost).getTime() - new Date(a.lastPost).getTime()
        default:
          return 0
      }
    })

  const handleAddChannel = (channelId: string) => {
    setChannels(channels.map(channel => 
      channel.id === channelId ? { ...channel, isAdded: true } : channel
    ))
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}م`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}ک`
    }
    return num.toLocaleString('fa-IR')
  }

  const getCategoryCount = (category: CategoryFilter) => {
    if (category === 'all') return channels.length
    return channels.filter(c => c.category === category).length
  }

  return (
    <Layout title={t('discoverChannels') || 'Discover Channels'}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('discoverNewChannels') || 'Discover New Channels'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('discoverAndAddChannelsDescription') || 'Discover new and interesting channels and add them to your resources list'}
          </p>
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
                placeholder={t('searchChannelPlaceholder') || 'جستجو کانال...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<MagnifyingGlassIcon className="w-5 h-5" />}
              />
            </ModernCard>

            {/* Categories */}
            <ModernCard variant="glass">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('category') || 'دسته‌بندی'}
              </h3>
              <div className="space-y-2">
                {categories.map(category => {
                  const Icon = category.icon
                  return (
                    <button
                      key={category.key}
                      onClick={() => setCategoryFilter(category.key)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        categoryFilter === category.key
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{category.label}</span>
                      </div>
                      <span className="bg-gray-200/50 dark:bg-gray-700/50 px-2 py-0.5 rounded text-xs">
                        {getCategoryCount(category.key)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </ModernCard>

            {/* Sort & Filter Options */}
            <ModernCard variant="glass">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('sortBy') || 'مرتب‌سازی'}
              </h3>
              <div className="space-y-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full px-3 py-2 rounded-lg border bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                >
                  {sortOptions.map(option => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyNotAdded}
                    onChange={(e) => setShowOnlyNotAdded(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t('showOnlyNewChannels') || 'فقط کانال‌های جدید'}
                  </span>
                </label>
              </div>
            </ModernCard>
          </div>

          {/* Channels Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text={t('searchingChannels') || 'در حال جستجوی کانال‌ها...'} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredChannels.map((channel, index) => (
                  <ModernCard
                    key={channel.id}
                    variant="glass"
                    className="hover-lift card-hover transition-all duration-300 animate-slideUp"
                    style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {channel.name}
                            </h3>
                            {channel.isVerified && (
                              <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {channel.username}
                          </p>
                        </div>
                      </div>
                      
                      {channel.isAdded ? (
                        <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                          {t('added') || 'اضافه شده'}
                        </span>
                      ) : (
                        <ModernButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddChannel(channel.id)}
                          className="flex items-center"
                        >
                          <PlusIcon className="w-4 h-4 ml-1" />
                          {t('add') || 'افزودن'}
                        </ModernButton>
                      )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {channel.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-600 dark:text-gray-400">{t('members')}:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatNumber(channel.members)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ChatBubbleLeftRightIcon className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">{t('dailyPosts')}:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {channel.postsPerDay.toLocaleString('fa-IR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUpIcon className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-600 dark:text-gray-400">{t('engagement')}:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {channel.engagementRate.toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-600 dark:text-gray-400">{t('lastPost')}:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {channel.lastPost}
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {channel.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 rounded text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </ModernCard>
                ))}
              </div>
            )}

            {!loading && filteredChannels.length === 0 && (
              <ModernCard variant="glass" className="text-center py-12">
                <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {t('noChannelsFound') || 'کانالی برای نمایش پیدا نشد'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {t('changeFiltersOrSearchTerm') || 'فیلترها یا کلیدواژه جستجو را تغییر دهید'}
                </p>
              </ModernCard>
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