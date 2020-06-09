import { NormalizedScalarsMap } from './types';
import autoBind from 'auto-bind';
import { DEFAULT_SCALARS } from './scalars';
import { DeclarationBlock, DeclarationBlockConfig, buildScalars, getConfigValue } from './utils';
import {
  GraphQLSchema,
  FragmentDefinitionNode,
  GraphQLObjectType,
  OperationDefinitionNode,
  VariableDefinitionNode,
  OperationTypeNode,
} from 'graphql';
import { SelectionSetToObject } from './selection-set-to-object';
import { OperationVariablesToObject } from './variables-to-object';
import { BaseVisitor } from './base-visitor';
import { ParsedTypesConfig, RawTypesConfig } from './base-types-visitor';
import { pascalCase } from 'pascal-case';

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
  omitOperationSuffix: boolean;
  namespacedImportName: string | null;
  exportFragmentSpreadSubTypes: boolean;
}

export interface RawDocumentsConfig extends RawTypesConfig {
  /**
   * @default false
   * @description Avoid using `Pick` and resolve the actual primitive type of all selection set.
   *
   * @exampleMarkdown
   * ```yml
   * plugins
   *   config:
   *     preResolveTypes: true
   * ```
   */
  preResolveTypes?: boolean;
  /**
   * @default false
   * @description Puts all generated code under `global` namespace. Useful for Stencil integration.
   *
   * @exampleMarkdown
   * ```yml
   * plugins
   *   config:
   *     globalNamespace: true
   * ```
   */
  globalNamespace?: boolean;
  /**
   * @default ""
   * @description Adds a suffix to generated operation result type names
   */
  operationResultSuffix?: string;
  /**
   * @default false
   * @description Set this configuration to `true` if you wish to make sure to remove duplicate operation name suffix.
   */
  dedupeOperationSuffix?: boolean;
  /**
   * @default false
   * @description Set this configuration to `true` if you wish to disable auto add suffix of operation name, like `Query`, `Mutation`, `Subscription`, `Fragment`.
   */
  omitOperationSuffix?: boolean;
  /**
   * @default false
   * @description If set to true, it will export the sub-types created in order to make it easier to access fields declared under fragment spread.
   */
  exportFragmentSpreadSubTypes?: boolean;

  // The following are internal, and used by presets
  /**
   * @ignore
   */
  namespacedImportName?: string;
}

export class BaseDocumentsVisitor<
  TRawConfig extends RawDocumentsConfig = RawDocumentsConfig,
  TPluginConfig extends ParsedDocumentsConfig = ParsedDocumentsConfig
> extends BaseVisitor<TRawConfig, TPluginConfig> {
  protected _unnamedCounter = 1;
  protected _variablesTransfomer: OperationVariablesToObject;
  protected _selectionSetToObject: SelectionSetToObject;
  protected _globalDeclarations: Set<string> = new Set<string>();

  constructor(
    rawConfig: TRawConfig,
    additionalConfig: TPluginConfig,
    protected _schema: GraphQLSchema,
    defaultScalars: NormalizedScalarsMap = DEFAULT_SCALARS
  ) {
    super(rawConfig, {
      exportFragmentSpreadSubTypes: getConfigValue(rawConfig.exportFragmentSpreadSubTypes, false),
      enumPrefix: getConfigValue(rawConfig.enumPrefix, true),
      preResolveTypes: getConfigValue(rawConfig.preResolveTypes, false),
      dedupeOperationSuffix: getConfigValue(rawConfig.dedupeOperationSuffix, false),
      omitOperationSuffix: getConfigValue(rawConfig.omitOperationSuffix, false),
      namespacedImportName: getConfigValue(rawConfig.namespacedImportName, null),
      addTypename: !rawConfig.skipTypename,
      globalNamespace: !!rawConfig.globalNamespace,
      operationResultSuffix: getConfigValue(rawConfig.operationResultSuffix, ''),
      scalars: buildScalars(_schema, rawConfig.scalars, defaultScalars),
      ...((additionalConfig || {}) as any),
    });

    autoBind(this);
    this._variablesTransfomer = new OperationVariablesToObject(
      this.scalars,
      this.convertName,
      this.config.namespacedImportName
    );
  }

  public getGlobalDeclarations(noExport = false): string[] {
    return Array.from(this._globalDeclarations).map(t => (noExport ? t : `export ${t}`));
  }

  setSelectionSetHandler(handler: SelectionSetToObject): void {
    this._selectionSetToObject = handler;
  }

  setDeclarationBlockConfig(config: DeclarationBlockConfig): void {
    this._declarationBlockConfig = config;
  }

  setVariablesTransformer(variablesTransfomer: OperationVariablesToObject): void {
    this._variablesTransfomer = variablesTransfomer;
  }

  public get schema(): GraphQLSchema {
    return this._schema;
  }

  public get addTypename(): boolean {
    return this._parsedConfig.addTypename;
  }

  private handleAnonymousOperation(node: OperationDefinitionNode): string {
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
    const fragmentSuffix = this.getFragmentSuffix(node);

    return selectionSet.transformFragmentSelectionSetToTypes(
      node.name.value,
      fragmentSuffix,
      this._declarationBlockConfig
    );
  }

  protected applyVariablesWrapper(variablesBlock: string): string {
    return variablesBlock;
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    const name = this.handleAnonymousOperation(node);
    const operationRootType = getRootType(node.operation, this._schema);

    if (!operationRootType) {
      throw new Error(`Unable to find root schema type for operation type "${node.operation}"!`);
    }

    const selectionSet = this._selectionSetToObject.createNext(operationRootType, node.selectionSet);
    const visitedOperationVariables = this._variablesTransfomer.transform<VariableDefinitionNode>(
      node.variableDefinitions
    );
    const operationType: string = pascalCase(node.operation);
    const operationTypeSuffix = this.getOperationSuffix(name, operationType);

    const operationResult = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(
        this.convertName(name, {
          suffix: operationTypeSuffix + this._parsedConfig.operationResultSuffix,
        })
      )
      .withContent(selectionSet.transformSelectionSet()).string;

    const operationVariables = new DeclarationBlock({
      ...this._declarationBlockConfig,
      blockTransformer: t => this.applyVariablesWrapper(t),
    })
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
