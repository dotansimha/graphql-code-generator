import { GraphQLNamedType, EnumTypeDefinitionNode, NameNode } from 'graphql';
import { TsVisitor } from './visitor';
import * as autoBind from 'auto-bind';

export class TsIntrospectionVisitor {
  private typesToInclude: GraphQLNamedType[] = [];
  private tsVisitor: TsVisitor;

  constructor(typesToInclude: GraphQLNamedType[], tsVisitor: TsVisitor) {
    this.typesToInclude = typesToInclude;
    this.tsVisitor = tsVisitor;
    autoBind(this);
  }

  Name(node: NameNode): string {
    return node.value;
  }

  DirectiveDefinition() {
    return null;
  }

  ObjectTypeDefinition() {
    return null;
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const name: string = node.name as any;

    if (this.typesToInclude.some(type => type.name === name)) {
      return this.tsVisitor.EnumTypeDefinition(node);
    }

    return null;
  }
}
