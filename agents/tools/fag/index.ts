import { BaseTools, type ToolDefinition } from '..'

import { INFO_CONTACT, SITE_CONFIG } from '@/constants/app'
import { TOOL_NAME, type TOOL_NAME as ToolName } from '@/constants/tools'
import BranchService from '@/services/branch'
import { mockOrders, mockServices } from '@/services/mockData'

export type FAGToolsOptions = {
  // Only register the given tool names (subset used by a specialized agent)
  only?: readonly ToolName[]
}

// Build the full list of laundry business tools
const buildFAGTools = (): ToolDefinition<any, unknown>[] => [
  // List all laundry services with their unit price
  {
    name: TOOL_NAME.getServices,
    description: 'List all laundry services with their price per kg in VND.',
    handler: async () => mockServices,
  },
  // Search a specific service by name or id
  {
    name: TOOL_NAME.getService,
    description: 'Find a laundry service by name or id and return its price per kg in VND.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Service name or id, e.g. "Giặt thường" or "1".' },
      },
      required: ['query'],
    },
    handler: async ({ query }: { query: string }) => {
      const q = query.trim().toLowerCase()

      return mockServices.filter((s) => s.id === query || s.name.toLowerCase().includes(q))
    },
  },
  // Estimate cost for a service based on the clothes weight
  {
    name: TOOL_NAME.estimateCost,
    description: 'Estimate the total cost in VND for a given service id and weight in kg.',
    parameters: {
      type: 'object',
      properties: {
        serviceId: { type: 'string', description: 'Service id, e.g. "1".' },
        weightKg: { type: 'number', description: 'Weight of clothes in kilograms.' },
      },
      required: ['serviceId', 'weightKg'],
    },
    handler: async ({ serviceId, weightKg }: { serviceId: string; weightKg: number }) => {
      const service = mockServices.find((s) => s.id === serviceId)

      if (!service) {
        return { error: `Unknown service id: ${serviceId}` }
      }

      const weight = Math.max(0, Number(weightKg) || 0)

      return {
        service: service.name,
        pricePerKg: service.price,
        weightKg: weight,
        total: Math.round(service.price * weight),
      }
    },
  },
  // Track the status of an existing order
  {
    name: TOOL_NAME.trackOrder,
    description: 'Look up the status of an order by order code or customer phone number.',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Order code, e.g. "GS100001".' },
        phone: { type: 'string', description: 'Customer phone number, e.g. "0901234567".' },
      },
    },
    handler: async ({ code, phone }: { code?: string; phone?: string }) => {
      const order = mockOrders.find((o) => (code && o.code.toLowerCase() === code.toLowerCase()) || (phone && o.phone === phone))

      return order ?? null
    },
  },
  // Return the shop contact information
  {
    name: TOOL_NAME.getContactInfo,
    description: 'Return the shop phone, email, address, Facebook, Zalo and website URL.',
    handler: async () => ({
      phone: INFO_CONTACT.Phone,
      email: INFO_CONTACT.Mail.replace('mailto:', ''),
      address: INFO_CONTACT.Address,
      facebook: INFO_CONTACT.Facebook,
      zalo: INFO_CONTACT.Zalo,
      website: SITE_CONFIG.url,
    }),
  },
  // Return the list of existing branches fetched from the API
  {
    name: TOOL_NAME.getBranches,
    description: 'List the existing laundry branches (chi nhánh) with address, phone and working hours.',
    handler: async () => {
      try {
        return await BranchService.getBranches()
      } catch {
        return { error: 'Branch API is unavailable. Please try again later.' }
      }
    },
  },
]

// Business-specific tool set for the laundry shop (Giặt Ủi Siêu Sạch)
export class FAGTools extends BaseTools {
  constructor(options: FAGToolsOptions = {}) {
    super()

    const allTools = buildFAGTools()
    const tools = options.only?.length ? allTools.filter((tool) => (options.only as readonly string[]).includes(tool.name)) : allTools

    this.register(...tools)
  }
}

export default FAGTools

// Singleton for server-side reuse
export const fagTools = new FAGTools()
