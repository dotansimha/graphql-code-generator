import { ParsedConfig, BaseVisitor } from '@graphql-codegen/visitor-plugin-common';
import { JavaResolversPluginRawConfig } from './index';
import { JAVA_SCALARS } from '../../common/dist/esnext';
import { GraphQLSchema, Kind, TypeNode } from 'graphql';

export interface JavaResolverParsedConfig extends ParsedConfig {
  package: string;
}

export class JavaResolversVisitor extends BaseVisitor<JavaResolversPluginRawConfig, JavaResolverParsedConfig> {
  private _includeTypeResolverImport = false;

  constructor(rawConfig: JavaResolversPluginRawConfig, private _schema: GraphQLSchema, defaultPackageName: string) {
    super(
      rawConfig,
      {
        package: rawConfig.package || defaultPackageName,
      },
      JAVA_SCALARS
    );
  }

  public getImports(): string {
    const allImports = [];

    return allImports.map(i => `import ${i};`).join('\n') + '\n';
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

  public getPackageName(): string {
    return `package ${this.config.package};\n`;
  }
}
