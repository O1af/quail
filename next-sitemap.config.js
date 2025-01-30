/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL,
  generateRobotsTxt: true,
  sitemapSize: 5000,
  generateIndexSitemap: true,
  exclude: ["/app", "/app/*"],
  transform: async (config, url) => ({
    loc: url,
    lastmod: new Date().toISOString(),
    changefreq: "daily",
    priority: 0.8,
  }),
};
