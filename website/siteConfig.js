/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: 'User1',
    // You will need to prepend the image path with your baseUrl
    // if it is not '/', like: '/test-site/img/docusaurus.svg'.
    image: '/img/docusaurus.svg',
    infoLink: 'https://www.facebook.com',
    pinned: true,
  },
]

const siteConfig = {
  title: 'GraphQL Code Generator', // Title for your website.
  tagline: 'Generate code from your GraphQL schema with a single function call',
  url: 'https://graphql-code-generator.com', // Your website URL
  baseUrl: '/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Media URLs that will be referenced by the views
  githubUrl: 'https://github.com/dotansimha/graphql-code-generator',
  mediumUrl: 'https://medium.com/the-guild',
  twitterUrl: 'https://twitter.com/UriGoldshtein',

  // Used for publishing and more
  projectName: 'graphql-code-generator',
  organizationName: 'guild',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    {doc: "getting-started/index", label: 'Docs'},
    {page: 'help', label: 'Help'},
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: 'img/gql-codegen-horizontal.svg',
  footerIcon: 'img/gql-codegen-horizontal.svg',
  favicon: 'img/favicon.png',

  /* Colors for website */
  colors: {
    primaryColor: '#e15799',
    secondaryColor: '#64bae9',
  },

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Your Name or Your Company Name`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,

  // Open Graph and Twitter card images.
  ogImage: 'img/gql-codegen-cover.svg',
  twitterImage: 'img/gql-codegen-cover.svg',

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  //   repoUrl: 'https://github.com/facebook/test-site',
}

module.exports = siteConfig
