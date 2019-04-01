import { CompatabilityPluginRawConfig } from './index';
import { BaseVisitor, DeclarationBlock, indent, toPascalCase } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSchema, OperationDefinitionNode } from 'graphql';
import { ParsedConfig } from '@graphql-codegen/visitor-plugin-common';
import { selectionSetToTypes } from './selection-set-to-types';

export interface CompatabilityPluginConfig extends ParsedConfig {}

export class CompatabilityPluginVisitor extends BaseVisitor<CompatabilityPluginRawConfig, CompatabilityPluginConfig> {
  constructor(rawConfig: CompatabilityPluginRawConfig, private _schema: GraphQLSchema) {
    super(rawConfig, {} as any);
  }

  protected buildOperationBlock(node: OperationDefinitionNode): string {
    const operationRootType = this._schema.getType(toPascalCase(node.operation));
    const baseName = this.convertName(node.name.value, { suffix: `${toPascalCase(node.operation)}` });
    const variablesName = `export type Variables = ${this.convertName(node.name.value, { suffix: `${toPascalCase(node.operation)}Variables` })};`;
    const selectionSetTypes = selectionSetToTypes(this, operationRootType, baseName, node.operation, node.selectionSet);

    return [variablesName, ...Object.keys(selectionSetTypes).map(typeName => `export type ${typeName} = ${selectionSetTypes[typeName]};`)].map(m => indent(m)).join('\n');
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('namespace')
      .withName(this.convertName(node.name.value))
      .withBlock(this.buildOperationBlock(node)).string;
  }
}
