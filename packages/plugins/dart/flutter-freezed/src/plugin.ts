import { oldVisit, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { GraphQLSchema } from 'graphql';
import { FreezedPluginConfig } from './config';
import { schemaVisitor } from './schema-visitor';
import { FreezedDeclarationBlock } from './freezed-declaration-block';

export const plugin: PluginFunction<FreezedPluginConfig> = async (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config: FreezedPluginConfig
): Promise<string> => {
  const { schema: _schema, ast } = transformSchemaAST(schema, config);
  const { freezedFactoryBlockRepository, ...visitor } = schemaVisitor(_schema, config);

  const visitorResult = oldVisit(ast, { leave: visitor });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const generated: FreezedDeclarationBlock[] = visitorResult.definitions.filter(
    def => def instanceof FreezedDeclarationBlock
  );

  generated.forEach(freezedDeclarationBlock => {
    // eslint-disable-next-line no-console
    console.log(freezedDeclarationBlock.toString());
  });

  return '';
};
