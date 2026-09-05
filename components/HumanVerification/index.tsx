'use client'

import { useEffect, useRef, useState } from 'react'
import { RecaptchaVerifier } from 'firebase/auth'

import { cn } from '@/utils/tailwind'
import { getFirebaseAuth } from '@/config/firebase'
import useLanguage from '@/hooks/useLanguage'

export type HumanVerificationProps = {
  onVerified: (verified: boolean, token?: string) => void
}

const HumanVerification = ({ onVerified }: HumanVerificationProps) => {
  const { translate } = useLanguage()
  const [isVerified, setIsVerified] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const verifierRef = useRef<RecaptchaVerifier | null>(null)

  useEffect(() => {
    const auth = getFirebaseAuth()

    if (!auth || !containerRef.current) return
    // 1. Ép ngôn ngữ Firebase Auth
    auth.languageCode = 'vi'

    // 2. Xóa script reCAPTCHA cũ đã bị inject vào <head> (nếu có)
    const existingScript = document.querySelector('script[src*="recaptcha/api.js"]')

    if (existingScript) {
      existingScript.remove()
    }
    containerRef.current.innerHTML = ''

    const verifier = new RecaptchaVerifier(auth, containerRef.current, {
      size: 'normal',
      callback: async () => {
        const token = await verifier.verify()

        setCaptchaToken(token)
        setIsVerified(true)
      },
      'expired-callback': () => {
        setCaptchaToken(undefined)
        setIsVerified(false)
      },
    })

    verifierRef.current = verifier
    verifier.render()

    return () => {
      try {
        verifier.clear()
      } catch {
        // ignore
      }
      verifierRef.current = null
    }
  }, [])

  useEffect(() => {
    onVerified(isVerified, captchaToken)
  }, [isVerified, captchaToken, onVerified])

  return (
    <div className='flex flex-col gap-2'>
      <div className={cn('flex items-center gap-3 rounded-lg border border-border bg-white p-3', isVerified && 'border-green-500')}>
        <div ref={containerRef} className='flex items-center justify-center' />
        {isVerified && <span className='text-sm text-green-600 font-medium'>{translate('auth.register.captchaVerified')}</span>}
      </div>
    </div>
  )
}

export default HumanVerification
