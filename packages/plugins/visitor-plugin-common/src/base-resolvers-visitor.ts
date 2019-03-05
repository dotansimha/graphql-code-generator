import { resolveExternalModuleAndFn } from 'graphql-codegen-plugin-helpers';
import * as autoBind from 'auto-bind';
import { DEFAULT_SCALARS } from './scalars';
import { ScalarsMap } from './types';
import { toPascalCase, DeclarationBlock, DeclarationBlockConfig, indent, getBaseTypeNode } from './utils';
import {
  NameNode,
  ListTypeNode,
  NamedTypeNode,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
  GraphQLSchema
} from 'graphql';
import {
  NonNullTypeNode,
  UnionTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  InterfaceTypeDefinitionNode
} from 'graphql/language/ast';
import { DirectiveDefinitionNode, GraphQLObjectType, InputValueDefinitionNode } from 'graphql';
import { OperationVariablesToObject } from './variables-to-object';

interface ParsedMapper {
  isExternal: boolean;
  type: string;
  source?: string;
}

export interface ParsedResolversConfig {
  scalars: ScalarsMap;
  convert: (str: string) => string;
  typesPrefix: string;
  contextType: string;
  mappers: {
    [typeName: string]: ParsedMapper;
  };
}

export interface RawResolversConfig {
  contextType?: string;
  mappers?: { [typeName: string]: string };
  scalars?: ScalarsMap;
  namingConvention?: string;
  typesPrefix?: string;
}

export class BaseResolversVisitor<
  TRawConfig extends RawResolversConfig = RawResolversConfig,
  TPluginConfig extends ParsedResolversConfig = ParsedResolversConfig
