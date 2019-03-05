import { GraphQLNamedType, EnumTypeDefinitionNode, NameNode } from 'graphql';
import { TsVisitor } from './visitor';
import * as autoBind from 'auto-bind';

export class TsIntrospectionVisitor {
  private typesToInclude: GraphQLNamedType[] = [];
  private tsVisitor: TsVisitor;

  constructor(typesToInclude: GraphQLNamedType[], tsVisitor: TsVisitor) {
    autoBind(this);
    this.typesToInclude = typesToInclude;
    this.tsVisitor = tsVisitor;
  }

  Name(node: NameNode): string {
    return this.tsVisitor.Name(node);
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    if (this.typesToInclude.some(type => type.name === node.name.value)) {
      return this.tsVisitor.EnumTypeDefinition(node);
    }

    return ``;
  }
}
