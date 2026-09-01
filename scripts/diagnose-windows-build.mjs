import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * TEMPORARY diagnostic script for https://github.com/dotansimha/graphql-code-generator/pull/10931
 * Remove once the Windows `bob build` / version.js issue is root-caused.
 *
 * Runs after the (possibly failed) `pnpm build` step, so it inspects whatever
 * `bob build` actually left behind in `.bob/` before crashing at postbuild.
 */

const root = process.cwd();
const bobDir = path.join(root, '.bob');

function countJsFiles(dir) {
  if (!fs.existsSync(dir)) return -1;
  let count = 0;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith('.js')) count++;
    }
  }
  return count;
}

function findFiles(dir, matcher) {
  if (!fs.existsSync(dir)) return [];
  const found = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (matcher(entry.name)) found.push(full);
    }
  }
  return found;
}

console.log('=== [diagnose-windows-build] .bob overview ===');
console.log('cwd:', root);
console.log('.bob exists:', fs.existsSync(bobDir));

for (const target of ['esm', 'cjs']) {
  const dir = path.join(bobDir, target);
  console.log(`.bob/${target} exists:`, fs.existsSync(dir));
  console.log(`.bob/${target} .js file count:`, countJsFiles(dir));
}

console.log('\n=== version.js presence under .bob ===');
for (const target of ['esm', 'cjs']) {
  const p = path.join(bobDir, target, 'graphql-codegen-cli', 'src', 'version.js');
  console.log(p, '->', fs.existsSync(p));
}

console.log('\n=== dist/version.js presence ===');
for (const target of ['esm', 'cjs']) {
  const p = path.join(root, 'packages', 'graphql-codegen-cli', 'dist', target, 'version.js');
  console.log(p, '->', fs.existsSync(p));
}

console.log(
  '\n=== any .tsbuildinfo files under .bob (should be NONE with tsconfig.build.json) ===',
);
const buildInfoFiles = findFiles(bobDir, name => name.endsWith('.tsbuildinfo'));
console.log(buildInfoFiles.length === 0 ? 'none found' : buildInfoFiles);

console.log('\n=== resolved tsc config (tsc --showConfig --project tsconfig.build.json) ===');
try {
  console.log(execSync('npx tsc --showConfig --project tsconfig.build.json', { encoding: 'utf8' }));
} catch (e) {
  console.log('showConfig failed:', e.message);
}

console.log('\n=== file count tsc would compile per tsconfig.build.json (--listFilesOnly) ===');
try {
  const out = execSync('npx tsc --project tsconfig.build.json --listFilesOnly', {
    encoding: 'utf8',
  });
  const lines = out.trim().split(/\r?\n/).filter(Boolean);
  console.log('total files:', lines.length);
  console.log(
    'includes version.ts:',
    lines.some(l => l.replace(/\\/g, '/').endsWith('graphql-codegen-cli/src/version.ts')),
  );
} catch (e) {
  console.log('listFilesOnly failed:', e.message);
}

console.log(
  '\n=== file count tsc would compile per tsconfig.json (--listFilesOnly, no --project override) ===',
);
try {
  const out = execSync('npx tsc --listFilesOnly', { encoding: 'utf8' });
  const lines = out.trim().split(/\r?\n/).filter(Boolean);
  console.log('total files:', lines.length);
  console.log(
    'includes version.ts:',
    lines.some(l => l.replace(/\\/g, '/').endsWith('graphql-codegen-cli/src/version.ts')),
  );
} catch (e) {
  console.log('listFilesOnly failed:', e.message);
}
