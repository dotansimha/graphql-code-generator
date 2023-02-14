/* eslint-disable import/no-extraneous-dependencies */
// @ts-check
const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const absoluteBinPath = path.resolve(__dirname, '../packages/graphql-codegen-cli/dist/cjs/bin.js');
const packageDirectories = fg
  .sync(['examples/**/package.json'], { ignore: ['**/node_modules/**'] })
  .map(p => path.dirname(p));
packageDirectories.push('website');

for (const dirname of packageDirectories) {
  const absolutePath = path.join(__dirname, '..', dirname);
  if (fs.lstatSync(absolutePath).isDirectory()) {
    const execNames = ['graphql-codegen', 'graphql-codegen-esm'];
    for (const execName of execNames) {
      const targetPath = path.join(absolutePath, 'node_modules', '.bin', execName);
      fs.ensureSymlinkSync(absoluteBinPath, targetPath);
      fs.chmodSync(targetPath, '755');
      const targetCmdPath = targetPath + '.cmd';
      fs.writeFileSync(
        targetCmdPath,
        `
@IF EXIST "%~dp0\\node.exe" (
  "%~dp0\\node.exe"  "${absoluteBinPath}" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "${absoluteBinPath}" %*
)
            `
      );
      fs.chmodSync(targetCmdPath, '755');
    }
  }
}
