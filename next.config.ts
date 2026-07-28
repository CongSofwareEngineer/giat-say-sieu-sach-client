import type { NextConfig } from 'next'

const path = require('path')
const isProduction = process.env.NEXT_PUBLIC_ENV === 'production'

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  transpilePackages: ['zustand', '@tanstack/react-query', 'query-string'],

  productionBrowserSourceMaps: !isProduction,
  enablePrerenderSourceMaps: !isProduction,
  compress: isProduction,
  reactStrictMode: isProduction,
  cleanDistDir: isProduction,
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', 'zustand'],
  },
  compiler: {
    removeConsole: isProduction,
    styledComponents: {
      ssr: true,
      minify: true,
    },
  },
}

if (!isProduction) {
  nextConfig.allowedDevOrigins = ['localhost', '*.localhost', '192.168.50.253', '*.trycloudflare.com']
}

export default nextConfig
