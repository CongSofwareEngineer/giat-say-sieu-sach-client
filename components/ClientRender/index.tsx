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
  return <>{children}</>
}

export default ClientRender
