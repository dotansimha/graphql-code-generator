const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const absoluteBinPath = path.resolve(__dirname, '../packages/graphql-codegen-cli/dist/cjs/bin.js');

if (!fs.existsSync(absoluteBinPath)) {
  // Same `bob build` copy-step bug as scripts/inject-cli-version.mjs: the compiled file in
  // .bob is reliably present even when the copy into dist/ is dropped (seen on Windows CI).
  // See https://github.com/dotansimha/graphql-code-generator/pull/10931.
  const bobBinPath = path.resolve(__dirname, '../.bob/cjs/graphql-codegen-cli/src/bin.js');
  if (fs.existsSync(bobBinPath)) {
    console.warn(
      `⚠ ${absoluteBinPath} was not copied from ${bobBinPath} — copying it directly instead.`,
    );
    fs.ensureDirSync(path.dirname(absoluteBinPath));
    fs.copyFileSync(bobBinPath, absoluteBinPath);
  }
}

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
      try {
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
            `,
        );
        fs.chmodSync(targetCmdPath, '755');
      } catch {
        /* ignore symlink that already exist */
      }
    }
  }
}
