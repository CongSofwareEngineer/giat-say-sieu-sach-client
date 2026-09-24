'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'

import MyButton from '@/components/MyButton'
import MyInput from '@/components/MyInput'
import MyTextarea from '@/components/MyTextarea'
import MySelect from '@/components/MySelect'
import TiptapEditor from '@/components/Blog/TiptapEditor'
import useAdminBlog from '@/hooks/admin/useAdminBlog'
import useLanguage from '@/hooks/useLanguage'
import { useModalDrawer } from '@/hooks/useModalDrawer'
import { toast } from '@/utils/toast'
import { BlogPost } from '@/services/blog'
import { slugify } from '@/utils/slugify'

type BlogFormProps = {
  post?: BlogPost
}

export default function BlogForm({ post }: BlogFormProps) {
  const { translate } = useLanguage()
  const router = useRouter()
  const { close } = useModalDrawer()
  const { createPost, updatePost, isCreating, isUpdating } = useAdminBlog()

  const [content, setContent] = useState('')
  const [thumbnail, setThumbnail] = useState(post?.thumbnail ?? '')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<{
    title: string
    slug: string
    thumbnail: string
    excerpt: string
    category: string
    isPublished: boolean
  }>({
    defaultValues: {
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      thumbnail: post?.thumbnail ?? '',
      excerpt: post?.excerpt ?? '',
      category: post?.category ?? 'Mẹo hay',
      isPublished: post?.isPublished ?? false,
    },
  })

  const title = watch('title')

  useEffect(() => {
    if (title && !post) {
      setValue('slug', slugify(title), { shouldValidate: true })
    }
  }, [title, post, setValue])

  useEffect(() => {
    if (post?.content) {
      setContent(post.content)
    }
  }, [post])

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        content,
        thumbnail: thumbnail || data.thumbnail,
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
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        <MyInput
          label={translate('blog.title')}
          placeholder={translate('blog.title')}
          {...register('title', { required: translate('common.required') })}
          error={errors.title?.message}
        />

        <MyInput
          label={translate('blog.slug', {}, 'Slug (URL)')}
          placeholder={translate('blog.slug', {}, 'tự động tạo từ tiêu đề')}
          {...register('slug', { required: translate('common.required') })}
          error={errors.slug?.message}
        />
      </div>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        <MyInput
          label={translate('blog.thumbnail', {}, 'Ảnh đại diện (URL)')}
          placeholder='https://example.com/image.jpg'
          {...register('thumbnail')}
          onChange={(e) => {
            setThumbnail(e.target.value)
          }}
        />

        <MySelect
          label={translate('blog.category')}
          options={categories.map((c) => ({ value: c, label: c }))}
          {...register('category', { required: translate('common.required') })}
          error={errors.category?.message}
          placeholder={translate('common.select')}
        />
      </div>

      <MyTextarea
        label={translate('blog.excerpt', {}, 'Mô tả ngắn')}
        placeholder={translate('blog.excerpt', {}, 'Mô tả ngắn cho bài viết...')}
        rows={3}
        {...register('excerpt')}
      />

      <div>
        <label className='block text-sm font-medium text-text mb-2'>{translate('blog.content', {}, 'Nội dung')}</label>
        <TiptapEditor value={content} onChange={setContent} placeholder={translate('blog.editor.placeholder', {}, 'Viết nội dung bài viết...')} />
        {errors.content && <p className='mt-1 text-sm text-red-600'>{errors.content.message}</p>}
      </div>

      <div className='flex items-center gap-3'>
        <input
          type='checkbox'
          id='isPublished'
          {...register('isPublished')}
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