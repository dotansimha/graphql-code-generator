import autoBind from 'auto-bind';
import { EnumTypeDefinitionNode, GraphQLNamedType, GraphQLSchema, ObjectTypeDefinitionNode } from 'graphql';
import { TypeScriptPluginConfig } from './config.js';
import { TsVisitor } from './visitor.js';

export class TsIntrospectionVisitor extends TsVisitor {
  private typesToInclude: GraphQLNamedType[] = [];

  constructor(schema: GraphQLSchema, pluginConfig: TypeScriptPluginConfig = {}, typesToInclude: GraphQLNamedType[]) {
    super(schema, pluginConfig);

    this.typesToInclude = typesToInclude;
    autoBind(this);
  }

  DirectiveDefinition() {
    return null;
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: string | number, parent: any) {
    const name: string = node.name.value;

    if (this.typesToInclude.some(type => type.name === name)) {
      return super.ObjectTypeDefinition(node, key, parent);
    }

    return null;
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const name: string = node.name.value;

    if (this.typesToInclude.some(type => type.name === name)) {
      return super.EnumTypeDefinition(node);
    }

    return null;
  }
}
