import { SafeString } from 'handlebars';
import { introspectionFromSchema } from 'graphql';

export function toIntrospection(type, options) {
  if (!options) {
    return '';
  }

  const schema = options.data.root.rawSchema;
  const introspection = introspectionFromSchema(schema, { descriptions: true });

  return new SafeString(
    JSON.stringify({
      data: introspection
    })
  );
}
