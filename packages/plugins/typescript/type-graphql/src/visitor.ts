import { indent, DeclarationBlock, AvoidOptionalsConfig } from '@graphql-codegen/visitor-plugin-common';
import { TypeGraphQLPluginConfig } from './config.js';
import autoBind from 'auto-bind';
import {
  FieldDefinitionNode,
  EnumTypeDefinitionNode,
  InputValueDefinitionNode,
  GraphQLSchema,
  ObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  TypeNode,
  GraphQLEnumType,
  InputObjectTypeDefinitionNode,
  TypeDefinitionNode,
} from 'graphql';
import {
  TypeScriptOperationVariablesToObject,
  TypeScriptPluginParsedConfig,
  TsVisitor,
} from '@graphql-codegen/typescript';

export type DecoratorConfig = {
  type: string;
  interface: string;
  field: string;
  input: string;
  arguments: string;
};

export interface TypeGraphQLPluginParsedConfig extends TypeScriptPluginParsedConfig {
  avoidOptionals: AvoidOptionalsConfig;
  constEnums: boolean;
  enumsAsTypes: boolean;
  immutableTypes: boolean;
  maybeValue: string;
  decoratorName: DecoratorConfig;
  decorateTypes?: string[];
}

const MAYBE_REGEX = /^Maybe<(.*?)>$/;
const ARRAY_REGEX = /^Array<(.*?)>$/;
const SCALAR_REGEX = /^Scalars\['(.*?)'\]$/;
const GRAPHQL_TYPES = ['Query', 'Mutation', 'Subscription'];
const SCALARS = ['ID', 'String', 'Boolean', 'Int', 'Float'];
const TYPE_GRAPHQL_SCALARS = ['ID', 'Int', 'Float'];

interface Type {
  type: string;
  isNullable: boolean;
  isArray: boolean;
  isScalar: boolean;
  isItemsNullable: boolean;
}

function escapeString(str: string) {
  return (
    "'" +
    String(str || '')
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/'/g, "\\'") +
    "'"
  );
}

type DecoratorOptions = { [key: string]: string };
function formatDecoratorOptions(options: DecoratorOptions, isFirstArgument = true) {
  if (!Object.keys(options).length) {
    return '';
  }
  return (
    (isFirstArgument ? '' : ', ') +
    ('{ ' +
      Object.entries(options)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ') +
      ' }')
  );
}

const FIX_DECORATOR_SIGNATURE = `type FixDecorator<T> = T;`;

function getTypeGraphQLNullableValue(type: Type): string | undefined {
  if (type.isNullable) {
    if (type.isItemsNullable) {
      return "'itemsAndList'";
    }
    return 'true';
  }
  if (type.isItemsNullable) {
    return "'items'";
  }

  return undefined;
}

export class TypeGraphQLVisitor<
  TRawConfig extends TypeGraphQLPluginConfig = TypeGraphQLPluginConfig,
  TParsedConfig extends TypeGraphQLPluginParsedConfig = TypeGraphQLPluginParsedConfig
