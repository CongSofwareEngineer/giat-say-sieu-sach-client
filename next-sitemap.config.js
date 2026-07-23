/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://hdcong.vercel.app/',
  generateRobotsTxt: true,
  transform: async (config, path) => {
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1,
        lastmod: new Date().toISOString(),
      };
    }
    return {
      loc: path,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date().toISOString(),
    };
  }
}