import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ModernCard from '../components/ui/ModernCard';
import { ThemeToggle, useTheme } from '../components/ui/ThemeProvider';
import { motion } from 'framer-motion';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    telegram: boolean;
  };
  forwarding: {
    autoForward: boolean;
    batchSize: number;
    delay: number;
    retryAttempts: number;
  };
  privacy: {
    logRetention: number;
    analytics: boolean;
    shareData: boolean;
  };
  profile: {
    username: string;
    email: string;
    timezone: string;
    language: string;
  };
}

const SettingsModern: React.FC = () => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      telegram: false
    },
    forwarding: {
      autoForward: true,
      batchSize: 10,
      delay: 1000,
      retryAttempts: 3
    },
    privacy: {
      logRetention: 30,
      analytics: true,
      shareData: false
    },
    profile: {
      username: '',
      email: '',
      timezone: 'UTC',
      language: 'en'
    }
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'forwarding' | 'privacy' | 'advanced'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        // Show success message
        console.log('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: 'fas fa-user' },
    { id: 'notifications', name: 'Notifications', icon: 'fas fa-bell' },
    { id: 'forwarding', name: 'Forwarding', icon: 'fas fa-share' },
    { id: 'privacy', name: 'Privacy', icon: 'fas fa-shield-alt' },
    { id: 'advanced', name: 'Advanced', icon: 'fas fa-cog' }
  ];

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

  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) => {
    return (
      <div className="flex items-center justify-between py-3">
        <span className="text-gray-300">{label}</span>
        <button
          onClick={() => onChange(!checked)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            checked ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              checked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  };

  const ProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
        <input
          type="text"
          value={settings.profile.username}
          onChange={(e) => updateSetting('profile', 'username', e.target.value)}
          className="input-modern"
          placeholder="Enter your username"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={settings.profile.email}
          onChange={(e) => updateSetting('profile', 'email', e.target.value)}
          className="input-modern"
          placeholder="Enter your email"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
        <select
          value={settings.profile.timezone}
          onChange={(e) => updateSetting('profile', 'timezone', e.target.value)}
          className="input-modern"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Berlin">Berlin</option>
          <option value="Asia/Tokyo">Tokyo</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
        <select
          value={settings.profile.language}
          onChange={(e) => updateSetting('profile', 'language', e.target.value)}
          className="input-modern"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="ja">Japanese</option>
        </select>
      </div>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-4">
      <ToggleSwitch
        checked={settings.notifications.email}
        onChange={(value) => updateSetting('notifications', 'email', value)}
        label="Email Notifications"
      />
      <ToggleSwitch
        checked={settings.notifications.push}
        onChange={(value) => updateSetting('notifications', 'push', value)}
        label="Push Notifications"
      />
      <ToggleSwitch
        checked={settings.notifications.telegram}
        onChange={(value) => updateSetting('notifications', 'telegram', value)}
        label="Telegram Bot Notifications"
      />
    </div>
  );

  const ForwardingSettings = () => (
    <div className="space-y-6">
      <ToggleSwitch
        checked={settings.forwarding.autoForward}
        onChange={(value) => updateSetting('forwarding', 'autoForward', value)}
        label="Auto Forward Messages"
      />
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Batch Size</label>
        <input
          type="number"
          min="1"
          max="100"
          value={settings.forwarding.batchSize}
          onChange={(e) => updateSetting('forwarding', 'batchSize', parseInt(e.target.value))}
          className="input-modern"
        />
        <p className="text-xs text-gray-400 mt-1">Number of messages to process at once</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Delay (ms)</label>
        <input
          type="number"
          min="100"
          max="10000"
          step="100"
          value={settings.forwarding.delay}
          onChange={(e) => updateSetting('forwarding', 'delay', parseInt(e.target.value))}
          className="input-modern"
        />
        <p className="text-xs text-gray-400 mt-1">Delay between forwarding batches</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Retry Attempts</label>
        <input
          type="number"
          min="1"
          max="10"
          value={settings.forwarding.retryAttempts}
          onChange={(e) => updateSetting('forwarding', 'retryAttempts', parseInt(e.target.value))}
          className="input-modern"
        />
        <p className="text-xs text-gray-400 mt-1">Number of retry attempts for failed forwards</p>
      </div>
    </div>
  );

  const PrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Log Retention (days)</label>
        <input
          type="number"
          min="1"
          max="365"
          value={settings.privacy.logRetention}
          onChange={(e) => updateSetting('privacy', 'logRetention', parseInt(e.target.value))}
          className="input-modern"
        />
        <p className="text-xs text-gray-400 mt-1">How long to keep activity logs</p>
      </div>
      <ToggleSwitch
        checked={settings.privacy.analytics}
        onChange={(value) => updateSetting('privacy', 'analytics', value)}
        label="Enable Analytics"
      />
      <ToggleSwitch
        checked={settings.privacy.shareData}
        onChange={(value) => updateSetting('privacy', 'shareData', value)}
        label="Share Anonymous Usage Data"
      />
    </div>
  );

  const AdvancedSettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="flex items-center mb-2">
          <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
          <span className="text-yellow-400 font-medium">Advanced Settings</span>
        </div>
        <p className="text-gray-300 text-sm">
          These settings are for advanced users only. Changing them incorrectly may affect the performance of your application.
        </p>
      </div>
      
      <div className="space-y-4">
        <button className="btn-secondary w-full flex items-center justify-center space-x-2">
          <i className="fas fa-download"></i>
          <span>Export Settings</span>
        </button>
        <button className="btn-secondary w-full flex items-center justify-center space-x-2">
          <i className="fas fa-upload"></i>
          <span>Import Settings</span>
        </button>
        <button className="btn-modern bg-red-500 hover:bg-red-600 w-full flex items-center justify-center space-x-2">
          <i className="fas fa-trash"></i>
          <span>Reset All Settings</span>
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileSettings />;
      case 'notifications': return <NotificationSettings />;
      case 'forwarding': return <ForwardingSettings />;
      case 'privacy': return <PrivacySettings />;
      case 'advanced': return <AdvancedSettings />;
      default: return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="text-gradient">Settings</span>
            </h1>
            <p className="text-purple-200 text-lg">Customize your Telegram Forwarder experience</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/dashboard-modern')}
              className="btn-ghost flex items-center space-x-2"
            >
              <i className="fas fa-arrow-left"></i>
              <span>Back</span>
            </button>
            <ThemeToggle />
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          {/* Sidebar Navigation */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <ModernCard className="p-0 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Settings Menu</h3>
              </div>
              <nav className="p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <i className={`${tab.icon} ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}></i>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </ModernCard>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <ModernCard className="card-hover">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {tabs.find(t => t.id === activeTab)?.name}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={saveSettings}
                      disabled={isSaving}
                      className="btn-modern flex items-center space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading settings...</p>
                  </div>
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderTabContent()}
                  </motion.div>
                )}
              </div>
            </ModernCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsModern;