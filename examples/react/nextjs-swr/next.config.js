/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    swcPlugins: [['@graphql-codegen/client-preset-swc-plugin', { artifactDirectory: './gql', gqlTagName: 'graphql' }]],
  },
};

module.exports = nextConfig;
