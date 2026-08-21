'use client'

import type { CommentItem } from '@/services/comment'

import { useState } from 'react'

import MyButton from '@/components/MyButton'
import MyTextarea from '@/components/MyTextarea'
import SendIcon from '@/components/Icons/Functions/Send'
import useGetListComments from '@/hooks/reactQuery/useGetListComments'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { toast } from '@/utils/toast'

type ReplyFormProps = {
  comment: CommentItem
}

// Admin reply editor shown inside a modal
const ReplyForm = ({ comment }: ReplyFormProps) => {
  const { translate } = useLanguage()
  const { close } = useModalDrawer()
  const { replyComment, isReplying } = useGetListComments()
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError(translate('reviews.validation.replyRequired'))

      return
    }

    try {
      await replyComment({ id: comment.id, content: content.trim() })
      toast({ message: translate('common.success'), type: 'default' })
      close()
    } catch {
      setError(translate('reviews.error'))
    }
  }

  return (
    <div className='w-full space-y-4'>
      <MyTextarea
        label={translate('reviews.form.replyLabel')}
        placeholder={translate('reviews.form.replyPlaceholder')}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={error}
      />
      <div className='flex justify-end gap-3'>
        <MyButton variant='outline' onClick={() => close()}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton variant='primary' loading={isReplying} onClick={handleSubmit}>
          <SendIcon className='mr-1 h-4 w-4' />
          {translate('reviews.form.replySubmit')}
        </MyButton>
      </div>
    </div>
  )
}

export default ReplyForm
