export function getScalarType(type, options) {
  const config = options.data.root.config || {};
  if (config.scalars && type in config.scalars) {
    return config.scalars[type];
  } else {
    return 'any';
  }
}
