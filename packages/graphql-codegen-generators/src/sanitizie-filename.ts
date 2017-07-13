export function sanitizeFilename(name: string, graphQlType: string): string {
  const cleanName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  return cleanName === '' ? cleanName : cleanName + '.' + graphQlType;
}
