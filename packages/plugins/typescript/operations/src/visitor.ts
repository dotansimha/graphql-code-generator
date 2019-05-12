import { GraphQLSchema } from 'graphql';
import { ParsedDocumentsConfig, BaseDocumentsVisitor, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { TypeScriptSelectionSetToObject } from './ts-selection-set-to-object';
import { TypeScriptOperationVariablesToObject } from './ts-operation-variables-to-object';
import { TypeScriptDocumentsPluginConfig } from './index';

export interface TypeScriptDocumentsParsedConfig extends ParsedDocumentsConfig {
  avoidOptionals: boolean;
  immutableTypes: boolean;
}

export class TypeScriptDocumentsVisitor extends BaseDocumentsVisitor<TypeScriptDocumentsPluginConfig, TypeScriptDocumentsParsedConfig> {
  constructor(schema: GraphQLSchema, config: TypeScriptDocumentsPluginConfig, allFragments: LoadedFragment[]) {
    super(
      config,
      {
        avoidOptionals: config.avoidOptionals || false,
        immutableTypes: config.immutableTypes || false,
      } as TypeScriptDocumentsParsedConfig,
      schema
    );

    this.setSelectionSetHandler(new TypeScriptSelectionSetToObject(this.scalars, this.schema, this.convertName, this.config.addTypename, allFragments, this.config.immutableTypes, this.config.namespacedImportName));
    this.setVariablesTransformer(new TypeScriptOperationVariablesToObject(this.scalars, this.convertName, this.config.avoidOptionals, this.config.immutableTypes));
  }
}
