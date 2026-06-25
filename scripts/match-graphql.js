const fs = require('fs');
const { argv } = require('process');
const yaml = require('js-yaml');

const version = argv[2];

const pnpmWorkspaceFile = './pnpm-workspace.yaml';

const file = fs.readFileSync(pnpmWorkspaceFile, 'utf8');
const parsedFile = yaml.load(file);

parsedFile.overrides ||= {};
parsedFile.overrides.graphql = version;

fs.writeFileSync(pnpmWorkspaceFile, yaml.dump(parsedFile), 'utf8');
