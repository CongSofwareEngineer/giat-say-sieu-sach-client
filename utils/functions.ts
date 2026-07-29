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
