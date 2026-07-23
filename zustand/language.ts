import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { StorageValue } from 'zustand/middleware'

import MessageEN from '@/public/assets/language/en.json'
import MessageVN from '@/public/assets/language/vn.json'

export enum LANGUAGE_SUPPORT {
  EN = 'en',

  VN = 'VN',
}

export type TYPE_LANGUAGE = typeof MessageEN
export type PATH_LANGUAGE<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: PATH_LANGUAGE<T[K], `${Prefix}${Prefix extends '' ? '' : '.'}${K & string}`>
    }[keyof T]
  : Prefix

type Language = {
  locale: LANGUAGE_SUPPORT
  messages: any
}
type LanguageState = {
  language: Language
  setLanguage: (locale: LANGUAGE_SUPPORT) => void
}

const getLanguage = (language: LANGUAGE_SUPPORT): Language => {
  switch (language) {
    case LANGUAGE_SUPPORT.EN:
      return {
        locale: LANGUAGE_SUPPORT.EN,
        messages: MessageEN,
      }

    default:
      return {
        locale: LANGUAGE_SUPPORT.VN,
        messages: MessageVN,
      }
  }
}

export const language = create<LanguageState>()(
  devtools(
    persist(
      (set) => ({
        language: {
          locale: LANGUAGE_SUPPORT.VN,
          messages: MessageVN,
        },

        setLanguage: (locale: LANGUAGE_SUPPORT) => {
          const language = getLanguage(locale)

          set({ language })
        },
      }),
      {
        storage: {
          getItem: (name: string) => {
            const locale = localStorage.getItem(name) as LANGUAGE_SUPPORT

            const language = getLanguage(locale || LANGUAGE_SUPPORT.VN)

            return {
              state: {
                language: language as any,
              },
            } as StorageValue<LanguageState>
          },
          setItem: (name: string, value: StorageValue<LanguageState>) => {
            localStorage.setItem(name, value.state.language.locale)
          },
          removeItem: (name: string) => {
            localStorage.removeItem(name)
          },
        },
        name: 'language-zustand',
      }
    ),
    {
      name: 'language-zustand',
      enabled: process.env.NEXT_PUBLIC_ENV !== 'production',
    }
  )
)
