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

function toBeSimilarStringTo(received: string, argument: string) {
  const strippedA = oneLine`${received}`.replace(/\s\s+/g, ' ');
  const strippedB = oneLine`${argument}`.replace(/\s\s+/g, ' ');

  if (compareStrings(strippedA, strippedB)) {
    return {
      message: () =>
        `expected 
 ${received}
 not to be similar (strip-indent) string to
 ${argument}`,
      pass: true
    };
  } else {
    return {
      message: () =>
        `expected 
 ${received}
 to be similar (strip-indent) string to
 ${argument}`,
      pass: false
    };
  }
}

expect.extend({
  toBeSimilarStringTo
});
