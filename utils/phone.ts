import { AsYouType, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'

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

// Vietnamese mobile phone pattern (local form, without leading +84)
const LOCAL_PHONE_REGEX = /^0[0-9]{9}$/

// Replace an international Vietnamese prefix (+84 / 843...) with a leading 0
export const normalizeVnPhone = (phone: string): string => {
  const cleaned = phone.replace(/\s/g, '')

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
  return LOCAL_PHONE_REGEX.test(normalizeVnPhone(phone))
}
