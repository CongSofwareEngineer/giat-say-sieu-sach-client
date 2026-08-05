import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { StorageValue } from 'zustand/middleware'

import { IS_PRODUCTION } from '@/constants/app'

export type User = {
  id?: string
  name?: string
  phone?: string
  email?: string
  avatar?: string
  isAdmin?: boolean
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
            localStorage.setItem(name, JSON.stringify(value))
          },
          removeItem: (name: string) => {
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
