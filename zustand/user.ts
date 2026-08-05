import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { StorageValue } from 'zustand/middleware'

import { IS_PRODUCTION } from '@/constants/app'

export type UserAddress = {
  id: string
  name: string
  phone: string
  detail: string
  city: string
  district: string
  ward: string
  isDefault?: boolean
}

export type User = {
  id?: string
  name?: string
  phone?: string
  email?: string
  avatar?: string
  isAdmin?: boolean
  addresses?: UserAddress[]
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
  addAddress: (address: Omit<UserAddress, 'id'>) => void
  updateAddress: (id: string, address: Partial<UserAddress>) => void
  removeAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
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

        // Add a new address; first address becomes default
        addAddress: (address) => {
          set((state) => {
            const addresses = state.user.addresses ?? []
            const isFirst = addresses.length === 0
            const newAddress: UserAddress = {
              ...address,
              id: `addr-${Date.now()}`,
              isDefault: address.isDefault || isFirst,
            }

            return {
              user: {
                ...state.user,
                addresses: isFirst
                  ? [newAddress]
                  : [...addresses.map((item) => (newAddress.isDefault ? { ...item, isDefault: false } : item)), newAddress],
              },
            }
          })
        },

        // Update an existing address by id; switch default if requested
        updateAddress: (id, address) => {
          set((state) => {
            const makeDefault = address.isDefault === true

            return {
              user: {
                ...state.user,
                addresses: (state.user.addresses ?? []).map((item) => {
                  if (item.id === id) return { ...item, ...address }
                  if (makeDefault) return { ...item, isDefault: false }

                  return item
                }),
              },
            }
          })
        },

        // Remove an address; reassign default if the removed one was default
        removeAddress: (id) => {
          set((state) => {
            const addresses = (state.user.addresses ?? []).filter((item) => item.id !== id)
            const removedDefault = state.user.addresses?.find((item) => item.id === id)?.isDefault

            if (removedDefault && addresses.length > 0) {
              addresses[0].isDefault = true
            }

            return { user: { ...state.user, addresses } }
          })
        },

        // Mark an address as the default one
        setDefaultAddress: (id) => {
          set((state) => ({
            user: {
              ...state.user,
              addresses: (state.user.addresses ?? []).map((item) => ({ ...item, isDefault: item.id === id })),
            },
          }))
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
