import type { Metadata, Viewport } from 'next'

import './globals.css'
import MyDrawer from '../components/MyDrawer/index'
import Header from '../components/Header'
import Footer from '../components/Footer'
import FloatingChat from '../components/FloatingChat'
import NotificationProvider from '../components/NotificationProvider/index'
import Toast from '../components/Toast'

import { GG_TAG, INFO_CONTACT, IS_PRODUCTION, SITE_CONFIG } from '@/constants/app'
import { organizationSchema, toJsonLd, webSiteSchema } from '@/config/seo'
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
  alternates: { canonical: `${SITE_CONFIG.url}/` },
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
    google: IS_PRODUCTION ? GG_TAG.googleSiteVerification : '',
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
  interactiveWidget: 'resizes-content',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='vi' className='h-full antialiased'>
      <head>
        <script dangerouslySetInnerHTML={{ __html: toJsonLd(organizationSchema()) }} type='application/ld+json' />
        <script dangerouslySetInnerHTML={{ __html: toJsonLd(webSiteSchema()) }} type='application/ld+json' />
        {IS_PRODUCTION && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GG_TAG.gmt}');`,
            }}
          />
        )}
      </head>
      <body className='min-h-full flex flex-col bg-background text-text'>
        {IS_PRODUCTION && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GG_TAG.gmt}`}
              height='0'
              width='0'
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <ReactQuery>
          <ClientRender>
            <Header />
            <main className='flex-1 pt-16 lg:pt-20'>{children}</main>
            <Footer />
            <MyModal />
            <MyDrawer />
            <FloatingChat />
            <NotificationProvider />
            <Toast />
          </ClientRender>
        </ReactQuery>
      </body>
    </html>
  )
}
