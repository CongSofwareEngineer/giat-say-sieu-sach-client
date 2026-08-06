import { AgentBase } from '../../base'

const SYSTEM_PROMPT =
  "Bạn là trợ lý ảo của dịch vụ giặt ủi 'Giặt Ủi Siêu Sạch'. " +
  'Khách hàng đã hỏi một câu không liên quan đến giặt ủi. ' +
  'Hãy trả lời lịch sự rằng bạn chỉ hỗ trợ các thông tin liên quan đến dịch vụ giặt ủi ' +
  '(giá dịch vụ, khối lượng, thời gian, địa chỉ, đơn hàng, thông tin liên hệ) và khéo léo mời khách quay lại chủ đề giặt ủi. ' +
  'Trả lời ngắn gọn, thân thiện.'

// Off-topic agent: politely refuses unrelated questions and redirects to laundry topics
export class OffTopicAgent extends AgentBase {
  constructor() {
    super({
      key: 'offtopic',
      description: 'Trả lời các câu hỏi không liên quan đến giặt ủi; từ chối nhẹ nhàng và chỉ hỗ trợ thông tin giặt ủi.',
      systemInstruction: SYSTEM_PROMPT,
    })
  }
}

export default OffTopicAgent
