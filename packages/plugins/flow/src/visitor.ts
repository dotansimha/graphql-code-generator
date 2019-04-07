import { NonNullTypeNode, ListTypeNode, ObjectTypeDefinitionNode, FieldDefinitionNode, EnumTypeDefinitionNode, NamedTypeNode, GraphQLSchema, InputValueDefinitionNode, Kind } from 'graphql';
import { BaseTypesVisitor, DeclarationBlock, wrapWithSingleQuotes, indent, ParsedTypesConfig, transformComment } from '@graphql-codegen/visitor-plugin-common';
import * as autoBind from 'auto-bind';
import { FlowPluginConfig } from './index';
import { FlowOperationVariablesToObject } from './flow-variables-to-object';

export interface FlowPluginParsedConfig extends ParsedTypesConfig {
  useFlowExactObjects: boolean;
  useFlowReadOnlyTypes: boolean;
}

export class FlowVisitor extends BaseTypesVisitor<FlowPluginConfig, FlowPluginParsedConfig> {
  constructor(schema: GraphQLSchema, pluginConfig: FlowPluginConfig) {
    super(schema, pluginConfig, {
      useFlowExactObjects: pluginConfig.useFlowExactObjects || false,
      useFlowReadOnlyTypes: pluginConfig.useFlowReadOnlyTypes || false,
    } as FlowPluginParsedConfig);
    autoBind(this);

    this.setArgumentsTransformer(new FlowOperationVariablesToObject(this.config.scalars, this.convertName));
    this.setDeclarationBlockConfig({
      blockWrapper: this.config.useFlowExactObjects ? '|' : '',
    });
  }

  protected _getScalar(name: string): string {
    return `$ElementType<Scalars, '${name}'>`;
  }

  InputValueDefinition(node: InputValueDefinitionNode, key?: number | string, parent?: any): string {
    const originalFieldNode = parent[key] as FieldDefinitionNode;
    const addOptionalSign = originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
    const comment = transformComment((node.description as any) as string, 1);

    return comment + indent(`${node.name}${addOptionalSign ? '?' : ''}: ${node.type},`);
  }

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
    const comment = transformComment((node.description as any) as string, 1);

    return comment + indent(`${this.config.useFlowReadOnlyTypes ? '+' : ''}${node.name}${namePostfix}: ${typeString},`);
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string, parent: any): string {
    return super.ObjectTypeDefinition(
      {
        ...node,
        interfaces: node.interfaces && node.interfaces.length > 0 ? node.interfaces.map(name => ((name as any) as string).replace('?', '')) : ([] as any),
      },
      key,
      parent
    );
  }

  protected _buildEnumImport(identifier: string, source: string): string {
    return `import { type ${identifier} } from '${source}';`;
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const typeName = (node.name as any) as string;

    if (this.config.enumValues[typeName] && typeof this.config.enumValues[typeName] === 'string') {
      return null;
    }

    const enumValuesName = this.convertName(node, {
      suffix: 'Values',
    });

    const enumValues = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('const')
      .withName(enumValuesName)
      .withMethodCall('Object.freeze')
      .withBlock(
        node.values
          .map(enumOption => {
            const comment = transformComment((enumOption.description as any) as string, 1);
            const optionName = this.convertName(enumOption, { transformUnderscore: true, useTypesPrefix: false });
            let enumValue: string = (enumOption.name as any) as string;

            if (this.config.enumValues[typeName] && typeof this.config.enumValues[typeName] === 'object' && this.config.enumValues[typeName][enumValue]) {
              enumValue = this.config.enumValues[typeName][enumValue];
            }

            return comment + indent(`${optionName}: ${wrapWithSingleQuotes(enumValue)}`);
          })
          .join(', \n')
      ).string;

    const enumType = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withComment((node.description as any) as string)
      .withContent(`$Values<typeof ${enumValuesName}>`).string;

    return [enumValues, enumType].join('\n\n');
  }
}
