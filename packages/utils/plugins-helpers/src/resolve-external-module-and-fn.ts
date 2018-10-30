import * as path from 'path';
import * as fs from 'fs';

export function resolveExternalModuleAndFn(pointer: string): any {
  const patternArr = pointer.split('#');
  const moduleName = patternArr[0];
  const functionName = patternArr[1];
  const localFilePath = path.resolve(process.cwd(), moduleName);
  const localFileExists = fs.existsSync(localFilePath);
  const loadedModule = require(localFileExists ? localFilePath : moduleName);

  if (!(functionName in loadedModule)) {
    throw new Error(`${functionName} couldn't be found in ${loadedModule}`);
  }

  return loadedModule[functionName];
}
