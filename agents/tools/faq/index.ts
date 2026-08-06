import { BaseTools, pickTools, type ToolDefinition, type ToolSetOptions } from '../base'

import { TOOL_NAME } from '@/constants/tools'

// Static common questions handled by the shop (small FAQ set)
export const FAQ_ITEMS = [
  {
    id: '1',
    question: 'Dịch vụ giặt ủi mất bao lâu?',
    answer: 'Thông thường từ 2 đến 4 tiếng tùy loại đồ. Có thể giao nhanh trong ngày theo yêu cầu.',
  },
  {
    id: '2',
    question: 'Có nhận và giao đồ tận nơi không?',
    answer: 'Có, chúng tôi nhận và giao đồ tận nơi trong khu vực phục vụ miễn phí hoặc theo chính sách từng chi nhánh.',
  },
  {
    id: '3',
    question: 'Thanh toán như thế nào?',
    answer: 'Khách có thể thanh toán khi nhận đồ bằng tiền mặt hoặc chuyển khoản.',
  },
  {
    id: '4',
    question: 'Đặt lịch giặt ủi bằng cách nào?',
    answer: 'Gọi hotline, nhắn Zalo/Facebook hoặc đặt trực tiếp trên website để được tư vấn và hẹn giờ lấy đồ.',
  },
  {
    id: '5',
    question: 'Có nhận giặt các loại đồ đặc biệt như chăn ga, rèm không?',
    answer: 'Có, chúng tôi nhận giặt chăn ga, rèm cửa và nhiều loại đồ đặc biệt khác.',
  },
]

const buildFaqTools = (): ToolDefinition<any, unknown>[] => [
  // Return all common questions so the assistant can answer precisely
  {
    name: TOOL_NAME.getFaq,
    description: 'Return the list of common questions and answers (FAQ) about the laundry service.',
    handler: async () => FAQ_ITEMS,
  },
]

// Small FAQ tool set for common questions about the shop
export class FaqTools extends BaseTools {
  constructor(options: ToolSetOptions = {}) {
    super()

    this.register(...pickTools(buildFaqTools(), options.only))
  }
}

export default FaqTools
