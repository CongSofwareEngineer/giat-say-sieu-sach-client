import type { Metadata, Viewport } from 'next'

import { Geist, Geist_Mono } from 'next/font/google'

import { ModalProvider } from '@/components'
import './globals.css'
import { INFO_CONTACT, SITE_CONFIG } from '@/constants/app'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s - ${SITE_CONFIG.title}`,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,

  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    emails: INFO_CONTACT.Mail,
    phoneNumbers: ['+84392225405'],
    siteName: SITE_CONFIG.title,
    locale: 'vi',
    images: {
      url: SITE_CONFIG.thumbnail,
      width: 1200,
      height: 630,
      alt: SITE_CONFIG.title,
    },
    url: SITE_CONFIG.url,
    countryName: 'Vietnamese',
    type: 'website',
  },
  bookmarks: SITE_CONFIG.url,
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  applicationName: SITE_CONFIG.title,
  icons: {
    icon: { url: SITE_CONFIG.icon },
    shortcut: { url: SITE_CONFIG.icon },
    apple: { url: SITE_CONFIG.icon },
  },
  // manifest: '/manifest.ts',
  twitter: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: { url: SITE_CONFIG.thumbnail, alt: SITE_CONFIG.title },
    site: SITE_CONFIG.url,
  },
  appleWebApp: {
    title: SITE_CONFIG.title,
    capable: true,
  },
  // <meta name="google-site-verification" content="-SD7kSWHZKEXxbtkWRvn1r5wtOy8o6Gv0wDuA_ituHk" />
  verification: {
    // google: 'YXX_WFs2UUKUX0hoW9cYgZsaKYARrlvneVgGWm7eGx8',
    google: process.env.NEXT_PUBLIC_MODE_PRODUCTION ? '-SD7kSWHZKEXxbtkWRvn1r5wtOy8o6Gv0wDuA_ituHk' : '',
    // me:'YXX_WFs2UUKUX0hoW9cYgZsaKYARrlvneVgGWm7eGx8'
  },
}

export const viewport: Viewport = {
  themeColor: 'white',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {process.env.NEXT_PUBLIC_ENV === 'production' && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'Person',
                  name: SITE_CONFIG.title,
                  url: SITE_CONFIG.url,
                  logo: SITE_CONFIG.icon,
                  description: SITE_CONFIG.description,
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'Tân Bình',
                    addressLocality: 'Sài Gòn',
                    addressCountry: 'Việt nam',
                  },
                  contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: INFO_CONTACT.Phone,
                    contactType: INFO_CONTACT.Mail,
                  },
                }),
              }}
              type='application/ld+json'
            />
          </>
        )}
      </head>
      <body className='min-h-full flex flex-col'>
        {children}
        <ModalProvider />
      </body>
    </html>
  )
}
