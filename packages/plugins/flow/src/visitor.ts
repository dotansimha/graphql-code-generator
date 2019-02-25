import {
  NonNullTypeNode,
  ListTypeNode,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  UnionTypeDefinitionNode,
  EnumTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  NamedTypeNode
} from 'graphql';
import {
  wrapAstTypeWithModifiers,
  BaseVisitor,
  DeclarationBlock,
  wrapWithSingleQuotes,
  indent
} from 'graphql-codegen-visitor-plugin-common';
import * as autoBind from 'auto-bind';
import { FlowPluginConfig } from './index';

export class FlowVisitor extends BaseVisitor {
  constructor(pluginConfig: FlowPluginConfig) {
    super(pluginConfig, null);
    autoBind(this);
  }

  public ScalarTypeDefinition = (node: ScalarTypeDefinitionNode): string => {
    return new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(this.convertName(node.name))
      .withContent(this.scalars[(node.name as any) as string] || 'any').string;
  };

  NamedType(node: NamedTypeNode): string {
    return `?${super.NamedType(node)}`;
  }

  ListType(node: ListTypeNode): string {
    return `?${super.ListType(node)}`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const baseValue = super.NonNullType(node);

    if (baseValue.charAt(0) === '?') {
      return baseValue.substr(1);
    }

    return baseValue;
  }

  FieldDefinition(node: FieldDefinitionNode): string {
    const typeString = (node.type as any) as string;
    const namePostfix = typeString.charAt(0) === '?' ? '?' : '';

    return indent(`${node.name}${namePostfix}: ${typeString},`);
  }

  UnionTypeDefinition(node: UnionTypeDefinitionNode): string {
    return super.UnionTypeDefinition({
      ...node,
      types: node.types.map(name => ((name as any) as string).replace('?', '')) as any
    });
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string, parent: any): string {
    return super.ObjectTypeDefinition(
      {
        ...node,
        interfaces:
          node.interfaces && node.interfaces.length > 0
            ? node.interfaces.map(name => ((name as any) as string).replace('?', ''))
            : ([] as any)
      },
      key,
      parent,
      wrapAstTypeWithModifiers('?')
    );
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumValuesName = `${node.name}Values`;

    const enumValues = new DeclarationBlock()
      .export()
      .asKind('const')
      .withName(this.convertName(enumValuesName))
      .withMethodCall('Object.freeze')
      .withBlock(
        node.values
          .map(enumOption =>
            indent(
              `${this.convertName(enumOption.name)}: ${wrapWithSingleQuotes(
                this._parsedConfig.enumValues[(enumOption.name as any) as string] || enumOption.name
              )}`
            )
          )
          .join(', \n')
      ).string;

    const enumType = new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(this.convertName(node.name))
      .withContent(`$Values<typeof ${this.convertName(enumValuesName)}>`).string;

    return [enumValues, enumType].join('\n\n');
  }
}
