const { writeFileSync } = require('fs');
const { resolve } = require('path');
const { argv, cwd } = require('process');

const pkgPath = resolve(cwd(), './package.json');

const pkg = require(pkgPath);

const version = argv[2];

// eslint-disable-next-line logical-assignment-operators -- can be removed after drop support of Node.js 12
pkg.overrides = pkg.overrides || {};
if (pkg.overrides.graphql.startsWith(version)) {
  // eslint-disable-next-line no-console
  console.info(`GraphQL v${version} is match! Skipping.`);
  return;
}

const npmVersion = version.includes('-') ? version : `^${version}`;
pkg.devDependencies.graphql = npmVersion;
pkg.overrides.graphql = npmVersion;
pkg.overrides['**/apollo-language-server/graphql'] = npmVersion;
pkg.overrides['**/@types/graphql-upload/graphql'] = npmVersion;

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
