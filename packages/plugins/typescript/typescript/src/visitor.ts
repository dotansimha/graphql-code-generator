import { transformComment, wrapWithSingleQuotes, DeclarationBlock, indent, BaseTypesVisitor, ParsedTypesConfig } from '@graphql-codegen/visitor-plugin-common';
import { TypeScriptPluginConfig, plugin } from './index';
import * as autoBind from 'auto-bind';
import { FieldDefinitionNode, NamedTypeNode, ListTypeNode, NonNullTypeNode, EnumTypeDefinitionNode, Kind, InputValueDefinitionNode, GraphQLSchema, ObjectTypeDefinitionNode, InterfaceTypeDefinitionNode } from 'graphql';
import { TypeScriptOperationVariablesToObject } from './typescript-variables-to-object';

export interface TypeScriptPluginParsedConfig extends ParsedTypesConfig {
  avoidOptionals: boolean;
  constEnums: boolean;
  enumsAsTypes: boolean;
  immutableTypes: boolean;
  maybeValue: string;
  outputTypeGraphQL: boolean;
}

const MAYBE_REGEX = /^Maybe<(.*?)>$/;
const ARRAY_REGEX = /^Array<(.*?)>$/;

export class TsVisitor<TRawConfig extends TypeScriptPluginConfig = TypeScriptPluginConfig, TParsedConfig extends TypeScriptPluginParsedConfig = TypeScriptPluginParsedConfig> extends BaseTypesVisitor<TRawConfig, TParsedConfig> {
  constructor(schema: GraphQLSchema, pluginConfig: TRawConfig, additionalConfig: Partial<TParsedConfig> = {}) {
    super(schema, pluginConfig, {
      avoidOptionals: pluginConfig.avoidOptionals || false,
      maybeValue: pluginConfig.maybeValue || 'T | null',
      constEnums: pluginConfig.constEnums || false,
      enumsAsTypes: pluginConfig.enumsAsTypes || false,
      immutableTypes: pluginConfig.immutableTypes || false,
      outputTypeGraphQL: pluginConfig.outputTypeGraphQL || false,
      ...(pluginConfig.outputTypeGraphQL
        ? {
            declarationKind: {
              type: 'class',
              interface: 'abstract class',
              arguments: 'type',
              input: 'type',
              scalar: 'type',
            },
          }
        : {}),
      ...(additionalConfig || {}),
    } as TParsedConfig);

    autoBind(this);
    this.setArgumentsTransformer(new TypeScriptOperationVariablesToObject(this.scalars, this.convertName, this.config.avoidOptionals, this.config.immutableTypes));
    this.setDeclarationBlockConfig({
      enumNameValueSeparator: ' =',
    });
  }

  private clearOptional(str: string): string {
    if (str.startsWith('Maybe')) {
      return str.replace(MAYBE_REGEX, '$1');
    }

    return str;
  }

  NamedType(node: NamedTypeNode): string {
    return `Maybe<${super.NamedType(node)}>`;
  }

  ListType(node: ListTypeNode): string {
    return `Maybe<${super.ListType(node)}>`;
  }

  protected wrapWithListType(str: string): string {
    return `${this.config.immutableTypes ? 'ReadonlyArray' : 'Array'}<${str}>`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const baseValue = super.NonNullType(node);

    return this.clearOptional(baseValue);
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string, parent: any): string {
    const originalNode = parent[key] as ObjectTypeDefinitionNode;

    let declarationBlock = this.getObjectTypeDeclarationBlock(node, originalNode);
    if (this.config.outputTypeGraphQL) {
      const interfaces = originalNode.interfaces.map(i => this.convertName(i));
      let decoratorOptions = '';
      if (interfaces.length > 1) {
        decoratorOptions = `{ implements: [${interfaces.join(', ')}] }`;
      } else if (interfaces.length === 1) {
        decoratorOptions = `{ implements: ${interfaces[0]} }`;
      }
      declarationBlock = declarationBlock.withDecorator(`@TypeGraphQL.ObjectType(${decoratorOptions})`);
    }

    return [declarationBlock.string, this.buildArgumentsBlock(originalNode)].filter(f => f).join('\n\n');
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode, key: number | string, parent: any): string {
    const originalNode = parent[key] as InterfaceTypeDefinitionNode;

    let declarationBlock = this.getInterfaceTypeDeclarationBlock(node, originalNode);
    if (this.config.outputTypeGraphQL) {
      declarationBlock = declarationBlock.withDecorator('@TypeGraphQL.InterfaceType()');
    }

    return [declarationBlock.string, this.buildArgumentsBlock(originalNode)].filter(f => f).join('\n\n');
  }

