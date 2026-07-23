import { SVGProps } from 'react'

import { cn } from '@/utils/tailwind'

type IconProps = SVGProps<SVGSVGElement>

const SparklesIcon = ({ ...props }: IconProps) => {
  return (
    <svg
      className={cn('size-6', props.className)}
      fill='none'
      stroke='currentColor'
      strokeWidth={1.5}
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path d='m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7' />
      <rect x='2' y='4' width='20' height='16' rx='2' />
    </svg>
  )
}

export default SparklesIcon
