'use client'

import type { BranchItem, BranchPayload } from '@/services/branch'

import { useMemo, useState } from 'react'

import MyInput from '@/components/MyInput'
import MySelect from '@/components/MySelect'
import MyButton from '@/components/MyButton'
import useAdminBranches from '@/hooks/admin/useAdminBranches'
import useGetProvinces from '@/hooks/reactQuery/useGetProvinces'
import useGetWards from '@/hooks/reactQuery/useGetWards'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { BRANCH_SOCIAL, VN_LOCAL_PHONE_REGEX } from '@/constants/app'

type BranchFormProps = {
  // Edit mode when provided
  branch?: BranchItem
}

type SocialLinks = Record<BRANCH_SOCIAL, string>

const SOCIAL_FIELDS = Object.values(BRANCH_SOCIAL)

const BranchForm = ({ branch }: BranchFormProps) => {
  const { translate } = useLanguage()
  const { close } = useModalDrawer()
  const { createBranch, updateBranch, isCreating, isUpdating } = useAdminBranches()

  const [name, setName] = useState(branch?.name ?? '')
  const [phone, setPhone] = useState(branch?.phone ?? '')
  const [address, setAddress] = useState(branch?.address ?? '')
  const [city, setCity] = useState(branch?.city ?? '')
  const [district, setDistrict] = useState(branch?.district ?? '')
  const [openingHours, setOpeningHours] = useState(branch?.openingHours ?? '')
  const [isActive, setIsActive] = useState(branch?.isActive ?? true)
  const [socialMedia, setSocialMedia] = useState<SocialLinks>(
    () => Object.fromEntries(SOCIAL_FIELDS.map((key) => [key, branch?.socialMedia?.[key] ?? ''])) as SocialLinks
  )

  const [isSubmitted, setIsSubmitted] = useState(false)

  // City / ward names must match LocationApi names so the booking branch filter works
  const { provinces, isLoading: isLoadingProvinces } = useGetProvinces()
  const provinceId = useMemo(() => provinces.find((p) => p.name === city)?.id, [provinces, city])
  const { wards, isLoading: isLoadingWards } = useGetWards(provinceId)

  const cityOptions = useMemo(() => provinces.map((p) => ({ value: p.name, label: p.full_name || p.name })), [provinces])
  const wardOptions = useMemo(() => wards.map((w) => ({ value: w.name, label: w.full_name || w.name })), [wards])

  const errors = {
    name: isSubmitted && !name.trim() ? translate('admin.branches.validation.nameRequired') : undefined,
    phone: isSubmitted && !VN_LOCAL_PHONE_REGEX.test(phone.trim()) ? translate('admin.branches.validation.phoneInvalid') : undefined,
    address: isSubmitted && !address.trim() ? translate('admin.branches.validation.addressRequired') : undefined,
    city: isSubmitted && !city ? translate('admin.branches.validation.cityRequired') : undefined,
    district: isSubmitted && !district ? translate('admin.branches.validation.districtRequired') : undefined,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)

    if (!name.trim() || !VN_LOCAL_PHONE_REGEX.test(phone.trim()) || !address.trim() || !city || !district) return

    // Server replaces all social links with what is sent, empty ones are dropped there
    const payload: BranchPayload = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city,
      district,
      openingHours: openingHours.trim(),
      socialMedia,
      isActive,
    }

    try {
      if (branch) {
        await updateBranch({ id: branch.id, payload })
      } else {
        await createBranch(payload)
      }
      close()
    } catch {
      // Error toast is shown by the mutation
    }
  }

  return (
    <form onSubmit={handleSubmit} className='w-full space-y-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <MyInput
          label={translate('admin.branches.name')}
          placeholder={translate('admin.branches.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />
        <MyInput
          label={translate('admin.branches.phone')}
          type='tel'
          placeholder={translate('admin.branches.phonePlaceholder')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          required
        />
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <MySelect
          label={translate('admin.branches.city')}
          data={cityOptions}
          value={city}
          placeholder={isLoadingProvinces ? translate('common.loading') : translate('admin.branches.cityPlaceholder')}
          disabled={isLoadingProvinces}
          error={errors.city}
          onChange={(item) => {
            setCity(item.value as string)
            setDistrict('')
          }}
        />
        <MySelect
          label={translate('admin.branches.district')}
          data={wardOptions}
          value={district}
          placeholder={isLoadingWards ? translate('common.loading') : translate('admin.branches.districtPlaceholder')}
          disabled={!city || isLoadingWards}
          error={errors.district}
          onChange={(item) => setDistrict(item.value as string)}
        />
      </div>

      <MyInput
        label={translate('admin.branches.address')}
        placeholder={translate('admin.branches.addressPlaceholder')}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        error={errors.address}
        required
      />
      <MyInput
        label={translate('admin.branches.openingHours')}
        placeholder={translate('admin.branches.openingHoursPlaceholder')}
        value={openingHours}
        onChange={(e) => setOpeningHours(e.target.value)}
      />

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {SOCIAL_FIELDS.map((key) => (
          <MyInput
            key={key}
            type='url'
            label={translate(`admin.branches.social.${key}`)}
            placeholder={translate('admin.branches.socialPlaceholder')}
            value={socialMedia[key]}
            onChange={(e) => setSocialMedia((prev) => ({ ...prev, [key]: e.target.value }))}
          />
        ))}
      </div>

      <label className='flex cursor-pointer items-center gap-2'>
        <input type='checkbox' className='toggle toggle-primary toggle-sm' checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <span className='text-sm text-text'>{translate('admin.branches.isActive')}</span>
      </label>

      <div className='flex justify-end pt-2'>
        <MyButton variant='outline' size='small' className='mr-2' onClick={() => close()}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton type='submit' variant='primary' size='small' loading={isCreating || isUpdating}>
          {translate('common.save')}
        </MyButton>
      </div>
    </form>
  )
}

export default BranchForm
