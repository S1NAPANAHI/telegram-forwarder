import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ChatBubbleLeftRightIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon,
  SparklesIcon,
  LanguageIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';

export default function LoginFixed() {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();
  const { loginWithEmail } = useAuth();

  // Check for saved theme preference only
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLanguage = () => {
    const newLocale = router.locale === 'en' ? 'fa' : 'en';
    router.push(router.pathname, router.pathname, { locale: newLocale });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', email);
      await loginWithEmail(email, password);
      console.log('Login successful, redirecting...');
      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err?.response?.data?.msg || err?.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{t('login')} - {t('telegramForwarder')}</title>
        <meta name="description" content={t('loginPageDescription')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-telegram-50 via-white to-telegram-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        
        {/* Top Controls Bar */}
        <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 flex items-center space-x-3 rtl:space-x-reverse">
          <button
            onClick={toggleLanguage}
            className="p-2.5 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-xl border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <LanguageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-xl border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isDark ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
          <div className="w-full max-w-md">
            
            {/* Login Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-100/50 dark:border-gray-700/50">
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-telegram-500 to-telegram-600 rounded-3xl mb-6 shadow-telegram">
                  <ChatBubbleLeftRightIcon className="w-10 h-10 text-white" />
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('welcomeBack')}
                </h1>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  {t('loginToYourAccount')}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="flex flex-col items-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                  <DevicePhoneMobileIcon className="w-6 h-6 text-telegram-600 dark:text-telegram-400 mb-2" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                    {t('mobileOptimized')}
                  </span>
                </div>
                
                <div className="flex flex-col items-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                    {t('secure')}
                  </span>
                </div>
                
                <div className="flex flex-col items-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                  <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                    {t('smart')}
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-telegram-500 focus:border-transparent transition-all"
                    placeholder={t('enterYourEmail')}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rtl:pr-4 rtl:pl-12 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-telegram-500 focus:border-transparent transition-all"
                      placeholder={t('enterYourPassword')}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
                      {error}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-telegram-500 to-telegram-600 hover:from-telegram-600 hover:to-telegram-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('signingIn') : t('signIn')}
                </button>

                {/* Links */}
                <div className="text-center space-y-4">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-telegram-600 hover:text-telegram-700 dark:text-telegram-400 dark:hover:text-telegram-300"
                  >
                    {t('forgotPassword')}
                  </Link>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        {t('or')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('dontHaveAccount')}{' '}
                    <Link
                      href="/auth/register"
                      className="font-semibold text-telegram-600 hover:text-telegram-700 dark:text-telegram-400 dark:hover:text-telegram-300"
                    >
                      {t('signUp')}
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('secureLoginPoweredBy')}{' '}
                <span className="font-semibold text-telegram-600 dark:text-telegram-400">
                  {t('telegramForwarder')}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'en', ['common'])),
  },
})