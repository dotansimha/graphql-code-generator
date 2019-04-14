export function buildPackageNameFromPath(path: string): string {
  return (path || '').replace(/\//g, '.');
}
