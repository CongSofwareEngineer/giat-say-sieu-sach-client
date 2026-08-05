import type { Metadata } from 'next'

import { BLOG_POSTS, buildMetadata } from '@/config/seo'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POSTS.find((item) => item.slug === slug)

  if (!post) {
    return { title: 'Bài viết' }
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    keywords: ['giặt ủi', post.category, post.title],
    type: 'article',
    publishedTime: post.publishedTime,
  })
}

export default function BlogDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
