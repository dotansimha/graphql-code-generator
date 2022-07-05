import { FlowWithPickSelectionSetProcessor } from './flow-selection-set-processor.js';
import {
  GraphQLSchema,
  isEnumType,
  isNonNullType,
  GraphQLOutputType,
  GraphQLNamedType,
  SelectionSetNode,
} from 'graphql';
import { FlowDocumentsPluginConfig } from './config.js';
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
  generateFragmentImportStatement,
} from '@graphql-codegen/visitor-plugin-common';

class FlowSelectionSetToObject extends SelectionSetToObject {
  getUnknownType() {
    return 'any';
  }

  public createNext(parentSchemaType: GraphQLNamedType, selectionSet: SelectionSetNode): SelectionSetToObject {
    return new FlowSelectionSetToObject(
      this._processor,
      this._scalars,
      this._schema,
      this._convertName.bind(this),
      this._getFragmentSuffix.bind(this),
      this._loadedFragments,
      this._config,
      parentSchemaType,
      selectionSet
    );
  }
}

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

    const wrapArray = (type: string) => `${this.config.useFlowReadOnlyTypes ? '$ReadOnlyArray' : 'Array'}<${type}>`;
    const wrapOptional = (type: string) => `?${type}`;

    const { useFlowReadOnlyTypes } = this.config;
    const formatNamedField = (
      name: string,
      type: GraphQLOutputType | GraphQLNamedType | null,
      isConditional = false
    ): string => {
      const optional = (!!type && !isNonNullType(type)) || isConditional;
      return `${useFlowReadOnlyTypes ? '+' : ''}${name}${optional ? '?' : ''}`;
    };

    const processorConfig: SelectionSetProcessorConfig = {
      namespacedImportName: this.config.namespacedImportName,
      convertName: this.convertName.bind(this),
      enumPrefix: this.config.enumPrefix,
      scalars: this.scalars,
      formatNamedField,
      wrapTypeWithModifiers(baseType, type) {
        return wrapTypeWithModifiers(baseType, type, { wrapOptional, wrapArray });
      },
    };

    const processor = config.preResolveTypes
      ? new PreResolveTypesProcessor(processorConfig)
      : new FlowWithPickSelectionSetProcessor({
          ...processorConfig,
          useFlowExactObjects: this.config.useFlowExactObjects,
        });
    const enumsNames = Object.keys(schema.getTypeMap()).filter(typeName => isEnumType(schema.getType(typeName)));
    this.setSelectionSetHandler(
      new FlowSelectionSetToObject(
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
        this.config.enumPrefix,
        {},
        true
      )
    );
  }

  protected getPunctuation(declarationKind: DeclarationKind): string {
    return declarationKind === 'type' ? ',' : ';';
  }

  public getImports(): Array<string> {
    return !this.config.globalNamespace && !this.config.inlineFragmentTypes
      ? this.config.fragmentImports
          // In flow, all non ` * as x` imports must be type imports
          .map(fragmentImport => ({ ...fragmentImport, typesImport: true }))
          .map(fragmentImport => generateFragmentImportStatement(fragmentImport, 'type'))
      : [];
  }
}
