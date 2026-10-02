import type { Metadata } from 'next'

import { notFound } from 'next/navigation'

import BlogContent from '@/components/Blog/BlogContent'
import BlogDetail from '@/components/Blog/BlogDetail'
import BlogService from '@/services/blogClient'
import { HttpError } from '@/config/baseApi'
import { buildMetadata } from '@/config/seo'
import { HTTP_STATUS } from '@/constants/app'

type Props = {
  params: Promise<{ slug: string }>
}

// Fetch a post on the server (fetch is memoized between metadata and page).
// Only a 404 from the API becomes a not-found page; other errors throw so a
// temporary API outage is not reported to search engines as a missing page.
const getPost = async (slug: string) => {
  try {
    const post = await BlogService.getPostBySlug(slug)

    if (!post) notFound()

    return post
  } catch (error) {
    if (error instanceof HttpError && error.status === HTTP_STATUS.NOT_FOUND) notFound()

    throw error
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    keywords: [post.category, post.title],
    type: 'article',
    publishedTime: post.publishedAt || post.createdAt,
    modifiedTime: post.updatedAt,
    ...(post.author && { authors: [post.author] }),
    image: post.thumbnail?.url,
  })
}

const BlogDetailPage = async ({ params }: Props) => {
  const { slug } = await params
  const post = await getPost(slug)

  return (
    <BlogDetail post={post}>
      <BlogContent content={post.content} />
    </BlogDetail>
  )
}

export default BlogDetailPage
