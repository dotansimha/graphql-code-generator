import { codegen } from '@graphql-codegen/core';
import { parse } from 'graphql';
import { TypeScriptResolversPluginConfig } from '../src/config.js';
import { plugin } from '../src/index.js';

export function generate({ schema, config }: { schema: string; config: TypeScriptResolversPluginConfig }) {
  return codegen({
    filename: 'graphql.ts',
    schema: parse(schema),
    documents: [],
    plugins: [{ 'typescript-resolvers': {} }],
    config,
    pluginMap: { 'typescript-resolvers': { plugin } },
  });
}
