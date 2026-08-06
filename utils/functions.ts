import { images } from '@/config/images'
import { COLORS } from '@/constants/app'

export const viewExternal = (url: string) => {
  window.open(url, '_blank')
}

export const lowerCase = (value?: string) => {
  return value ? value.toLowerCase() : value
}

export const upperCase = (value?: string) => {
  return value ? value.toUpperCase() : value
}

export const copyToClipboard = async (text: any) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)

    return
  }

  const textarea = document.createElement('textarea')

  textarea.value = text

  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'

  document.body.appendChild(textarea)

  textarea.focus()
  textarea.select()

  document.execCommand('copy')

  textarea.remove()
}

export function sanitizeUrl(url: string) {
  if (!url) return ''

  return url.replace(/([^:]\/)\/+/g, '$1')
}

export const scrollTop = () => {
  if (window) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

export const detectImg = (src?: any, maxWidthScale = 0) => {
  try {
    if (!src) {
      return images.icons.avatarDefault
    }

    if (src?.startsWith('data:image') || src?.startsWith('/images')) {
      return src
    }

    if (src?.startsWith('https')) {
      return src
    }
    if (maxWidthScale > 0) {
      return `https://res.cloudinary.com/tc-store/image/upload/c_scale,w_${maxWidthScale}/v1722158972/${src}`
    }

    return `https://res.cloudinary.com/tc-store/image/upload/v1722158972/${src}`
  } catch {
    return images.icons.avatarDefault
  }
}

export const ellipsisText = (text: string, prefixLength = 13, suffixLength = 4): string => {
  text = text || ''

  return `${text.substr(0, prefixLength)}...${text.substr(text.length - suffixLength, suffixLength)}`
}

export const getColorStatus = (key: string) => {
  // switch (key) {
  //   case FILTER_BILL.Processing:
  //     return COLORS.red
  //   case FILTER_BILL.Delivering:
  //     return COLOR.blue1
  //   default:
  //     return COLOR.green1
  // }
}

export const getBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.readAsDataURL(file)
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type,
        base64: reader.result,
      })
    }
    reader.onerror = (error) => {
      reject(error)
    }
  })
}
