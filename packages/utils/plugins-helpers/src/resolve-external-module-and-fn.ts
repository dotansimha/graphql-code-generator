import { createRequire } from 'module';
import { cwd } from 'process';
import * as changeCaseAll from 'change-case-all';

export function resolveExternalModuleAndFn(pointer: any): any {
  if (typeof pointer === 'function') {
    return pointer;
  }

  let [moduleName, functionName] = pointer.split('#');
  // Temp workaround until v2
  if (moduleName === 'change-case') {
    moduleName = 'change-case-all';
  }

  let loadedModule: any;
  if (moduleName === 'change-case-all') {
    loadedModule = changeCaseAll;
  } else {
    // we have to use a path to a filename here (it does not need to exist.)
    // https://github.com/dotansimha/graphql-code-generator/issues/6553
    const cwdRequire = createRequire(cwd() + '/index.js');
    loadedModule = cwdRequire(moduleName);

    if (!(functionName in loadedModule) && typeof loadedModule !== 'function') {
      throw new Error(`${functionName} couldn't be found in module ${moduleName}!`);
    }
  }

  return loadedModule[functionName] || loadedModule;
}
