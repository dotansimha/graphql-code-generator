import { GraphQLSchema } from 'graphql';
import { ScalarsMap, FlowDocumentsPluginConfig } from './index';
import { ParsedDocumentsConfig, BaseDocumentsVisitor } from 'graphql-codegen-visitor-plugin-common';
import { FlowSelectionSetToObject } from './flow-selection-set-to-object';
import { FlowOperationVariablesToObject } from '../../flow/src/flow-variables-to-object';

export interface FlowDocumentsParsedConfig extends ParsedDocumentsConfig {
  useFlowExactObjects: boolean;
  useFlowReadOnlyTypes: boolean;
}

export class FlowDocumentsVisitor extends BaseDocumentsVisitor<FlowDocumentsPluginConfig, FlowDocumentsParsedConfig> {
  constructor(schema: GraphQLSchema, config: FlowDocumentsPluginConfig) {
    super(
      config,
      {
        useFlowExactObjects: config.useFlowExactObjects || false,
        useFlowReadOnlyTypes: config.useFlowReadOnlyTypes || false
      } as FlowDocumentsParsedConfig,
      schema,
      null,
      FlowSelectionSetToObject
    );

    this.setVariablesTransformer(new FlowOperationVariablesToObject(this.scalars, this.convertName));
  }
}
