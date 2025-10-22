import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTheme } from '../ui/ThemeProvider'
import { ModernButton } from '../ui/ModernButton'
import { 
  HomeIcon, 
  ChartBarIcon, 
  Cog6ToothIcon, 
  ChatBubbleLeftRightIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'داشبورد', href: '/dashboard-modern', icon: HomeIcon },
  { name: 'کانال‌ها', href: '/channels-modern', icon: ChatBubbleLeftRightIcon },
  { name: 'آمار', href: '/analytics-modern', icon: ChartBarIcon },
  { name: 'تنظیمات', href: '/settings-modern', icon: Cog6ToothIcon },
]

export const ModernNavigation: React.FC = () => {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              تلگرام فوروارد
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4 space-x-reverse">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <div className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                    }`}>
                      <item.icon className="w-5 h-5 ml-2" />
                      {item.name}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5 text-yellow-500" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-5 h-5" />
                ) : (
                  <Bars3Icon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5 ml-3" />
                      {item.name}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}