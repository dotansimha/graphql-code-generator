import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';
import { debugLog } from 'graphql-codegen-core';

export function scanForTemplatesInPath(dirPath: string, fileExtensions: string[]): { [templateName: string]: string } {
  const absolutePath = path.resolve(process.cwd(), dirPath);
  const globPattern = `${absolutePath}/**/*.@(${fileExtensions.join('|')})`;
  debugLog(`[scanForTemplatesInPath] Scanning for templates using glob pattern: ${globPattern}`);

  const results = glob.sync(globPattern);

  debugLog(`[scanForTemplatesInPath] Got results from glob: `, results);

  return results.reduce((prev, filePath) => {
    prev[filePath] = fs.readFileSync(filePath).toString();

    return prev;
  }, {});
}
