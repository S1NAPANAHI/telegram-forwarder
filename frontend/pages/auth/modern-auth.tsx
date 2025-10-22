import React, { useState } from 'react'
import Head from 'next/head'
import { ModernCard } from '../../components/ui/ModernCard'
import { ModernInput } from '../../components/ui/ModernInput'
import { ModernButton } from '../../components/ui/ModernButton'
import { useTheme } from '../../components/ui/ThemeProvider'
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  SunIcon,
  MoonIcon 
} from '@heroicons/react/24/outline'

export default function ModernAuth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const { theme, toggleTheme } = useTheme()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle authentication logic
    console.log('Form submitted:', formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <Head>
        <title>{isSignUp ? 'ثبت نام' : 'ورود'} - تلگرام فوروارد</title>
        <meta name="description" content="ورود به سیستم مدیریت فوروارد تلگرام" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-400/10 dark:bg-blue-500/10 animate-float" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-400/10 dark:bg-purple-500/10 animate-float" style={{ animationDelay: '2s' } as React.CSSProperties} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-blue-400/5 to-purple-400/5 dark:from-blue-500/5 dark:to-purple-500/5" />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="fixed top-6 left-6 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200"
        >
          {theme === 'dark' ? (
            <SunIcon className="w-5 h-5 text-yellow-500" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Auth Container */}
        <div className="relative w-full max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Branding */}
            <div className="text-center lg:text-right space-y-6 order-2 lg:order-1">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                  تلگرام فوروارد
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto lg:mx-0">
                  سیستم پیشرفته مدیریت و فوروارد خودکار پیام‌های تلگرام
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
                <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">۱۰۰+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">کانال فعال</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">۹۹.۹%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">آپتایم</div>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="order-1 lg:order-2">
              <ModernCard variant="glass" className="p-8 backdrop-blur-xl">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {isSignUp ? 'ایجاد حساب کاربری' : 'ورود به حساب'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isSignUp 
                      ? 'حساب کاربری جدید ایجاد کنید' 
                      : 'به حساب کاربری خود وارد شوید'
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {isSignUp && (
                    <ModernInput
                      label="نام کامل"
                      placeholder="نام و نام خانوادگی"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      icon={<UserIcon className="w-5 h-5" />}
                      required
                    />
                  )}
                  
                  <ModernInput
                    label="ایمیل"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    icon={<EnvelopeIcon className="w-5 h-5" />}
                    required
                  />
                  
                  <ModernInput
                    label="رمز عبور"
                    type="password"
                    placeholder="رمز عبور خود را وارد کنید"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    icon={<LockClosedIcon className="w-5 h-5" />}
                    required
                  />

                  <ModernButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full justify-center"
                  >
                    {isSignUp ? 'ایجاد حساب' : 'ورود'}
                  </ModernButton>
                </form>

                <div className="text-center mt-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    {isSignUp ? 'قبلاً حساب دارید؟' : 'حساب کاربری ندارید؟'}
                  </p>
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 mt-1"
                  >
                    {isSignUp ? 'وارد شوید' : 'ثبت نام کنید'}
                  </button>
                </div>
              </ModernCard>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}