import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

import { cn } from '@/utils/tailwind'
import { images } from '@/config/images'

type Props = {
  noAnimation?: boolean
} & Omit<ImageProps, 'alt' | 'src'> & {
    alt?: string
    src?: string
  }
const MyImage = ({ noAnimation = false, src, alt = 'thay-hong-toan', ...props }: Props) => {
  // const [ref, inView] = useInView({ triggerOnce: true })

  const [loaded, setLoaded] = useState(false)

  return (
    <Image
      // ref={ref}
      fill
      alt={alt}
      draggable={false}
      loading='lazy'
      priority={false}
      // sizes='100vw'
      // sizes='100vw'
      {...props}
      className={cn('relative! overflow-hidden', props?.className)}
      style={{
        filter: loaded || noAnimation ? 'none' : 'blur(20px)',
        transition: 'filter 0.08s ease-out',
        ...props.style,
      }}
      onError={({ currentTarget }) => {
        currentTarget.onerror = null
        currentTarget.src = images.icons.avatarDefault
      }}
      onLoad={() => {
        setLoaded(true)
      }}
      src={
        src || images.icons.avatarDefault
        // inView
        //   ? src || images.icons.avatarDefault
        //   : 'https://res.cloudinary.com/tc-store/image/upload/w_100/v1734883048/tc-store/bgWhiteBlur_yxlqi7.png'
      }
      // src={src || images.icons.avatarDefault}
    />
  )
}

export default MyImage
