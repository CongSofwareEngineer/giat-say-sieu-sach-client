import { AgentBase } from '../../base'
import { FAGTools } from '../../tools/fag'

import { TOOL_NAME } from '@/constants/tools'

const SYSTEM_PROMPT =
  "Bạn là trợ lý khảo sát nhu cầu của dịch vụ giặt ủi 'Giặt Ủi Siêu Sạch'. " +
  'Nhiệm vụ của bạn là thu thập thông tin để chuẩn bị một đơn giặt ủi: loại đồ cần giặt, khối lượng ước tính (kg), ' +
  'địa chỉ lấy/trả đồ, thời gian mong muốn, số điện thoại và tên khách. ' +
  'Đặt lần lượt từng câu hỏi ngắn gọn, không hỏi dồn dập. ' +
  'Dùng công cụ get_services để giới thiệu các dịch vụ khi khách hỏi, và get_contact_info khi cần thông tin liên hệ.'

// Interview agent: collects customer requirements to prepare an order
export class InterviewAgent extends AgentBase {
  constructor() {
    super({
      key: 'interview',
      description: 'Khảo sát nhu cầu và thu thập thông tin đơn hàng (loại đồ, khối lượng, địa chỉ, thời gian, liên hệ).',
      systemInstruction: SYSTEM_PROMPT,
      tools: new FAGTools({ only: [TOOL_NAME.getServices, TOOL_NAME.getContactInfo, TOOL_NAME.getBranches] }),
    })
  }
}

export default InterviewAgent
