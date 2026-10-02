import type { Metadata } from 'next'
import type { BlogPost as BlogPostApi } from '@/services/blogClient'
import type { PricingPlan } from '@/services/pricing'

import { INFO_CONTACT, IS_PRODUCTION, SITE_CONFIG } from '@/constants/app'

export type JsonLd = Record<string, unknown>

// Default SEO config, single source of truth for metadata & structured data
export const seo = {
  siteName: SITE_CONFIG.title,
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  url: SITE_CONFIG.url,
  icon: SITE_CONFIG.icon,
  thumbnail: SITE_CONFIG.thumbnail,
  keywords: SITE_CONFIG.keywords,
  locale: 'vi_VN',
  telephone: '+84392225405',
  email: INFO_CONTACT.Mail.replace('mailto:', ''),
  address: {
    streetAddress: 'Tân Bình',
    addressLocality: 'Thành phố Hồ Chí Minh',
    addressRegion: 'Hồ Chí Minh',
    postalCode: '70000',
    addressCountry: 'VN',
  },
  geo: {
    latitude: 10.79,
    longitude: 106.652201,
  },
  openingHours: 'Mo-Su 08:00-20:00',
  priceRange: '15.000₫ - 80.000₫',
  foundingDate: '2018',
  socials: {
    facebook: INFO_CONTACT.Facebook,
    zalo: INFO_CONTACT.Zalo,
  },
}

const absolute = (path: string): string => `${seo.url}${path}`

// Site-wide base metadata with all default fields; pages can override via args
export const generateMetaBase = (overrides?: Metadata): Metadata => ({
  metadataBase: new URL(seo.url),
  title: {
    default: seo.title,
    template: `%s - ${seo.siteName}`,
  },
  description: seo.description,
  keywords: seo.keywords,
  applicationName: seo.siteName,
  bookmarks: seo.url,
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: { url: seo.icon },
    shortcut: { url: seo.icon },
    apple: { url: seo.icon },
  },
  appleWebApp: {
    title: seo.siteName,
    capable: true,
  },
  verification: {
    ...(IS_PRODUCTION ? { google: '-SD7kSWHZKEXxbtkWRvn1r5wtOy8o6Gv0wDuA_ituHk' } : {}),
  },
  openGraph: {
    type: 'website',
    locale: seo.locale,
    siteName: seo.siteName,
    url: seo.url,
    title: seo.title,
    description: seo.description,
    images: [{ url: absolute(seo.thumbnail), width: 1200, height: 630, alt: seo.siteName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
    images: [absolute(seo.thumbnail)],
  },
  ...overrides,
})

// Serialize JSON-LD and escape < to prevent XSS in script tag
export const toJsonLd = (data: JsonLd): string => JSON.stringify(data).replace(/</g, '\\u003c')

// Generic Organization schema, safe to render on every page
export const organizationSchema = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${seo.url}/#organization`,
  name: seo.siteName,
  url: seo.url,
  logo: {
    '@type': 'ImageObject',
    url: absolute(seo.icon),
    width: 512,
    height: 512,
  },
  image: absolute(seo.thumbnail),
  description: seo.description,
  foundingDate: seo.foundingDate,
  email: seo.email,
  telephone: seo.telephone,
  sameAs: [seo.socials.facebook, seo.socials.zalo],
})

// Generic WebSite schema, safe to render on every page
export const webSiteSchema = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${seo.url}/#website`,
  name: seo.siteName,
  url: seo.url,
  description: seo.description,
  inLanguage: 'vi-VN',
  publisher: { '@id': `${seo.url}/#organization` },
})

type BreadcrumbItem = {
  name: string
  path: string
}

// Build BreadcrumbList schema from a { name, path } trail
export const breadcrumbSchema = (items: BreadcrumbItem[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absolute(item.path),
  })),
})

export type ServiceOffer = {
  name: string
  price: string
  description?: string
}

// Map pricing plans from the API to schema offers
export const toServiceOffers = (plans: PricingPlan[]): ServiceOffer[] =>
  plans.map((plan) => ({ name: plan.name, price: String(plan.price), description: plan.description }))

// Core services offered, reused by LocalBusiness, Service and home schemas
export const SERVICE_OFFERS: ServiceOffer[] = [
  { name: 'Giặt Thường', price: '25000', description: 'Giặt máy tiêu chuẩn, sấy khô hoàn toàn' },
  { name: 'Giặt Nhanh', price: '40000', description: 'Xử lý ưu tiên, giao trong 4-6 giờ' },
  { name: 'Giặt Khô', price: '80000', description: 'Cho vest, comple, áo dài, đồ hiệu' },
  { name: 'Ủi', price: '15000', description: 'Ủi phẳng, thẳng nếp, chuyên nghiệp' },
  { name: 'Giặt + Ủi', price: '50000', description: 'Combo tiết kiệm, giặt sạch và ủi đẹp' },
]

