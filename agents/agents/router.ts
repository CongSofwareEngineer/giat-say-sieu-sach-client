import type { AgentDefinition, AgentTool } from '../base'

import { AGENT_NAME, ROUTER_TOOL_NAME } from '@/constants/tools'

// Router tool chính mà agent chính dùng để chọn agent chuyên biệt
export const routeToAgentTool: AgentTool = {
  name: ROUTER_TOOL_NAME,
  description: 'Chuyển tin nhắn hiện tại của người dùng đến agent chuyên biệt phù hợp để xử lý.',
  parameters: {
    type: 'object',
    properties: {
      agent: {
        type: 'string',
        enum: [AGENT_NAME.faq, AGENT_NAME.price, AGENT_NAME.recommend, AGENT_NAME.booking],
        description: 'Agent phù hợp nhất để trả lời tin nhắn người dùng.',
      },
    },
    required: ['agent'],
  },
  execute: async (args) => `Đang chuyển đến agent "${args?.agent}".`,
}

// Router system prompt, được xây từ registry để các agent mới tự động xuất hiện
// ở đây mà không cần sửa file này.
export const buildRouterSystem = (agents: AgentDefinition[]): string => {
  const list = agents.map((agent) => `- "${agent.name}": ${agent.description}`).join('\n')

  return [
    'Bạn là người điều phối của trợ lý chat cho website dịch vụ giặt ủi "Giặt Ủi Siêu Sạch".',
    'Công việc duy nhất của bạn là định tuyến tin nhắn người dùng đến agent chuyên biệt đúng.',
    'Các agent khả dụng:',
    list,
    '',
    'Quy tắc:',
    '- Nếu tin nhắn khớp với một trong các agent ở trên, hãy gọi route_to_agent với tên agent đó. Chọn agent tốt nhất.',
    '- Nếu tin nhắn không thuộc chủ đề nào các agent trên xử lý (trò chuyện nhỏ, chào hỏi hoặc chủ đề không liên quan), KHÔNG gọi tool nào. Chỉ trả lời bằng từ "FALLBACK".',
    '- Không tự trả lời người dùng; chỉ quyết định agent nào nên xử lý.',
  ].join('\n')
}
