import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { indexToAlgolia } from '@guild-docs/algolia';
import { register } from 'esbuild-register/dist/node.js';
import { getPackagesData } from '@guild-docs/server/npm';

register({ extensions: ['.ts', '.tsx'] });

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

const { getRoutes } = require('../routes.ts');
const { packageList } = require('../src/lib/plugins.ts');

getPackagesData({ packageList }).then(plugins => {
  indexToAlgolia({
    routes: [getRoutes()],
    plugins: plugins,
    source: 'Code Generator',
    dryMode: process.env.ALGOLIA_DRY_RUN === 'true',
    domain: process.env.SITE_URL,
    lockfilePath: resolve(__dirname, '../algolia-lockfile.json'),
  });
});
