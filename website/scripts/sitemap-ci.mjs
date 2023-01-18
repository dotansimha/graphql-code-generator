import fs from 'node:fs/promises';
import path from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import config from '../next.config.mjs';

const parser = new XMLParser();

const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
const { urlset } = parser.parse(await fs.readFile(sitemapPath, 'utf8'));

const routes = urlset.url.map(url => new URL(url.loc).pathname);
const redirectsPointingToNonExistingStuff = [];

const redirects = await config.redirects();

for (const redirect of redirects) {
  if (routes.includes(redirect.destination)) {
    routes.push(`${redirect.source} -> ${redirect.destination}`);
  } else {
    redirectsPointingToNonExistingStuff.push(redirect);
  }
}

const lockfilePath = path.join(process.cwd(), 'route-lockfile.txt');
await fs.writeFile(lockfilePath, routes.sort().join('\n') + '\n');
