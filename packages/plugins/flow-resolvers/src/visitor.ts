import { resolveExternalModuleAndFn } from 'graphql-codegen-plugin-helpers';
import {
  DEFAULT_SCALARS,
  indent,
  toPascalCase,
  DeclarationBlock,
  BasicFlowVisitor,
  ScalarsMap,
  OperationVariablesToObject,
  getBaseTypeNode,
  wrapAstTypeWithModifiers
} from 'graphql-codegen-flow';
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

export interface ParsedConfig {
  scalars: ScalarsMap;
  convert: (str: string) => string;
  typesPrefix: string;
  contextType: string;
  mapping: { [typeName: string]: string };
}

export class FlowResolversVisitor implements BasicFlowVisitor {
  private _parsedConfig: ParsedConfig;

  constructor(pluginConfig: FlowResolversPluginConfig, private _schema: GraphQLSchema) {
    this._parsedConfig = {
      contextType: pluginConfig.contextType || 'any',
      mapping: pluginConfig.mapping || {},
      scalars: { ...DEFAULT_SCALARS, ...(pluginConfig.scalars || {}) },
      convert: pluginConfig.namingConvention ? resolveExternalModuleAndFn(pluginConfig.namingConvention) : toPascalCase,
      typesPrefix: pluginConfig.typesPrefix || ''
    };
  }

  get scalars(): ScalarsMap {
    return this._parsedConfig.scalars;
  }

  private _convertName(name: any, addPrefix = true): string {
    return (addPrefix ? this._parsedConfig.typesPrefix : '') + this._parsedConfig.convert(name);
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
    const type = this._parsedConfig.scalars[asString] || this._convertName(asString);

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
        ? wrapAstTypeWithModifiers(this._parsedConfig.mapping[realType], original.type)
        : node.type;
      const subscriptionType = this._schema.getSubscriptionType();
      const isSubscriptionType = subscriptionType && subscriptionType.name === parentName;

      return indent(
        `${node.name}?: ${isSubscriptionType ? 'SubscriptionResolver' : 'Resolver'}<${mappedType}, ParentType, Context${
          hasArguments ? `, ${parentName + this._convertName(node.name, false) + 'Args'}` : ''
        }>,`
      );
    };
  };

  ObjectTypeDefinition = (node: ObjectTypeDefinitionNode) => {
    const name = this._convertName(node.name + 'Resolvers');
    const type =
      this._parsedConfig.mapping[node.name as any] ||
      this._parsedConfig.scalars[node.name as any] ||
      this._convertName(node.name);
    const block = new DeclarationBlock()
      .export()
      .asKind('interface')
      .withName(name, `<Context = ${this._parsedConfig.contextType}, ParentType = ${type}>`)
      .withBlock(node.fields.map((f: any) => f(node.name)).join('\n'));

    return block.string;
  };

  UnionTypeDefinition = (node: UnionTypeDefinitionNode): string => {
    const name = this._convertName(node.name + 'Resolvers');
    const possibleTypes = node.types
      .map(name => ((name as any) as string).replace('?', ''))
      .map(f => `'${f}'`)
      .join(' | ');

    return new DeclarationBlock()
      .export()
      .asKind('interface')
      .withName(name, `<Context = ${this._parsedConfig.contextType}, ParentType = ${node.name}>`)
      .withBlock(indent(`__resolveType: TypeResolveFn<${possibleTypes}>`)).string;
  };

  ScalarTypeDefinition = (node: ScalarTypeDefinitionNode): string => {
    const baseName = this._convertName(node.name);

    return new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(this._convertName(node.name + 'ScalarConfig'), ` extends GraphQLScalarTypeConfig<${baseName}, any>`)
      .withBlock(indent(`name: '${node.name}'`)).string;
  };

  DirectiveDefinition = (node: DirectiveDefinitionNode): string => {
    const directiveName = this._convertName(node.name + 'DirectiveResolver');
    const hasArguments = node.arguments && node.arguments.length > 0;
    const directiveArgs = hasArguments
      ? new OperationVariablesToObject<FlowResolversVisitor, InputValueDefinitionNode>(this, node.arguments).string
      : '';

    return new DeclarationBlock()
      .export()
      .asKind('type')
      .withName(directiveName, '<Result>')
      .withContent(`DirectiveResolverFn<Result, { ${directiveArgs} }, ${this._parsedConfig.contextType}>`).string;
  };

  InterfaceTypeDefinition = (node: InterfaceTypeDefinitionNode): string => {
    const name = this._convertName(node.name + 'Resolvers');
    const allTypesMap = this._schema.getTypeMap();
    const implementingTypes: string[] = [];

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
