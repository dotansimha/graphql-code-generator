import {
  ParsedConfig,
  BaseVisitor,
  EnumValuesMap,
  indentMultiline,
  indent,
  getBaseTypeNode,
  buildScalarsFromConfig,
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
  NamedTypeNode,
  UnionTypeDefinitionNode,
  NameNode,
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
  isOfTypeList,
} from '../../common/common';
import { pascalCase } from 'change-case-all';
import {
  JsonAttributesSource,
  JsonAttributesSourceConfiguration,
  getJsonAttributeSourceConfiguration,
} from './json-attributes';
import { CompositionTypesMap, CompositionTypesData } from './compositionTypesVisitor';

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

  /// A map from types implementing unions, and the unions that they implement
  private readonly compositionTypeToImplementationsMap: CompositionTypesMap;

  /// A set of all types that are union types
  private readonly compositionTypeNames: Set<string>;

  private unionTypeConverterTag = '[JsonConverter(typeof(UnionTypeConverter))]';

  private unionTypeListConverterTag = '[JsonConverter(typeof(UnionTypeListConverter))]';

  private compositionTypeCacheDefinition = `
/// <summary>
/// A cache of generated JToken::ToObject[TargetType] for each __typeName
/// </summary>
private static ConcurrentDictionary<string, Func<JToken, object>> ToObjectForTypenameCache = new ConcurrentDictionary<string, Func<JToken, object>>();
  `;

  private compositionTypeConvertersBlock = `
/// <summary>
/// Given __typeName returns JToken::ToObject[__typeName]. (via cache to improve performance)
/// </summary>
/// <param name="typeName">The __typeName</param>
/// <returns>JToken::ToObject[__typeName]</returns>
public static Func<JToken, object> GetToObjectMethodForTargetType(string typeName)
{
    if (!ToObjectForTypenameCache.ContainsKey(typeName))
    {
        // Get the type corresponding to the typename
        Type targetType = typeof(YammerGQLTypes).Assembly
            .GetTypes()
            .ToList()
            .Where(t => t.Name == typeName)
            .FirstOrDefault();

        // Create a parametrised ToObject method using targetType as <TypeArgument>
        var method = typeof(JToken).GetMethods()
            .Where(m => m.Name == "ToObject" && m.IsGenericMethod && m.GetParameters().Length == 0).FirstOrDefault();
        var genericMethod = method.MakeGenericMethod(targetType);
        var toObject = (Func<JToken, object>)genericMethod.CreateDelegate(Expression.GetFuncType(typeof(JToken), typeof(object)));
        ToObjectForTypenameCache[typeName] = toObject;
    }

    return ToObjectForTypenameCache[typeName];
}


/// <summary>
/// Converts an instance of a composition type to the appropriate implementation of the interface
/// </summary>
public class CompositionTypeConverter : JsonConverter
{
    /// <inheritdoc />
    public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
    {
        if (reader.TokenType == JsonToken.Null)
        {
            return null;
        }

        var loadedObject = JObject.Load(reader);

        var typeNameObject = loadedObject["__typename"];

        if (typeNameObject == null)
        {
            throw new JsonWriterException($"CompositionTypeConverter Exception: missing __typeName field when parsing {objectType.Name}. Requesting the __typename field is required for converting Composition Types");
        }

        var typeName = loadedObject["__typename"].Value<string>();

        var toObject = GetToObjectMethodForTargetType(typeName);

        // Invoke and parse it
        object objectParsed = toObject(loadedObject);

        return objectParsed;
    }

    /// <inheritdoc />
    public override bool CanConvert(Type objectType)
    {
        throw new NotImplementedException();
    }

    /// <inheritdoc />
    public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
    {
        throw new NotImplementedException("Tried to write a GQL Composition type to JSON");
    }
}

/// <summary>
/// Converts a list of instances of a composition type to the appropriate implementation of the interface
/// </summary>
public class CompositionTypeListConverter : JsonConverter
{
    /// <inheritdoc />
    public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
    {
        if (reader.TokenType == JsonToken.Null)
        {
            return null;
        }

        var items = JArray.Load(reader).Children();
        IList list = Activator.CreateInstance(objectType) as IList;

        foreach (var item in items)
        {
            var typeNameObject = item["__typename"];

            if (typeNameObject == null)
            {
                throw new JsonWriterException($"CompositionTypeListConverter Exception: missing __typeName field when parsing {objectType.Name}. Requesting the __typename field is required for converting Composition Types");
            }

            var typeName = item["__typename"].Value<string>();

            var toObject = GetToObjectMethodForTargetType(typeName);

            // Invoke and parse it
            object objectParsed = toObject(item);

            list.Add(objectParsed);
        }

        return list;
    }

    /// <inheritdoc />
    public override bool CanConvert(Type objectType)
    {
        throw new NotImplementedException();
    }

    /// <inheritdoc />
    public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
    {
        throw new NotImplementedException("Tried to write a GQL Composition type list to JSON");
    }
}
  `;

  constructor(
    rawConfig: CSharpResolversPluginRawConfig,
    private _schema: GraphQLSchema,
    compositionTypesData: CompositionTypesData
  ) {
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

    this.compositionTypeToImplementationsMap = compositionTypesData.compositionTypeToImplementationsMap;
    this.compositionTypeNames = compositionTypesData.compositionTypeNames;
  }

  public getImports(): string {
    const allImports = [
      'System',
      'System.Collections.Generic',
      'System.ComponentModel.DataAnnotations',
      'System.Collections.Concurrent',
      'System.Linq',
      'System.Linq.Expressions',
      'Newtonsoft.Json.Linq',
    ];
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

  public addCompositionTypeConverterDefinitions(blocks: string[]): string[] {
    return [this.compositionTypeCacheDefinition, ...blocks, this.compositionTypeConvertersBlock];
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

  InternalEnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumName = this.convertName(node.name);
    const enumValues = node.values
      ?.map(enumValue => {
        const enumValueDefinition = this.EnumValueDefinition(enumValue);
        return enumValueDefinition(node.name.value);
      })
      .join(',\n');
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

    if (this._parsedConfig.emitJsonAttributes) {
      if (node.kind === Kind.FIELD_DEFINITION) {
        const jsonPropertyAttribute = this.jsonAttributesConfiguration.propertyAttribute;
        if (jsonPropertyAttribute != null) {
          attributes.push(`[${jsonPropertyAttribute}("${node.name.value}")]`);
        }
      }
    }

    if (node.kind === Kind.INPUT_VALUE_DEFINITION && fieldType.isOuterTypeRequired) {
      // [Required] Should be always inserted for required fields to use in `GetInputObject()` when JSON attributes are not used
      // or there are no JSON attributes in selected attribute source that provides `JsonRequired` alternative
      if (this._parsedConfig.emitJsonAttributes) {
        const jsonRequiredAttribute = this.jsonAttributesConfiguration.requiredAttribute;
        if (jsonRequiredAttribute != null) {
          attributes.push(`[${jsonRequiredAttribute}]`);
        } else {
          attributes.push('[Required]');
        }
      } else {
        attributes.push('[Required]');
      }
    }

    if (
      node.kind === Kind.FIELD_DEFINITION &&
      (node.type.kind === Kind.NON_NULL_TYPE || node.type.kind === Kind.NAMED_TYPE || node.type.kind === Kind.LIST_TYPE)
    ) {
      const baseNode = getBaseTypeNode(node.type);

      if (this.compositionTypeNames.has(baseNode.name.value)) {
        attributes.push(isOfTypeList(node.type) ? this.unionTypeListConverterTag : this.unionTypeConverterTag);
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
    const allInterfaces = [...(interfaces || [])];

    // Check if this class is part of a composition type, which is modelled as an interface
    const compositionInterfaces = this.compositionTypeToImplementationsMap.get(name);
    if (compositionInterfaces) {
      compositionInterfaces.forEach(i => {
        allInterfaces.push({
          kind: 'NamedType',
          name: { kind: 'Name', value: i },
        });
      });
    }

    const interfaceImpl =
      interfaces && interfaces.length > 0 ? ` : ${interfaces.map(ntn => ntn.name.value).join(', ')}` : '';
    let classMembers = inputValueArray.map(arg => {
      const fieldType = this.resolveInputFieldType(arg.type);
      const fieldHeader = this.getFieldHeader(arg, fieldType);
      const fieldName = convertSafeName(arg.name);
      const csharpFieldType = wrapFieldType(fieldType, fieldType.listType, this.config.listType);
      return fieldHeader + indent(`public ${csharpFieldType} ${fieldName} { get; set; }`);
    });

    if (compositionInterfaces) {
      compositionInterfaces.forEach(cInterface => {
        const fieldHeader = indentMultiline(transformComment('The kind used to discriminate the union type')) + '\n';

        const kind = `${cInterface}Kind`;
        const fieldTypeName = `${kind} ${cInterface}.Kind { get { return ${kind}.${name}; } }`;

        const kindField = fieldHeader + indent(fieldTypeName);
        classMembers = [kindField, ...classMembers];
      });
    }

    const joinedMembers = classMembers.join('\n\n');

    return `
#region ${name}
${classSummary}public class ${convertSafeName(name)}${interfaceImpl} {
  #region members
${joinedMembers}
  #endregion
}
#endregion`;
  }

  protected buildUnionTypeInterface(name: string, description: StringValueNode): string {
    const interfaceSummary = transformComment(description?.value);

    const kindCommentText = transformComment('Kind is used to discriminate by type instances of this interface', 1);

    const field = indent(`${name}Kind Kind { get; }`);

    const kindMember = kindCommentText + field;
    return `
${interfaceSummary}public interface ${convertSafeName(name)} {
${kindMember}
}`;
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

  protected buildUnionType(
    nameNode: NameNode,
    description: StringValueNode,
    unionValues: ReadonlyArray<NamedTypeNode>
  ): string {
    const valuesAsEnumNodes: EnumValueDefinitionNode[] = unionValues.map(typeNode => ({
      kind: 'EnumValueDefinition',
      name: typeNode.name,
      description: {
        kind: 'StringValue',
        value: typeNode.name.value,
        block: true,
      },
      directives: [],
    }));

    const enumTypeNode: EnumTypeDefinitionNode = {
      kind: 'EnumTypeDefinition',
      name: { ...nameNode, value: nameNode.value + 'Kind' },
      description: {
        kind: 'StringValue',
        value: `An enum representing the possible values of ${nameNode.value}`,
      },
      values: valuesAsEnumNodes,
      directives: [],
    };

    const enumTypeDefinition = this.InternalEnumTypeDefinition(enumTypeNode);

    const interfaceDefinition = this.buildUnionTypeInterface(nameNode.value, description);

    return `
    ${enumTypeDefinition}
    ${interfaceDefinition}
    `;
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

  UnionTypeDefinition(node: UnionTypeDefinitionNode): string {
    return this.buildUnionType(node.name, node.description, node.types);
  }
}
