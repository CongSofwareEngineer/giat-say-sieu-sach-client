import { AsYouType, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'

import { VN_LOCAL_PHONE_REGEX } from '@/constants/app'

// Default region for parsing/formatting
export const DEFAULT_COUNTRY: CountryCode = 'VN'

// Convert a raw phone string to E.164 (e.g. +84901234567). Returns null if invalid.
export const formatPhoneToE164 = (phone: string, country: CountryCode = DEFAULT_COUNTRY): string | null => {
  try {
    const parsed = parsePhoneNumberFromString(phone, country)

    if (parsed?.isValid()) {
      return parsed.number
    }

    return null
  } catch {
    return null
  }
}

// Format a phone string progressively for display (e.g. 090 123 4567).
export const formatPhoneDisplay = (phone: string, country: CountryCode = DEFAULT_COUNTRY): string => {
  return new AsYouType(country).input(phone)
}

// Keep only digits, used to sanitize OTP input.
export const digitsOnly = (value: string): string => value.replace(/\D/g, '')

// Replace an international Vietnamese prefix (+84 / 843...) with a leading 0
export const normalizeVnPhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s.-]/g, '')

  if (cleaned.startsWith('+84')) {
    return `0${cleaned.slice(3)}`
  }
  if (cleaned.startsWith('84') && cleaned.length > 2) {
    return `0${cleaned.slice(2)}`
  }

  return cleaned
}

// Validate a Vietnamese mobile phone, accepting +84 or 84 prefixes as well as 0
export const isValidVnPhone = (phone: string): boolean => {
  return VN_LOCAL_PHONE_REGEX.test(normalizeVnPhone(phone))
}
