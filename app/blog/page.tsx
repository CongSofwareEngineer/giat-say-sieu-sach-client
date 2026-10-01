import BlogList, { type BlogListItem } from './components/BlogList'

import SeoJsonLd from '@/components/SeoJsonLd'
import BlogService from '@/services/blogClient'
import { blogSchema, breadcrumbSchema } from '@/config/seo'
import { getBlogReadTime } from '@/utils/blogContent'

// Regenerate the cached page at most once per minute so new posts show up
export const revalidate = 60

const BlogPage = async () => {
  const posts = await BlogService.getPosts()

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
