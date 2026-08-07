'use client'

import type { CommentItem } from '@/services/comment'

import dayjs from 'dayjs'

import MyBadge from '@/components/MyBadge'
import MyButton from '@/components/MyButton'
import StarRating from '@/components/Comment/StarRating'
import CommentForm from '@/components/Comment/CommentForm'
import ReplyForm from '@/components/Comment/ReplyForm'
import { EditIcon } from '@/components/Icons/Functions/Edit'
import { CloseIcon } from '@/components/Icons/Functions/Close'
import { TrashIcon } from '@/components/Icons/Trash'
import ChatBubbleIcon from '@/components/Icons/ChatBubble'
import { getServiceName } from '@/services/comment'
import useGetListComments from '@/hooks/reactQuery/useGetListComments'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import useUser from '@/hooks/useUser'
import { cn } from '@/utils/tailwind'

type CommentCardProps = {
  comment: CommentItem
  className?: string
}

// Mask phone for public display, e.g. 0901234567 -> 090•••••67
const maskPhone = (phone: string): string => {
  const clean = (phone ?? '').replace(/\s/g, '')

  if (clean.length < 6) return phone

  return `${clean.slice(0, 3)}•••••${clean.slice(-2)}`
}

// Render a single review card with stars, content, image thumbnails and owner/admin actions
const CommentCard = ({ comment, className }: CommentCardProps) => {
  const { translate } = useLanguage()
  const { open, close } = useModalDrawer()
  const { user, isLogin, hasHydrated } = useUser()
  const { deleteComment, isDeleting } = useGetListComments()

  // Admin can reply/delete any review; a logged-in user can edit/delete their own
  const isAdmin = hasHydrated && isLogin && !!user?.isAdmin
  const isOwnReview = hasHydrated && isLogin && !!comment.userId && comment.userId === user?.id
  const canManage = isAdmin || isOwnReview

  // Show one image enlarged inside a modal
  const viewImage = (src: string) => {
    open({
      title: comment.title || translate('common.image'),
      showBtnClose: false,
      overClickClose: true,
      classNames: { container: 'md:w-[640px]' },
      children: (
        <div className='w-full'>
          <div className='relative max-h-[70dvh] w-full overflow-hidden rounded-xl bg-black'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={comment.title} className='mx-auto max-h-[70dvh] w-auto object-contain' />
          </div>
          <div className='mt-4 flex justify-end'>
            <button
              type='button'
              onClick={() => close()}
              className='inline-flex cursor-pointer items-center gap-1 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-gray-200'
            >
              <CloseIcon className='h-4 w-4' />
              {translate('common.close')}
            </button>
          </div>
        </div>
      ),
    })
  }

  const openEdit = () => {
    open({
      title: translate('reviews.form.edit'),
      classNames: { container: 'md:w-[560px]' },
      children: <CommentForm editingComment={comment} />,
    })
  }

  const openReply = () => {
    open({
      title: translate('reviews.form.reply'),
      classNames: { container: 'md:w-[560px]' },
      children: <ReplyForm comment={comment} />,
    })
  }

  const openDelete = () => {
    open({
      title: translate('reviews.deleteTitle'),
      children: (
        <div className='w-full'>
          <p className='mb-6 text-sm text-gray-600'>{translate('reviews.deleteConfirm')}</p>
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
    <div className={cn('flex flex-col gap-3 rounded-2xl border border-border bg-white p-5', className)}>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-bold text-white'>
            {comment.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className='font-semibold text-text'>{comment.name}</p>
            <p className='text-xs text-gray-400'>{maskPhone(comment.phone)}</p>
          </div>
        </div>
        <div className='flex flex-col items-end gap-1'>
          <StarRating value={comment.rating} />
          <p className='text-xs text-gray-400'>{dayjs(comment.createdAt).format('DD/MM/YYYY HH:mm')}</p>
        </div>
      </div>

      {getServiceName(comment.serviceId) && (
        <MyBadge variant='secondary' className='self-start'>
          {getServiceName(comment.serviceId)}
        </MyBadge>
      )}

      {comment.title && <h4 className='font-bold text-text'>{comment.title}</h4>}

      <p className='whitespace-pre-line text-sm leading-relaxed text-gray-600'>{comment.content}</p>

      {comment.images.length > 0 && (
        <div className={cn('grid gap-2', comment.images.length === 1 ? 'grid-cols-1' : comment.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
          {comment.images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type='button'
              onClick={() => viewImage(src)}
              className='group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-border'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={comment.title} className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-110' />
            </button>
          ))}
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className='mt-1 space-y-2 rounded-xl bg-gray-50 p-4'>
          {comment.replies.map((reply) => (
            <div key={reply.id} className='flex flex-col gap-1'>
              <div className='flex items-center justify-between gap-2'>
                <span className='inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary'>
                  <ChatBubbleIcon className='h-3.5 w-3.5' />
                  {translate('reviews.shopReply')}
                </span>
                <span className='text-xs text-gray-400'>{dayjs(reply.createdAt).format('DD/MM/YYYY HH:mm')}</span>
              </div>
              <p className='whitespace-pre-line text-sm leading-relaxed text-gray-600'>{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <div className='mt-1 flex items-center gap-2 border-t border-border pt-3'>
          {isAdmin && (
            <MyButton variant='outline' className='!px-3 !py-1.5 text-xs' onClick={openReply}>
              <ChatBubbleIcon className='mr-1 h-4 w-4' />
              {translate('reviews.form.reply')}
            </MyButton>
          )}
          {isOwnReview && (
            <MyButton variant='outline' className='!px-3 !py-1.5 text-xs' onClick={openEdit}>
              <EditIcon className='mr-1 h-4 w-4' />
              {translate('common.edit')}
            </MyButton>
          )}
          <MyButton variant='error' className='!px-3 !py-1.5 text-xs' onClick={openDelete}>
            <TrashIcon className='mr-1 h-4 w-4' />
            {translate('common.delete')}
          </MyButton>
        </div>
      )}
    </div>
  )
}

export default CommentCard
