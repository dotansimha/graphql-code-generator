import { GraphQLSchema } from 'graphql';
import { FlowDocumentsPluginConfig } from './index';
import { ParsedDocumentsConfig, BaseDocumentsVisitor, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { FlowSelectionSetToObject } from './flow-selection-set-to-object';
import { FlowOperationVariablesToObject } from '@graphql-codegen/flow';

export interface FlowDocumentsParsedConfig extends ParsedDocumentsConfig {
  useFlowExactObjects: boolean;
  useFlowReadOnlyTypes: boolean;
}

export class FlowDocumentsVisitor extends BaseDocumentsVisitor<FlowDocumentsPluginConfig, FlowDocumentsParsedConfig> {
  constructor(schema: GraphQLSchema, config: FlowDocumentsPluginConfig, allFragments: LoadedFragment[]) {
    super(
      config,
      {
        useFlowExactObjects: config.useFlowExactObjects || false,
        useFlowReadOnlyTypes: config.useFlowReadOnlyTypes || false,
      } as FlowDocumentsParsedConfig,
      schema
    );

    this.setSelectionSetHandler(new FlowSelectionSetToObject(this.scalars, this.schema, this.convertName, this.config.addTypename, allFragments, this.config));
    this.setVariablesTransformer(new FlowOperationVariablesToObject(this.scalars, this.convertName, this.config.namespacedImportName));
  }
}
