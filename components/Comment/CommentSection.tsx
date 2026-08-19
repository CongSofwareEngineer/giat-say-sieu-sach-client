'use client'

import { useEffect, useMemo, useState } from 'react'

import MyCard, { MyCardBody } from '@/components/MyCard'
import MyButton from '@/components/MyButton'
import MySelect from '@/components/MySelect'
import MyLoading from '@/components/MyLoading'
import MyEmpty from '@/components/MyEmpty'
import MyPagination from '@/components/MyPagination'
import StarRating from '@/components/Comment/StarRating'
import CommentCard from '@/components/Comment/CommentCard'
import CommentForm from '@/components/Comment/CommentForm'
import { PlusIcon } from '@/components/Icons/Plus'
import { COMMENT_SERVICES, filterVisibleComments } from '@/services/comment'
import useGetListComments from '@/hooks/reactQuery/useGetListComments'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { cn } from '@/utils/tailwind'

const PAGE_SIZE = 6

type CommentSectionProps = {
  serviceId?: string
  onServiceChange?: (serviceId: string) => void
  tag?: string
  title?: string
  subtitle?: string
  headingLevel?: 'h1' | 'h2'
  className?: string
}

// Reusable review section: filter by service + summary + list + write form
const CommentSection = ({ serviceId, onServiceChange, tag, title, subtitle, headingLevel = 'h2', className }: CommentSectionProps) => {
  const { translate } = useLanguage()
  const { open } = useModalDrawer()
  const [internalServiceId, setInternalServiceId] = useState('all')
  const [page, setPage] = useState(1)

  const selectedServiceId = serviceId ?? internalServiceId
  const filterServiceId = selectedServiceId === 'all' ? undefined : selectedServiceId

  // Reset pagination whenever the active service changes (internal or external)
  useEffect(() => {
    setPage(1)
  }, [selectedServiceId])

  const { comments, isLoading } = useGetListComments(filterServiceId)

  const visibleComments = useMemo(() => filterVisibleComments(comments), [comments])

  const serviceOptions = useMemo(
    () => [{ value: 'all', label: translate('reviews.allServices') }, ...COMMENT_SERVICES.map((s) => ({ value: s.id, label: s.name }))],
    [translate]
  )

  const averageRating = useMemo(() => {
    if (visibleComments.length === 0) return 0

    return visibleComments.reduce((sum, item) => sum + (item.rating ?? 0), 0) / visibleComments.length
  }, [visibleComments])

  const totalPages = Math.max(1, Math.ceil(visibleComments.length / PAGE_SIZE))
  const pageComments = visibleComments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleServiceChange = (value: string) => {
    if (onServiceChange) onServiceChange(value)
    else setInternalServiceId(value)
  }

  const openCommentForm = () => {
    open({
      title: translate('reviews.form.heading'),
      classNames: { container: 'md:w-[560px]' },
      children: <CommentForm defaultServiceId={filterServiceId ?? ''} />,
    })
  }

  const HeadingTag = headingLevel as 'h1' | 'h2'

  return (
    <div className={cn('w-full', className)}>
      {/* Section heading */}
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          {tag && (
            <span className='mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-wider text-primary'>
              {tag}
            </span>
          )}
          <HeadingTag className='text-2xl font-extrabold leading-tight text-text lg:text-3xl'>{title || translate('reviews.title')}</HeadingTag>
          {subtitle && <p className='mt-2 text-sm leading-relaxed text-gray-500 lg:text-base'>{subtitle}</p>}
        </div>

        <MyButton variant='primary' onClick={openCommentForm}>
          <PlusIcon className='mr-1 h-4 w-4' />
          {translate('reviews.writeReview')}
        </MyButton>
      </div>

      <MyCard>
        <MyCardBody className='p-5 lg:p-6'>
          {/* Filter + summary */}
          <div className='flex flex-col gap-5 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between'>
            <div className='w-full lg:w-72'>
              <label className='mb-1.5 block text-sm font-medium text-text'>{translate('reviews.service')}</label>
              <MySelect
                data={serviceOptions}
                value={selectedServiceId}
                placeholder={translate('reviews.allServices')}
                search={false}
                onChange={(item) => handleServiceChange(item.value as string)}
                style={{ width: '100%' }}
              />
            </div>

            {comments.length > 0 && (
              <div className='flex items-center gap-4'>
                <div className='text-center'>
                  <p className='text-3xl font-extrabold text-text'>{averageRating.toFixed(1)}</p>
                  <StarRating value={averageRating} className='mt-1 justify-center' />
                </div>
                <div className='text-sm text-gray-500'>
                  {translate('reviews.summary.count', {
                    count: comments.length,
                  })}
                </div>
              </div>
            )}
          </div>

          {/* List */}
          <div className='mt-5'>
            {isLoading ? (
              <MyLoading />
            ) : visibleComments.length === 0 ? (
              <MyEmpty
                message={translate('reviews.empty')}
                action={
                  <MyButton variant='primary' onClick={openCommentForm}>
                    {translate('reviews.writeReview')}
                  </MyButton>
                }
              />
            ) : (
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                {pageComments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </div>

          {visibleComments.length > PAGE_SIZE && <MyPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className='mt-6' />}
        </MyCardBody>
      </MyCard>
    </div>
  )
}

export default CommentSection
