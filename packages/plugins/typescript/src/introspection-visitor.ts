import { GraphQLNamedType, EnumTypeDefinitionNode, ObjectTypeDefinitionNode } from 'graphql';
import { TsVisitor } from './visitor';
import { TypeScriptPluginConfig } from './index';
import autoBind from 'auto-bind';

export class TsIntrospectionVisitor extends TsVisitor {
  private typesToInclude: GraphQLNamedType[] = [];

  constructor(pluginConfig: TypeScriptPluginConfig = {}, typesToInclude: GraphQLNamedType[]) {
    super(pluginConfig);

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
