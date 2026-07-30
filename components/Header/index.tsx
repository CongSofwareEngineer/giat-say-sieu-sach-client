'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

import MyImage from '../MyImage'

import { cn } from '@/utils/tailwind'
import { images } from '@/config/images'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        ' w-full flex justify-between items-center z-10 fixed inset-0 h-16  transition-all duration-500',
        isScrolled
          ? 'light:bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl border-b border-gray-200/20 dark!border-gray-800/30'
          : 'light:bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
      )}
    >
      <div className='w-full max-w-[1550px] px-5 m-auto flex items-center gap-3 h-full '>
        <div className='h-full relative '>
          <Link href={'/'}>
            <MyImage sizes='100px' fill alt='logo-giat-say-sieu-sach' className='!relative !w-auto !h-full' src={images.favicon} />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
