import { useLayoutEffect, useState } from 'react'

const useMedia = (maxWidth = 768) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useLayoutEffect(() => {
    let mounted = true
    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const onChange = () => {
      if (!mounted) {
        return
      }
      setIsMobile(!!mql.matches)
    }

    mql.addEventListener('change', onChange)
    setIsMobile(mql.matches)

    return () => {
      mounted = false
      mql.removeEventListener('change', onChange)
    }
  }, [maxWidth])

  useLayoutEffect(() => {
    setIsClient(true)
  }, [])

  return {
    isMobile: isMobile || false,
    isClient,
  }
}

export default useMedia
