'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import MyImage from '../MyImage'
import { MenuIcon } from '../Icons/Functions/Menu'
import { CloseIcon } from '../Icons/Functions/Close'
import { LogOutIcon } from '../Icons/Functions/LogOut'
import { SettingIcon } from '../Icons/Functions/Setting'
import { UserCircleIcon } from '../Icons/UserCircle'
import GlobeIcon from '../Icons/Globe'
import { ArrowDownIcon } from '../Icons/ArrowDown'

import { cn } from '@/utils/tailwind'
import { images } from '@/config/images'
import useLanguage from '@/hooks/useLanguage'
import useModalDrawer from '@/hooks/useModalDrawer'
import useUser from '@/hooks/useUser'
import { LANGUAGE_SUPPORT } from '@/zustand/language'
import { SITE_CONFIG } from '@/constants/app'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { translate, lang, setLanguage } = useLanguage()
  const { isMobile } = useModalDrawer()
  const { user, isLogin, hasHydrated, logout } = useUser()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsLangOpen(false)
    setIsUserMenuOpen(false)
    setIsMoreMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    logout()
    router.replace('/')
  }

  const mainNavItems = [
    { href: '/', label: translate('menu.home') },
    { href: '/pricing', label: translate('menu.priceList') },
    { href: '/contact', label: translate('menu.contact') },
    { href: '/track-order', label: translate('menu.tracking') },
  ]

  const dropdownNavItems = [
    { href: '/reviews', label: translate('menu.reviews') },
    { href: '/blog', label: translate('menu.blog') },
    { href: '/about', label: translate('menu.about') },
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
          <div className='flex items-center gap-2'>
            <Link href='/' className='flex-shrink-0'>
              <div className='relative w-10 overflow-hidden rounded-[6px] h-10 lg:w-12 lg:h-12'>
                <MyImage src={images.favicon} alt='Giặt Ủi Siêu Sạch' fill className='object-contain' sizes='48px' priority />
              </div>
            </Link>
            <div>
              <div className='font-bold text-[14px]'>Giặt Ủi</div>
              <div className='font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>Siêu Sạch</div>
            </div>
          </div>

          {!isMobile && (
            <nav className='hidden md:flex items-center gap-1'>
              {mainNavItems.map((item) => (
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

              <div className='relative'>
                <button
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === '/reviews' || pathname === '/blog' || pathname === '/about'
                      ? 'text-primary bg-primary/10'
                      : 'text-text hover:bg-gray-100'
                  )}
                  aria-label={translate('menu.more')}
                >
                  {translate('menu.more')}
                  <ArrowDownIcon className='w-4 h-4' />
                </button>

                {isMoreMenuOpen && (
                  <div className='absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-border z-50 py-1'>
                    {dropdownNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'block px-4 py-2 text-sm font-medium transition-colors',
                          pathname === item.href ? 'text-primary bg-primary/10' : 'text-text hover:bg-gray-50'
                        )}
                        onClick={() => setIsMoreMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          )}

          <div className='flex items-center gap-2'>
            <div className='relative'>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className='cursor-pointer flex items-center gap-1 px-2 py-2.5 rounded-lg text-sm text-text transition-colors'
                aria-label={translate('language.select')}
              >
                <GlobeIcon className='w-5 h-5' />
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

            {!isMobile && hasHydrated && isLogin && (
              <div className='relative hidden md:block'>
                <button
                  type='button'
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className='flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-gray-100'
                >
                  <div className='relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary'>
                    {user?.avatar ? (
                      <MyImage src={user.avatar} alt={user?.name || 'avatar'} fill sizes='36px' className='object-cover' />
                    ) : (
                      <UserCircleIcon className='h-9 w-9 text-white' />
                    )}
                  </div>
                  <span className='max-w-[120px] truncate text-sm font-medium text-text'>{user?.name || user?.phone}</span>
                </button>

                {isUserMenuOpen && (
                  <div className='absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-white shadow-lg z-50'>
                    <div className='border-b border-border px-4 py-3'>
                      <p className='truncate text-sm font-semibold text-text'>{user?.name || translate('menu.profile')}</p>
                      <p className='truncate text-xs text-gray-500'>{user?.phone}</p>
                    </div>
                    <div className='p-1.5'>
                      <Link
                        href='/profile'
                        className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-primary/5 hover:text-primary'
                      >
                        <UserCircleIcon className='h-5 w-5' />
                        {translate('menu.profile')}
                      </Link>
                      {user?.isAdmin && (
                        <Link
                          href='/admin'
                          className='flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text transition-colors hover:bg-primary/5 hover:text-primary'
                        >
                          <SettingIcon className='h-5 w-5' />
                          {translate('menu.admin')}
                        </Link>
                      )}
                      <button
                        type='button'
                        onClick={handleLogout}
                        className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50'
                      >
                        <LogOutIcon className='h-5 w-5' />
                        {translate('menu.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isMobile && (!hasHydrated || !isLogin) && (
              <div className='hidden lg:flex items-center gap-2'>
                <Link href='/login' className='border  border-primary text-primary px-4 py-2.5 text-sm font-medium  rounded-lg transition-colors'>
                  {translate('menu.login')}
                </Link>
                <Link href='/register' className='px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg transition-colors'>
                  {translate('menu.register')}
                </Link>
              </div>
            )}

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className='lg:hidden p-2.5 rounded-lg text-text' aria-label='Toggle menu'>
              {isMobileMenuOpen ? <CloseIcon className='w-6 h-6' /> : <MenuIcon className='w-6 h-6' />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className='lg:hidden bg-white border-t border-border shadow-lg'>
          <nav className='max-w-7xl mx-auto px-4 py-4 space-y-1'>
            {mainNavItems.map((item) => (
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

            <div className='pt-2'>
              <p className='px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider'>{translate('menu.more')}</p>
              {dropdownNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-4 py-3 rounded-lg text-base font-medium transition-colors ml-4',
                    pathname === item.href ? 'text-primary bg-primary/10' : 'text-text'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {hasHydrated && isLogin ? (
              <div className='pt-4 border-t border-border mt-4 space-y-2'>
                <Link href='/profile' className='flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-text transition-colors'>
                  <UserCircleIcon className='h-5 w-5' />
                  {translate('menu.profile')}
                </Link>
                {user?.isAdmin && (
                  <Link href='/admin' className='flex items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-text transition-colors'>
                    <SettingIcon className='h-5 w-5' />
                    {translate('menu.admin')}
                  </Link>
                )}
                <button
                  type='button'
                  onClick={handleLogout}
                  className='flex w-full items-center gap-2 px-4 py-3 rounded-lg text-base font-medium text-red-600 transition-colors'
                >
                  <LogOutIcon className='h-5 w-5' />
                  {translate('menu.logout')}
                </button>
              </div>
            ) : (
              <div className='pt-4 border-t border-border mt-4 space-y-2'>
                <Link href='/login' className='block px-4 py-3 rounded-lg text-base font-medium text-text transition-colors'>
                  {translate('menu.login')}
                </Link>
                <Link
                  href='/register'
                  className='block px-4 py-3 rounded-lg text-base font-medium text-white bg-primary transition-colors text-center'
                >
                  {translate('menu.register')}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
