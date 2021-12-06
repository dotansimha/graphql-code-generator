import { TsVisitor } from '@graphql-codegen/typescript';
import {
  EnumTypeDefinitionNode,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { TypescriptOperationTypesPluginConfig } from './config';

export class SpecificTypesVisitor extends TsVisitor {
  constructor(
    schema: GraphQLSchema,
    pluginConfig: TypescriptOperationTypesPluginConfig,
    private readonly includedTypes: Map<string, boolean>
  ) {
    super(schema, pluginConfig);
  }

  /**
   * We do not include the arguments types in this plugin as this should only be used mutations and queries which
   * either hard codes inputs or has input types. This therefore adds unneeded complexity and complicates discovering
   * input types that aren't actually used in the operations.
   */
  buildArgumentsBlock() {
    return '';
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    const name = node.name as unknown as string;
    if (this.includedTypes.has(name)) {
      return super.InputObjectTypeDefinition(node);
    }
    return '';
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: string | number, parent: any): string {
    const name = node.name as unknown as string;
    if (this.includedTypes.has(name)) {
      return super.ObjectTypeDefinition(node, key, parent);
    }
    return '';
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const name = node.name as unknown as string;

    if (this.includedTypes.has(name)) {
      return super.EnumTypeDefinition(node);
    }
    return '';
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode, key, parent): string {
    const name = node.name as unknown as string;

    if (this.includedTypes.has(name)) {
      return super.InterfaceTypeDefinition(node, key, parent);
    }
    return '';
  }

  UnionTypeDefinition(node: UnionTypeDefinitionNode, key, parent): string {
    const name = node.name as unknown as string;
    if (this.includedTypes.has(name)) {
      return super.UnionTypeDefinition(node, key, parent);
    }
    return '';
  }
}
