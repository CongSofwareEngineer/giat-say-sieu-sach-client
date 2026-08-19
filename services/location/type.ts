export type Province = {
  id: string
  code: string
  name: string
  name_en: string
  full_name: string
  full_name_en: string
  latitude: string
  longitude: string
}

export type District = {
  id: string
  code: string
  name: string
  name_en: string
  full_name: string
  full_name_en: string
  latitude: string
  longitude: string
}

export type LocationResponse<T> = {
  error: number
  error_text: string
  data_name: string
  data: T[]
}
