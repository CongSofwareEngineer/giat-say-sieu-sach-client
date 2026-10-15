import BaseAPI from '@/config/baseApi'
import { BRANCH_CACHE_DURATION, BRANCH_SOCIAL, FULL_LIST_LIMIT, LOCAL_STORAGE_KEY } from '@/constants/app'

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
  openingHours?: string
  socialMedia?: Partial<Record<BRANCH_SOCIAL, string>>
  isActive?: boolean
}

// Sent socialMedia replaces all links on update (empty link = removed)
export type BranchPayload = {
  name: string
  address: string
  district: string
  city: string
  phone: string
  openingHours?: string
  socialMedia?: Partial<Record<BRANCH_SOCIAL, string>>
  isActive?: boolean
}

type ListResponse = { data: BranchItem[] }

const getCachedBranches = (): {
  data: BranchItem[]
  timestamp: number
} | null => {
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

// Drop the local cache so this browser sees admin changes right away
const clearCachedBranches = (): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY.branches)
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

  // Admin: all branches, hidden ones included
  async getAdminBranches(): Promise<BranchItem[]> {
    const response = await this.get<ListResponse>(`/admin?limit=${FULL_LIST_LIMIT}`, { isUseAuth: true })

    return response?.data ?? []
  }

  async createBranch(payload: BranchPayload): Promise<BranchItem> {
    const response = await this.post<{ data: BranchItem }>('', payload, {
      isUseAuth: true,
    })

    clearCachedBranches()

    return response.data
  }

  async updateBranch(id: string, payload: Partial<BranchPayload>): Promise<BranchItem> {
    const response = await this.patch<{ data: BranchItem }>(`/${id}`, payload, {
      isUseAuth: true,
    })

    clearCachedBranches()

    return response.data
  }

  async deleteBranch(id: string): Promise<void> {
    await this.delete<{ data: null }>(`/${id}`, { isUseAuth: true })

    clearCachedBranches()
  }
}

// Unique province names that have at least one branch
export const getBranchCities = (branches: BranchItem[]): string[] => {
  return Array.from(new Set(branches.map((b) => b.city?.trim()).filter((city): city is string => !!city)))
}

const BranchService = new BranchApi('branches')

export default BranchService
