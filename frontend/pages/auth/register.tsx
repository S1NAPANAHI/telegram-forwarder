import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { GetStaticProps } from 'next';
import {
  EyeIcon,
  EyeSlashIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  LanguageIcon,
  MoonIcon,
  SunIcon,
  EnvelopeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

interface PasswordRequirement {
  text: string;
  regex: RegExp;
  met: boolean;
}

export default function Register() {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('en');
  const [emailValid, setEmailValid] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  // Password requirements
  const [passwordRequirements, setPasswordRequirements] = useState<PasswordRequirement[]>([
    { text: t('passwordLength') || 'At least 8 characters', regex: /.{8,}/, met: false },
    { text: t('passwordUppercase') || 'One uppercase letter', regex: /[A-Z]/, met: false },
    { text: t('passwordLowercase') || 'One lowercase letter', regex: /[a-z]/, met: false },
    { text: t('passwordNumber') || 'One number', regex: /\d/, met: false },
    { text: t('passwordSpecial') || 'One special character', regex: /[!@#$%^&*(),.?":{}|<>]/, met: false },
  ]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedLocale = localStorage.getItem('locale') || router.locale || 'en';
    
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
    
    setCurrentLocale(savedLocale);
    
    if (savedLocale === 'fa') {
      document.body.setAttribute('dir', 'rtl');
      document.body.classList.add('rtl');
    } else {
      document.body.setAttribute('dir', 'ltr');
      document.body.classList.add('ltr');
    }
  }, [router.locale]);

  // Validate email
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  }, [email]);

  // Check password requirements
  useEffect(() => {
    setPasswordRequirements(prev => 
      prev.map(req => ({
        ...req,
        met: req.regex.test(password)
      }))
    );
  }, [password]);

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

  const allPasswordRequirementsMet = passwordRequirements.every(req => req.met);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleNext = () => {
    if (step === 1 && emailValid) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailValid || !allPasswordRequirementsMet || !passwordsMatch) {
      setError(t('pleaseCompleteAllRequirements') || 'Please complete all requirements');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/register', { 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      setSuccess(t('registrationSuccessful') || 'Registration successful! Please check your email.');
      
      setTimeout(() => {
        router.push('/auth/login?message=registered');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.msg || t('registrationFailed') || 'Registration failed. Please try again.');
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

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <>
      <Head>
        <title>{t('createAccount')} - {t('telegramForwarder')}</title>
        <meta name="description" content={t('registerPageDescription')} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        
        {/* Top Controls Bar */}
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

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-30 dark:opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '25px 25px'
            }} />
          </div>
          
          <motion.div
            animate={{ 
              y: [0, -25, 0],
              rotate: [0, 15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-20 left-8 w-20 h-20 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-20 blur-xl"
          />
          
          <motion.div
            animate={{ 
              y: [0, 30, 0],
              rotate: [0, -20, 0],
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity, 
              ease: "easeInOut", 
              delay: 3 
            }}
            className="absolute bottom-24 right-8 w-32 h-32 bg-gradient-to-r from-pink-400 to-indigo-500 rounded-full opacity-15 blur-xl"
          />
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md"
          >
            
            {/* Progress Indicator */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center mb-8"
            >
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                  step >= 1 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {step > 1 ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <EnvelopeIcon className="w-4 h-4" />
                  )}
                </div>
                
                <div className={`w-12 h-1 rounded-full transition-all duration-300 ${
                  step >= 2 ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
                
                <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                  step >= 2 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  <LockClosedIcon className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            {/* Registration Card */}
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-100/50 dark:border-gray-700/50 relative overflow-hidden">
                
                {/* Header */}
                <motion.div
                  variants={itemVariants}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl sm:rounded-3xl mb-6 shadow-lg relative">
                    <UserPlusIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl sm:rounded-3xl opacity-30"
                    />
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {t('createAccount') || 'Create Account'}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step === 1 
                      ? (t('enterEmailToStart') || 'Enter your email to get started')
                      : (t('setupSecurePassword') || 'Set up a secure password')
                    }
                  </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                      >
                        {/* Email Input */}
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {t('email') || 'Email Address'}
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              id="email"
                              name="email"
                              autoComplete="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="input-modern w-full text-base sm:text-sm pl-12"
                              placeholder={t('enterYourEmail') || 'Enter your email'}
                              required
                            />
                            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {email && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {emailValid ? (
                                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                ) : (
                                  <XCircleIcon className="w-5 h-5 text-red-500" />
                                )}
                              </div>
                            )}
                          </div>
                          {email && !emailValid && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                              {t('pleaseEnterValidEmail') || 'Please enter a valid email address'}
                            </p>
                          )}
                        </div>

                        {/* Next Button */}
                        <motion.button
                          whileHover={{ scale: emailValid ? 1.02 : 1 }}
                          whileTap={{ scale: emailValid ? 0.98 : 1 }}
                          type="button"
                          onClick={handleNext}
                          disabled={!emailValid}
                          className="w-full btn-primary min-h-[48px] text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t('continue') || 'Continue'}
                        </motion.button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        variants={stepVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                      >
                        {/* Password Input */}
                        <div>
                          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {t('password') || 'Password'}
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              id="password"
                              name="password"
                              autoComplete="new-password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="input-modern w-full pr-12 text-base sm:text-sm"
                              placeholder={t('enterYourPassword') || 'Create a password'}
                              required
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg transition-colors"
                            >
                              {showPassword ? (
                                <EyeSlashIcon className="w-5 h-5" />
                              ) : (
                                <EyeIcon className="w-5 h-5" />
                              )}
                            </motion.button>
                          </div>
                        </div>

                        {/* Password Requirements */}
                        {password && (
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              {t('passwordRequirements') || 'Password Requirements:'}
                            </h4>
                            <div className="space-y-2">
                              {passwordRequirements.map((req, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center space-x-2 rtl:space-x-reverse"
                                >
                                  {req.met ? (
                                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  ) : (
                                    <XCircleIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  )}
                                  <span className={`text-sm ${
                                    req.met 
                                      ? 'text-green-600 dark:text-green-400' 
                                      : 'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    {req.text}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Confirm Password */}
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {t('confirmPassword') || 'Confirm Password'}
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              id="confirmPassword"
                              name="confirmPassword"
                              autoComplete="new-password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="input-modern w-full pr-12 text-base sm:text-sm"
                              placeholder={t('confirmYourPassword') || 'Confirm your password'}
                              required
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg transition-colors"
                            >
                              {showConfirmPassword ? (
                                <EyeSlashIcon className="w-5 h-5" />
                              ) : (
                                <EyeIcon className="w-5 h-5" />
                              )}
                            </motion.button>
                            {confirmPassword && (
                              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                                {passwordsMatch ? (
                                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                ) : (
                                  <XCircleIcon className="w-5 h-5 text-red-500" />
                                )}
                              </div>
                            )}
                          </div>
                          {confirmPassword && !passwordsMatch && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                              {t('passwordsDoNotMatch') || 'Passwords do not match'}
                            </p>
                          )}
                        </div>

                        {/* Back and Submit Buttons */}
                        <div className="flex space-x-4 rtl:space-x-reverse">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={handleBack}
                            className="flex-1 btn-secondary min-h-[48px] text-base font-semibold"
                          >
                            {t('back') || 'Back'}
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: (!allPasswordRequirementsMet || !passwordsMatch || loading) ? 1 : 1.02 }}
                            whileTap={{ scale: (!allPasswordRequirementsMet || !passwordsMatch || loading) ? 1 : 0.98 }}
                            type="submit"
                            disabled={!allPasswordRequirementsMet || !passwordsMatch || loading}
                            className="flex-1 btn-primary min-h-[48px] text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? (
                              <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {t('creating') || 'Creating...'}
                              </div>
                            ) : (
                              t('createAccount') || 'Create Account'
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                {/* Success/Error Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                    >
                      <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">
                        {error}
                      </p>
                    </motion.div>
                  )}
                  
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
                    >
                      <p className="text-sm text-green-600 dark:text-green-400 text-center font-medium">
                        {success}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login Link */}
                <motion.div
                  variants={itemVariants}
                  className="mt-8 text-center"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('alreadyHaveAccount') || 'Already have an account?'}{' '}
                    <Link
                      href="/auth/login"
                      className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                    >
                      {t('signIn') || 'Sign in'}
                    </Link>
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              variants={itemVariants}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              <div className="flex flex-col items-center p-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-xl">
                <DevicePhoneMobileIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-2" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                  {t('mobileReady') || 'Mobile Ready'}
                </span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-xl">
                <ShieldCheckIcon className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                  {t('secure') || 'Secure'}
                </span>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md rounded-xl">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                  {t('realTime') || 'Real-time'}
                </span>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              variants={itemVariants}
              className="mt-8 text-center"
            >
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {t('byCreatingAccount') || 'By creating an account, you agree to our'}{' '}
                <Link href="/terms" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                  {t('terms') || 'Terms of Service'}
                </Link>
                {' '}{t('and') || 'and'}{' '}
                <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                  {t('privacyPolicy') || 'Privacy Policy'}
                </Link>
              </p>
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