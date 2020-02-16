import {
  DirectiveDefinitionNode,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  ListTypeNode,
  NamedTypeNode,
  NameNode,
  NonNullTypeNode,
  ObjectTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  UnionTypeDefinitionNode,
  StringValueNode,
  isEnumType,
} from 'graphql';
import { BaseVisitor, ParsedConfig, RawConfig } from './base-visitor';
import { DEFAULT_SCALARS } from './scalars';
import { normalizeDeclarationKind } from './declaration-kinds';
import { EnumValuesMap, NormalizedScalarsMap, DeclarationKindConfig, DeclarationKind, ParsedEnumValuesMap } from './types';
import { transformComment, buildScalars, DeclarationBlock, DeclarationBlockConfig, indent, wrapWithSingleQuotes, getConfigValue } from './utils';
import { OperationVariablesToObject } from './variables-to-object';
import { parseEnumValues } from './enum-values';

export interface ParsedTypesConfig extends ParsedConfig {
  enumValues: ParsedEnumValuesMap;
  declarationKind: DeclarationKindConfig;
  addUnderscoreToArgsType: boolean;
  enumPrefix: boolean;
}

export interface RawTypesConfig extends RawConfig {
  /**
   * @name addUnderscoreToArgsType
   * @type boolean
   * @description Adds `_` to generated `Args` types in order to avoid duplicate identifiers.
   *
   * @example With Custom Values
   * ```yml
   *   config:
   *     addUnderscoreToArgsType: true
   * ```
   *
   */
  addUnderscoreToArgsType?: boolean;
  /**
   * @name enumValues
   * @type EnumValuesMap
   * @description Overrides the default value of enum values declared in your GraphQL schema.
   * You can also map the entire enum to an external type by providing a string that of `module#type`.
   *
   * @example With Custom Values
   * ```yml
   *   config:
   *     enumValues:
   *       MyEnum:
   *         A: 'foo'
   * ```
   *
   * @example With External Enum
   * ```yml
   *   config:
   *     enumValues:
   *       MyEnum: ./my-file#MyCustomEnum
   * ```
   *
   * @example Import All Enums from a file
   * ```yml
   *   config:
   *     enumValues: ./my-file
   * ```
   */
  enumValues?: EnumValuesMap;
  /**
   * @name declarationKind
   * @type DeclarationKindConfig
   * @description Overrides the default output for various GraphQL elements.
   *
   * @example Override all declarations
   * ```yml
   *   config:
   *     declarationKind: 'interface'
   * ```
   *
   * @example Override only specific declarations
   * ```yml
   *   config:
   *     declarationKind:
   *       type: 'interface'
   *       input: 'interface'
   * ```
   */
  declarationKind?: DeclarationKind | DeclarationKindConfig;
  /**
   * @name enumPrefix
   * @type boolean
   * @default true
   * @description Allow you to disable prefixing for generated enums, works in combination with `typesPrefix`.
   *
   * @example Disable enum prefixes
   * ```yml
   *   config:
   *     typesPrefix: I
   *     enumPrefix: false
   * ```
   */
  enumPrefix?: boolean;
}

export class BaseTypesVisitor<TRawConfig extends RawTypesConfig = RawTypesConfig, TPluginConfig extends ParsedTypesConfig = ParsedTypesConfig> extends BaseVisitor<TRawConfig, TPluginConfig> {
  protected _argumentsTransformer: OperationVariablesToObject;

  constructor(protected _schema: GraphQLSchema, rawConfig: TRawConfig, additionalConfig: TPluginConfig, defaultScalars: NormalizedScalarsMap = DEFAULT_SCALARS) {
    super(rawConfig, {
      enumPrefix: getConfigValue(rawConfig.enumPrefix, true),
      addUnderscoreToArgsType: getConfigValue(rawConfig.addUnderscoreToArgsType, false),
      enumValues: parseEnumValues(_schema, rawConfig.enumValues),
      declarationKind: normalizeDeclarationKind(rawConfig.declarationKind),
      scalars: buildScalars(_schema, rawConfig.scalars, defaultScalars),
      ...additionalConfig,
    });

    this._argumentsTransformer = new OperationVariablesToObject(this.scalars, this.convertName);
  }

  public getScalarsImports(): string[] {
    return Object.keys(this.config.scalars)
      .map(enumName => {
        const mappedValue = this.config.scalars[enumName];

        if (mappedValue.isExternal) {
          return this._buildTypeImport(mappedValue.import, mappedValue.source, mappedValue.default);
        }

        return null;
      })
      .filter(a => a);
  }

