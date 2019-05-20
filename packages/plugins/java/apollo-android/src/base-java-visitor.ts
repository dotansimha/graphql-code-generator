import { Imports } from './imports';
import { BaseVisitor, ParsedConfig, getBaseTypeNode } from '@graphql-codegen/visitor-plugin-common';
import { JavaApolloAndroidPluginConfig } from './plugin';
import { JAVA_SCALARS, wrapTypeWithModifiers } from '@graphql-codegen/java-common';
import { GraphQLSchema, TypeNode, isScalarType, isInputObjectType, InputValueDefinitionNode, Kind, VariableDefinitionNode } from 'graphql';

export const SCALAR_TO_WRITER_METHOD = {
  ID: 'writeString',
  String: 'writeString',
  Int: 'writeInt',
  Boolean: 'writeBoolean',
  Float: 'writeDouble',
};

export class BaseJavaVisitor<Config extends ParsedConfig & { package: string } = any> extends BaseVisitor<JavaApolloAndroidPluginConfig, Config> {
  protected _imports = new Set<string>();

  constructor(protected _schema: GraphQLSchema, rawConfig: JavaApolloAndroidPluginConfig, additionalConfig: Partial<Config>) {
    super(rawConfig, additionalConfig, {
      ...JAVA_SCALARS,
      ID: 'String',
    });
  }

  public getImports(): string[] {
    return Array.from(this._imports).map(imp => `import ${imp};`);
  }

  protected getActualType(type: TypeNode, wrap = true): string {
    const baseType = getBaseTypeNode(type);
    const schemaType = this._schema.getType(baseType.name.value);
    let typeToUse = schemaType.name;

    if (isScalarType(schemaType)) {
      const scalar = this.config.scalars[schemaType.name] || 'Object';

      if (Imports[scalar]) {
        this._imports.add(Imports[scalar]);
      }

      typeToUse = scalar;
    } else if (isInputObjectType(schemaType)) {
      this._imports.add(`${this.config.package}.${schemaType.name}`);
    }

    const result = wrap ? wrapTypeWithModifiers(typeToUse, type, 'List') : typeToUse;

    if (result.includes('List<')) {
      this._imports.add(Imports.List);
    }

    return result;
  }

  protected getFieldWithTypePrefix(field: InputValueDefinitionNode | VariableDefinitionNode, wrapWith: string | null = null, applyNullable = false): string {
    this._imports.add(Imports.Input);
    const typeToUse = this.getActualType(field.type);
    const isNonNull = field.type.kind === Kind.NON_NULL_TYPE;
    const name = field.kind === Kind.INPUT_VALUE_DEFINITION ? field.name.value : field.variable.name.value;

    if (isNonNull) {
      this._imports.add(Imports.NonNull);

      return `@Nonnull ${typeToUse} ${name}`;
    } else {
      if (wrapWith) {
        return `${wrapWith}<${typeToUse}> ${name}`;
      } else {
        if (applyNullable) {
          this._imports.add(Imports.Nullable);
        }
        return `${applyNullable ? '@Nullable ' : ''}${typeToUse} ${name}`;
      }
    }
  }
}
