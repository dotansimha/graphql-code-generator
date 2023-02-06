import { getIntrospectedSchema, minifyIntrospectionQuery } from '@urql/introspection';

import { plugin as typescriptPlugin, TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { NhostPluginConfig } from './config';

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export const plugin: PluginFunction<NhostPluginConfig, Types.ComplexPluginOutput> = (schema, documents, config) => {
  // * We don't allow the other @graphql-codegen/typescript options as they could break the generator and the types.
  const { scalars } = config;
  const conf: TypeScriptPluginConfig = {
    scalars,
    declarationKind: 'type',
    enumsAsTypes: true,
    // * Add underscore to args type to avoid conflicts with the generated types
    // * See: https://the-guild.dev/graphql/codegen/plugins/typescript/typescript#addunderscoretoargstype
    addUnderscoreToArgsType: true,
  };
  const minifiedData = minifyIntrospectionQuery(getIntrospectedSchema(schema), {
    includeDirectives: false,
    includeEnums: true,
    includeInputs: true,
    includeScalars: true,
  });

  const { prepend, content } = typescriptPlugin(schema, documents, conf) as UnwrapPromise<
    ReturnType<typeof typescriptPlugin>
  >;

  // * https://stackoverflow.com/questions/2008279/validate-a-javascript-function-name
  const types = Array.from(content.matchAll(/^export type ([$A-Z_][0-9A-Z_$]*) = /gim))
    .map(([, name]) => `\n${name}: ${name}`)
    .join(',');

  const result = `
export default {
  introspection: ${JSON.stringify(minifiedData, null, 2).replace(/^/gm, '  ').slice(2)} as const,
  types: {} as {${types.replace(/^/gm, '    ').slice(4)}
  }
}`;

  return {
    prepend,
    content: [content, result].join('\n'),
  };
};
export default plugin;
