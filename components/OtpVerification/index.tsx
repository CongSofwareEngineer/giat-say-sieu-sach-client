'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { RecaptchaVerifier, signInWithPhoneNumber, type Auth, type ConfirmationResult, type UserCredential } from 'firebase/auth'

import MyButton from '@/components/MyButton'
import { cn } from '@/utils/tailwind'
import { formatPhoneToE164, digitsOnly } from '@/utils/phone'
import { getFirebaseAuth } from '@/config/firebase'
import useLanguage from '@/hooks/useLanguage'

export type OtpVerificationProps = {
  // Phone number in any format; will be normalized to E.164 (VN default).
  phoneNumber: string
  // Number of OTP digits (4 or 6).
  length?: number
  // Called after the code is confirmed successfully.
  onVerified: (result: UserCredential) => void | Promise<void>
  // Called on any unrecoverable error.
  onError?: (error: unknown) => void
  // Optional: let the user go back to change the phone number.
  onBack?: () => void
  // Send the code automatically when the component mounts.
  autoSend?: boolean
  // Resend cooldown in seconds.
  resendCooldown?: number
}

type Status = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'error'

// Map Firebase auth errors to translation keys.
const SEND_ERROR_KEY: Record<string, string> = {
  'auth/invalid-phone-number': 'otp.error.invalidPhone',
  'auth/missing-phone-number': 'otp.error.invalidPhone',
  'auth/too-many-requests': 'otp.error.tooManyRequests',
  'auth/quota-exceeded': 'otp.error.quotaExceeded',
  'auth/captcha-check-failed': 'otp.error.sendFailed',
}

const Verify = ({ phoneNumber, length = 6, onVerified, onError, onBack, autoSend = true, resendCooldown = 60 }: OtpVerificationProps) => {
  const { translate } = useLanguage()

  const [code, setCode] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const confirmationRef = useRef<ConfirmationResult | null>(null)
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null)
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const e164Phone = formatPhoneToE164(phoneNumber)
  const displayPhone = formatPhoneToE164(phoneNumber) || phoneNumber
  const canSend = !!e164Phone

  // Send OTP via Firebase phone auth (SMS).
  const sendCode = useCallback(
    async (isResend = false) => {
      const auth: Auth | null = getFirebaseAuth()

      if (!auth) {
        setStatus('error')
        setErrorMsg(translate('otp.error.authUnavailable'))
        onError?.(new Error('auth-unavailable'))

        return
      }

      if (!canSend) {
        setStatus('error')
        setErrorMsg(translate('otp.error.invalidPhone'))
        onError?.(new Error('invalid-phone'))

        return
      }

      setStatus('sending')
      setErrorMsg(null)

      try {
        if (recaptchaRef.current) {
          try {
            recaptchaRef.current.clear()
          } catch {
            // ignore clear failure
          }
          recaptchaRef.current = null
        }

        const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current as HTMLElement, {
          size: 'invisible',
        })
        const confirmation = await signInWithPhoneNumber(auth, e164Phone as string, verifier)

        confirmationRef.current = confirmation
        recaptchaRef.current = verifier

        setStatus('sent')
        setSecondsLeft(resendCooldown)
        setCode('')
        inputRef.current?.focus()

        if (isResend) {
          // Optional hook for analytics could go here.
        }
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code || ''
        const key = SEND_ERROR_KEY[code] || 'otp.error.sendFailed'

        setStatus('error')
        setErrorMsg(translate(key))
        onError?.(err)
      }
    },
    [canSend, e164Phone, onError, resendCooldown, translate]
  )

  // Confirm the OTP code against Firebase.
  const verify = useCallback(
    async (value: string) => {
      const confirmation = confirmationRef.current

      if (!confirmation) {
        setStatus('error')
        setErrorMsg(translate('otp.error.notSent'))

        return
      }

      if (value.length !== length) {
        return
      }

      setStatus('verifying')
      setErrorMsg(null)

      try {
        const result = await confirmation.confirm(value)

        setStatus('verified')
        await onVerified(result)
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code || ''
        const expired = code === 'auth/code-expired'

        setStatus('sent')
        setCode('')
        setErrorMsg(translate(expired ? 'otp.error.expired' : 'otp.error.invalidCode'))
      }
    },
    [length, onVerified, translate]
  )

  // Auto-send on mount.
  useEffect(() => {
    if (autoSend && canSend) {
      sendCode(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Resend cooldown timer.
  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)

    return () => clearTimeout(timer)
  }, [secondsLeft])

  // Auto-verify when the full code is entered.
  useEffect(() => {
    if (code.length === length && status === 'sent') {
      verify(code)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, status])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = digitsOnly(e.target.value).slice(0, length)

    setCode(next)
    if (status === 'error') setErrorMsg(null)
  }

  const isSending = status === 'sending'
  const isVerifying = status === 'verifying'
  const isBusy = isSending || isVerifying

  return (
    <div className='w-full flex flex-col items-center gap-4'>
      <div className='text-center'>
        <h3 className='text-lg font-bold text-text'>{translate('otp.title')}</h3>
        <p className='text-sm text-gray-500 mt-1'>{translate('otp.subtitle', { length: String(length), phone: displayPhone })}</p>
      </div>

      {/* daisyUI OTP: empty spans (one per digit) + a single controlled input */}
      <label
        className={cn('otp otp-joined otp-lg otp-primary justify-center', status === 'error' && 'otp-error', status === 'verified' && 'otp-success')}
      >
        {Array.from({ length }).map((_, i) => (
          <span key={i} />
        ))}
        <input
          ref={inputRef}
          type='text'
          value={code}
          onChange={handleChange}
          autoComplete='one-time-code'
          inputMode='numeric'
          maxLength={length}
          pattern={`[0-9]{${length}}`}
          required
          disabled={isBusy}
          aria-label={translate('otp.verify')}
        />
      </label>

      {/* Hidden container required by Firebase reCAPTCHA verifier */}
      <div ref={recaptchaContainerRef} className='hidden' />

      {errorMsg && <p className='text-sm text-red-600 text-center'>{errorMsg}</p>}

      <div className='flex flex-col w-full gap-2'>
        <MyButton variant='primary' loading={isVerifying} disabled={code.length !== length || isBusy} onClick={() => verify(code)}>
          {isVerifying ? translate('otp.verifying') : translate('otp.verify')}
        </MyButton>

        <div className='flex items-center justify-between gap-2'>
          <button
            type='button'
            onClick={onBack}
            disabled={isBusy || !onBack}
            className='text-sm text-gray-500 hover:text-primary disabled:opacity-40'
          >
            {translate('otp.changePhone')}
          </button>

          <MyButton
            variant='outline'
            size='small'
            loading={isSending}
            disabled={secondsLeft > 0 || isBusy || !canSend}
            onClick={() => sendCode(true)}
          >
            {secondsLeft > 0 ? translate('otp.resendIn', { seconds: String(secondsLeft) }) : translate('otp.resend')}
          </MyButton>
        </div>
      </div>
    </div>
  )
}

export default Verify
