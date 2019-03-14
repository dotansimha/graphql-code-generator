import { ScalarsMap, NamingConvention, ConvertFn, ConvertOptions } from './types';
import * as autoBind from 'auto-bind';
import { DEFAULT_SCALARS } from './scalars';
import { toPascalCase, DeclarationBlock, DeclarationBlockConfig } from './utils';
import {
  GraphQLSchema,
  FragmentDefinitionNode,
  GraphQLObjectType,
  OperationDefinitionNode,
  VariableDefinitionNode,
  OperationTypeNode,
  ASTNode
} from 'graphql';
import { SelectionSetToObject } from './selection-set-to-object';
import { OperationVariablesToObject } from './variables-to-object';
import { convertFactory } from './naming';
import { BaseVisitorConvertOptions } from './base-visitor';

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

export interface ParsedDocumentsConfig {
  scalars: ScalarsMap;
  convert: ConvertFn<ConvertOptions>;
  typesPrefix: string;
  addTypename: boolean;
}

export interface RawDocumentsConfig {
  scalars?: ScalarsMap;
  namingConvention?: NamingConvention;
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
      convert: convertFactory(rawConfig),
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

  public convertName(node: ASTNode | string, options?: ConvertOptions & BaseVisitorConvertOptions): string {
    const useTypesPrefix = options && typeof options.useTypesPrefix === 'boolean' ? options.useTypesPrefix : true;
    return (useTypesPrefix ? this._parsedConfig.typesPrefix : '') + this._parsedConfig.convert(node, options);
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

  private handleAnonymouseOperation(node: OperationDefinitionNode): string {
    const name = node.name && node.name.value;

    if (name) {
      return this.convertName(node, {
        useTypesPrefix: false
      });
    }

    return this.convertName(this._unnamedCounter++ + '', {
      prefix: 'Unnamed_',
      suffix: '_',
      useTypesPrefix: false
    });
  }

  FragmentDefinition(node: FragmentDefinitionNode): string {
    const fragmentRootType = this._schema.getType(node.typeCondition.name.value) as GraphQLObjectType;
    const selectionSet = this._selectionSetToObject.createNext(fragmentRootType, node.selectionSet);

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(
        this.convertName(node, {
          useTypesPrefix: true,
          suffix: 'Fragment'
        })
      )
      .withContent(selectionSet.string).string;
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    const name = this.handleAnonymouseOperation(node);
    const operationRootType = getRootType(node.operation, this._schema);
    const selectionSet = this._selectionSetToObject.createNext(operationRootType, node.selectionSet);
    const visitedOperationVariables = this._variablesTransfomer.transform<VariableDefinitionNode>(
      node.variableDefinitions
    );

    const operationResult = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(
        this.convertName(name, {
          suffix: toPascalCase(node.operation)
        })
      )
      .withContent(selectionSet.string).string;

    const operationVariables = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(
        this.convertName(name, {
          suffix: toPascalCase(node.operation) + 'Variables'
        })
      )
      .withBlock(visitedOperationVariables).string;

    return [operationVariables, operationResult].filter(r => r).join('\n\n');
  }
}
