import {
  ParsedConfig,
  BaseVisitor,
  EnumValuesMap,
  indentMultiline,
  indent,
  getBaseTypeNode,
  buildScalarsFromConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { JavaResolversPluginRawConfig } from './config.js';
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
  classMembersPrefix: string;
  useEmptyCtor: boolean;
}

export class JavaResolversVisitor extends BaseVisitor<JavaResolversPluginRawConfig, JavaResolverParsedConfig> {
  private _addHashMapImport = false;
  private _addMapImport = false;
  private _addListImport = false;

  constructor(rawConfig: JavaResolversPluginRawConfig, private _schema: GraphQLSchema, defaultPackageName: string) {
    super(rawConfig, {
      enumValues: rawConfig.enumValues || {},
      listType: rawConfig.listType || 'Iterable',
      className: rawConfig.className || 'Types',
      classMembersPrefix: rawConfig.classMembersPrefix || '',
      package: rawConfig.package || defaultPackageName,
      scalars: buildScalarsFromConfig(_schema, rawConfig, JAVA_SCALARS, 'Object'),
      useEmptyCtor: rawConfig.useEmptyCtor || false,
    });
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
      return indent(`${this.getEnumValue(enumName, node.name.value)}`);
    };
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    this._addHashMapImport = true;
    this._addMapImport = true;
    const enumName = this.convertName(node.name);
    const enumValues = node.values
      .map(enumValue => {
        const a = (enumValue as any)(node.name.value);
        // replace reserved word new
        if (a.trim() === 'new') {
          return '_new';
        }
        return a;
      })
      .join(',\n');
    const enumCtor = indentMultiline(``);

    const enumBlock = [enumValues, enumCtor].join('\n');

