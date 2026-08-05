'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import MyImage from '../MyImage'
import { MenuIcon } from '../Icons/Functions/Menu'
import { CloseIcon } from '../Icons/Functions/Close'
import GlobeIcon from '../Icons/Globe'

import { cn } from '@/utils/tailwind'
import { images } from '@/config/images'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import { LANGUAGE_SUPPORT } from '@/zustand/language'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const pathname = usePathname()
  const { translate, lang, setLanguage } = useLanguage()
  const { isMobile } = useModalDrawer()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navItems = [
    { href: '/', label: translate('menu.home') },
    { href: '/pricing', label: translate('menu.priceList') },
    { href: '/blog', label: translate('menu.blog') },
    { href: '/about', label: translate('menu.about') },
    { href: '/track-order', label: translate('menu.tracking') },
    // { href: '/booking', label: translate('menu.booking'), highlight: true },
    { href: '/contact', label: translate('menu.contact') },
  ]

  return (
    <header
      className={cn(
        'w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-border' : 'bg-white'
      )}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 lg:h-20'>
          <Link href='/' className='flex-shrink-0'>
            <div className='relative w-10 h-10 lg:w-12 lg:h-12'>
              <MyImage src={images.favicon} alt='Giặt Ủi Siêu Sạch' fill className='object-contain' sizes='48px' priority />
            </div>
          </Link>

          {!isMobile && (
            <nav className='hidden lg:flex items-center gap-1'>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href ? 'text-primary bg-primary/10' : 'text-text'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <div className='flex items-center gap-2'>
            <div className='relative'>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className='cursor-pointer flex items-center gap-1 px-2 py-2.5 rounded-lg text-sm text-text transition-colors'
                aria-label={translate('language.select')}
              >
                <GlobeIcon className='w-4 h-4' />
                {!isMobile && <span>{lang === LANGUAGE_SUPPORT.VN ? '🇻🇳' : '🇺🇸'}</span>}
              </button>
              {isLangOpen && (
                <div className='absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-border z-50'>
                  <button
                    onClick={() => {
                      setLanguage(LANGUAGE_SUPPORT.VN)
                      setIsLangOpen(false)
                    }}
                    className={cn(
                      'cursor-pointer w-full flex items-center gap-2 px-3 py-2 text-sm rounded-t-lg',
                      lang === LANGUAGE_SUPPORT.VN && 'bg-primary/10 text-primary'
                    )}
                  >
                    <span>🇻🇳</span>
                    <span>{translate('language.vi')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setLanguage(LANGUAGE_SUPPORT.EN)
                      setIsLangOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-b-lg',
                      lang === LANGUAGE_SUPPORT.EN && 'bg-primary/10 text-primary'
                    )}
                  >
                    <span>🇺🇸</span>
                    <span>{translate('language.en')}</span>
                  </button>
                </div>
              )}
            </div>

            {!isMobile && (
              <div className='hidden lg:flex items-center gap-2'>
                <Link href='/login' className='border  border-primary text-primary px-4 py-2.5 text-sm font-medium  rounded-lg transition-colors'>
                  {translate('menu.login')}
                </Link>
                <Link href='/register' className='px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg transition-colors'>
                  {translate('menu.register')}
                </Link>
              </div>
            )}

            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='lg:hidden p-2.5 rounded-lg text-text'
                aria-label='Toggle menu'
              >
                {isMobileMenuOpen ? <CloseIcon className='w-5 h-5' /> : <MenuIcon className='w-5 h-5' />}
              </button>
            )}
          </div>
        </div>
      </div>

      {isMobile && isMobileMenuOpen && (
        <div className='lg:hidden bg-white border-t border-border shadow-lg'>
          <nav className='max-w-7xl mx-auto px-4 py-4 space-y-1'>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block px-4 py-3 rounded-lg text-base font-medium transition-colors',
                  pathname === item.href ? 'text-primary bg-primary/10' : 'text-text'
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className='pt-4 border-t border-border mt-4 space-y-2'>
              <Link href='/login' className='block px-4 py-3 rounded-lg text-base font-medium text-text transition-colors'>
                {translate('menu.login')}
              </Link>
              <Link href='/register' className='block px-4 py-3 rounded-lg text-base font-medium text-white bg-primary transition-colors text-center'>
                {translate('menu.register')}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
