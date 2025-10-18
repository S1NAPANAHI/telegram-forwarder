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

export default function Login() {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('en');
  const router = useRouter();
  const { loginWithEmail } = useAuth();

  // Check for saved theme and language preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedLocale = localStorage.getItem('locale') || router.locale || 'en';
    
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
    
    setCurrentLocale(savedLocale);
    
    // Set body direction for RTL languages
    if (savedLocale === 'fa') {
      document.body.setAttribute('dir', 'rtl');
      document.body.classList.add('rtl');
    } else {
      document.body.setAttribute('dir', 'ltr');
      document.body.classList.add('ltr');
    }
  }, [router.locale]);

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
    const newLocale = currentLocale === 'en' ? 'fa' : 'en';
    setCurrentLocale(newLocale);
    localStorage.setItem('locale', newLocale);
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

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Head>
        <title>{t('login')} - {t('telegramForwarder')}</title>
        <meta name="description" content={t('loginPageDescription')} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-telegram-50 via-white to-telegram-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        
        {/* Top Controls Bar - Mobile Optimized */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-20 flex items-center space-x-3 rtl:space-x-reverse"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleLanguage}
            className="p-2.5 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-xl border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <LanguageIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2.5 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-xl border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isDark ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600" />
            )}
          </motion.button>
        </motion.div>

        {/* Background Elements - Responsive */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-30 dark:opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(36, 161, 222, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(36, 161, 222, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }} />
          </div>
          
          {/* Animated Floating Elements */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-16 left-4 sm:top-20 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-telegram-400 to-telegram-500 rounded-full opacity-20 blur-xl"
          />
          
          <motion.div
            animate={{ 
              y: [0, 25, 0],
              rotate: [0, -10, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "easeInOut", 
              delay: 2 
            }}
            className="absolute bottom-16 right-4 sm:bottom-20 sm:right-10 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-purple-400 to-telegram-500 rounded-full opacity-20 blur-xl"
          />

          <motion.div
            animate={{ 
              x: [0, 30, 0],
              y: [0, -15, 0],
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity, 
              ease: "easeInOut", 
              delay: 4 
            }}
            className="absolute top-1/2 left-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-15 blur-lg"
          />
        </div>
        
        {/* Main Content Container */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            
            {/* Login Card */}
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-100/50 dark:border-gray-700/50 relative overflow-hidden">
                
                {/* Card Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-telegram-500/5 to-purple-500/5 rounded-3xl" />
                
                {/* Header */}
                <motion.div
                  variants={itemVariants}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-telegram-500 to-telegram-600 rounded-2xl sm:rounded-3xl mb-6 shadow-telegram relative">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-telegram-500 to-telegram-600 rounded-2xl sm:rounded-3xl opacity-30"
                    />
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {t('welcomeBack') || 'Welcome Back'}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t('loginToYourAccount') || 'Sign in to your account to continue'}
                  </p>
                </motion.div>

                {/* Feature Highlights */}
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-3 gap-4 mb-8"
                >
                  <div className="flex flex-col items-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                    <DevicePhoneMobileIcon className="w-6 h-6 text-telegram-600 dark:text-telegram-400 mb-2" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                      {t('mobileOptimized') || 'Mobile Ready'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                      {t('secure') || 'Secure'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                      {t('smart') || 'Smart'}
                    </span>
                  </div>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div variants={itemVariants}>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('email') || 'Email Address'}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-modern w-full text-base sm:text-sm"
                      placeholder={t('enterYourEmail') || 'Enter your email'}
                      required
                      disabled={loading}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('password') || 'Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-modern w-full pr-12 text-base sm:text-sm"
                        placeholder={t('enterYourPassword') || 'Enter your password'}
                        required
                        disabled={loading}
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                      >
                        <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.div variants={itemVariants}>
                    <motion.button
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full btn-primary relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] text-base font-semibold"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {t('signingIn') || 'Signing in...'}
                        </div>
                      ) : (
                        t('signIn') || 'Sign In'
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Forgot Password Link */}
                  <motion.div variants={itemVariants} className="text-center">
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-telegram-600 hover:text-telegram-700 dark:text-telegram-400 dark:hover:text-telegram-300 transition-colors"
                    >
                      {t('forgotPassword') || 'Forgot your password?'}
                    </Link>
                  </motion.div>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white/90 dark:bg-gray-800/90 text-gray-500 dark:text-gray-400 backdrop-blur-sm font-medium">
                        {t('or') || 'or'}
                      </span>
                    </div>
                  </div>

                  {/* Register Link */}
                  <motion.div
                    variants={itemVariants}
                    className="text-center"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('dontHaveAccount') || "Don't have an account?"}{' '}
                      <Link
                        href="/auth/register"
                        className="font-semibold text-telegram-600 hover:text-telegram-700 dark:text-telegram-400 dark:hover:text-telegram-300 transition-colors"
                      >
                        {t('signUp') || 'Sign up'}
                      </Link>
                    </p>
                  </motion.div>
                </form>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              variants={itemVariants}
              className="mt-8 text-center"
            >
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {t('secureLoginPoweredBy') || 'Secure login powered by'}{' '}
                <span className="text-gradient font-semibold">
                  {t('telegramForwarder') || 'Telegram Forwarder'}
                </span>
              </p>
              
              <div className="flex justify-center items-center mt-4 space-x-4 rtl:space-x-reverse">
                <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {t('privacy') || 'Privacy'}
                </Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {t('terms') || 'Terms'}
                </Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link href="/help" className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  {t('help') || 'Help'}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale || 'en', ['common'])),
  },
});