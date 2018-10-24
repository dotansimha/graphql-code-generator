export function stripBlockComments(input: string): string {
  return input.replace(/^\/\/ [=]+\n\/\/ .*\n\/\/ [=]+/gim, '');
}
