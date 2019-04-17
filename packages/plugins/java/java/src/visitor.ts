import { ParsedConfig, BaseVisitor, EnumValuesMap, indentMultiline, indent } from '@graphql-codegen/visitor-plugin-common';
import { JavaResolversPluginRawConfig } from './index';
import {
  GraphQLSchema,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  InputObjectTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  TypeNode,
  Kind,
  NamedTypeNode,
  isScalarType,
  isInputObjectType,
  isEnumType,
} from 'graphql';
import { JAVA_SCALARS, JavaDeclarationBlock, wrapTypeWithModifiers } from '@graphql-codegen/java-common';

export interface JavaResolverParsedConfig extends ParsedConfig {
  package: string;
  className: string;
  listType: string;
  enumValues: EnumValuesMap;
}

export class JavaResolversVisitor extends BaseVisitor<JavaResolversPluginRawConfig, JavaResolverParsedConfig> {
  private _addHashMapImport = false;
  private _addMapImport = false;
  private _addListImport = false;

  constructor(rawConfig: JavaResolversPluginRawConfig, private _schema: GraphQLSchema, defaultPackageName: string) {
    super(
      rawConfig,
      {
        enumValues: rawConfig.enumValues || {},
        listType: rawConfig.listType || 'Iterable',
        className: rawConfig.className || 'Types',
        package: rawConfig.package || defaultPackageName,
      },
      JAVA_SCALARS
    );
  }

  public getImports(): string {
    const allImports = [];

    if (this._addHashMapImport) {
      allImports.push(`java.util.HashMap`);
    }

    if (this._addMapImport) {
      allImports.push(`java.util.Map`);
    }

    if (this._addListImport) {
      allImports.push(`java.util.List`);
      allImports.push(`java.util.stream.Collectors`);
    }

    return allImports.map(i => `import ${i};`).join('\n') + '\n';
  }

  public wrapWithClass(content: string): string {
    return new JavaDeclarationBlock()
      .access('public')
      .asKind('class')
      .withName(this.config.className)
      .withBlock(indentMultiline(content)).string;
  }

  public getPackageName(): string {
    return `package ${this.config.package};\n`;
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
    this._addHashMapImport = true;
    this._addMapImport = true;
    const enumName = this.convertName(node.name);
    const enumValues = node.values.map(enumValue => (enumValue as any)(node.name.value)).join(',\n') + ';';
    const enumCtor = indentMultiline(`
public final String label;
 
${enumName}(String label) {
  this.label = label;
}`);
    const valueOf = indentMultiline(`
private static final Map<String, ${enumName}> BY_LABEL = new HashMap<>();
  
static {
    for (${enumName} e : values()) {
        BY_LABEL.put(e.label, e);
    }
}

public static ${enumName} valueOfLabel(String label) {
  return BY_LABEL.get(label);
}`);
    const enumBlock = [enumValues, enumCtor, valueOf].join('\n');

    return new JavaDeclarationBlock()
      .access('public')
      .asKind('enum')
      .withComment(node.description)
      .withName(enumName)
      .withBlock(enumBlock).string;
  }

  protected extractInnerType(typeNode: TypeNode): NamedTypeNode {
    if (typeNode.kind === Kind.NON_NULL_TYPE || typeNode.kind === Kind.LIST_TYPE) {
      return this.extractInnerType(typeNode.type);
    } else {
      return typeNode;
    }
  }

  protected resolveInputFieldType(typeNode: TypeNode): { baseType: string; typeName: string; isScalar: boolean; isArray: boolean } {
    const innerType = this.extractInnerType(typeNode);
    const schemaType = this._schema.getType(innerType.name.value);
    const isArray = typeNode.kind === Kind.LIST_TYPE || (typeNode.kind === Kind.NON_NULL_TYPE && typeNode.type.kind === Kind.LIST_TYPE);
    let result: { baseType: string; typeName: string; isScalar: boolean; isArray: boolean } = null;

    if (isScalarType(schemaType)) {
      if (this.config.scalars[schemaType.name]) {
        result = {
          baseType: this.config.scalars[schemaType.name],
          typeName: this.config.scalars[schemaType.name],
          isScalar: true,
          isArray,
        };
      } else {
        result = { isArray, baseType: 'Object', typeName: 'Object', isScalar: true };
      }
    } else if (isInputObjectType(schemaType)) {
      result = {
        baseType: `${this.convertName(schemaType.name)}Input`,
        typeName: `${this.convertName(schemaType.name)}Input`,
        isScalar: false,
        isArray,
      };
    } else if (isEnumType(schemaType)) {
      result = { isArray, baseType: this.convertName(schemaType.name), typeName: this.convertName(schemaType.name), isScalar: true };
    } else {
      result = { isArray, baseType: 'Object', typeName: 'Object', isScalar: true };
    }

    if (result) {
      result.typeName = wrapTypeWithModifiers(result.typeName, typeNode, this.config.listType);
    }

    return result;
  }

  protected buildInputTransfomer(name: string, inputValueArray: ReadonlyArray<InputValueDefinitionNode>): string {
    this._addMapImport = true;

    const classMembers = inputValueArray
      .map(arg => {
        const typeToUse = this.resolveInputFieldType(arg.type);

        return indent(`private ${typeToUse.typeName} _${arg.name.value};`);
      })
      .join('\n');
    const ctorSet = inputValueArray
      .map(arg => {
        const typeToUse = this.resolveInputFieldType(arg.type);

        if (typeToUse.isArray && !typeToUse.isScalar) {
          this._addListImport = true;
          return indent(`this._${arg.name.value} = ((List<Map<String, Object>>) args.get("${arg.name.value}")).stream().map(${typeToUse.baseType}::new).collect(Collectors.toList());`, 3);
        } else if (typeToUse.isScalar) {
          return indent(`this._${arg.name.value} = (${typeToUse.typeName}) args.get("${arg.name.value}");`, 3);
        } else {
          return indent(`this._${arg.name.value} = new ${typeToUse.typeName}((Map<String, Object>) args.get("${arg.name.value}"));`, 3);
        }
      })
      .join('\n');
    const getters = inputValueArray
      .map(arg => {
        const typeToUse = this.resolveInputFieldType(arg.type);

        return indent(`public ${typeToUse.typeName} get${this.convertName(arg.name.value)}() { return this._${arg.name.value}; }`);
      })
      .join('\n');

    return `public static class ${name} {
${classMembers}

  public ${name}(Map<String, Object> args) {
    if (args != null) {
${ctorSet}
    }
  }

${getters}
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
