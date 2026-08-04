import { mockServices } from './mockData'

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type PriceItem = {
  id: string
  name: string
  price: number
}

// Fetch all prices
export const fetchPrices = async (): Promise<PriceItem[]> => {
  await delay(500)

  return mockServices
}

// Fetch single price by id
export const fetchPriceById = async (id: string): Promise<PriceItem | undefined> => {
  await delay(300)

  return mockServices.find((s) => s.id === id)
}
