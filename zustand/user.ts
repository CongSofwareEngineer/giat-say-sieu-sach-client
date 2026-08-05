import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { StorageValue } from 'zustand/middleware'

import { IS_PRODUCTION } from '@/constants/app'
import { COOKIES_KEY } from '@/constants/cookies'

export type User = {
  id?: string
  name?: string
  phone?: string
  email?: string
  avatar?: string
  isAdmin?: boolean
  accessToken?: string
  refreshToken?: string
}

type PersistedState = {
  user: User
  isLogin: boolean
}

type UserState = PersistedState & {
  hasHydrated: boolean
  login: (user: User) => void
  logout: () => void
  setUser: (user: User) => void
  updateUser: (user: Partial<User>) => void
  setHasHydrated: (hasHydrated: boolean) => void
}

const initialUser: User = {}

// Save token fields to document.cookie (not localStorage)
const syncTokensToCookie = (user: User) => {
  if (typeof document === 'undefined') return

  if (user.accessToken) {
    document.cookie = `${COOKIES_KEY.accessToken}=${encodeURIComponent(user.accessToken)}; path=/`
  }

  if (user.refreshToken) {
    document.cookie = `${COOKIES_KEY.refreshToken}=${encodeURIComponent(user.refreshToken)}; path=/`
  }
}

// Clear all user cookies
const clearTokensFromCookie = () => {
  if (typeof document === 'undefined') return

  document.cookie = `${COOKIES_KEY.accessToken}=; path=/; max-age=0`
  document.cookie = `${COOKIES_KEY.refreshToken}=; path=/; max-age=0`
}

// Strip cookie-only fields before persisting user to localStorage
const stripTokens = (user: User): User => {
  const rest: User = { ...user }

  delete rest.accessToken
  delete rest.refreshToken

  return rest
}

export const user = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: initialUser,
        isLogin: false,
        hasHydrated: false,

        login: (userData) => {
          set({ user: userData, isLogin: true })
        },

        logout: () => {
          clearTokensFromCookie()
          set({ user: initialUser, isLogin: false })
        },

        setUser: (userData) => {
          set({ user: userData, isLogin: !!userData.id })
        },

        updateUser: (userData) => {
          set((state) => ({ user: { ...state.user, ...userData } }))
        },

        setHasHydrated: (hasHydrated) => {
          set({ hasHydrated })
        },
      }),
      {
        name: 'user-zustand',
        partialize: (state) => ({
          user: state.user,
          isLogin: state.isLogin,
        }),
        storage: {
          getItem: (name: string) => {
            const saved = localStorage.getItem(name)

            return saved ? (JSON.parse(saved) as StorageValue<PersistedState>) : null
          },
          setItem: (name: string, value: StorageValue<PersistedState>) => {
            syncTokensToCookie(value.state.user)
            localStorage.setItem(
              name,
              JSON.stringify({
                ...value,
                state: {
                  ...value.state,
                  user: stripTokens(value.state.user),
                },
              })
            )
          },
          removeItem: (name: string) => {
            clearTokensFromCookie()
            localStorage.removeItem(name)
          },
        },
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true)
        },
      }
    ),
    {
      name: 'user-zustand',
      enabled: !IS_PRODUCTION,
    }
  )
)
