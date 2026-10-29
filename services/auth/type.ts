import type { User } from '../users/type'

// POST /auth/google: logged in, or the next step the customer must fill in
export type GoogleLoginResponse = { requirePhone: true } | { requirePassword: true } | (Auth & { user: User })

export type Auth = {
  accessToken: string
  refreshToken: string
  accessExpire: string
  refreshExpire: string
}