// LocalBusiness schema with contact, geo, hours, offers and rating
export const localBusinessSchema = (offers: ServiceOffer[] = []): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${seo.url}/#localbusiness`,
  name: seo.siteName,
  url: seo.url,
  logo: { '@type': 'ImageObject', url: absolute(seo.icon) },
  image: absolute(seo.thumbnail),
  description: seo.description,
  email: seo.email,
  telephone: seo.telephone,
  address: { '@type': 'PostalAddress', ...seo.address },
  geo: { '@type': 'GeoCoordinates', ...seo.geo },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '20:00',
    },
  ],
  priceRange: seo.priceRange,
  areaServed: { '@type': 'City', name: 'Hồ Chí Minh' },
  ...(offers.length > 0 && {
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Dịch vụ giặt ủi',
      itemListElement: offers.map((offer) => ({
        '@type': 'Offer',
        name: offer.name,
        description: offer.description,
        price: offer.price,
        priceCurrency: 'VND',
      })),
    },
  }),
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '1287',
  },
  sameAs: [seo.socials.facebook, seo.socials.zalo],
})

type FaqItem = {
  question: string
  answer: string
}

// Build FAQPage schema from question/answer pairs
export const faqSchema = (items: FaqItem[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
})

// Service schema with pricing from the API offers for the price list page
export const serviceSchema = (offers: ServiceOffer[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${seo.url}/#service`,
  serviceType: 'Dịch vụ giặt ủi tại nhà',
  name: 'Dịch vụ giặt ủi, giặt khô và ủi đồ tại nhà',
  description:
    'Dịch vụ giặt ủi cao cấp, giao nhận tận nơi, siêu nhanh, đúng hẹn tại TP.HCM với nhiều gói từ giặt thường, giặt nhanh đến giặt khô cao cấp.',
  url: absolute('/pricing'),
  provider: { '@id': `${seo.url}/#localbusiness` },
  areaServed: 'Hồ Chí Minh',
  isRelatedTo: { '@id': `${seo.url}/#localbusiness` },
  ...(offers.length > 0 && {
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'VND',
      lowPrice: String(Math.min(...offers.map((offer) => Number(offer.price)))),
      highPrice: String(Math.max(...offers.map((offer) => Number(offer.price)))),
      offerCount: offers.length,
      offers: offers.map((offer) => ({
        '@type': 'Offer',
        name: offer.name,
        price: offer.price,
        priceCurrency: 'VND',
        availability: 'https://schema.org/InStock',
      })),
    },
  }),
})

// AboutPage schema
export const aboutPageSchema = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: `Giới thiệu - ${seo.siteName}`,
  url: absolute('/about'),
  description: seo.description,
  inLanguage: 'vi-VN',
  mainEntity: { '@id': `${seo.url}/#organization` },
})

// ContactPage schema
export const contactPageSchema = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: `Liên hệ - ${seo.siteName}`,
  url: absolute('/contact'),
  description: `Liên hệ ${seo.siteName} qua hotline ${seo.telephone}, email ${seo.email} hoặc ghé thăm tại ${seo.address.streetAddress}, ${seo.address.addressLocality}.`,
  inLanguage: 'vi-VN',
  mainEntity: { '@id': `${seo.url}/#localbusiness` },
})

type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  publishedTime: string
  minutes: number
}

