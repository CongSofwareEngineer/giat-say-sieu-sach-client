export enum COOKIES_KEY {
  accessToken = 'accessToken',
  refreshToken = 'refreshToken',
}

// sessionStorage flag: this login was NOT remembered, so a page reload must log out
export const SESSION_ONLY_LOGIN_KEY = 'sessionOnlyLogin' as const
