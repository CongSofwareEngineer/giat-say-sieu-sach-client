import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cleanDistDir: true,
  compress: true,
  i18n: {
    locales: ['vi'],
    defaultLocale: 'vi',
  },
  productionBrowserSourceMaps: process.env.NEXT_PUBLIC_ENV === 'production',
  enablePrerenderSourceMaps: process.env.NEXT_PUBLIC_ENV === 'production',
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NEXT_PUBLIC_ENV === 'production',
  },
}

export default nextConfig