> {
  protected _parsedConfig: TPluginConfig;
  protected _declarationBlockConfig: DeclarationBlockConfig = {};
  protected _collectedResolvers: { [key: string]: string } = {};
  protected _variablesTransfomer: OperationVariablesToObject;

  constructor(
    rawConfig: TRawConfig,
    additionalConfig: TPluginConfig,
    private _schema: GraphQLSchema,
    defaultScalars: ScalarsMap = DEFAULT_SCALARS
  ) {
    this._parsedConfig = {
      scalars: { ...(defaultScalars || DEFAULT_SCALARS), ...(rawConfig.scalars || {}) },
      convert: rawConfig.namingConvention ? resolveExternalModuleAndFn(rawConfig.namingConvention) : toPascalCase,
      typesPrefix: rawConfig.typesPrefix || '',
      contextType: rawConfig.contextType || 'any',
      mappers: this.transformMappers(rawConfig.mappers || {}),
      ...((additionalConfig || {}) as any)
    };

    autoBind(this);
    this._variablesTransfomer = new OperationVariablesToObject(this.scalars, this.convertName);
  }

  private isExternalMapper(value: string): boolean {
    return value.includes('#');
  }

  private parseMapper(mapper: string): ParsedMapper {
    if (this.isExternalMapper(mapper)) {
      const [source, type] = mapper.split('#');
      return {
        isExternal: true,
        source,
        type
      };
    }

    return {
      isExternal: false,
      type: mapper
    };
  }

  private transformMappers(rawMappers: TRawConfig['mappers']): TPluginConfig['mappers'] {
    const result: TPluginConfig['mappers'] = {};

    Object.keys(rawMappers).forEach(gqlTypeName => {
      const mapperDef = rawMappers[gqlTypeName];
      const parsedMapper = this.parseMapper(mapperDef);
      result[gqlTypeName] = parsedMapper;
    });

    return result;
  }

  public get config(): TPluginConfig {
    return this._parsedConfig;
  }

  public get schema(): GraphQLSchema {
    return this._schema;
  }

  public get scalars(): ScalarsMap {
    return this.config.scalars;
  }

  public get mappersImports(): string[] {
    const groupedMappers: { [sourceFile: string]: string[] } = {};

    Object.keys(this.config.mappers)
      .filter(gqlTypeName => this.config.mappers[gqlTypeName].isExternal)
      .forEach(gqlTypeName => {
        const mapper = this.config.mappers[gqlTypeName];

        if (!groupedMappers[mapper.source]) {
          groupedMappers[mapper.source] = [];
        }

        groupedMappers[mapper.source].push(mapper.type);
      });

    return Object.keys(groupedMappers).map(source => this.buildMapperImport(source, groupedMappers[source]));
  }

  protected buildMapperImport(source: string, types: string[]): string {
    return `import { ${types.join(', ')} } from '${source}';`;
  }

  public convertName(name: any, addPrefix = true): string {
    return (addPrefix ? this.config.typesPrefix : '') + this.config.convert(name);
  }

  setDeclarationBlockConfig(config: DeclarationBlockConfig): void {
    this._declarationBlockConfig = config;
  }

  setVariablesTransformer(variablesTransfomer: OperationVariablesToObject): void {
    this._variablesTransfomer = variablesTransfomer;
  }

  public get rootResolver(): string {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('interface')
      .withName(this.convertName('ResolversRoot'))
      .withBlock(
        Object.keys(this._collectedResolvers)
          .map(schemaTypeName => {
            const resolverType = this._collectedResolvers[schemaTypeName];

            return indent(this.formatRootResolver(schemaTypeName, resolverType));
          })
          .join('\n')
      ).string;
  }

  protected formatRootResolver(schemaTypeName: string, resolverType: string): string {
    return `${schemaTypeName}?: ${resolverType},`;
  }

  Name(node: NameNode): string {
    return node.value;
  }

  ListType(node: ListTypeNode): string {
    const asString = (node.type as any) as string;

    return `Array<${asString}>`;
  }

  NamedType(node: NamedTypeNode): string {
    const asString = (node.name as any) as string;
    const type = this.config.scalars[asString] || this.convertName(asString);

    return `${type}`;
  }

  NonNullType(node: NonNullTypeNode): string {
    const asString = (node.type as any) as string;

    return asString;
  }

  FieldDefinition(node: FieldDefinitionNode, key: string | number, parent: any) {
    const hasArguments = node.arguments && node.arguments.length > 0;

    return parentName => {
      const original = parent[key];
      const realType = getBaseTypeNode(original.type).name.value;
      const mappedType = this.config.mappers[realType]
        ? this._variablesTransfomer.wrapAstTypeWithModifiers(this.config.mappers[realType].type, original.type)
        : node.type;
      const subscriptionType = this._schema.getSubscriptionType();
      const isSubscriptionType = subscriptionType && subscriptionType.name === parentName;

      return indent(
        `${node.name}?: ${isSubscriptionType ? 'SubscriptionResolver' : 'Resolver'}<${mappedType}, ParentType, Context${
          hasArguments ? `, ${this.convertName(parentName, true) + this.convertName(node.name, false) + 'Args'}` : ''
        }>,`
      );
    };
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode) {
    const name = this.convertName(node.name + 'Resolvers');
    let type: string = null;

    if (this.config.mappers[node.name as any]) {
      type = this.config.mappers[node.name as any].type;
    } else {
      type = this.config.scalars[node.name as any] || this.convertName(node.name);
    }

    const block = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('interface')
      .withName(name, `<Context = ${this.config.contextType}, ParentType = ${type}>`)
      .withBlock(node.fields.map((f: any) => f(node.name)).join('\n'));

    this._collectedResolvers[node.name as any] = name;

    return block.string;
  }

  UnionTypeDefinition(node: UnionTypeDefinitionNode, key: string | number, parent: any): string {
    const name = this.convertName(node.name + 'Resolvers');
    const originalNode = parent[key] as UnionTypeDefinitionNode;
    const possibleTypes = originalNode.types
      .map(node => this.convertName(node.name.value))
      .map(f => `'${f}'`)
      .join(' | ');

    this._collectedResolvers[node.name as any] = name;

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('interface')
      .withName(name, `<Context = ${this.config.contextType}, ParentType = ${node.name}>`)
      .withBlock(indent(`__resolveType: TypeResolveFn<${possibleTypes}>`)).string;
  }

  ScalarTypeDefinition(node: ScalarTypeDefinitionNode): string {
    const baseName = this.convertName(node.name);

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('interface')
      .withName(this.convertName(node.name + 'ScalarConfig'), ` extends GraphQLScalarTypeConfig<${baseName}, any>`)
      .withBlock(indent(`name: '${node.name}'`)).string;
  }

  DirectiveDefinition(node: DirectiveDefinitionNode): string {
    const directiveName = this.convertName(node.name + 'DirectiveResolver');
    const hasArguments = node.arguments && node.arguments.length > 0;
    const directiveArgs = hasArguments
      ? this._variablesTransfomer.transform<InputValueDefinitionNode>(node.arguments)
      : '';

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(directiveName, '<Result>')
      .withContent(`DirectiveResolverFn<Result, { ${directiveArgs} }, ${this.config.contextType}>`).string;
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): string {
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

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('interface')
      .withName(name, `<Context = ${this.config.contextType}, ParentType = ${node.name}>`)
      .withBlock(indent(`__resolveType: TypeResolveFn<${implementingTypes.map(name => `'${name}'`).join(' | ')}>`))
      .string;
  }
}