// Blog posts mirroring public/assets/language for structured data
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: '10-meo-giat-quan-ao-dung-cach-de-ben-mau',
    title: '10 Mẹo Giặt Quần Áo Đúng Cách Để Bền Màu',
    excerpt: 'Giặt quần áo tưởng chừng đơn giản nhưng nếu không biết cách, quần áo của bạn sẽ nhanh phai màu và hỏng vải.',
    category: 'Mẹo hay',
    publishedTime: '2024-01-15',
    minutes: 5,
  },
  {
    slug: 'giat-kho-la-gi-khi-nao-nen-dung',
    title: 'Giặt Khô Là Gì? Khi Nào Nên Dùng Dịch Vụ Giặt Khô?',
    excerpt: 'Giặt khô không phải là giặt bằng... không có nước. Đây là quy trình xử lý chuyên biệt cho các loại vải cao cấp.',
    category: 'Kiến thức',
    publishedTime: '2024-01-20',
    minutes: 7,
  },
  {
    slug: 'cach-bao-quan-ao-vest-va-comple',
    title: 'Cách Bảo Quản Áo Vest và Comple Đúng Cách',
    excerpt: 'Áo vest là item đắt tiền cần được bảo quản kỹ. Hướng dẫn cách giặt, ủi và cất giữ áo vest để luôn như mới.',
    category: 'Bảo quản',
    publishedTime: '2024-02-01',
    minutes: 6,
  },
  {
    slug: '5-dau-hieu-may-giat-cua-ban-dang-bi-hong',
    title: '5 Dấu Hiệu Cho Thấy Máy Giặt Của Bạn Đang Bị Hỏng',
    excerpt: 'Máy giặt cũng có những dấu hiệu cảnh báo trước khi hỏng hẳn. Nếu nhận biết sớm, bạn sẽ tránh được những sự cố tốn kém.',
    category: 'Mẹo hay',
    publishedTime: '2024-02-10',
    minutes: 4,
  },
  {
    slug: 'giat-giu-tiet-kiem-nuoc-thoi-quen-xanh',
    title: 'Giặt Giũ Tiết Kiệm Nước: Thói Quen Xanh Cho Gia Đình',
    excerpt: 'Một vài thay đổi nhỏ trong thói quen giặt giũ có thể giúp bạn tiết kiệm hàng nghìn lít nước mỗi năm.',
    category: 'Môi trường',
    publishedTime: '2024-02-18',
    minutes: 5,
  },
  {
    slug: 'giai-ma-cac-ky-hieu-giat-la-tren-quan-ao',
    title: 'Giải Mã Các Ký Hiệu Giặt Là Trên Quần Áo',
    excerpt: 'Những ký hiệu nhỏ xíu trên nhãn mác quần áo thực ra là "kim chỉ nam" giúp bạn bảo vệ trang phục.',
    category: 'Kiến thức',
    publishedTime: '2024-03-01',
    minutes: 8,
  },
]

type BlogPostSeo = Pick<BlogPostApi, 'slug' | 'title' | 'excerpt' | 'publishedAt' | 'createdAt'>

// BlogPosting schema for a single article from the API
export const articleSchema = (post: BlogPostSeo & Pick<BlogPostApi, 'updatedAt' | 'thumbnail' | 'author'>): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.excerpt,
  image: post.thumbnail?.url || absolute(seo.thumbnail),
  datePublished: post.publishedAt || post.createdAt,
  dateModified: post.updatedAt,
  author: post.author ? { '@type': 'Person', name: post.author } : { '@type': 'Organization', name: seo.siteName, url: seo.url },
  publisher: { '@id': `${seo.url}/#organization` },
  mainEntityOfPage: absolute(`/blog/${post.slug}`),
})

// Blog schema for the listing page, built from the API posts
export const blogSchema = (posts: BlogPostSeo[]): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  '@id': `${seo.url}/blog/#blog`,
  name: 'Blog & Tin tức giặt ủi',
  description: 'Mẹo giặt giũ, chăm sóc quần áo và nhiều hơn nữa từ Giặt Ủi Siêu Sạch.',
  url: absolute('/blog'),
  inLanguage: 'vi-VN',
  publisher: { '@id': `${seo.url}/#organization` },
  blogPost: posts.map((post) => ({
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt || post.createdAt,
    url: absolute(`/blog/${post.slug}`),
  })),
})

// WebPage schema for utility pages (booking, tracking)
export const webPageSchema = (name: string, path: string, description: string): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name,
  url: absolute(path),
  description,
  inLanguage: 'vi-VN',
  isPartOf: { '@id': `${seo.url}/#website` },
  about: { '@id': `${seo.url}/#localbusiness` },
})

type PageSeo = {
  title: string
  description: string
  path: string
  keywords?: string[]
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  // Absolute image URL (e.g. blog thumbnail); defaults to the site thumbnail
  image?: string
}

// Build per-page Metadata on top of generateMetaBase defaults
export const buildMetadata = ({
  title,
  description,
  path,
  keywords,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors = [seo.siteName],
  image,
}: PageSeo): Metadata => {
  const pageUrl = absolute(path)
  const ogImage = image ? { url: image, alt: title } : { url: absolute(seo.thumbnail), width: 1200, height: 630, alt: title }

  return generateMetaBase({
    // Absolute title: a plain string in a parent layout (e.g. /blog) would drop the
    // root `%s - siteName` template for nested pages like /blog/[slug]
    title: { absolute: `${title} - ${seo.siteName}` },
    description,
    keywords,
    alternates: { canonical: pageUrl },
    openGraph: {
      type,
      locale: seo.locale,
      siteName: seo.siteName,
      url: pageUrl,
      title: `${title} | ${seo.siteName}`,
      description,
      images: [ogImage],
      ...(type === 'article' && { publishedTime, modifiedTime, authors }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${seo.siteName}`,
      description,
      images: [ogImage.url],
    },
  })
}
