'use client'

import { ReactNode } from 'react'

import MyLoading from '@/components/MyLoading'
import MyEmpty from '@/components/MyEmpty'
import MyPagination, { MyPaginationProps } from '@/components/MyPagination'
import { cn } from '@/utils/tailwind'

export type MyTableAlign = 'left' | 'center' | 'right'

export type MyTableColumn<T> = {
  key: string
  title: ReactNode
  align?: MyTableAlign
  // Extra classes for the body cell
  className?: string
  // Extra classes for the header cell
  headerClassName?: string
  render: (record: T, index: number) => ReactNode
}

export type MyTableProps<T> = {
  columns: MyTableColumn<T>[]
  data: T[]
  rowKey: (record: T) => string
  loading?: boolean
  emptyMessage?: string
  pagination?: Omit<MyPaginationProps, 'className'>
  className?: string
}

const ALIGN_CLASS: Record<MyTableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const MyTable = <T,>({ columns, data, rowKey, loading, emptyMessage, pagination, className }: MyTableProps<T>) => {
  if (loading) return <MyLoading />

  if (data.length === 0) return <MyEmpty message={emptyMessage} />

  return (
    <div className={className}>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-border bg-gray-50/80'>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'whitespace-nowrap py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500',
                    ALIGN_CLASS[column.align ?? 'left'],
                    column.headerClassName
                  )}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((record, index) => (
              <tr key={rowKey(record)} className='border-b border-border align-middle transition-colors hover:bg-primary/[0.03]'>
                {columns.map((column) => (
                  <td key={column.key} className={cn('py-3 px-4', ALIGN_CLASS[column.align ?? 'left'], column.className)}>
                    {column.render(record, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && <MyPagination {...pagination} className='mt-4' />}
    </div>
  )
}

export default MyTable
