import theGuildTailwindConfig from '@theguild/tailwind-config';
import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  ...theGuildTailwindConfig,
  theme: {
    ...theGuildTailwindConfig.theme,
    extend: {
      ...theGuildTailwindConfig.theme.extend,
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        display: ['var(--font-sans)', ...fontFamily.sans],
      },
      colors: {
        ...theGuildTailwindConfig.theme.extend.colors,
        primary: theGuildTailwindConfig.theme.extend.colors['hive-yellow'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          to: { height: '0', opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.5s ease',
        'accordion-up': 'accordion-up 0.5s ease',
      },
    },
  },
  content: [...theGuildTailwindConfig.content, './theme.config.tsx'],
};

export default config;
