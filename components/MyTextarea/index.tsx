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
          'w-full px-4 py-2.5 rounded-lg border bg-white text-text placeholder-gray-500 min-h-[100px] resize-y',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30',
          error ? 'border-red-500 focus:ring-red-500/30' : 'border-border focus:border-primary',
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
