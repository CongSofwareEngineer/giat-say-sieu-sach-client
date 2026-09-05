'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { loginAction } from './actions'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import { EyeIcon } from '@/components/Icons/Eye'
import { EyeSlashIcon } from '@/components/Icons/EyeSlash'
import useLanguage from '@/hooks/useLanguage'
import useUser from '@/hooks/useUser'

const LoginPage = () => {
  const { translate } = useLanguage()
  const router = useRouter()
  const { login } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    rememberMe: true,
  })
  const [errors, setErrors] = useState({
    phone: '',
    password: '',
    general: '',
  })

  const validate = (): boolean => {
    const newErrors = { phone: '', password: '', general: '' }
    let isValid = true

    if (!formData.phone.trim()) {
      newErrors.phone = translate('booking.validation.phoneRequired')
      isValid = false
    } else if (!/^(0[0-9]{9})$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = translate('booking.validation.phoneInvalid')
      isValid = false
    }

    if (!formData.password) {
      newErrors.password = translate('common.required')
      isValid = false
    }

    setErrors(newErrors)

    return isValid
  }

  const syncFcmToken = async () => {
    if (typeof window === 'undefined') {
      return
    }

    const storedToken = localStorage.getItem('fcm_token')

    if (!storedToken) {
      return
    }

    try {
      const UserService = (await import('@/services/users')).default

      await UserService.updateFcmToken(storedToken)
    } catch {
      // Silent fail for FCM token sync
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    setErrors((prev) => ({ ...prev, general: '' }))

    try {
      const response = await loginAction(formData.phone, formData.password)

      login(response.user)
      await syncFcmToken()
      router.replace(response.user.role === 'ADMIN' ? '/admin' : '/')
    } catch {
      setErrors((prev) => ({ ...prev, general: translate('auth.login.error') }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-[60vh] flex items-center justify-center py-12 px-4'>
      <MyCard className='w-full max-w-md'>
        <MyCardBody>
          <div className='text-center mb-8'>
            <h1 className='text-2xl font-bold text-text mb-2'>{translate('auth.login.title')}</h1>
            <p className='text-gray-600'>{translate('auth.login.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <MyInput
              label={translate('auth.login.phone')}
              placeholder={translate('auth.login.phonePlaceholder')}
              type='tel'
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              error={errors.phone}
            />

            <div className='relative'>
              <MyInput
                label={translate('auth.login.password')}
                placeholder={translate('auth.login.passwordPlaceholder')}
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                error={errors.password}
              />
              <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-9 p-3 -m-3 text-gray-500'>
                {showPassword ? <EyeSlashIcon className='w-5 h-5' /> : <EyeIcon className='w-5 h-5' />}
              </button>
            </div>

            {errors.general && <p className='text-sm text-red-500'>{errors.general}</p>}

            <div className='flex items-center justify-between'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }))}
                  className='w-4 h-4 rounded border-gray-300 text-primary'
                />
                <span className='text-sm text-gray-600'>{translate('auth.login.rememberMe')}</span>
              </label>
              <button type='button' className='px-1 py-2 text-sm text-primary'>
                {translate('auth.login.forgotPassword')}
              </button>
            </div>

            <MyButton type='submit' variant='primary' loading={isSubmitting} className='w-full'>
              {translate('auth.login.submit')}
            </MyButton>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-gray-600 text-sm'>
              {translate('auth.login.noAccount')}{' '}
              <Link href='/register' className='text-primary font-medium'>
                {translate('auth.login.registerNow')}
              </Link>
            </p>
          </div>
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default LoginPage
