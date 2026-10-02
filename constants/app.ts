import { PHASE_PRODUCTION_BUILD } from 'next/constants'

export const SITE_CONFIG = {
  title: 'Giặt Ủi Siêu Sạch',
  description: 'Dịch vụ giặt ủi cao cấp, giao nhận tận nơi, siêu nhanh, đúng hẹn, chất lượng cao. Đặt lịch ngay!',
  url: 'https://giatuisieusach.vercel.app',
  icon: '/logo.png',
  thumbnail: '/thumbnail.png',
  keywords: ['giặt ủi', 'giặt ủi siêu sạch', 'giặt đồ', 'ủi đồ', 'giao nhận tận nơi', 'dịch vụ giặt ủi'],
}

export const GG_TAG = {
  googleSiteVerification: 'oA6Bz4KcCgiCa-HsdXlGp6OCFFxqAtXRelfbiNrSvwY',
  gmt: 'GTM-K4HQXFDS',
}

export enum INFO_CONTACT {
  Mail = 'mailto:hodiencong2000@gmail.com',
  Phone = '+84-392-225-405',
  Address = 'Tân Bình, Sài Gòn, Việt Nam',
  Facebook = 'https://facebook.com/giatuisieusach',
  Zalo = 'https://zalo.me/giatuisieusach',
}

export const IS_PRODUCTION = process.env.NEXT_PUBLIC_ENV === 'production'

// Seconds the Next server caches public API GETs, so visits share one backend call (avoids 429 rate limits)
export const API_CACHE_SECONDS = 60 as number

// True only while `next build` prerenders pages (always false in the browser)
export const IS_BUILD_PHASE = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD

// HTTP status codes checked on API errors
export enum HTTP_STATUS {
  NOT_FOUND = 404,
}

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

// Customer tiers, ranked from lowest to highest
export enum CUSTOMER_TIER {
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  DIAMOND = 'DIAMOND',
}

// Min loyalty points per tier (server awards 1 point per 1,000 VND of completed orders)
export const CUSTOMER_TIER_MIN_POINTS: Record<CUSTOMER_TIER, number> = {
  [CUSTOMER_TIER.SILVER]: 0,
  [CUSTOMER_TIER.GOLD]: 1000,
  [CUSTOMER_TIER.DIAMOND]: 3000,
}

export const MAX_PIXEL_REDUCE = 300 as number
export const MAX_COMMENT_IMAGES = 5 as number
export const MAX_AVATAR_FILE_SIZE = (5 * 1024 * 1024) as number
export const PAGE_SIZE = 10 as number
// Recent orders shown in the chat order list
export const MAX_CHAT_ORDERS = 4 as number

// Image upload folders (must match server CloudinaryFolder enum)
export enum UPLOAD_IMAGE_TYPE {
  AVATAR = 'avatars',
  BLOG = 'blogs',
  COMMENT = 'comments',
}

// Max files the server accepts in one upload request
export const MAX_IMAGES_PER_UPLOAD = 10 as number

// localStorage keys
export enum LOCAL_STORAGE_KEY {
  branches = 'branches_cache',
  bookingAddress = 'booking_address',
}

// Branch list is refetched from the API once the local cache is older than this
export const BRANCH_CACHE_DURATION = (24 * 60 * 60 * 1000) as number

// Max length of the note a customer leaves for the admin when booking
export const MAX_BOOKING_NOTE_LENGTH = 300 as number

// Where a laundry booking was placed, written into the order notes
export enum BOOKING_SOURCE {
  CHAT = 'chat',
  PAGE = 'page',
}

// Review services, hardcoded to avoid an extra API call (ids must match server laundry-categories)
export const COMMENT_SERVICES = [
  { id: '6a814b764113b12195b721b4', labelKey: 'reviews.services.regular' },
  { id: '6a814d17cb229e82586f4817', labelKey: 'reviews.services.express' },
  { id: '6a814d17cb229e82586f481a', labelKey: 'reviews.services.dryClean' },
  { id: '6a814b774113b12195b721bd', labelKey: 'reviews.services.ironing' },
] as const

// Vietnamese mobile phone in local form (0 + 9 digits)
export const VN_LOCAL_PHONE_REGEX = /^0[0-9]{9}$/
