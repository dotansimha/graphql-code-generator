import * as Handlebars from 'handlebars';

export function getScalarType(type: string, options: Handlebars.HelperOptions) {
  const config = options.data.root.config || {};
  if (config.scalars && type in config.scalars) {
    return config.scalars[type as string];
  } else {
    return 'any';
  }
}
