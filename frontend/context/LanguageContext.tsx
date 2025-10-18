import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/router';

type Language = 'fa' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  direction: 'rtl' | 'ltr';
  isRTL: boolean;
  toggleLanguage: () => void;
  formatNumber: (num: number) => string;
  formatDate: (date: Date) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Persian number mapping
const persianNumbers: { [key: string]: string } = {
  '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
  '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
};

const englishNumbers: { [key: string]: string } = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
};

// Utility functions
const toPersianNumbers = (str: string): string => {
  return str.replace(/[0-9]/g, (digit) => persianNumbers[digit] || digit);
};

const toEnglishNumbers = (str: string): string => {
  return str.replace(/[۰-۹]/g, (digit) => englishNumbers[digit] || digit);
};

// Improved date formatting
const formatDateForLocale = (date: Date, locale: string): string => {
  try {
    if (locale === 'fa') {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      };
      const formatted = new Intl.DateTimeFormat('fa-IR-u-nu-latn', options).format(date);
      return toPersianNumbers(formatted);
    } else {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      };
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
  } catch (error) {
    console.error('Date formatting error:', error);
    return date.toLocaleDateString();
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const router = useRouter();
  const [language, setLanguageState] = useState<Language>('fa');
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize language from localStorage or router locale
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      const routerLanguage = router.locale as Language;
      const initialLanguage = savedLanguage || routerLanguage || 'fa';
      setLanguageState(initialLanguage);
      setMounted(true);
      
      // Apply initial direction without animation
      applyDirectionImmediate(initialLanguage);
    }
  }, [router.locale]);

  // Immediate direction application without transitions
  const applyDirectionImmediate = useCallback((lang: Language) => {
    if (typeof document !== 'undefined') {
      const direction = lang === 'fa' ? 'rtl' : 'ltr';
      const isRTLLang = direction === 'rtl';
      
      // Disable transitions temporarily
      document.documentElement.style.transition = 'none';
      document.body.style.transition = 'none';
      
      // Apply direction changes
      document.documentElement.dir = direction;
      document.documentElement.lang = lang;
      document.documentElement.setAttribute('data-direction', direction);
      
      // Update body attributes
      document.body.setAttribute('dir', direction);
      document.body.setAttribute('lang', lang);
      
      // Update classes
      document.documentElement.classList.toggle('rtl', isRTLLang);
      document.documentElement.classList.toggle('ltr', !isRTLLang);
      document.body.classList.toggle('rtl', isRTLLang);
      document.body.classList.toggle('ltr', !isRTLLang);
      
      // Update CSS custom properties for font family
      document.documentElement.style.setProperty(
        '--font-family', 
        lang === 'fa' 
          ? "'IRANSansX', 'Shabnam', 'Vazirmatn', 'Tahoma', 'Arial', sans-serif"
          : "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
      );
      
      // Re-enable transitions after a brief delay
      setTimeout(() => {
        document.documentElement.style.transition = '';
        document.body.style.transition = '';
      }, 50);
    }
  }, []);

  // Enhanced setLanguage with loading state
  const setLanguage = useCallback(async (newLanguage: Language) => {
    if (newLanguage === language || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Apply direction immediately
      applyDirectionImmediate(newLanguage);
      
      // Update state
      setLanguageState(newLanguage);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', newLanguage);
      }
      
      // Update Next.js router locale if different
      if (router.locale !== newLanguage) {
        await router.push(router.pathname, router.asPath, { locale: newLanguage });
      }
      
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  }, [language, isLoading, router, applyDirectionImmediate]);

  const toggleLanguage = useCallback(() => {
    const newLanguage = language === 'fa' ? 'en' : 'fa';
    setLanguage(newLanguage);
  }, [language, setLanguage]);

  const formatNumber = useCallback((num: number): string => {
    const numStr = num.toLocaleString();
    return language === 'fa' ? toPersianNumbers(numStr) : numStr;
  }, [language]);

  const formatDate = useCallback((date: Date): string => {
    return formatDateForLocale(date, language);
  }, [language]);

  const direction = language === 'fa' ? 'rtl' : 'ltr';
  const isRTL = direction === 'rtl';

  const value: LanguageContextType = {
    language,
    setLanguage,
    direction,
    isRTL,
    toggleLanguage,
    formatNumber,
    formatDate,
    isLoading
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Enhanced direction-aware classes hook
export const useDirectionClasses = () => {
  const { isRTL } = useLanguage();
  
  return {
    // Margin classes
    ml: (value: string) => isRTL ? `mr-${value}` : `ml-${value}`,
    mr: (value: string) => isRTL ? `ml-${value}` : `mr-${value}`,
    
    // Padding classes
    pl: (value: string) => isRTL ? `pr-${value}` : `pl-${value}`,
    pr: (value: string) => isRTL ? `pl-${value}` : `pr-${value}`,
    
    // Border classes
    borderL: isRTL ? 'border-r' : 'border-l',
    borderR: isRTL ? 'border-l' : 'border-r',
    
    // Text alignment
    textLeft: isRTL ? 'text-right' : 'text-left',
    textRight: isRTL ? 'text-left' : 'text-right',
    
    // Position classes
    left: (value: string) => isRTL ? `right-${value}` : `left-${value}`,
    right: (value: string) => isRTL ? `left-${value}` : `right-${value}`,
    
    // Flex classes
    justifyStart: isRTL ? 'justify-end' : 'justify-start',
    justifyEnd: isRTL ? 'justify-start' : 'justify-end',
  };
};

// Hook for RTL-aware animations
export const useDirectionAwareAnimation = () => {
  const { isRTL } = useLanguage();
  
  return {
    slideInLeft: isRTL ? 'slideInRight' : 'slideInLeft',
    slideInRight: isRTL ? 'slideInLeft' : 'slideInRight',
    slideOutLeft: isRTL ? 'slideOutRight' : 'slideOutLeft',
    slideOutRight: isRTL ? 'slideOutLeft' : 'slideOutRight',
  };
};

// Utility function to get direction-aware class name
export const getDirectionClass = (ltrClass: string, rtlClass: string, isRTL: boolean): string => {
  return isRTL ? rtlClass : ltrClass;
};

// Utility function to convert between Persian and English numbers
export const convertNumbers = (str: string, targetLanguage: Language): string => {
  if (targetLanguage === 'fa') {
    return toPersianNumbers(toEnglishNumbers(str)); // First normalize to English, then to Persian
  } else {
    return toEnglishNumbers(str);
  }
};

export default LanguageContext;