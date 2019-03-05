import { GraphQLSchema, GraphQLObjectType, FragmentDefinitionNode, VariableDefinitionNode } from 'graphql';
import {
  wrapAstTypeWithModifiers,
  DeclarationBlock,
  toPascalCase,
  OperationVariablesToObject,
  DEFAULT_SCALARS
} from 'graphql-codegen-visitor-plugin-common';
import { ScalarsMap, FlowDocumentsPluginConfig } from './index';
import { OperationDefinitionNode } from 'graphql';
import { pascalCase } from 'change-case';
import { SelectionSetToObject } from './selection-set-to-object';
import { resolveExternalModuleAndFn } from 'graphql-codegen-plugin-helpers';
import * as authBind from 'auto-bind';

export interface ParsedDocumentsConfig {
  scalars: ScalarsMap;
  addTypename: boolean;
  convert: (str: string) => string;
  typesPrefix: string;
  useFlowExactObjects: boolean;
  useFlowReadOnlyTypes: boolean;
}

export class FlowDocumentsVisitor {
  private _parsedConfig: ParsedDocumentsConfig;
  private _unnamedCounter = 1;

  constructor(private _schema: GraphQLSchema, pluginConfig: FlowDocumentsPluginConfig) {
    this._parsedConfig = {
      addTypename: !pluginConfig.skipTypename,
      scalars: { ...DEFAULT_SCALARS, ...(pluginConfig.scalars || {}) },
      convert: pluginConfig.namingConvention ? resolveExternalModuleAndFn(pluginConfig.namingConvention) : toPascalCase,
      typesPrefix: pluginConfig.typesPrefix || '',
      useFlowExactObjects: pluginConfig.useFlowExactObjects || false,
      useFlowReadOnlyTypes: pluginConfig.useFlowReadOnlyTypes || false
    };
    authBind(this);
  }

  public convertName(name: any, addPrefix = true): string {
    return (addPrefix ? this._parsedConfig.typesPrefix : '') + this._parsedConfig.convert(name);
  }

  public getFragmentName(nodeName: string): string {
    return this.convertName(nodeName + 'Fragment');
  }

  public get parsedConfig(): ParsedDocumentsConfig {
    return this._parsedConfig;
  }

  public get schema(): GraphQLSchema {
    return this._schema;
  }

  public get scalars(): ScalarsMap {
    return this._parsedConfig.scalars;
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
    const selectionSet = new SelectionSetToObject(this, fragmentRootType, node.selectionSet);

    return new DeclarationBlock(this._parsedConfig)
      .export()
      .asKind('type')
      .withName(this.getFragmentName(node.name.value))
      .withContent(selectionSet.string).string;
  };

  OperationDefinition = (node: OperationDefinitionNode): string => {
    const name = this.handleAnonymouseOperation(node.name && node.name.value ? node.name.value : null);
    const operationRootType = this._schema.getType(pascalCase(node.operation)) as GraphQLObjectType;
    const selectionSet = new SelectionSetToObject(this, operationRootType, node.selectionSet);
    const visitedOperationVariables = new OperationVariablesToObject<VariableDefinitionNode>(
      this._parsedConfig.scalars,
      this.convertName,
      node.variableDefinitions,
      wrapAstTypeWithModifiers('?')
    );

    const operationResult = new DeclarationBlock(this._parsedConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(name + pascalCase(node.operation)))
      .withContent(selectionSet.string).string;

    const operationVariables = !visitedOperationVariables
      ? null
      : new DeclarationBlock(this._parsedConfig)
          .export()
          .asKind('type')
          .withName(this.convertName(name + pascalCase(node.operation) + 'Variables'))
          .withBlock(visitedOperationVariables.string).string;

    return [operationVariables, operationResult].filter(r => r).join('\n\n');
  };
}
