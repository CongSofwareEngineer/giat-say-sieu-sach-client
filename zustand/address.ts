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

type PersistedAddressState = {
  addresses: UserAddress[]
}

type AddressState = PersistedAddressState & {
  hasHydrated: boolean
  setAddresses: (addresses: UserAddress[]) => void
  addAddress: (address: Omit<UserAddress, 'id'>) => void
  updateAddress: (id: string, address: Partial<UserAddress>) => void
  removeAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export const address = create<AddressState>()(
  devtools(
    persist(
      (set) => ({
        addresses: [],
        hasHydrated: false,

        setAddresses: (addresses) => {
          set({ addresses })
        },

        addAddress: (address) => {
          set((state) => {
            const addresses = state.addresses
            const isFirst = addresses.length === 0
            const newAddress: UserAddress = {
              ...address,
              id: `addr-${Date.now()}`,
              isDefault: address.isDefault || isFirst,
            }

            return {
              addresses: isFirst
                ? [newAddress]
                : [...addresses.map((item) => (newAddress.isDefault ? { ...item, isDefault: false } : item)), newAddress],
            }
          })
        },

        updateAddress: (id, address) => {
          set((state) => {
            const makeDefault = address.isDefault === true

            return {
              addresses: state.addresses.map((item) => {
                if (item.id === id) return { ...item, ...address }
                if (makeDefault) return { ...item, isDefault: false }

                return item
              }),
            }
          })
        },

        removeAddress: (id) => {
          set((state) => {
            const addresses = state.addresses.filter((item) => item.id !== id)
            const removedDefault = state.addresses.find((item) => item.id === id)?.isDefault

            if (removedDefault && addresses.length > 0) {
              addresses[0].isDefault = true
            }

            return { addresses }
          })
        },

        setDefaultAddress: (id) => {
          set((state) => ({
            addresses: state.addresses.map((item) => ({ ...item, isDefault: item.id === id })),
          }))
        },

        setHasHydrated: (hasHydrated) => {
          set({ hasHydrated })
        },
      }),
      {
        name: 'address-zustand',
        partialize: (state) => ({
          addresses: state.addresses,
        }),
        storage: {
          getItem: (name: string) => {
            const saved = localStorage.getItem(name)

            return saved ? (JSON.parse(saved) as StorageValue<PersistedAddressState>) : null
          },
          setItem: (name: string, value: StorageValue<PersistedAddressState>) => {
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
      name: 'address-zustand',
      enabled: !IS_PRODUCTION,
    }
  )
)
