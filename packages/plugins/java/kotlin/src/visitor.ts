import {
  BaseVisitor,
  EnumValuesMap,
  indent,
  indentMultiline,
  ParsedConfig,
  transformComment,
  getBaseTypeNode,
  buildScalarsFromConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { KotlinResolversPluginRawConfig } from './config.js';
import {
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  isEnumType,
  isInputObjectType,
  isObjectType,
  isScalarType,
  Kind,
  ObjectTypeDefinitionNode,
  TypeNode,
  ValueNode,
} from 'graphql';
import { wrapTypeWithModifiers } from '@graphql-codegen/java-common';

export const KOTLIN_SCALARS = {
  ID: 'Any',
  String: 'String',
  Boolean: 'Boolean',
  Int: 'Int',
  Float: 'Float',
};

export interface KotlinResolverParsedConfig extends ParsedConfig {
  package: string;
  listType: string;
  enumValues: EnumValuesMap;
  withTypes: boolean;
  omitJvmStatic: boolean;
}

export interface FieldDefinitionReturnType {
  inputTransformer?: ((typeName: string) => string) | FieldDefinitionNode;
  node: FieldDefinitionNode;
}

export class KotlinResolversVisitor extends BaseVisitor<KotlinResolversPluginRawConfig, KotlinResolverParsedConfig> {
  constructor(rawConfig: KotlinResolversPluginRawConfig, private _schema: GraphQLSchema, defaultPackageName: string) {
    super(rawConfig, {
      enumValues: rawConfig.enumValues || {},
      listType: rawConfig.listType || 'Iterable',
      withTypes: rawConfig.withTypes || false,
      package: rawConfig.package || defaultPackageName,
      scalars: buildScalarsFromConfig(_schema, rawConfig, KOTLIN_SCALARS),
      omitJvmStatic: rawConfig.omitJvmStatic || false,
    });
  }

  public getPackageName(): string {
    return `package ${this.config.package}\n`;
  }

  protected getEnumValue(enumName: string, enumOption: string): string {
    if (
      this.config.enumValues[enumName] &&
      typeof this.config.enumValues[enumName] === 'object' &&
      this.config.enumValues[enumName][enumOption]
    ) {
      return this.config.enumValues[enumName][enumOption];
    }

    return enumOption;
  }

  EnumValueDefinition(node: EnumValueDefinitionNode): (enumName: string) => string {
    return (enumName: string) => {
      return indent(
        `${this.convertName(node, { useTypesPrefix: false, transformUnderscore: true })}("${this.getEnumValue(
          enumName,
          node.name.value
        )}")`
      );
    };
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const comment = transformComment(node.description, 0);
    const enumName = this.convertName(node.name);
    const enumValues = indentMultiline(
      node.values.map(enumValue => (enumValue as any)(node.name.value)).join(',\n') + ';',
      2
    );

    return `${comment}enum class ${enumName}(val label: String) {
${enumValues}
        
  companion object {
    ${this.config.omitJvmStatic ? '' : '@JvmStatic'}
    fun valueOfLabel(label: String): ${enumName}? {
      return values().find { it.label == label }
    }
  }
}`;
  }

  protected resolveInputFieldType(typeNode: TypeNode): {
    baseType: string;
    typeName: string;
    isScalar: boolean;
    isArray: boolean;
    nullable: boolean;
  } {
    const innerType = getBaseTypeNode(typeNode);
    const schemaType = this._schema.getType(innerType.name.value);
    const isArray =
      typeNode.kind === Kind.LIST_TYPE ||
      (typeNode.kind === Kind.NON_NULL_TYPE && typeNode.type.kind === Kind.LIST_TYPE);
    let result: { baseType: string; typeName: string; isScalar: boolean; isArray: boolean; nullable: boolean } = null;
    const nullable = typeNode.kind !== Kind.NON_NULL_TYPE;

    if (isScalarType(schemaType)) {
      if (this.config.scalars[schemaType.name]) {
        result = {
          baseType: this.scalars[schemaType.name],
          typeName: this.scalars[schemaType.name],
          isScalar: true,
          isArray,
          nullable,
        };
      } else {
        result = { isArray, baseType: 'Any', typeName: 'Any', isScalar: true, nullable };
      }
    } else if (isInputObjectType(schemaType)) {
      const convertedName = this.convertName(schemaType.name);
      const typeName = convertedName.endsWith('Input') ? convertedName : `${convertedName}Input`;
      result = {
        baseType: typeName,
        typeName,
        isScalar: false,
        isArray,
        nullable,
      };
    } else if (isEnumType(schemaType) || isObjectType(schemaType)) {
      result = {
        isArray,
        baseType: this.convertName(schemaType.name),
        typeName: this.convertName(schemaType.name),
        isScalar: true,
        nullable,
      };
    } else {
      result = { isArray, baseType: 'Any', typeName: 'Any', isScalar: true, nullable };
    }

    if (result) {
      result.typeName = wrapTypeWithModifiers(result.typeName, typeNode, this.config.listType);
    }

    return result;
  }

  protected buildInputTransfomer(name: string, inputValueArray: ReadonlyArray<InputValueDefinitionNode>): string {
    const classMembers = inputValueArray
      .map(arg => {
        const typeToUse = this.resolveInputFieldType(arg.type);
        const initialValue = this.initialValue(typeToUse.typeName, arg.defaultValue);
        const initial = initialValue ? ` = ${initialValue}` : typeToUse.nullable ? ' = null' : '';

        return indent(`val ${arg.name.value}: ${typeToUse.typeName}${typeToUse.nullable ? '?' : ''}${initial}`, 2);
      })
      .join(',\n');
    let suppress = '';
    const ctorSet = inputValueArray
      .map(arg => {
        const typeToUse = this.resolveInputFieldType(arg.type);
        const initialValue = this.initialValue(typeToUse.typeName, arg.defaultValue);
        const fallback = initialValue ? ` ?: ${initialValue}` : '';

        if (typeToUse.isArray && !typeToUse.isScalar) {
          suppress = '@Suppress("UNCHECKED_CAST")\n  ';
          return indent(
            `args["${arg.name.value}"]${typeToUse.nullable || fallback ? '?' : '!!'}.let { ${arg.name.value} -> (${
              arg.name.value
            } as List<Map<String, Any>>).map { ${typeToUse.baseType}(it) } }${fallback}`,
            3
          );
        }
        if (typeToUse.isScalar) {
          return indent(
            `args["${arg.name.value}"] as ${typeToUse.typeName}${typeToUse.nullable || fallback ? '?' : ''}${fallback}`,
            3
          );
        }
        if (typeToUse.nullable || fallback) {
          suppress = '@Suppress("UNCHECKED_CAST")\n  ';
          return indent(
            `args["${arg.name.value}"]?.let { ${typeToUse.typeName}(it as Map<String, Any>) }${fallback}`,
            3
          );
        }
        suppress = '@Suppress("UNCHECKED_CAST")\n  ';
        return indent(`${typeToUse.typeName}(args["${arg.name.value}"] as Map<String, Any>)`, 3);
      })
      .join(',\n');

    // language=kotlin
    return `data class ${name}(
${classMembers}
) {
  ${suppress}constructor(args: Map<String, Any>) : this(
${ctorSet}
  )
}`;
  }

  protected buildTypeTransfomer(name: string, typeValueArray: ReadonlyArray<FieldDefinitionNode>): string {
    const classMembers = typeValueArray
      .map(arg => {
        if (!arg.type) {
          return '';
        }
        const typeToUse = this.resolveInputFieldType(arg.type);

        return indent(`val ${arg.name.value}: ${typeToUse.typeName}${typeToUse.nullable ? '?' : ''}`, 2);
      })
      .join(',\n');

    // language=kotlin
    return `data class ${name}(
${classMembers}
)`;
  }

  protected initialValue(typeName: string, defaultValue?: ValueNode): string | undefined {
    if (defaultValue) {
      if (
        defaultValue.kind === 'IntValue' ||
        defaultValue.kind === 'FloatValue' ||
        defaultValue.kind === 'BooleanValue'
      ) {
        return `${defaultValue.value}`;
      }
      if (defaultValue.kind === 'StringValue') {
        return `"""${defaultValue.value}""".trimIndent()`;
      }
      if (defaultValue.kind === 'EnumValue') {
        return `${typeName}.${defaultValue.value}`;
      }
      if (defaultValue.kind === 'ListValue') {
        const list = defaultValue.values
          .map(value => {
            return this.initialValue(typeName, value);
          })
          .join(', ');
        return `listOf(${list})`;
      }
      // Variable
      // ObjectValue
      // ObjectField
    }

    return undefined;
  }

  FieldDefinition(node: FieldDefinitionNode): FieldDefinitionReturnType {
    if (node.arguments.length > 0) {
      const inputTransformer = (typeName: string) => {
        const transformerName = `${this.convertName(typeName, { useTypesPrefix: true })}${this.convertName(
          node.name.value,
          { useTypesPrefix: false }
        )}Args`;

        return this.buildInputTransfomer(transformerName, node.arguments);
      };

      return { node, inputTransformer };
    }
    return { node };
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    const convertedName = this.convertName(node);
    const name = convertedName.endsWith('Input') ? convertedName : `${convertedName}Input`;

    return this.buildInputTransfomer(name, node.fields);
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    const name = this.convertName(node);
    const fields = node.fields as unknown as FieldDefinitionReturnType[];

    const fieldNodes = [];
    const argsTypes = [];
    fields.forEach(({ node, inputTransformer }) => {
      if (node) {
        fieldNodes.push(node);
      }
      if (inputTransformer) {
        argsTypes.push(inputTransformer);
      }
    });

    let types = argsTypes.map(f => (f as any)(node.name.value)).filter(r => r);
    if (this.config.withTypes) {
      types = types.concat([this.buildTypeTransfomer(name, fieldNodes)]);
    }
    return types.join('\n');
  }
}
