import Image, { ImageProps } from 'next/image'

import { cn } from '@/utils/tailwind'
import { images } from '@/config/images'

type Props = {} & Omit<ImageProps, 'alt' | 'src'> & {
    alt?: string
    src?: string
  }

const MyImage = ({ src, alt = '', loading, priority = false, preload = false, ...props }: Props) => {
  const isPreloaded = priority || preload

  return (
    <Image
      fill
      alt={alt}
      draggable={false}
      loading={isPreloaded ? 'eager' : loading || 'lazy'}
      priority={priority}
      placeholder='blur'
      preload={preload}
      {...props}
      className={cn('relative! overflow-hidden', props?.className)}
      style={props?.style}
      onError={({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src = images.icons.avatarDefault
      }}
      src={src || images.icons.avatarDefault}
      blurDataURL='https://res.cloudinary.com/tc-store/image/upload/w_100/v1734883048/tc-store/bgWhiteBlur_yxlqi7.png'
    />
  )
}

export default MyImage
