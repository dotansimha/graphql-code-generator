import { oneLine, stripIndent } from 'common-tags';
import { resolve } from 'path';
import { existsSync } from 'fs';
import diff from 'jest-diff';

declare global {
  // eslint-disable-next-line no-redeclare
  namespace jest {
    interface Matchers<R, T> {
      /**
       * Normalizes whitespace and performs string comparisons
       */
      toBeSimilarStringTo(expected: string): R;
    }
  }
}

function compareStrings(a: string, b: string): boolean {
  return a.includes(b);
}

expect.extend({
  toBeSimilarStringTo(received: string, expected: string) {
    const strippedReceived = oneLine`${received}`.replace(/\s\s+/g, ' ');
    const strippedExpected = oneLine`${expected}`.replace(/\s\s+/g, ' ');

    if (compareStrings(strippedReceived, strippedExpected)) {
      return {
        message: () =>
          `expected 
   ${received}
   not to be a string containing (ignoring indents)
   ${expected}`,
        pass: true,
      };
    } else {
      const diffString = diff(stripIndent`${expected}`, stripIndent`${received}`, {
        expand: this.expand,
      });
      const hasExpect = diffString && diffString.includes('- Expect');

      const message = hasExpect
        ? `Difference:\n\n${diffString}`
        : `expected 
      ${received}
      to be a string containing (ignoring indents)
      ${expected}`;

      return {
        message: () => message,
        pass: false,
      };
    }
  },
});

function findProjectDir(dirname: string): string | never {
  const originalDirname = dirname;
  const cwd = process.cwd();
  const stopDir = resolve(cwd, '..');

  while (dirname !== stopDir) {
    try {
      if (existsSync(resolve(dirname, 'package.json'))) {
        return dirname;
      }

      dirname = resolve(dirname, '..');
    } catch (e) {
      // ignore
    }
  }

  throw new Error(`Coudn't find project's root from: ${originalDirname}`);
}

export function useMonorepo({ dirname }: { dirname: string }) {
  const cwd = findProjectDir(dirname);

  return {
    correctCWD() {
      let spyProcessCwd: jest.SpyInstance;
      beforeEach(() => {
        spyProcessCwd = jest.spyOn(process, 'cwd').mockReturnValue(cwd);
      });
      afterEach(() => {
        spyProcessCwd.mockRestore();
      });
    },
  };
}

export * from './typescript';
export * from './mock-graphql-server';
