import { oneLine } from 'common-tags';

declare global {
  namespace jest {
    interface Matchers<R> {
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

function toBeSimilarStringTo(received: string, expected: string) {
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
    return {
      message: () =>
        `expected 
 ${received}
 to be a string containing (ignoring indents)
 ${expected}`,
      pass: false,
    };
  }
}

expect.extend({
  toBeSimilarStringTo,
});

export * from './typescript';
