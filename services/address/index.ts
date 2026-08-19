import { AddressItem, CreateAddressPayload, UpdateAddressPayload } from './type'

import BaseAPI from '@/config/baseApi'

class AddressApi extends BaseAPI {
  // GET /addresses/me
  async getMyAddresses(): Promise<AddressItem[]> {
    const response = await this.get<{ data: AddressItem[] }>('/me', { isUseAuth: true })

    return response.data ?? []
  }

  // GET /addresses/me/:id
  async getMyAddress(id: string): Promise<AddressItem> {
    const response = await this.get<{ data: AddressItem }>(`/me/${id}`, { isUseAuth: true })

    return response.data
  }

  // POST /addresses/me
  async createAddress(payload: CreateAddressPayload): Promise<AddressItem> {
    const response = await this.post<{ data: AddressItem }>('/me', payload)

    return response.data
  }

  // PATCH /addresses/me/:id
  async updateAddress(id: string, payload: UpdateAddressPayload): Promise<AddressItem> {
    const response = await this.patch<{ data: AddressItem }>(`/me/${id}`, payload)

    return response.data
  }

  // DELETE /addresses/me/:id
  async deleteAddress(id: string): Promise<void> {
    await this.delete<{ data: { message: string } }>(`/me/${id}`)
  }

  // PATCH /addresses/me/:id/default
  async setDefaultAddress(id: string): Promise<AddressItem> {
    const response = await this.patch<{ data: AddressItem }>(`/me/${id}/default`, {})

    return response.data
  }
}

// Join the address parts into one readable line
export const formatAddress = (item?: AddressItem | null): string => {
  if (!item) return ''

  return [item.address, item.ward, item.district, item.city].filter(Boolean).join(', ')
}

// The server sorts by isDefault first, keep a safe fallback for the UI
export const getDefaultAddress = (addresses: AddressItem[]): AddressItem | undefined => {
  return addresses.find((item) => item.isDefault) ?? addresses[0]
}

const AddressService = new AddressApi('addresses')

export default AddressService
