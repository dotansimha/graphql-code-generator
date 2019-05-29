import { GraphQLSchema, isScalarType, GraphQLScalarType } from 'graphql';
import { BaseJavaVisitor } from './base-java-visitor';
import { VisitorConfig } from './visitor-config';
import { JavaApolloAndroidPluginConfig } from './plugin';
import { indentMultiline } from '@graphql-codegen/visitor-plugin-common';
import { Imports } from './imports';
import { JavaDeclarationBlock } from '@graphql-codegen/java-common';

const filteredScalars = ['String', 'Float', 'Int', 'Boolean'];

export class CustomTypeClassVisitor extends BaseJavaVisitor<VisitorConfig> {
  constructor(schema: GraphQLSchema, rawConfig: JavaApolloAndroidPluginConfig) {
    super(schema, rawConfig, {
      typePackage: rawConfig.typePackage || 'type',
    });
  }

  private extract(name: string): { className: string; importFrom: string | null } {
    const lastIndex = name.lastIndexOf('.');

    if (lastIndex === -1) {
      return {
        className: name,
        importFrom: Imports[name] || null,
      };
    } else {
      return {
        className: name.substring(lastIndex + 1),
        importFrom: name,
      };
    }
  }

  public additionalContent(): string {
    this._imports.add(Imports.ScalarType);
    this._imports.add(Imports.Class);
    this._imports.add(Imports.Override);
    this._imports.add(Imports.Generated);
    const allTypes = this._schema.getTypeMap();

    const enumValues = Object.keys(allTypes)
      .filter(t => isScalarType(allTypes[t]) && !filteredScalars.includes(t))
      .map<GraphQLScalarType>(t => allTypes[t] as GraphQLScalarType)
      .map(scalarType => {
        const uppercaseName = scalarType.name.toUpperCase();
        const javaType = this.extract(this.config.scalars[scalarType.name] || 'String');

        if (javaType.importFrom) {
          this._imports.add(javaType.importFrom);
        }

        return indentMultiline(`${uppercaseName} {
  @Override
  public String typeName() {
    return "${scalarType.name}";
  }

  @Override
  public Class javaType() {
    return ${javaType.className}.class;
  }
}`);
      })
      .join(',\n\n');

    return new JavaDeclarationBlock()
      .annotate([`Generated("Apollo GraphQL")`])
      .access('public')
      .asKind('enum')
      .withName('CustomType')
      .implements(['ScalarType'])
      .withBlock(enumValues).string;
  }

  public getPackage(): string {
    return this.config.typePackage;
  }
}
