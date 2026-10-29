'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { REFERRAL } from '@/constants/app'
import { parseReferralCode, saveReferralCode } from '@/utils/referral'

// Saves the `?ref=` code of any page opened with a referral link; a newer link replaces the old code
const ReferralTracker = () => {
  const pathname = usePathname()

  useEffect(() => {
    const code = parseReferralCode(new URLSearchParams(window.location.search).get(REFERRAL.QUERY_PARAM))

    if (code) saveReferralCode(code)
  }, [pathname])

  return null
}

export default ReferralTracker
