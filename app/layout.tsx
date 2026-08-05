import type { Metadata, Viewport } from 'next'

import './globals.css'
import MyDrawer from '../components/MyDrawer/index'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FloatingChat from '../components/FloatingChat'

import { INFO_CONTACT, IS_PRODUCTION, SITE_CONFIG } from '@/constants/app'
import ReactQuery from '@/components/ReactQuery'
import MyModal from '@/components/MyModal'
import ClientRender from '@/components/ClientRender'

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
    phoneNumbers: [INFO_CONTACT.Phone],
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
  verification: {
    google: IS_PRODUCTION ? '-SD7kSWHZKEXxbtkWRvn1r5wtOy8o6Gv0wDuA_ituHk' : '',
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
    <html lang='vi' className='h-full antialiased'>
      <head>
        {IS_PRODUCTION && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'LocalBusiness',
                  name: SITE_CONFIG.title,
                  url: SITE_CONFIG.url,
                  logo: SITE_CONFIG.icon,
                  description: SITE_CONFIG.description,
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: 'Tân Bình',
                    addressLocality: 'Sài Gòn',
                    addressCountry: 'Việt Nam',
                  },
                  contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: INFO_CONTACT.Phone,
                    contactType: 'customer service',
                  },
                  priceRange: '$$',
                  openingHours: 'Mo-Su 08:00-20:00',
                }),
              }}
              type='application/ld+json'
            />
          </>
        )}
      </head>
      <body className='min-h-full flex flex-col bg-background text-text'>
        <ReactQuery>
          <ClientRender>
            <Header />
            <main className='flex-1 pt-16 lg:pt-20'>{children}</main>
            <Footer />
            <MyModal />
            <MyDrawer />
            <FloatingChat />
          </ClientRender>
        </ReactQuery>
      </body>
    </html>
  )
}
