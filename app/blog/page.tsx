'use client'

import Link from 'next/link'

import MyCard, { MyCardBody } from '@/components/MyCard'
import MyPagination from '@/components/MyPagination'
import MyEmpty from '@/components/MyEmpty'
import useLanguage from '@/hooks/useLanguage'

// Mock data
const mockPosts = [
  {
    id: 1,
    title: 'Cách giặt đồ trắng đúng cách',
    slug: 'cach-giat-do-trang-dung-cach',
    thumbnail: '/thumbnail.png',
    excerpt: 'Hướng dẫn chi tiết cách giặt đồ trắng để giữ được màu sắc và chất liệu vải.',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    title: 'Mẹo ủi đồ phẳng lì',
    slug: 'meo-ui-do-phang-li',
    thumbnail: '/thumbnail.png',
    excerpt: 'Những mẹo nhỏ giúp bạn ủi đồ phẳng lì như thợ chuyên nghiệp.',
    createdAt: '2024-01-12',
  },
  {
    id: 3,
    title: 'Lựa chọn hóa chất giặt ủi an toàn',
    slug: 'lua-chon-hoa-chat-giat-ui-an-toan',
    thumbnail: '/thumbnail.png',
    excerpt: 'Tìm hiểu về các loại hóa chất giặt ủi an toàn cho sức khỏe và môi trường.',
    createdAt: '2024-01-10',
  },
  {
    id: 4,
    title: 'Cách xử lý vết bẩn cứng đầu',
    slug: 'cach-xu-ly-vet-ban-cung-dau',
    thumbnail: '/thumbnail.png',
    excerpt: 'Hướng dẫn xử lý các loại vết bẩn cứng đầu trên quần áo.',
    createdAt: '2024-01-08',
  },
  {
    id: 5,
    title: 'Bí quyết giữ quần áo mới lâu',
    slug: 'bi-quyet-giu-quan-ao-moi-lau',
    thumbnail: '/thumbnail.png',
    excerpt: 'Mẹo nhỏ giúp quần áo luôn mới và bền màu sau thời gian dài sử dụng.',
    createdAt: '2024-01-05',
  },
  {
    id: 6,
    title: 'Xu hướng giặt ủi thông minh 2024',
    slug: 'xu-huong-giat-ui-thong-minh-2024',
    thumbnail: '/thumbnail.png',
    excerpt: 'Công nghệ mới trong ngành giặt ủi giúp tiết kiệm thời gian và chi phí.',
    createdAt: '2024-01-03',
  },
]

const BlogPage = () => {
  const { translate } = useLanguage()

  if (mockPosts.length === 0) {
    return (
      <div className='py-12 px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-text mb-2'>{translate('blog.title')}</h1>
            <p className='text-gray-600'>{translate('blog.subtitle')}</p>
          </div>
          <MyEmpty message={translate('blog.noPosts')} />
        </div>
      </div>
    )
  }

  return (
    <div className='py-12 px-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-text mb-2'>{translate('blog.title')}</h1>
          <p className='text-gray-600'>{translate('blog.subtitle')}</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {mockPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <MyCard className='h-full'>
                <div className='relative aspect-video'>
                  <img src={post.thumbnail} alt={post.title} className='w-full h-full object-cover rounded-t-2xl' />
                </div>
                <MyCardBody>
                  <p className='text-sm text-gray-500 mb-2'>{post.createdAt}</p>
                  <h2 className='text-lg font-semibold text-text mb-2 line-clamp-2'>{post.title}</h2>
                  <p className='text-gray-600 text-sm line-clamp-2'>{post.excerpt}</p>
                  <span className='inline-block mt-4 text-primary text-sm font-medium'>{translate('blog.readMore')} →</span>
                </MyCardBody>
              </MyCard>
            </Link>
          ))}
        </div>

        <MyPagination currentPage={1} totalPages={3} onPageChange={() => {}} className='mt-8' />
      </div>
    </div>
  )
}

export default BlogPage
