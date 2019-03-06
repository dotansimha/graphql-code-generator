import path from 'path';
import fs from 'fs';
import importFrom from 'import-from';

export function resolveExternalModuleAndFn(pointer: any): any {
  if (typeof pointer === 'function') {
    return pointer;
  }

  const patternArr = pointer.split('#');
  const moduleName = patternArr[0];
  const functionName = patternArr[1];
  const localFilePath = path.resolve(process.cwd(), moduleName);
  const localFileExists = fs.existsSync(localFilePath);
  const loadedModule = localFileExists ? require(localFilePath) : importFrom(process.cwd(), moduleName);

  if (!(functionName in loadedModule)) {
    throw new Error(`${functionName} couldn't be found in module ${moduleName}!`);
  }

  return loadedModule[functionName];
}
