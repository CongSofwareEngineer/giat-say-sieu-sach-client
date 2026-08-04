'use client'

import { cn } from '@/utils/tailwind'
import useLanguage from '@/hooks/useLanguage'

export type MyPaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

const MyPagination = ({ currentPage, totalPages, onPageChange, className }: MyPaginationProps) => {
  const { translate } = useLanguage()

  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showEllipsisStart = currentPage > 3
    const showEllipsisEnd = currentPage < totalPages - 2

    if (showEllipsisStart) {
      pages.push(1)
      pages.push('...')
    }

    const start = Math.max(1, showEllipsisStart ? currentPage - 1 : 1)
    const end = Math.min(totalPages, showEllipsisEnd ? currentPage + 1 : totalPages)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (showEllipsisEnd) {
      pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className='px-3 py-2 rounded-lg text-sm font-medium text-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
      >
        {translate('common.back')}
      </button>

      {getPageNumbers().map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={cn(
              'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
              currentPage === page ? 'bg-primary text-white' : 'text-text hover:bg-gray-100'
            )}
          >
            {page}
          </button>
        ) : (
          <span key={index} className='px-2 text-gray-400'>
            {page}
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='px-3 py-2 rounded-lg text-sm font-medium text-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
      >
        {translate('common.next')}
      </button>
    </div>
  )
}

export default MyPagination
