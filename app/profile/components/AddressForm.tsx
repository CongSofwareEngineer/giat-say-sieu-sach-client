'use client'

import { useEffect, useMemo, useState } from 'react'

import MyButton from '@/components/MyButton'
import MyInput from '@/components/MyInput'
import MySelect from '@/components/MySelect'
import useLanguage from '@/hooks/useLanguage'
import { PHONE_REGEX } from '@/constants/address'
import { AddressItem, CreateAddressPayload } from '@/services/address/type'
import LocationService from '@/services/location'
import { Province, District } from '@/services/location/type'

export type AddressFormProps = {
  address?: AddressItem
  onSubmit: (payload: CreateAddressPayload) => Promise<void>
}

type FormErrors = Partial<Record<keyof CreateAddressPayload, string>>

const AddressForm = ({ address, onSubmit }: AddressFormProps) => {
  const { translate } = useLanguage()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [formData, setFormData] = useState({
    label: address?.label ?? '',
    recipientName: address?.recipientName ?? '',
    phone: address?.phone ?? '',
    address: address?.address ?? '',
    city: address?.city ?? '',
    district: address?.district ?? '',
    ward: address?.ward ?? '',
    isDefault: address?.isDefault ?? false,
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)

  const isLockedDefault = !!address?.isDefault

  useEffect(() => {
    let active = true

    const loadProvinces = async () => {
      setLoadingProvinces(true)

      try {
        const data = await LocationService.getProvinces()

        if (active) {
          setProvinces(data)
        }
      } finally {
        if (active) {
          setLoadingProvinces(false)
        }
      }
    }

    loadProvinces()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadDistricts = async () => {
      if (!formData.city) {
        setDistricts([])
        return
      }

      setLoadingDistricts(true)

      try {
        const province = provinces.find((p) => p.name === formData.city)

        if (province) {
          const data = await LocationService.getDistricts(Number(province.id))

          if (active) {
            setDistricts(data)
          }
        }
      } finally {
        if (active) {
          setLoadingDistricts(false)
        }
      }
    }

    loadDistricts()

    return () => {
      active = false
    }
  }, [formData.city, provinces])

  const cityOptions = useMemo(
    () => provinces.map((province) => ({ value: province.name, label: province.full_name || province.name })),
    [provinces],
  )
  const districtOptions = useMemo(
    () => districts.map((district) => ({ value: district.name, label: district.full_name || district.name })),
    [districts],
  )

  const handleChange = (field: keyof CreateAddressPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.label.trim()) newErrors.label = translate('profile.addresses.validation.labelRequired')
    if (!formData.recipientName.trim()) newErrors.recipientName = translate('profile.addresses.validation.nameRequired')
    if (!formData.phone.trim()) newErrors.phone = translate('profile.addresses.validation.phoneRequired')
    else if (!PHONE_REGEX.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = translate('profile.addresses.validation.phoneInvalid')
    if (!formData.address.trim()) newErrors.address = translate('profile.addresses.validation.detailRequired')
    if (!formData.city) newErrors.city = translate('profile.addresses.validation.cityRequired')
    if (!formData.district) newErrors.district = translate('profile.addresses.validation.districtRequired')

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate() || isSubmitting) return

    setSubmitError('')
    setIsSubmitting(true)

    try {
      await onSubmit({
        label: formData.label.trim(),
        recipientName: formData.recipientName.trim(),
        phone: formData.phone.replace(/\s/g, ''),
        address: formData.address.trim(),
        ward: '',
        district: formData.district,
        city: formData.city,
        isDefault: formData.isDefault,
      })
    } catch {
      setSubmitError(translate('profile.addresses.errors.save'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='w-full space-y-4'>
      <MyInput
        label={translate('profile.addresses.form.label')}
        placeholder={translate('profile.addresses.form.labelPlaceholder')}
        required
        value={formData.label}
        onChange={(e) => handleChange('label', e.target.value)}
        error={errors.label}
      />

      <MyInput
        label={translate('profile.addresses.form.name')}
        placeholder={translate('profile.addresses.form.namePlaceholder')}
        required
        value={formData.recipientName}
        onChange={(e) => handleChange('recipientName', e.target.value)}
        error={errors.recipientName}
      />

      <MyInput
        label={translate('profile.addresses.form.phone')}
        placeholder={translate('profile.addresses.form.phonePlaceholder')}
        required
        type='tel'
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        error={errors.phone}
      />

      <MyInput
        label={translate('profile.addresses.form.detail')}
        placeholder={translate('profile.addresses.form.detailPlaceholder')}
        required
        value={formData.address}
        onChange={(e) => handleChange('address', e.target.value)}
        error={errors.address}
      />

      <div>
        <label className='block text-sm font-medium text-text mb-1.5'>
          {translate('profile.addresses.form.city')}
          <span className='text-red-600 ml-1'>*</span>
        </label>
        <MySelect
          data={cityOptions}
          value={formData.city}
          placeholder={loadingProvinces ? translate('common.loading') : '--'}
          disabled={loadingProvinces}
          onChange={(item) => {
            handleChange('city', item.value as string)
            setFormData((prev) => ({ ...prev, district: '' }))
          }}
          style={{ width: '100%' }}
        />
        {errors.city && <p className='mt-1 text-sm text-red-600'>{errors.city}</p>}
      </div>

      <div>
        <label className='block text-sm font-medium text-text mb-1.5'>
          {translate('profile.addresses.form.district')}
          <span className='text-red-600 ml-1'>*</span>
        </label>
        <MySelect
          data={districtOptions}
          value={formData.district}
          placeholder={loadingDistricts ? translate('common.loading') : '--'}
          disabled={!formData.city || loadingDistricts}
          onChange={(item) => handleChange('district', item.value as string)}
          style={{ width: '100%' }}
        />
        {errors.district && <p className='mt-1 text-sm text-red-600'>{errors.district}</p>}
      </div>

      <label className={`flex items-center gap-2 ${isLockedDefault ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
        <input
          type='checkbox'
          checked={formData.isDefault}
          disabled={isLockedDefault}
          onChange={(e) => setFormData((prev) => ({ ...prev, isDefault: e.target.checked }))}
          className='h-4 w-4 rounded border-gray-300 text-primary'
        />
        <span className='text-sm text-gray-600'>{translate('profile.addresses.form.isDefault')}</span>
      </label>

      {submitError && <p className='text-sm text-red-600'>{submitError}</p>}

      <div className='flex justify-end pt-2'>
        <MyButton type='submit' variant='primary' loading={isSubmitting}>
          {translate('profile.addresses.form.submit')}
        </MyButton>
      </div>
    </form>
  )
}

export default AddressForm
