'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import MyLoading from '@/components/MyLoading'
import MyInput from '@/components/MyInput'
import MyTextarea from '@/components/MyTextarea'
import MySelect from '@/components/MySelect'
import TiptapEditor from '@/components/Blog/TiptapEditor'
import useAdminBlog from '@/hooks/admin/useAdminBlog'
import useLanguage from '@/hooks/useLanguage'
import { toast } from '@/utils/toast'
import { slugify } from '@/utils/slugify'
import { ArrowLeftIcon } from '@/components/Icons/ArrowLeft'
import { CheckIcon } from '@/components/Icons/Check'

type FormValues = {
  title: string
  slug: string
  thumbnail: string
  excerpt: string
  category: string
  isPublished: boolean
}

const AdminBlogNewPage = () => {
  const router = useRouter()
  const { translate } = useLanguage()
  const { createPost, isCreating } = useAdminBlog()

  const [values, setValues] = useState<FormValues>({
    title: '',
    slug: '',
    thumbnail: '',
    excerpt: '',
    category: 'Mẹo hay',
    isPublished: false,
  })
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (values.title) {
      setValues((prev) => ({ ...prev, slug: slugify(prev.title) }))
    }
  }, [values.title])

  const handleChange = (field: keyof FormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }))
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

    try {
      const payload = {
        ...values,
        content,
      }

      await createPost(payload)
      toast({ message: translate('admin.blog.created', {}, 'Thêm bài viết thành công'), type: 'default' })
      router.push('/admin/blog')
    } catch {
      toast({ message: translate('common.error'), type: 'error' })
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
              <MyInput
                label={translate('blog.thumbnail', {}, 'Ảnh đại diện (URL)')}
                placeholder='https://example.com/image.jpg'
                value={values.thumbnail}
                onChange={(e) => handleChange('thumbnail', e.target.value)}
              />
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
              <TiptapEditor
                value={content}
                onChange={setContent}
                placeholder={translate('blog.editor.placeholder', {}, 'Viết nội dung bài viết...')}
                className='min-h-[400px]'
              />
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
                disabled={isCreating}
                className='flex items-center gap-2'
              >
                {isCreating ? (
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
