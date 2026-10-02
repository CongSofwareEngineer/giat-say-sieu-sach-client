'use client'

import { useState } from 'react'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MyInput from '@/components/MyInput'
import { EyeIcon } from '@/components/Icons/Eye'
import { EyeSlashIcon } from '@/components/Icons/EyeSlash'
import { HttpError } from '@/config/baseApi'
import { HTTP_STATUS, MIN_PASSWORD_LENGTH } from '@/constants/app'
import useLanguage from '@/hooks/useLanguage'
import UserService from '@/services/users'
import { toast } from '@/utils/toast'

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword'
type PasswordForm = Record<PasswordField, string>
type PasswordErrors = Partial<Record<PasswordField | 'general', string>>

const EMPTY_FORM: PasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' }

const ChangePasswordForm = () => {
  const { translate } = useLanguage()
  const [form, setForm] = useState<PasswordForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<PasswordErrors>({})
  const [visible, setVisible] = useState<Record<PasswordField, boolean>>({ currentPassword: false, newPassword: false, confirmPassword: false })
  const [isSaving, setIsSaving] = useState(false)

  const validate = (): boolean => {
    const newErrors: PasswordErrors = {}

    if (!form.currentPassword) newErrors.currentPassword = translate('common.required')

    if (!form.newPassword) newErrors.newPassword = translate('common.required')
    else if (form.newPassword.trim().length < MIN_PASSWORD_LENGTH)
      newErrors.newPassword = translate('changePassword.errors.minLength', { min: MIN_PASSWORD_LENGTH })
    else if (form.newPassword === form.currentPassword) newErrors.newPassword = translate('changePassword.errors.sameAsCurrent')

    if (!form.confirmPassword) newErrors.confirmPassword = translate('common.required')
    else if (form.confirmPassword !== form.newPassword) newErrors.confirmPassword = translate('auth.register.passwordMismatch')

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isSaving || !validate()) return

    setIsSaving(true)

    try {
      await UserService.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setForm(EMPTY_FORM)
      toast({ message: translate('changePassword.success'), type: 'default' })
    } catch (error) {
      // 400 = wrong current password (the new one is already validated above)
      if (error instanceof HttpError && error.status === HTTP_STATUS.BAD_REQUEST) {
        setErrors({ currentPassword: translate('changePassword.errors.currentInvalid') })
      } else {
        setErrors({ general: translate('common.error') })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const renderPasswordInput = (field: PasswordField, autoComplete: string) => (
    <div className='relative'>
      <MyInput
        label={translate(`changePassword.${field}`)}
        placeholder={translate(`changePassword.${field}Placeholder`)}
        type={visible[field] ? 'text' : 'password'}
        autoComplete={autoComplete}
        required
        value={form[field]}
        onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
        error={errors[field]}
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
    <MyCard>
      <MyCardHeader>
        <h2 className='text-lg font-bold text-text'>{translate('changePassword.title')}</h2>
        <p className='text-sm text-gray-500'>{translate('changePassword.subtitle', { min: MIN_PASSWORD_LENGTH })}</p>
      </MyCardHeader>
      <MyCardBody>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {renderPasswordInput('currentPassword', 'current-password')}
          {renderPasswordInput('newPassword', 'new-password')}
          {renderPasswordInput('confirmPassword', 'new-password')}

          {errors.general && <p className='text-sm text-red-600'>{errors.general}</p>}

          <div className='flex justify-end'>
            <MyButton type='submit' variant='primary' loading={isSaving}>
              {translate('changePassword.submit')}
            </MyButton>
          </div>
        </form>
      </MyCardBody>
    </MyCard>
  )
}

export default ChangePasswordForm
