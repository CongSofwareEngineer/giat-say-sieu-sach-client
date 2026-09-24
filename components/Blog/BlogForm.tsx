'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import MyButton from '@/components/MyButton'
import MyInput from '@/components/MyInput'
import MyTextarea from '@/components/MyTextarea'
import MySelect from '@/components/MySelect'
import TiptapEditor from '@/components/Blog/TiptapEditor'
import useAdminBlog from '@/hooks/admin/useAdminBlog'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { toast } from '@/utils/toast'
import { BlogPost } from '@/services/blog'
import { slugify } from '@/utils/slugify'

type FormValues = {
  title: string
  slug: string
  thumbnail: string
  excerpt: string
  category: string
  isPublished: boolean
}

type BlogFormProps = {
  post?: BlogPost
}

export default function BlogForm({ post }: BlogFormProps) {
  const { translate } = useLanguage()
  const router = useRouter()
  const { close } = useModalDrawer()
  const { createPost, updatePost, isCreating, isUpdating } = useAdminBlog()

  const [values, setValues] = useState<FormValues>({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    thumbnail: post?.thumbnail ?? '',
    excerpt: post?.excerpt ?? '',
    category: post?.category ?? 'Mẹo hay',
    isPublished: post?.isPublished ?? false,
  })
  const [content, setContent] = useState('')
  const [thumbnail, setThumbnail] = useState(post?.thumbnail ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (values.title && !post) {
      setValues((prev) => ({ ...prev, slug: slugify(prev.title) }))
    }
  }, [values.title, post])

  useEffect(() => {
    if (post?.content) {
      setContent(post.content)
    }
  }, [post])

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      const payload = {
        ...values,
        content,
        thumbnail: thumbnail || values.thumbnail,
      }

      if (post) {
        await updatePost({ id: post.id, payload })
      } else {
        await createPost(payload)
      }

      close()
      router.refresh()
    } catch {
      toast({ message: translate('common.error'), type: 'error' })
    }
  }

  const categories = ['Mẹo hay', 'Kiến thức', 'Bảo quản', 'Môi trường']

  return (
    <form onSubmit={onSubmit} className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        <MyInput
          label={translate('blog.title')}
          placeholder={translate('blog.title')}
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
        />

        <MyInput
          label={translate('blog.slug', {}, 'Slug (URL)')}
          placeholder={translate('blog.slug', {}, 'tự động tạo từ tiêu đề')}
          value={values.slug}
          onChange={(e) => handleChange('slug', e.target.value)}
          error={errors.slug}
        />
      </div>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        <MyInput
          label={translate('blog.thumbnail', {}, 'Ảnh đại diện (URL)')}
          placeholder='https://example.com/image.jpg'
          value={thumbnail}
          onChange={(e) => {
            setThumbnail(e.target.value)
            handleChange('thumbnail', e.target.value)
          }}
        />

        <MySelect
          data={categories.map((c) => ({ value: c, label: c }))}
          value={values.category}
          onChange={(item) => handleChange('category', String(item.value ?? ''))}
          placeholder={translate('common.select')}
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
        <TiptapEditor value={content} onChange={setContent} placeholder={translate('blog.editor.placeholder', {}, 'Viết nội dung bài viết...')} />
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
        <MyButton type='button' variant='outline' onClick={close}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton type='submit' variant='primary' disabled={isCreating || isUpdating}>
          {isCreating || isUpdating ? translate('common.saving', {}, 'Đang lưu...') : translate('common.save')}
        </MyButton>
      </div>
    </form>
  )
}