import AuthService from '@/services/auth'

export async function registerAction(name: string, phone: string, password: string, captchaToken?: string) {
  return AuthService.register(name, phone, password, captchaToken)
}
