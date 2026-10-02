'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/utils/tailwind'

export type MyButtonVariant = 'default' | 'primary' | 'warning' | 'error' | 'outline' | 'ghost'
export type MyButtonSize = 'default' | 'small' | 'large' | 'sm'

export type MyButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: MyButtonVariant
  size?: MyButtonSize
  loading?: boolean
  isActive?: boolean
  children?: ReactNode
}

const variantStyles: Record<MyButtonVariant, string> = {
  default:
    'bg-gradient-to-br from-primary to-secondary text-primary-content shadow-[0_8px_24px_-6px_rgba(10,111,135,0.45)] hover:shadow-[0_12px_28px_-6px_rgba(10,111,135,0.55)]',
  primary: 'bg-primary text-primary-content shadow-[0_6px_20px_-8px_rgba(10,111,135,0.6)] hover:bg-primary/90',
  warning: 'bg-amber-400 text-gray-900 shadow-[0_6px_20px_-8px_rgba(245,158,11,0.6)] hover:bg-amber-300',
  error: 'bg-red-600 text-white shadow-[0_6px_20px_-8px_rgba(220,38,38,0.6)] hover:bg-red-500',
  outline: 'bg-white/60 border border-primary/30 text-primary backdrop-blur hover:border-primary hover:bg-primary/5',
  ghost: 'bg-transparent text-text hover:bg-primary/10',
}

const sizeStyles: Record<MyButtonSize, string> = {
  default: 'px-4 py-2.5 text-sm',
  small: 'px-2 py-1 text-xs',
  sm: 'px-2 py-1 text-sm',
  large: 'px-6 py-3 text-base',
}

export default function MyButton({ variant = 'default', size = 'default', loading = false, isActive = false, disabled, className, children, ...rest }: MyButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-pressed={isActive || undefined}
      className={cn(
        'relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold outline-none transition-all duration-200',
        'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-primary/20',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
        variantStyles[variant],
        sizeStyles[size],
        isActive && 'bg-primary/20 text-primary ring-2 ring-primary/40',
        className
      )}
      {...rest}
    >
      {loading && (
        <div className={cn('absolute rounded-full flex w-full h-full justify-center items-center', variantStyles[variant])}>
          <svg className='mr-2 h-4 w-4 animate-spin' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
          </svg>
        </div>
      )}
      {children}
    </button>
  )
}
