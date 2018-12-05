import {
  EnumTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  NamedTypeNode,
  NameNode
} from 'graphql';
import { DeclarationBlock, wrapWithSingleQuotes, breakLine, indent } from './utils';
import { ScalarsMap, EnumValuesMap } from './index';
import {
  NonNullTypeNode,
  ListTypeNode,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  InterfaceTypeDefinitionNode
} from 'graphql/language/ast';

const DEFAULT_SCALARS = {
  ID: 'string',
  String: 'string',
  Boolean: 'boolean',
  Int: 'number',
  Float: 'number'
};
export interface ParsedCommonConfig {
  scalars: ScalarsMap;
  enumValues: EnumValuesMap;
  convert: (str: string) => string;
}

export interface FlowCommonPluginConfig {
  scalars?: ScalarsMap;
  namingConvention?: string;
  enumValues?: EnumValuesMap;
}
export class FlowCommonVisitor {
  private _parsedCommonConfig: ParsedCommonConfig;

  constructor(pluginConfig: FlowCommonPluginConfig) {
    this._parsedCommonConfig = {
      scalars: { ...DEFAULT_SCALARS, ...(pluginConfig.scalars || {}) },
      convert: str => str,
      enumValues: pluginConfig.enumValues || {}
    };
  }

  ScalarTypeDefinition = (node: ScalarTypeDefinitionNode): string => {
    return new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(node.name)
      .withContent(this._parsedCommonConfig.scalars[(node.name as any) as string] || 'any').string;
  };

  NamedType = (node: NamedTypeNode): string => {
    const asString = (node.name as any) as string;
    const type = this._parsedCommonConfig.scalars[asString] || asString;

    return `?${type}`;
  };

  ListType = (node: ListTypeNode): string => {
    const asString = (node.type as any) as string;

    return `?Array<${asString}>`;
  };

  NonNullType = (node: NonNullTypeNode): string => {
    const asString = (node.type as any) as string;

    if (asString.charAt(0) === '?') {
      return asString.substr(1);
    }

    return asString;
  };

  Name = (node: NameNode): string => {
    return node.value;
  };

  InputObjectTypeDefinition = (node: InputObjectTypeDefinitionNode): string => {
    return new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(node.name)
      .withBlock(node.fields.join('\n')).string;
  };

  InputValueDefinition = (node: InputValueDefinitionNode): string => {
    return indent(`${node.name}: ${node.type},`);
  };

  FieldDefinition = (node: FieldDefinitionNode): string => {
    return indent(`${node.name}: ${node.type},`);
  };

  ObjectTypeDefinition = (node: ObjectTypeDefinitionNode): string => {
    const interfaces =
      node.interfaces && node.interfaces.length > 0
        ? node.interfaces.map(name => ((name as any) as string).replace('?', '')).join(' & ') + ' & '
        : '';

    return new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(node.name)
      .withContent(interfaces)
      .withBlock(node.fields.join('\n')).string;
  };

  InterfaceTypeDefinition = (node: InterfaceTypeDefinitionNode): string => {
    return new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(node.name)
      .withBlock(node.fields.join('\n')).string;
  };

  EnumTypeDefinition = (node: EnumTypeDefinitionNode): string => {
    const enumValuesName = `${node.name}Values`;

    const enumValues = new DeclarationBlock()
      .export()
      .asKind('const')
      .withName(enumValuesName)
      .withBlock(
        node.values
          .map(enumOption =>
            indent(
              `${enumOption.name} = ${wrapWithSingleQuotes(
                this._parsedCommonConfig.enumValues[(enumOption.name as any) as string] || enumOption.name
              )}`
            )
          )
          .join(', \n')
      ).string;

    const enumType = new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(node.name)
      .withContent(`$Values<typeof ${enumValuesName}>`).string;

    return enumValues + enumType;
  };
}
