import {
  GraphQLSchema,
  FieldNode,
  SelectionSetNode,
  GraphQLType,
  visit,
  GraphQLObjectType,
  FragmentDefinitionNode
} from 'graphql';
import { DeclarationBlock, wrapWithSingleQuotes, indent, DEFAULT_SCALARS } from 'graphql-codegen-flow';
import { ScalarsMap } from './index';
import { OperationDefinitionNode } from 'graphql';
import { pascalCase, pascal } from 'change-case';
import { inspect } from 'util';
import { SelectionSetToObject } from './selection-set-to-object';
import { OperationVariablesToObject } from './operation-variables-to-object';

export interface ParsedDocumentsConfig {
  scalars: ScalarsMap;
}

export interface FlowDocumentsPluginConfig {
  scalars?: ScalarsMap;
}

export class FlowDocumentsVisitor {
  private _parsedConfig: ParsedDocumentsConfig;
  private _unnamedCounter = 1;

  constructor(private _schema: GraphQLSchema, pluginConfig: FlowDocumentsPluginConfig) {
    this._parsedConfig = {
      scalars: { ...DEFAULT_SCALARS, ...(pluginConfig.scalars || {}) }
    };
  }

  private convert(name: string): string {
    return pascalCase(name);
  }

  private getFragmentName(nodeName: string): string {
    return this.convert(nodeName) + 'Fragment';
  }

  private handleAnonymouseOperation(name: string | null): string {
    if (name) {
      return this.convert(name);
    }

    return `Unnamed_${this._unnamedCounter++}_`;
  }

  FragmentDefinition = (node: FragmentDefinitionNode): string => {
    const fragmentRootType = this._schema.getType(node.typeCondition.name.value) as GraphQLObjectType;
    const selectionSet = new SelectionSetToObject(
      this._parsedConfig.scalars,
      this._schema,
      fragmentRootType,
      node.selectionSet
    );

    return new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(this.getFragmentName(node.name.value))
      .withContent(selectionSet.string).string;
  };

  OperationDefinition = (node: OperationDefinitionNode): string => {
    const name = this.handleAnonymouseOperation(node.name && node.name.value ? node.name.value : null);
    const operationRootType = this._schema.getType(pascalCase(node.operation)) as GraphQLObjectType;
    const selectionSet = new SelectionSetToObject(
      this._parsedConfig.scalars,
      this._schema,
      operationRootType,
      node.selectionSet
    );
    const visitedOperationVariables = new OperationVariablesToObject(
      this._parsedConfig.scalars,
      this._schema,
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
