import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  vite: {
    resolve: {
      alias: {
        '@apollo/client/core/index.js': fileURLToPath(
          new URL('./shims/apollo-v4-compat.ts', import.meta.url),
        ),
      },
    },
  },
});
