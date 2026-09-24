'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'

import SeoJsonLd from '@/components/SeoJsonLd'
import { EditIcon } from '@/components/Icons/Functions/Edit'
import useLanguage from '@/hooks/useLanguage'
import useUser from '@/hooks/useUser'
import { useBlogPost } from '@/hooks/reactQuery/useBlog'
import { articleSchema, breadcrumbSchema } from '@/config/seo'
import { formatDate } from '@/utils/date'

const BlogDetailPage = () => {
  const params = useParams()
  const slug = params.slug as string
  const { translate } = useLanguage()
  const { user, hasHydrated } = useUser()
  const isAdmin = hasHydrated && user?.isAdmin

  const { data: post, isLoading, error } = useBlogPost(slug)

  if (isLoading) {
    return (
      <div className='py-12 px-4'>
        <div className='max-w-3xl mx-auto animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-3/4 mb-4' />
          <div className='h-4 bg-gray-200 rounded w-1/2 mb-8' />
          <div className='aspect-video bg-gray-200 rounded-2xl mb-8' />
          <div className='space-y-4'>
            <div className='h-4 bg-gray-200 rounded' />
            <div className='h-4 bg-gray-200 rounded' />
            <div className='h-4 bg-gray-200 rounded' />
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className='py-12 px-4'>
        <div className='max-w-3xl mx-auto text-center'>
          <h1 className='text-2xl font-bold text-text mb-4'>{translate('blog.notFound', {}, 'Bài viết không tồn tại')}</h1>
          <Link href='/blog' className='text-primary hover:underline'>
            ← {translate('blog.backToList')}
          </Link>
        </div>
      </div>
    )
  }

  const readTime = Math.ceil(post.content.replace(/<[^>]*>/g, '').length / 200 / 60) || 1

  return (
    <div className='py-12 px-4'>
      <SeoJsonLd
        data={articleSchema({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          publishedTime: post.publishedAt || post.createdAt,
        })}
      />
      <SeoJsonLd
        data={breadcrumbSchema([
          { name: 'Trang chủ', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <div className='max-w-3xl mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <Link href='/blog' className='inline-flex items-center text-primary'>
            ← {translate('blog.backToList')}
          </Link>
          {isAdmin && (
            <Link
              href={`/admin/blog/edit/${post.id}`}
              className='inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors'
            >
              <EditIcon className='h-4 w-4' />
              {translate('common.edit')}
            </Link>
          )}
        </div>

        <article>
          <div className='mb-4'>
            <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700'>{post.category}</span>
            <span className='ml-2 text-sm text-gray-500'>{translate('blog.readTime', { minutes: readTime })}</span>
          </div>

          <h1 className='text-3xl font-bold text-text mb-4'>{post.title}</h1>
          <div className='flex items-center gap-4 text-sm text-gray-500 mb-6'>
            <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            <span>•</span>
            <span>{post.author || 'Admin'}</span>
          </div>

          {post.thumbnail && (
            <div className='relative aspect-video mb-8 rounded-2xl overflow-hidden'>
              <img src={post.thumbnail} alt={post.title} className='w-full h-full object-cover' />
            </div>
          )}

          <div className='prose prose-lg max-w-none text-text' dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        <div className='mt-12 pt-8 border-t border-border'>
          <h2 className='text-xl font-bold text-text mb-4'>{translate('blog.share')}</h2>
          <div className='flex gap-3'>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.title, url: window.location.href })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  alert(translate('blog.copied', {}, 'Đã sao chép liên kết!'))
                }
              }}
              className='px-5 py-3 bg-blue-500 text-white rounded-lg transition-colors'
            >
              Facebook
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className='px-5 py-3 bg-green-500 text-white rounded-lg transition-colors'
            >
              Zalo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogDetailPage