'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import MyLoading from '@/components/MyLoading'
import MyInput from '@/components/MyInput'
import MyTextarea from '@/components/MyTextarea'
import MySelect from '@/components/MySelect'
import BlogEditor from '@/components/Blog/BlogEditor'
import useAdminBlog from '@/hooks/admin/useAdminBlog'
import useBase64Img from '@/hooks/useBase64Img'
import useLanguage from '@/hooks/useLanguage'
import UploadService from '@/services/upload'
import { UPLOAD_IMAGE_TYPE } from '@/constants/app'
import { toast } from '@/utils/toast'
import { slugify } from '@/utils/slugify'
import { ArrowLeftIcon } from '@/components/Icons/ArrowLeft'
import { CheckIcon } from '@/components/Icons/Check'
import { CameraIcon } from '@/components/Icons/Camera'
import { getBase64 } from '@/utils/functions'

type FormValues = {
  title: string
  slug: string
  excerpt: string
  category: string
  isPublished: boolean
}

const AdminBlogNewPage = () => {
  const router = useRouter()
  const { translate } = useLanguage()
  const { createPost, isCreating } = useAdminBlog()
  const { getFileOptimize } = useBase64Img()
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [values, setValues] = useState<FormValues>({
    title: '',
    slug: '',
    excerpt: '',
    category: 'Mẹo hay',
    isPublished: false,
  })
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (values.title) {
      setValues((prev) => ({ ...prev, slug: slugify(prev.title) }))
    }
  }, [values.title])

  const handleChange = (field: keyof FormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  // Optimize the picked thumbnail and keep it for upload on submit
  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    e.target.value = ''

    if (!file) return

    setIsOptimizing(true)

    try {
      const optimized = await getFileOptimize(file)
      const { base64 } = (await getBase64(optimized)) as { base64: string }

      setThumbnailFile(optimized)
      setThumbnailPreview(base64)
    } catch {
      // Ignore failed/cancelled crops
    } finally {
      setIsOptimizing(false)
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!values.title) newErrors.title = translate('common.required')
    if (!values.slug) newErrors.slug = translate('common.required')
    if (!values.category) newErrors.category = translate('common.required')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async () => {
    if (!validate()) return

    setIsUploading(true)

    try {
      // Upload the thumbnail first to get its path, then create the post
      const [thumbnail] = await UploadService.uploadImages(thumbnailFile ? [thumbnailFile] : [], UPLOAD_IMAGE_TYPE.BLOG)
      const payload = {
        ...values,
        thumbnail: thumbnail ?? null,
        content,
      }

      await createPost(payload)
      toast({ message: translate('admin.blog.created', {}, 'Thêm bài viết thành công'), type: 'default' })
      router.push('/admin/blog')
    } catch {
      toast({ message: translate('common.error'), type: 'error' })
    } finally {
      setIsUploading(false)
    }
  }

  const categories = [
    { value: 'Mẹo hay', label: 'Mẹo hay' },
    { value: 'Kiến thức', label: 'Kiến thức' },
    { value: 'Bảo quản', label: 'Bảo quản' },
    { value: 'Môi trường', label: 'Môi trường' },
  ]

  return (
    <div className='py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <MyButton variant='outline' onClick={() => router.push('/admin/blog')} className='flex items-center gap-2'>
            <ArrowLeftIcon className='h-4 w-4' />
            {translate('common.back')}
          </MyButton>
          <h1 className='text-2xl font-bold text-text'>{translate('admin.blog.create')}</h1>
        </div>

        <MyCard>
          <MyCardBody className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <div>
                <MyInput
                  label={translate('blog.title')}
                  placeholder={translate('blog.title')}
                  value={values.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  error={errors.title}
                />
              </div>
              <div>
                <MyInput
                  label={translate('blog.slug', {}, 'Slug (URL)')}
                  placeholder={translate('blog.slug', {}, 'tự động tạo từ tiêu đề')}
                  value={values.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  error={errors.slug}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <div>
                <label className='mb-1.5 block text-sm font-medium text-text'>{translate('blog.thumbnail')}</label>
                <button
                  type='button'
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={isOptimizing}
                  aria-label={translate('common.selectImage')}
                  className='relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border text-gray-400 transition-colors hover:border-primary hover:text-primary'
                >
                  {thumbnailPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbnailPreview} alt={translate('blog.thumbnail')} className='h-full w-full object-cover' />
                  ) : isOptimizing ? (
                    <span className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                  ) : (
                    <span className='flex flex-col items-center gap-1 text-sm'>
                      <CameraIcon className='h-6 w-6' />
                      {translate('common.selectImage')}
                    </span>
                  )}
                </button>
                <input ref={thumbnailInputRef} type='file' accept='image/*' className='hidden' onChange={handleThumbnailChange} />
              </div>
              <MySelect
                label={translate('blog.category')}
                data={categories}
                value={values.category}
                onChange={(item) => handleChange('category', String(item.value ?? ''))}
                placeholder={translate('common.select')}
                error={errors.category}
              />
            </div>

            <MyTextarea
              label={translate('blog.excerpt', {}, 'Mô tả ngắn')}
              placeholder={translate('blog.excerpt', {}, 'Mô tả ngắn cho bài viết...')}
              rows={3}
              value={values.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
            />

            <div>
              <label className='block text-sm font-medium text-text mb-2'>{translate('blog.content', {}, 'Nội dung')}</label>
              <div className='min-h-[400px] rounded-lg border border-border py-4'>
                <BlogEditor onChange={setContent} />
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <input
                type='checkbox'
                id='isPublished'
                checked={values.isPublished}
                onChange={(e) => handleChange('isPublished', e.target.checked)}
                className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
              />
              <label htmlFor='isPublished' className='text-sm text-text'>
                {translate('admin.blog.publish', {}, 'Xuất bản ngay')}
              </label>
            </div>

            <div className='flex justify-end gap-3 pt-4 border-t border-border'>
              <MyButton type='button' variant='outline' onClick={() => router.push('/admin/blog')}>
                {translate('common.cancel')}
              </MyButton>
              <MyButton
                type='button'
                variant='primary'
                onClick={onSubmit}
                disabled={isCreating || isUploading}
                className='flex items-center gap-2'
              >
                {isCreating || isUploading ? (
                  <>
                    {translate('common.saving', {}, 'Đang lưu...')}
                  </>
                ) : (
                  <>
                    <CheckIcon className='h-4 w-4' />
                    {translate('common.save')}
                  </>
                )}
              </MyButton>
            </div>
          </MyCardBody>
        </MyCard>
      </div>
    </div>
  )
}

export default AdminBlogNewPage
