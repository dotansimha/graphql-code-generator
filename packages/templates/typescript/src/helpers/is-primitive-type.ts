export function isPrimitiveType(type, options) {
  return options.data.root.primitives[type.type];
}
