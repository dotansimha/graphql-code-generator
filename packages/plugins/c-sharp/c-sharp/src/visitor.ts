import {
  ParsedConfig,
  BaseVisitor,
  EnumValuesMap,
  indentMultiline,
  indent,
  getBaseTypeNode,
  buildScalarsFromConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { CSharpResolversPluginRawConfig } from './config.js';
import {
  GraphQLSchema,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  InputObjectTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  TypeNode,
  Kind,
  isScalarType,
  isInputObjectType,
  isEnumType,
  DirectiveNode,
  StringValueNode,
  NamedTypeNode,
} from 'graphql';
import {
  C_SHARP_SCALARS,
  CSharpDeclarationBlock,
  transformComment,
  isValueType,
  getListInnerTypeNode,
  CSharpFieldType,
  convertSafeName,
  wrapFieldType,
  getListTypeField,
} from '@graphql-codegen/c-sharp-common';
import { pascalCase } from 'change-case-all';
import {
  JsonAttributesSource,
  JsonAttributesSourceConfiguration,
  getJsonAttributeSourceConfiguration,
} from './json-attributes.js';

export interface CSharpResolverParsedConfig extends ParsedConfig {
  namespaceName: string;
  className: string;
  listType: string;
  enumValues: EnumValuesMap;
  emitRecords: boolean;
  emitJsonAttributes: boolean;
  jsonAttributesSource: JsonAttributesSource;
}

export class CSharpResolversVisitor extends BaseVisitor<CSharpResolversPluginRawConfig, CSharpResolverParsedConfig> {
  private readonly jsonAttributesConfiguration: JsonAttributesSourceConfiguration;

  constructor(rawConfig: CSharpResolversPluginRawConfig, private _schema: GraphQLSchema) {
    super(rawConfig, {
      enumValues: rawConfig.enumValues || {},
      listType: rawConfig.listType || 'List',
      namespaceName: rawConfig.namespaceName || 'GraphQLCodeGen',
      className: rawConfig.className || 'Types',
      emitRecords: rawConfig.emitRecords || false,
      emitJsonAttributes: rawConfig.emitJsonAttributes ?? true,
      jsonAttributesSource: rawConfig.jsonAttributesSource || 'Newtonsoft.Json',
      scalars: buildScalarsFromConfig(_schema, rawConfig, C_SHARP_SCALARS),
    });

    if (this._parsedConfig.emitJsonAttributes) {
      this.jsonAttributesConfiguration = getJsonAttributeSourceConfiguration(this._parsedConfig.jsonAttributesSource);
    }
  }

  public getImports(): string {
    const allImports = ['System', 'System.Collections.Generic', 'System.ComponentModel.DataAnnotations'];
    if (this._parsedConfig.emitJsonAttributes) {
      const jsonAttributesNamespace = this.jsonAttributesConfiguration.namespace;
      allImports.push(jsonAttributesNamespace);
    }
    return allImports.map(i => `using ${i};`).join('\n') + '\n';
  }

  public wrapWithNamespace(content: string): string {
    return new CSharpDeclarationBlock()
      .asKind('namespace')
      .withName(this.config.namespaceName)
      .withBlock(indentMultiline(content)).string;
  }

  public wrapWithClass(content: string): string {
    return new CSharpDeclarationBlock()
      .access('public')
      .asKind('class')
      .withName(convertSafeName(this.config.className))
      .withBlock(indentMultiline(content)).string;
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
      const enumHeader = this.getFieldHeader(node);
      const enumOption = convertSafeName(node.name);
      return enumHeader + indent(this.getEnumValue(enumName, enumOption));
    };
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumName = this.convertName(node.name);
    const enumValues = node.values.map(enumValue => (enumValue as any)(node.name.value)).join(',\n');
    const enumBlock = [enumValues].join('\n');

    return new CSharpDeclarationBlock()
      .access('public')
      .asKind('enum')
      .withComment(node.description)
      .withName(enumName)
      .withBlock(enumBlock).string;
  }

  getFieldHeader(
    node: InputValueDefinitionNode | FieldDefinitionNode | EnumValueDefinitionNode,
    fieldType?: CSharpFieldType
  ): string {
    const attributes = [];
    const commentText = transformComment(node.description?.value);

    const deprecationDirective = node.directives.find(v => v.name?.value === 'deprecated');
    if (deprecationDirective) {
      const deprecationReason = this.getDeprecationReason(deprecationDirective);
      attributes.push(`[Obsolete("${deprecationReason}")]`);
    }

    if (this._parsedConfig.emitJsonAttributes && node.kind === Kind.FIELD_DEFINITION) {
      const jsonPropertyAttribute = this.jsonAttributesConfiguration.propertyAttribute;
      if (jsonPropertyAttribute != null) {
        attributes.push(`[${jsonPropertyAttribute}("${node.name.value}")]`);
      }
    }

    if (node.kind === Kind.INPUT_VALUE_DEFINITION && fieldType.isOuterTypeRequired) {
      // Should be always inserted for required fields to use in `GetInputObject()` when JSON attributes are not used
      // or there are no JSON attributes in selected attribute source that provides `JsonRequired` alternative
      attributes.push('[Required]');
      if (this._parsedConfig.emitJsonAttributes) {
        const jsonRequiredAttribute = this.jsonAttributesConfiguration.requiredAttribute;
        if (jsonRequiredAttribute != null) {
          attributes.push(`[${jsonRequiredAttribute}]`);
        }
      }
    }

    if (commentText || attributes.length > 0) {
      const summary = commentText ? indentMultiline(commentText.trimRight()) + '\n' : '';
      const attributeLines =
        attributes.length > 0
          ? attributes
              .map(attr => indent(attr))
              .concat('')
              .join('\n')
          : '';
      return summary + attributeLines;
    }
    return '';
  }

  getDeprecationReason(directive: DirectiveNode): string {
    if (directive.name.value !== 'deprecated') {
      return '';
    }
    const hasArguments = directive.arguments.length > 0;
    let reason = 'Field no longer supported';
    if (hasArguments && directive.arguments[0].value.kind === Kind.STRING) {
      reason = directive.arguments[0].value.value;
    }
    return reason;
  }

  protected resolveInputFieldType(typeNode: TypeNode, hasDefaultValue: Boolean = false): CSharpFieldType {
    const innerType = getBaseTypeNode(typeNode);
    const schemaType = this._schema.getType(innerType.name.value);
    const listType = getListTypeField(typeNode);
    const required = getListInnerTypeNode(typeNode).kind === Kind.NON_NULL_TYPE;

    let result: CSharpFieldType = null;

    if (isScalarType(schemaType)) {
      if (this.scalars[schemaType.name]) {
        const baseType = this.scalars[schemaType.name];
        result = new CSharpFieldType({
          baseType: {
            type: baseType,
            required,
            valueType: isValueType(baseType),
          },
          listType,
        });
      } else {
        result = new CSharpFieldType({
          baseType: {
            type: 'object',
            required,
            valueType: false,
          },
          listType,
        });
      }
    } else if (isInputObjectType(schemaType)) {
      result = new CSharpFieldType({
        baseType: {
          type: `${this.convertName(schemaType.name)}`,
          required,
          valueType: false,
        },
        listType,
      });
    } else if (isEnumType(schemaType)) {
      result = new CSharpFieldType({
        baseType: {
          type: this.convertName(schemaType.name),
          required,
          valueType: true,
        },
        listType,
      });
    } else {
      result = new CSharpFieldType({
        baseType: {
          type: `${schemaType.name}`,
          required,
          valueType: false,
        },
        listType,
      });
    }

    if (hasDefaultValue) {
      // Required field is optional when default value specified, see #4273
      (result.listType || result.baseType).required = false;
    }

    return result;
  }

  protected buildRecord(
    name: string,
    description: StringValueNode,
    inputValueArray: ReadonlyArray<FieldDefinitionNode>,
    interfaces?: ReadonlyArray<NamedTypeNode>
  ): string {
    const classSummary = transformComment(description?.value);
    const interfaceImpl =
      interfaces && interfaces.length > 0 ? ` : ${interfaces.map(ntn => ntn.name.value).join(', ')}` : '';
    const recordMembers = inputValueArray
      .map(arg => {
        const fieldType = this.resolveInputFieldType(arg.type);
        const fieldHeader = this.getFieldHeader(arg, fieldType);
        const fieldName = convertSafeName(pascalCase(this.convertName(arg.name)));
        const csharpFieldType = wrapFieldType(fieldType, fieldType.listType, this.config.listType);
        return fieldHeader + indent(`public ${csharpFieldType} ${fieldName} { get; init; } = ${fieldName};`);
      })
      .join('\n\n');
    const recordInitializer = inputValueArray
      .map(arg => {
        const fieldType = this.resolveInputFieldType(arg.type);
        const fieldName = convertSafeName(pascalCase(this.convertName(arg.name)));
        const csharpFieldType = wrapFieldType(fieldType, fieldType.listType, this.config.listType);
        return `${csharpFieldType} ${fieldName}`;
      })
      .join(', ');
    return `
#region ${name}
${classSummary}public record ${convertSafeName(name)}(${recordInitializer})${interfaceImpl} {
  #region members
${recordMembers}
  #endregion
}
#endregion`;
  }

  protected buildClass(
    name: string,
    description: StringValueNode,
    inputValueArray: ReadonlyArray<FieldDefinitionNode>,
    interfaces?: ReadonlyArray<NamedTypeNode>
  ): string {
    const classSummary = transformComment(description?.value);
    const interfaceImpl =
      interfaces && interfaces.length > 0 ? ` : ${interfaces.map(ntn => ntn.name.value).join(', ')}` : '';
    const classMembers = inputValueArray
      .map(arg => {
        const fieldType = this.resolveInputFieldType(arg.type);
        const fieldHeader = this.getFieldHeader(arg, fieldType);
        const fieldName = convertSafeName(arg.name);
        const csharpFieldType = wrapFieldType(fieldType, fieldType.listType, this.config.listType);
        return fieldHeader + indent(`public ${csharpFieldType} ${fieldName} { get; set; }`);
      })
      .join('\n\n');

    return `
#region ${name}
${classSummary}public class ${convertSafeName(name)}${interfaceImpl} {
  #region members
${classMembers}
  #endregion
}
#endregion`;
  }

  protected buildInterface(
    name: string,
    description: StringValueNode,
    inputValueArray: ReadonlyArray<FieldDefinitionNode>
  ): string {
    const classSummary = transformComment(description?.value);
    const classMembers = inputValueArray
      .map(arg => {
        const fieldType = this.resolveInputFieldType(arg.type);
        const fieldHeader = this.getFieldHeader(arg, fieldType);

        let fieldName: string;
        let getterSetter: string;

        if (this.config.emitRecords) {
          // record
          fieldName = convertSafeName(pascalCase(this.convertName(arg.name)));
          getterSetter = '{ get; }';
        } else {
          // class
          fieldName = convertSafeName(arg.name);
          getterSetter = '{ get; set; }';
        }

        const csharpFieldType = wrapFieldType(fieldType, fieldType.listType, this.config.listType);

        return fieldHeader + indent(`${csharpFieldType} ${fieldName} ${getterSetter}`);
      })
      .join('\n\n');

    return `
${classSummary}public interface ${convertSafeName(name)} {
${classMembers}
}`;
  }

  protected buildInputTransformer(
    name: string,
    description: StringValueNode,
    inputValueArray: ReadonlyArray<InputValueDefinitionNode>
  ): string {
    const classSummary = transformComment(description?.value);
    const classMembers = inputValueArray
      .map(arg => {
        const fieldType = this.resolveInputFieldType(arg.type, !!arg.defaultValue);
        const fieldHeader = this.getFieldHeader(arg, fieldType);
        const fieldName = convertSafeName(arg.name);
        const csharpFieldType = wrapFieldType(fieldType, fieldType.listType, this.config.listType);
        return fieldHeader + indent(`public ${csharpFieldType} ${fieldName} { get; set; }`);
      })
      .join('\n\n');

    return `
#region ${name}
${classSummary}public class ${convertSafeName(name)} {
  #region members
${classMembers}
  #endregion

  #region methods
  public dynamic GetInputObject()
  {
    IDictionary<string, object> d = new System.Dynamic.ExpandoObject();

    var properties = GetType().GetProperties(System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public);
    foreach (var propertyInfo in properties)
    {
      var value = propertyInfo.GetValue(this);
      var defaultValue = propertyInfo.PropertyType.IsValueType ? Activator.CreateInstance(propertyInfo.PropertyType) : null;
${
  this._parsedConfig.emitJsonAttributes && this.jsonAttributesConfiguration.requiredAttribute != null
    ? `
      var requiredProp = propertyInfo.GetCustomAttributes(typeof(${this.jsonAttributesConfiguration.requiredAttribute}Attribute), false).Length > 0;
`
    : `
      var requiredProp = propertyInfo.GetCustomAttributes(typeof(RequiredAttribute), false).Length > 0;
`
}
      if (requiredProp || value != defaultValue)
      {
        d[propertyInfo.Name] = value;
      }
    }
    return d;
  }
  #endregion
}
#endregion`;
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    const name = `${this.convertName(node)}`;
    return this.buildInputTransformer(name, node.description, node.fields);
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    if (this.config.emitRecords) {
      return this.buildRecord(node.name.value, node.description, node.fields, node.interfaces);
    }

    return this.buildClass(node.name.value, node.description, node.fields, node.interfaces);
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): string {
    return this.buildInterface(node.name.value, node.description, node.fields);
  }
}
