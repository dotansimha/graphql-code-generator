import { SchemaTemplateContext } from 'graphql-codegen-core';
import { Config } from './types';

function convertToPrimitive(map, type): string {
  if (map[type]) {
    return map[type];
  }

  return type;
}

export function typesToLanguagePrimitives(config: Config, templateContext: SchemaTemplateContext) {
  let contextCopy = Object.assign({}, templateContext);
  const map = config.primitives || {};

  contextCopy.types.forEach(type => {
    type.fields.forEach(field => {
      field.arguments.forEach(arg => {
        arg.type = convertToPrimitive(map, arg.type);
      });
      field.type = convertToPrimitive(map, field.type);
    });
  });

  return contextCopy;
}
