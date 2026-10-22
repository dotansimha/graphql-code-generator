/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    swcPlugins: [
      [
        '@swc-contrib/plugin-graphql-codegen-client-preset',
        { artifactDirectory: './gql', gqlTagName: 'graphql' },
      ],
    ],
  },
};

module.exports = nextConfig;
