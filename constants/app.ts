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
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
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

// Loyalty points redemption at booking (must match server LOYALTY_POINTS): 100 points = 5,000 VND
export const LOYALTY_REDEEM = {
  POINTS_STEP: 100,
  VND_PER_STEP: 5000,
} as const

// Fixed discount when the total weight is strictly above MIN_KG (must match server WEIGHT_DISCOUNT)
export const WEIGHT_DISCOUNT = {
  MIN_KG: 10,
  AMOUNT: 10000,
} as const

// Normal order flow shown on the tracking timeline (CANCELLED is shown separately)
export const ORDER_STATUS_STEPS: ORDER_STATUS[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.RECEIVED,
  ORDER_STATUS.WASHING,
  ORDER_STATUS.DRYING,
  ORDER_STATUS.READY,
  ORDER_STATUS.COMPLETED,
]

// Admin can still edit the order weight in these statuses (locked once washing starts)
export const ORDER_EDITABLE_STATUSES: ORDER_STATUS[] = [ORDER_STATUS.PENDING, ORDER_STATUS.RECEIVED]

// Customers can only cancel a just-placed order
export const CANCELLABLE_ORDER_STATUS = ORDER_STATUS.PENDING

// Server rejects passwords shorter than this
export const MIN_PASSWORD_LENGTH = 4 as number

// Forgot password: digits of the email OTP and wait before asking for a new one (must match server)
export const OTP_LENGTH = 6 as number
export const OTP_RESEND_SECONDS = 60 as number

// How long the "Copied" state stays on a copy button (ms)
export const COPY_FEEDBACK_DURATION = 2000 as number

export const MAX_PIXEL_REDUCE = 300 as number
export const MAX_COMMENT_IMAGES = 3 as number
export const MAX_COMMENT_CONTENT_LENGTH = 200 as number
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
// In-app notifications (Header bell); the server only sends `type` + `data`, the text comes from `notification.types.*`
export enum NOTIFICATION_TYPE {
  ORDER_STATUS = 'ORDER_STATUS',
}

export const NOTIFICATION_INBOX = {
  pageSize: 20,
  // Fallback refresh when no push arrives (push also refreshes the list right away)
  refetchIntervalMs: 60_000,
} as const

export const TRACK_ORDER_PATH = '/track-order'

export const PROFILE_PATH = '/profile'
export const PROFILE_REFERRALS_PATH = '/profile/referrals'
// `/profile?tab=<ProfileTab>` opens that tab (used when leaving the referral page from the sidebar)
export const PROFILE_TAB_QUERY = 'tab'

// Referral link `<site>/?ref=<code>`: the referrer earns COMMISSION_RATE of each completed order of the referred customer as points
// (must match server REFERRAL)
export const REFERRAL = {
  QUERY_PARAM: 'ref',
  COMMISSION_RATE: 0.05,
  CODE_MAX_LENGTH: 20,
  CODE_REGEX: /^[a-zA-Z0-9]+$/,
  PAGE_SIZE: 10,
} as const

// Share dialogs opened with an encoded URL appended
export const SHARE_URL = {
  FACEBOOK: 'https://www.facebook.com/sharer/sharer.php?u=',
} as const

// Firebase Auth error codes when the customer closes the Google popup: not an error to show
export const FIREBASE_POPUP_CANCEL_CODES: readonly string[] = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request']

export enum LOCAL_STORAGE_KEY {
  branches = 'branches_cache',
  // v2: old cache held only the first 20 FAQs
  faqs = 'faqs_cache_v2',
  bookingAddress = 'booking_address',
  // Firebase Installation ID of this device, the push notification target
  fcmFid = 'fcm_fid',
  // Referral code of the last `?ref=` link this device opened, sent when a new account is created
  referralCode = 'referral_code',
}

// Branch list is refetched from the API once the local cache is older than this
export const BRANCH_CACHE_DURATION = (24 * 60 * 60 * 1000) as number

// FAQ list is refetched from the API once the local cache is older than this
export const FAQ_CACHE_DURATION = (3 * 24 * 60 * 60 * 1000) as number

// Small lists (FAQs, branches) are loaded in one request; matches the server FAQ cap
export const FULL_LIST_LIMIT = 100 as number

// FAQ categories (values are stored on the server, labels come from admin.faqs.categories.<value>)
export enum FAQ_CATEGORY {
  SERVICE = 'dich-vu',
  PRICE = 'gia-ca',
  DELIVERY = 'giao-hang',
  PROMOTION = 'khuyen-mai',
  OTHER = 'khac',
}

