'use client'

import { useEffect, useState } from 'react'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MyInput from '@/components/MyInput'
import useLanguage from '@/hooks/useLanguage'
import useUser from '@/hooks/useUser'
import { PHONE_REGEX } from '@/constants/address'

type InfoErrors = { name?: string; phone?: string; email?: string }

const ProfileInfoForm = () => {
  const { translate } = useLanguage()
  const { user, updateUser } = useUser()

  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [infoForm, setInfoForm] = useState({ name: '', phone: '', email: '' })
  const [errors, setErrors] = useState<InfoErrors>({})

  // Sync form once user data is loaded
  useEffect(() => {
    if (user?.id) {
      setInfoForm({ name: user.name ?? '', phone: user.phone ?? '', email: user.email ?? '' })
    }
  }, [user?.id, user?.name, user?.phone, user?.email])

  const validate = (): boolean => {
    const newErrors: InfoErrors = {}

    if (!infoForm.name.trim()) newErrors.name = translate('common.required')
    if (!infoForm.phone.trim()) newErrors.phone = translate('booking.validation.phoneRequired')
    else if (!PHONE_REGEX.test(infoForm.phone.replace(/\s/g, ''))) newErrors.phone = translate('booking.validation.phoneInvalid')

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      updateUser({ name: infoForm.name.trim(), phone: infoForm.phone.trim(), email: infoForm.email.trim() })
      setIsSaving(false)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }, 800)
  }

  return (
    <MyCard>
      <MyCardHeader>
        <h2 className='text-lg font-bold text-text'>{translate('profile.info.title')}</h2>
      </MyCardHeader>
      <MyCardBody>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <MyInput
            label={translate('profile.info.fullName')}
            placeholder={translate('profile.info.fullNamePlaceholder')}
            required
            value={infoForm.name}
            onChange={(e) => setInfoForm((prev) => ({ ...prev, name: e.target.value }))}
            error={errors.name}
          />
          <MyInput
            label={translate('profile.info.phone')}
            placeholder={translate('profile.info.phonePlaceholder')}
            required
            type='tel'
            value={infoForm.phone}
            onChange={(e) => setInfoForm((prev) => ({ ...prev, phone: e.target.value }))}
            error={errors.phone}
          />
          <MyInput
            label={translate('profile.info.email')}
            placeholder={translate('profile.info.emailPlaceholder')}
            type='email'
            value={infoForm.email}
            onChange={(e) => setInfoForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <div className='flex items-center justify-end gap-3'>
            {isSaved && <span className='text-sm text-green-600'>{translate('profile.info.saved')}</span>}
            <MyButton type='submit' variant='primary' loading={isSaving}>
              {translate('profile.info.save')}
            </MyButton>
          </div>
        </form>
      </MyCardBody>
    </MyCard>
  )
}

export default ProfileInfoForm
