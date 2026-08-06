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
}

declare namespace NodeJS {
  interface ProcessEnv extends EnvironmentVariables {}
}
