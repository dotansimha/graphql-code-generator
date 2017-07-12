export function sanitizeFilename(name: string, graphQlType: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.' + graphQlType;
}
