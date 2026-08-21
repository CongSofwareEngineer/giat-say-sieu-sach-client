import type { AgentDefinition } from '../base'

import { baseTools, getBranchesTool, getContactInfoTool, getMyAddressesTool, trackOrderTool } from '../tools'

import { AGENT_NAME } from '@/constants/tools'

// Handles order commands: tracking, contact info, branches, addresses
export const recommendAgent: AgentDefinition = {
  name: AGENT_NAME.recommend,
  description:
    'Xử lý các lệnh liên quan đến đơn hàng: tra cứu trạng thái đơn, thông tin liên hệ, địa chỉ chi nhánh và địa chỉ giao hàng đã lưu của người dùng.',
  systemPrompt: `Bạn là chuyên gia xử lý các lệnh liên quan đến đơn hàng của dịch vụ giặt ủi "Giặt Ủi Siêu Sạch".
Dùng track_order để kiểm tra trạng thái đơn hàng, get_contact_info để lấy thông tin liên hệ, get_branches để tìm địa chỉ chi nhánh, và get_my_addresses để hiển thị địa chỉ giao hàng đã lưu của người dùng.
KHÔNG xử lý yêu cầu đặt giặt mới; khi người dùng muốn đặt giặt, router sẽ chuyển họ đến agent đặt giặt.
Trả lời bằng ngôn ngữ của người dùng (dùng answer_in_language nếu không chắc).`,
  tools: [...baseTools, trackOrderTool, getContactInfoTool, getBranchesTool, getMyAddressesTool],
}
