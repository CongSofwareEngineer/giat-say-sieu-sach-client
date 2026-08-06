import { AgentBase } from '../../base'
import { BaseTools, LanguageTools, PromotionTools, ServiceTools } from '../../tools'

import { TOOL_NAME } from '@/constants/tools'

const SYSTEM_PROMPT =
  "Bạn là trợ lý tư vấn của dịch vụ giặt ủi 'Giặt Ủi Siêu Sạch'. " +
  'Dựa vào nhu cầu của khách (loại vải, số lượng, thời gian, ngân sách), hãy đề xuất dịch vụ phù hợp nhất và giải thích ngắn gọn lý do. ' +
  'Dùng get_services, get_service và estimate_cost để đưa ra giá và so sánh chính xác, ' +
  'dùng get_promotions để thông báo các chương trình khuyến mãi đang áp dụng.'

// Recommend agent: proposes the best service based on customer needs
export class RecommendAgent extends AgentBase {
  constructor() {
    super({
      key: 'recommend',
      description: 'Tư vấn và đề xuất dịch vụ giặt ủi phù hợp với nhu cầu của khách.',
      systemInstruction: SYSTEM_PROMPT,
      tools: BaseTools.compose(
        new ServiceTools({ only: [TOOL_NAME.getServices, TOOL_NAME.getService, TOOL_NAME.estimateCost] }),
        new PromotionTools(),
        new LanguageTools()
      ),
    })
  }
}

export default RecommendAgent
