/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://giatsaysieusach.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/admin/*', '/api/*'],
  robotsTxtPolicies: [
    {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
  ],
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
}
