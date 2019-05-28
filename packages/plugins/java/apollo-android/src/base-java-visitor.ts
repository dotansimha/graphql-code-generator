import { Imports } from './imports';
import { BaseVisitor, ParsedConfig, getBaseTypeNode } from '@graphql-codegen/visitor-plugin-common';
import { JavaApolloAndroidPluginConfig } from './plugin';
import { JAVA_SCALARS } from '@graphql-codegen/java-common';
import { GraphQLSchema, isScalarType, isInputObjectType, InputValueDefinitionNode, Kind, VariableDefinitionNode, GraphQLNamedType } from 'graphql';
import { VisitorConfig } from './visitor-config';
import { ImportsSet } from './types';

export const SCALAR_TO_WRITER_METHOD = {
  ID: 'writeString',
  String: 'writeString',
  Int: 'writeInt',
  Boolean: 'writeBoolean',
  Float: 'writeDouble',
};

export class BaseJavaVisitor<Config extends VisitorConfig = any> extends BaseVisitor<JavaApolloAndroidPluginConfig, Config> {
  protected _imports: ImportsSet = new Set<string>();

  constructor(protected _schema: GraphQLSchema, rawConfig: JavaApolloAndroidPluginConfig, additionalConfig: Partial<Config>) {
    super(rawConfig, additionalConfig, {
      ...JAVA_SCALARS,
      ID: 'String',
    });
  }

  public getImports(): string[] {
    return Array.from(this._imports).map(imp => `import ${imp};`);
  }

  // Replaces a GraphQL type with a Java class
  protected getActualType(schemaType: GraphQLNamedType): string {
    let typeToUse = schemaType.name;

    if (isScalarType(schemaType)) {
      const scalar = this.config.scalars[schemaType.name] || 'Object';

      if (Imports[scalar]) {
        this._imports.add(Imports[scalar]);
      }

      typeToUse = scalar;
    } else if (isInputObjectType(schemaType)) {
      // Make sure to import it if it's in use
      this._imports.add(`${this.config.inputPackage}.${schemaType.name}`);
    }

    return typeToUse;
  }

  protected getFieldWithTypePrefix(field: InputValueDefinitionNode | VariableDefinitionNode, wrapWith: string | null = null, applyNullable = false): string {
    this._imports.add(Imports.Input);
    const typeToUse = this.getActualType(this._schema.getType(getBaseTypeNode(field.type).name.value));
    const isNonNull = field.type.kind === Kind.NON_NULL_TYPE;
    const name = field.kind === Kind.INPUT_VALUE_DEFINITION ? field.name.value : field.variable.name.value;

    if (isNonNull) {
      this._imports.add(Imports.Nonnull);

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
