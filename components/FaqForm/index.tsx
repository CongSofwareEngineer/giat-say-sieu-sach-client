'use client'

import type { FaqItem, FaqPayload } from '@/services/faq'

import { useMemo, useState } from 'react'

import MyInput from '@/components/MyInput'
import MySelect from '@/components/MySelect'
import MyTextarea from '@/components/MyTextarea'
import MyButton from '@/components/MyButton'
import useAdminFaqs from '@/hooks/admin/useAdminFaqs'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { FAQ_CATEGORY } from '@/constants/app'
import { getFaqCategoryLabel } from '@/utils/functions'

type FaqFormProps = {
  // Edit mode when provided
  faq?: FaqItem
}

const TAG_SEPARATOR = ','

const FaqForm = ({ faq }: FaqFormProps) => {
  const { translate } = useLanguage()
  const { close } = useModalDrawer()
  const { createFaq, updateFaq, isCreating, isUpdating } = useAdminFaqs()

  const [question, setQuestion] = useState(faq?.question ?? '')
  const [answer, setAnswer] = useState(faq?.answer ?? '')
  const [category, setCategory] = useState<string>(faq?.category ?? FAQ_CATEGORY.SERVICE)
  const [tags, setTags] = useState((faq?.tags ?? []).join(`${TAG_SEPARATOR} `))
  const [isActive, setIsActive] = useState(faq?.isActive ?? true)

  const [isSubmitted, setIsSubmitted] = useState(false)

  // Keep a legacy category that is not in FAQ_CATEGORY selectable so editing does not change it
  const categoryOptions = useMemo(() => {
    const values: string[] = Object.values(FAQ_CATEGORY)

    if (faq?.category && !values.includes(faq.category)) values.push(faq.category)

    return values.map((value) => ({
      value,
      label: getFaqCategoryLabel(value, translate),
    }))
  }, [faq?.category, translate])

  const isQuestionEmpty = isSubmitted && !question.trim()
  const isAnswerEmpty = isSubmitted && !answer.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)

    if (!question.trim() || !answer.trim()) return

    const payload: FaqPayload = {
      question: question.trim(),
      answer: answer.trim(),
      category,
      tags: tags
        .split(TAG_SEPARATOR)
        .map((tag) => tag.trim())
        .filter(Boolean),
      isActive,
    }

    try {
      if (faq) {
        await updateFaq({ id: faq.id, payload })
      } else {
        await createFaq(payload)
      }
      close()
    } catch {
      // Error toast is shown by the mutation
    }
  }

  return (
    <form onSubmit={handleSubmit} className='w-full space-y-4'>
      <MyInput
        label={translate('admin.faqs.question')}
        placeholder={translate('admin.faqs.questionPlaceholder')}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        error={isQuestionEmpty ? translate('admin.faqs.validation.questionRequired') : undefined}
        required
      />
      <MyTextarea
        label={translate('admin.faqs.answer')}
        placeholder={translate('admin.faqs.answerPlaceholder')}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        error={isAnswerEmpty ? translate('admin.faqs.validation.answerRequired') : undefined}
        rows={5}
        required
      />
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <MySelect
          label={translate('admin.faqs.category')}
          data={categoryOptions}
          value={category}
          search={false}
          onChange={(item) => setCategory(item.value as string)}
        />
        <MyInput
          label={translate('admin.faqs.tags')}
          placeholder={translate('admin.faqs.tagsPlaceholder')}
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>

      <label className='flex cursor-pointer items-center gap-2'>
        <input type='checkbox' className='toggle toggle-primary toggle-sm' checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <span className='text-sm text-text'>{translate('admin.faqs.isActive')}</span>
      </label>

      <div className='flex justify-end pt-2'>
        <MyButton variant='outline' size='small' className='mr-2' onClick={() => close()}>
          {translate('common.cancel')}
        </MyButton>
        <MyButton type='submit' variant='primary' size='small' loading={isCreating || isUpdating}>
          {translate('common.save')}
        </MyButton>
      </div>
    </form>
  )
}

export default FaqForm
