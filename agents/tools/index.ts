// Tool registry. Import and export every tool here so new tools are easy to
// add: create the file, export it here, then attach it to the right agents.

export { answerInLanguageTool } from './language'
export { getFaqTool } from './faq'
export { estimateCostTool, getServiceTool, getServicesTool } from './price'
export { getPromotionsTool } from './promotion'
export { getBranchesTool, getContactInfoTool, trackOrderTool } from './order'
export { getMyAddressesTool } from './address'
export { openLaundryFormTool } from './laundry'
export { searchTool } from './search'

// Default tool set every agent gets (language + search)
import type { AgentTool } from '../base'

import { answerInLanguageTool } from './language'
import { searchTool } from './search'

export const baseTools: AgentTool[] = [answerInLanguageTool, searchTool]
