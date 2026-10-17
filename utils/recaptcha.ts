import { RECAPTCHA, RECAPTCHA_ACTION } from '@/constants/app'

type Grecaptcha = {
  ready: (callback: () => void) => void
  execute: (siteKey: string, options: { action: string }) => Promise<string>
}

let loadPromise: Promise<Grecaptcha | null> | null = null

const getGrecaptcha = (): Grecaptcha | undefined => (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha

// Resolve null when the promise takes longer than RECAPTCHA.TIMEOUT
const withTimeout = <T>(promise: Promise<T | null>): Promise<T | null> =>
  Promise.race([promise, new Promise<null>((resolve) => setTimeout(() => resolve(null), RECAPTCHA.TIMEOUT))])

// Inject the reCAPTCHA v3 script once. Loads it again when the script tag is gone
// (the register page's Firebase RecaptchaVerifier removes every recaptcha/api.js script).
export const loadRecaptcha = (): Promise<Grecaptcha | null> => {
  if (typeof window === 'undefined' || !RECAPTCHA.SITE_KEY) return Promise.resolve(null)

  if (loadPromise && document.getElementById(RECAPTCHA.SCRIPT_ID)) return loadPromise

  loadPromise = new Promise((resolve) => {
    const script = document.createElement('script')

    script.id = RECAPTCHA.SCRIPT_ID
    script.src = `${RECAPTCHA.SCRIPT_URL}?render=${RECAPTCHA.SITE_KEY}`
    script.async = true
    script.onload = () => {
      const grecaptcha = getGrecaptcha()

      if (grecaptcha) grecaptcha.ready(() => resolve(grecaptcha))
      else resolve(null)
    }
    script.onerror = () => {
      script.remove()
      loadPromise = null
      resolve(null)
    }
    document.head.appendChild(script)
  })

  return loadPromise
}

// Fresh token for an action (tokens expire after 2 minutes, so call it right before the request).
// Undefined when reCAPTCHA is not configured or cannot load: the request is sent without it and the server decides.
export const getRecaptchaToken = async (action: RECAPTCHA_ACTION): Promise<string | undefined> => {
  try {
    const grecaptcha = await withTimeout(loadRecaptcha())

    if (!grecaptcha) return undefined

    return (await withTimeout(grecaptcha.execute(RECAPTCHA.SITE_KEY, { action }))) ?? undefined
  } catch {
    return undefined
  }
}
