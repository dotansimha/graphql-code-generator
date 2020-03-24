#!/usr/bin/env node

const { join } = require('path');
const { writeFileSync, readFileSync } = require('fs');

function readPackageJson(path) {
  return JSON.parse(
    readFileSync(join(path, './package.json'), {
      encoding: 'utf-8',
    })
  );
}

const cwd = process.cwd();
const srcPackageJson = readPackageJson(cwd);
const distPackageJson = readPackageJson(join(cwd, './dist'));

distPackageJson.version = srcPackageJson.version;

if ('dependencies' in srcPackageJson) {
  distPackageJson.dependencies = srcPackageJson.dependencies;
}

if ('peerDependencies' in srcPackageJson) {
  distPackageJson.peerDependencies = srcPackageJson.peerDependencies;
}

if ('optionalDependencies' in srcPackageJson) {
  distPackageJson.optionalDependencies = srcPackageJson.optionalDependencies;
}

if ('sideEffects' in srcPackageJson) {
  distPackageJson.sideEffects = srcPackageJson.sideEffects;
}

writeFileSync(join(cwd, './dist/package.json'), JSON.stringify(distPackageJson, null, 2));
