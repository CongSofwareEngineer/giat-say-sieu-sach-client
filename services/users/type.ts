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
  email?: string
  fcmToken?: string
  createdAt?: string
  updatedAt?: string
}
