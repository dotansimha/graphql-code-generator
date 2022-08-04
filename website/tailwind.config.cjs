module.exports = {
  content: [
    './src/**/*.{tsx,mdx}',
    './theme.config.tsx',
    '../node_modules/@theguild/components/dist/index.esm.js',
    '../node_modules/nextra-theme-docs/dist/**/*.js',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
  },
  darkMode: 'class',
};
