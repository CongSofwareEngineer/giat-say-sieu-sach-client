import { AgentBase, type AgentMessage } from './base'
import { InterviewAgent } from './modals/interview'
import { OffTopicAgent } from './modals/offtopic'
import { PriceAgent } from './modals/price'
import { RecommendAgent } from './modals/recommend'
import { FAGTools } from './tools/fag'

import { ROUTER_TOOL_NAME } from '@/constants/tools'

const ROUTER_SYSTEM_PROMPT = (agents: AgentBase[]) =>
  "Bạn là bộ định tuyến agent của dịch vụ giặt ủi 'Giặt Ủi Siêu Sạch'. " +
  'Phân tích câu hỏi của khách rồi chọn đúng một agent phù hợp nhất từ danh sách dưới đây.\n' +
  agents.map((agent) => `- ${agent.key}: ${agent.description}`).join('\n') +
  `\nNếu câu hỏi ngoài phạm vi các agent trên hoặc không rõ, hãy chọn "router".`

const GENERAL_SYSTEM_PROMPT =
  "Bạn là trợ lý ảo của dịch vụ giặt ủi 'Giặt Ủi Siêu Sạch'. " +
  'Trả lời bằng tiếng Việt, ngắn gọn, thân thiện. Khi khách hỏi về giá dịch vụ, tra cứu đơn hàng, ước tính chi phí ' +
  'hay thông tin liên hệ, hãy luôn dùng các công cụ có sẵn để lấy dữ liệu chính xác thay vì tự đoán.'

// Main common agent: analyzes the input and routes it to a specialized agent,
// falling back to itself (all tools) when no specialized agent matches
export class RouterAgent extends AgentBase {
  private agents: AgentBase[]

  constructor(options: { agents?: AgentBase[] } = {}) {
    super({
      key: 'router',
      description: 'Trả lời các câu hỏi chung hoặc ngoài phạm vi các agent chuyên biệt.',
      systemInstruction: GENERAL_SYSTEM_PROMPT,
      tools: new FAGTools(),
    })

    this.agents = options.agents ?? [new InterviewAgent(), new PriceAgent(), new RecommendAgent(), new OffTopicAgent()]
  }

  // Route the input to the best specialized agent and delegate to it
  async chat(input: string, history: AgentMessage[] = []): Promise<{ text: string; history: AgentMessage[] }> {
    const target = await this.route(input, history)

    if (target === this) {
      return super.chat(input, history)
    }

    return target.chat(input, history)
  }

  // Ask the model to pick one agent via a forced route_to_agent function call
  private async route(input: string, history: AgentMessage[]): Promise<AgentBase> {
    const candidates = [this, ...this.agents]

    const body = {
      model: this.model,
      messages: [{ role: 'system', content: ROUTER_SYSTEM_PROMPT(this.agents) }, ...history, { role: 'user', content: input }],
      tools: [
        {
          type: 'function',
          function: {
            name: ROUTER_TOOL_NAME,
            description: 'Chọn agent phù hợp nhất để xử lý câu hỏi của khách.',
            parameters: {
              type: 'object',
              properties: {
                agent: { type: 'string', enum: candidates.map((agent) => agent.key), description: 'Key của agent được chọn.' },
              },
              required: ['agent'],
            },
          },
        },
      ],
      tool_choice: { type: 'function', function: { name: ROUTER_TOOL_NAME } },
    }

    const modelMessage = await this.generate(body)
    const call = modelMessage.tool_calls?.[0]
    let agentKey: string | undefined

    if (call?.function?.name === ROUTER_TOOL_NAME) {
      try {
        agentKey = JSON.parse(call.function.arguments || '{}').agent as string
      } catch {
        agentKey = undefined
      }
    }

    return this.agents.find((agent) => agent.key === agentKey) ?? this
  }
}

export default RouterAgent

// Pre-built agent with the laundry specialized agents
export const chatAgent = new RouterAgent()

export { AgentBase, type AgentMessage, type OpenAIToolCall } from './base'
