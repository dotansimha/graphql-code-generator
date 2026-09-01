import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

/**
 * This script injects the `@graphql-codegen/cli` version after building,
 * so at runtime, we don't have to import `package.json` file for the package version.
 */

const __dirname = url.fileURLToPath(new url.URL('.', import.meta.url));

const packageJsonFile = path.resolve(__dirname, '../packages/graphql-codegen-cli/package.json');

// `bob build` compiles `src/version.ts` into `.bob/{esm,cjs}/graphql-codegen-cli/src/version.js`,
// then copies it into `dist/`. That copy step has been observed (on Windows CI, intermittently)
// to silently drop this file even though bob reports success and every other file lands fine -
// see https://github.com/dotansimha/graphql-code-generator/pull/10931. The compiled file in
// `.bob` itself has always been present and correct when this happens, so recover from it
// directly instead of failing the whole build over one dropped copy.
const versionFiles = [
  {
    dist: path.resolve(__dirname, '../packages/graphql-codegen-cli/dist/cjs/version.js'),
    bob: path.resolve(__dirname, '../.bob/cjs/graphql-codegen-cli/src/version.js'),
  },
  {
    dist: path.resolve(__dirname, '../packages/graphql-codegen-cli/dist/esm/version.js'),
    bob: path.resolve(__dirname, '../.bob/esm/graphql-codegen-cli/src/version.js'),
  },
];

const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));

for (const { dist: versionFile, bob: bobVersionFile } of versionFiles) {
  if (!fs.existsSync(versionFile) && fs.existsSync(bobVersionFile)) {
    console.warn(
      `⚠ ${versionFile} was not copied from ${bobVersionFile} by \`bob build\` — copying it directly instead.`,
    );
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    fs.copyFileSync(bobVersionFile, versionFile);
  }

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
