import type { Metadata } from 'next'

import AdminShell from './AdminShell'

// Admin is client-only: never statically prerendered/cached
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
