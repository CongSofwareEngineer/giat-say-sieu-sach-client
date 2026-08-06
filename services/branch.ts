import BaseAPI from '@/config/baseApi'

export type BranchItem = {
  id: string
  name: string
  address: string
  phone?: string
  workingHours?: string
}

type ListResponse = { data: BranchItem[] }

class BranchApi extends BaseAPI {
  // Fetch all laundry branches from the backend
  async getBranches(): Promise<BranchItem[]> {
    const response = await this.get<ListResponse>('')

    return response.data
  }
}

const BranchService = new BranchApi('branches')

export default BranchService
