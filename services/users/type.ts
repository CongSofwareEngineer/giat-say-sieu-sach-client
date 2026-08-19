export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export type User = {
  _id: string
  phone: string
  name: string
  avatar?: string
  role: UserRole
  loyaltyPoints: number
  isActive: boolean
  email?: string
}
