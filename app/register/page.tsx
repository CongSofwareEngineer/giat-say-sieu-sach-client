'use client'

import { useState } from 'react'
import Link from 'next/link'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import OtpVerification from '@/components/OtpVerification'
import { EyeIcon } from '@/components/Icons/Eye'
import { EyeSlashIcon } from '@/components/Icons/EyeSlash'
import { CheckBadgeIcon } from '@/components/Icons/CheckBadge'
import { formatPhoneToE164 } from '@/utils/phone'
import useLanguage from '@/hooks/useLanguage'

type Step = 'form' | 'otp' | 'success'

const RegisterPage = () => {
  const { translate } = useLanguage()
  const [step, setStep] = useState<Step>('form')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const validate = (): boolean => {
    const newErrors = { name: '', phone: '', password: '', confirmPassword: '' }
    let isValid = true

    if (!formData.name.trim()) {
      newErrors.name = translate('common.required')
      isValid = false
    }

    if (!formData.phone.trim()) {
      newErrors.phone = translate('booking.validation.phoneRequired')
      isValid = false
    } else if (!formatPhoneToE164(formData.phone)) {
      newErrors.phone = translate('booking.validation.phoneInvalid')
      isValid = false
    }

    if (!formData.password) {
      newErrors.password = translate('common.required')
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = translate('auth.register.passwordMin')
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = translate('common.required')
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = translate('auth.register.passwordMismatch')
      isValid = false
    }

    setErrors(newErrors)

    return isValid
  }

  // Step 1: validate the form, then move to OTP verification.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    // Phone is real only after OTP is confirmed, preventing spam registrations.
    setStep('otp')
  }

  // Step 2: phone verified by Firebase SMS -> actually create the account.
  const handleVerified = async () => {
    setIsSubmitting(true)

    try {
      // Simulate API call (replace with real register request)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setStep('success')
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-[60vh] flex items-center justify-center py-12 px-4'>
      <MyCard className='w-full max-w-md'>
        <MyCardBody>
          {step === 'success' ? (
            <div className='text-center py-6 flex flex-col items-center gap-3'>
              <CheckBadgeIcon className='w-16 h-16 text-success' />
              <h1 className='text-2xl font-bold text-text'>{translate('auth.register.successTitle')}</h1>
              <p className='text-gray-600'>{translate('auth.register.successDesc')}</p>
              <Link href='/login' className='mt-2'>
                <MyButton variant='primary'>{translate('auth.register.goToLogin')}</MyButton>
              </Link>
            </div>
          ) : step === 'otp' ? (
            <OtpVerification
              phoneNumber={formData.phone}
              autoSend
              onVerified={handleVerified}
              onBack={() => setStep('form')}
              onError={() => setStep('form')}
            />
          ) : (
            <>
              <div className='text-center mb-8'>
                <h1 className='text-2xl font-bold text-text mb-2'>{translate('auth.register.title')}</h1>
                <p className='text-gray-600'>{translate('auth.register.subtitle')}</p>
                <p className='text-gray-500 text-sm mt-2'>{translate('auth.register.otpHint')}</p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4'>
                <MyInput
                  label={translate('auth.register.name')}
                  placeholder={translate('auth.register.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  error={errors.name}
                />

                <MyInput
                  label={translate('auth.register.phone')}
                  placeholder={translate('auth.register.phonePlaceholder')}
                  type='tel'
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  error={errors.phone}
                />

                <div className='relative'>
                  <MyInput
                    label={translate('auth.register.password')}
                    placeholder={translate('auth.register.passwordPlaceholder')}
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    error={errors.password}
                  />
                  <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-9 p-3 -m-3 text-gray-500'>
                    {showPassword ? <EyeSlashIcon className='w-5 h-5' /> : <EyeIcon className='w-5 h-5' />}
                  </button>
                </div>

                <div className='relative'>
                  <MyInput
                    label={translate('auth.register.confirmPassword')}
                    placeholder={translate('auth.register.confirmPasswordPlaceholder')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    error={errors.confirmPassword}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-9 p-3 -m-3 text-gray-500'
                  >
                    {showConfirmPassword ? <EyeSlashIcon className='w-5 h-5' /> : <EyeIcon className='w-5 h-5' />}
                  </button>
                </div>

                <MyButton type='submit' variant='primary' loading={isSubmitting} className='w-full'>
                  {translate('auth.register.submit')}
                </MyButton>
              </form>

              <div className='mt-6 text-center'>
                <p className='text-gray-600 text-sm'>
                  {translate('auth.register.hasAccount')}{' '}
                  <Link href='/login' className='text-primary font-medium'>
                    {translate('auth.register.loginNow')}
                  </Link>
                </p>
              </div>
            </>
          )}
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default RegisterPage
