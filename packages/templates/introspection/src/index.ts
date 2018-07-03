import { SchemaTemplateContext, CustomProcessingFunction, FileOutput } from 'graphql-codegen-core';
import { introspectionFromSchema } from 'graphql';

const createIntrospection: CustomProcessingFunction = (templateContext: SchemaTemplateContext): FileOutput[] => {
  const introspection = introspectionFromSchema(templateContext.rawSchema, { descriptions: true });

  return [
    {
      filename: 'graphql.schema.json',
      content: JSON.stringify(introspection)
    }
  ];
};

export default createIntrospection;
