import { NormalizedScalarsMap, ConvertOptions } from './types';
import * as autoBind from 'auto-bind';
import { DEFAULT_SCALARS } from './scalars';
import { toPascalCase, DeclarationBlock, DeclarationBlockConfig, buildScalars, getConfigValue } from './utils';
import { GraphQLSchema, FragmentDefinitionNode, GraphQLObjectType, OperationDefinitionNode, VariableDefinitionNode, OperationTypeNode, ASTNode } from 'graphql';
import { SelectionSetToObject } from './selection-set-to-object';
import { OperationVariablesToObject } from './variables-to-object';
import { BaseVisitor, BaseVisitorConvertOptions } from './base-visitor';
import { ParsedTypesConfig, RawTypesConfig } from './base-types-visitor';

function getRootType(operation: OperationTypeNode, schema: GraphQLSchema) {
  switch (operation) {
    case 'query':
      return schema.getQueryType();
    case 'mutation':
      return schema.getMutationType();
    case 'subscription':
      return schema.getSubscriptionType();
  }
}

export interface ParsedDocumentsConfig extends ParsedTypesConfig {
  addTypename: boolean;
  preResolveTypes: boolean;
  globalNamespace: boolean;
  operationResultSuffix: string;
  dedupeOperationSuffix: boolean;
}

export interface RawDocumentsConfig extends RawTypesConfig {
  /**
   * @name preResolveTypes
   * @type boolean
   * @default false
   * @description Avoid using `Pick` and resolve the actual primitive type of all selection set.
   *
   * @example
   * ```yml
   * plugins
   *   config:
   *     preResolveTypes: true
   * ```
   */
  preResolveTypes?: boolean;
  /**
   * @name globalNamespace
   * @type boolean
   * @default false
   * @description Puts all generated code under `global` namespace. Useful for Stencil integration.
   *
   * @example
   * ```yml
   * plugins
   *   config:
   *     globalNamespace: true
   * ```
   */
  globalNamespace?: boolean;
  /**
   * @name operationResultSuffix
   * @type string
   * @default ""
   * @description Adds a suffix to generated operation result type names
   */
  operationResultSuffix?: string;
  /**
   * @name dedupeOperationSuffix
   * @type boolean
   * @default false
   * @description Set this configuration to `true` if you wish to make sure to remove duplicate operation name suffix.
   */
  dedupeOperationSuffix?: boolean;
}

export class BaseDocumentsVisitor<TRawConfig extends RawDocumentsConfig = RawDocumentsConfig, TPluginConfig extends ParsedDocumentsConfig = ParsedDocumentsConfig> extends BaseVisitor<TRawConfig, TPluginConfig> {
  protected _unnamedCounter = 1;
  protected _variablesTransfomer: OperationVariablesToObject;
  protected _selectionSetToObject: SelectionSetToObject;

  constructor(rawConfig: TRawConfig, additionalConfig: TPluginConfig, protected _schema: GraphQLSchema, defaultScalars: NormalizedScalarsMap = DEFAULT_SCALARS) {
    super(rawConfig, {
      enumPrefix: getConfigValue(rawConfig.enumPrefix, true),
      preResolveTypes: getConfigValue(rawConfig.preResolveTypes, false),
      dedupeOperationSuffix: getConfigValue(rawConfig.dedupeOperationSuffix, false),
      addTypename: !rawConfig.skipTypename,
      globalNamespace: !!rawConfig.globalNamespace,
      operationResultSuffix: getConfigValue(rawConfig.operationResultSuffix, ''),
      scalars: buildScalars(_schema, rawConfig.scalars, defaultScalars),
      ...((additionalConfig || {}) as any),
    });

    autoBind(this);
    this._variablesTransfomer = new OperationVariablesToObject(this.scalars, this.convertName, this.config.namespacedImportName);
  }

  setSelectionSetHandler(handler: SelectionSetToObject) {
    this._selectionSetToObject = handler;
  }

  setDeclarationBlockConfig(config: DeclarationBlockConfig): void {
    this._declarationBlockConfig = config;
  }

  setVariablesTransformer(variablesTransfomer: OperationVariablesToObject): void {
    this._variablesTransfomer = variablesTransfomer;
  }

  public convertName(node: ASTNode | string, options?: ConvertOptions & BaseVisitorConvertOptions): string {
    const useTypesPrefix = options && typeof options.useTypesPrefix === 'boolean' ? options.useTypesPrefix : true;

    return (useTypesPrefix ? this._parsedConfig.typesPrefix : '') + this._parsedConfig.convert(node, options);
  }

  public get schema(): GraphQLSchema {
    return this._schema;
  }

  public get addTypename(): boolean {
    return this._parsedConfig.addTypename;
  }

  private handleAnonymouseOperation(node: OperationDefinitionNode): string {
    const name = node.name && node.name.value;

    if (name) {
      return this.convertName(node, {
        useTypesPrefix: false,
      });
    }

    return this.convertName(this._unnamedCounter++ + '', {
      prefix: 'Unnamed_',
      suffix: '_',
      useTypesPrefix: false,
    });
  }

  FragmentDefinition(node: FragmentDefinitionNode): string {
    const fragmentRootType = this._schema.getType(node.typeCondition.name.value) as GraphQLObjectType;
    const selectionSet = this._selectionSetToObject.createNext(fragmentRootType, node.selectionSet);
    const fragmentSuffix = this.config.dedupeOperationSuffix && node.name.value.toLowerCase().endsWith('fragment') ? '' : 'Fragment';

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(
        this.convertName(node, {
          useTypesPrefix: true,
          suffix: fragmentSuffix,
        })
      )
      .withContent(selectionSet.string).string;
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    const name = this.handleAnonymouseOperation(node);
    const operationRootType = getRootType(node.operation, this._schema);

    if (!operationRootType) {
      throw new Error(`Unable to find root schema type for operation type "${node.operation}"!`);
    }

    const selectionSet = this._selectionSetToObject.createNext(operationRootType, node.selectionSet);
    const visitedOperationVariables = this._variablesTransfomer.transform<VariableDefinitionNode>(node.variableDefinitions);
    const operationTypeSuffix = this.config.dedupeOperationSuffix && name.toLowerCase().endsWith(node.operation) ? '' : toPascalCase(node.operation);

    const operationResult = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(
        this.convertName(name, {
          suffix: operationTypeSuffix + this._parsedConfig.operationResultSuffix,
        })
      )
      .withContent(selectionSet.string).string;

    const operationVariables = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(
        this.convertName(name, {
          suffix: operationTypeSuffix + 'Variables',
        })
      )
      .withBlock(visitedOperationVariables).string;

    return [operationVariables, operationResult].filter(r => r).join('\n\n');
  }
}
