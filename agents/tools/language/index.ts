import { BaseTools, pickTools, type ToolDefinition, type ToolSetOptions } from '../base'

import { TOOL_NAME } from '@/constants/tools'

// Reply-language constraints per supported locale (from the client zustand language)
export const LANGUAGE_PROMPTS: Record<string, string> = {
  VN: 'Luôn luôn trả lời khách hàng bằng tiếng Việt, dù khách có hỏi bằng ngôn ngữ khác.',
  en: 'Always reply to the customer in English, even if they ask in another language.',
}

export const LANGUAGE_NAMES: Record<string, string> = {
  VN: 'Vietnamese',
  en: 'English',
}

// Build the system prompt fragment that forces replies in the client locale
export const buildLanguageSystemPrompt = (locale?: string): string => {
  if (!locale) return ''

  const key = Object.keys(LANGUAGE_PROMPTS).find((k) => k.toLowerCase() === locale.toLowerCase())

  return key ? LANGUAGE_PROMPTS[key] : ''
}

const buildLanguageTools = (): ToolDefinition<any, unknown>[] => [
  // Enforce the client-selected language before the assistant writes the final answer
  {
    name: TOOL_NAME.answerInLanguage,
    description: 'Return the language the assistant must use to reply to the customer. Call this before giving the final answer.',
    handler: async (args: Record<string, any>) => {
      const locale = args?.locale
      const key = Object.keys(LANGUAGE_PROMPTS).find((k) => k.toLowerCase() === String(locale || '').toLowerCase())

      return {
        language: key ? LANGUAGE_NAMES[key] : 'unknown',
        instruction: key ? LANGUAGE_PROMPTS[key] : 'Reply in the customer language.',
      }
    },
  },
]

// Language tool set: keeps every answer in the client's selected language
export class LanguageTools extends BaseTools {
  constructor(options: ToolSetOptions = {}) {
    super()

    this.register(...pickTools(buildLanguageTools(), options.only))
  }
}

export default LanguageTools
