import {
  NonNullTypeNode,
  ListTypeNode,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  EnumTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  NamedTypeNode
} from 'graphql';
import {
  BaseTypesVisitor,
  DeclarationBlock,
  wrapWithSingleQuotes,
  indent,
  ParsedTypesConfig
} from 'graphql-codegen-visitor-plugin-common';
import * as autoBind from 'auto-bind';
import { FlowPluginConfig } from './index';
import { FlowOperationVariablesToObject } from './flow-variables-to-object';

export interface FlowPluginParsedConfig extends ParsedTypesConfig {
  useFlowExactObjects: boolean;
  useFlowReadOnlyTypes: boolean;
}

export class FlowVisitor extends BaseTypesVisitor<FlowPluginConfig, FlowPluginParsedConfig> {
  constructor(pluginConfig: FlowPluginConfig) {
    super(pluginConfig, {
      useFlowExactObjects: pluginConfig.useFlowExactObjects || false,
      useFlowReadOnlyTypes: pluginConfig.useFlowReadOnlyTypes || false
    } as FlowPluginParsedConfig);
    autoBind(this);

    this.setArgumentsTransformer(new FlowOperationVariablesToObject(this.config.scalars, this.convertName));
    this.setDeclarationBlockConfig({
      blockWrapper: this.config.useFlowExactObjects ? '|' : ''
    });
  }

  public ScalarTypeDefinition = (node: ScalarTypeDefinitionNode): string => {
    return new DeclarationBlock(this._declarationBlockConfig)
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

    return indent(`${this.config.useFlowReadOnlyTypes ? '+' : ''}${node.name}${namePostfix}: ${typeString},`);
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
      parent
    );
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumValuesName = `${node.name}Values`;

    const enumValues = new DeclarationBlock(this._declarationBlockConfig)
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

    const enumType = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node.name))
      .withContent(`$Values<typeof ${this.convertName(enumValuesName)}>`).string;

    return [enumValues, enumType].join('\n\n');
  }
}
