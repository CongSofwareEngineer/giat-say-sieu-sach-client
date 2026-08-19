import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { StorageValue } from 'zustand/middleware'

import { IS_PRODUCTION } from '@/constants/app'
import { User, UserRole } from '@/services/users/type'

type PersistedState = {
  user: Partial<User> & { id: string; isAdmin: boolean }
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
        hasHydrated: false,

        login: (userData) => {
          set({ user: normalizeUser(userData), isLogin: true })
        },

        logout: () => {
          set({ user: initialUser, isLogin: false })
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
