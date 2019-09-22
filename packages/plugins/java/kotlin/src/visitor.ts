import { BaseVisitor, buildScalars, EnumValuesMap, indent, indentMultiline, ParsedConfig, transformComment } from '@graphql-codegen/visitor-plugin-common';
import { KotlinResolversPluginRawConfig } from './index';
import {
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  GraphQLNullableType,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  isEnumType,
  isInputObjectType,
  isNullableType,
  isScalarType,
  Kind,
  NamedTypeNode,
  ObjectTypeDefinitionNode,
  TypeNode,
} from 'graphql';
import { KOTLIN_SCALARS, wrapTypeWithModifiers } from '@graphql-codegen/java-common';

export interface KotlinResolverParsedConfig extends ParsedConfig {
  package: string;
  listType: string;
  enumValues: EnumValuesMap;
}

export class KotlinResolversVisitor extends BaseVisitor<KotlinResolversPluginRawConfig, KotlinResolverParsedConfig> {
  constructor(rawConfig: KotlinResolversPluginRawConfig, private _schema: GraphQLSchema, defaultPackageName: string) {
    super(rawConfig, {
      enumValues: rawConfig.enumValues || {},
      listType: rawConfig.listType || 'Iterable',
      package: rawConfig.package || defaultPackageName,
      scalars: buildScalars(_schema, rawConfig.scalars, KOTLIN_SCALARS),
    });
  }

  public getPackageName(): string {
    return `package ${this.config.package}\n`;
  }

  protected getEnumValue(enumName: string, enumOption: string): string {
    if (this.config.enumValues[enumName] && typeof this.config.enumValues[enumName] === 'object' && this.config.enumValues[enumName][enumOption]) {
      return this.config.enumValues[enumName][enumOption];
    }

    return enumOption;
  }

  EnumValueDefinition(node: EnumValueDefinitionNode): (enumName: string) => string {
    return (enumName: string) => {
      return indent(`${this.convertName(node, { useTypesPrefix: false, transformUnderscore: true })}("${this.getEnumValue(enumName, node.name.value)}")`);
    };
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const comment = transformComment(node.description, 0);
    const enumName = this.convertName(node.name);
    const enumValues = indentMultiline(node.values.map(enumValue => (enumValue as any)(node.name.value)).join(',\n') + ';', 2);

    return `${comment}enum class ${enumName}(val label: String) {
${enumValues}
        
  companion object {
    @JvmStatic
    fun valueOfLabel(label: String): ${enumName}? {
      return values().find { it.label == label }
    }
  }
}`;
  }

  protected extractInnerType(typeNode: TypeNode): NamedTypeNode {
    if (typeNode.kind === Kind.NON_NULL_TYPE || typeNode.kind === Kind.LIST_TYPE) {
      return this.extractInnerType(typeNode.type);
    } else {
      return typeNode;
    }
  }

  protected resolveInputFieldType(typeNode: TypeNode): { baseType: string; typeName: string; isScalar: boolean; isArray: boolean; nullable: boolean } {
    const innerType = this.extractInnerType(typeNode);
    const schemaType = this._schema.getType(innerType.name.value);
    const isArray = typeNode.kind === Kind.LIST_TYPE || (typeNode.kind === Kind.NON_NULL_TYPE && typeNode.type.kind === Kind.LIST_TYPE);
    let result: { baseType: string; typeName: string; isScalar: boolean; isArray: boolean; nullable: boolean } = null;
    const nullable = typeNode.kind !== Kind.NON_NULL_TYPE;

    if (isScalarType(schemaType)) {
      if (this.config.scalars[schemaType.name]) {
        result = {
          baseType: this.scalars[schemaType.name],
          typeName: this.scalars[schemaType.name],
          isScalar: true,
          isArray,
          nullable: nullable,
        };
      } else {
        result = { isArray, baseType: 'Any', typeName: 'Any', isScalar: true, nullable: nullable };
      }
    } else if (isInputObjectType(schemaType)) {
      result = {
        baseType: `${this.convertName(schemaType.name)}Input`,
        typeName: `${this.convertName(schemaType.name)}Input`,
        isScalar: false,
        isArray,
        nullable: nullable,
      };
    } else if (isEnumType(schemaType)) {
      result = { isArray, baseType: this.convertName(schemaType.name), typeName: this.convertName(schemaType.name), isScalar: true, nullable: nullable };
    } else {
      result = { isArray, baseType: 'Any', typeName: 'Any', isScalar: true, nullable: nullable };
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

        return indent(`val ${arg.name.value}: ${typeToUse.typeName}${typeToUse.nullable ? '? = null' : ''}`, 2);
      })
      .join(',\n');
    const ctorSet = inputValueArray
      .map(arg => {
        const typeToUse = this.resolveInputFieldType(arg.type);

        if (typeToUse.isArray && !typeToUse.isScalar) {
          return indent(`args["${arg.name.value}"]${typeToUse.nullable ? '?' : '!!'}.let { ${arg.name.value} -> (${arg.name.value} as List<Map<String, Any>>).map { ${typeToUse.baseType}(it) } }`, 3);
        } else if (typeToUse.isScalar) {
          return indent(`args["${arg.name.value}"] as ${typeToUse.typeName}${typeToUse.nullable ? '?' : ''}`, 3);
        } else {
          return indent(`args["${arg.name.value}"]${typeToUse.nullable ? '?' : '!!'}.let { ${typeToUse.typeName}(it as Map<String, Any>) }`, 3);
        }
      })
      .join(',\n');

    // language=kotlin
    return `data class ${name}(
${classMembers}
) {
  constructor(args: Map<String, Any>) : this(
${ctorSet}
  )
}`;
  }

  FieldDefinition(node: FieldDefinitionNode): (typeName: string) => string {
    return (typeName: string) => {
      if (node.arguments.length > 0) {
        const transformerName = `${this.convertName(typeName, { useTypesPrefix: true })}${this.convertName(node.name.value, { useTypesPrefix: false })}Args`;

        return this.buildInputTransfomer(transformerName, node.arguments);
      }

      return null;
    };
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    const name = `${this.convertName(node)}Input`;

    return this.buildInputTransfomer(name, node.fields);
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    const fieldsArguments = node.fields.map(f => (f as any)(node.name.value)).filter(r => r);

    return fieldsArguments.join('\n');
  }
}