  parseType(typeString: string) {
    const isNullable = !!typeString.match(MAYBE_REGEX);
    const nonNullableType = typeString.replace(MAYBE_REGEX, '$1');
    const isArray = !!nonNullableType.match(ARRAY_REGEX);
    const singularType = nonNullableType.replace(ARRAY_REGEX, '$1');
    const type = singularType.replace(/Scalars\['(.*?)'\]$/, (match, type) => (global[type] ? type : `TypeGraphQL.${type}`));

    return { type, isNullable, isArray };
  }

  FieldDefinition(node: FieldDefinitionNode, key?: number | string, parent?: any): string {
    const typeString = (node.type as any) as string;
    const originalFieldNode = parent[key] as FieldDefinitionNode;
    const addOptionalSign = !this.config.avoidOptionals && originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
    const comment = transformComment((node.description as any) as string, 1);
    let decorator = '';
    if (super.config.outputTypeGraphQL) {
      const type = this.parseType(typeString);

      decorator = '\n' + indent(`@TypeGraphQL.Field(type => ${type.isArray ? `[${type.type}]` : type.type}${type.isNullable ? ', { nullable: true }' : ''})`) + '\n';
    }

    return comment + decorator + indent(`${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${super.config.outputTypeGraphQL ? '!' : addOptionalSign ? '?' : ''}: ${typeString}${super.config.outputTypeGraphQL ? ';' : ','}`);
  }

  InputValueDefinition(node: InputValueDefinitionNode, key?: number | string, parent?: any): string {
    const originalFieldNode = parent[key] as FieldDefinitionNode;
    const addOptionalSign = !this.config.avoidOptionals && originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
    const comment = transformComment((node.description as any) as string, 1);

    return comment + indent(`${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${addOptionalSign ? '?' : ''}: ${node.type},`);
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumName = (node.name as any) as string;

    // In case of mapped external enum string
    if (this.config.enumValues[enumName] && this.config.enumValues[enumName].sourceFile) {
      return null;
    }

    let declaration: string;

    if (this.config.enumsAsTypes) {
      declaration = new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind('type')
        .withComment((node.description as any) as string)
        .withName(this.convertName(node))
        .withContent(
          '\n' +
            node.values
              .map(enumOption => {
                let enumValue: string = (enumOption.name as any) as string;
                const comment = transformComment((enumOption.description as any) as string, 1);

                if (this.config.enumValues[enumName] && this.config.enumValues[enumName].mappedValues && this.config.enumValues[enumName].mappedValues[enumValue]) {
                  enumValue = this.config.enumValues[enumName].mappedValues[enumValue];
                }

                return comment + indent(wrapWithSingleQuotes(enumValue));
              })
              .join(' |\n')
        ).string;
    } else {
      declaration = new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind(this.config.constEnums ? 'const enum' : 'enum')
        .withName(this.convertName(node))
        .withComment((node.description as any) as string)
        .withBlock(this.buildEnumValuesBlock(enumName, node.values)).string;
    }

    if (super.config.outputTypeGraphQL) {
      declaration = declaration + `TypeGraphQL.registerEnumType(${this.convertName(node)}, { name: '${this.convertName(node)}' });\n`;
    }

    return declaration;
  }
}