  public get scalarsDefinition(): string {
    const allScalars = Object.keys(this.config.scalars).map(scalarName => {
      const scalarValue = this.config.scalars[scalarName].type;
      const scalarType = this._schema.getType(scalarName);
      const comment = scalarType && scalarType.astNode && scalarType.description ? transformComment(scalarType.description, 1) : '';
      const { scalar } = this._parsedConfig.declarationKind;

      return comment + indent(`${scalarName}: ${scalarValue}${this.getPunctuation(scalar)}`);
    });

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.scalar)
      .withName('Scalars')
      .withComment('All built-in and custom scalars, mapped to their actual values')
      .withBlock(allScalars.join('\n')).string;
  }

  setDeclarationBlockConfig(config: DeclarationBlockConfig): void {
    this._declarationBlockConfig = config;
  }

  setArgumentsTransformer(argumentsTransfomer: OperationVariablesToObject): void {
    this._argumentsTransformer = argumentsTransfomer;
  }

  NonNullType(node: NonNullTypeNode): string {
    const asString = (node.type as any) as string;

    return asString;
  }

  getInputObjectDeclarationBlock(node: InputObjectTypeDefinitionNode): DeclarationBlock {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.input)
      .withName(this.convertName(node))
      .withComment((node.description as any) as string)
      .withBlock(node.fields.join('\n'));
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string {
    return this.getInputObjectDeclarationBlock(node).string;
  }

  InputValueDefinition(node: InputValueDefinitionNode): string {
    const comment = transformComment((node.description as any) as string, 1);
    const { input } = this._parsedConfig.declarationKind;

    return comment + indent(`${node.name}: ${node.type}${this.getPunctuation(input)}`);
  }

  Name(node: NameNode): string {
    return node.value;
  }

  FieldDefinition(node: FieldDefinitionNode): string {
    const typeString = (node.type as any) as string;
    const comment = transformComment((node.description as any) as string, 1);
    const { type } = this._parsedConfig.declarationKind;

    return comment + indent(`${node.name}: ${typeString}${this.getPunctuation(type)}`);
  }

  UnionTypeDefinition(node: UnionTypeDefinitionNode, key: string | number | undefined, parent: any): string {
    const originalNode = parent[key!] as UnionTypeDefinitionNode;
    const possibleTypes = originalNode.types.map(t => (this.scalars[t.name.value] ? this._getScalar(t.name.value) : this.convertName(t))).join(' | ');

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withComment((node.description as any) as string)
      .withContent(possibleTypes).string;
  }

  protected mergeInterfaces(interfaces: string[], hasOtherFields: boolean): string {
    return interfaces.join(' & ') + (interfaces.length && hasOtherFields ? ' & ' : '');
  }

  appendInterfacesAndFieldsToBlock(block: DeclarationBlock, interfaces: string[], fields: string[]): void {
    block.withContent(this.mergeInterfaces(interfaces, fields.length > 0));
    block.withBlock(this.mergeAllFields(fields, interfaces.length > 0));
  }

  getObjectTypeDeclarationBlock(node: ObjectTypeDefinitionNode, originalNode: ObjectTypeDefinitionNode): DeclarationBlock {
    const optionalTypename = this.config.nonOptionalTypename ? '__typename' : '__typename?';
    const { type } = this._parsedConfig.declarationKind;
    const allFields = [...(this.config.addTypename ? [indent(`${this.config['immutableTypes'] ? 'readonly' : ''} ${optionalTypename}: '${node.name}'${this.getPunctuation(type)}`)] : []), ...node.fields] as string[];
    const interfacesNames = originalNode.interfaces ? originalNode.interfaces.map(i => this.convertName(i)) : [];

    const declarationBlock = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(type)
      .withName(this.convertName(node))
      .withComment((node.description as any) as string);

    if (type === 'interface' || type === 'class') {
      if (interfacesNames.length > 0) {
        declarationBlock.withContent(' extends ' + interfacesNames.join(', ') + (allFields.length > 0 ? ' ' : ' {}'));
      }

      declarationBlock.withBlock(this.mergeAllFields(allFields, false));
    } else {
      this.appendInterfacesAndFieldsToBlock(declarationBlock, interfacesNames, allFields);
    }

    return declarationBlock;
  }

  protected mergeAllFields(allFields: string[], hasInterfaces: boolean): string {
    return allFields.join('\n');
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string | undefined, parent: any): string {
    const originalNode = parent[key!] as ObjectTypeDefinitionNode;

    return [this.getObjectTypeDeclarationBlock(node, originalNode).string, this.buildArgumentsBlock(originalNode)].filter(f => f).join('\n\n');
  }

  getInterfaceTypeDeclarationBlock(node: InterfaceTypeDefinitionNode, originalNode: InterfaceTypeDefinitionNode): DeclarationBlock {
    let declarationBlock = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.interface)
      .withName(this.convertName(node))
      .withComment((node.description as any) as string);

    return declarationBlock.withBlock(node.fields.join('\n'));
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode, key: number | string | undefined, parent: any): string {
    const originalNode = parent[key!] as InterfaceTypeDefinitionNode;

    return [this.getInterfaceTypeDeclarationBlock(node, originalNode).string, this.buildArgumentsBlock(originalNode)].filter(f => f).join('\n\n');
  }

  ScalarTypeDefinition(node: ScalarTypeDefinitionNode): string {
    // We empty this because we handle scalars in a different way, see constructor.
    return '';
  }

  protected _buildTypeImport(identifier: string, source: string, asDefault = false): string {
    if (asDefault) {
      return `import ${identifier} from '${source}';`;
    }
    return `import { ${identifier} } from '${source}';`;
  }

  public getEnumsImports(): string[] {
    return Object.keys(this.config.enumValues)
      .map(enumName => {
        const mappedValue = this.config.enumValues[enumName];

        if (mappedValue.sourceFile) {
          if (mappedValue.sourceIdentifier === 'default') {
            return this._buildTypeImport(mappedValue.typeIdentifier, mappedValue.sourceFile, true);
          }
          let identifier = mappedValue.sourceIdentifier;

          if (mappedValue.sourceIdentifier !== mappedValue.typeIdentifier && !mappedValue.sourceIdentifier.includes(' as ')) {
            identifier = `${mappedValue.sourceIdentifier} as ${mappedValue.typeIdentifier}`;
          }

          return this._buildTypeImport(identifier, mappedValue.sourceFile);
        }

        return null;
      })
      .filter(a => a);
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumName = (node.name as any) as string;

    // In case of mapped external enum string
    if (this.config.enumValues[enumName] && this.config.enumValues[enumName].sourceFile) {
      return null;
    }

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('enum')
      .withName(this.convertName(node, { useTypesPrefix: this.config.enumPrefix }))
      .withComment((node.description as any) as string)
      .withBlock(this.buildEnumValuesBlock(enumName, node.values)).string;
  }

  // We are using it in order to transform "description" field
  StringValue(node: StringValueNode): string {
    return node.value;
  }

  protected buildEnumValuesBlock(typeName: string, values: ReadonlyArray<EnumValueDefinitionNode>): string {
    return values
      .map(enumOption => {
        const optionName = this.convertName(enumOption, { useTypesPrefix: false, transformUnderscore: true });
        const comment = transformComment((enumOption.description as any) as string, 1);
        let enumValue: string | number = enumOption.name as any;

        if (this.config.enumValues[typeName] && this.config.enumValues[typeName].mappedValues && typeof this.config.enumValues[typeName].mappedValues[enumValue] !== 'undefined') {
          enumValue = this.config.enumValues[typeName].mappedValues[enumValue];
        }

        return comment + indent(`${optionName}${this._declarationBlockConfig.enumNameValueSeparator} ${wrapWithSingleQuotes(enumValue)}`);
      })
      .join(',\n');
  }

  DirectiveDefinition(node: DirectiveDefinitionNode): string {
    return '';
  }

  getArgumentsObjectDeclarationBlock(node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode, name: string, field: FieldDefinitionNode): DeclarationBlock {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.arguments)
      .withName(this.convertName(name))
      .withComment(node.description)
      .withBlock(this._argumentsTransformer.transform<InputValueDefinitionNode>(field.arguments));
  }

  getArgumentsObjectTypeDefinition(node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode, name: string, field: FieldDefinitionNode): string {
    return this.getArgumentsObjectDeclarationBlock(node, name, field).string;
  }

  protected buildArgumentsBlock(node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode) {
    const fieldsWithArguments = node.fields.filter(field => field.arguments && field.arguments.length > 0) || [];
    return fieldsWithArguments
      .map(field => {
        const name =
          node.name.value +
          (this.config.addUnderscoreToArgsType ? '_' : '') +
          this.convertName(field, {
            useTypesPrefix: false,
          }) +
          'Args';

        return this.getArgumentsObjectTypeDefinition(node, name, field);
      })
      .join('\n\n');
  }

  protected _getScalar(name: string): string {
    return `Scalars['${name}']`;
  }

  protected _getTypeForNode(node: NamedTypeNode): string {
    const typeAsString = (node.name as any) as string;

    if (this.scalars[typeAsString]) {
      return this._getScalar(typeAsString);
    } else if (this.config.enumValues[typeAsString]) {
      return this.config.enumValues[typeAsString].typeIdentifier;
    }

    const schemaType = this._schema.getType(node.name as any);

    if (schemaType && isEnumType(schemaType)) {
      return this.convertName(node, { useTypesPrefix: this.config.enumPrefix });
    }

    return this.convertName(node);
  }

  NamedType(node: NamedTypeNode): string {
    return this._getTypeForNode(node);
  }

  ListType(node: ListTypeNode): string {
    const asString = (node.type as any) as string;

    return this.wrapWithListType(asString);
  }

  SchemaDefinition() {
    return null;
  }

  protected wrapWithListType(str: string): string {
    return `Array<${str}>`;
  }
}
