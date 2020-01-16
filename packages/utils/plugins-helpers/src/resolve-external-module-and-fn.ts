import { resolve } from 'path';
import { existsSync } from 'fs';
import importFrom from 'import-from';
import { paramCase } from 'param-case';

export function resolveExternalModuleAndFn(pointer: any): any {
  if (typeof pointer === 'function') {
    return pointer;
  }

  let [moduleName, functionName] = pointer.split('#');
  // Temp workaround until v2
  if (moduleName === 'change-case') {
    moduleName = paramCase(functionName);
  }
  const localFilePath = resolve(process.cwd(), moduleName);
  const localFileExists = existsSync(localFilePath);
  const loadedModule = localFileExists ? require(localFilePath) : importFrom(process.cwd(), moduleName);

  if (!(functionName in loadedModule) && typeof loadedModule !== 'function') {
    throw new Error(`${functionName} couldn't be found in module ${moduleName}!`);
  }

  return loadedModule[functionName] || loadedModule;
}
