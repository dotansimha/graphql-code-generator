import { transformComment, wrapWithSingleQuotes, DeclarationBlock, indent, BaseTypesVisitor, ParsedTypesConfig } from '@graphql-codegen/visitor-plugin-common';
import { TypeGraphQLPluginConfig } from './index';
import * as autoBind from 'auto-bind';
import { FieldDefinitionNode, NamedTypeNode, ListTypeNode, NonNullTypeNode, EnumTypeDefinitionNode, Kind, InputValueDefinitionNode, GraphQLSchema, ObjectTypeDefinitionNode, InterfaceTypeDefinitionNode } from 'graphql';
import { TypeScriptOperationVariablesToObject, TypeScriptPluginParsedConfig, TsVisitor } from '@graphql-codegen/typescript';
import { AvoidOptionalsConfig } from '@graphql-codegen/typescript';

export interface TypeGraphQLPluginParsedConfig extends TypeScriptPluginParsedConfig {
  avoidOptionals: AvoidOptionalsConfig;
  constEnums: boolean;
  enumsAsTypes: boolean;
  immutableTypes: boolean;
  maybeValue: string;
}

const MAYBE_REGEX = /^Maybe<(.*?)>$/;
const ARRAY_REGEX = /^Array<(.*?)>$/;
const SCALAR_REGEX = /^Scalars\['(.*?)'\]$/;
const GRAPHQL_TYPES = ['Query', 'Mutation', 'Subscription'];

export class TypeGraphQLVisitor<TRawConfig extends TypeGraphQLPluginConfig = TypeGraphQLPluginConfig, TParsedConfig extends TypeGraphQLPluginParsedConfig = TypeScriptPluginParsedConfig> extends TsVisitor<TRawConfig, TParsedConfig> {
  constructor(schema: GraphQLSchema, pluginConfig: TRawConfig, additionalConfig: Partial<TParsedConfig> = {}) {
    super(schema, pluginConfig, {
      avoidOptionals: pluginConfig.avoidOptionals || false,
      maybeValue: pluginConfig.maybeValue || 'T | null',
      constEnums: pluginConfig.constEnums || false,
      enumsAsTypes: pluginConfig.enumsAsTypes || false,
      immutableTypes: pluginConfig.immutableTypes || false,
      declarationKind: {
        type: 'class',
        interface: 'abstract class',
        arguments: 'type',
        input: 'type',
        scalar: 'type',
      },
      ...(additionalConfig || {}),
    } as TParsedConfig);

    autoBind(this);
    this.setArgumentsTransformer(new TypeScriptOperationVariablesToObject(this.scalars, this.convertName, this.config.avoidOptionals.object, this.config.immutableTypes));
    this.setDeclarationBlockConfig({
      enumNameValueSeparator: ' =',
    });
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string, parent: any): string {
    const originalNode = parent[key] as ObjectTypeDefinitionNode;

    let declarationBlock = this.getObjectTypeDeclarationBlock(node, originalNode);
    if (GRAPHQL_TYPES.indexOf((node.name as unknown) as string) === -1) {
      // Add type-graphql ObjectType decorator
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

    let declarationBlock = this.getInterfaceTypeDeclarationBlock(node, originalNode).withDecorator('@TypeGraphQL.InterfaceType()');

    return [declarationBlock.string, this.buildArgumentsBlock(originalNode)].filter(f => f).join('\n\n');
  }

  parseType(typeString: string) {
    const isNullable = !!typeString.match(MAYBE_REGEX);
    const nonNullableType = typeString.replace(MAYBE_REGEX, '$1');
    const isArray = !!nonNullableType.match(ARRAY_REGEX);
    const singularType = nonNullableType.replace(ARRAY_REGEX, '$1');
    const isScalar = !!singularType.match(SCALAR_REGEX);
    const type = singularType.replace(SCALAR_REGEX, (match, type) => (global[type] ? type : `TypeGraphQL.${type}`));

    return { type, isNullable, isArray, isScalar };
  }

  FieldDefinition(node: FieldDefinitionNode, key?: number | string, parent?: any): string {
    let typeString = (node.type as any) as string;
    const comment = transformComment((node.description as any) as string, 1);

    const type = this.parseType(typeString);
    const decorator = '\n' + indent(`@TypeGraphQL.Field(type => ${type.isArray ? `[${type.type}]` : type.type}${type.isNullable ? ', { nullable: true }' : ''})`) + '\n';

    typeString = type.isArray || type.isNullable || type.isScalar ? typeString : `FixDecorator<${typeString}>`;

    return comment + decorator + indent(`${this.config.immutableTypes ? 'readonly ' : ''}${node.name}!: ${typeString};`);
  }

  InputValueDefinition(node: InputValueDefinitionNode, key?: number | string, parent?: any): string {
    const originalFieldNode = parent[key] as FieldDefinitionNode;
    const addOptionalSign = !this.config.avoidOptionals.inputValue && originalFieldNode.type.kind !== Kind.NON_NULL_TYPE;
    const comment = transformComment((node.description as any) as string, 1);

    return comment + indent(`${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${addOptionalSign ? '?' : ''}: ${node.type},`);
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    return super.EnumTypeDefinition(node) + `TypeGraphQL.registerEnumType(${this.convertName(node)}, { name: '${this.convertName(node)}' });\n`;
  }
}
