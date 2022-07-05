import {
  NonNullTypeNode,
  ListTypeNode,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  EnumTypeDefinitionNode,
  NamedTypeNode,
  GraphQLSchema,
  InputValueDefinitionNode,
  Kind,
  GraphQLEnumType,
} from 'graphql';
import {
  BaseTypesVisitor,
  DeclarationBlock,
  wrapWithSingleQuotes,
  indent,
  ParsedTypesConfig,
  transformComment,
  getConfigValue,
  DeclarationKind,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { FlowPluginConfig } from './config.js';
import { FlowOperationVariablesToObject } from './flow-variables-to-object.js';

export interface FlowPluginParsedConfig extends ParsedTypesConfig {
  useFlowExactObjects: boolean;
  useFlowReadOnlyTypes: boolean;
}

export class FlowVisitor extends BaseTypesVisitor<FlowPluginConfig, FlowPluginParsedConfig> {
  constructor(schema: GraphQLSchema, pluginConfig: FlowPluginConfig) {
    super(schema, pluginConfig, {
      useFlowExactObjects: getConfigValue(pluginConfig.useFlowExactObjects, true),
      useFlowReadOnlyTypes: getConfigValue(pluginConfig.useFlowReadOnlyTypes, false),
    } as FlowPluginParsedConfig);
    autoBind(this);

    const enumNames = Object.values(schema.getTypeMap())
      .map(type => (type instanceof GraphQLEnumType ? type.name : undefined))
      .filter(t => t);
    this.setArgumentsTransformer(
      new FlowOperationVariablesToObject(this.scalars, this.convertName, null, enumNames, pluginConfig.enumPrefix)
    );
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
    const comment = transformComment(node.description as any as string, 1);

    return comment + indent(`${node.name}${addOptionalSign ? '?' : ''}: ${node.type},`);
  }

  NamedType(node: NamedTypeNode, key, parent, path, ancestors): string {
    return `?${super.NamedType(node, key, parent, path, ancestors)}`;
  }

  ListType(node: ListTypeNode, key, parent, path, ancestors): string {
    return `?${super.ListType(node, key, parent, path, ancestors)}`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const baseValue = super.NonNullType(node);

    if (baseValue.startsWith('?')) {
      return baseValue.substr(1);
    }

    return baseValue;
  }

  FieldDefinition(node: FieldDefinitionNode): string {
    const typeString = node.type as any as string;
    const namePostfix = typeString.startsWith('?') ? '?' : '';
    const comment = transformComment(node.description as any as string, 1);

    return comment + indent(`${this.config.useFlowReadOnlyTypes ? '+' : ''}${node.name}${namePostfix}: ${typeString},`);
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string, parent: any): string {
    return super.ObjectTypeDefinition(
      {
        ...node,
        interfaces:
          node.interfaces && node.interfaces.length > 0
            ? node.interfaces.map(name => (name as any as string).replace('?', ''))
            : ([] as any),
      },
      key,
      parent
    );
  }

  protected _buildTypeImport(identifier: string, source: string): string {
    return `import { type ${identifier} } from '${source}';`;
  }

  protected mergeInterfaces(interfaces: string[], hasOtherFields: boolean): string {
    if (!interfaces.length) {
      return '';
    }

    return interfaces.map(i => indent(`...${i}`)).join(',\n') + (hasOtherFields ? ',\n  ' : '');
  }

  appendInterfacesAndFieldsToBlock(block: DeclarationBlock, interfaces: string[], fields: string[]): void {
    block.withBlock(
      this.mergeInterfaces(interfaces, fields.length > 0) + this.mergeAllFields(fields, interfaces.length > 0)
    );
  }

  protected mergeAllFields(allFields: string[], hasInterfaces: boolean): string {
    if (allFields.length === 0) {
      return '';
    }

    if (!hasInterfaces) {
      return allFields.join('\n');
    }

    return `...{${this.config.useFlowExactObjects ? '|' : ''}\n${allFields.map(s => indent(s)).join('\n')}\n  ${
      this.config.useFlowExactObjects ? '|' : ''
    }}`;
  }

  handleEnumValueMapper(
    typeIdentifier: string,
    importIdentifier: string | null,
    sourceIdentifier: string | null,
    sourceFile: string | null
  ): string[] {
    let identifier = sourceIdentifier;

    if (sourceIdentifier !== typeIdentifier && !sourceIdentifier.includes(' as ')) {
      identifier = `${sourceIdentifier} as ${typeIdentifier}`;
    }

    return [this._buildTypeImport(identifier, sourceFile)];
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const typeName = node.name as any as string;

    if (this.config.enumValues[typeName] && this.config.enumValues[typeName].sourceFile) {
      return null;
    }

    const enumValuesName = this.convertName(node, {
      suffix: 'Values',
      useTypesPrefix: this.config.enumPrefix,
    });

    const enumValues = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('const')
      .withName(enumValuesName)
      .withMethodCall('Object.freeze', true)
      .withBlock(
        node.values
          .map(enumOption => {
            const comment = transformComment(enumOption.description as any as string, 1);
            const optionName = this.convertName(enumOption, { transformUnderscore: true, useTypesPrefix: false });
            let enumValue: string | number = enumOption.name as any;

            if (
              this.config.enumValues[typeName] &&
              this.config.enumValues[typeName].mappedValues &&
              typeof this.config.enumValues[typeName].mappedValues[enumValue] !== 'undefined'
            ) {
              enumValue = this.config.enumValues[typeName].mappedValues[enumValue];
            }

            return comment + indent(`${optionName}: ${wrapWithSingleQuotes(enumValue)}`);
          })
          .join(', \n')
      ).string;

    const enumType = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node, { useTypesPrefix: this.config.enumPrefix }))
      .withComment(node.description as any as string)
      .withContent(`$Values<typeof ${enumValuesName}>`).string;

    return [enumValues, enumType].join('\n\n');
  }

  protected getPunctuation(declarationKind: DeclarationKind): string {
    return declarationKind === 'type' ? ',' : ';';
  }
}
