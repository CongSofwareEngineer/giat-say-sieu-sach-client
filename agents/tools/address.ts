import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import AddressService, { formatAddress } from '@/services/address'
import { translate } from '@/utils/language'

// Get the user saved delivery addresses from their profile
export const getMyAddressesTool: AgentTool = {
  name: TOOL_NAME.getMyAddresses,
  description:
    'Get the logged in user OWN saved delivery addresses from their profile. Only use it when the user explicitly asks about their saved addresses, not for the shop address.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async (_args, ctx) => {
    // Saved addresses need a logged in user (GET /addresses/me is authenticated)
    if (!ctx?.userId) return translate('agent.address.requireLogin', {}, 'Bạn cần đăng nhập để xem địa chỉ đã lưu.')

    const addresses = await AddressService.getMyAddresses()

    if (addresses.length === 0) return translate('agent.address.empty', {}, 'Bạn chưa có địa chỉ nào được lưu trong hồ sơ.')

    return addresses
      .map((a, i) =>
        translate(
          'agent.address.item',
          {
            index: i + 1,
            address: formatAddress(a),
            phone: a.phone,
          },
          `${i + 1}. ${formatAddress(a)} (${a.phone})`
        )
      )
      .join('\n')
  },
}
