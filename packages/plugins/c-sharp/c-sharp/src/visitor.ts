import {
  ParsedConfig,
  BaseVisitor,
  EnumValuesMap,
  indentMultiline,
  indent,
  buildScalars,
  getBaseTypeNode,
} from '@graphql-codegen/visitor-plugin-common';
import { CSharpResolversPluginRawConfig } from './config';
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
  NameNode,
  NamedTypeNode,
} from 'graphql';
import {
  C_SHARP_SCALARS,
  CSharpDeclarationBlock,
  transformComment,
  isValueType,
  getListInnerTypeNode,
  CSharpFieldType,
  csharpKeywords,
  wrapFieldType,
  getListTypeField,
} from '../../common/common';

export interface CSharpResolverParsedConfig extends ParsedConfig {
  namespaceName: string;
  className: string;
  listType: string;
  enumValues: EnumValuesMap;
  emitRecords: boolean;
}

export class CSharpResolversVisitor extends BaseVisitor<CSharpResolversPluginRawConfig, CSharpResolverParsedConfig> {
  private readonly keywords = new Set(csharpKeywords);

  constructor(rawConfig: CSharpResolversPluginRawConfig, private _schema: GraphQLSchema) {
    super(rawConfig, {
      enumValues: rawConfig.enumValues || {},
      listType: rawConfig.listType || 'List',
      namespaceName: rawConfig.namespaceName || 'GraphQLCodeGen',
      className: rawConfig.className || 'Types',
      emitRecords: rawConfig.emitRecords || false,
      scalars: buildScalars(_schema, rawConfig.scalars, C_SHARP_SCALARS),
    });
  }

  /**
   * Checks name against list of keywords. If it is, will prefix value with @
   *
   * Note:
   * This class should first invoke the convertName from base-visitor to convert the string or node
   * value according the naming configuration, eg upper or lower case. Then resulting string checked
   * against the list or keywords.
   * However the generated C# code is not yet able to handle fields that are in a different case so
   * the invocation of convertName is omitted purposely.
   */
  private convertSafeName(node: NameNode | string): string {
    const name = typeof node === 'string' ? node : node.value;
    return this.keywords.has(name) ? `@${name}` : name;
  }

  public getImports(): string {
    const allImports = ['System', 'System.Collections.Generic', 'Newtonsoft.Json', 'GraphQL'];
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
      .withName(this.convertSafeName(this.config.className))
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
      const enumOption = this.convertSafeName(node.name);
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

    if (node.kind === Kind.FIELD_DEFINITION) {
      attributes.push(`[JsonProperty("${node.name.value}")]`);
    }

    if (node.kind === Kind.INPUT_VALUE_DEFINITION && fieldType.isOuterTypeRequired) {
      attributes.push(`[JsonRequired]`);
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
        //const fieldHeader = this.getFieldHeader(arg, fieldType);
        const fieldName = this.convertSafeName(arg.name);
        const csharpFieldType = wrapFieldType(fieldType, fieldType.listType, this.config.listType);
        return `${csharpFieldType} ${fieldName}`;
      })
      .join(', ');

    return `${classSummary}public record ${this.convertSafeName(name)}(${recordMembers})${interfaceImpl};`;
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
        const fieldName = this.convertSafeName(arg.name);
        const csharpFieldType = wrapFieldType(fieldType, fieldType.listType, this.config.listType);
        return fieldHeader + indent(`public ${csharpFieldType} ${fieldName} { get; set; }`);
      })
      .join('\n\n');

    return `
#region ${name}
${classSummary}public class ${this.convertSafeName(name)}${interfaceImpl} {
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
        const fieldName = this.convertSafeName(arg.name);
        const csharpFieldType = wrapFieldType(fieldType, fieldType.listType, this.config.listType);
        return fieldHeader + indent(`public ${csharpFieldType} ${fieldName} { get; set; }`);
      })
      .join('\n\n');

    return `
${classSummary}public interface ${this.convertSafeName(name)} {
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
        const fieldName = this.convertSafeName(arg.name);
        const csharpFieldType = wrapFieldType(fieldType, fieldType.listType, this.config.listType);
        return fieldHeader + indent(`public ${csharpFieldType} ${fieldName} { get; set; }`);
      })
      .join('\n\n');

    return `
#region ${name}
${classSummary}public class ${this.convertSafeName(name)} {
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

      var requiredProp = propertyInfo.GetCustomAttributes(typeof(JsonRequiredAttribute), false).Length > 0;
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
    return this.buildClass(node.name.value, node.description, node.fields, node.interfaces);
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): string {
    return this.buildInterface(node.name.value, node.description, node.fields);
  }
}
