import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/router';

type Language = 'fa';

interface LanguageContextType {
  language: Language;
  direction: 'rtl';
  isRTL: true;
  formatDate: (date: Date) => string;
  convertNumbers: (str: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

const formatDateForLocale = (date: Date): string => {
  const toPersianNumbers = (numStr: string): string => {
    const persianNumbers: { [key: string]: string } = {
      '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
      '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
    };
    return numStr.replace(/\d/g, (digit) => persianNumbers[digit] || digit);
  };

  try {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    const formatted = new Intl.DateTimeFormat('fa-IR-u-nu-latn', options).format(date);
    return toPersianNumbers(formatted);
  } catch (error) {
    console.error('Date formatting error:', error);
    return date.toLocaleDateString();
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const router = useRouter();
  const language: Language = 'fa'; // Hardcode to Farsi

  const formatNumber = useCallback((num: number): string => {
    const toPersianNumbers = (numStr: string): string => {
      const persianNumbers: { [key: string]: string } = {
        '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
        '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
      };
      return numStr.replace(/\d/g, (digit) => persianNumbers[digit] || digit);
    };
    return toPersianNumbers(num.toLocaleString());
  }, []);

  const formatDate = useCallback((date: Date): string => {
    return formatDateForLocale(date);
  }, []);

  const value: LanguageContextType = {
    language,
    direction: 'rtl',
    isRTL: true,
    formatDate,
    convertNumbers: useCallback((str: string): string => {
      const toPersianNumbers = (numStr: string): string => {
        const persianNumbers: { [key: string]: string } = {
          '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
          '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
        };
        return numStr.replace(/\d/g, (digit) => persianNumbers[digit] || digit);
      };
      return toPersianNumbers(str);
    }, []),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};