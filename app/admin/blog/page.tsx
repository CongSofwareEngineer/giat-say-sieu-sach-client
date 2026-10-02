'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody } from '@/components/MyCard'
import MyTable, { MyTableColumn } from '@/components/MyTable'
import MyInput from '@/components/MyInput'
import MySelect from '@/components/MySelect'
import AdminDeleteConfirm from '@/components/admin/AdminDeleteConfirm'
import { BlogPost } from '@/services/blog'
import useAdminBlog from '@/hooks/admin/useAdminBlog'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { EyeIcon } from '@/components/Icons/Eye'
import { EditIcon } from '@/components/Icons/Functions/Edit'
import { TrashIcon } from '@/components/Icons/Trash'

const AdminBlogPage = () => {
  const { translate } = useLanguage()
  const router = useRouter()
  const { open } = useModalDrawer()
  const { posts, isLoading, deletePost, isDeleting } = useAdminBlog()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const categories = [
    { value: 'Mẹo hay', label: 'Mẹo hay' },
    { value: 'Kiến thức', label: 'Kiến thức' },
    { value: 'Bảo quản', label: 'Bảo quản' },
    { value: 'Môi trường', label: 'Môi trường' },
  ]

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
    // Navigate directly to the create page instead of opening a modal
    router.push('/admin/blog/new')
  }

  const openEdit = (post: BlogPost) => {
    // Navigate directly to the edit page instead of opening a modal
    router.push(`/admin/blog/${post.id}`)
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

  const columns: MyTableColumn<BlogPost>[] = [
    {
      key: 'title',
      title: translate('blog.title'),
      className: 'font-medium max-w-xs truncate',
      render: (post) => post.title,
    },
    {
      key: 'category',
      title: translate('blog.category'),
      align: 'center',
      render: (post) => (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700'>{post.category}</span>
      ),
    },
    {
      key: 'status',
      title: translate('common.status'),
      align: 'center',
      render: (post) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            post.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {post.isPublished ? translate('admin.blog.published', {}, 'Đã xuất bản') : translate('admin.blog.draft', {}, 'Nháp')}
        </span>
      ),
    },
    {
      key: 'date',
      title: translate('common.date'),
      align: 'center',
      className: 'text-gray-500',
      render: (post) => new Date(post.createdAt).toLocaleDateString('vi-VN'),
    },
    {
      key: 'actions',
      title: translate('common.actions'),
      align: 'center',
      render: (post) => (
        <div className='flex items-center justify-center gap-2'>
          <button
            type='button'
            onClick={() => openView(post)}
            className='px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded-lg'
            title={translate('common.view')}
          >
            <EyeIcon className='h-3.5 w-3.5' />
          </button>
          <button type='button' onClick={() => openEdit(post)} className='px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded-lg'>
            <EditIcon className='h-3.5 w-3.5' />
          </button>
          <button type='button' onClick={() => confirmDelete(post)} className='px-3 py-1 text-xs text-red-600 border border-red-600 rounded-lg'>
            <TrashIcon className='h-3.5 w-3.5' />
          </button>
        </div>
      ),
    },
  ]

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
              data={categories}
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

          <MyTable
            columns={columns}
            data={paginatedPosts}
            rowKey={(post) => post.id}
            loading={isLoading}
            emptyMessage={translate('common.noData')}
            pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
          />
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminBlogPage
