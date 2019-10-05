import { FlowWithPickSelectionSetProcessor } from './flow-selection-set-processor';
import { GraphQLSchema, isListType, GraphQLObjectType, GraphQLNonNull, GraphQLList, isEnumType } from 'graphql';
import { FlowDocumentsPluginConfig } from './index';
import { FlowOperationVariablesToObject } from '@graphql-codegen/flow';
import { PreResolveTypesProcessor, ParsedDocumentsConfig, BaseDocumentsVisitor, LoadedFragment, SelectionSetProcessorConfig, SelectionSetToObject, getConfigValue } from '@graphql-codegen/visitor-plugin-common';
import { isNonNullType } from 'graphql';
import * as autoBind from 'auto-bind';

export interface FlowDocumentsParsedConfig extends ParsedDocumentsConfig {
  useFlowExactObjects: boolean;
  useFlowReadOnlyTypes: boolean;
}

export class FlowDocumentsVisitor extends BaseDocumentsVisitor<FlowDocumentsPluginConfig, FlowDocumentsParsedConfig> {
  constructor(schema: GraphQLSchema, config: FlowDocumentsPluginConfig, allFragments: LoadedFragment[]) {
    super(
      config,
      {
        useFlowExactObjects: getConfigValue(config.useFlowExactObjects, true),
        useFlowReadOnlyTypes: getConfigValue(config.useFlowReadOnlyTypes, false),
      } as FlowDocumentsParsedConfig,
      schema
    );

    autoBind(this);

    const clearOptional = (str: string): string => {
      if (str.startsWith('?')) {
        return str.substring(1);
      }

      return str;
    };

    const wrapTypeWithModifiers = (baseType: string, type: GraphQLObjectType | GraphQLNonNull<GraphQLObjectType> | GraphQLList<GraphQLObjectType>): string => {
      if (isNonNullType(type)) {
        return clearOptional(wrapTypeWithModifiers(baseType, type.ofType));
      } else if (isListType(type)) {
        const innerType = wrapTypeWithModifiers(baseType, type.ofType);

        return `?Array<${innerType}>`;
      } else {
        return `?${baseType}`;
      }
    };

    const processorConfig: SelectionSetProcessorConfig = {
      namespacedImportName: this.config.namespacedImportName,
      convertName: this.convertName.bind(this),
      enumPrefix: this.config.enumPrefix,
      scalars: this.scalars,
      formatNamedField: (name: string): string => name,
      wrapTypeWithModifiers,
    };
    const processor = config.preResolveTypes
      ? new PreResolveTypesProcessor(processorConfig)
      : new FlowWithPickSelectionSetProcessor({
          ...processorConfig,
          useFlowExactObjects: this.config.useFlowExactObjects,
          useFlowReadOnlyTypes: this.config.useFlowReadOnlyTypes,
        });
    const enumsNames = Object.keys(schema.getTypeMap()).filter(typeName => isEnumType(schema.getType(typeName)));
    this.setSelectionSetHandler(new SelectionSetToObject(processor, this.scalars, this.schema, this.convertName.bind(this), allFragments, this.config));
    this.setVariablesTransformer(new FlowOperationVariablesToObject(this.scalars, this.convertName.bind(this), this.config.namespacedImportName, enumsNames, this.config.enumPrefix));
  }
}
