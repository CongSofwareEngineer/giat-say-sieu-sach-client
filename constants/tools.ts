// Custom tool names used by FAGTools (sent to the chat API as function tools)
export const TOOL_NAME = {
  getServices: 'get_services',
  getService: 'get_service',
  estimateCost: 'estimate_cost',
  trackOrder: 'track_order',
  getContactInfo: 'get_contact_info',
  getBranches: 'get_branches',
} as const

export type TOOL_NAME = (typeof TOOL_NAME)[keyof typeof TOOL_NAME]

// Router agent internal tool name used to pick a specialized agent
export const ROUTER_TOOL_NAME = 'route_to_agent' as const
