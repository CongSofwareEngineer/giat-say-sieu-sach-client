import type { NextConfig } from 'next'

const path = require('path')
const isProduction = process.env.NEXT_PUBLIC_ENV === 'production'

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  // Bổ sung đầy đủ các gói ESM liên quan đến BlockNote và encoding
  transpilePackages: [
    '@blocknote/server-util',
    '@blocknote/core',
    'html-encoding-sniffer',
    '@exodus/bytes',
    'whatwg-url',
    'zustand',
    '@tanstack/react-query',
    'query-string',
  ],

  // Uploaded images (avatar, blog thumbnail, comment images) are served from Cloudinary
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' }],
  },

  // ⚠️ Xóa dòng serverExternalPackages bên dưới để Turbopack/Next.js transpile ESM bình thường:
  // serverExternalPackages: ['@blocknote/server-util'],

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