    return new JavaDeclarationBlock()
      .access('public')
      .asKind('enum')
      .withComment(node.description)
      .withName(enumName)
      .withBlock(enumBlock).string;
  }

  protected resolveInputFieldType(typeNode: TypeNode): {
    baseType: string;
    typeName: string;
    isScalar: boolean;
    isArray: boolean;
    isEnum: boolean;
  } {
    const innerType = getBaseTypeNode(typeNode);
    const schemaType = this._schema.getType(innerType.name.value);
    const isArray =
      typeNode.kind === Kind.LIST_TYPE ||
      (typeNode.kind === Kind.NON_NULL_TYPE && typeNode.type.kind === Kind.LIST_TYPE);
    let result: { baseType: string; typeName: string; isScalar: boolean; isArray: boolean; isEnum: boolean };

    if (isScalarType(schemaType)) {
      if (this.scalars[schemaType.name]) {
        result = {
          baseType: this.scalars[schemaType.name],
          typeName: this.scalars[schemaType.name],
          isScalar: true,
          isEnum: false,
          isArray,
        };
      } else {
        result = { isArray, baseType: 'Object', typeName: 'Object', isScalar: true, isEnum: false };
      }
    } else if (isInputObjectType(schemaType)) {
      const convertedName = this.convertName(schemaType.name);
      const typeName = convertedName.endsWith('Input') ? convertedName : `${convertedName}Input`;
      result = {
        baseType: typeName,
        typeName,
        isScalar: false,
        isEnum: false,
        isArray,
      };
    } else if (isEnumType(schemaType)) {
      result = {
        isArray,
        baseType: this.convertName(schemaType.name),
        typeName: this.convertName(schemaType.name),
        isScalar: false,
        isEnum: true,
      };
    } else {
      result = { isArray, baseType: 'Object', typeName: 'Object', isScalar: true, isEnum: false };
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

        if (arg.name.value === 'interface' || arg.name.value === 'new') {
          // forcing prefix of _ since interface is a keyword in JAVA
          return indent(`private ${typeToUse.typeName} _${this.config.classMembersPrefix}${arg.name.value};`);
        }
        return indent(`private ${typeToUse.typeName} ${this.config.classMembersPrefix}${arg.name.value};`);
      })
      .join('\n');
    const ctorSet = inputValueArray
      .map(arg => {
        const typeToUse = this.resolveInputFieldType(arg.type);

        if (typeToUse.isArray && !typeToUse.isScalar) {
          this._addListImport = true;
          if (typeToUse.isEnum) {
            return indentMultiline(
              `if (args.get("${arg.name.value}") != null) {
		this.${this.config.classMembersPrefix}${arg.name.value} = ((List<Object>) args.get("${arg.name.value}")).stream()
				.map(item -> item instanceof ${typeToUse.baseType} ? item : ${typeToUse.baseType}.valueOf((String) item))
				.map(${typeToUse.baseType}.class::cast)
				.collect(Collectors.toList());
}`,
              3
            );
          }
          return indentMultiline(
            `if (args.get("${arg.name.value}") != null) {
		this.${arg.name.value} = (${this.config.listType}<${typeToUse.baseType}>) args.get("${arg.name.value}");
}`,
            3
          );
        }
        if (typeToUse.isScalar) {
          return indent(
            `this.${this.config.classMembersPrefix}${arg.name.value} = (${typeToUse.typeName}) args.get("${arg.name.value}");`,
            3
          );
        }
        if (typeToUse.isEnum) {
          return indentMultiline(
            `if (args.get("${arg.name.value}") instanceof ${typeToUse.typeName}) {
  this.${this.config.classMembersPrefix}${arg.name.value} = (${typeToUse.typeName}) args.get("${arg.name.value}");
} else {
  this.${this.config.classMembersPrefix}${arg.name.value} = ${typeToUse.typeName}.valueOf((String) args.get("${arg.name.value}"));
}`,
            3
          );
        }
        if (arg.name.value === 'interface') {
          // forcing prefix of _ since interface is a keyword in JAVA
          return indent(
            `this._${this.config.classMembersPrefix}${arg.name.value} = new ${typeToUse.typeName}((Map<String, Object>) args.get("${arg.name.value}"));`,
            3
          );
        }
        return indent(
          `this.${this.config.classMembersPrefix}${arg.name.value} = new ${typeToUse.typeName}((Map<String, Object>) args.get("${arg.name.value}"));`,
          3
        );
      })
      .join('\n');

    const getters = inputValueArray
      .map(arg => {
        const typeToUse = this.resolveInputFieldType(arg.type);

        if (arg.name.value === 'interface' || arg.name.value === 'new') {
          // forcing prefix of _ since interface is a keyword in JAVA
          return indent(
            `public ${typeToUse.typeName} get${this.convertName(arg.name.value)}() { return this._${
              this.config.classMembersPrefix
            }${arg.name.value}; }`
          );
        }
        return indent(
          `public ${typeToUse.typeName} get${this.convertName(arg.name.value)}() { return this.${
            this.config.classMembersPrefix
          }${arg.name.value}; }`
        );
      })
      .join('\n');

    const setters = inputValueArray
      .map(arg => {
        const typeToUse = this.resolveInputFieldType(arg.type);

        if (arg.name.value === 'interface' || arg.name.value === 'new') {
          return indent(
            `public void set${this.convertName(arg.name.value)}(${typeToUse.typeName} _${arg.name.value}) { this._${
              arg.name.value
            } = _${arg.name.value}; }`
          );
        }
        return indent(
          `public void set${this.convertName(arg.name.value)}(${typeToUse.typeName} ${arg.name.value}) { this.${
            arg.name.value
          } = ${arg.name.value}; }`
        );
      })
      .join('\n');

    if (this.config.useEmptyCtor) {
      return `public static class ${name} {
${classMembers}

  public ${name}() {}

${getters}
${setters}
}`;
    }
    return `public static class ${name} {
${classMembers}

  public ${name}(Map<String, Object> args) {
    if (args != null) {
${ctorSet}
    }
  }

${getters}
${setters}
}`;
  }

  FieldDefinition(node: FieldDefinitionNode): (typeName: string) => string {
    return (typeName: string) => {
      if (node.arguments.length > 0) {
        const transformerName = `${this.convertName(typeName, { useTypesPrefix: true })}${this.convertName(
          node.name.value,
          { useTypesPrefix: false }
        )}Args`;

        return this.buildInputTransfomer(transformerName, node.arguments);
      }

      return null;
    };
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    const convertedName = this.convertName(node);
    const name = convertedName.endsWith('Input') ? convertedName : `${convertedName}Input`;

    return this.buildInputTransfomer(name, node.fields);
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    const fieldsArguments = node.fields.map(f => (f as any)(node.name.value)).filter(r => r);

    return fieldsArguments.join('\n');
  }
}
