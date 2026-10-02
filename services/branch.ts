import BaseAPI from '@/config/baseApi'
import { BRANCH_CACHE_DURATION, LOCAL_STORAGE_KEY } from '@/constants/app'

export type BranchItem = {
  id: string
  name: string
  // Street / house number only
  address: string
  // Ward (phường/xã), matches LocationApi ward name
  district: string
  // Province name, matches LocationApi province name
  city: string
  phone?: string
  workingHours?: string
}

type ListResponse = { data: BranchItem[] }

const getCachedBranches = (): { data: BranchItem[]; timestamp: number } | null => {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY.branches)

    if (!cached) return null

    return JSON.parse(cached) as { data: BranchItem[]; timestamp: number }
  } catch {
    return null
  }
}

const setCachedBranches = (data: BranchItem[]): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY.branches, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {}
}

const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < BRANCH_CACHE_DURATION
}

class BranchApi extends BaseAPI {
  // Serve branches from localStorage, refetch once the cache is older than 1 day
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

// Unique province names that have at least one branch
export const getBranchCities = (branches: BranchItem[]): string[] => {
  return Array.from(new Set(branches.map((b) => b.city?.trim()).filter((city): city is string => !!city)))
}

const BranchService = new BranchApi('branches')

export default BranchService
