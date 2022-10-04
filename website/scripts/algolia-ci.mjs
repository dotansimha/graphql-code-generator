import { resolve } from 'node:path';
import { indexToAlgolia } from '@theguild/algolia';

const CWD = process.cwd();

indexToAlgolia({
  nextra: {
    docsBaseDir: resolve(CWD, 'src/pages'),
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
  lockfilePath: resolve(CWD, 'algolia-lockfile.json'),
});
