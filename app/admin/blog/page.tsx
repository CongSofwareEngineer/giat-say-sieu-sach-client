'use client'

import { useMemo, useState } from 'react'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import MyLoading from '@/components/MyLoading'
import MyEmpty from '@/components/MyEmpty'
import MyPagination from '@/components/MyPagination'
import MyInput from '@/components/MyInput'
import MySelect from '@/components/MySelect'
import AdminDeleteConfirm from '@/components/admin/AdminDeleteConfirm'
import BlogForm from '@/components/Blog/BlogForm'
import { BlogPost } from '@/services/blog'
import useAdminBlog from '@/hooks/admin/useAdminBlog'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { EyeIcon } from '@/components/Icons/Eye'
import { EditIcon } from '@/components/Icons/Functions/Edit'
import { TrashIcon } from '@/components/Icons/Trash'

const AdminBlogPage = () => {
  const { translate } = useLanguage()
  const { open } = useModalDrawer()
  const { posts, isLoading, deletePost, isDeleting } = useAdminBlog()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const categories = ['Mẹo hay', 'Kiến thức', 'Bảo quản', 'Môi trường']

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (search && !post.title.toLowerCase().includes(search.toLowerCase())) return false
      if (categoryFilter && post.category !== categoryFilter) return false
      if (statusFilter && ((statusFilter === 'published' && !post.isPublished) || (statusFilter === 'draft' && post.isPublished))) return false
      return true
    })
  }, [posts, search, categoryFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize))
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPosts.slice(start, start + pageSize)
  }, [filteredPosts, currentPage])

  const openCreate = () => {
    open({
      mode: 'modal',
      title: translate('admin.blog.create'),
      classNames: { container: 'max-w-4xl' },
      children: <BlogForm />,
    })
  }

  const openEdit = (post: BlogPost) => {
    open({
      mode: 'modal',
      title: translate('admin.blog.edit'),
      classNames: { container: 'max-w-4xl' },
      children: <BlogForm post={post} />,
    })
  }

  const confirmDelete = (post: BlogPost) => {
    open({
      mode: 'modal',
      title: translate('admin.blog.delete'),
      children: <AdminDeleteConfirm itemName={post.title} onConfirm={() => deletePost(post.id)} isDeleting={isDeleting} />,
    })
  }

  const openView = (post: BlogPost) => {
    window.open(`/blog/${post.slug}`, '_blank')
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-text'>{translate('admin.blog.title')}</h1>
        <MyButton variant='primary' onClick={openCreate}>
          {translate('admin.blog.create')}
        </MyButton>
      </div>

      <MyCard>
        <MyCardBody>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-4 mb-4'>
            <MyInput
              placeholder={translate('common.search')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
            />
            <MySelect
              data={categories.map((c) => ({ value: c, label: c }))}
              value={categoryFilter}
              onChange={(item) => {
                setCategoryFilter(String(item.value ?? ''))
                setCurrentPage(1)
              }}
              placeholder={translate('common.all')}
            />
            <MySelect
              data={[
                { value: '', label: translate('common.all') },
                { value: 'published', label: translate('admin.blog.published', {}, 'Đã xuất bản') },
                { value: 'draft', label: translate('admin.blog.draft', {}, 'Nháp') },
              ]}
              value={statusFilter}
              onChange={(item) => {
                setStatusFilter(String(item.value ?? ''))
                setCurrentPage(1)
              }}
              placeholder={translate('common.all')}
            />
          </div>

          {isLoading ? (
            <MyLoading />
          ) : paginatedPosts.length === 0 ? (
            <MyEmpty message={translate('common.noData')} />
          ) : (
            <>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-border'>
                      <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('blog.title')}</th>
                      <th className='text-center py-3 px-4 font-medium text-gray-500'>{translate('blog.category')}</th>
                      <th className='text-center py-3 px-4 font-medium text-gray-500'>{translate('common.status')}</th>
                      <th className='text-center py-3 px-4 font-medium text-gray-500'>{translate('common.date')}</th>
                      <th className='text-center py-3 px-4 font-medium text-gray-500'>{translate('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPosts.map((post) => (
                      <tr key={post.id} className='border-b border-border'>
                        <td className='py-3 px-4 font-medium max-w-xs truncate'>{post.title}</td>
                        <td className='py-3 px-4 text-center'>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700'>
                            {post.category}
                          </span>
                        </td>
                        <td className='py-3 px-4 text-center'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              post.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {post.isPublished ? translate('admin.blog.published', {}, 'Đã xuất bản') : translate('admin.blog.draft', {}, 'Nháp')}
                          </span>
                        </td>
                        <td className='py-3 px-4 text-center text-gray-500'>
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className='py-3 px-4'>
                          <div className='flex items-center justify-center gap-2'>
                            <button
                              type='button'
                              onClick={() => openView(post)}
                              className='px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded-lg'
                              title={translate('common.view')}
                            >
                              <EyeIcon className='h-3.5 w-3.5' />
                            </button>
                            <button
                              type='button'
                              onClick={() => openEdit(post)}
                              className='px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded-lg'
                            >
                              <EditIcon className='h-3.5 w-3.5' />
                            </button>
                            <button
                              type='button'
                              onClick={() => confirmDelete(post)}
                              className='px-3 py-1 text-xs text-red-600 border border-red-600 rounded-lg'
                            >
                              <TrashIcon className='h-3.5 w-3.5' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className='mt-4 flex justify-center'>
                  <MyPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          )}
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminBlogPage