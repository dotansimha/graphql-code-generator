import { oldVisit, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { GraphQLSchema } from 'graphql';
import { FlutterFreezedPluginConfig } from './config.js';
import { FreezedDeclarationBlock } from './freezed-declaration-blocks/index.js';
import { schemaVisitor } from './schema-visitor.js';
import { addFreezedImportStatements, DefaultFreezedPluginConfig } from './utils.js';

export const plugin: PluginFunction<FlutterFreezedPluginConfig> = (
  schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config: FlutterFreezedPluginConfig
): string => {
  // sets the defaults for the config
  config = { ...new DefaultFreezedPluginConfig(config) };

  const { schema: _schema, ast } = transformSchemaAST(schema, config);
  const { freezedFactoryBlockRepository, ...visitor } = schemaVisitor(_schema, config);

  const visitorResult = oldVisit(ast, { leave: visitor });

  const generated: FreezedDeclarationBlock[] = visitorResult.definitions.filter(
    (def: any) => def instanceof FreezedDeclarationBlock
  );

  return (
    addFreezedImportStatements(config.fileName) +
    generated
      .map(freezedDeclarationBlock =>
        freezedDeclarationBlock.toString().replaceAll(/==>factory==>.+/gm, s => {
          const pattern = s.replace('==>factory==>', '').trim();
          const [key, appliesOn, name, typeName] = pattern.split('==>');
          return freezedFactoryBlockRepository.retrieve(key, appliesOn, name, typeName ?? null).toString();
        })
      )
      .join('')
      .trim() +
    '\n'
  );
};
