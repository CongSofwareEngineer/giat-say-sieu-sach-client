'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { MenuIcon } from '@/components/Icons/Functions/Menu'
import { CloseIcon } from '@/components/Icons/Functions/Close'
import { HomeIcon } from '@/components/Icons/Functions/Home'
import { LogOutIcon } from '@/components/Icons/Functions/LogOut'
import InboxIcon from '@/components/Icons/Inbox'
import { UserCircleIcon } from '@/components/Icons/UserCircle'
import { PaymentIcon } from '@/components/Icons/Payment'
import ChatBubbleIcon from '@/components/Icons/ChatBubble'
import { ContactIcon } from '@/components/Icons/Contact'
import MyImage from '@/components/MyImage'
import { images } from '@/config/images'
import useLanguage from '@/hooks/useLanguage'
import useUser from '@/hooks/useUser'
import { cn } from '@/utils/tailwind'

type MenuItem = {
  href: string
  label: string
  icon: React.ElementType
}

const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { translate } = useLanguage()
  const { user, hasHydrated, logout } = useUser()

  // Render nothing until hydration confirms the user is an admin
  useEffect(() => {
    if (hasHydrated && !user?.isAdmin) {
      router.replace('/')
    }
  }, [hasHydrated, user?.isAdmin, router])

  if (!hasHydrated || !user?.isAdmin) {
    return null
  }

  const menuItems: MenuItem[] = [
    { href: '/admin', label: translate('admin.sidebar.dashboard'), icon: HomeIcon },
    { href: '/admin/orders', label: translate('admin.sidebar.orders'), icon: InboxIcon },
    { href: '/admin/customers', label: translate('admin.sidebar.customers'), icon: UserCircleIcon },
    { href: '/admin/pricing', label: translate('admin.sidebar.prices'), icon: PaymentIcon },
    { href: '/admin/comments', label: translate('admin.sidebar.comments'), icon: ChatBubbleIcon },
    { href: '/admin/contact', label: translate('admin.sidebar.contacts'), icon: ContactIcon },
  ]

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href))

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className='flex h-16 items-center gap-3 border-b border-border px-6'>
        <div className='relative h-9 w-9'>
          <MyImage src={images.favicon} alt='Logo' fill sizes='36px' className='!relative !w-auto !h-full' />
        </div>
        <div className='leading-tight'>
          <p className='font-bold text-text'>{translate('footer.about')}</p>
          <p className='text-xs text-gray-500'>Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-1 space-y-1 overflow-y-auto px-4 py-4'>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-text hover:bg-primary/5'
            )}
          >
            <item.icon className='h-5 w-5' />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className='border-t border-border p-4'>
        <button
          type='button'
          onClick={() => {
            logout()
            router.replace('/')
          }}
          className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50'
        >
          <LogOutIcon className='h-5 w-5' />
          <span>{translate('admin.sidebar.logoutAdmin')}</span>
        </button>
      </div>
    </>
  )

  return (
    <div className='flex min-h-screen bg-background'>
      {/* Sidebar - Desktop */}
      <aside className='fixed inset-y-0 hidden w-64 flex-col border-r border-border bg-white lg:flex'>{sidebarContent}</aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <div className='fixed inset-0 bg-black/50' onClick={() => setIsSidebarOpen(false)} />
          <aside className='fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white'>
            <div className='flex items-center justify-end p-3'>
              <button type='button' onClick={() => setIsSidebarOpen(false)} aria-label='Close menu'>
                <CloseIcon className='h-5 w-5 text-text' />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className='flex-1 lg:ml-64'>
        {/* Topbar */}
        <header className='sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-white px-4 lg:px-6'>
          <button type='button' onClick={() => setIsSidebarOpen(true)} className='rounded-lg p-2 lg:hidden' aria-label='Open menu'>
            <MenuIcon className='h-5 w-5 text-text' />
          </button>
          <Link href='/' className='hidden text-sm text-gray-500 hover:text-primary sm:block'>
            {translate('admin.topbar.backHome')}
          </Link>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-bold text-white'>
              {translate('admin.topbar.name').charAt(0)}
            </div>
            <div className='leading-tight'>
              <p className='text-sm font-semibold text-text'>{translate('admin.topbar.name')}</p>
              <p className='text-xs text-gray-500'>{translate('admin.topbar.role')}</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className='p-4 lg:p-6'>{children}</main>
      </div>
    </div>
  )
}

export default AdminShell
