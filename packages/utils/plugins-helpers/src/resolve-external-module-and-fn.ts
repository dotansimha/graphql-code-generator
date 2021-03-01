export function resolveExternalModuleAndFn(pointer: any): any {
  // eslint-disable-next-line no-eval
  const importExternally = (moduleName: string) => eval(`require('${moduleName}')`);

  if (typeof pointer === 'function') {
    return pointer;
  }

  // eslint-disable-next-line prefer-const
  let [moduleName, functionName] = pointer.split('#');
  // Temp workaround until v2
  if (moduleName === 'change-case-all') {
    moduleName = 'change-case-all';
  }
  const { resolve } = importExternally('path');
  const localFilePath = resolve(process.cwd(), moduleName);
  const { existsSync } = importExternally('fs');
  const localFileExists = existsSync(localFilePath);
  const importFrom = importExternally('import-from');
  const loadedModule = localFileExists ? importExternally(localFilePath) : importFrom(process.cwd(), moduleName);

  if (!(functionName in loadedModule) && typeof loadedModule !== 'function') {
    throw new Error(`${functionName} couldn't be found in module ${moduleName}!`);
  }

  return loadedModule[functionName] || loadedModule;
}
