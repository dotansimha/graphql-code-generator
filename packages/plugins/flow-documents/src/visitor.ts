import { GraphQLSchema, FieldNode, SelectionSetNode, GraphQLType, visit, GraphQLObjectType } from 'graphql';
import { DeclarationBlock, wrapWithSingleQuotes, indent, DEFAULT_SCALARS } from 'graphql-codegen-flow';
import { ScalarsMap } from './index';
import { OperationDefinitionNode } from 'graphql';
import { pascalCase, pascal } from 'change-case';
import { inspect } from 'util';
import { SelectionSetToObject } from './selection-set-to-object';

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

  private handleAnonymouseOperation(name: string | null) {
    if (name) {
      return this.convert(name);
    }

    return `Unnamed_${this._unnamedCounter++}_`;
  }

  OperationDefinition = (node: OperationDefinitionNode): string => {
    const name = this.handleAnonymouseOperation(node.name && node.name.value ? node.name.value : null);
    const operationRootType = this._schema.getType(pascalCase(node.operation)) as GraphQLObjectType;
    const selectionSet = new SelectionSetToObject(
      this._parsedConfig.scalars,
      this._schema,
      operationRootType,
      node.selectionSet
    );

    return new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(name + pascalCase(node.operation))
      .withContent(selectionSet.string).string;
  };
}
