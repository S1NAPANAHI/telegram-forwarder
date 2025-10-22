import React, { useState, useEffect } from 'react'
import { ModernCard } from '../components/ui/ModernCard'
import { ModernButton } from '../components/ui/ModernButton'
import { ModernInput } from '../components/ui/ModernInput'
import { ModernModal } from '../components/ui/ModernModal'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PaperAirplaneIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import Layout from '../components/Layout';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';

interface Destination {
  id: string
  name: string
  username: string
  type: 'channel' | 'group' | 'user'
  members?: number
  status: 'active' | 'inactive' | 'error'
  forwardCount: number
  lastActivity: string
}

export default function DestinationsModern() {
  const { t } = useTranslation('common');
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDestination, setNewDestination] = useState({ name: '', username: '', type: 'channel' as const })

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDestinations([
        {
          id: '1',
          name: 'کانال اخبار فناوری',
          username: '@tech_news_dest',
          type: 'channel',
          members: 25430,
          status: 'active',
          forwardCount: 156,
          lastActivity: '10 دقیقه پیش'
        },
        {
          id: '2',
          name: 'گروه بحث عمومی',
          username: '@general_discussion',
          type: 'group',
          members: 1240,
          status: 'active',
          forwardCount: 89,
          lastActivity: '1 ساعت پیش'
        },
        {
          id: '3',
          name: 'کاربر اختصاصی',
          username: '@special_user',
          type: 'user',
          status: 'inactive',
          forwardCount: 12,
          lastActivity: '3 روز پیش'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dest.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddDestination = () => {
    if (newDestination.name && newDestination.username) {
      const destination: Destination = {
        id: Date.now().toString(),
        name: newDestination.name,
        username: newDestination.username,
        type: newDestination.type,
        status: 'inactive',
        forwardCount: 0,
        lastActivity: 'تازه اضافه شده'
      }
      setDestinations([...destinations, destination])
      setNewDestination({ name: '', username: '', type: 'channel' })
      setShowAddModal(false)
    }
  }

  const getTypeIcon = (type: Destination['type']) => {
    switch (type) {
      case 'channel':
        return <PaperAirplaneIcon className="w-6 h-6" />
      case 'group':
        return <UsersIcon className="w-6 h-6" />
      case 'user':
        return <UsersIcon className="w-6 h-6" />
      default:
        return <PaperAirplaneIcon className="w-6 h-6" />
    }
  }

  const getTypeColor = (type: Destination['type']) => {
    switch (type) {
      case 'channel':
        return 'text-blue-600 bg-blue-500/10'
      case 'group':
        return 'text-green-600 bg-green-500/10'
      case 'user':
        return 'text-purple-600 bg-purple-500/10'
      default:
        return 'text-blue-600 bg-blue-500/10'
    }
  }

  return (
    <Layout title={t('destinations') || 'Destinations'}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('forwardingDestinations') || 'Forwarding Destinations'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('manageAndMonitorForwardingDestinations') || 'Manage and monitor your message forwarding destinations'}
            </p>
          </div>
          <ModernButton
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="flex items-center"
          >
            <PlusIcon className="w-5 h-5 ml-2" />
            {t('addDestination') || 'Add Destination'}
          </ModernButton>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <ModernInput
            placeholder={t('searchDestination') || 'Search destination...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<MagnifyingGlassIcon className="w-5 h-5" />}
            className="max-w-md"
          />
        </div>

        {/* Destinations Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text={t('loadingDestinations') || 'Loading destinations...')} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((destination, index) => (
              <ModernCard
                key={destination.id}
                variant="glass"
                className="animate-slideUp"
                style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${getTypeColor(destination.type)} ml-3`}>
                      {getTypeIcon(destination.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {destination.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {destination.username}
                      </p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    destination.status === 'active' ? 'bg-green-500' :
                    destination.status === 'inactive' ? 'bg-gray-400' : 'bg-red-500'
                  }`} />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('type')}:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {destination.type === 'channel' ? 'کانال' :
                       destination.type === 'group' ? 'گروه' : 'کاربر'}
                    </span>
                  </div>
                  
                  {destination.members && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{t('members')}:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {destination.members.toLocaleString('fa-IR')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('forwarded')}:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {destination.forwardCount.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('lastActivity')}:</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {destination.lastActivity}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <ModernButton variant="primary" size="sm" className="flex-1">
                    {t('settings') || 'Settings'}
                  </ModernButton>
                  <ModernButton variant="secondary" size="sm" className="flex-1">
                    {t('test') || 'Test'}
                  </ModernButton>
                </div>
              </ModernCard>
            ))}
          </div>
        )}
      </main>

      {/* Add Destination Modal */}
      <ModernModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('addDestination') || 'Add New Destination'}
      >
        <div className="space-y-4">
          <ModernInput
            label={t('destinationName') || 'Destination Name'}
            placeholder={t('enterDestinationName') || 'Enter destination name'}
            value={newDestination.name}
            onChange={(e) => setNewDestination(prev => ({ ...prev, name: e.target.value }))}
          />
          
          <ModernInput
            label={t('username') || 'Username'}
            placeholder="@destination_username"
            value={newDestination.username}
            onChange={(e) => setNewDestination(prev => ({ ...prev, username: e.target.value }))}
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('destinationType') || 'Destination Type'}
            </label>
            <select
              value={newDestination.type}
              onChange={(e) => setNewDestination(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
            >
              <option value="channel">{t('channel') || 'Channel'}</option>
              <option value="group">{t('group') || 'Group'}</option>
              <option value="user">{t('user') || 'User'}</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <ModernButton
              variant="primary"
              onClick={handleAddDestination}
              className="flex-1"
              disabled={!newDestination.name || !newDestination.username}
            >
              {t('addDestination') || 'Add Destination'}
            </ModernButton>
            <ModernButton
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              {t('cancel') || 'Cancel'}
            </ModernButton>
          </div>
        </div>
      </ModernModal>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'en', ['common'])),
  },
});