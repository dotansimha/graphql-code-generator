import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';

/**
 * This script injects the `@graphql-codegen/cli` version after building,
 * so at runtime, we don't have to import `package.json` file for the package version.
 */

const __dirname = url.fileURLToPath(new url.URL('.', import.meta.url));

const packageJsonFile = path.resolve(__dirname, '../packages/graphql-codegen-cli/package.json');

// `bob build` compiles `src/version.ts` (`export const version = '__VERSION__';`) to these two
// files. It has intermittently been observed to not emit them on Windows CI runners even though
// the build itself reports success (likely a race around the shared incremental tsbuildinfo).
// Rather than let that crash the whole build over one trivial re-export, fall back to writing
// the equivalent compiled output directly when the file is missing.
const versionFiles = [
  {
    file: path.resolve(__dirname, '../packages/graphql-codegen-cli/dist/cjs/version.js'),
    fallbackContent: `"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nexports.version = void 0;\nexports.version = '__VERSION__';\n`,
  },
  {
    file: path.resolve(__dirname, '../packages/graphql-codegen-cli/dist/esm/version.js'),
    fallbackContent: `export const version = '__VERSION__';\n`,
  },
];

const packageJson = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));

for (const { file: versionFile, fallbackContent } of versionFiles) {
  if (!fs.existsSync(versionFile)) {
    console.warn(
      `⚠ ${versionFile} was not emitted by \`bob build\` — writing the expected file directly instead.`,
    );
    fs.mkdirSync(path.dirname(versionFile), { recursive: true });
    fs.writeFileSync(versionFile, fallbackContent, 'utf8');
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
