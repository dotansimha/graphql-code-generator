import flow from 'flow-parser';

export function validateFlow(code: string) {
  const result = flow.parse(code);

  if (result.errors.length > 0) {
    throw new Error(result.errors.map(error => error.message).join('\n'));
  }
}
