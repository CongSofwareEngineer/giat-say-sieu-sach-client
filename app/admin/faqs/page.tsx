'use client'

import { useMemo, useState } from 'react'

import MyButton from '@/components/MyButton'
import MyBadge from '@/components/MyBadge'
import MyCard, { MyCardBody } from '@/components/MyCard'
import MyTable, { MyTableColumn } from '@/components/MyTable'
import MyInput from '@/components/MyInput'
import AdminDeleteConfirm from '@/components/admin/AdminDeleteConfirm'
import FaqForm from '@/components/FaqForm'
import { PAGE_SIZE } from '@/constants/app'
import useAdminFaqs from '@/hooks/admin/useAdminFaqs'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { FaqItem } from '@/services/faq'
import { getFaqCategoryLabel } from '@/utils/functions'

const AdminFaqsPage = () => {
  const { translate } = useLanguage()
  const { open } = useModalDrawer()
  const { faqs, isLoading, deleteFaq, isDeleting } = useAdminFaqs()
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredFaqs = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return faqs.filter((faq) => faq.question.toLowerCase().includes(keyword) || faq.answer.toLowerCase().includes(keyword))
  }, [faqs, search])

  const totalPages = Math.max(1, Math.ceil(filteredFaqs.length / PAGE_SIZE))
  const paginatedFaqs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE

    return filteredFaqs.slice(start, start + PAGE_SIZE)
  }, [filteredFaqs, currentPage])

  const openForm = (faq?: FaqItem) => {
    open({
      mode: 'modal',
      title: translate(faq ? 'admin.faqs.edit' : 'admin.faqs.create'),
      classNames: { container: 'md:w-[640px]' },
      children: <FaqForm faq={faq} />,
    })
  }

  const confirmDelete = (faq: FaqItem) => {
    open({
      mode: 'modal',
      title: translate('admin.faqs.delete'),
      children: <AdminDeleteConfirm itemName={faq.question} onConfirm={() => deleteFaq(faq.id)} isDeleting={isDeleting} />,
    })
  }

  const columns: MyTableColumn<FaqItem>[] = [
    {
      key: 'question',
      title: translate('admin.faqs.question'),
      render: (faq) => (
        <div className='min-w-0 max-w-md'>
          <p className='font-medium text-text'>{faq.question}</p>
          <p className='mt-0.5 line-clamp-2 text-xs text-gray-500'>{faq.answer}</p>
        </div>
      ),
    },
    {
      key: 'category',
      title: translate('admin.faqs.category'),
      render: (faq) => getFaqCategoryLabel(faq.category, translate) || '—',
    },
    {
      key: 'status',
      title: translate('common.status'),
      align: 'center',
      render: (faq) => (
        <MyBadge variant={faq.isActive ? 'success' : 'default'}>{translate(faq.isActive ? 'admin.faqs.active' : 'admin.faqs.hidden')}</MyBadge>
      ),
    },
    {
      key: 'actions',
      title: translate('common.actions'),
      align: 'center',
      render: (faq) => (
        <div className='flex items-center justify-center gap-2'>
          <button type='button' onClick={() => openForm(faq)} className='px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded-lg'>
            {translate('common.edit')}
          </button>
          <button type='button' onClick={() => confirmDelete(faq)} className='px-3 py-1 text-xs text-red-600 border border-red-600 rounded-lg'>
            {translate('common.delete')}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h1 className='text-2xl font-bold text-text'>{translate('admin.faqs.title')}</h1>
        <MyButton variant='primary' onClick={() => openForm()}>
          {translate('admin.faqs.create')}
        </MyButton>
      </div>

      <MyCard>
        <MyCardBody>
          <MyInput
            placeholder={translate('common.search')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className='max-w-md'
          />
        </MyCardBody>
      </MyCard>

      <MyCard>
        <MyCardBody>
          <MyTable
            columns={columns}
            data={paginatedFaqs}
            rowKey={(faq) => faq.id}
            loading={isLoading}
            emptyMessage={translate('common.noData')}
            pagination={{
              currentPage,
              totalPages,
              onPageChange: setCurrentPage,
            }}
          />
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminFaqsPage
