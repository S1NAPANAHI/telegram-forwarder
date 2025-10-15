import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Persian number mapping
const persianNumbers: { [key: string]: string } = {
  '0': '۰',
  '1': '۱',
  '2': '۲',
  '3': '۳',
  '4': '۴',
  '5': '۵',
  '6': '۶',
  '7': '۷',
  '8': '۸',
  '9': '۹'
};

const englishNumbers: { [key: string]: string } = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9'
};

// Utility functions
const toPersianNumbers = (str: string): string => {
  return str.replace(/[0-9]/g, (digit) => persianNumbers[digit] || digit);
};

const toEnglishNumbers = (str: string): string => {
  return str.replace(/[۰-۹]/g, (digit) => englishNumbers[digit] || digit);
};

// Date formatting for different locales
const formatDateForLocale = (date: Date, locale: string): string => {
  try {
    if (locale === 'fa') {
      // Persian date formatting
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      };
      const formatted = new Intl.DateTimeFormat('fa-IR-u-nu-latn', options).format(date);
      return toPersianNumbers(formatted);
    } else {
      // English date formatting
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

  // Initialize language from localStorage or router locale
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      const routerLanguage = router.locale as Language;
      const initialLanguage = savedLanguage || routerLanguage || 'fa';
      setLanguageState(initialLanguage);
      setMounted(true);
    }
  }, [router.locale]);

  // Update document direction and lang attribute when language changes
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      const direction = language === 'fa' ? 'rtl' : 'ltr';
      
      // Update document direction
      document.documentElement.dir = direction;
      document.documentElement.lang = language;
      
      // Update body attributes for better styling
      document.body.setAttribute('dir', direction);
      document.body.setAttribute('lang', language);
      
      // Add/remove RTL class for additional styling support
      if (language === 'fa') {
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
      } else {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
      }
      
      // Update CSS custom property for font family
      document.documentElement.style.setProperty(
        '--font-family', 
        language === 'fa' 
          ? "'Vazirmatn', 'Tahoma', 'Arial', sans-serif"
          : "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
      );
    }
  }, [language, mounted]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage);
    }
    
    // Update Next.js router locale if it's different
    if (router.locale !== newLanguage) {
      router.push(router.pathname, router.asPath, { locale: newLanguage });
    }
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'fa' ? 'en' : 'fa';
    setLanguage(newLanguage);
  };

  const formatNumber = (num: number): string => {
    const numStr = num.toLocaleString();
    return language === 'fa' ? toPersianNumbers(numStr) : numStr;
  };

  const formatDate = (date: Date): string => {
    return formatDateForLocale(date, language);
  };

  const direction = language === 'fa' ? 'rtl' : 'ltr';
  const isRTL = direction === 'rtl';

  const value: LanguageContextType = {
    language,
    setLanguage,
    direction,
    isRTL,
    toggleLanguage,
    formatNumber,
    formatDate
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

// Hook for getting direction-aware CSS classes
export const useDirectionClasses = () => {
  const { isRTL } = useLanguage();
  
  return {
    // Margin classes
    ml: isRTL ? 'mr' : 'ml',
    mr: isRTL ? 'ml' : 'mr',
    
    // Padding classes
    pl: isRTL ? 'pr' : 'pl',
    pr: isRTL ? 'pl' : 'pr',
    
    // Border classes
    'border-l': isRTL ? 'border-r' : 'border-l',
    'border-r': isRTL ? 'border-l' : 'border-r',
    
    // Text alignment
    'text-left': isRTL ? 'text-right' : 'text-left',
    'text-right': isRTL ? 'text-left' : 'text-right',
    
    // Float classes
    'float-left': isRTL ? 'float-right' : 'float-left',
    'float-right': isRTL ? 'float-left' : 'float-right',
    
    // Flex classes
    'justify-start': isRTL ? 'justify-end' : 'justify-start',
    'justify-end': isRTL ? 'justify-start' : 'justify-end',
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