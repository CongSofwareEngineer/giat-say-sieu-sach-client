'use client'

import type { CommentItem } from '@/services/comment'

import { useMemo, useState } from 'react'
import dayjs from 'dayjs'

import MyInput from '@/components/MyInput'
import MyButton from '@/components/MyButton'
import MyCard, { MyCardBody, MyCardHeader } from '@/components/MyCard'
import MySelect from '@/components/MySelect'
import MyLoading from '@/components/MyLoading'
import MyEmpty from '@/components/MyEmpty'
import MyBadge from '@/components/MyBadge'
import StarRating from '@/components/Comment/StarRating'
import ReplyForm from '@/components/Comment/ReplyForm'
import { TrashIcon } from '@/components/Icons/Trash'
import ChatBubbleIcon from '@/components/Icons/ChatBubble'
import { COMMENT_SERVICES, getServiceName } from '@/services/comment'
import useGetListComments from '@/hooks/reactQuery/useGetListComments'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'

const AdminCommentsPage = () => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const { comments, isLoading, deleteComment, isDeleting } = useGetListComments()

  const [keyword, setKeyword] = useState('')
  const [serviceFilter, setServiceFilter] = useState('all')

  const serviceOptions = useMemo(
    () => [{ value: 'all', label: translate('reviews.allServices') }, ...COMMENT_SERVICES.map((s) => ({ value: s.id, label: s.name }))],
    [translate]
  )

  const filteredComments = useMemo(() => {
    const kw = keyword.trim().toLowerCase()

    return comments.filter((comment) => {
      const matchService = serviceFilter === 'all' || comment.serviceId === serviceFilter

      const matchKeyword =
        !kw || comment.name.toLowerCase().includes(kw) || comment.phone.replace(/\s/g, '').includes(kw) || comment.title.toLowerCase().includes(kw)

      return matchService && matchKeyword
    })
  }, [comments, keyword, serviceFilter])

  // Open the reply editor for a review
  const openReply = (comment: CommentItem) => {
    open({
      title: translate('admin.comments.reply'),
      classNames: { container: 'md:w-[560px]' },
      children: <ReplyForm comment={comment} />,
    })
  }

  // Confirm dialog before deleting a review
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

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-text'>{translate('admin.comments.title')}</h1>
      </div>

      <MyCard>
        <MyCardHeader>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <h2 className='text-lg font-bold text-text'>{translate('admin.comments.list')}</h2>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <MyInput placeholder={translate('common.search')} value={keyword} onChange={(e) => setKeyword(e.target.value)} className='sm:w-64' />
              <MySelect
                data={serviceOptions}
                value={serviceFilter}
                placeholder={translate('reviews.allServices')}
                search={false}
                onChange={(item) => setServiceFilter(item.value as string)}
              />
            </div>
          </div>
        </MyCardHeader>
        <MyCardBody>
          {isLoading ? (
            <MyLoading />
          ) : filteredComments.length === 0 ? (
            <MyEmpty message={translate('common.noData')} />
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border'>
                    <th className='py-3 px-4 text-left font-medium text-gray-500'>{translate('common.name')}</th>
                    <th className='py-3 px-4 text-left font-medium text-gray-500'>{translate('reviews.service')}</th>
                    <th className='py-3 px-4 text-center font-medium text-gray-500'>{translate('reviews.form.rating')}</th>
                    <th className='py-3 px-4 text-left font-medium text-gray-500'>{translate('common.title')}</th>
                    <th className='py-3 px-4 text-center font-medium text-gray-500'>{translate('common.image')}</th>
                    <th className='py-3 px-4 text-left font-medium text-gray-500'>{translate('common.time')}</th>
                    <th className='py-3 px-4 text-center font-medium text-gray-500'>{translate('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComments.map((comment) => (
                    <tr key={comment.id} className='border-b border-border align-middle'>
                      <td className='py-3 px-4'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white'>
                            {comment.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className='min-w-0'>
                            <p className='font-medium text-text'>{comment.name}</p>
                            <p className='text-xs text-gray-400'>{comment.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className='py-3 px-4'>
                        {getServiceName(comment.serviceId) ? (
                          <MyBadge variant='secondary'>{getServiceName(comment.serviceId)}</MyBadge>
                        ) : (
                          <span className='text-gray-400'>—</span>
                        )}
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center justify-center gap-1.5'>
                          <StarRating value={comment.rating} />
                          <span className='text-xs font-semibold text-text'>{comment.rating}</span>
                        </div>
                      </td>
                      <td className='py-3 px-4'>
                        <p className='max-w-[220px] truncate font-medium text-text'>{comment.title}</p>
                        <p className='max-w-[220px] truncate text-xs text-gray-400'>{comment.content}</p>
                        {comment.replies && comment.replies.length > 0 && (
                          <p className='mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary'>
                            <ChatBubbleIcon className='h-3.5 w-3.5' />
                            {translate('reviews.summary.replyCount', { count: comment.replies.length })}
                          </p>
                        )}
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center justify-center gap-2'>
                          {comment.images.length > 0 ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={comment.images[0]} alt={comment.title} className='h-10 w-10 rounded-lg object-cover' />
                              {comment.images.length > 1 && <span className='text-xs text-gray-400'>+{comment.images.length - 1}</span>}
                            </>
                          ) : (
                            <span className='text-gray-400'>—</span>
                          )}
                        </div>
                      </td>
                      <td className='py-3 px-4 whitespace-nowrap text-gray-500'>{dayjs(comment.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center justify-center gap-2'>
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
          )}
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default AdminCommentsPage
