export function getScalarType(type, options) {
  const config = options.data.root.config || {};
  if (config.scalars && type in config.scalars) {
    // Avoid alias when identical (#485).
    if (config.scalars[type] !== type) {
      return config.scalars[type];
    }
  } else {
    return 'any';
  }
}
