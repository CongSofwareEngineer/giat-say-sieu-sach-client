import BlogContent from '@/components/Blog/BlogContent'
import BlogDetail from '@/components/Blog/BlogDetail'
import BlogService from '@/services/blogClient'

type Props = {
  params: Promise<{ slug: string }>
}

const BlogDetailPage = async ({ params }: Props) => {
  const { slug } = await params
  const post = await BlogService.getPostBySlug(slug).catch(() => null)

  return <BlogDetail post={post}>{post && <BlogContent content={post.content} />}</BlogDetail>
}

export default BlogDetailPage