// Branch social links, keys match the server SocialMediaType
export enum BRANCH_SOCIAL {
  FACEBOOK = 'facebook',
  GOOGLE_MAP = 'googleMap',
  TIKTOK = 'tiktok',
  ZALO = 'zalo',
}

// Max length of the note a customer leaves for the admin when booking
export const MAX_BOOKING_NOTE_LENGTH = 300 as number

// Pickup / return time slots (1 hour each) within the shop opening hours 6:00 – 23:00, hours in local time ([start, end))
export const PICKUP_TIME_SLOTS = [
  { start: 6, end: 7 },
  { start: 7, end: 8 },
  { start: 8, end: 9 },
  { start: 9, end: 10 },
  { start: 10, end: 11 },
  { start: 11, end: 12 },
  { start: 12, end: 13 },
  { start: 13, end: 14 },
  { start: 14, end: 15 },
  { start: 15, end: 16 },
  { start: 16, end: 17 },
  { start: 17, end: 18 },
  { start: 18, end: 19 },
  { start: 19, end: 20 },
  { start: 20, end: 21 },
  { start: 21, end: 22 },
  { start: 22, end: 23 },
] as const

// Pickup slot must still be running this many hours from now (0 = the current slot is offered, the shipper comes right away)
export const PICKUP_LEAD_HOURS = 0 as number

// Min gap: a return slot must start at least this many hours after the pickup slot starts (same day allowed)
export const WASH_DURATION_HOURS = 1 as number

// Pickup can be scheduled up to this many days ahead (today included)
export const PICKUP_MAX_DAYS_AHEAD = 7 as number

// Date-only value stored in forms (same as <input type='date'>)
export const INPUT_DATE_FORMAT = 'YYYY-MM-DD'

// Date shown to users and written into the order notes
export const DISPLAY_DATE_FORMAT = 'DD/MM/YYYY'

// Compact date for narrow selects (pickup date options)
export const SHORT_DATE_FORMAT = 'DD/MM'

// How often (ms) the open booking form re-checks that the picked pickup slot has not expired
export const PICKUP_REFRESH_INTERVAL = (60 * 1000) as number

// Shop time zone: promotion dates are compared in it, whatever the server/browser zone is
export const SHOP_TIMEZONE = 'Asia/Ho_Chi_Minh'

// Weight (kg) sent when the customer leaves it empty; the shipper weighs and the admin updates it
export const DEFAULT_ESTIMATED_WEIGHT = 1 as number

// Promotion state, derived from its start/end dates on the client
export enum PROMOTION_STATUS {
  ACTIVE = 'ACTIVE',
  UPCOMING = 'UPCOMING',
  EXPIRED = 'EXPIRED',
}

// Promotion discount types (must match server DiscountType)
export enum PROMOTION_DISCOUNT_TYPE {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

// Allowed discount percent of a promotion
export const PROMOTION_DISCOUNT_RANGE = {
  MIN: 1,
  MAX: 100,
} as const

// Max unfinished orders per phone on the guest booking endpoint (must match server MAX_ACTIVE_ORDERS_PER_PHONE)
export const MAX_ACTIVE_ORDERS_PER_PHONE = 3 as number

// reCAPTCHA v3 (invisible, free tier) protecting the guest booking endpoint; disabled when the site key is empty
// https://console.cloud.google.com/security/recaptcha
export const RECAPTCHA = {
  SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '',
  SCRIPT_URL: 'https://www.google.com/recaptcha/api.js',
  SCRIPT_ID: 'recaptcha-v3-script',
  // Give up waiting for the script / token after this (ms), the server then decides
  TIMEOUT: 10000,
  PRIVACY_URL: 'https://policies.google.com/privacy',
  TERMS_URL: 'https://policies.google.com/terms',
} as const

// reCAPTCHA v3 action names (must match server RecaptchaAction)
export enum RECAPTCHA_ACTION {
  GUEST_ORDER = 'guest_order',
}

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
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Origins allowed to call the internal API proxies (app/api/*)
export const ALLOWED_ORIGINS: readonly string[] = [SITE_CONFIG.url, 'http://localhost:3000', 'http://localhost:3001']

// Province/ward data: upstream esgoo API is proxied through our own route (esgoo sends no CORS headers)
export const LOCATION_API = {
  upstream: 'https://esgoo.net/api-tinhthanh-new',
  proxy: '/api/location',
  // Allowed proxy paths: `<level>/<id>.htm` (1 provinces, 2 wards, 4 full data, 5 name lookup)
  pathRegex: /^[1245]\/\d{1,6}\.htm$/,
  cacheSeconds: 24 * 60 * 60,
} as const
