'use client'

import type { CommentItem } from '@/services/comment'

import { useMemo } from 'react'
import dayjs from 'dayjs'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MySelect from '@/components/MySelect'
import MyLoading from '@/components/MyLoading'
import MyEmpty from '@/components/MyEmpty'
import MyBadge from '@/components/MyBadge'
import MyPagination from '@/components/MyPagination'
import StarRating from '@/components/Comment/StarRating'
import ReplyForm from '@/components/Comment/ReplyForm'
import { EyeIcon } from '@/components/Icons/Eye'
import { EyeSlashIcon } from '@/components/Icons/EyeSlash'
import { TrashIcon } from '@/components/Icons/Trash'
import ChatBubbleIcon from '@/components/Icons/ChatBubble'
import { PAGE_SIZE } from '@/constants/app'
import useAdminListComments from '@/hooks/reactQuery/useAdminListComments'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'

const AdminCommentsPage = () => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const {
    comments,
    totalComments,
    isLoading,
    refetch,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    resetPage,
    toggleVisibility,
    isTogglingVisibility,
    deleteComment,
    isDeleting,
  } = useAdminListComments()

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: translate('common.all') },
      {
        value: 'visible',
        label: translate('admin.comments.statuses.visible', {}, 'Đang hiển thị'),
      },
      {
        value: 'hidden',
        label: translate('admin.comments.statuses.hidden', {}, 'Đã ẩn'),
      },
    ],
    [translate]
  )

  const openReply = (comment: CommentItem) => {
    open({
      title: translate('admin.comments.reply'),
      classNames: { container: 'md:w-[560px]' },
      children: <ReplyForm comment={comment} />,
    })
  }

  const confirmDelete = (comment: CommentItem) => {
    open({
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
                await deleteComment(comment.id)
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
    await toggleVisibility({ id: comment.id, isVisible: !comment.isVisible })
  }

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
                  resetPage()
                }}
                className='sm:w-64'
              />
              <MySelect
                data={statusOptions}
                value={statusFilter}
                placeholder={translate('admin.comments.filterByStatus', {}, 'Lọc theo trạng thái')}
                search={false}
                onChange={(item) => {
                  setStatusFilter(item.value as 'all' | 'visible' | 'hidden')
                  resetPage()
                }}
              />
            </div>
          </div>
        </MyCardHeader>
        <MyCardBody>
          {isLoading ? (
            <MyLoading />
          ) : comments.length === 0 ? (
            <MyEmpty message={translate('common.noData')} />
          ) : (
            <>
              <div className='mb-4 text-sm text-gray-500'>
                {translate('common.showing')} {(page - 1) * PAGE_SIZE + 1} {translate('common.to')} {Math.min(page * PAGE_SIZE, totalComments)}{' '}
                {translate('common.from')} {totalComments} {translate('common.results')}
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-border'>
                      <th className='py-3 px-4 text-left font-medium text-gray-500'>{translate('common.name')}</th>
                      <th className='py-3 px-4 text-center font-medium text-gray-500'>{translate('reviews.form.rating')}</th>
                      <th className='py-3 px-4 text-left font-medium text-gray-500'>{translate('common.content')}</th>
                      <th className='py-3 px-4 text-center font-medium text-gray-500'>{translate('common.status')}</th>
                      <th className='py-3 px-4 text-center font-medium text-gray-500'>{translate('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comments.map((comment) => (
                      <tr key={comment.id} className='border-b border-border align-middle'>
                        <td className='py-3 px-4'>
                          <div className='flex items-center gap-3'>
                            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white'>
                              {comment.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className='min-w-0'>
                              <p className='font-medium text-text'>{comment.name}</p>
                              <p className='text-xs text-gray-400'>{comment.phone}</p>
                              {comment.replies && comment.replies.length > 0 && (
                                <p className='mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-primary'>
                                  <ChatBubbleIcon className='h-3 w-3' />
                                  {comment.replies.length}{' '}
                                  {translate('reviews.summary.replyCount', {
                                    count: comment.replies.length,
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className='py-3 px-4'>
                          <div className='flex items-center justify-center gap-1.5'>
                            <StarRating value={comment.rating ?? 0} />
                            <span className='text-xs font-semibold text-text'>{comment.rating ?? 0}</span>
                          </div>
                        </td>
                        <td className='py-3 px-4'>
                          <p className='max-w-[300px] truncate font-medium text-text'>{comment.title}</p>
                          <p className='max-w-[300px] truncate text-xs text-gray-400'>{comment.content}</p>
                          <p className='mt-1 text-xs text-gray-400'>{dayjs(comment.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                        </td>
                        <td className='py-3 px-4 text-center'>
                          <MyBadge variant={comment.isVisible ? 'success' : 'warning'}>
                            {comment.isVisible
                              ? translate('admin.comments.statuses.visible', {}, 'Đang hiển thị')
                              : translate('admin.comments.statuses.hidden', {}, 'Đã ẩn')}
                          </MyBadge>
                        </td>
                        <td className='py-3 px-4'>
                          <div className='flex items-center justify-center gap-2'>
                            <button
                              type='button'
                              aria-label={
                                comment.isVisible ? translate('admin.comments.hide', {}, 'Ẩn') : translate('admin.comments.show', {}, 'Hiện')
                              }
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className='mt-6 flex justify-center'>
                  <MyPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminCommentsPage
