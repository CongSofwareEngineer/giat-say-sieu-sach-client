import { SVGProps } from 'react'

import { cn } from '@/utils/tailwind'

type IconProps = SVGProps<SVGSVGElement>

const ServerIcon = ({ ...props }: IconProps) => {
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
      <rect width='20' height='8' x='2' y='2' rx='2' ry='2' />
      <rect width='20' height='8' x='2' y='14' rx='2' ry='2' />
      <line x1='6' x2='6.01' y1='6' y2='6' />
      <line x1='6' x2='6.01' y1='18' y2='18' />
    </svg>
  )
}

export default ServerIcon
