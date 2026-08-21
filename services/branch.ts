import BaseAPI from '@/config/baseApi'

export type BranchItem = {
  id: string
  name: string
  address: string
  phone?: string
  workingHours?: string
}

type ListResponse = { data: BranchItem[] }

const CACHE_KEY = 'branches_cache'
const CACHE_DURATION = 3 * 24 * 60 * 60 * 1000

const getCachedBranches = (): { data: BranchItem[]; timestamp: number } | null => {
  if (typeof window === 'undefined') return null

  const cached = localStorage.getItem(CACHE_KEY)

  if (!cached) return null

  try {
    const parsed = JSON.parse(cached) as { data: BranchItem[]; timestamp: number }

    return parsed
  } catch {
    return null
  }
}

const setCachedBranches = (data: BranchItem[]): void => {
  if (typeof window === 'undefined') return

  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
}

const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION
}

class BranchApi extends BaseAPI {
  async getBranches(): Promise<BranchItem[]> {
    const cached = getCachedBranches()

    if (cached && isCacheValid(cached.timestamp)) {
      return cached.data
    }

    const response = await this.get<ListResponse>('')

    setCachedBranches(response.data)

    return response.data
  }
}

const BranchService = new BranchApi('branches')

export default BranchService
