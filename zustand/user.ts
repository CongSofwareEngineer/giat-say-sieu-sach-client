import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { StorageValue } from 'zustand/middleware'

import { IS_PRODUCTION } from '@/constants/app'
import { COOKIES_KEY, SESSION_ONLY_LOGIN_KEY } from '@/constants/cookies'
import { User, UserRole } from '@/services/users/type'
import { removeCookie } from '@/utils/cookie'

type PersistedState = {
  user: Partial<User> & { id: string; isAdmin: boolean }
  isLogin: boolean
  // false = "remember me" unchecked: user data is never written to localStorage
  isRemembered: boolean
}

type UserState = PersistedState & {
  hasHydrated: boolean
  login: (user: User, rememberMe?: boolean) => void
  logout: () => void
  setUser: (user: User) => void
  updateUser: (user: Partial<User>) => void
  setHasHydrated: (hasHydrated: boolean) => void
}

const initialUser: Partial<User> & { id: string; isAdmin: boolean } = {
  id: '',
  isAdmin: false,
}

const normalizeUser = (userData: User): PersistedState['user'] => {
  return {
    ...userData,
    id: userData._id,
    isAdmin: userData.role === UserRole.ADMIN,
  }
}

export const user = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: initialUser,
        isLogin: false,
        isRemembered: true,
        hasHydrated: false,

        login: (userData, rememberMe = true) => {
          if (rememberMe) {
            sessionStorage.removeItem(SESSION_ONLY_LOGIN_KEY)
          } else {
            sessionStorage.setItem(SESSION_ONLY_LOGIN_KEY, 'true')
          }

          set({ user: normalizeUser(userData), isLogin: true, isRemembered: rememberMe })
        },

        logout: () => {
          sessionStorage.removeItem(SESSION_ONLY_LOGIN_KEY)
          set({ user: initialUser, isLogin: false, isRemembered: true })
        },

        setUser: (userData) => {
          set({ user: normalizeUser(userData), isLogin: !!userData._id })
        },

        updateUser: (userData) => {
          set((state) => {
            const merged = { ...state.user, ...userData }

            if (userData._id !== undefined) {
              merged.id = userData._id
            }
            if (userData.role !== undefined) {
              merged.isAdmin = userData.role === UserRole.ADMIN
            }

            return { user: merged }
          })
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
          isRemembered: state.isRemembered,
        }),
        storage: {
          getItem: (name: string) => {
            const saved = localStorage.getItem(name)

            return saved ? (JSON.parse(saved) as StorageValue<PersistedState>) : null
          },
          setItem: (name: string, value: StorageValue<PersistedState>) => {
            // Not remembered: keep user data out of localStorage (only the session cookies remain)
            if (!value.state.isRemembered) {
              localStorage.removeItem(name)

              return
            }

            localStorage.setItem(name, JSON.stringify(value))
          },
          removeItem: (name: string) => {
            localStorage.removeItem(name)
          },
        },
        onRehydrateStorage: () => (state) => {
          // The flag survives a reload but not a new tab: a reload of a non-remembered login means logout
          if (typeof window !== 'undefined' && sessionStorage.getItem(SESSION_ONLY_LOGIN_KEY)) {
            sessionStorage.removeItem(SESSION_ONLY_LOGIN_KEY)
            removeCookie(COOKIES_KEY.accessToken)
            removeCookie(COOKIES_KEY.refreshToken)
          }

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
