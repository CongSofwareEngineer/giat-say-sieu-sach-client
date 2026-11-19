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

// Reason in the backend 429 body when a chat message is over the limit
export enum CHAT_LIMIT_REASON {
  PENDING_LIMIT = 'PENDING_LIMIT',
  HOURLY_LIMIT = 'HOURLY_LIMIT',
}

export const SECONDS_PER_MINUTE = 60

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

// System One (Jev) — typed decision model used to route a message and pick
// which tools may run, replacing the LLM router call. Proxied server-side so
// SYSTEM_ONE_API_KEY stays hidden.
export const SYSTEM_ONE_PATH = '/api/systemone' as const
export const SYSTEM_ONE_MODEL = process.env.NEXT_PUBLIC_SYSTEM_ONE_MODEL || 'jev-latest'

// Question types Jev supports; only `choice` is used for now
export const SYSTEM_ONE_QUESTION_TYPE = {
  choice: 'choice',
  score: 'score',
  noul: 'noul',
  box: 'box',
} as const

export type SYSTEM_ONE_QUESTION_TYPE = (typeof SYSTEM_ONE_QUESTION_TYPE)[keyof typeof SYSTEM_ONE_QUESTION_TYPE]

// Our own ids for the questions sent in one Jev request (answered in parallel)
export const SYSTEM_ONE_QUESTION_ID = {
  routeAgent: 'route_agent',
  pickTool: 'pick_tool',
} as const

// Jev request budget: abort rather than keep the user waiting on a decision
export const SYSTEM_ONE_TIMEOUT_MS = 6000 as number

// Conversation turns put into the Jev `state` (the decision only needs the
// latest message plus a little context, which is what keeps it cheap)
export const SYSTEM_ONE_STATE_MESSAGES = 4 as number

// Option meaning "answer directly, no tool needed" in the pick_tool question
export const TOOL_PICK_NONE = 'none' as const

// A tool is kept when Jev gives it at least this probability, so a close
// second tool survives instead of being cut by the single top choice
export const TOOL_PICK_MIN_PROBABILITY = 0.15 as number

// Fast path: tools whose output is already the final, user-facing answer
// (text built from the API data through translate()). When Jev picks one of
// them confidently, the tool runs on its own and its text is the reply, so the
// turn costs no LLM call. Tools whose result still needs interpreting (FAQ,
// search, cost estimates) must stay out of this list.
export const ANSWER_READY_TOOLS: TOOL_NAME[] = [
  TOOL_NAME.getBranches,
  TOOL_NAME.getContactInfo,
  TOOL_NAME.getMyLoyalty,
  TOOL_NAME.getPromotions,
  TOOL_NAME.laundry,
  TOOL_NAME.trackOrder,
  TOOL_NAME.getMyOrders,
  TOOL_NAME.cancelMyOrder,
  TOOL_NAME.getServices,
  TOOL_NAME.getService,
  TOOL_NAME.estimateCost,
]

// Minimum probability Jev must put on the picked tool before the fast path
// answers without an LLM. Probabilities sum to 1, so above 0.5 only one tool
// can ever clear it: an unsure or split decision goes through the agent.
export const FAST_PATH_MIN_PROBABILITY = 0.6 as number
