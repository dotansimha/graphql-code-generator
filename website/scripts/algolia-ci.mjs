import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { indexToAlgolia } from '@guild-docs/algolia';

const __dirname = dirname(fileURLToPath(import.meta.url));

indexToAlgolia({
  nextra: {
    docsBaseDir: resolve(__dirname, '../src/pages/'),
  },
  source: 'Code Generator',
  dryMode: process.env.ALGOLIA_DRY_RUN === 'true',
  domain: process.env.SITE_URL,
  postProcessor: objects =>
    objects.map(o => {
      if (o.url.includes('plugins/')) {
        o.type = 'Plugin';
      }
      return o;
    }),
  lockfilePath: resolve(__dirname, '../algolia-lockfile.json'),
});
