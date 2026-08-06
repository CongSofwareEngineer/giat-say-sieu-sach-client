import { AgentBase } from '../../base'
import { BaseTools, LanguageTools, ServiceTools } from '../../tools'

import { TOOL_NAME } from '@/constants/tools'

const SYSTEM_PROMPT =
  "Bạn là trợ lý bảng giá của dịch vụ giặt ủi 'Giặt Ủi Siêu Sạch'. " +
  'Trả lời chính xác về giá từng dịch vụ và ước tính chi phí theo khối lượng. ' +
  'Luôn dùng công cụ get_services, get_service và estimate_cost để lấy giá và tính tiền thực tế, không tự đoán.'

// Price agent: handles service prices and cost estimation by weight
export class PriceAgent extends AgentBase {
  constructor() {
    super({
      key: 'price',
      description: 'Bảng giá dịch vụ và ước tính chi phí theo khối lượng (kg).',
      systemInstruction: SYSTEM_PROMPT,
      tools: BaseTools.compose(
        new ServiceTools({ only: [TOOL_NAME.getServices, TOOL_NAME.getService, TOOL_NAME.estimateCost] }),
        new LanguageTools()
      ),
    })
  }
}

export default PriceAgent
