import { XMLParser } from 'fast-xml-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import config from '../next.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap-0.xml');
const lockfilePath = path.join(__dirname, '..', 'route-lockfile.txt');

async function main() {
  const parser = new XMLParser();

  const d = parser.parse(fs.readFileSync(sitemapPath, 'utf-8'));

  const routes = d.urlset.url.map(url =>
    url.loc.replace(process.env.SITE_URL || `https://www.graphql-code-generator.com`, ``)
  );

  const redirectsPointingToNonExistingStuff = [];

  const redirects = await config.redirects();

  for (const redirect of redirects) {
    if (routes.includes(redirect.destination) === false) {
      redirectsPointingToNonExistingStuff.push(redirect);
    } else {
      routes.push(`${redirect.source} -> ${redirect.destination}`);
    }
  }

  fs.writeFileSync(lockfilePath, routes.sort().join(`\n`) + `\n`);
}

main();
