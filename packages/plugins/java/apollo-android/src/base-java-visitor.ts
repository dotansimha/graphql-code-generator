import { Imports } from './imports';
import { BaseVisitor, ParsedConfig, getBaseTypeNode, getBaseType } from '@graphql-codegen/visitor-plugin-common';
import { JavaApolloAndroidPluginConfig } from './plugin';
import { JAVA_SCALARS } from '@graphql-codegen/java-common';
import { GraphQLSchema, isScalarType, isInputObjectType, InputValueDefinitionNode, Kind, VariableDefinitionNode, GraphQLNamedType, GraphQLOutputType, isNonNullType, isListType, TypeNode, GraphQLInterfaceType, GraphQLObjectType } from 'graphql';
import { VisitorConfig } from './visitor-config';
import { ImportsSet, TransformedType } from './types';

export const SCALAR_TO_WRITER_METHOD = {
  ID: 'writeString',
  String: 'writeString',
  Int: 'writeInt',
  Boolean: 'writeBoolean',
  Float: 'writeDouble',
};

function isTypeNode(type: TypeNode | GraphQLOutputType): type is TypeNode {
  return type && type['kind'];
}

export class BaseJavaVisitor<Config extends VisitorConfig = any> extends BaseVisitor<JavaApolloAndroidPluginConfig, Config> {
  protected _imports: ImportsSet = new Set<string>();

  constructor(protected _schema: GraphQLSchema, rawConfig: JavaApolloAndroidPluginConfig, additionalConfig: Partial<Config>) {
    super(rawConfig, additionalConfig, {
      ...JAVA_SCALARS,
      ID: 'String',
    });
  }

  public getPackage(): string {
    return '';
  }

  public additionalContent(): string {
    return '';
  }

  public getImports(): string[] {
    return Array.from(this._imports).map(imp => `import ${imp};`);
  }

  protected getImplementingTypes(node: GraphQLInterfaceType): string[] {
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

    return implementingTypes;
  }

  protected transformType(type: TypeNode | GraphQLOutputType): TransformedType {
    let schemaType: GraphQLNamedType;
    let isNonNull: boolean;

    if (isTypeNode(type)) {
      const baseTypeNode = getBaseTypeNode(type as TypeNode);
      schemaType = this._schema.getType(baseTypeNode.name.value);
      isNonNull = type.kind === Kind.NON_NULL_TYPE;
    } else {
      schemaType = this._schema.getType(getBaseType(type).name);
      isNonNull = isNonNullType(type);
    }

    const javaType = this.getJavaClass(schemaType);
    const annotation = isNonNull ? 'Nonnull' : 'Nullable';
    const typeToUse = isTypeNode(type) ? this.getListTypeNodeWrapped(javaType, type) : this.getListTypeWrapped(javaType, type);

    return {
      baseType: schemaType.name,
      javaType,
      isNonNull,
      annotation,
      typeToUse,
    };
  }

  // Replaces a GraphQL type with a Java class
  protected getJavaClass(schemaType: GraphQLNamedType): string {
    let typeToUse = schemaType.name;

    if (isScalarType(schemaType)) {
      const scalar = this.config.scalars[schemaType.name] || 'Object';

      if (Imports[scalar]) {
        this._imports.add(Imports[scalar]);
      }

      typeToUse = scalar;
    } else if (isInputObjectType(schemaType)) {
      // Make sure to import it if it's in use
      this._imports.add(`${this.config.typePackage}.${schemaType.name}`);
    }

    return typeToUse;
  }

  protected getListTypeWrapped(toWrap: string, type: GraphQLOutputType): string {
    if (isNonNullType(type)) {
      return this.getListTypeWrapped(toWrap, type.ofType);
    }

    if (isListType(type)) {
      const child = this.getListTypeWrapped(toWrap, type.ofType);
      this._imports.add(Imports.List);

      return `List<${child}>`;
    }

    return toWrap;
  }

  protected getListTypeNodeWrapped(toWrap: string, type: TypeNode): string {
    if (type.kind === Kind.NON_NULL_TYPE) {
      return this.getListTypeNodeWrapped(toWrap, type.type);
    }

    if (type.kind === Kind.LIST_TYPE) {
      const child = this.getListTypeNodeWrapped(toWrap, type.type);
      this._imports.add(Imports.List);

      return `List<${child}>`;
    }

    return toWrap;
  }
}
