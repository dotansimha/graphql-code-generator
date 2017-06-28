import { oneLine } from 'common-tags';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBySimilarStringTo(expected: string): R;
    }
  }
}

function toBySimilarStringTo(received: string, argument: string) {
  const strippedA = oneLine`${received}`;
  const strippedB = oneLine`${argument}`;

  if (strippedA === strippedB) {
    return {
      message: () => (
`expected 
 ${received}
 not to be similar (strip-indent) string to
 ${argument}`
      ),
      pass: true,
    };
  } else {
    return {
      message: () => (
`expected 
 ${received}
 to be similar (strip-indent) string to
 ${argument}`
      ),
      pass: false,
    };
  }
}

expect.extend({
  toBySimilarStringTo,
});
