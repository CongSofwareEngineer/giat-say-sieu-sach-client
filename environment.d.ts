interface EnvironmentVariables {
  readonly NEXT_PUBLIC_KEY_SALT: string
  readonly NEXT_PUBLIC_API_APP: string
  readonly NEXT_PUBLIC_ENV: string
  readonly NEXT_PUBLIC_BUILD: string
  readonly ARGON2_MEMORY_COST: number
  readonly ARGON2_TIME_COST: number
  // OpenAI-compatible chat API used by the agent (e.g. tokenrouter)
  readonly AGENT_API_URL?: string
  readonly AGENT_API_KEY?: string
  readonly AGENT_MODEL?: string
  // Client-side model name sent by the agent loop (safe to expose)
  readonly NEXT_PUBLIC_AGENT_MODEL?: string
  // Firebase
  readonly NEXT_PUBLIC_FIREBASE_API_KEY?: string
  readonly NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?: string
  readonly NEXT_PUBLIC_FIREBASE_PROJECT_ID?: string
  readonly NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?: string
  readonly NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly NEXT_PUBLIC_FIREBASE_APP_ID?: string
  readonly NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?: string
  readonly NEXT_PUBLIC_FIREBASE_VAPID_KEY?: string
}

declare namespace NodeJS {
  interface ProcessEnv extends EnvironmentVariables {}
}
