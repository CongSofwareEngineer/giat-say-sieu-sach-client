'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import MyLoading from '@/components/MyLoading'
import MyInput from '@/components/MyInput'
import MySelect from '@/components/MySelect'
import MyTextarea from '@/components/MyTextarea'
import TiptapEditor from '@/components/Blog/TiptapEditor'
import useAdminBlog from '@/hooks/admin/useAdminBlog'
import useLanguage from '@/hooks/useLanguage'
import { toast } from '@/utils/toast'
import { BlogPost } from '@/services/blog'
import { slugify } from '@/utils/slugify'
import { formatDate } from '@/utils/date'
import { ArrowLeftIcon } from '@/components/Icons/ArrowLeft'
import { CheckIcon } from '@/components/Icons/Check'
import { XIcon } from '@/components/Icons/X'

type EditableFieldProps = {
  value: string
  onSave: (value: string) => void
  onCancel: () => void
  isEditing: boolean
  onStartEdit: () => void
  className?: string
  inputClassName?: string
  placeholder?: string
  multiline?: boolean
}

function EditableField({
  value,
  onSave,
  onCancel,
  isEditing,
  onStartEdit,
  className = '',
  inputClassName = '',
  placeholder = '',
  multiline = false,
}: EditableFieldProps) {
  const [editValue, setEditValue] = useState(value)

  useEffect(() => {
    if (isEditing) {
      setEditValue(value)
    }
  }, [isEditing, value])

  const handleSave = () => {
    onSave(editValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  if (isEditing) {
    return multiline ? (
      <MyTextarea
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={inputClassName}
        autoFocus
        rows={3}
      />
    ) : (
      <MyInput
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={inputClassName}
        autoFocus
        placeholder={placeholder}
      />
    )
  }

  return (
    <span
      onClick={onStartEdit}
      className={`cursor-pointer hover:bg-gray-100 p-1 rounded ${className}`}
      title='Click to edit'
    >
      {value || <span className='text-gray-400'>{placeholder || 'Empty'}</span>}
    </span>
  )
}

type EditableSelectProps = {
  value: string
  onSave: (value: string) => void
  onCancel: () => void
  isEditing: boolean
  onStartEdit: () => void
  options: Array<{ value: string; label: string }>
  className?: string
}

function EditableSelect({
  value,
  onSave,
  onCancel,
  isEditing,
  onStartEdit,
  options,
  className = '',
}: EditableSelectProps) {
  const [editValue, setEditValue] = useState(value)

  useEffect(() => {
    if (isEditing) {
      setEditValue(value)
    }
  }, [isEditing, value])

  if (isEditing) {
    return (
      <MySelect
        data={options}
        value={editValue}
        onChange={(item) => {
          setEditValue(String(item.value ?? ''))
          onSave(String(item.value ?? ''))
        }}
        onBlur={() => onSave(editValue)}
        autoFocus
        className={className}
      />
    )
  }

  const selectedLabel = options.find((opt) => opt.value === value)?.label || value

  return (
    <span
      onClick={onStartEdit}
      className={`cursor-pointer hover:bg-gray-100 p-1 rounded inline-flex items-center ${className}`}
      title='Click to edit'
    >
      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700'>
        {selectedLabel}
      </span>
    </span>
  )
}

const AdminBlogEditPage = () => {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { translate } = useLanguage()
  const { getPostById, updatePost, isUpdating } = useAdminBlog()

  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [isContentEditing, setIsContentEditing] = useState(false)
  const [thumbnail, setThumbnail] = useState('')
  const [isThumbnailEditing, setIsThumbnailEditing] = useState(false)

  const categories = [
    { value: 'Mẹo hay', label: 'Mẹo hay' },
    { value: 'Kiến thức', label: 'Kiến thức' },
    { value: 'Bảo quản', label: 'Bảo quản' },
    { value: 'Môi trường', label: 'Môi trường' },
  ]

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true)
        const fetchedPost = await getPostById(id)
        setPost(fetchedPost)
        setContent(fetchedPost.content)
        setThumbnail(fetchedPost.thumbnail || '')
      } catch (error) {
        toast({ message: translate('common.error'), type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchPost()
    }
  }, [id, getPostById, translate])

  const handleFieldStartEdit = (field: string) => {
    setEditingField(field)
  }

  const handleFieldCancel = () => {
    setEditingField(null)
  }

  const handleFieldSave = (field: string, value: string) => {
    if (!post) return

    const updateData: Partial<BlogPost> = { [field]: value }

    // Auto-generate slug from title
    if (field === 'title') {
      updateData.slug = slugify(value)
    }

    updatePost({ id: post.id, payload: updateData as any })
      .then(() => {
        setPost({ ...post, ...updateData })
        toast({ message: 'Saved!', type: 'default' })
      })
      .catch(() => {
        toast({ message: translate('common.error'), type: 'error' })
      })
      .finally(() => {
        setEditingField(null)
      })
  }

  const handleThumbnailSave = () => {
    if (!post) return

    updatePost({ id: post.id, payload: { thumbnail } as any })
      .then(() => {
        setPost({ ...post, thumbnail })
        toast({ message: 'Saved!', type: 'default' })
      })
      .catch(() => {
        toast({ message: translate('common.error'), type: 'error' })
      })
      .finally(() => {
        setIsThumbnailEditing(false)
      })
  }

  const handleContentSave = () => {
    if (!post) return

    updatePost({ id: post.id, payload: { content } as any })
      .then(() => {
        setPost({ ...post, content })
        toast({ message: 'Saved!', type: 'default' })
      })
      .catch(() => {
        toast({ message: translate('common.error'), type: 'error' })
      })
      .finally(() => {
        setIsContentEditing(false)
      })
  }

  const handlePublishToggle = () => {
    if (!post) return

    const newStatus = !post.isPublished
    updatePost({ id: post.id, payload: { isPublished: newStatus } as any })
      .then(() => {
        setPost({ ...post, isPublished: newStatus })
        toast({ message: newStatus ? 'Published!' : 'Unpublished!', type: 'default' })
      })
      .catch(() => {
        toast({ message: translate('common.error'), type: 'error' })
      })
  }

  const handleSaveAll = () => {
    if (!post) return

    const payload: any = {
      title: post.title,
      slug: post.slug,
      thumbnail,
      excerpt: post.excerpt,
      content,
      category: post.category,
      isPublished: post.isPublished,
    }

    updatePost({ id: post.id, payload })
      .then(() => {
        toast({ message: 'All changes saved!', type: 'default' })
      })
      .catch(() => {
        toast({ message: translate('common.error'), type: 'error' })
      })
  }

  const handleCancel = () => {
    router.push('/admin/blog')
  }

  if (isLoading) {
    return (
      <div className='py-12 px-4'>
        <MyLoading />
      </div>
    )
  }

  if (!post) {
    return (
      <div className='py-12 px-4'>
        <div className='max-w-3xl mx-auto text-center'>
          <h1 className='text-2xl font-bold text-text mb-4'>{translate('blog.notFound', {}, 'Bài viết không tồn tại')}</h1>
          <MyButton variant='outline' onClick={() => router.push('/admin/blog')}>
            ← {translate('common.back')}
          </MyButton>
        </div>
      </div>
    )
  }

  const readTime = Math.ceil(post.content.replace(/<[^>]*>/g, '').length / 200 / 60) || 1

  return (
    <div className='py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header with back button and actions */}
        <div className='flex items-center justify-between mb-6'>
          <MyButton variant='outline' onClick={handleCancel} className='flex items-center gap-2'>
            <ArrowLeftIcon className='h-4 w-4' />
            {translate('common.back')}
          </MyButton>
          <div className='flex items-center gap-3'>
            <MyButton
              variant={post.isPublished ? 'outline' : 'primary'}
              onClick={handlePublishToggle}
              disabled={isUpdating}
            >
              {post.isPublished ? translate('admin.blog.unpublish', {}, 'Unpublish') : translate('admin.blog.publish', {}, 'Publish')}
            </MyButton>
            <MyButton variant='primary' onClick={handleSaveAll} disabled={isUpdating}>
              {isUpdating ? translate('common.saving', {}, 'Saving...') : translate('common.saveAll', {}, 'Save All')}
            </MyButton>
          </div>
        </div>

        <MyCard>
          <MyCardBody className='space-y-6'>
            {/* Metadata Row */}
            <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500 py-2 border-b border-border'>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{translate('common.id')}:</span>
                <span>{post.id}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{translate('common.created')}:</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{translate('common.updated')}:</span>
                <span>{formatDate(post.updatedAt)}</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='font-medium'>{translate('common.author')}:</span>
                <span>{post.author || 'Admin'}</span>
              </div>
            </div>

            {/* Category */}
            <div className='flex items-center gap-2'>
              <span className='font-medium text-text'>{translate('blog.category')}:</span>
              <EditableSelect
                value={post.category}
                onSave={(value) => handleFieldSave('category', value)}
                onCancel={handleFieldCancel}
                isEditing={editingField === 'category'}
                onStartEdit={() => handleFieldStartEdit('category')}
                options={categories}
              />
            </div>

            {/* Title */}
            <div className='pt-4 border-t border-border'>
              <EditableField
                value={post.title}
                onSave={(value) => handleFieldSave('title', value)}
                onCancel={handleFieldCancel}
                isEditing={editingField === 'title'}
                onStartEdit={() => handleFieldStartEdit('title')}
                placeholder={translate('blog.title')}
                className='block'
                inputClassName='text-3xl font-bold text-text w-full p-0 border-0 border-b-2 border-primary focus:ring-0'
              />
            </div>

            {/* Thumbnail */}
            {isThumbnailEditing ? (
              <div className='space-y-4 pt-4 border-t border-border'>
                <MyInput
                  label={translate('blog.thumbnail', {}, 'Thumbnail URL')}
                  placeholder='https://example.com/image.jpg'
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className='w-full'
                />
                {thumbnail && (
                  <div className='relative aspect-video rounded-2xl overflow-hidden'>
                    <img src={thumbnail} alt='Preview' className='w-full h-full object-cover' />
                  </div>
                )}
                <div className='flex gap-2'>
                  <MyButton variant='outline' onClick={() => setIsThumbnailEditing(false)}>
                    <XIcon className='h-4 w-4' />
                  </MyButton>
                  <MyButton variant='primary' onClick={handleThumbnailSave} disabled={isUpdating}>
                    <CheckIcon className='h-4 w-4' />
                  </MyButton>
                </div>
              </div>
            ) : (
              post.thumbnail && (
                <div className='relative aspect-video rounded-2xl overflow-hidden cursor-pointer' onClick={() => setIsThumbnailEditing(true)}>
                  <img src={post.thumbnail} alt={post.title} className='w-full h-full object-cover' />
                  <div className='absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all'>
                    <span className='text-white font-medium'>{translate('common.edit')}</span>
                  </div>
                </div>
              )
            )}

            {/* Excerpt */}
            <div className='pt-4 border-t border-border'>
              <span className='font-medium text-text mb-2 block'>{translate('blog.excerpt', {}, 'Excerpt')}</span>
              <EditableField
                value={post.excerpt}
                onSave={(value) => handleFieldSave('excerpt', value)}
                onCancel={handleFieldCancel}
                isEditing={editingField === 'excerpt'}
                onStartEdit={() => handleFieldStartEdit('excerpt')}
                placeholder={translate('blog.excerpt', {}, 'Mô tả ngắn cho bài viết...')}
                multiline
                className='block w-full'
                inputClassName='w-full'
              />
            </div>

            {/* Read time */}
            <div className='flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-border'>
              <span className='font-medium'>{translate('blog.readTime', { minutes: readTime })}</span>
            </div>

            {/* Content */}
            <div className='pt-4 border-t border-border'>
              <div className='flex items-center justify-between mb-4'>
                <span className='font-medium text-text'>{translate('blog.content', {}, 'Nội dung')}</span>
                {!isContentEditing && (
                  <MyButton variant='ghost' size='sm' onClick={() => setIsContentEditing(true)}>
                    {translate('common.edit')}
                  </MyButton>
                )}
              </div>

              {isContentEditing ? (
                <div className='space-y-4'>
                  <TiptapEditor
                    value={content}
                    onChange={setContent}
                    placeholder={translate('blog.editor.placeholder', {}, 'Viết nội dung bài viết...')}
                    className='min-h-[400px]'
                  />
                  <div className='flex justify-end gap-2'>
                    <MyButton variant='outline' onClick={() => setIsContentEditing(false)}>
                      <XIcon className='h-4 w-4' /> {translate('common.cancel')}
                    </MyButton>
                    <MyButton variant='primary' onClick={handleContentSave} disabled={isUpdating}>
                      <CheckIcon className='h-4 w-4' /> {translate('common.save')}
                    </MyButton>
                  </div>
                </div>
              ) : (
                <div
                  className='prose prose-lg max-w-none text-text cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors'
                  onClick={() => setIsContentEditing(true)}
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              )}
            </div>

            {/* Slug */}
            <div className='pt-4 border-t border-border'>
              <div className='flex items-center gap-2'>
                <span className='font-medium text-text'>{translate('blog.slug', {}, 'Slug')}:</span>
                <EditableField
                  value={post.slug}
                  onSave={(value) => handleFieldSave('slug', value)}
                  onCancel={handleFieldCancel}
                  isEditing={editingField === 'slug'}
                  onStartEdit={() => handleFieldStartEdit('slug')}
                  placeholder='url-friendly-slug'
                  className='font-mono'
                />
              </div>
            </div>

            {/* Published Status */}
            <div className='pt-4 border-t border-border'>
              <div className='flex items-center gap-2'>
                <span className='font-medium text-text'>{translate('common.status')}:</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {post.isPublished ? translate('admin.blog.published', {}, 'Đã xuất bản') : translate('admin.blog.draft', {}, 'Nháp')}
                </span>
              </div>
            </div>
          </MyCardBody>
        </MyCard>

        {/* Preview Button */}
        <div className='mt-6 flex justify-center'>
          <MyButton
            variant='outline'
            onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
          >
            {translate('common.preview', {}, 'Preview')}
          </MyButton>
        </div>
      </div>
    </div>
  )
}

export default AdminBlogEditPage
