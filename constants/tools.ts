// Custom tool names sent to the chat API as function tools.
// Names are grouped by tool set so new tools are easy to add later.
export const TOOL_NAME = {
  // Service tool set (prices, orders, branches, contact)
  getServices: 'get_services',
  getService: 'get_service',
  estimateCost: 'estimate_cost',
  trackOrder: 'track_order',
  getContactInfo: 'get_contact_info',
  getBranches: 'get_branches',
  // FAQ tool set (small, common questions)
  getFaq: 'get_faq',
  // Language tool set (reply in the client's selected language)
  answerInLanguage: 'answer_in_language',
  // Promotion tool set (current running programs from the API)
  getPromotions: 'get_promotions',
  // Default search tool set (site content + web)
  search: 'search',
} as const

export type TOOL_NAME = (typeof TOOL_NAME)[keyof typeof TOOL_NAME]

// Router agent internal tool name used to pick a specialized agent
export const ROUTER_TOOL_NAME = 'route_to_agent' as const

// Agent names used by the main agent to dispatch a message.
// New agents are registered here and in agents/agents/index.ts.
export const AGENT_NAME = {
  router: 'router',
  faq: 'faq',
  price: 'price',
  redcommand: 'redcommand',
  fallback: 'fallback',
} as const

export type AGENT_NAME = (typeof AGENT_NAME)[keyof typeof AGENT_NAME]
