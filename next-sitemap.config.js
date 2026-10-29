// next-sitemap runs as a plain node script after the build: load .env* like Next.js does
try {
  require('@next/env').loadEnvConfig(process.cwd())
} catch {}

const API_URL = process.env.NEXT_PUBLIC_API_APP
const BLOG_ENDPOINT = 'blogs'
// Server caps a blog page at this size
const BLOG_PAGE_LIMIT = 100
const BLOG_PATH_PREFIX = '/blog'
// Pages that need login or are not content: keep them out of the sitemap
const PRIVATE_PATHS = ['/admin', '/admin/*', '/api/*', '/login', '/register', '/forgot-password', '/profile', '/profile/*', '/manifest.json']

// Every published blog post (public API only returns published ones); empty list if the API is unreachable
const getBlogPosts = async () => {
  if (!API_URL) return []

  const posts = []
  let page = 1
  let totalPages = 1

  try {
    do {
      const response = await fetch(`${API_URL}/${BLOG_ENDPOINT}?page=${page}&limit=${BLOG_PAGE_LIMIT}`)

      if (!response.ok) break

      const json = await response.json()

      posts.push(...(json?.data ?? []))
      totalPages = json?.meta?.totalPages ?? 1
      page += 1
    } while (page <= totalPages)
  } catch (error) {
    console.warn('[next-sitemap] Could not load blog posts:', error?.message)
  }

  return posts
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://giatuisieusach.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: PRIVATE_PATHS,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/profile'],
      },
    ],
  },
  transform: async (config, path) => {
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1,
        lastmod: new Date().toISOString(),
      }
    }

    if (path.startsWith('/admin')) {
      return null
    }

    return {
      loc: path,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    }
  },
  // Blog posts are dynamic routes, next-sitemap cannot discover them from the build output
  additionalPaths: async () => {
    const posts = await getBlogPosts()

    return posts
      .filter((post) => post?.slug)
      .map((post) => ({
        loc: `${BLOG_PATH_PREFIX}/${post.slug}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date(post.updatedAt || post.publishedAt || Date.now()).toISOString(),
      }))
  },
}
