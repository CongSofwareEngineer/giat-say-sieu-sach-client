// Custom tool names sent to the chat API as function tools.
// Names are grouped by tool set so new tools are easy to add later.
export const TOOL_NAME = {
  // Service tool set (prices, orders, branches, contact)
  getServices: 'get_services',
  getService: 'get_service',
  estimateCost: 'estimate_cost',
  trackOrder: 'track_order',
  getMyOrders: 'get_my_orders',
  getContactInfo: 'get_contact_info',
  getBranches: 'get_branches',
  getMyAddresses: 'get_my_addresses',
  cancelMyOrder: 'cancel_my_order',
  getMyLoyalty: 'get_my_loyalty',
  // FAQ tool set (small, common questions)
  getFaq: 'get_faq',
  // Laundry tool set (booking/pickup intent -> open the order form)
  laundry: 'open_laundry_form',
  // Language tool set (reply in the client's selected language)
  answerInLanguage: 'answer_in_language',
  // Promotion tool set (current running programs from the API)
  getPromotions: 'get_promotions',
  // Default search tool set (site content + web)
  search: 'search',
} as const

export type TOOL_NAME = (typeof TOOL_NAME)[keyof typeof TOOL_NAME]

// Sender of a chat message saved to the backend (spam limit)
export enum CHAT_MESSAGE_TYPE {
  USER = 'user',
  BOT = 'bot',
}

// Router agent internal tool name used to pick a specialized agent
export const ROUTER_TOOL_NAME = 'route_to_agent' as const

// Agent names used by the main agent to dispatch a message.
// New agents are registered here and in agents/agents/index.ts.
export const AGENT_NAME = {
  router: 'router',
  faq: 'faq',
  price: 'price',
  recommend: 'recommend',
  fallback: 'fallback',
} as const

export type AGENT_NAME = (typeof AGENT_NAME)[keyof typeof AGENT_NAME]

// Chat label (translation key) shown while a tool is running
export const TOOL_STATUS_KEY: Partial<Record<TOOL_NAME, string>> = {
  [TOOL_NAME.getServices]: 'chat.status.price',
  [TOOL_NAME.getService]: 'chat.status.price',
  [TOOL_NAME.estimateCost]: 'chat.status.price',
  [TOOL_NAME.trackOrder]: 'chat.status.order',
  [TOOL_NAME.getMyOrders]: 'chat.status.order',
  [TOOL_NAME.cancelMyOrder]: 'chat.status.order',
  [TOOL_NAME.getContactInfo]: 'chat.status.branch',
  [TOOL_NAME.getBranches]: 'chat.status.branch',
  [TOOL_NAME.getMyAddresses]: 'chat.status.address',
  [TOOL_NAME.getMyLoyalty]: 'chat.status.loyalty',
  [TOOL_NAME.getFaq]: 'chat.status.search',
  [TOOL_NAME.search]: 'chat.status.search',
  [TOOL_NAME.laundry]: 'chat.status.form',
  [TOOL_NAME.getPromotions]: 'chat.status.promotion',
}

// LLM proxy endpoint and SSE protocol values
export const CHAT_COMPLETIONS_PATH = '/api/chat-agent/chat/completions' as const
export const SSE_CONTENT_TYPE = 'text/event-stream' as const
export const SSE_DATA_PREFIX = 'data:' as const
export const SSE_DONE_EVENT = '[DONE]' as const

export const CHAT_LOG_STATUS = {
  ok: 'ok',
  error: 'error',
  aborted: 'aborted',
} as const

export type CHAT_LOG_STATUS = (typeof CHAT_LOG_STATUS)[keyof typeof CHAT_LOG_STATUS]

// Column order of the usage log sheet; the sheet's header row must match it
export const CHAT_LOG_COLUMNS = [
  'date',
  'time',
  'inputTokens',
  'outputTokens',
  'cachedTokens',
  'totalTokens',
  'status',
  'question',
  'toolCalls',
  'answer',
] as const

// Anchored to column A: Sheets splits a whole-tab range into "tables" at empty
// cells, which would make appended rows start in a later column
export const CHAT_LOG_SHEET_RANGE = 'Logs!A:A' as const
export const CHAT_LOG_MAX_TEXT_LENGTH = 5000 as number
export const CHAT_LOG_TIMEOUT_MS = 8000 as number
// Vietnamese phone numbers: 0xx or +84xx, with optional space, dot or dash
export const CHAT_LOG_PHONE_REGEX = /(?<![\p{L}\p{N}.])(?:\+?84|0)(?:[ .-]?\d){8,10}(?![\p{L}\p{N}])/gu

export const GOOGLE_SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets' as const
export const GOOGLE_SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets' as const

// Streamed text reveal: one step per tick (ms), each step shows pending / divisor chars
export const CHAT_STREAM_TICK_MS = 30 as number
export const CHAT_STREAM_CATCH_UP_DIVISOR = 15 as number
// Within this distance from the bottom (px) the list keeps following new text
export const CHAT_SCROLL_PIN_THRESHOLD = 60 as number
