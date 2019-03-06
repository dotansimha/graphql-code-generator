jest.mock('fs');
import { resolve } from 'path';
import { guessTargets } from '../src/init';

describe('init', () => {
  it('should guess angular project', async () => {
    require('fs').__setMockFiles(
      resolve(process.cwd(), 'package.json'),
      JSON.stringify({
        dependencies: {
          '@angular/core': 'x.x.x'
        }
      })
    );
    const targets = await guessTargets();

    expect(targets.Angular).toEqual(true);
  });

  it('should guess typescript project', async () => {
    require('fs').__setMockFiles(
      resolve(process.cwd(), 'package.json'),
      JSON.stringify({
        devDependencies: {
          typescript: 'x.x.x'
        }
      })
    );
    const targets = await guessTargets();

    expect(targets.TypeScript).toEqual(true);
  });

  it('should guess react project', async () => {
    require('fs').__setMockFiles(
      resolve(process.cwd(), 'package.json'),
      JSON.stringify({
        dependencies: {
          react: 'x.x.x'
        }
      })
    );
    const targets = await guessTargets();

    expect(targets.React).toEqual(true);
  });

  it('should write plugins to the config file', async () => {});
  it('should write plugins to package.json', async () => {});
  it('should write packages to package.json', async () => {});
});
