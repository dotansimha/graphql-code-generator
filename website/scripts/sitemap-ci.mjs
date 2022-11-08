import { XMLParser } from 'fast-xml-parser';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import * as fs from 'node:fs';
import * as path from 'node:path';
import config from '../next.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
const lockfilePath = path.join(__dirname, '..', 'route-lockfile.txt');

async function main() {
  const parser = new XMLParser();

  const d = parser.parse(fs.readFileSync(sitemapPath, 'utf-8'));

  const routes = d.urlset.url.map(url =>
    url.loc.replace(process.env.SITE_URL || `https://the-guild.dev/graphql/codegen`, ``)
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
