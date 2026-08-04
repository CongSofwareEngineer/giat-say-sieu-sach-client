'use client'

import { useState } from 'react'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MyPagination from '@/components/MyPagination'
import { mockBlogPosts } from '@/services/mockData'
import useLanguage from '@/hooks/useLanguage'

const AdminBlogPage = () => {
  const { translate } = useLanguage()
  const [search, setSearch] = useState('')

  const filteredPosts = mockBlogPosts.filter((post) => post.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-text'>{translate('admin.blog.title')}</h1>
        <MyButton variant='primary'>{translate('admin.blog.create')}</MyButton>
      </div>

      {/* Filters */}
      <MyCard>
        <MyCardBody>
          <MyInput placeholder={translate('common.search')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </MyCardBody>
      </MyCard>

      {/* Blog Table */}
      <MyCard>
        <MyCardBody>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-border'>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>Tiêu đề</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>Slug</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>Mô tả</th>
                  <th className='text-left py-3 px-4 font-medium text-gray-500'>Ngày tạo</th>
                  <th className='text-center py-3 px-4 font-medium text-gray-500'>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className='border-b border-border'>
                    <td className='py-3 px-4 font-medium max-w-[200px] truncate'>{post.title}</td>
                    <td className='py-3 px-4 text-gray-500'>{post.slug}</td>
                    <td className='py-3 px-4 max-w-[200px] truncate'>{post.excerpt}</td>
                    <td className='py-3 px-4'>{post.createdAt}</td>
                    <td className='py-3 px-4'>
                      <div className='flex items-center justify-center gap-2'>
                        <button className='px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded-lg'>{translate('common.edit')}</button>
                        <button className='px-3 py-1 text-xs text-red-600 border border-red-600 rounded-lg'>{translate('common.delete')}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='mt-4'>
            <MyPagination currentPage={1} totalPages={1} onPageChange={() => {}} />
          </div>
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminBlogPage
