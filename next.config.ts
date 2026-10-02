import type { NextConfig } from 'next'

const path = require('path')
const isProduction = process.env.NEXT_PUBLIC_ENV === 'production'

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  transpilePackages: ['zustand', '@tanstack/react-query', 'query-string'],
  // Uploaded images (avatar, blog thumbnail, comment images) are served from Cloudinary
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' }],
  },
  // Required by @blocknote/server-util to render blog content in Server Components
  serverExternalPackages: ['@blocknote/server-util', 'html-encoding-sniffer'],

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
