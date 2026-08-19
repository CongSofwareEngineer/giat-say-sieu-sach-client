import { LocationResponse, Province, District } from './type'

const ESGOO_BASE = 'https://esgoo.net/api-tinhthanh-new'

class LocationApi {
  private async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getProvinces(): Promise<Province[]> {
    const response = await this.fetchJson<LocationResponse<Province>>(`${ESGOO_BASE}/1/0.htm`)

    return response.data ?? []
  }

  async getDistricts(provinceId: number): Promise<District[]> {
    const response = await this.fetchJson<LocationResponse<District>>(`${ESGOO_BASE}/2/${provinceId}.htm`)

    return response.data ?? []
  }

  async getFullData(): Promise<Province[]> {
    const response = await this.fetchJson<LocationResponse<Province>>(`${ESGOO_BASE}/4/0.htm`)

    return response.data ?? []
  }

  async getLocationName(id: number): Promise<string> {
    const response = await this.fetchJson<{ data: { TenTinhThanh?: string; TenQuanHuyen?: string; TenPhuongXa?: string } }>(
      `${ESGOO_BASE}/5/${id}.htm`
    )

    const item = response.data

    if (!item) return ''

    return item.TenTinhThanh || item.TenQuanHuyen || item.TenPhuongXa || ''
  }
}

const LocationService = new LocationApi()

export default LocationService
