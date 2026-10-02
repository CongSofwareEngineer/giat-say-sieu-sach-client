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
    <nav
      className={cn('mx-auto flex w-fit items-center justify-center gap-1 rounded-full border border-border bg-white/80 p-1.5 shadow-card backdrop-blur', className)}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className='h-9 rounded-full px-4 text-sm font-medium text-text transition-colors hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text'
      >
        {translate('common.back')}
      </button>

      {getPageNumbers().map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? 'page' : undefined}
            className={cn(
              'size-9 rounded-full text-sm font-semibold transition-all duration-200',
              currentPage === page
                ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-[0_6px_16px_-6px_rgba(10,111,135,0.6)]'
                : 'text-text hover:bg-primary/5 hover:text-primary'
            )}
          >
            {page}
          </button>
        ) : (
          <span key={index} className='px-1.5 text-gray-400'>
            {page}
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='h-9 rounded-full px-4 text-sm font-medium text-text transition-colors hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-text'
      >
        {translate('common.next')}
      </button>
    </nav>
  )
}

export default MyPagination