> extends TsVisitor<TRawConfig, TParsedConfig> {
  typescriptVisitor: TsVisitor<TRawConfig, TParsedConfig>;

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
        arguments: 'class',
        input: 'class',
        scalar: 'type',
      },
      decoratorName: {
        type: 'ObjectType',
        interface: 'InterfaceType',
        arguments: 'ArgsType',
        field: 'Field',
        input: 'InputType',
        ...pluginConfig.decoratorName,
      },
      decorateTypes: pluginConfig.decorateTypes || undefined,
      ...additionalConfig,
    } as TParsedConfig);
    autoBind(this);

    this.typescriptVisitor = new TsVisitor(schema, pluginConfig, additionalConfig);

    const enumNames = Object.values(schema.getTypeMap())
      .map(type => (type instanceof GraphQLEnumType ? type.name : undefined))
      .filter(t => t);
    this.setArgumentsTransformer(
      new TypeScriptOperationVariablesToObject(
        this.scalars,
        this.convertName,
        this.config.avoidOptionals,
        this.config.immutableTypes,
        null,
        enumNames,
        this.config.enumPrefix,
        this.config.enumValues,
        undefined,
        undefined,
        'Maybe'
      )
    );
    this.setDeclarationBlockConfig({
      enumNameValueSeparator: ' =',
    });
  }

  getDecoratorOptions(
    node:
      | ObjectTypeDefinitionNode
      | InterfaceTypeDefinitionNode
      | FieldDefinitionNode
      | InputObjectTypeDefinitionNode
      | InputValueDefinitionNode
  ): DecoratorOptions {
    const decoratorOptions: DecoratorOptions = {};

    if (node.description) {
      // Add description as TypeGraphQL description instead of comment
      decoratorOptions.description = escapeString(node.description as unknown as string);
      (node as any).description = undefined;
    }

    return decoratorOptions;
  }

  public getWrapperDefinitions(): string[] {
    return [...super.getWrapperDefinitions(), this.getFixDecoratorDefinition()];
  }

  public getFixDecoratorDefinition(): string {
    return `${this.getExportPrefix()}${FIX_DECORATOR_SIGNATURE}`;
  }

  getMaybeWrapper() {
    return 'Maybe';
  }

  protected buildArgumentsBlock(node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode): string {
    const fieldsWithArguments = node.fields.filter(field => field.arguments && field.arguments.length > 0) || [];
    return fieldsWithArguments
      .map(field => {
        const name =
          node.name.value +
          (this.config.addUnderscoreToArgsType ? '_' : '') +
          this.convertName(field, {
            useTypesPrefix: false,
            useTypesSuffix: false,
          }) +
          'Args';

        if (this.hasTypeDecorators(name)) {
          return this.getArgumentsObjectTypeDefinition(node, name, field);
        }
        return this.typescriptVisitor.getArgumentsObjectTypeDefinition(node, name, field);
      })
      .join('\n\n');
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string, parent: any): string {
    const isGraphQLType = GRAPHQL_TYPES.includes(node.name as unknown as string);
    if (!isGraphQLType && !this.hasTypeDecorators(node.name as unknown as string)) {
      return this.typescriptVisitor.ObjectTypeDefinition(node, key, parent);
    }

    const typeDecorator = this.config.decoratorName.type;
    const originalNode = parent[key] as ObjectTypeDefinitionNode;

    const decoratorOptions = this.getDecoratorOptions(node);

    let declarationBlock: DeclarationBlock;
    if (isGraphQLType) {
      declarationBlock = this.typescriptVisitor.getObjectTypeDeclarationBlock(node, originalNode);
    } else {
      declarationBlock = this.getObjectTypeDeclarationBlock(node, originalNode);

      // Add type-graphql ObjectType decorator
      const interfaces = originalNode.interfaces.map(i => this.convertName(i));
      if (interfaces.length > 1) {
        decoratorOptions.implements = `[${interfaces.join(', ')}]`;
      } else if (interfaces.length === 1) {
        decoratorOptions.implements = interfaces[0];
      }
      declarationBlock = declarationBlock.withDecorator(
        `@TypeGraphQL.${typeDecorator}(${formatDecoratorOptions(decoratorOptions)})`
      );
    }

    return [declarationBlock.string, this.buildArgumentsBlock(originalNode)].filter(f => f).join('\n\n');
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    if (!this.hasTypeDecorators(node.name as unknown as string)) {
      return this.typescriptVisitor.InputObjectTypeDefinition(node);
    }

    const typeDecorator = this.config.decoratorName.input;

    const decoratorOptions = this.getDecoratorOptions(node);

    let declarationBlock = this.getInputObjectDeclarationBlock(node);

    // Add type-graphql InputType decorator
    declarationBlock = declarationBlock.withDecorator(
      `@TypeGraphQL.${typeDecorator}(${formatDecoratorOptions(decoratorOptions)})`
    );

    return declarationBlock.string;
  }

  getArgumentsObjectDeclarationBlock(
    node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode,
    name: string,
    field: FieldDefinitionNode
  ): DeclarationBlock {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.arguments)
      .withName(this.convertName(name))
      .withComment(node.description)
      .withBlock(field.arguments.map(argument => this.InputValueDefinition(argument)).join('\n'));
  }

  getArgumentsObjectTypeDefinition(
    node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode,
    name: string,
    field: FieldDefinitionNode
  ): string {
    const typeDecorator = this.config.decoratorName.arguments;

    let declarationBlock = this.getArgumentsObjectDeclarationBlock(node, name, field);

    // Add type-graphql Args decorator
    declarationBlock = declarationBlock.withDecorator(`@TypeGraphQL.${typeDecorator}()`);

    return declarationBlock.string;
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode, key: number | string, parent: any): string {
    if (!this.hasTypeDecorators(node.name as unknown as string)) {
      return this.typescriptVisitor.InterfaceTypeDefinition(node, key, parent);
    }

    const interfaceDecorator = this.config.decoratorName.interface;
    const originalNode = parent[key] as InterfaceTypeDefinitionNode;

    const decoratorOptions = this.getDecoratorOptions(node);

    const declarationBlock = this.getInterfaceTypeDeclarationBlock(node, originalNode).withDecorator(
      `@TypeGraphQL.${interfaceDecorator}(${formatDecoratorOptions(decoratorOptions)})`
    );

    return [declarationBlock.string, this.buildArgumentsBlock(originalNode)].filter(f => f).join('\n\n');
  }

  buildTypeString(type: Type): string {
    if (!type.isArray && !type.isScalar && !type.isNullable) {
      type.type = `FixDecorator<${type.type}>`;
    }
    if (type.isScalar) {
      type.type = `Scalars['${type.type}']`;
    }
    if (type.isArray) {
      type.type = `Array<${type.type}>`;
    }
    if (type.isNullable) {
      type.type = `Maybe<${type.type}>`;
    }

    return type.type;
  }

  parseType(rawType: TypeNode | string): Type {
    const typeNode = rawType as TypeNode;
    if (typeNode.kind === 'NamedType') {
      return {
        type: typeNode.name.value,
        isNullable: true,
        isArray: false,
        isItemsNullable: false,
        isScalar: SCALARS.includes(typeNode.name.value),
      };
    }
    if (typeNode.kind === 'NonNullType') {
      return {
        ...this.parseType(typeNode.type),
        isNullable: false,
      };
    }
    if (typeNode.kind === 'ListType') {
      return {
        ...this.parseType(typeNode.type),
        isArray: true,
        isNullable: true,
      };
    }

    const isNullable = !!(rawType as string).match(MAYBE_REGEX);
    const nonNullableType = (rawType as string).replace(MAYBE_REGEX, '$1');
    const isArray = !!nonNullableType.match(ARRAY_REGEX);
    const singularType = nonNullableType.replace(ARRAY_REGEX, '$1');
    const isSingularTypeNullable = !!singularType.match(MAYBE_REGEX);
    const singularNonNullableType = singularType.replace(MAYBE_REGEX, '$1');
    const isScalar = !!singularNonNullableType.match(SCALAR_REGEX);
    const type = singularNonNullableType.replace(SCALAR_REGEX, (match, type) => {
      if (TYPE_GRAPHQL_SCALARS.includes(type)) {
        // This is a TypeGraphQL type
        return `TypeGraphQL.${type}`;
      }
      if (global[type]) {
        // This is a JS native type
        return type;
      }
      if (this.scalars[type]) {
        // This is a type specified in the configuration
        return this.scalars[type];
      }
      throw new Error(`Unknown scalar type ${type}`);
    });

    return { type, isNullable, isArray, isScalar, isItemsNullable: isArray && isSingularTypeNullable };
  }

  fixDecorator(type: Type, typeString: string) {
    return type.isArray || type.isNullable || type.isScalar ? typeString : `FixDecorator<${typeString}>`;
  }

  FieldDefinition(
    node: FieldDefinitionNode,
    key?: number | string,
    parent?: any,
    path?: any,
    ancestors?: TypeDefinitionNode[]
  ): string {
    const parentName = ancestors?.[ancestors.length - 1].name.value;
    if (!this.hasTypeDecorators(parentName)) {
      return this.typescriptVisitor.FieldDefinition(node, key, parent);
    }

    const fieldDecorator = this.config.decoratorName.field;
    let typeString = node.type as any as string;

    const type = this.parseType(typeString);

    const decoratorOptions = this.getDecoratorOptions(node);

    const nullableValue = getTypeGraphQLNullableValue(type);
    if (nullableValue) {
      decoratorOptions.nullable = nullableValue;
    }

    const decorator =
      '\n' +
      indent(
        `@TypeGraphQL.${fieldDecorator}(type => ${type.isArray ? `[${type.type}]` : type.type}${formatDecoratorOptions(
          decoratorOptions,
          false
        )})`
      ) +
      '\n';

    typeString = this.fixDecorator(type, typeString);

    return (
      decorator +
      indent(
        `${this.config.immutableTypes ? 'readonly ' : ''}${node.name}${type.isNullable ? '?' : '!'}: ${typeString};`
      )
    );
  }

  InputValueDefinition(
    node: InputValueDefinitionNode,
    key?: number | string,
    parent?: any,
    path?: Array<string | number>,
    ancestors?: Array<TypeDefinitionNode>
  ): string {
    const parentName = ancestors?.[ancestors.length - 1].name.value;
    if (parent && !this.hasTypeDecorators(parentName)) {
      return this.typescriptVisitor.InputValueDefinition(node, key, parent, path, ancestors);
    }

    const fieldDecorator = this.config.decoratorName.field;
    const rawType = node.type as TypeNode | string;

    const type = this.parseType(rawType);
    const typeGraphQLType =
      type.isScalar && TYPE_GRAPHQL_SCALARS.includes(type.type) ? `TypeGraphQL.${type.type}` : type.type;

    const decoratorOptions = this.getDecoratorOptions(node);

    const nullableValue = getTypeGraphQLNullableValue(type);
    if (nullableValue) {
      decoratorOptions.nullable = nullableValue;
    }

    const decorator =
      '\n' +
      indent(
        `@TypeGraphQL.${fieldDecorator}(type => ${
          type.isArray ? `[${typeGraphQLType}]` : typeGraphQLType
        }${formatDecoratorOptions(decoratorOptions, false)})`
      ) +
      '\n';

    const nameString = node.name.kind ? node.name.value : node.name;
    const typeString = (rawType as TypeNode).kind
      ? this.buildTypeString(type)
      : this.fixDecorator(type, rawType as string);

    return (
      decorator +
      indent(
        `${this.config.immutableTypes ? 'readonly ' : ''}${nameString}${type.isNullable ? '?' : '!'}: ${typeString};`
      )
    );
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    if (!this.hasTypeDecorators(node.name as unknown as string)) {
      return this.typescriptVisitor.EnumTypeDefinition(node);
    }

    return (
      super.EnumTypeDefinition(node) +
      `TypeGraphQL.registerEnumType(${this.convertName(node)}, { name: '${this.convertName(node)}' });\n`
    );
  }

  protected clearOptional(str: string): string {
    if (str.startsWith('Maybe')) {
      return str.replace(/Maybe<(.*?)>$/, '$1');
    }

    return str;
  }

  protected hasTypeDecorators(typeName: string): boolean {
    if (GRAPHQL_TYPES.includes(typeName)) {
      return false;
    }

    if (!this.config.decorateTypes) {
      return true;
    }

    return this.config.decorateTypes.some(filter => filter === typeName);
  }
}
