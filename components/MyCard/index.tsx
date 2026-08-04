import { ReactNode } from 'react'

import { cn } from '@/utils/tailwind'

export type MyCardProps = {
  children: ReactNode
  className?: string
  onClick?: () => void
}

const MyCard = ({ children, className, onClick }: MyCardProps) => {
  return (
    <div onClick={onClick} className={cn('bg-card rounded-2xl border border-border shadow-card', onClick && 'cursor-pointer', className)}>
      {children}
    </div>
  )
}

export const MyCardBody = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <div className={cn('p-4 lg:p-6', className)}>{children}</div>
}

export const MyCardHeader = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <div className={cn('px-4 lg:px-6 py-4 border-b border-border', className)}>{children}</div>
}

export const MyCardFooter = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <div className={cn('px-4 lg:px-6 py-4 border-t border-border', className)}>{children}</div>
}

export default MyCard
