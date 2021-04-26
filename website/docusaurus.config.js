const { resolve } = require('path');

module.exports = {
  title: 'GraphQL Code Generator',
  tagline: 'Generate code from your GraphQL schema with a single function call',
  url: 'https://graphql-code-generator.com',
  projectName: 'graphql-code-generator',
  organizationName: 'dotansimha',
  baseUrl: '/',
  favicon: 'img/favicon.png',
  themeConfig: {
    colorMode: {
      disableSwitch: true,
    },
    googleAnalytics: {
      trackingID: 'UA-128969121-3',
    },
    gtag: {
      trackingID: 'UA-128969121-3',
    },
    navbar: {
      title: 'GraphQL Code Generator',
      logo: {
        alt: 'GraphQL Code Generator',
        src: 'img/gql-codegen-icon.svg',
      },
      items: [
        {
          to: 'docs/getting-started/index',
          activeBasePath: 'docs',
          label: 'API & Documentation',
          position: 'right',
        },
        {
          href: 'https://github.com/dotansimha/graphql-code-generator',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://the-guild.dev/contact',
          label: 'Contact Us',
          position: 'right',
        },
      ],
    },
    footer: {
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'http://bit.ly/guild-chat',
            },
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/graphql-code-generator',
            },
          ],
        },
        {
          title: 'Social',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/dotansimha/graphql-code-generator/',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/TheGuildDev',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} GraphQL Code Generator, The Guild, Inc. Built with Docusaurus.`,
    },
  },
  scripts: ['/js/fix-location.js'],
  plugins: [resolve(__dirname, './monaco-plugin.js')],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          admonitions: {
            customTypes: {
              shell: {
                keyword: 'shell',
                svg:
                  '<svg xmlns="http://www.w3.org/2000/svg" width="16pt" height="16pt" viewBox="0 0 16 16"><path d="M0 0v16h16V0zm15.063 15.063H.937v-11h14.126zm0-11.938H.937V.937h14.126zm0 0"/><path d="M1.875 1.563h.938V2.5h-.938zm0 0M3.438 1.563h.937V2.5h-.938zm0 0M5 1.563h.938V2.5H5zm0 0M1.875 5.074v1.348l.988.637-.988.578V9.05l2.828-1.668v-.586zm0 0M5.34 7.559h1.027v1.226H5.34zm0 0M5.34 5.32h1.027v1.23H5.34zm0 0M6.8 8.785h2.356v1.137H6.801zm0 0"/></svg>',
              },
            },
          },
          remarkPlugins: [require('remark-code-import'), require('remark-import-partial')],
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/dotansimha/graphql-code-generator/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
