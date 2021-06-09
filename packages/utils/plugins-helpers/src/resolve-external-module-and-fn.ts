import { createRequire } from 'module';
import { cwd } from 'process';

export function resolveExternalModuleAndFn(pointer: any): any {
  if (typeof pointer === 'function') {
    return pointer;
  }

  // eslint-disable-next-line prefer-const
  let [moduleName, functionName] = pointer.split('#');
  // Temp workaround until v2
  if (moduleName === 'change-case') {
    moduleName = 'change-case-all';
  }
  
  const cwdRequire = createRequire(cwd());
  const loadedModule = cwdRequire(moduleName);

  if (!(functionName in loadedModule) && typeof loadedModule !== 'function') {
    throw new Error(`${functionName} couldn't be found in module ${moduleName}!`);
  }

  return loadedModule[functionName] || loadedModule;
}
