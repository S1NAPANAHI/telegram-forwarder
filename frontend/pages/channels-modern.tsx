import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ModernCard from '../components/ui/ModernCard';
import { ThemeToggle } from '../components/ui/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface Channel {
  id: string;
  title: string;
  username: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  isConnected: boolean;
  category: 'news' | 'tech' | 'crypto' | 'general' | 'entertainment';
  avatar?: string;
}

const ChannelsModern: React.FC = () => {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const categories = [
    { id: 'all', name: 'All Channels', icon: '🌐' },
    { id: 'news', name: 'News', icon: '📰' },
    { id: 'tech', name: 'Technology', icon: '💻' },
    { id: 'crypto', name: 'Cryptocurrency', icon: '₿' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'general', name: 'General', icon: '💬' }
  ];

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChannels(data);
      }
    } catch (error) {
      console.error('Error searching channels:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConnect = async (channelId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/channels/${channelId}/connect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setChannels(prev => prev.map(channel => 
          channel.id === channelId 
            ? { ...channel, isConnected: true }
            : channel
        ));
      }
    } catch (error) {
      console.error('Error connecting to channel:', error);
    }
  };

  const filteredChannels = channels.filter(channel => {
    const matchesCategory = selectedCategory === 'all' || channel.category === selectedCategory;
    const matchesSearch = channel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         channel.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && (searchTerm ? matchesSearch : true);
  });

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : '📱';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Discover Channels</h1>
            <p className="text-purple-200 text-lg">Find and connect to Telegram channels</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/dashboard-modern')}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200"
            >
              ← Back to Dashboard
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Search Section */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <ModernCard variant="feature" className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search channels by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-2xl">🔍</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleSearch}
                disabled={isSearching || !searchTerm.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </ModernCard>
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-white/20 border-white/40 text-white'
                    : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Channels Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400 text-lg">Loading channels...</p>
            </div>
          ) : filteredChannels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredChannels.map((channel) => (
                  <motion.div
                    key={channel.id}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <ModernCard variant="default" hover glow className="h-full">
                      <div className="flex flex-col h-full">
                        {/* Channel Header */}
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {channel.avatar ? (
                              <img src={channel.avatar} alt={channel.title} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              channel.title.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white truncate">{channel.title}</h3>
                            <p className="text-gray-400 text-sm">@{channel.username}</p>
                          </div>
                          <div className="text-2xl">
                            {getCategoryIcon(channel.category)}
                          </div>
                        </div>

                        {/* Channel Info */}
                        <div className="flex-1 mb-4">
                          <p className="text-gray-300 text-sm mb-3 line-clamp-3">{channel.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span className="flex items-center">
                              <span className="mr-1">👥</span>
                              {channel.memberCount.toLocaleString()} members
                            </span>
                            {channel.isPrivate && (
                              <span className="flex items-center">
                                <span className="mr-1">🔒</span>
                                Private
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-auto">
                          {channel.isConnected ? (
                            <button 
                              disabled
                              className="w-full py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 cursor-not-allowed"
                            >
                              ✓ Connected
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleConnect(channel.id)}
                              className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                            >
                              Connect Channel
                            </button>
                          )}
                        </div>
                      </div>
                    </ModernCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-4">No channels found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm ? 'Try adjusting your search terms or category filter.' : 'Start by searching for channels to discover.'}
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  fetchChannels();
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Reset Filters
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ChannelsModern;