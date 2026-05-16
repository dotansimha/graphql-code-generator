const fs = require('fs');
const { resolve } = require('path');
const { argv, cwd } = require('process');
const yaml = require('js-yaml');

const pkgPath = resolve(cwd(), './package.json');

const pkg = require(pkgPath);

const version = argv[2];

if (pkg.devDependencies.graphql?.startsWith(version)) {
  // eslint-disable-next-line no-console
  console.info(`GraphQL v${version} is match! Skipping.`);
  return;
}

const pnpmWorkspaceFile = './pnpm-workspace.yaml';

const file = fs.readFileSync(pnpmWorkspaceFile, 'utf8');
const parsedFile = yaml.load(file);

parsedFile.overrides ||= {};
parsedFile.overrides.graphql = '15';

fs.writeFileSync(pnpmWorkspaceFile, yaml.dump(parsedFile), 'utf8');
