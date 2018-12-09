import { GraphQLSchema, GraphQLObjectType, FragmentDefinitionNode, VariableDefinitionNode } from 'graphql';
import { BasicFlowVisitor, OperationVariablesToObject, DeclarationBlock, DEFAULT_SCALARS } from 'graphql-codegen-flow';
import { ScalarsMap } from './index';
import { OperationDefinitionNode } from 'graphql';
import { pascalCase } from 'change-case';
import { SelectionSetToObject } from './selection-set-to-object';

export interface ParsedDocumentsConfig {
  scalars: ScalarsMap;
}

export interface FlowDocumentsPluginConfig {
  scalars?: ScalarsMap;
}

export class FlowDocumentsVisitor implements BasicFlowVisitor {
  private _parsedConfig: ParsedDocumentsConfig;
  private _unnamedCounter = 1;

  constructor(private _schema: GraphQLSchema, pluginConfig: FlowDocumentsPluginConfig) {
    this._parsedConfig = {
      scalars: { ...DEFAULT_SCALARS, ...(pluginConfig.scalars || {}) }
    };
  }

  public convert(name: string): string {
    return pascalCase(name);
  }

  public getFragmentName(nodeName: string): string {
    return this.convert(nodeName) + 'Fragment';
  }

  public get schema(): GraphQLSchema {
    return this._schema;
  }

  public get scalars(): ScalarsMap {
    return this._parsedConfig.scalars;
  }

  private handleAnonymouseOperation(name: string | null): string {
    if (name) {
      return this.convert(name);
    }

    return `Unnamed_${this._unnamedCounter++}_`;
  }

  FragmentDefinition = (node: FragmentDefinitionNode): string => {
    const fragmentRootType = this._schema.getType(node.typeCondition.name.value) as GraphQLObjectType;
    const selectionSet = new SelectionSetToObject(this, fragmentRootType, node.selectionSet);

    return new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(this.getFragmentName(node.name.value))
      .withContent(selectionSet.string).string;
  };

  OperationDefinition = (node: OperationDefinitionNode): string => {
    const name = this.handleAnonymouseOperation(node.name && node.name.value ? node.name.value : null);
    const operationRootType = this._schema.getType(pascalCase(node.operation)) as GraphQLObjectType;
    const selectionSet = new SelectionSetToObject(this, operationRootType, node.selectionSet);
    const visitedOperationVariables = new OperationVariablesToObject<FlowDocumentsVisitor, VariableDefinitionNode>(
      this,
      node.variableDefinitions
    );

    const operationResult = new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(name + pascalCase(node.operation))
      .withContent(selectionSet.string).string;

    const operationVariables = !visitedOperationVariables
      ? null
      : new DeclarationBlock()
          .export()
          .asKind('type')
          .withName(name + pascalCase(node.operation) + 'Variables')
          .withBlock(visitedOperationVariables.string).string;

    return [operationVariables, operationResult].filter(r => r).join('\n\n');
  };
}
