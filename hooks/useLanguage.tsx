import React from 'react'

import { LANGUAGE_SUPPORT, language as languageZustand, PATH_LANGUAGE, TYPE_LANGUAGE } from '@/zustand/language'

const useLanguage = () => {
  const { language, setLanguage } = languageZustand((state) => state)

  const translate = (
    key?: PATH_LANGUAGE<TYPE_LANGUAGE>,
    variables?: Record<string, string | number | React.ReactNode | ((value: string | number) => React.ReactNode)>,
    defaultMessage: string = ''
  ): any => {
    try {
      const arrKey = key!.split('.')
      let raw: any = ''

      arrKey.forEach((e) => {
        if (!raw) {
          raw = language?.messages[e]
        } else {
          raw = raw[e]
        }
      })

      let isCustomFunction = false

      if (variables && Object.keys(variables).length > 0) {
        Object.keys(variables).forEach((key) => {
          if (typeof variables[key] === 'string' || typeof variables[key] === 'number') {
            raw = raw.replace(new RegExp(`{${key}}`, 'g'), variables[key as keyof typeof variables])
          }
          if (typeof variables[key] === 'function') {
            isCustomFunction = true
          }
        })
      }

      if (isCustomFunction) {
        const tagRegex = /<(\w+)>(.*?)<\/\1>/g
        const parts: (string | React.ReactNode)[] = []

        let lastIndex = 0
        let match: RegExpExecArray | null

        while ((match = tagRegex.exec(raw!)) !== null) {
          const [fullMatch, tagName, innerText] = match
          const start = match.index
          const end = tagRegex.lastIndex

          // Push text trước tag
          if (start > lastIndex) {
            parts.push(raw!.slice(lastIndex, start))
          }

          // Nếu có handler cho tag, dùng nó
          if (variables?.[tagName]) {
            const render = variables?.[tagName]

            if (typeof render === 'function') {
              parts.push(render(innerText))
            } else {
              parts.push(render)
            }
          } else {
            // Không có custom handler -> render như text
            parts.push(fullMatch)
          }

          lastIndex = end
        }

        // Push phần còn lại sau tag cuối
        if (lastIndex < raw!.length) {
          parts.push(raw!.slice(lastIndex))
        }

        return (
          <>
            {parts.map((p, i) => (
              <React.Fragment key={i}>{p}</React.Fragment>
            ))}
          </>
        )
      } else {
        return raw || defaultMessage
      }
    } catch {
      return defaultMessage || ''
    }
  }

  return {
    translate,
    lang: language?.locale || LANGUAGE_SUPPORT.EN,
    setLanguage,
  }
}

export default useLanguage
