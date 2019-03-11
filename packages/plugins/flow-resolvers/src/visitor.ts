import { resolveExternalModuleAndFn } from 'graphql-codegen-plugin-helpers';
import {
  DEFAULT_SCALARS,
  indent,
  toPascalCase,
  DeclarationBlock,
  ScalarsMap,
  OperationVariablesToObject,
  getBaseTypeNode,
  wrapAstTypeWithModifiers
} from 'graphql-codegen-visitor-plugin-common';
import {
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  NameNode,
  ListTypeNode,
  NonNullTypeNode,
  NamedTypeNode,
  InterfaceTypeDefinitionNode,
  UnionTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  DirectiveDefinitionNode,
  InputValueDefinitionNode
} from 'graphql/language/ast';
import { FlowResolversPluginConfig } from './index';
import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import * as autoBind from 'auto-bind';

export interface ParsedConfig {
  scalars: ScalarsMap;
  convert: (str: string) => string;
  typesPrefix: string;
  contextType: string;
  mapping: { [typeName: string]: string };
}

export class FlowResolversVisitor {
  private _parsedConfig: ParsedConfig;
  private _collectedResolvers: { [key: string]: string } = {};

  constructor(pluginConfig: FlowResolversPluginConfig, private _schema: GraphQLSchema) {
    this._parsedConfig = {
      contextType: pluginConfig.contextType || 'any',
      mapping: pluginConfig.mapping || {},
      scalars: { ...DEFAULT_SCALARS, ...(pluginConfig.scalars || {}) },
      convert: pluginConfig.namingConvention ? resolveExternalModuleAndFn(pluginConfig.namingConvention) : toPascalCase,
      typesPrefix: pluginConfig.typesPrefix || ''
    };
    autoBind(this);
  }

  get scalars(): ScalarsMap {
    return this._parsedConfig.scalars;
  }

  public convertName(name: any, addPrefix = true): string {
    return (addPrefix ? this._parsedConfig.typesPrefix : '') + this._parsedConfig.convert(name);
  }

  public get rootResolver(): string {
    return new DeclarationBlock()
      .export()
      .asKind('interface')
      .withName(this.convertName('ResolversRoot'))
      .withBlock(
        Object.keys(this._collectedResolvers)
          .map(schemaTypeName => {
            const resolverType = this._collectedResolvers[schemaTypeName];

            return indent(`${schemaTypeName}?: ${resolverType}<>,`);
          })
          .join('\n')
      ).string;
  }

  Name = (node: NameNode): string => {
    return node.value;
  };

  ListType = (node: ListTypeNode): string => {
    const asString = (node.type as any) as string;

    return `?Array<${asString}>`;
  };

  NamedType = (node: NamedTypeNode): string => {
    const asString = (node.name as any) as string;
    const type = this._parsedConfig.scalars[asString] || this.convertName(asString);

    return `?${type}`;
  };

  NonNullType = (node: NonNullTypeNode): string => {
    const asString = (node.type as any) as string;

    if (asString.charAt(0) === '?') {
      return asString.substr(1);
    }

    return asString;
  };

  FieldDefinition = (node: FieldDefinitionNode, key, parent) => {
    const hasArguments = node.arguments && node.arguments.length > 0;

    return parentName => {
      const original = parent[key];
      const realType = getBaseTypeNode(original.type).name.value;
      const mappedType = this._parsedConfig.mapping[realType]
        ? wrapAstTypeWithModifiers('?')(this._parsedConfig.mapping[realType], original.type)
        : node.type;
      const subscriptionType = this._schema.getSubscriptionType();
      const isSubscriptionType = subscriptionType && subscriptionType.name === parentName;

      return indent(
        `${node.name}?: ${isSubscriptionType ? 'SubscriptionResolver' : 'Resolver'}<${mappedType}, ParentType, Context${
          hasArguments ? `, ${this.convertName(parentName, true) + this.convertName(node.name, false) + 'Args'}` : ''
        }>,`
      );
    };
  };

  ObjectTypeDefinition = (node: ObjectTypeDefinitionNode) => {
    const name = this.convertName(node.name + 'Resolvers');
    const type =
      this._parsedConfig.mapping[node.name as any] ||
      this._parsedConfig.scalars[node.name as any] ||
      this.convertName(node.name);
    const block = new DeclarationBlock()
      .export()
      .asKind('interface')
      .withName(name, `<Context = ${this._parsedConfig.contextType}, ParentType = ${type}>`)
      .withBlock(node.fields.map((f: any) => f(node.name)).join('\n'));

    this._collectedResolvers[node.name as any] = name;

    return block.string;
  };

  UnionTypeDefinition = (node: UnionTypeDefinitionNode): string => {
    const name = this.convertName(node.name + 'Resolvers');
    const possibleTypes = node.types
      .map(name => ((name as any) as string).replace('?', ''))
      .map(f => `'${f}'`)
      .join(' | ');

    this._collectedResolvers[node.name as any] = name;

    return new DeclarationBlock()
      .export()
      .asKind('interface')
      .withName(name, `<Context = ${this._parsedConfig.contextType}, ParentType = ${node.name}>`)
      .withBlock(indent(`__resolveType: TypeResolveFn<${possibleTypes}>`)).string;
  };

  ScalarTypeDefinition = (node: ScalarTypeDefinitionNode): string => {
    const baseName = this.convertName(node.name);

    return new DeclarationBlock()
      .export()
      .asKind('interface')
      .withName(this.convertName(node.name + 'ScalarConfig'), ` extends GraphQLScalarTypeConfig<${baseName}, any>`)
      .withBlock(indent(`name: '${node.name}'`)).string;
  };

  DirectiveDefinition = (node: DirectiveDefinitionNode): string => {
    const directiveName = this.convertName(node.name + 'DirectiveResolver');
    const hasArguments = node.arguments && node.arguments.length > 0;
    const directiveArgs = hasArguments
      ? new OperationVariablesToObject<InputValueDefinitionNode>(
          this._parsedConfig.scalars,
          this.convertName,
          node.arguments,
          wrapAstTypeWithModifiers('?')
        ).string
      : '';

    return new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(directiveName, '<Result>')
      .withContent(`DirectiveResolverFn<Result, { ${directiveArgs} }, ${this._parsedConfig.contextType}>`).string;
  };

  InterfaceTypeDefinition = (node: InterfaceTypeDefinitionNode): string => {
    const name = this.convertName(node.name + 'Resolvers');
    const allTypesMap = this._schema.getTypeMap();
    const implementingTypes: string[] = [];

    this._collectedResolvers[node.name as any] = name;

    for (const graphqlType of Object.values(allTypesMap)) {
      if (graphqlType instanceof GraphQLObjectType) {
        const allInterfaces = graphqlType.getInterfaces();
        if (allInterfaces.find(int => int.name === ((node.name as any) as string))) {
          implementingTypes.push(graphqlType.name);
        }
      }
    }

    return new DeclarationBlock()
      .export()
      .asKind('interface')
      .withName(name, `<Context = ${this._parsedConfig.contextType}, ParentType = ${node.name}>`)
      .withBlock(indent(`__resolveType: TypeResolveFn<${implementingTypes.map(name => `'${name}'`).join(' | ')}>`))
      .string;
  };
}
