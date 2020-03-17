import { FlowWithPickSelectionSetProcessor } from './flow-selection-set-processor';
import { GraphQLSchema, isEnumType } from 'graphql';
import { FlowDocumentsPluginConfig } from './config';
import { FlowOperationVariablesToObject } from '@graphql-codegen/flow';
import {
  wrapTypeWithModifiers,
  PreResolveTypesProcessor,
  ParsedDocumentsConfig,
  BaseDocumentsVisitor,
  LoadedFragment,
  SelectionSetProcessorConfig,
  SelectionSetToObject,
  getConfigValue,
  DeclarationKind,
} from '@graphql-codegen/visitor-plugin-common';

import autoBind from 'auto-bind';

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

    const wrapArray = (type: string) => `Array<${type}>`;
    const wrapOptional = (type: string) => `?${type}`;

    const processorConfig: SelectionSetProcessorConfig = {
      namespacedImportName: this.config.namespacedImportName,
      convertName: this.convertName.bind(this),
      enumPrefix: this.config.enumPrefix,
      scalars: this.scalars,
      formatNamedField: (name: string): string => name,
      wrapTypeWithModifiers(baseType, type) {
        return wrapTypeWithModifiers(baseType, type, { wrapOptional, wrapArray });
      },
    };
    const processor = config.preResolveTypes
      ? new PreResolveTypesProcessor(processorConfig)
      : new FlowWithPickSelectionSetProcessor({
          ...processorConfig,
          useFlowExactObjects: this.config.useFlowExactObjects,
          useFlowReadOnlyTypes: this.config.useFlowReadOnlyTypes,
        });
    const enumsNames = Object.keys(schema.getTypeMap()).filter(typeName => isEnumType(schema.getType(typeName)));
    this.setSelectionSetHandler(
      new SelectionSetToObject(
        processor,
        this.scalars,
        this.schema,
        this.convertName.bind(this),
        this.getFragmentSuffix.bind(this),
        allFragments,
        this.config
      )
    );
    this.setVariablesTransformer(
      new FlowOperationVariablesToObject(
        this.scalars,
        this.convertName.bind(this),
        this.config.namespacedImportName,
        enumsNames,
        this.config.enumPrefix
      )
    );
  }

  protected getPunctuation(declarationKind: DeclarationKind): string {
    return declarationKind === 'type' ? ',' : ';';
  }
}
