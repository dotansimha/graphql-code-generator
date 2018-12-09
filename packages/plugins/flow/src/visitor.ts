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
import { OperationVariablesToObject } from './variables-to-object';
import { pascalCase } from 'change-case';
import {
  NonNullTypeNode,
  ListTypeNode,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  InterfaceTypeDefinitionNode,
  UnionTypeDefinitionNode
} from 'graphql/language/ast';

export const DEFAULT_SCALARS = {
  ID: 'string',
  String: 'string',
  Boolean: 'boolean',
  Int: 'number',
  Float: 'number'
};
export interface ParsedConfig {
  scalars: ScalarsMap;
  enumValues: EnumValuesMap;
  convert: (str: string) => string;
}

export interface BasicFlowVisitor {
  scalars: ScalarsMap;
}

export interface FlowPluginConfig {
  scalars?: ScalarsMap;
  namingConvention?: string;
  enumValues?: EnumValuesMap;
}
export class FlowVisitor implements BasicFlowVisitor {
  private _parsedConfig: ParsedConfig;

  constructor(pluginConfig: FlowPluginConfig) {
    this._parsedConfig = {
      scalars: { ...DEFAULT_SCALARS, ...(pluginConfig.scalars || {}) },
      convert: str => pascalCase(str),
      enumValues: pluginConfig.enumValues || {}
    };
  }

  get scalars(): ScalarsMap {
    return this._parsedConfig.scalars;
  }

  ScalarTypeDefinition = (node: ScalarTypeDefinitionNode): string => {
    return new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(node.name)
      .withContent(this._parsedConfig.scalars[(node.name as any) as string] || 'any').string;
  };

  NamedType = (node: NamedTypeNode): string => {
    const asString = (node.name as any) as string;
    const type = this._parsedConfig.scalars[asString] || asString;

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

  UnionTypeDefinition = (node: UnionTypeDefinitionNode): string => {
    const possibleTypes = node.types.map(name => ((name as any) as string).replace('?', '')).join(' | ');

    return new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(node.name)
      .withContent(possibleTypes).string;
  };

  ObjectTypeDefinition = (node: ObjectTypeDefinitionNode, key, parent): string => {
    const interfaces =
      node.interfaces && node.interfaces.length > 0
        ? node.interfaces.map(name => ((name as any) as string).replace('?', '')).join(' & ') + ' & '
        : '';

    const typeDefinition = new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(node.name)
      .withContent(interfaces)
      .withBlock(node.fields.join('\n')).string;

    const original = parent[key];
    const fieldsWithArguments = original.fields.filter(field => field.arguments && field.arguments.length > 0);
    const fieldsArguments = fieldsWithArguments.map(field => {
      const name =
        this._parsedConfig.convert(original.name.value) + this._parsedConfig.convert(field.name.value) + 'Args';
      const transformedArguments = new OperationVariablesToObject<FlowVisitor, InputValueDefinitionNode>(
        this,
        field.arguments
      );

      return new DeclarationBlock()
        .export()
        .asKind('type')
        .withName(name)
        .withBlock(transformedArguments.string).string;
    });

    return [typeDefinition, ...fieldsArguments].filter(f => f).join('\n\n');
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
              `${enumOption.name}: ${wrapWithSingleQuotes(
                this._parsedConfig.enumValues[(enumOption.name as any) as string] || enumOption.name
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
