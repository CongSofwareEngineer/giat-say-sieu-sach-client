export const SITE_CONFIG = {
  title: 'Giặt Ủi Siêu Sạch',
  description: 'Dịch vụ giặt ủi cao cấp, giao nhận tận nơi, siêu nhanh, đúng hẹn, chất lượng cao. Đặt lịch ngay!',
  url: 'https://giatuisieusach.vercel.app',
  icon: '/logo.png',
  thumbnail: '/thumbnail.png',
  keywords: ['giặt ủi', 'giặt ủi siêu sạch', 'giặt đồ', 'ủi đồ', 'giao nhận tận nơi', 'dịch vụ giặt ủi'],
}

export const GG_TAG = {
  googleSiteVerification: 'google-site-verification=oA6Bz4KcCgiCa-HsdXlGp6OCFFxqAtXRelfbiNrSvwY',
}

export enum INFO_CONTACT {
  Mail = 'mailto:contact@giatsaysieusach.com',
  Phone = '+84-392-225-405',
  Address = 'Tân Bình, Sài Gòn, Việt Nam',
  Facebook = 'https://facebook.com/giatsaysieusach',
  Zalo = 'https://zalo.me/giatsaysieusach',
}

export const IS_PRODUCTION = process.env.NEXT_PUBLIC_ENV === 'production'

// Primary colors
export const COLORS = {
  primary: '#0A6F87',
  secondary: '#007F6A',
  accent: '#FFC857',
  background: '#F8FBFD',
  card: '#FFFFFF',
  border: '#E7EEF5',
  text: '#1F2937',
  footer: '#0F172A',
}

// Order statuses (must match server OrderStatus enum)
export enum ORDER_STATUS {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  WASHING = 'WASHING',
  DRYING = 'DRYING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const MAX_PIXEL_REDUCE = 300 as number
export const MAX_COMMENT_IMAGES = 5 as number
export const MAX_AVATAR_FILE_SIZE = (5 * 1024 * 1024) as number
export const PAGE_SIZE = 10 as number
