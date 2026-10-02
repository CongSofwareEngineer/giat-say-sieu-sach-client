import BlogList, { type BlogListItem } from './components/BlogList'

import SeoJsonLd from '@/components/SeoJsonLd'
import BlogService from '@/services/blogClient'
import { blogSchema, breadcrumbSchema } from '@/config/seo'
import { getBlogReadTime } from '@/utils/blogContent'
import { IS_BUILD_PHASE } from '@/constants/app'

// Regenerate the cached page at most once per minute so new posts show up
export const revalidate = 60

const BlogPage = async () => {
  // Don't fail the build when the API is down; ISR refetches after `revalidate`.
  // At runtime the error is rethrown so the last good cached page is kept.
  const posts = await BlogService.getPosts().catch((error) => {
    if (IS_BUILD_PHASE) return []

    throw error
  })

  // Compute read time on the server and drop content to keep the client payload small
  const items: BlogListItem[] = posts.map(({ content, ...post }) => ({ ...post, readTime: getBlogReadTime(content) }))

  return (
    <div className='py-16 lg:py-24'>
      <SeoJsonLd data={blogSchema(posts)} />
      <SeoJsonLd
        data={breadcrumbSchema([
          { name: 'Trang chủ', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />
      <BlogList posts={items} />
    </div>
  )
}

export default BlogPage
