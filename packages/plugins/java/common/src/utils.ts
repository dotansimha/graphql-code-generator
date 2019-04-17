export function buildPackageNameFromPath(path: string): string {
  return (path || '').replace(/src\/main\/.*?\//, '').replace(/\//g, '.');
}
