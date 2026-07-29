'use client'

import { ReactNode, useLayoutEffect } from 'react'

// import Header from '../Header'

// Mở rộng Type cho Window toàn cục của TS
declare global {
  interface Window {
    next?: {
      version?: number
      [key: string]: any
    }
  }
}

if (typeof window !== 'undefined') {
  try {
    window.next = window.next || {}
    window.next.version = 1000
  } catch {}
}

function ClientRender({ children }: { children: ReactNode }) {
  return (
    <>
      {/* <Header /> */}
      <main className='w-full h-full min-h-[calc(100dvh-64px)]'>{children}</main>
    </>
  )
}

export default ClientRender
