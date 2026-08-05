'use client'

import Link from 'next/link'

import MyCard, { MyCardBody } from '@/components/MyCard'
import SeoJsonLd from '@/components/SeoJsonLd'
import useLanguage from '@/hooks/useLanguage'
import { articleSchema, breadcrumbSchema } from '@/config/seo'

// Mock data
const mockPost = {
  id: 1,
  title: 'Cách giặt đồ trắng đúng cách',
  slug: 'cach-giat-do-trang-dung-cach',
  thumbnail: '/thumbnail.png',
  excerpt: 'Hướng dẫn chi tiết cách giặt đồ trắng đúng cách: phân loại vải, chọn nước giặt, nhiệt độ phù hợp và phơi đồ để luôn trắng sáng như mới.',
  content: `
    <p>Đồ trắng là items không thể thiếu trong tủ đồ của mỗi người. Tuy nhiên, việc giữ cho đồ trắng luôn sạch sẽ và mới mẻ không phải là điều dễ dàng. Dưới đây là hướng dẫn chi tiết cách giặt đồ trắng đúng cách.</p>
    
    <h2>1. Phân loại đồ trước khi giặt</h2>
    <p>Trước khi giặt, bạn cần phân loại đồ trắng theo chất liệu vải và mức độ bẩn. Điều này giúp bạn chọn_program appropriate wash cycle and detergent.</p>
    
    <h2>2. Sử dụng nước giặt phù hợp</h2>
    <p>Đối với đồ trắng, bạn nên sử dụng nước giặt có tính tẩy nhẹ để giữ cho đồ luôn trắng sáng. Tránh sử dụng nước giặt có màu vì có thể làm đồ bị ố vàng.</p>
    
    <h2>3. Nhiệt độ nước giặt</h2>
    <p>Nhiệt độ nước giặt cũng rất quan trọng. Đối với đồ trắng, bạn nên giặt ở nhiệt độ 40-60 độ C để loại bỏ vết bẩn hiệu quả.</p>
    
    <h2>4. Phơi đồ đúng cách</h2>
    <p>Sau khi giặt, bạn nên phơi đồ ở nơi có ánh sáng tự nhiên nhưng tránh ánh nắng trực tiếp quá lâu để đồ không bị khô cứng.</p>
  `,
  createdAt: '2024-01-15',
  author: 'Admin',
}

const BlogDetailPage = () => {
  const { translate } = useLanguage()

  return (
    <div className='py-12 px-4'>
      <SeoJsonLd
        data={articleSchema({
          slug: mockPost.slug,
          title: mockPost.title,
          excerpt: mockPost.excerpt,
          publishedTime: mockPost.createdAt,
        })}
      />
      <SeoJsonLd
        data={breadcrumbSchema([
          { name: 'Trang chủ', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: mockPost.title, path: `/blog/${mockPost.slug}` },
        ])}
      />
      <div className='max-w-3xl mx-auto'>
        <Link href='/blog' className='inline-flex items-center text-primary mb-6'>
          ← {translate('blog.backToList')}
        </Link>

        <article>
          <h1 className='text-3xl font-bold text-text mb-4'>{mockPost.title}</h1>
          <div className='flex items-center gap-4 text-sm text-gray-500 mb-6'>
            <span>{mockPost.createdAt}</span>
            <span>•</span>
            <span>{mockPost.author}</span>
          </div>

          <div className='relative aspect-video mb-8 rounded-2xl overflow-hidden'>
            <img src={mockPost.thumbnail} alt={mockPost.title} className='w-full h-full object-cover' />
          </div>

          <div className='prose prose-lg max-w-none text-text' dangerouslySetInnerHTML={{ __html: mockPost.content }} />
        </article>

        <div className='mt-12 pt-8 border-t border-border'>
          <h2 className='text-xl font-bold text-text mb-4'>{translate('blog.share')}</h2>
          <div className='flex gap-3'>
            <button className='px-5 py-3 bg-blue-500 text-white rounded-lg transition-colors'>Facebook</button>
            <button className='px-5 py-3 bg-green-500 text-white rounded-lg transition-colors'>Zalo</button>
          </div>
        </div>

        <div className='mt-12'>
          <h2 className='text-xl font-bold text-text mb-4'>{translate('blog.relatedPosts')}</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <MyCard>
              <MyCardBody>
                <h3 className='font-semibold text-text mb-2'>Mẹo ủi đồ phẳng lì</h3>
                <p className='text-sm text-gray-600'>Những mẹo nhỏ giúp bạn ủi đồ phẳng lì...</p>
              </MyCardBody>
            </MyCard>
            <MyCard>
              <MyCardBody>
                <h3 className='font-semibold text-text mb-2'>Lựa chọn hóa chất giặt ủi an toàn</h3>
                <p className='text-sm text-gray-600'>Tìm hiểu về các loại hóa chất giặt ủi...</p>
              </MyCardBody>
            </MyCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogDetailPage
