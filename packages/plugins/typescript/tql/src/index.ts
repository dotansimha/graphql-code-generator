import { GraphQLSchema, printSchema, buildASTSchema, stripIgnoredCharacters } from 'graphql';
import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { parse, visit } from 'graphql';

import { transform } from './transforms';
import { printType } from './utils';
import { cleanup } from './clean-ast';
import { RawGraphQLTQLPluginConfig } from './config';

const render = (schema: GraphQLSchema): string => {
  let ast = parse(printSchema(schema), { noLocation: true });

  ast = cleanup(ast);

  const transformed = [transform(ast, schema)];

  const results = transformed.map(visitor => visit(ast, visitor));

  const types = Object.values(schema.getTypeMap()).filter(type => !type.name.startsWith('__'));

  const typeMap = `
    interface ISchema {
      ${types.map(printType).join('\n')}
    }
  `;

  const source = [
    `const SCHEMA = buildASTSchema(parse(\`${stripIgnoredCharacters(printSchema(buildASTSchema(ast)))}\`))`,
    typeMap,
    results.flatMap(result => result.definitions.map(code => code.toString())).join('\n'),
    `export type ExtractFragment<T extends InlineFragment<any, any>> = SpreadFragment<ISchema, T, SelectionSet<[]>>;`,
  ].join('\n');

  return source;
};

export const plugin: PluginFunction<RawGraphQLTQLPluginConfig> = (schema: GraphQLSchema, _documents, _config) => {
  return {
    prepend: [
      `import { parse, buildASTSchema } from 'graphql';`,
      `import { TypeConditionError, NamedType, Field, InlineFragment, Argument, Variable, Selection, SelectionSet, SelectionBuilder, namedType, field, inlineFragment, argument, selectionSet, SpreadFragment } from '@timkendall/tql';`,
      `export type { Result,  Variables } from '@timkendall/tql';`,
      `export { $ } from '@timkendall/tql';`,
    ],
    content: render(schema),
  };
};
