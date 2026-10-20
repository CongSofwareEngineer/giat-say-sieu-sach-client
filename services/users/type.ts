import type { CloudinaryImage } from '@/services/upload'

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export type User = {
  _id: string
  phone: string
  name: string
  avatar?: CloudinaryImage | null
  role: UserRole
  loyaltyPoints: number
  isActive: boolean
  email?: string | null
  // true after an admin reset: the user is logging in with a temporary password
  mustChangePassword?: boolean
  fids?: string[]
  createdAt?: string
  updatedAt?: string
}
