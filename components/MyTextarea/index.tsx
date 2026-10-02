'use client'

import { TextareaHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/utils/tailwind'

export type MyTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  required?: boolean
}

const MyTextarea = forwardRef<HTMLTextAreaElement, MyTextareaProps>(({ label, error, required, className, id, ...props }, ref) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className='w-full'>
      {label && (
        <label htmlFor={textareaId} className='block text-sm font-medium text-text mb-1.5'>
          {label}
          {required && <span className='text-red-600 ml-1'>*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          'min-h-[100px] w-full resize-y rounded-xl border bg-white px-4 py-3 text-text placeholder-gray-400 shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
          'transition-[border-color,box-shadow] duration-200 hover:border-primary/40 focus:outline-none focus:ring-4',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-border focus:border-primary focus:ring-primary/10',
          className
        )}
        {...props}
      />
      {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
    </div>
  )
})

MyTextarea.displayName = 'MyTextarea'

export default MyTextarea
