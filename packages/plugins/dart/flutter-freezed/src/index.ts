import { oldVisit, PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { transformSchemaAST } from '@graphql-codegen/schema-ast';
import { GraphQLSchema } from 'graphql';
import { FlutterFreezedPluginConfig } from './config';
import { FreezedDeclarationBlock } from './freezed-declaration-blocks';
import { schemaVisitor } from './schema-visitor';
import { addFreezedImportStatements, DefaultFreezedPluginConfig } from './utils';

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
    addFreezedImportStatements(config.fileName ?? '') +
    generated
      .map(freezedDeclarationBlock =>
        freezedDeclarationBlock.toString().replace(/==>factory==>.+\n/gm, s => {
          const pattern = s.replace('==>factory==>', '').trim();
          // console.log('pattern:-->', pattern);
          const [key, appliesOn, name, typeName] = pattern.split('==>');
          if (appliesOn === 'class_factory') {
            return freezedFactoryBlockRepository.retrieve(key, appliesOn, name);
          }
          return freezedFactoryBlockRepository.retrieve(key, appliesOn, name, typeName);
        })
      )
      .join('')
      .trim()
  );
};
