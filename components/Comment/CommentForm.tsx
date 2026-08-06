'use client'

import { useRef, useState } from 'react'

import MyInput from '@/components/MyInput'
import MyTextarea from '@/components/MyTextarea'
import MyButton from '@/components/MyButton'
import MySelect from '@/components/MySelect'
import RatingInput from '@/components/Comment/RatingInput'
import { CameraIcon } from '@/components/Icons/Camera'
import { PlusIcon } from '@/components/Icons/Plus'
import { TrashIcon } from '@/components/Icons/Trash'
import { COMMENT_SERVICES, CommentItem } from '@/services/comment'
import { MAX_COMMENT_IMAGES } from '@/constants/app'
import useBase64Img from '@/hooks/useBase64Img'
import useGetListComments from '@/hooks/reactQuery/useGetListComments'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import useUser from '@/hooks/useUser'
import { cn } from '@/utils/tailwind'

type CommentFormProps = {
  defaultServiceId?: string
  editingComment?: CommentItem
  onDone?: () => void
}

type FormState = {
  phone: string
  name: string
  title: string
  content: string
  serviceId: string
  rating: number
}

type FormErrors = Partial<Record<keyof FormState | 'images', string>>

// Convert an optimized File into a base64 data URL string
const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

// Review submission form with optional optimized image upload. Reused for create and edit.
const CommentForm = ({ defaultServiceId = '', editingComment, onDone }: CommentFormProps) => {
  const { translate } = useLanguage()
  const { close } = useModalDrawer()
  const { user, isLogin } = useUser()
  const { getFileOptimize } = useBase64Img()
  const { createComment, updateComment } = useGetListComments()

  const isEditing = !!editingComment
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<FormState>({
    phone: editingComment?.phone ?? user?.phone ?? '',
    name: editingComment?.name ?? user?.name ?? '',
    title: editingComment?.title ?? '',
    content: editingComment?.content ?? '',
    serviceId: editingComment?.serviceId ?? defaultServiceId,
    rating: editingComment?.rating ?? 0,
  })
  const [images, setImages] = useState<string[]>(editingComment?.images ?? [])
  const [errors, setErrors] = useState<FormErrors>({})
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const serviceOptions = COMMENT_SERVICES.map((s) => ({ value: s.id, label: s.name }))
  const canAddImage = images.length < MAX_COMMENT_IMAGES
  // Name/phone come from the account when logged in, or from the existing review when editing
  const identityLocked = isEditing || isLogin

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  // Optimize each picked image via cropper then store as base64
  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || !canAddImage) return

    const picked = Array.from(files).slice(0, MAX_COMMENT_IMAGES - images.length)

    setIsOptimizing(true)

    try {
      for (const file of picked) {
        const optimized = await getFileOptimize(file)
        const base64 = await fileToBase64(optimized)

        setImages((prev) => [...prev, base64])
      }
    } catch {
      // Ignore failed/cancelled crops
    } finally {
      setIsOptimizing(false)

      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) newErrors.name = translate('reviews.validation.nameRequired')
    if (!formData.phone.trim()) newErrors.phone = translate('reviews.validation.phoneRequired')
    else if (!/^(0[0-9]{9})$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = translate('reviews.validation.phoneInvalid')
    if (!formData.serviceId) newErrors.serviceId = translate('reviews.validation.serviceRequired')
    if (formData.rating < 1) newErrors.rating = translate('reviews.validation.ratingRequired')
    if (!formData.title.trim()) newErrors.title = translate('reviews.validation.titleRequired')
    if (!formData.content.trim()) newErrors.content = translate('reviews.validation.contentRequired')

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      if (isEditing && editingComment) {
        await updateComment({
          id: editingComment.id,
          payload: { title: formData.title.trim(), content: formData.content.trim(), images, rating: formData.rating },
        })
      } else {
        await createComment({
          serviceId: formData.serviceId,
          phone: formData.phone.trim(),
          name: formData.name.trim(),
          title: formData.title.trim(),
          content: formData.content.trim(),
          images,
          rating: formData.rating,
        })
      }

      setIsSuccess(true)
      onDone?.()

      setTimeout(() => close(), 1400)
    } catch {
      setSubmitError(translate('reviews.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className='flex w-full flex-col items-center gap-3 py-10 text-center'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600'>✓</div>
        <p className='text-lg font-bold text-text'>{translate('reviews.success')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='w-full space-y-4'>
      <MyInput
        label={translate('reviews.form.name')}
        placeholder={translate('reviews.form.namePlaceholder')}
        required
        disabled={identityLocked}
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
      />

      <MyInput
        label={translate('reviews.form.phone')}
        placeholder={translate('reviews.form.phonePlaceholder')}
        required
        disabled={identityLocked}
        type='tel'
        value={formData.phone}
        onChange={(e) => handleChange('phone', e.target.value)}
        error={errors.phone}
      />

      <div>
        <label className='mb-1.5 block text-sm font-medium text-text'>
          {translate('reviews.form.service')}
          <span className='ml-1 text-red-600'>*</span>
        </label>
        <MySelect
          data={serviceOptions}
          value={formData.serviceId}
          placeholder={translate('reviews.form.selectService')}
          disabled={isEditing}
          onChange={(item) => handleChange('serviceId', item.value as string)}
          style={{ width: '100%' }}
        />
        {errors.serviceId && <p className='mt-1 text-sm text-red-600'>{errors.serviceId}</p>}
      </div>

      <div>
        <label className='mb-1.5 block text-sm font-medium text-text'>
          {translate('reviews.form.rating')}
          <span className='ml-1 text-red-600'>*</span>
        </label>
        <RatingInput value={formData.rating} onChange={(value) => handleChange('rating', value)} />
        {errors.rating && <p className='mt-1 text-sm text-red-600'>{errors.rating}</p>}
      </div>

      <MyInput
        label={translate('reviews.form.title')}
        placeholder={translate('reviews.form.titlePlaceholder')}
        required
        value={formData.title}
        onChange={(e) => handleChange('title', e.target.value)}
        error={errors.title}
      />

      <MyTextarea
        label={translate('reviews.form.content')}
        placeholder={translate('reviews.form.contentPlaceholder')}
        required
        value={formData.content}
        onChange={(e) => handleChange('content', e.target.value)}
        error={errors.content}
      />

      <div>
        <label className='mb-1.5 block text-sm font-medium text-text'>{translate('reviews.form.images')}</label>
        <p className='mb-2 text-xs text-gray-400'>{translate('reviews.form.maxImages', { max: MAX_COMMENT_IMAGES })}</p>

        <div className='flex flex-wrap gap-3'>
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className='group relative h-20 w-20 overflow-hidden rounded-xl border border-border'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={translate('reviews.form.images')} className='h-full w-full object-cover' />
              <button
                type='button'
                aria-label={translate('common.delete')}
                onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                className='absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-600'
              >
                <TrashIcon className='h-3.5 w-3.5' />
              </button>
            </div>
          ))}

          {canAddImage && (
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              disabled={isOptimizing}
              className={cn(
                'flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-gray-400 transition-colors',
                'hover:border-primary hover:text-primary',
                isOptimizing && 'pointer-events-none opacity-60'
              )}
            >
              {isOptimizing ? (
                <span className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
              ) : (
                <>
                  <CameraIcon className='h-6 w-6' />
                  <PlusIcon className='h-4 w-4 -mt-2' />
                </>
              )}
            </button>
          )}
        </div>

        <input ref={fileInputRef} type='file' accept='image/*' multiple className='hidden' onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {submitError && <p className='text-sm text-red-600'>{submitError}</p>}

      <div className='flex justify-end pt-2'>
        <MyButton type='submit' variant='primary' loading={isSubmitting}>
          {isEditing ? translate('reviews.form.update') : translate('reviews.form.submit')}
        </MyButton>
      </div>
    </form>
  )
}

export default CommentForm
