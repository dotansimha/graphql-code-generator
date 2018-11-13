export function importContext(options: Handlebars.HelperOptions): string {
  const config = options.data.root.config || {};
  const contextType: string | undefined = config.contextType || {};

  if (typeof contextType !== 'string') {
    return '';
  }

  if (contextType.indexOf('#') === -1) {
    return contextType;
  }

  const [path, type] = contextType.split('#');

  return `import { ${type} } from '${path}';`;
}

export function getContext(options: Handlebars.HelperOptions): string {
  const config = options.data.root.config || {};
  const contextType: string | undefined = config.contextType || {};

  if (typeof contextType !== 'string') {
    return '{}';
  }

  if (contextType.indexOf('#') === -1) {
    return contextType;
  }

  const [, type] = contextType.split('#');

  return type;
}
