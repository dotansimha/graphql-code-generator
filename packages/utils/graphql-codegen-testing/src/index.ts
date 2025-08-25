import { expect } from 'vitest';
import { oneLine, stripIndent } from 'common-tags';
import { diff } from 'jest-diff';

interface CustomMatchers<R = unknown> {
  /**
   * Normalizes whitespace and performs string comparisons
   */
  toBeSimilarStringTo(expected: string): R;
}
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Matchers<T = any> extends CustomMatchers<T> {}
}

function compareStrings(a: string, b: string): boolean {
  return a.includes(b);
}

/** Ignore whitespace, trailing commas, and leading pipes */
function similarize(str: string): string {
  return (
    oneLine`${str}`
      // Trim trailing commas
      .replace(/\s*,(\s*[)}])/g, '$1')
      // Remove leading pipes
      .replace(/([<:,=(])\s*(?:\|\s*)?/g, '$1')
      // Remove spaces around brackets and semicolons
      .replace(/\s*([[\](){}<>;])\s*/g, '$1')
      // Replace multiple spaces with a single space
      .replace(/\s\s+/g, ' ')
  );
}

expect.extend({
  toBeSimilarStringTo(received: string, expected: string) {
    const strippedReceived = similarize(received);
    const strippedExpected = similarize(expected);

    if (compareStrings(strippedReceived, strippedExpected)) {
      return {
        message: () =>
          `expected
   ${received}
   not to be a string containing (ignoring indents)
   ${expected}`,
        pass: true,
      };
    }
    const diffString = diff(stripIndent`${expected}`, stripIndent`${received}`, {
      expand: this.expand,
    });
    const hasExpect = diffString?.includes('- Expect');

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
  },
});

export * from './mock-graphql-server.js';
export * from './resolvers-common.js';
export * from './typescript.js';
