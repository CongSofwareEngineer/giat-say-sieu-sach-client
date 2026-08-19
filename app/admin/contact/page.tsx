'use client'

import type { ContactItem } from '@/services/contact'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MySelect from '@/components/MySelect'
import MyLoading from '@/components/MyLoading'
import MyEmpty from '@/components/MyEmpty'
import MyBadge from '@/components/MyBadge'
import { TrashIcon } from '@/components/Icons/Trash'
import useGetListContact from '@/hooks/reactQuery/useGetListContact'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'PENDING', labelKey: 'admin.contacts.statuses.PENDING' },
  { value: 'IN_PROGRESS', labelKey: 'admin.contacts.statuses.IN_PROGRESS' },
  { value: 'RESOLVED', labelKey: 'admin.contacts.statuses.RESOLVED' },
  { value: 'CLOSED', labelKey: 'admin.contacts.statuses.CLOSED' },
]

const AdminContactPage = () => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const { contacts, isLoading, deleteContact, updateContactStatus, isDeleting, isUpdatingStatus } = useGetListContact()

  const getStatusLabel = (status: string) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status)
    return option?.labelKey ? translate(option.labelKey as any) : status
  }

  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredContacts = useMemo(() => {
    const kw = keyword.trim().toLowerCase()

    return contacts.filter((contact: ContactItem) => {
      const matchStatus = statusFilter === '' || contact.status === statusFilter
      const matchKeyword =
        !kw || contact.name.toLowerCase().includes(kw) || contact.phone.replace(/\s/g, '').includes(kw) || contact.subject.toLowerCase().includes(kw)

      return matchStatus && matchKeyword
    })
  }, [contacts, keyword, statusFilter])

  const confirmDelete = (contact: ContactItem) => {
    open({
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
              <MyInput placeholder={translate('common.search')} value={keyword} onChange={(e) => setKeyword(e.target.value)} className='sm:w-64' />
              <MySelect
                data={STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.value ? getStatusLabel(s.value) : translate('common.all') }))}
                value={statusFilter}
                placeholder={translate('admin.contacts.filterByStatus')}
                search={false}
                onChange={(item) => setStatusFilter(item.value as string)}
              />
            </div>
          </div>
        </MyCardHeader>
        <MyCardBody>
          {isLoading ? (
            <MyLoading />
          ) : filteredContacts.length === 0 ? (
            <MyEmpty message={translate('common.noData')} />
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border'>
                    <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('common.name')}</th>
                    <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('common.phone')}</th>
                    <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('common.email')}</th>
                    <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('common.title')}</th>
                    <th className='text-left py-3 px-4 font-medium text-gray-500'>{translate('common.content')}</th>
                    <th className='text-center py-3 px-4 font-medium text-gray-500'>{translate('common.status')}</th>
                    <th className='text-center py-3 px-4 font-medium text-gray-500'>{translate('common.time')}</th>
                    <th className='text-center py-3 px-4 font-medium text-gray-500'>{translate('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className='border-b border-border align-middle'>
                      <td className='py-3 px-4 font-medium'>{contact.name}</td>
                      <td className='py-3 px-4'>{contact.phone}</td>
                      <td className='py-3 px-4'>{contact.email || '—'}</td>
                      <td className='py-3 px-4'>
                        <p className='max-w-[180px] truncate font-medium'>{contact.subject}</p>
                      </td>
                      <td className='py-3 px-4'>
                        <p className='max-w-[220px] truncate text-gray-500'>{contact.message}</p>
                      </td>
                      <td className='py-3 px-4 text-center'>
                        <MyBadge variant={getStatusVariant(contact.status)}>{contact.status}</MyBadge>
                      </td>
                      <td className='py-3 px-4 whitespace-nowrap text-gray-500'>{dayjs(contact.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center justify-center gap-2'>
                          <select
                            value={contact.status}
                            onChange={(e) => updateContactStatus({ id: contact.id, status: e.target.value })}
                            disabled={isUpdatingStatus}
                            className='rounded-lg border border-border px-2 py-1 text-xs'
                          >
                            <option value='PENDING'>Pending</option>
                            <option value='IN_PROGRESS'>In Progress</option>
                            <option value='RESOLVED'>Resolved</option>
                            <option value='CLOSED'>Closed</option>
                          </select>
                          <button
                            type='button'
                            onClick={() => confirmDelete(contact)}
                            className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600'
                          >
                            <TrashIcon className='h-5 w-5' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminContactPage
