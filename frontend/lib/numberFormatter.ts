/**
 * Utility functions for number formatting in Persian and English
 */

// Persian (Farsi) digits
const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

// English digits
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/**
 * Convert English digits to Persian digits
 * @param input - String containing English digits
 * @returns String with Persian digits
 */
export const toPersianDigits = (input: string | number): string => {
  const str = String(input)
  return str.replace(/\d/g, (digit) => persianDigits[parseInt(digit)])
}

/**
 * Convert Persian digits to English digits
 * @param input - String containing Persian digits
 * @returns String with English digits
 */
export const toEnglishDigits = (input: string): string => {
  return input.replace(/[۰-۹]/g, (digit) => {
    const index = persianDigits.indexOf(digit)
    return index !== -1 ? englishDigits[index] : digit
  })
}

/**
 * Format number based on language preference
 * @param number - Number to format
 * @param language - Language code ('fa' for Persian, 'en' for English)
 * @param options - Intl.NumberFormatOptions for additional formatting
 * @returns Formatted number string
 */
export const formatNumber = (
  number: number,
  language: string = 'fa',
  options: Intl.NumberFormatOptions = {}
): string => {
  const formatter = new Intl.NumberFormat(
    language === 'fa' ? 'fa-IR' : 'en-US',
    {
      ...options,
      // Use Persian digits for Persian locale
      ...(language === 'fa' && { numberingSystem: 'arabext' })
    }
  )
  
  const formatted = formatter.format(number)
  
  // For Persian, ensure we use Persian digits
  if (language === 'fa') {
    return toPersianDigits(formatted)
  }
  
  return formatted
}

/**
 * Format currency based on language preference
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'IRR' for Persian, 'USD' for English)
 * @param language - Language code
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency?: string,
  language: string = 'fa'
): string => {
  const defaultCurrency = language === 'fa' ? 'IRR' : 'USD'
  
  return formatNumber(amount, language, {
    style: 'currency',
    currency: currency || defaultCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

/**
 * Format percentage based on language preference
 * @param value - Value to format as percentage (0.15 = 15%)
 * @param language - Language code
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number,
  language: string = 'fa'
): string => {
  return formatNumber(value, language, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })
}

/**
 * Format date based on language preference
 * @param date - Date to format
 * @param language - Language code
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  language: string = 'fa',
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const formatter = new Intl.DateTimeFormat(
    language === 'fa' ? 'fa-IR' : 'en-US',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    }
  )
  
  return formatter.format(dateObj)
}

/**
 * Format time based on language preference
 * @param date - Date to format time from
 * @param language - Language code
 * @param use24Hour - Whether to use 24-hour format
 * @returns Formatted time string
 */
export const formatTime = (
  date: Date | string,
  language: string = 'fa',
  use24Hour: boolean = true
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const formatter = new Intl.DateTimeFormat(
    language === 'fa' ? 'fa-IR' : 'en-US',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !use24Hour,
    }
  )
  
  return formatter.format(dateObj)
}

/**
 * Format large numbers with appropriate units (K, M, B)
 * @param number - Number to format
 * @param language - Language code
 * @returns Formatted number with unit
 */
export const formatLargeNumber = (
  number: number,
  language: string = 'fa'
): string => {
  const units = language === 'fa' 
    ? ['هزار', 'میلیون', 'میلیارد'] // Thousand, Million, Billion in Persian
    : ['K', 'M', 'B']
  
  const divisors = [1000, 1000000, 1000000000]
  
  for (let i = divisors.length - 1; i >= 0; i--) {
    if (number >= divisors[i]) {
      const formatted = (number / divisors[i]).toFixed(1)
      const formattedNumber = formatNumber(parseFloat(formatted), language)
      return `${formattedNumber}${units[i]}`
    }
  }
  
  return formatNumber(number, language)
}

/**
 * Get the appropriate decimal separator for the language
 * @param language - Language code
 * @returns Decimal separator character
 */
export const getDecimalSeparator = (language: string = 'fa'): string => {
  return language === 'fa' ? '٫' : '.'
}

/**
 * Get the appropriate thousands separator for the language
 * @param language - Language code
 * @returns Thousands separator character
 */
export const getThousandsSeparator = (language: string = 'fa'): string => {
  return language === 'fa' ? '٬' : ','
}