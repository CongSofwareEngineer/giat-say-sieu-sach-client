'use client'

import type { CommentItem } from '@/services/comment'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MySelect from '@/components/MySelect'
import MyBadge from '@/components/MyBadge'
import MyTable, { MyTableColumn } from '@/components/MyTable'
import StarRating from '@/components/Comment/StarRating'
import CommentCard from '@/components/Comment/CommentCard'
import ReplyForm from '@/components/Comment/ReplyForm'
import { EyeIcon } from '@/components/Icons/Eye'
import { InfoIcon } from '@/components/Icons/Info'
import { EyeSlashIcon } from '@/components/Icons/EyeSlash'
import { TrashIcon } from '@/components/Icons/Trash'
import ChatBubbleIcon from '@/components/Icons/ChatBubble'
import { PAGE_SIZE } from '@/constants/app'
import useAdminComments from '@/hooks/admin/useAdminComments'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'

const AdminCommentsPage = () => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const { comments, meta, isLoading, refetch, toggleVisibility, isTogglingVisibility, adminDeleteComment, isDeleting } = useAdminComments()

  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredComments = useMemo(() => {
    const kw = keyword.trim().toLowerCase()

    return comments.filter((comment) => {
      const matchKeyword =
        !kw ||
        comment.content?.toLowerCase().includes(kw) ||
        comment.name?.toLowerCase().includes(kw) ||
        comment.phone?.includes(kw) ||
        comment.id?.toLowerCase().includes(kw)

      const matchStatus = statusFilter === 'all' || (statusFilter === 'visible' ? comment.isVisible : !comment.isVisible)

      return matchKeyword && matchStatus
    })
  }, [comments, keyword, statusFilter])

  const totalPages = meta?.totalPages || Math.max(1, Math.ceil(filteredComments.length / PAGE_SIZE))
  const paginatedComments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE

    return filteredComments.slice(start, start + PAGE_SIZE)
  }, [filteredComments, currentPage])

  // Show the full review (title, content, images, replies) in a modal
  const openDetail = (comment: CommentItem) => {
    open({
      mode: 'modal',
      title: translate('admin.comments.detail'),
      classNames: { container: 'md:w-[640px]' },
      children: <CommentCard comment={comment} className='w-full border-0 p-0' />,
    })
  }

  const openReply = (comment: CommentItem) => {
    open({
      mode: 'modal',
      title: translate('admin.comments.reply'),
      classNames: { container: 'md:w-[560px]' },
      children: <ReplyForm comment={comment} />,
    })
  }

  const confirmDelete = (comment: CommentItem) => {
    open({
      mode: 'modal',
      title: translate('admin.comments.delete'),
      children: (
        <div className='w-full'>
          <p className='mb-6 text-sm text-gray-600'>{translate('admin.comments.deleteConfirm')}</p>
          <div className='flex justify-end gap-3'>
            <MyButton variant='outline' onClick={() => close()}>
              {translate('common.cancel')}
            </MyButton>
            <MyButton
              variant='error'
              loading={isDeleting}
              onClick={async () => {
                await adminDeleteComment(comment.id)
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

  const handleToggleVisibility = async (comment: CommentItem) => {
    try {
      await toggleVisibility({ id: comment.id, isVisible: !comment.isVisible })
    } catch {
      // Toasts are handled inside useAdminComments
    }
  }

  const columns: MyTableColumn<CommentItem>[] = [
    {
      key: 'name',
      title: translate('common.name'),
      render: (comment) => (
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white'>
            {comment.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className='min-w-0'>
            <p className='font-medium text-text'>{comment.name}</p>
            <p className='text-xs text-gray-400'>{comment.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      title: translate('reviews.form.rating'),
      align: 'center',
      render: (comment) => (
        <div className='flex items-center justify-center gap-1.5'>
          <StarRating value={comment.rating ?? 0} />
          <span className='text-xs font-semibold text-text'>{comment.rating ?? 0}</span>
        </div>
      ),
    },
    {
      key: 'content',
      title: translate('common.content'),
      render: (comment) => (
        <button type='button' onClick={() => openDetail(comment)} className='block max-w-[300px] cursor-pointer text-left'>
          <p className='truncate font-medium text-text hover:text-primary'>{comment.content}</p>
          <p className='mt-1 text-xs text-gray-400'>{dayjs(comment.createdAt).format('DD/MM/YYYY HH:mm')}</p>
        </button>
      ),
    },
    {
      key: 'status',
      title: translate('common.status'),
      align: 'center',
      render: (comment) => (
        <MyBadge variant={comment.isVisible ? 'success' : 'warning'}>
          {comment.isVisible
            ? translate('admin.comments.statuses.visible', {}, 'Đang hiển thị')
            : translate('admin.comments.statuses.hidden', {}, 'Đã ẩn')}
        </MyBadge>
      ),
    },
    {
      key: 'actions',
      title: translate('common.actions'),
      align: 'center',
      render: (comment) => (
        <div className='flex items-center justify-center gap-2'>
          <button
            type='button'
            aria-label={translate('admin.comments.detail')}
            onClick={() => openDetail(comment)}
            className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary'
          >
            <InfoIcon className='h-5 w-5' />
          </button>
          <button
            type='button'
            aria-label={comment.isVisible ? translate('admin.comments.hide', {}, 'Ẩn') : translate('admin.comments.show', {}, 'Hiện')}
            onClick={() => handleToggleVisibility(comment)}
            disabled={isTogglingVisibility}
            className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-50'
          >
            {comment.isVisible ? <EyeSlashIcon className='h-5 w-5' /> : <EyeIcon className='h-5 w-5' />}
          </button>
          <button
            type='button'
            aria-label={translate('admin.comments.reply')}
            onClick={() => openReply(comment)}
            className='rounded-lg p-2 text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary'
          >
            <ChatBubbleIcon className='h-5 w-5' />
          </button>
          <button
            type='button'
            aria-label={translate('admin.comments.delete')}
            onClick={() => confirmDelete(comment)}
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
        <h1 className='text-2xl font-bold text-text'>{translate('admin.comments.title')}</h1>
        <MyButton variant='primary' onClick={() => refetch()} loading={isLoading}>
          {translate('common.refresh', {}, 'Làm mới')}
        </MyButton>
      </div>

      <MyCard>
        <MyCardHeader>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <h2 className='text-lg font-bold text-text'>{translate('admin.comments.list')}</h2>
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
                data={[
                  { value: 'all', label: translate('common.all') },
                  {
                    value: 'visible',
                    label: translate('admin.comments.statuses.visible', {}, 'Đang hiển thị'),
                  },
                  {
                    value: 'hidden',
                    label: translate('admin.comments.statuses.hidden', {}, 'Đã ẩn'),
                  },
                ]}
                value={statusFilter}
                placeholder={translate('admin.comments.filterByStatus', {}, 'Lọc theo trạng thái')}
                search={false}
                onChange={(item) => {
                  setStatusFilter(item.value as 'all' | 'visible' | 'hidden')
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
        </MyCardHeader>
        <MyCardBody>
          {!isLoading && paginatedComments.length > 0 && (
            <div className='mb-4 text-sm text-gray-500'>
              {translate('common.showing')} {(currentPage - 1) * PAGE_SIZE + 1} {translate('common.to')}{' '}
              {Math.min(currentPage * PAGE_SIZE, filteredComments.length)} {translate('common.from')} {filteredComments.length}{' '}
              {translate('common.results')}
            </div>
          )}
          <MyTable
            columns={columns}
            data={paginatedComments}
            rowKey={(comment) => comment.id}
            loading={isLoading}
            emptyMessage={translate('common.noData')}
            pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
          />
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminCommentsPage
