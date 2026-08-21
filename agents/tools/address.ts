import type { AgentTool } from '../base'

import { TOOL_NAME } from '@/constants/tools'
import AddressService, { formatAddress } from '@/services/address'
import { translate } from '@/utils/language'

// Get the user saved delivery addresses from their profile
export const getMyAddressesTool: AgentTool = {
  name: TOOL_NAME.getMyAddresses,
  description: 'Get the user saved delivery addresses from their profile.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async () => {
    const addresses = await AddressService.getMyAddresses()

    if (addresses.length === 0) return translate('agent.address.empty', {}, 'Bạn chưa có địa chỉ nào được lưu trong hồ sơ.')

    return addresses
      .map((a, i) =>
        translate(
          'agent.address.item',
          {
            index: i + 1,
            label: a.label || translate('common.address', {}, 'Địa chỉ'),
            address: formatAddress(a),
            name: a.recipientName,
            phone: a.phone,
          },
          `${i + 1}. ${a.label || 'Địa chỉ'}: ${formatAddress(a)} (${a.recipientName}, ${a.phone})`
        )
      )
      .join('\n')
  },
}
