import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import { LANGUAGE_SUPPORT } from '@/zustand/language'

// Forces the agent to answer in the language the user has selected on the
// website (comes from the useLanguage hook through the agent context).
export const answerInLanguageTool: AgentTool = {
  name: TOOL_NAME.answerInLanguage,
  description:
    'Check the language the user is using on the website. Use this when unsure which language to reply in. Your final answer MUST be written entirely in that language.',
  parameters: {
    type: 'object',
    properties: {
      language: {
        type: 'string',
        description: 'Optional: the language you plan to reply in (en = English, vn = Vietnamese).',
        enum: ['en', 'vn'],
      },
    },
    required: [],
  },
  execute: async (_args, ctx) => {
    const isEnglish = ctx.locale === LANGUAGE_SUPPORT.EN

    return isEnglish
      ? 'The user is browsing the website in English. Your final answer MUST be written entirely in English.'
      : 'Người dùng đang dùng website bằng tiếng Việt. Câu trả lời cuối của bạn BẮT BUỘC phải viết bằng tiếng Việt.'
  },
}
