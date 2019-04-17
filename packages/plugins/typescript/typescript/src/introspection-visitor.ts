import { GraphQLSchema, GraphQLNamedType, EnumTypeDefinitionNode, ObjectTypeDefinitionNode } from 'graphql';
import { TsVisitor } from './visitor';
import { TypeScriptPluginConfig } from './index';
import * as autoBind from 'auto-bind';

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
    const name: string = node.name as any;

    if (this.typesToInclude.some(type => type.name === name)) {
      return super.ObjectTypeDefinition(node, key, parent);
    }

    return null;
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const name: string = node.name as any;

    if (this.typesToInclude.some(type => type.name === name)) {
      return super.EnumTypeDefinition(node);
    }

    return null;
  }
}
