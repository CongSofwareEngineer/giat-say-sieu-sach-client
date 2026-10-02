import { ReactNode } from 'react'

import { cn } from '@/utils/tailwind'

export type MyBadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

export type MyBadgeProps = {
  variant?: MyBadgeVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<MyBadgeVariant, string> = {
  default: 'bg-gray-50 text-gray-700 ring-gray-500/15',
  primary: 'bg-primary/5 text-primary ring-primary/20',
  secondary: 'bg-secondary/5 text-secondary ring-secondary/20',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  error: 'bg-red-50 text-red-700 ring-red-600/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
}

const MyBadge = ({ variant = 'default', children, className }: MyBadgeProps) => {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', variantStyles[variant], className)}>
      {children}
    </span>
  )
}

export default MyBadge
