module.exports = {
  title: 'GraphQL Code Generator',
  tagline: 'Generate code from your GraphQL schema with a single function call',
  url: 'https://graphql-code-generator.com',
  projectName: 'graphql-code-generator',
  organizationName: 'dotansimha',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  themeConfig: {
    googleAnalytics: {
      trackingID: 'UA-128969121-3',
    },
    gtag: {
      trackingID: 'UA-128969121-3',
    },
    algolia: {
      apiKey: 'dc81d9e0ead1aecb5e776d262181ceeb',
      indexName: 'graphql-code-generator',
      algoliaOptions: {},
    },
    navbar: {
      logo: {
        alt: 'GraphQL Code Generator',
        src: 'img/gql-codegen-horizontal.svg'
      },
      links: [
        {
          to: 'docs/getting-started/index',
          activeBasePath: 'docs',
          label: 'API & Documentation',
          position: 'right'
        },
        {
          href: 'https://github.com/dotansimha/graphql-code-generator',
          label: 'GitHub',
          position: 'right'
        },
        {
          href: 'https://the-guild.dev/contact',
          label: 'Contact Us',
          position: 'right'
        }
      ]
    },
    footer: {
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'http://bit.ly/guild-chat'
            },
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/graphql-code-generator'
            }
          ]
        },
        {
          title: 'Social',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/dotansimha/graphql-code-generator/'
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/TheGuildDev'
            }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} GraphQL Code Generator, The Guild, Inc. Built with Docusaurus.`
    }
  },
  scripts: [
    {
      src: 'https://the-guild.dev/static/banner.js',
      // we may want to load it ASAP
      async: true,
      defer: true,
    },
    {
      src: '/js/drift.js',
      async: true,
      defer: true,
    },
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          remarkPlugins: [
            require('remark-code-import'),
            require('remark-import-partial')
          ],
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/dotansimha/graphql-code-generator/edit/master/website/'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      }
    ]
  ]
};
