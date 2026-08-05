'use client'

import { useState } from 'react'
import Link from 'next/link'

import MyCard, { MyCardBody } from '@/components/MyCard'
import MyEmpty from '@/components/MyEmpty'
import MyImage from '@/components/MyImage'
import SeoJsonLd from '@/components/SeoJsonLd'
import useLanguage from '@/hooks/useLanguage'
import { blogSchema, breadcrumbSchema } from '@/config/seo'
import { cn } from '@/utils/tailwind'

type Post = {
  category: string
  minutes: number
  title: string
  excerpt: string
  slug: string
}

const categoryPalette = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
]

const BlogPage = () => {
  const { translate } = useLanguage()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = (translate('blog.categories') || []) as string[]
  const posts = (translate('blog.posts') || []) as Post[]

  const filteredPosts = activeCategory ? posts.filter((post) => post.category === activeCategory) : posts

  const categoryColor = (category: string) => {
    const index = categories.indexOf(category)

    return categoryPalette[Math.max(index, 0) % categoryPalette.length]
  }

  return (
    <div className='py-16 lg:py-24'>
      <SeoJsonLd data={blogSchema()} />
      <SeoJsonLd
        data={breadcrumbSchema([
          { name: 'Trang chủ', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        {/* Page header */}
        <div className='mx-auto mb-10 max-w-2xl text-center'>
          <h1 className='text-3xl font-extrabold leading-tight text-text lg:text-4xl'>{translate('blog.title')}</h1>
          <p className='mt-3 text-base leading-relaxed text-gray-500 lg:text-lg'>{translate('blog.subtitle')}</p>
        </div>

        {/* Category filter */}
        <div className='mb-12 flex flex-wrap items-center justify-center gap-3'>
          <button
            type='button'
            onClick={() => setActiveCategory(null)}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-semibold transition-colors',
              activeCategory === null ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md' : 'bg-white text-text hover:bg-primary/10'
            )}
          >
            {translate('blog.all')}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type='button'
              onClick={() => setActiveCategory(activeCategory === category ? null : category)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-semibold transition-colors',
                activeCategory === category
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                  : 'bg-white text-text hover:bg-primary/10'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Posts */}
        {filteredPosts.length === 0 ? (
          <MyEmpty message={translate('blog.noPosts')} />
        ) : (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {filteredPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className='group block h-full'>
                <MyCard className='flex h-full flex-col overflow-hidden transition-transform duration-300 group-hover:-translate-y-1'>
                  <div className='relative aspect-video flex-shrink-0 overflow-hidden'>
                    <MyImage
                      src='/thumbnail.png'
                      alt={post.title}
                      fill
                      sizes='(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
                      className='object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  </div>
                  <MyCardBody className='flex flex-1 flex-col p-5 lg:p-6'>
                    <div className='flex items-center gap-3'>
                      <span className={cn('rounded-full px-3 py-1 text-xs font-bold', categoryColor(post.category))}>{post.category}</span>
                      <span className='text-xs text-gray-500'>{translate('blog.readTime', { minutes: post.minutes })}</span>
                    </div>
                    <h2 className='mt-4 line-clamp-2 text-lg font-bold leading-snug text-text transition-colors group-hover:text-primary'>
                      {post.title}
                    </h2>
                    <p className='mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-500'>{post.excerpt}</p>
                    <span className='mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary'>
                      {translate('blog.readMore')}
                      <span aria-hidden='true'>→</span>
                    </span>
                  </MyCardBody>
                </MyCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogPage
