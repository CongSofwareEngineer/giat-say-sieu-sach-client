import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { IS_PRODUCTION } from '@/constants/app'
import { AddressItem } from '@/services/address/type'

type AddressState = {
  addresses: AddressItem[]
  setAddresses: (addresses: AddressItem[]) => void
  reset: () => void
}

// Shared cache of the addresses returned by GET /addresses/me.
// Not persisted on purpose: addresses belong to the logged in user and the server stays the source of truth.
export const address = create<AddressState>()(
  devtools(
    (set) => ({
      addresses: [],

      setAddresses: (addresses) => {
        set({ addresses })
      },

      reset: () => {
        set({ addresses: [] })
      },
    }),
    {
      name: 'address-zustand',
      enabled: !IS_PRODUCTION,
    }
  )
)
