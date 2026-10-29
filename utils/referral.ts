import { LOCAL_STORAGE_KEY, REFERRAL, SITE_CONFIG } from '@/constants/app'

// Valid `ref` value from a link (trimmed), or null
export const parseReferralCode = (value?: string | null): string | null => {
  const code = (value ?? '').trim()

  if (!code || code.length > REFERRAL.CODE_MAX_LENGTH || !REFERRAL.CODE_REGEX.test(code)) return null

  return code
}

// Referral code saved from the last `?ref=` link opened on this device
export const getStoredReferralCode = (): string | undefined => {
  if (typeof window === 'undefined') return undefined

  try {
    return parseReferralCode(localStorage.getItem(LOCAL_STORAGE_KEY.referralCode)) ?? undefined
  } catch {
    return undefined
  }
}

// A newer link always replaces the saved code
export const saveReferralCode = (code: string) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY.referralCode, code)
  } catch {}
}

// Only cleared when the user clicks Logout; kept while logged in or logged out
export const clearReferralCode = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY.referralCode)
  } catch {}
}

export const buildReferralLink = (code: string): string => `${SITE_CONFIG.url}/?${REFERRAL.QUERY_PARAM}=${encodeURIComponent(code)}`
