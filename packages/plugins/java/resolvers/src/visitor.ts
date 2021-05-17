import {
  ParsedConfig,
  BaseVisitor,
  ParsedMapper,
  transformMappers,
  parseMapper,
  indent,
  indentMultiline,
  getBaseTypeNode,
  ExternalParsedMapper,
  buildScalarsFromConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { JavaResolversPluginRawConfig } from './config';
import { JAVA_SCALARS, JavaDeclarationBlock, wrapTypeWithModifiers } from '@graphql-codegen/java-common';
import {
  GraphQLSchema,
  NamedTypeNode,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  InterfaceTypeDefinitionNode,
} from 'graphql';
import { UnionTypeDefinitionNode } from 'graphql/language/ast';

export interface JavaResolverParsedConfig extends ParsedConfig {
  package: string;
  mappers: { [typeName: string]: ParsedMapper };
  defaultMapper: ParsedMapper;
  className: string;
  listType: string;
}

export class JavaResolversVisitor extends BaseVisitor<JavaResolversPluginRawConfig, JavaResolverParsedConfig> {
  private _includeTypeResolverImport = false;

  constructor(rawConfig: JavaResolversPluginRawConfig, _schema: GraphQLSchema, defaultPackageName: string) {
    super(rawConfig, {
      mappers: transformMappers(rawConfig.mappers || {}),
      package: rawConfig.package || defaultPackageName,
      defaultMapper: parseMapper(rawConfig.defaultMapper || 'Object'),
      className: rawConfig.className || 'Resolvers',
      listType: rawConfig.listType || 'Iterable',
      scalars: buildScalarsFromConfig(_schema, rawConfig, JAVA_SCALARS, 'Object'),
    });
  }

  public getImports(): string {
    const mappersImports = this.mappersImports();
    const allImports = [...mappersImports];

    if (this._includeTypeResolverImport) {
      allImports.push('graphql.schema.TypeResolver');
    }

    allImports.push('graphql.schema.DataFetcher');

    return allImports.map(i => `import ${i};`).join('\n') + '\n';
  }

  protected mappersImports(): string[] {
    return Object.keys(this.config.mappers)
      .map(typeName => this.config.mappers[typeName])
      .filter((m): m is ExternalParsedMapper => m.isExternal)
      .map(m => m.source);
  }

  protected getTypeToUse(type: NamedTypeNode): string {
    if (this.scalars[type.name.value]) {
      return this.scalars[type.name.value];
    } else if (this.config.mappers[type.name.value]) {
      return this.config.mappers[type.name.value].type;
    }

    return this.config.defaultMapper.type;
  }

  public getPackageName(): string {
    return `package ${this.config.package};\n`;
  }

  public wrapWithClass(content: string): string {
    return new JavaDeclarationBlock()
      .access('public')
      .asKind('class')
      .withName(this.config.className)
      .withBlock(indentMultiline(content)).string;
  }

  UnionTypeDefinition(node: UnionTypeDefinitionNode): string {
    this._includeTypeResolverImport = true;

    return new JavaDeclarationBlock()
      .access('public')
      .asKind('interface')
      .withName(this.convertName(node.name))
      .extends(['TypeResolver'])
      .withComment(node.description).string;
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): string {
    this._includeTypeResolverImport = true;

    return new JavaDeclarationBlock()
      .access('public')
      .asKind('interface')
      .withName(this.convertName(node.name))
      .extends(['TypeResolver'])
      .withComment(node.description)
      .withBlock(node.fields.map(f => indent((f as any)(true))).join('\n')).string;
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    return new JavaDeclarationBlock()
      .access('public')
      .asKind('interface')
      .withName(this.convertName(node.name))
      .withComment(node.description)
      .withBlock(node.fields.map(f => indent((f as any)(false))).join('\n')).string;
  }

  FieldDefinition(node: FieldDefinitionNode, key: string | number, _parent: any) {
    return (isInterface: boolean) => {
      const baseType = getBaseTypeNode(node.type);
      const typeToUse = this.getTypeToUse(baseType);
      const wrappedType = wrapTypeWithModifiers(typeToUse, node.type, this.config.listType);

      if (isInterface) {
        return `default public DataFetcher<${wrappedType}> ${node.name.value}() { return null; }`;
      } else {
        return `public DataFetcher<${wrappedType}> ${node.name.value}();`;
      }
    };
  }
}
