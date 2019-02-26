import { GraphQLSchema } from 'graphql';
import { ParsedDocumentsConfig, BaseDocumentsVisitor } from 'graphql-codegen-visitor-plugin-common';
import { TypeScriptSelectionSetToObject } from './ts-selection-set-to-object';
import { TypeScriptDocumentsPluginConfig } from './index';
import { TypeScriptOperationVariablesToObject } from 'graphql-codegen-typescript';

export interface TypeScriptDocumentsParsedConfig extends ParsedDocumentsConfig {
  avoidOptionals: boolean;
}

export class TypeScriptDocumentsVisitor extends BaseDocumentsVisitor<
  TypeScriptDocumentsPluginConfig,
  TypeScriptDocumentsParsedConfig
> {
  constructor(schema: GraphQLSchema, config: TypeScriptDocumentsPluginConfig) {
    super(
      config,
      {
        avoidOptionals: config.avoidOptionals || false
      } as any,
      schema
    );

    this.setSelectionSetHandler(
      new TypeScriptSelectionSetToObject(this.scalars, this.schema, this.convertName, this.config.addTypename)
    );
    this.setVariablesTransformer(
      new TypeScriptOperationVariablesToObject(this.scalars, this.convertName, this.config.avoidOptionals)
    );
  }
}
