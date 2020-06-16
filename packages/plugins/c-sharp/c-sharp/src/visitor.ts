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
  ValueNode,
  DirectiveNode,
  StringValueNode,
} from 'graphql';
import { 
  C_SHARP_SCALARS,
  CSharpDeclarationBlock,
  wrapTypeWithModifiers,
  transformComment,
  isValueType,
} from './common/common';

export interface CSharpResolverParsedConfig extends ParsedConfig {
  className: string;
  listType: string;
  enumValues: EnumValuesMap;
}

export class CSharpResolversVisitor extends BaseVisitor<CSharpResolversPluginRawConfig, CSharpResolverParsedConfig> {
  constructor(rawConfig: CSharpResolversPluginRawConfig, private _schema: GraphQLSchema, defaultPackageName: string) {
    super(rawConfig, {
      enumValues: rawConfig.enumValues || {},
      listType: rawConfig.listType || 'List',
      className: rawConfig.className || 'Types',
      scalars: buildScalars(_schema, rawConfig.scalars, C_SHARP_SCALARS),
    });
  }

  public getImports(): string {
    const allImports = ['System', 'System.Collections.Generic', 'Newtonsoft.Json', 'GraphQL'];
    return allImports.map(i => `using ${i};`).join('\n') + '\n';
  }

  public wrapWithNamespace(content: string): string {
    return new CSharpDeclarationBlock()
      .asKind('namespace')
      .withName('GraphQLCodeGen')
      .withBlock(indentMultiline(content)).string;
  }

