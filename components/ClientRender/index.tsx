import { PropsWithChildren } from 'react'
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

const ClientRender = ({ children }: PropsWithChildren) => {
  return (
    <>
      <main className='w-full min-h-[100dvh-62px]'>{children}</main>
    </>
  )
}

export default ClientRender
