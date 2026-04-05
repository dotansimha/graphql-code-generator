import { PRODUCTS_MENU_LIST } from '@theguild/components/products';

export default {
  index: {
    title: 'Home',
    type: 'page',
    display: 'hidden',
    theme: {
      layout: 'raw',
    },
  },
  docs: {
    title: 'Documentation',
    type: 'page',
  },
  plugins: {
    title: 'Plugins',
    type: 'page',
    theme: {
      layout: 'raw',
    },
  },
  products: {
    title: 'Products',
    type: 'menu',
    items: PRODUCTS_MENU_LIST,
  },
  'the-guild': {
    title: 'The Guild',
    type: 'menu',
    items: {
      'about-us': {
        title: 'About Us',
        href: 'https://the-guild.dev/about-us',
        newWindow: true,
      },
      'brand-assets': {
        title: 'Brand Assets',
        href: 'https://the-guild.dev/logos',
        newWindow: true,
      },
    },
  },
  'graphql-foundation': {
    title: 'GraphQL Foundation',
    type: 'page',
    href: 'https://graphql.org/community/foundation/',
    newWindow: true,
  },
};
