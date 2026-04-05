import config from '@theguild/tailwind-config/postcss.config';

export default {
  ...config,
  plugins: {
    ...config.plugins,
    'postcss-nesting': {},
  },
};