  public wrapWithClass(content: string): string {
    return new CSharpDeclarationBlock()
      .access('public')
      .asKind('class')
      .withName(this.config.className)
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
      return (
        enumHeader +
        indent(`${this.getEnumValue(enumName, node.name.value)}`)
      );
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
  
  getFieldHeader(node: InputValueDefinitionNode | FieldDefinitionNode | EnumValueDefinitionNode): string {
    const attributes = [];
    const commentText = transformComment(node.description?.value);

    const deprecationDirective = node.directives.find((v) => v.name?.value === 'deprecated');
    if (deprecationDirective) {
        const deprecationReason = this.getDeprecationReason(deprecationDirective);
        attributes.push(`[Obsolete("${deprecationReason}")]`);
    }

    if (node.kind === Kind.FIELD_DEFINITION) {
      attributes.push(`[JsonProperty("${node.name.value}")]`);
    }

    if (node.kind === Kind.INPUT_VALUE_DEFINITION && node.type.kind === Kind.NON_NULL_TYPE) {
      attributes.push(`[JsonRequired]`);
    }

    if (commentText || attributes.length > 0) {
      const summary = commentText ? indentMultiline(commentText.trimRight()) + '\n' : '';
      const attributeLines = attributes.length > 0 ?
        attributes.map(attr => indent(attr)).concat('').join('\n') : '';
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
    if (hasArguments &&
        directive.arguments[0].value.kind === Kind.STRING) {
      reason = directive.arguments[0].value.value;
    }
    return reason;
  }

  initialValue(typeName: string, defaultValue?: ValueNode): string | undefined {
    if (defaultValue) {
      if (defaultValue.kind === Kind.INT ||
          defaultValue.kind === Kind.FLOAT ||
          defaultValue.kind === Kind.BOOLEAN) {
          return `${defaultValue.value}`;
      }
      else if (defaultValue.kind === Kind.STRING) {
        // TODO: to support/escape chars like " and \ in string value
        return `"${defaultValue.value}"`;
      }
      else if (defaultValue.kind === Kind.ENUM) {
        return `${typeName}.${defaultValue.value}`;
      }
      else if (defaultValue.kind === Kind.LIST) {
        // Does not work with all collection types, eg interfaces like IList and IEnumerable
        // To keep it simple for now, exclude when typeName is referring to an interface
        if (!/^I[A-Z]/.test(typeName)) {
          const list = defaultValue.values
            .map(value => this.initialValue(typeName, value))
            .join(', ');
          return `new ${typeName}(new [] { ${list} })`;
        }
      }
    }
    return undefined;
  }

  protected resolveInputFieldType(
    typeNode: TypeNode
  ): { baseType: string; typeName: string; isScalar: boolean; nullableValueType: boolean; isArray: boolean } {
    const innerType = getBaseTypeNode(typeNode);
    const schemaType = this._schema.getType(innerType.name.value);
    const required = typeNode.kind === Kind.NON_NULL_TYPE;
    const isArray =
      typeNode.kind === Kind.LIST_TYPE ||
      (typeNode.kind === Kind.NON_NULL_TYPE && typeNode.type.kind === Kind.LIST_TYPE);
    let result: { baseType: string; typeName: string; isScalar: boolean; nullableValueType: boolean; isArray: boolean } = null;

    if (isScalarType(schemaType)) {
      if (this.scalars[schemaType.name]) {
        const baseType = this.scalars[schemaType.name];
        result = {
          baseType,
          typeName: this.scalars[schemaType.name],
          isScalar: true,
          nullableValueType: !required && isValueType(baseType),
          isArray,
        };
      } else {
        result = { 
          isArray, 
          baseType: 'Object', 
          typeName: 'Object', 
          isScalar: true,
          nullableValueType: false };
      }
    } else if (isInputObjectType(schemaType)) {
      result = {
        baseType: `${this.convertName(schemaType.name)}`,
        typeName: `${this.convertName(schemaType.name)}`,
        isScalar: false,
        nullableValueType: false,
        isArray,
      };
    } else if (isEnumType(schemaType)) {
      result = {
        isArray,
        baseType: this.convertName(schemaType.name),
        typeName: this.convertName(schemaType.name),
        nullableValueType: !required,
        isScalar: true,
      };
    } else {
      result = {
        baseType: `${schemaType.name}`,
        typeName: `${schemaType.name}`,
        isScalar: false,
        nullableValueType: false,
        isArray,
      };
    }

    if (result) {
      result.typeName = wrapTypeWithModifiers(result.typeName, typeNode, this.config.listType);
    }

    return result;
  }

  protected buildObject(name: string, description: StringValueNode, inputValueArray: ReadonlyArray<FieldDefinitionNode>): string {
    const classSummary = transformComment(description?.value);
    const classMembers = inputValueArray
      .map(arg => {
        const fieldHeader = this.getFieldHeader(arg);
        const typeToUse = this.resolveInputFieldType(arg.type);
        const nullable = typeToUse.nullableValueType ? '?' :'';
        return (
          fieldHeader +
          indent(`public ${typeToUse.typeName}${nullable} ${arg.name.value} { get; set; }`)
        );
      })
      .join('\n\n');

    return `
#region ${name}
${classSummary}public class ${name} {
  #region members
${classMembers}
  #endregion
}
#endregion
`;
  }

  protected buildInputTransfomer(name: string, description: StringValueNode, inputValueArray: ReadonlyArray<InputValueDefinitionNode>): string {
    const classSummary = transformComment(description?.value);
    const classMembers = inputValueArray
      .map(arg => {
        const fieldHeader = this.getFieldHeader(arg);
        const typeToUse = this.resolveInputFieldType(arg.type);
        const initialValue = this.initialValue(typeToUse.typeName, arg.defaultValue);
        const initial = initialValue ? ` = ${initialValue};` : '';
        const nullable = typeToUse.nullableValueType ? '?' :'';
        return (          
          fieldHeader +
          indent(`public ${typeToUse.typeName}${nullable} ${arg.name.value} { get; set; }${initial}`)
        );
      })
      .join('\n\n');

    return `
#region ${name}
${classSummary}public class ${name} {
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
#endregion
`;
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    const name = `${this.convertName(node)}`;
    return this.buildInputTransfomer(name, node.description, node.fields);
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode): string {
    return this.buildObject(node.name.value, node.description, node.fields);
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): string {
    return this.buildObject(node.name.value, node.description, node.fields);
  }
}
