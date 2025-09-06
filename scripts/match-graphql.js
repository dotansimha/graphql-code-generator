const { writeFileSync } = require('fs');
const { resolve } = require('path');
const { argv, cwd } = require('process');

const pkgPath = resolve(cwd(), './package.json');

const pkg = require(pkgPath);

const version = argv[2];

pkg.resolutions ||= {};
if (pkg.devDependencies.graphql?.startsWith(version)) {
  // eslint-disable-next-line no-console
  console.info(`GraphQL v${version} is match! Skipping.`);
  return;
}

const npmVersion = version.includes('-') ? version : `^${version}`;
pkg.devDependencies.graphql = npmVersion;
pkg.resolutions.graphql = npmVersion;

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
