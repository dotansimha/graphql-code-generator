import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourcePkg = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const distPkgPath = path.join(packageRoot, 'dist', 'package.json');

if (!fs.existsSync(distPkgPath) || !sourcePkg.bugs) {
  process.exit(0);
}

const distPkg = JSON.parse(fs.readFileSync(distPkgPath, 'utf8'));
distPkg.bugs = sourcePkg.bugs;
fs.writeFileSync(distPkgPath, `${JSON.stringify(distPkg, null, 2)}\n`, 'utf8');
