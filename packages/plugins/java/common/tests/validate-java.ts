import { parse } from 'java-ast';

export function validateJava(content: string): void {
  /* eslint-disable no-console */
  const originalErr = console.error;
  const collectedErrors = [];
  console.error = (errorStr: string) => {
    collectedErrors.push(errorStr);
  };
  parse(content);
  console.error = originalErr;
  /* eslint-enable no-console */

  if (collectedErrors.length > 0) {
    const mergedErrors = collectedErrors.join('\n');

    throw new Error(`Invalid Java code:\n${mergedErrors}`);
  }
}
