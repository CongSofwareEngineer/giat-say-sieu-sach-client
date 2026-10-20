// Mirrors AddressResponseDto of the server (module/address)
export type AddressItem = {
  id: string
  userId?: string
  // Optional on the server
  recipientName?: string
  phone: string
  address: string
  district: string
  city: string
  isDefault: boolean
  createdAt?: string
  updatedAt?: string
}

// Mirrors CreateAddressDto of the server
export type CreateAddressPayload = {
  recipientName?: string
  phone: string
  address: string
  district: string
  city: string
  isDefault?: boolean
}

// Mirrors UpdateAddressDto of the server (PartialType of CreateAddressDto)
export type UpdateAddressPayload = Partial<CreateAddressPayload>
