import { GraphQLSchema } from 'graphql';
import { ParsedDocumentsConfig, BaseDocumentsVisitor } from 'graphql-codegen-visitor-plugin-common';
import { FlowOperationVariablesToObject } from '../../flow/src/flow-variables-to-object';
import { TypeScriptSelectionSetToObject } from './ts-selection-set-to-object';
import { TypeScriptDocumentsPluginConfig } from './index';

export interface TypeScriptDocumentsParsedConfig extends ParsedDocumentsConfig {}

export class TypeScriptDocumentsVisitor extends BaseDocumentsVisitor<
  TypeScriptDocumentsPluginConfig,
  TypeScriptDocumentsParsedConfig
> {
  constructor(schema: GraphQLSchema, config: TypeScriptDocumentsPluginConfig) {
    super(config, null, schema);

    this.setSelectionSetHandler(
      new TypeScriptSelectionSetToObject(this.scalars, this.schema, this.convertName, this.config.addTypename)
    );
    this.setVariablesTransformer(new FlowOperationVariablesToObject(this.scalars, this.convertName));
  }
}
