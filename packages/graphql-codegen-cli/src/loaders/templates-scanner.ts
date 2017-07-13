import * as path from 'path';
import * as glob from 'glob';
import * as fs from 'fs';

export function scanForTemplatesInPath(dirPath: string, fileExtensions: string[]): { [templateName: string]: string } {
  const absolutePath = path.resolve(process.cwd(), dirPath);
  const globPattern = `${absolutePath}/**/*.@(${fileExtensions.join('|')})`;
  const results = glob.sync(globPattern);

  return results.reduce((prev, filePath) => {
    prev[filePath] = fs.readFileSync(filePath).toString();

    return prev;
  }, {});
}
