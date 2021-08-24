import path from 'path';
import { resolveExternalModuleAndFn } from '../src/resolve-external-module-and-fn';

describe.only('resolveExternalModuleAndFn', () => {
  describe('Issues', () => {
    it('#6553 - Cannot find module', () => {
      const relativePathToSelf = path.relative(process.cwd(), path.join(__dirname, './fixtures/externalModuleFn.js'));
      expect(resolveExternalModuleAndFn('./' + relativePathToSelf + '#test')).toBe('foobar');
    });
  });
});
