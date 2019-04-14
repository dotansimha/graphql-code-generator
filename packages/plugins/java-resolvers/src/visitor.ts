import { ParsedConfig, BaseVisitor, ParsedMapper, transformMappers, parseMapper, indent, indentMultiline, getBaseTypeNode } from '@graphql-codegen/visitor-plugin-common';
import { JavaResolversPluginRawConfig } from './index';
import { JAVA_SCALARS } from './scalars';
import { GraphQLSchema, Kind, NamedTypeNode, ObjectTypeDefinitionNode, FieldDefinitionNode, InterfaceTypeDefinitionNode, TypeNode } from 'graphql';
import { JavaDeclarationBlock } from './java-declaration-block';
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

  constructor(rawConfig: JavaResolversPluginRawConfig, private _schema: GraphQLSchema, defaultPackageName: string) {
    super(
      rawConfig,
      {
        mappers: transformMappers(rawConfig.mappers || {}),
        package: rawConfig.package || defaultPackageName,
        defaultMapper: parseMapper(rawConfig.defaultMapper || 'Object'),
        className: rawConfig.className || 'Resolvers',
        listType: rawConfig.listType || 'Iterable',
      },
      JAVA_SCALARS
    );
  }

  public getImports(): string {
    const mappersImports = this.mappersImports();
    const allImports = [...mappersImports];

    if (this._includeTypeResolverImport) {
      allImports.push('graphql.schema.TypeResolver');
    }

    return allImports.map(i => `import ${i};`).join('\n') + '\n';
  }

  protected mappersImports(): string[] {
    return Object.keys(this.config.mappers)
      .map(typeName => this.config.mappers[typeName])
      .filter(m => m.isExternal)
      .map(m => m.source);
  }

  protected wrapTypeWithModifiers(baseType: string, typeNode: TypeNode): string {
    if (typeNode.kind === Kind.NON_NULL_TYPE) {
      const type = this.wrapTypeWithModifiers(baseType, typeNode.type);

      return type;
    } else if (typeNode.kind === Kind.LIST_TYPE) {
      const innerType = this.wrapTypeWithModifiers(baseType, typeNode.type);

      return `Iterable<${innerType}>`;
    } else {
      return baseType;
    }
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
      .withBlock(node.fields.map(f => indent((f as any) as string)).join('\n')).string;
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    return new JavaDeclarationBlock()
      .access('public')
      .asKind('interface')
      .withName(this.convertName(node.name))
      .withComment(node.description)
      .withBlock(node.fields.map(f => indent((f as any) as string)).join('\n')).string;
  }

  FieldDefinition(node: FieldDefinitionNode) {
    const baseType = getBaseTypeNode(node.type);
    const typeToUse = this.getTypeToUse(baseType);
    const wrappedType = this.wrapTypeWithModifiers(typeToUse, node.type);

    return `public DataFetcher<${wrappedType}> ${node.name.value}();`;
  }
}
