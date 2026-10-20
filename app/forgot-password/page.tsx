'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import { EyeIcon } from '@/components/Icons/Eye'
import { EyeSlashIcon } from '@/components/Icons/EyeSlash'
import HumanVerification from '@/components/HumanVerification'
import { HttpError } from '@/config/baseApi'
import { HTTP_STATUS, INFO_CONTACT, MIN_PASSWORD_LENGTH, OTP_LENGTH, OTP_RESEND_SECONDS } from '@/constants/app'
import useLanguage from '@/hooks/useLanguage'
import AuthService from '@/services/auth'
import { digitsOnly, formatPhoneToE164 } from '@/utils/phone'
import { cn } from '@/utils/tailwind'
import { toast } from '@/utils/toast'

type Step = 'request' | 'reset'
type PasswordField = 'newPassword' | 'confirmPassword'
type ResetErrors = Partial<Record<'otp' | PasswordField | 'general', string>>

const ForgotPasswordPage = () => {
  const { translate } = useLanguage()
  const router = useRouter()

  const [step, setStep] = useState<Step>('request')
  const [phone, setPhone] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(undefined)
  const [requestErrors, setRequestErrors] = useState({ phone: '', captcha: '', general: '' })
  const [isSending, setIsSending] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  const [otp, setOtp] = useState('')
  const [passwords, setPasswords] = useState<Record<PasswordField, string>>({ newPassword: '', confirmPassword: '' })
  const [visible, setVisible] = useState<Record<PasswordField, boolean>>({ newPassword: false, confirmPassword: false })
  const [resetErrors, setResetErrors] = useState<ResetErrors>({})
  const [isResetting, setIsResetting] = useState(false)

  // Resend cooldown, kept across steps so going back cannot skip it
  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)

    return () => clearTimeout(timer)
  }, [secondsLeft])

  const e164Phone = formatPhoneToE164(phone)

  // Step 1: ask the server to email an OTP
  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors = { phone: '', captcha: '', general: '' }

    if (!phone.trim()) newErrors.phone = translate('booking.validation.phoneRequired')
    else if (!e164Phone) newErrors.phone = translate('booking.validation.phoneInvalid')
    if (!captchaToken) newErrors.captcha = translate('auth.register.captchaRequired')

    setRequestErrors(newErrors)

    if (newErrors.phone || newErrors.captcha || secondsLeft > 0) return

    setIsSending(true)

    try {
      await AuthService.forgotPassword(e164Phone as string, captchaToken)
      setOtp('')
      setResetErrors({})
      setSecondsLeft(OTP_RESEND_SECONDS)
      setStep('reset')
    } catch (error) {
      const isTooMany = error instanceof HttpError && error.status === HTTP_STATUS.TOO_MANY_REQUESTS

      setRequestErrors((prev) => ({ ...prev, general: translate(isTooMany ? 'otp.error.tooManyRequests' : 'otp.error.sendFailed') }))
    } finally {
      setIsSending(false)
    }
  }

  // Step 2: OTP + new password
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: ResetErrors = {}

    if (otp.length !== OTP_LENGTH) newErrors.otp = translate('auth.forgotPassword.otpRequired', { length: OTP_LENGTH })

    if (!passwords.newPassword) newErrors.newPassword = translate('common.required')
    else if (passwords.newPassword.trim().length < MIN_PASSWORD_LENGTH)
      newErrors.newPassword = translate('changePassword.errors.minLength', { min: MIN_PASSWORD_LENGTH })

    if (!passwords.confirmPassword) newErrors.confirmPassword = translate('common.required')
    else if (passwords.confirmPassword !== passwords.newPassword) newErrors.confirmPassword = translate('auth.register.passwordMismatch')

    setResetErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    setIsResetting(true)

    try {
      await AuthService.resetPassword(e164Phone as string, otp, passwords.newPassword)
      toast({ message: translate('auth.forgotPassword.success'), type: 'default' })
      router.replace('/login')
    } catch (error) {
      const status = error instanceof HttpError ? error.status : undefined

      // 400 = wrong or expired OTP
      if (status === HTTP_STATUS.BAD_REQUEST) setResetErrors({ otp: translate('auth.forgotPassword.otpInvalid') })
      else if (status === HTTP_STATUS.TOO_MANY_REQUESTS) setResetErrors({ general: translate('otp.error.tooManyRequests') })
      else setResetErrors({ general: translate('common.error') })
    } finally {
      setIsResetting(false)
    }
  }

  // Resend needs a fresh captcha, so go back to step 1 with the phone kept
  const backToRequest = () => {
    setCaptchaToken(undefined)
    setRequestErrors({ phone: '', captcha: '', general: '' })
    setStep('request')
  }

  const renderPasswordInput = (field: PasswordField) => (
    <div className='relative'>
      <MyInput
        label={translate(`changePassword.${field}`)}
        placeholder={translate(`changePassword.${field}Placeholder`)}
        type={visible[field] ? 'text' : 'password'}
        autoComplete='new-password'
        value={passwords[field]}
        onChange={(e) => setPasswords((prev) => ({ ...prev, [field]: e.target.value }))}
        error={resetErrors[field]}
      />
      <button
        type='button'
        onClick={() => setVisible((prev) => ({ ...prev, [field]: !prev[field] }))}
        aria-label={translate(visible[field] ? 'changePassword.hide' : 'changePassword.show')}
        className='absolute right-3 top-9 -m-3 p-3 text-gray-500'
      >
        {visible[field] ? <EyeSlashIcon className='h-5 w-5' /> : <EyeIcon className='h-5 w-5' />}
      </button>
    </div>
  )

  return (
    <div className='relative flex min-h-[60vh] items-center justify-center overflow-hidden px-4 py-12'>
      <div className='pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl' />
      <div className='pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-secondary/10 blur-3xl' />
      <MyCard className='relative w-full max-w-md rounded-3xl border-white/60 bg-white/90 shadow-card-hover backdrop-blur-xl'>
        <MyCardBody>
          <div className='text-center mb-8'>
            <h1 className='text-2xl font-bold text-text mb-2'>{translate('auth.forgotPassword.title')}</h1>
            <p className='text-gray-600'>
              {step === 'request'
                ? translate('auth.forgotPassword.subtitle')
                : translate('auth.forgotPassword.sentHint', { length: OTP_LENGTH, phone: e164Phone ?? phone })}
            </p>
          </div>

          {step === 'request' ? (
            <form onSubmit={handleRequest} className='space-y-4'>
              <MyInput
                label={translate('auth.login.phone')}
                placeholder={translate('auth.login.phonePlaceholder')}
                type='tel'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={requestErrors.phone}
              />

              <div className='pt-1'>
                <HumanVerification
                  onVerified={(verified, token) => {
                    setCaptchaToken(verified ? token : undefined)
                  }}
                />
                {requestErrors.captcha && <p className='mt-1 text-sm text-red-600'>{requestErrors.captcha}</p>}
              </div>

              {requestErrors.general && <p className='text-sm text-red-500'>{requestErrors.general}</p>}

              <MyButton type='submit' variant='default' size='large' loading={isSending} disabled={secondsLeft > 0} className='w-full'>
                {secondsLeft > 0 ? translate('otp.resendIn', { seconds: secondsLeft }) : translate('auth.forgotPassword.sendCode')}
              </MyButton>
            </form>
          ) : (
            <form onSubmit={handleReset} className='space-y-4'>
              <div className='flex flex-col items-center gap-2'>
                {/* daisyUI OTP: empty spans (one per digit) + a single controlled input */}
                <label className={cn('otp otp-joined otp-lg otp-primary justify-center', resetErrors.otp && 'otp-error')}>
                  {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                    <span key={i} />
                  ))}
                  <input
                    type='text'
                    value={otp}
                    onChange={(e) => setOtp(digitsOnly(e.target.value).slice(0, OTP_LENGTH))}
                    autoComplete='one-time-code'
                    inputMode='numeric'
                    maxLength={OTP_LENGTH}
                    autoFocus
                    aria-label={translate('auth.forgotPassword.otpLabel')}
                  />
                </label>
                {resetErrors.otp && <p className='text-sm text-red-600 text-center'>{resetErrors.otp}</p>}
              </div>

              {renderPasswordInput('newPassword')}
              {renderPasswordInput('confirmPassword')}

              {resetErrors.general && <p className='text-sm text-red-500'>{resetErrors.general}</p>}

              <MyButton type='submit' variant='default' size='large' loading={isResetting} className='w-full'>
                {translate('auth.forgotPassword.submit')}
              </MyButton>

              <div className='flex justify-center'>
                <button type='button' onClick={backToRequest} disabled={isResetting} className='px-1 py-2 text-sm text-primary disabled:opacity-40'>
                  {translate('auth.forgotPassword.resend')}
                </button>
              </div>
            </form>
          )}

          {/* Accounts without an email can only be reset by an admin */}
          <div className='mt-6 rounded-xl bg-primary/5 p-4 text-sm text-gray-600'>
            <p className='mb-2'>{translate('auth.forgotPassword.noEmail')}</p>
            <div className='flex flex-wrap gap-x-4 gap-y-1'>
              <a href={INFO_CONTACT.Zalo} target='_blank' rel='noopener noreferrer' className='font-medium text-primary'>
                {translate('auth.forgotPassword.contactZalo')}
              </a>
              <a href={`tel:${INFO_CONTACT.Phone}`} className='font-medium text-primary'>
                {translate('auth.forgotPassword.contactPhone', { phone: INFO_CONTACT.Phone })}
              </a>
            </div>
          </div>

          <div className='mt-6 text-center'>
            <Link href='/login' className='text-sm text-primary font-medium'>
              {translate('auth.forgotPassword.backToLogin')}
            </Link>
          </div>
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default ForgotPasswordPage
