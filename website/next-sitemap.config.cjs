/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://the-guild.dev/graphql/codegen',
  generateIndexSitemap: false,
  exclude: ['*/_meta'],
  output: 'export',
};
