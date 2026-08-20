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
