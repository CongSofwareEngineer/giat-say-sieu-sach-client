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
import { removeCookie } from '@/utils/cookie'
import { COOKIES_KEY } from '@/constants/cookies'

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
    removeCookie(COOKIES_KEY.accessToken)
    removeCookie(COOKIES_KEY.refreshToken)
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
        isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_-16px_rgba(10,111,135,0.25)] border-b border-border/60' : 'bg-white border-b border-transparent'
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
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    pathname === item.href ? 'bg-primary/10 font-semibold text-primary' : 'text-text hover:bg-primary/5 hover:text-primary'
                  )}
                >
                  {item.label}
                </Link>
              ))}

              <div className='relative'>
                <button
                  onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                  className={cn(
                    'flex cursor-pointer items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    pathname === '/reviews' || pathname === '/blog' || pathname === '/about'
                      ? 'bg-primary/10 font-semibold text-primary'
                      : 'text-text hover:bg-primary/5 hover:text-primary'
                  )}
                  aria-label={translate('menu.more')}
                >
                  {translate('menu.more')}
                  <ArrowDownIcon className={cn('h-4 w-4 transition-transform duration-300', isMoreMenuOpen && 'rotate-180')} strokeWidth={2} />
                </button>

                {isMoreMenuOpen && (
                  <div className='absolute left-0 top-full z-50 mt-2 w-52 rounded-2xl border border-border/80 bg-white/95 p-1.5 shadow-[0_20px_48px_-12px_rgba(10,111,135,0.25),0_4px_12px_-4px_rgba(16,24,40,0.08)] backdrop-blur-xl animation-fade-in'>
                    {dropdownNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          pathname === item.href ? 'bg-primary/10 text-primary' : 'text-text hover:bg-primary/5 hover:text-primary'
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
                className='flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-2 text-sm text-text transition-colors hover:bg-primary/5 hover:text-primary'
                aria-label={translate('language.select')}
              >
                <GlobeIcon className='w-5 h-5' />
                {!isMobile && <span>{lang === LANGUAGE_SUPPORT.VN ? '🇻🇳' : '🇺🇸'}</span>}
              </button>
              {isLangOpen && (
                <div className='absolute right-0 top-full z-50 mt-2 w-44 rounded-2xl border border-border/80 bg-white/95 p-1.5 shadow-[0_20px_48px_-12px_rgba(10,111,135,0.25),0_4px_12px_-4px_rgba(16,24,40,0.08)] backdrop-blur-xl animation-fade-in'>
                  <button
                    onClick={() => {
                      setLanguage(LANGUAGE_SUPPORT.VN)
                      setIsLangOpen(false)
                    }}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-primary/5',
                      lang === LANGUAGE_SUPPORT.VN && 'bg-primary/10 font-semibold text-primary'
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
                      'flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-primary/5',
                      lang === LANGUAGE_SUPPORT.EN && 'bg-primary/10 font-semibold text-primary'
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
                  className='flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white p-1 pr-3 transition-colors hover:border-primary/40 hover:bg-primary/5'
                >
                  <div className='relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary'>
                    {user?.avatar?.url ? (
                      <MyImage src={user.avatar.url} alt={user?.name || translate('common.avatar')} fill sizes='36px' className='object-cover' />
                    ) : (
                      <UserCircleIcon className='h-9 w-9 text-white' />
                    )}
                  </div>
                  <span className='max-w-[120px] truncate text-sm font-medium text-text'>{user?.name || user?.phone}</span>
                </button>

                {isUserMenuOpen && (
                  <div className='absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-border/80 bg-white/95 p-1.5 shadow-[0_20px_48px_-12px_rgba(10,111,135,0.25),0_4px_12px_-4px_rgba(16,24,40,0.08)] backdrop-blur-xl animation-fade-in'>
                    <div className='mb-1 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 px-3 py-3'>
                      <p className='truncate text-sm font-semibold text-text'>{user?.name || translate('menu.profile')}</p>
                      <p className='truncate text-xs text-gray-500'>{user?.phone}</p>
                    </div>
                    <div>
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
                <Link
                  href='/login'
                  className='rounded-full px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5'
                >
                  {translate('menu.login')}
                </Link>
                <Link
                  href='/register'
                  className='rounded-full bg-gradient-to-br from-primary to-secondary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(10,111,135,0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(10,111,135,0.7)]'
                >
                  {translate('menu.register')}
                </Link>
              </div>
            )}

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className='lg:hidden rounded-full p-2.5 text-text transition-colors hover:bg-primary/5' aria-label='Toggle menu'>
              {isMobileMenuOpen ? <CloseIcon className='w-6 h-6' /> : <MenuIcon className='w-6 h-6' />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className='lg:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border/60 bg-white/95 shadow-[0_24px_48px_-16px_rgba(10,111,135,0.25)] backdrop-blur-xl animation-fade-in'>
          <nav className='max-w-7xl mx-auto px-4 py-4 space-y-1'>
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block rounded-xl px-4 py-3 text-base font-medium transition-colors',
                  pathname === item.href ? 'bg-primary/10 font-semibold text-primary' : 'text-text active:bg-primary/5'
                )}
              >
                {item.label}
              </Link>
            ))}

            <div className='pt-2'>
              <p className='px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400'>{translate('menu.more')}</p>
              {dropdownNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block rounded-xl px-4 py-3 text-base font-medium transition-colors',
                    pathname === item.href ? 'bg-primary/10 font-semibold text-primary' : 'text-text active:bg-primary/5'
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
                <Link
                  href='/login'
                  className='block rounded-full border border-primary/30 px-4 py-3 text-center text-base font-semibold text-primary transition-colors active:bg-primary/5'
                >
                  {translate('menu.login')}
                </Link>
                <Link
                  href='/register'
                  className='block rounded-full bg-gradient-to-br from-primary to-secondary px-4 py-3 text-center text-base font-semibold text-white shadow-[0_8px_20px_-8px_rgba(10,111,135,0.6)]'
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
