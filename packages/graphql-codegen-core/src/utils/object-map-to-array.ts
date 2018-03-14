export function objectMapToArray<T>(objectMap: { [key: string]: T }): { key: string; value: T }[] {
  return Object.keys(objectMap).map(key => ({ key, value: objectMap[key] }));
}
