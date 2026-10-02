'use client'

import type { ContactItem } from '@/services/contact'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MySelect from '@/components/MySelect'
import MyBadge from '@/components/MyBadge'
import MyTable, { MyTableColumn } from '@/components/MyTable'
import { TrashIcon } from '@/components/Icons/Trash'
import { ArrowDownIcon } from '@/components/Icons/ArrowDown'
import useAdminContacts from '@/hooks/admin/useAdminContacts'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'

const AdminContactPage = () => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const { contacts, meta, isLoading, updateContactStatus, deleteContact, isUpdatingStatus, isDeleting } = useAdminContacts()

  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const statusOptions = useMemo(
    () => [
      { value: '', label: translate('common.all') },
      { value: 'PENDING', label: translate('admin.contacts.statuses.PENDING', {}, 'Chờ xử lý') },
      { value: 'IN_PROGRESS', label: translate('admin.contacts.statuses.IN_PROGRESS', {}, 'Đang xử lý') },
      { value: 'RESOLVED', label: translate('admin.contacts.statuses.RESOLVED', {}, 'Đã giải quyết') },
      { value: 'CLOSED', label: translate('admin.contacts.statuses.CLOSED', {}, 'Đã đóng') },
    ],
    [translate]
  )

  const filteredContacts = useMemo(() => {
    const kw = keyword.trim().toLowerCase()

    return contacts.filter((contact: ContactItem) => {
      const matchStatus = statusFilter === '' || contact.status === statusFilter
      const matchKeyword =
        !kw || contact.name.toLowerCase().includes(kw) || contact.phone.replace(/\s/g, '').includes(kw) || contact.subject.toLowerCase().includes(kw)

      return matchStatus && matchKeyword
    })
  }, [contacts, keyword, statusFilter])

  const totalPages = meta?.totalPages || Math.max(1, Math.ceil(filteredContacts.length / pageSize))
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * pageSize

    return filteredContacts.slice(start, start + pageSize)
  }, [filteredContacts, currentPage])

  const confirmDelete = (contact: ContactItem) => {
    open({
      mode: 'modal',
      title: translate('admin.contacts.delete'),
      children: (
        <div className='w-full'>
          <p className='mb-6 text-sm text-gray-600'>{translate('admin.contacts.deleteConfirm')}</p>
          <div className='flex justify-end gap-3'>
            <MyButton variant='outline' onClick={() => close()}>
              {translate('common.cancel')}
            </MyButton>
            <MyButton
              variant='error'
              loading={isDeleting}
              onClick={async () => {
                await deleteContact(contact.id)
                close()
              }}
            >
              {translate('common.delete')}
            </MyButton>
          </div>
        </div>
      ),
    })
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning'
      case 'IN_PROGRESS':
        return 'info'
      case 'RESOLVED':
        return 'success'
      case 'CLOSED':
        return 'default'
      default:
        return 'default'
    }
  }

  const columns: MyTableColumn<ContactItem>[] = [
    {
      key: 'name',
      title: translate('common.name'),
      className: 'font-medium',
      render: (contact) => contact.name,
    },
    {
      key: 'phone',
      title: translate('common.phone'),
      render: (contact) => contact.phone,
    },
    {
      key: 'email',
      title: translate('common.email'),
      render: (contact) => contact.email || '—',
    },
    {
      key: 'subject',
      title: translate('common.title'),
      render: (contact) => <p className='max-w-[180px] truncate font-medium'>{contact.subject}</p>,
    },
    {
      key: 'message',
      title: translate('common.content'),
      render: (contact) => <p className='max-w-[220px] truncate text-gray-500'>{contact.message}</p>,
    },
    {
      key: 'status',
      title: translate('common.status'),
      align: 'center',
      render: (contact) => <MyBadge variant={getStatusVariant(contact.status)}>{contact.status}</MyBadge>,
    },
    {
      key: 'time',
      title: translate('common.time'),
      align: 'center',
      className: 'whitespace-nowrap text-gray-500',
      render: (contact) => dayjs(contact.createdAt).format('DD/MM/YYYY HH:mm'),
    },
    {
      key: 'actions',
      title: translate('common.actions'),
      align: 'center',
      render: (contact) => (
        <div className='flex items-center justify-center gap-2'>
          <div className='relative min-w-[120px]'>
            <select
              value={contact.status}
              onChange={(e) => updateContactStatus({ id: contact.id, status: e.target.value })}
              disabled={isUpdatingStatus}
              className='w-full cursor-pointer appearance-none rounded-full border border-border bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-text transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {statusOptions
                .filter((s) => s.value)
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
            <ArrowDownIcon className='pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-gray-400' strokeWidth={2} />
          </div>
          <button
            type='button'
            onClick={() => confirmDelete(contact)}
            className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600'
          >
            <TrashIcon className='h-5 w-5' />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-text'>{translate('admin.contacts.title')}</h1>
      </div>

      <MyCard>
        <MyCardHeader>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <h2 className='text-lg font-bold text-text'>{translate('admin.contacts.list')}</h2>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <MyInput
                placeholder={translate('common.search')}
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value)
                  setCurrentPage(1)
                }}
                className='sm:w-64'
              />
              <MySelect
                data={statusOptions.map((s) => ({ value: s.value, label: s.label }))}
                value={statusFilter}
                placeholder={translate('admin.contacts.filterByStatus')}
                search={false}
                onChange={(item) => {
                  setStatusFilter(item.value as string)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
        </MyCardHeader>
        <MyCardBody>
          <MyTable
            columns={columns}
            data={paginatedContacts}
            rowKey={(contact) => contact.id}
            loading={isLoading}
            emptyMessage={translate('common.noData')}
            pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
          />
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminContactPage
