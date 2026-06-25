const fs = require('fs');
const { resolve } = require('path');
const { argv, cwd } = require('process');
const yaml = require('js-yaml');

const pkgPath = resolve(cwd(), './package.json');

const pkg = require(pkgPath);

const version = argv[2];

const pnpmWorkspaceFile = './pnpm-workspace.yaml';

const file = fs.readFileSync(pnpmWorkspaceFile, 'utf8');
const parsedFile = yaml.load(file);

parsedFile.overrides ||= {};
parsedFile.overrides.graphql = version;

fs.writeFileSync(pnpmWorkspaceFile, yaml.dump(parsedFile), 'utf8');
