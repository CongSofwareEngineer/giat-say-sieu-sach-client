'use client'

import { useMemo, useState } from 'react'

import MyButton from '@/components/MyButton'
import MyBadge from '@/components/MyBadge'
import MyCard, { MyCardBody } from '@/components/MyCard'
import MyTable, { MyTableColumn } from '@/components/MyTable'
import MyInput from '@/components/MyInput'
import AdminDeleteConfirm from '@/components/admin/AdminDeleteConfirm'
import BranchForm from '@/components/BranchForm'
import { PAGE_SIZE } from '@/constants/app'
import useAdminBranches from '@/hooks/admin/useAdminBranches'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { BranchItem } from '@/services/branch'
import { formatAddress } from '@/services/address'

const AdminBranchesPage = () => {
  const { translate } = useLanguage()
  const { open } = useModalDrawer()
  const { branches, isLoading, deleteBranch, isDeleting } = useAdminBranches()
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredBranches = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    return branches.filter((branch) =>
      [branch.name, branch.address, branch.district, branch.city, branch.phone].some((value) => value?.toLowerCase().includes(keyword))
    )
  }, [branches, search])

  const totalPages = Math.max(1, Math.ceil(filteredBranches.length / PAGE_SIZE))
  const paginatedBranches = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE

    return filteredBranches.slice(start, start + PAGE_SIZE)
  }, [filteredBranches, currentPage])

  const openForm = (branch?: BranchItem) => {
    open({
      mode: 'modal',
      title: translate(branch ? 'admin.branches.edit' : 'admin.branches.create'),
      classNames: { container: 'md:w-[640px]' },
      children: <BranchForm branch={branch} />,
    })
  }

  const confirmDelete = (branch: BranchItem) => {
    open({
      mode: 'modal',
      title: translate('admin.branches.delete'),
      children: <AdminDeleteConfirm itemName={branch.name} onConfirm={() => deleteBranch(branch.id)} isDeleting={isDeleting} />,
    })
  }

  const columns: MyTableColumn<BranchItem>[] = [
    {
      key: 'name',
      title: translate('admin.branches.name'),
      render: (branch) => (
        <div className='min-w-0'>
          <p className='font-medium text-text'>{branch.name}</p>
          <p className='mt-0.5 line-clamp-1 text-xs text-gray-500'>{formatAddress(branch)}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      title: translate('admin.branches.phone'),
      render: (branch) => branch.phone || '—',
    },
    {
      key: 'openingHours',
      title: translate('admin.branches.openingHours'),
      render: (branch) => branch.openingHours || '—',
    },
    {
      key: 'status',
      title: translate('common.status'),
      align: 'center',
      render: (branch) => (
        <MyBadge variant={branch.isActive ? 'success' : 'default'}>
          {translate(branch.isActive ? 'admin.branches.active' : 'admin.branches.hidden')}
        </MyBadge>
      ),
    },
    {
      key: 'actions',
      title: translate('common.actions'),
      align: 'center',
      render: (branch) => (
        <div className='flex items-center justify-center gap-2'>
          <button type='button' onClick={() => openForm(branch)} className='px-3 py-1 text-xs text-blue-600 border border-blue-600 rounded-lg'>
            {translate('common.edit')}
          </button>
          <button type='button' onClick={() => confirmDelete(branch)} className='px-3 py-1 text-xs text-red-600 border border-red-600 rounded-lg'>
            {translate('common.delete')}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h1 className='text-2xl font-bold text-text'>{translate('admin.branches.title')}</h1>
        <MyButton variant='primary' onClick={() => openForm()}>
          {translate('admin.branches.create')}
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
            data={paginatedBranches}
            rowKey={(branch) => branch.id}
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

export default AdminBranchesPage
