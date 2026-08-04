'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { MenuIcon } from '@/components/Icons/Functions/Menu'
import { CloseIcon } from '@/components/Icons/Functions/Close'
import MyImage from '@/components/MyImage'
import { images } from '@/config/images'
import useLanguage from '@/hooks/useLanguage'
import { cn } from '@/utils/tailwind'

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { translate } = useLanguage()

  const menuItems = [
    { href: '/admin', label: translate('admin.sidebar.dashboard'), icon: '📊' },
    { href: '/admin/don-hang', label: translate('admin.sidebar.orders'), icon: '📦' },
    { href: '/admin/khach-hang', label: translate('admin.sidebar.customers'), icon: '👥' },
    { href: '/admin/blog', label: translate('admin.sidebar.blog'), icon: '📝' },
    { href: '/admin/banner', label: translate('admin.sidebar.banner'), icon: '🖼️' },
    { href: '/admin/bang-gia', label: translate('admin.sidebar.prices'), icon: '💰' },
  ]

  return (
    <div className='min-h-screen bg-background flex'>
      {/* Sidebar - Desktop */}
      <aside className='hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-border'>
        <div className='flex items-center gap-2 px-6 h-16 border-b border-border'>
          <div className='relative w-8 h-8'>
            <MyImage src={images.favicon} alt='Logo' fill sizes='32px' className='!relative !w-auto !h-full' />
          </div>
          <span className='font-bold text-text'>Admin</span>
        </div>
        <nav className='flex-1 px-4 py-4 space-y-1 overflow-y-auto'>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href ? 'bg-primary/10 text-primary' : 'text-text'
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className='lg:hidden fixed inset-0 z-50'>
          <div className='fixed inset-0 bg-black/50' onClick={() => setIsSidebarOpen(false)} />
          <aside className='fixed inset-y-0 left-0 w-64 bg-white border-r border-border z-50'>
            <div className='flex items-center justify-between px-6 h-16 border-b border-border'>
              <div className='flex items-center gap-2'>
                <div className='relative w-8 h-8'>
                  <MyImage src={images.favicon} alt='Logo' fill sizes='32px' className='!relative !w-auto !h-full' />
                </div>
                <span className='font-bold text-text'>Admin</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)}>
                <CloseIcon className='w-5 h-5 text-text' />
              </button>
            </div>
            <nav className='px-4 py-4 space-y-1'>
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href ? 'bg-primary/10 text-primary' : 'text-text'
                  )}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className='flex-1 lg:ml-64'>
        {/* Topbar */}
        <header className='sticky top-0 z-40 h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-6'>
          <button onClick={() => setIsSidebarOpen(true)} className='lg:hidden p-2 rounded-lg'>
            <MenuIcon className='w-5 h-5 text-text' />
          </button>
          <div className='flex items-center gap-4'>
            <Link href='/' className='text-sm text-gray-500'>
              ← Về trang chủ
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className='p-4 lg:p-6'>{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
