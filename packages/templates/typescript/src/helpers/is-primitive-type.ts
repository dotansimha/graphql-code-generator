export function isPrimitiveType(type, options) {
  // tslint:disable-next-line:no-console
  return options.data.root.primitivesMap[type.type];
}
