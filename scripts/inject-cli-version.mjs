import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

/**
 * This script injects the `@graphql-codegen/cli` version after building,
 * so at runtime, we don't have to import `package.json` file for the package version.
 */

const __dirname = url.fileURLToPath(new url.URL('.', import.meta.url));

const packageJsonFile = path.resolve(__dirname, '../packages/graphql-codegen-cli/package.json');
const versionFiles = [
  path.resolve(__dirname, '../packages/graphql-codegen-cli/dist/cjs/version.js'),
  path.resolve(__dirname, '../packages/graphql-codegen-cli/dist/esm/version.js'),
];

const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));

for (const versionFile of versionFiles) {
  const versionFileContent = fs.readFileSync(versionFile, 'utf8');
  fs.writeFileSync(
    versionFile,
    versionFileContent.replace('__VERSION__', packageJson.version || 'unknown'),
    'utf8',
  );

  const updatedVersionContent = fs.readFileSync(versionFile, 'utf8');

  console.log('***');
  console.log(`Updated ${versionFile} content:\n"${updatedVersionContent}"`);
  console.log('***');
}
