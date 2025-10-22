import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { ModernNavigation } from '../components/layout/ModernNavigation'
import { ModernCard } from '../components/ui/ModernCard'
import { ModernButton } from '../components/ui/ModernButton'
import { ModernInput } from '../components/ui/ModernInput'
import { ModernModal } from '../components/ui/ModernModal'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  TrashIcon,
  PencilIcon,
  TagIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  HashtagIcon
} from '@heroicons/react/24/outline'

interface Keyword {
  id: string
  text: string
  type: 'include' | 'exclude'
  caseSensitive: boolean
  isRegex: boolean
  matchCount: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  channels: string[]
}

type FilterType = 'all' | 'include' | 'exclude'
type StatusFilter = 'all' | 'active' | 'inactive'

export default function KeywordsModern() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null)
  const [newKeyword, setNewKeyword] = useState({
    text: '',
    type: 'include' as const,
    caseSensitive: false,
    isRegex: false
  })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setKeywords([
        {
          id: '1',
          text: 'تکنولوژی',
          type: 'include',
          caseSensitive: false,
          isRegex: false,
          matchCount: 245,
          status: 'active',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-20',
          channels: ['کانال تکنولوژی', 'کانال برنامه‌نویسی']
        },
        {
          id: '2',
          text: 'تبلیغ|اسپم',
          type: 'exclude',
          caseSensitive: false,
          isRegex: true,
          matchCount: 89,
          status: 'active',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18',
          channels: ['همه کانال‌ها']
        },
        {
          id: '3',
          text: 'Python',
          type: 'include',
          caseSensitive: true,
          isRegex: false,
          matchCount: 156,
          status: 'active',
          createdAt: '2024-01-12',
          updatedAt: '2024-01-19',
          channels: ['کانال برنامه‌نویسی']
        },
        {
          id: '4',
          text: 'خبر فوری',
          type: 'include',
          caseSensitive: false,
          isRegex: false,
          matchCount: 67,
          status: 'inactive',
          createdAt: '2024-01-08',
          updatedAt: '2024-01-16',
          channels: ['کانال اخبار']
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredKeywords = keywords.filter(keyword => {
    const matchesSearch = keyword.text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || keyword.type === filterType
    const matchesStatus = statusFilter === 'all' || keyword.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const handleAddKeyword = () => {
    if (newKeyword.text.trim()) {
      const keyword: Keyword = {
        id: Date.now().toString(),
        text: newKeyword.text.trim(),
        type: newKeyword.type,
        caseSensitive: newKeyword.caseSensitive,
        isRegex: newKeyword.isRegex,
        matchCount: 0,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        channels: ['همه کانال‌ها']
      }
      setKeywords([...keywords, keyword])
      setNewKeyword({ text: '', type: 'include', caseSensitive: false, isRegex: false })
      setShowAddModal(false)
    }
  }

  const handleDeleteKeyword = (id: string) => {
    setKeywords(keywords.filter(k => k.id !== id))
  }

  const handleToggleStatus = (id: string) => {
    setKeywords(keywords.map(k => 
      k.id === id ? { ...k, status: k.status === 'active' ? 'inactive' : 'active' } : k
    ))
  }

  const getTypeColor = (type: Keyword['type']) => {
    return type === 'include' ? 'text-green-600 bg-green-500/10' : 'text-red-600 bg-red-500/10'
  }

  const getTypeLabel = (type: Keyword['type']) => {
    return type === 'include' ? 'شامل' : 'مستثنی'
  }

  const resetForm = () => {
    setNewKeyword({ text: '', type: 'include', caseSensitive: false, isRegex: false })
    setEditingKeyword(null)
  }

  const openModal = (keyword?: Keyword) => {
    if (keyword) {
      setEditingKeyword(keyword)
      setNewKeyword({
        text: keyword.text,
        type: keyword.type,
        caseSensitive: keyword.caseSensitive,
        isRegex: keyword.isRegex
      })
    } else {
      resetForm()
    }
    setShowAddModal(true)
  }

  const closeModal = () => {
    setShowAddModal(false)
    resetForm()
  }

  const typeFilters = [
    { key: 'all' as const, label: 'همه', count: keywords.length },
    { key: 'include' as const, label: 'شامل', count: keywords.filter(k => k.type === 'include').length },
    { key: 'exclude' as const, label: 'مستثنی', count: keywords.filter(k => k.type === 'exclude').length }
  ]

  const statusFilters = [
    { key: 'all' as const, label: 'همه', count: keywords.length },
    { key: 'active' as const, label: 'فعال', count: keywords.filter(k => k.status === 'active').length },
    { key: 'inactive' as const, label: 'غیرفعال', count: keywords.filter(k => k.status === 'inactive').length }
  ]

  return (
    <>
      <Head>
        <title>کلیدواژه‌ها - تلگرام فوروارد</title>
        <meta name="description" content="مدیریت کلیدواژه‌های فیلترینگ" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <ModernNavigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                مدیریت کلیدواژه‌ها
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                تنظیم فیلترهای کلیدواژه برای فوروارد خودکار
              </p>
            </div>
            <ModernButton
              variant="primary"
              onClick={() => openModal()}
              className="flex items-center"
            >
              <PlusIcon className="w-5 h-5 ml-2" />
              افزودن کلیدواژه
            </ModernButton>
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
                  placeholder="جستجو کلیدواژه..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<MagnifyingGlassIcon className="w-5 h-5" />}
                />
              </ModernCard>

              {/* Type Filter */}
              <ModernCard variant="glass">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  نوع فیلتر
                </h3>
                <div className="space-y-2">
                  {typeFilters.map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setFilterType(filter.key)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        filterType === filter.key
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className="bg-gray-200/50 dark:bg-gray-700/50 px-2 py-0.5 rounded text-xs">
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
              </ModernCard>

              {/* Status Filter */}
              <ModernCard variant="glass">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  وضعیت
                </h3>
                <div className="space-y-2">
                  {statusFilters.map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setStatusFilter(filter.key)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        statusFilter === filter.key
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className="bg-gray-200/50 dark:bg-gray-700/50 px-2 py-0.5 rounded text-xs">
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
              </ModernCard>
            </div>

            {/* Keywords List */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" text="در حال بارگذاری کلیدواژه‌ها..." />
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredKeywords.map((keyword, index) => (
                    <ModernCard
                      key={keyword.id}
                      variant="glass"
                      className="animate-slideUp hover-lift transition-all duration-300"
                      style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-2 rounded-lg ${getTypeColor(keyword.type)}`}>
                            <HashtagIcon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white font-mono">
                                {keyword.text}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(keyword.type)}`}>
                                {getTypeLabel(keyword.type)}
                              </span>
                              {keyword.isRegex && (
                                <span className="px-2 py-1 rounded text-xs font-medium text-purple-600 bg-purple-500/10">
                                  Regex
                                </span>
                              )}
                              {keyword.caseSensitive && (
                                <span className="px-2 py-1 rounded text-xs font-medium text-orange-600 bg-orange-500/10">
                                  حساس به حروف
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span>تعداد تطابق: {keyword.matchCount.toLocaleString('fa-IR')}</span>
                              <span>آخرین به‌روزرسانی: {keyword.updatedAt}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(keyword.id)}
                            className={`p-2 rounded-lg transition-colors duration-200 ${
                              keyword.status === 'active'
                                ? 'text-green-600 bg-green-500/10 hover:bg-green-500/20'
                                : 'text-gray-400 bg-gray-500/10 hover:bg-gray-500/20'
                            }`}
                            title={keyword.status === 'active' ? 'غیرفعال کردن' : 'فعال کردن'}
                          >
                            {keyword.status === 'active' ? (
                              <CheckCircleIcon className="w-5 h-5" />
                            ) : (
                              <XCircleIcon className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => openModal(keyword)}
                            className="p-2 rounded-lg text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 transition-colors duration-200"
                            title="ویرایش"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteKeyword(keyword.id)}
                            className="p-2 rounded-lg text-red-600 bg-red-500/10 hover:bg-red-500/20 transition-colors duration-200"
                            title="حذف"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </ModernCard>
                  ))}
                  
                  {filteredKeywords.length === 0 && (
                    <ModernCard variant="glass" className="text-center py-12">
                      <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        کلیدواژه‌ای برای نمایش وجود ندارد
                      </p>
                    </ModernCard>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Add/Edit Keyword Modal */}
        <ModernModal
          isOpen={showAddModal}
          onClose={closeModal}
          title={editingKeyword ? 'ویرایش کلیدواژه' : 'افزودن کلیدواژه جدید'}
        >
          <div className="space-y-4">
            <ModernInput
              label="متن کلیدواژه"
              placeholder="کلیدواژه یا عبارت مورد نظر"
              value={newKeyword.text}
              onChange={(e) => setNewKeyword(prev => ({ ...prev, text: e.target.value }))}
              required
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                نوع فیلتر
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setNewKeyword(prev => ({ ...prev, type: 'include' }))}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    newKeyword.type === 'include'
                      ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                  }`}
                >
                  <CheckCircleIcon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">شامل</div>
                  <div className="text-xs opacity-75">پیام‌ها با این کلیدواژه</div>
                </button>
                <button
                  onClick={() => setNewKeyword(prev => ({ ...prev, type: 'exclude' }))}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    newKeyword.type === 'exclude'
                      ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                  }`}
                >
                  <XCircleIcon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">مستثنی</div>
                  <div className="text-xs opacity-75">پیام‌ها بدون این کلیدواژه</div>
                </button>
              </div>
            </div>
            
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newKeyword.caseSensitive}
                  onChange={(e) => setNewKeyword(prev => ({ ...prev, caseSensitive: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">حساس به حروف کوچک و بزرگ</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newKeyword.isRegex}
                  onChange={(e) => setNewKeyword(prev => ({ ...prev, isRegex: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Regex</span>
              </label>
            </div>
            
            <div className="flex gap-3 pt-4">
              <ModernButton
                variant="primary"
                onClick={handleAddKeyword}
                className="flex-1"
                disabled={!newKeyword.text.trim()}
              >
                {editingKeyword ? 'به‌روزرسانی' : 'افزودن'}
              </ModernButton>
              <ModernButton
                variant="secondary"
                onClick={closeModal}
                className="flex-1"
              >
                لغو
              </ModernButton>
            </div>
          </div>
        </ModernModal>
      </div>
    </>
  )
}