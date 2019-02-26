import { ScalarsMap } from './types';
import * as autoBind from 'auto-bind';
import { resolveExternalModuleAndFn } from 'graphql-codegen-plugin-helpers';
import { DEFAULT_SCALARS } from './scalars';
import { toPascalCase, DeclarationBlock, DeclarationBlockConfig } from './utils';
import {
  GraphQLSchema,
  FragmentDefinitionNode,
  GraphQLObjectType,
  OperationDefinitionNode,
  VariableDefinitionNode
} from 'graphql';
import { SelectionSetToObject } from './selection-set-to-object';
import { OperationVariablesToObject } from './variables-to-object';

export interface ParsedDocumentsConfig {
  scalars: ScalarsMap;
  convert: (str: string) => string;
  typesPrefix: string;
  addTypename: boolean;
}

export interface RawDocumentsConfig {
  scalars?: ScalarsMap;
  namingConvention?: string;
  typesPrefix?: string;
  skipTypename?: boolean;
}

export class BaseDocumentsVisitor<
  TRawConfig extends RawDocumentsConfig = RawDocumentsConfig,
  TPluginConfig extends ParsedDocumentsConfig = ParsedDocumentsConfig
> {
  protected _parsedConfig: TPluginConfig;
  protected _declarationBlockConfig: DeclarationBlockConfig = {};
  protected _unnamedCounter = 1;
  protected _variablesTransfomer: OperationVariablesToObject;
  protected _selectionSetToObject: SelectionSetToObject;

  constructor(
    rawConfig: TRawConfig,
    additionalConfig: TPluginConfig,
    protected _schema: GraphQLSchema,
    defaultScalars: ScalarsMap = DEFAULT_SCALARS
  ) {
    this._parsedConfig = {
      addTypename: !rawConfig.skipTypename,
      scalars: { ...(defaultScalars || DEFAULT_SCALARS), ...(rawConfig.scalars || {}) },
      convert: rawConfig.namingConvention ? resolveExternalModuleAndFn(rawConfig.namingConvention) : toPascalCase,
      typesPrefix: rawConfig.typesPrefix || '',
      ...((additionalConfig || {}) as any)
    };

    autoBind(this);
    this._variablesTransfomer = new OperationVariablesToObject(this.scalars, this.convertName);
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

  public convertName(name: any, addPrefix = true): string {
    return (addPrefix ? this._parsedConfig.typesPrefix : '') + this._parsedConfig.convert(name);
  }

  public get config(): TPluginConfig {
    return this._parsedConfig;
  }

  public get schema(): GraphQLSchema {
    return this._schema;
  }

  public get scalars(): ScalarsMap {
    return this.config.scalars;
  }

  public get addTypename(): boolean {
    return this._parsedConfig.addTypename;
  }

  private handleAnonymouseOperation(name: string | null): string {
    if (name) {
      return this.convertName(name);
    }

    return this.convertName(`Unnamed_${this._unnamedCounter++}_`);
  }

  FragmentDefinition = (node: FragmentDefinitionNode): string => {
    const fragmentRootType = this._schema.getType(node.typeCondition.name.value) as GraphQLObjectType;
    const selectionSet = this._selectionSetToObject.createNext(fragmentRootType, node.selectionSet);

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node.name.value + 'Fragment', true))
      .withContent(selectionSet.string).string;
  };

  OperationDefinition = (node: OperationDefinitionNode): string => {
    const name = this.handleAnonymouseOperation(node.name && node.name.value ? node.name.value : null);
    const operationRootType = this._schema.getType(toPascalCase(node.operation)) as GraphQLObjectType;
    const selectionSet = this._selectionSetToObject.createNext(operationRootType, node.selectionSet);
    const visitedOperationVariables = this._variablesTransfomer.transform<VariableDefinitionNode>(
      node.variableDefinitions
    );

    const operationResult = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(name + toPascalCase(node.operation)))
      .withContent(selectionSet.string).string;

    const operationVariables = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(name + toPascalCase(node.operation) + 'Variables'))
      .withBlock(visitedOperationVariables).string;

    return [operationVariables, operationResult].filter(r => r).join('\n\n');
  };
}
