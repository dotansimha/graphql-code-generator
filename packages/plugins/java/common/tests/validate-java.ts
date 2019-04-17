import { parse } from 'java-ast';

export function validateJava(content: string): void {
  const originalErr = console['error'];
  const collectedErrors = [];
  console['error'] = (errorStr: string) => {
    collectedErrors.push(errorStr);
  };
  parse(content);
  console['error'] = originalErr;

  if (collectedErrors.length > 0) {
    const mergedErrors = collectedErrors.join('\n');

    throw new Error(`Invalid Java code:\n${mergedErrors}`);
  }
}
