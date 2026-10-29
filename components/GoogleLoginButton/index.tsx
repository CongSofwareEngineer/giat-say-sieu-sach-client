'use client'

import { useState } from 'react'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

import { googleLoginAction } from '@/app/login/actions'
import MyButton from '@/components/MyButton'
import MyInput from '@/components/MyInput'
import GoogleIcon from '@/components/Icons/SocialMedia/Google'
import { getFirebaseAuth } from '@/config/firebase'
import { FIREBASE_POPUP_CANCEL_CODES, HTTP_STATUS } from '@/constants/app'
import useLanguage from '@/hooks/useLanguage'
import { User } from '@/services/users/type'
import { formatPhoneToE164, isValidVnPhone } from '@/utils/phone'

export type GoogleLoginButtonProps = {
  // Cookies are already saved: the page stores the user and redirects
  onSuccess: (user: User) => void | Promise<void>
}

type Step = 'button' | 'phone' | 'password'

// "Continue with Google"; the first time it also asks for a phone (every account needs one to book), and the password when that phone already has an account
const GoogleLoginButton = ({ onSuccess }: GoogleLoginButtonProps) => {
  const { translate } = useLanguage()
  const [step, setStep] = useState<Step>('button')
  const [idToken, setIdToken] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const reset = () => {
    setStep('button')
    setIdToken('')
    setPhone('')
    setPassword('')
    setError('')
  }

  const submit = async (token: string, phoneValue?: string, passwordValue?: string) => {
    const result = await googleLoginAction(token, phoneValue, passwordValue)

    if (result.status === 'ok') {
      // Our own cookies hold the session; the Firebase sign-in was only needed for the ID token
      const auth = getFirebaseAuth()

      if (auth) signOut(auth).catch(() => {})
      await onSuccess(result.user)

      return
    }

    if (result.status === 'requirePhone') return setStep('phone')
    if (result.status === 'requirePassword') return setStep('password')

    if (result.httpStatus === HTTP_STATUS.CONFLICT) setError(translate('auth.google.phoneLinked'))
    else if (result.httpStatus === HTTP_STATUS.UNAUTHORIZED && step === 'password') setError(translate('auth.google.wrongPassword'))
    else setError(translate('auth.google.error'))
  }

  const handleGoogle = async () => {
    const auth = getFirebaseAuth()

    if (!auth || isLoading) return

    setError('')
    setIsLoading(true)

    try {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider())
      const token = await credential.user.getIdToken()

      setIdToken(token)
      await submit(token)
    } catch (e) {
      const code = (e as { code?: string })?.code ?? ''

      if (!FIREBASE_POPUP_CANCEL_CODES.includes(code)) setError(translate('auth.google.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidVnPhone(phone)) return setError(translate('booking.validation.phoneInvalid'))
    if (step === 'password' && !password) return setError(translate('auth.google.passwordRequired'))

    setError('')
    setIsLoading(true)

    try {
      await submit(idToken, formatPhoneToE164(phone) ?? phone, step === 'password' ? password : undefined)
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'button') {
    return (
      <div className='space-y-2'>
        <MyButton type='button' variant='outline' size='large' loading={isLoading} className='w-full gap-2' onClick={handleGoogle}>
          <GoogleIcon />
          {translate('auth.google.button')}
        </MyButton>
        {error && <p className='text-sm text-red-500'>{error}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleStepSubmit} className='space-y-4 rounded-2xl border border-border p-4'>
      <p className='text-sm text-gray-600'>{translate(step === 'phone' ? 'auth.google.phoneHint' : 'auth.google.passwordHint')}</p>

      <MyInput
        label={translate('auth.login.phone')}
        placeholder={translate('auth.login.phonePlaceholder')}
        type='tel'
        value={phone}
        disabled={step === 'password'}
        onChange={(e) => setPhone(e.target.value)}
      />

      {step === 'password' && (
        <MyInput
          label={translate('auth.login.password')}
          placeholder={translate('auth.login.passwordPlaceholder')}
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      )}

      {error && <p className='text-sm text-red-500'>{error}</p>}

      <div className='flex justify-end gap-2'>
        <MyButton type='button' variant='ghost' onClick={reset}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton type='submit' variant='primary' loading={isLoading}>
          {translate('auth.google.continue')}
        </MyButton>
      </div>
    </form>
  )
}

export default GoogleLoginButton
