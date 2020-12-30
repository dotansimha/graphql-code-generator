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
  DirectiveNode,
  Kind,
  GraphQLEnumType,
} from 'graphql';
import flatMap from 'array.prototype.flatmap';
import { BaseVisitor, ParsedConfig, RawConfig } from './base-visitor';
import { DEFAULT_SCALARS } from './scalars';
import { normalizeDeclarationKind } from './declaration-kinds';
import {
  EnumValuesMap,
  NormalizedScalarsMap,
  DeclarationKindConfig,
  DeclarationKind,
  ParsedEnumValuesMap,
} from './types';
import {
  transformComment,
  buildScalars,
  DeclarationBlock,
  DeclarationBlockConfig,
  indent,
  wrapWithSingleQuotes,
  getConfigValue,
} from './utils';
import { OperationVariablesToObject } from './variables-to-object';
import { parseEnumValues } from './enum-values';

export interface ParsedTypesConfig extends ParsedConfig {
  enumValues: ParsedEnumValuesMap;
  declarationKind: DeclarationKindConfig;
  addUnderscoreToArgsType: boolean;
  onlyOperationTypes: boolean;
  enumPrefix: boolean;
  fieldWrapperValue: string;
  wrapFieldDefinitions: boolean;
  ignoreEnumValuesFromSchema: boolean;
}

export interface RawTypesConfig extends RawConfig {
  /**
   * @description Adds `_` to generated `Args` types in order to avoid duplicate identifiers.
   *
   * @exampleMarkdown
   * ## With Custom Values
   * ```yml
   *   config:
   *     addUnderscoreToArgsType: true
   * ```
   */
  addUnderscoreToArgsType?: boolean;
  /**
   * @description Overrides the default value of enum values declared in your GraphQL schema.
   * You can also map the entire enum to an external type by providing a string that of `module#type`.
   *
   * @exampleMarkdown
   * ## With Custom Values
   * ```yml
   *   config:
   *     enumValues:
   *       MyEnum:
   *         A: 'foo'
   * ```
   *
   * ## With External Enum
   * ```yml
   *   config:
   *     enumValues:
   *       MyEnum: ./my-file#MyCustomEnum
   * ```
   *
   * ## Import All Enums from a file
   * ```yml
   *   config:
   *     enumValues: ./my-file
   * ```
   */
  enumValues?: EnumValuesMap;
  /**
   * @description Overrides the default output for various GraphQL elements.
   *
   * @exampleMarkdown
   * ## Override all declarations
   * ```yml
   *   config:
   *     declarationKind: 'interface'
   * ```
   *
   * ## Override only specific declarations
   * ```yml
   *   config:
   *     declarationKind:
   *       type: 'interface'
   *       input: 'interface'
   * ```
   */
  declarationKind?: DeclarationKind | DeclarationKindConfig;
  /**
   * @default true
   * @description Allow you to disable prefixing for generated enums, works in combination with `typesPrefix`.
   *
   * @exampleMarkdown
   * ## Disable enum prefixes
   * ```yml
   *   config:
   *     typesPrefix: I
   *     enumPrefix: false
   * ```
   */
  enumPrefix?: boolean;
  /**
   * @description Allow you to add wrapper for field type, use T as the generic value. Make sure to set `wrapFieldDefinitions` to `true` in order to make this flag work.
   * @default T
   *
   * @exampleMarkdown
   * ## Allow Promise
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    wrapFieldDefinitions: true
   *    fieldWrapperValue: T | Promise<T>
   * ```
   */
  fieldWrapperValue?: string;
  /**
   * @description Set the to `true` in order to wrap field definitions with `FieldWrapper`.
   * This is useful to allow return types such as Promises and functions.
   * @default false
   *
   * @exampleMarkdown
   * ## Enable wrapping fields
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    wrapFieldDefinitions: true
   * ```
   */
  wrapFieldDefinitions?: boolean;
  /**
   * @description This will cause the generator to emit types for operations only (basically only enums and scalars)
   * @default false
   *
   * @exampleMarkdown
   * ## Override all definition types
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    onlyOperationTypes: true
   * ```
   */
  onlyOperationTypes?: boolean;
  /**
   * @description This will cause the generator to ignore enum values defined in GraphQLSchema
   * @default false
   *
   * @exampleMarkdown
   * ## Ignore enum values from schema
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    ignoreEnumValuesFromSchema: true
   * ```
   */
  ignoreEnumValuesFromSchema?: boolean;
}

export class BaseTypesVisitor<
  TRawConfig extends RawTypesConfig = RawTypesConfig,
  TPluginConfig extends ParsedTypesConfig = ParsedTypesConfig
> extends BaseVisitor<TRawConfig, TPluginConfig> {
  protected _argumentsTransformer: OperationVariablesToObject;

  constructor(
    protected _schema: GraphQLSchema,
    rawConfig: TRawConfig,
    additionalConfig: TPluginConfig,
    defaultScalars: NormalizedScalarsMap = DEFAULT_SCALARS
  ) {
    super(rawConfig, {
      enumPrefix: getConfigValue(rawConfig.enumPrefix, true),
      onlyOperationTypes: getConfigValue(rawConfig.onlyOperationTypes, false),
      addUnderscoreToArgsType: getConfigValue(rawConfig.addUnderscoreToArgsType, false),
      enumValues: parseEnumValues({
        schema: _schema,
        mapOrStr: rawConfig.enumValues,
        ignoreEnumValuesFromSchema: rawConfig.ignoreEnumValuesFromSchema,
      }),
      declarationKind: normalizeDeclarationKind(rawConfig.declarationKind),
      scalars: buildScalars(_schema, rawConfig.scalars, defaultScalars),
      fieldWrapperValue: getConfigValue(rawConfig.fieldWrapperValue, 'T'),
      wrapFieldDefinitions: getConfigValue(rawConfig.wrapFieldDefinitions, false),
      ignoreEnumValuesFromSchema: getConfigValue(rawConfig.ignoreEnumValuesFromSchema, false),
      ...additionalConfig,
    });

    this._argumentsTransformer = new OperationVariablesToObject(this.scalars, this.convertName);
  }

  protected getExportPrefix(): string {
    return 'export ';
  }

  public getFieldWrapperValue(): string {
    if (this.config.fieldWrapperValue) {
      return `${this.getExportPrefix()}type FieldWrapper<T> = ${this.config.fieldWrapperValue};`;
    }

    return '';
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
      const comment =
        scalarType && scalarType.astNode && scalarType.description ? transformComment(scalarType.description, 1) : '';
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
    const { type } = this._parsedConfig.declarationKind;
    const comment = this.getFieldComment(node);

    return comment + indent(`${node.name}: ${typeString}${this.getPunctuation(type)}`);
  }

  UnionTypeDefinition(node: UnionTypeDefinitionNode, key: string | number | undefined, parent: any): string {
    if (this.config.onlyOperationTypes) return '';
    const originalNode = parent[key] as UnionTypeDefinitionNode;
    const possibleTypes = originalNode.types
      .map(t => (this.scalars[t.name.value] ? this._getScalar(t.name.value) : this.convertName(t)))
      .join(' | ');

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

  getObjectTypeDeclarationBlock(
    node: ObjectTypeDefinitionNode,
    originalNode: ObjectTypeDefinitionNode
  ): DeclarationBlock {
    const optionalTypename = this.config.nonOptionalTypename ? '__typename' : '__typename?';
    const { type } = this._parsedConfig.declarationKind;
    const allFields = [
      ...(this.config.addTypename
        ? [
            indent(
              `${this.config.immutableTypes ? 'readonly ' : ''}${optionalTypename}: '${node.name}'${this.getPunctuation(
                type
              )}`
            ),
          ]
        : []),
      ...node.fields,
    ] as string[];
    const interfacesNames = originalNode.interfaces ? originalNode.interfaces.map(i => this.convertName(i)) : [];

    const declarationBlock = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(type)
      .withName(this.convertName(node))
      .withComment((node.description as any) as string);

    if (type === 'interface' || type === 'class') {
      if (interfacesNames.length > 0) {
        declarationBlock.withContent('extends ' + interfacesNames.join(', ') + (allFields.length > 0 ? ' ' : ' {}'));
      }

      declarationBlock.withBlock(this.mergeAllFields(allFields, false));
    } else {
      this.appendInterfacesAndFieldsToBlock(declarationBlock, interfacesNames, allFields);
    }

    return declarationBlock;
  }

  getFieldComment(node: FieldDefinitionNode): string {
    let commentText: string = node.description as any;
    const deprecationDirective = node.directives.find((v: any) => v.name === 'deprecated');
    if (deprecationDirective) {
      const deprecationReason = this.getDeprecationReason(deprecationDirective);
      commentText = `${commentText ? `${commentText}\n` : ''}@deprecated ${deprecationReason}`;
    }
    const comment = transformComment(commentText, 1);
    return comment;
  }

  protected mergeAllFields(allFields: string[], _hasInterfaces: boolean): string {
    return allFields.join('\n');
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode, key: number | string | undefined, parent: any): string {
    if (this.config.onlyOperationTypes) return '';
    const originalNode = parent[key] as ObjectTypeDefinitionNode;

    return [this.getObjectTypeDeclarationBlock(node, originalNode).string, this.buildArgumentsBlock(originalNode)]
      .filter(f => f)
      .join('\n\n');
  }

  getInterfaceTypeDeclarationBlock(
    node: InterfaceTypeDefinitionNode,
    _originalNode: InterfaceTypeDefinitionNode
  ): DeclarationBlock {
    const declarationBlock = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.interface)
      .withName(this.convertName(node))
      .withComment((node.description as any) as string);

    return declarationBlock.withBlock(node.fields.join('\n'));
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode, key: number | string | undefined, parent: any): string {
    if (this.config.onlyOperationTypes) return '';
    const originalNode = parent[key] as InterfaceTypeDefinitionNode;

    return [this.getInterfaceTypeDeclarationBlock(node, originalNode).string, this.buildArgumentsBlock(originalNode)]
      .filter(f => f)
      .join('\n\n');
  }

  ScalarTypeDefinition(_node: ScalarTypeDefinitionNode): string {
    // We empty this because we handle scalars in a different way, see constructor.
    return '';
  }

  protected _buildTypeImport(identifier: string, source: string, asDefault = false): string {
    const { useTypeImports } = this.config;
    if (asDefault) {
      if (useTypeImports) {
        return `import type { default as ${identifier} } from '${source}';`;
      }
      return `import ${identifier} from '${source}';`;
    }
    return `import${useTypeImports ? ' type' : ''} { ${identifier} } from '${source}';`;
  }

  protected handleEnumValueMapper(
    typeIdentifier: string,
    importIdentifier: string | null,
    sourceIdentifier: string | null,
    sourceFile: string | null
  ): string[] {
    const importStatement = this._buildTypeImport(importIdentifier || sourceIdentifier, sourceFile);

    if (importIdentifier !== sourceIdentifier || sourceIdentifier !== typeIdentifier) {
      return [importStatement, `import ${typeIdentifier} = ${sourceIdentifier};`];
    }

    return [importStatement];
  }

  public getEnumsImports(): string[] {
    return flatMap(Object.keys(this.config.enumValues), enumName => {
      const mappedValue = this.config.enumValues[enumName];

      if (mappedValue.sourceFile) {
        if (mappedValue.isDefault) {
          return [this._buildTypeImport(mappedValue.typeIdentifier, mappedValue.sourceFile, true)];
        }

        return this.handleEnumValueMapper(
          mappedValue.typeIdentifier,
          mappedValue.importIdentifier,
          mappedValue.sourceIdentifier,
          mappedValue.sourceFile
        );
      }

      return [];
    }).filter(a => a);
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

  protected makeValidEnumIdentifier(identifier: string): string {
    if (/^[0-9]/.exec(identifier)) {
      return wrapWithSingleQuotes(identifier, true);
    }
    return identifier;
  }

  protected buildEnumValuesBlock(typeName: string, values: ReadonlyArray<EnumValueDefinitionNode>): string {
    const schemaEnumType: GraphQLEnumType | undefined = this._schema
      ? (this._schema.getType(typeName) as GraphQLEnumType)
      : undefined;

    return values
      .map(enumOption => {
        const optionName = this.makeValidEnumIdentifier(
          this.convertName(enumOption, { useTypesPrefix: false, transformUnderscore: true })
        );
        const comment = transformComment((enumOption.description as any) as string, 1);
        const schemaEnumValue =
          schemaEnumType && !this.config.ignoreEnumValuesFromSchema
            ? schemaEnumType.getValue(enumOption.name as any).value
            : undefined;
        let enumValue: string | number =
          typeof schemaEnumValue !== 'undefined' ? schemaEnumValue : (enumOption.name as any);

        if (
          this.config.enumValues[typeName] &&
          this.config.enumValues[typeName].mappedValues &&
          typeof this.config.enumValues[typeName].mappedValues[enumValue] !== 'undefined'
        ) {
          enumValue = this.config.enumValues[typeName].mappedValues[enumValue];
        }

        return (
          comment +
          indent(
            `${optionName}${this._declarationBlockConfig.enumNameValueSeparator} ${wrapWithSingleQuotes(
              enumValue,
              typeof schemaEnumValue !== 'undefined'
            )}`
          )
        );
      })
      .join(',\n');
  }

  DirectiveDefinition(_node: DirectiveDefinitionNode): string {
    return '';
  }

  getArgumentsObjectDeclarationBlock(
    node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode,
    name: string,
    field: FieldDefinitionNode
  ): DeclarationBlock {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(this._parsedConfig.declarationKind.arguments)
      .withName(this.convertName(name))
      .withComment(node.description)
      .withBlock(this._argumentsTransformer.transform<InputValueDefinitionNode>(field.arguments));
  }

  getArgumentsObjectTypeDefinition(
    node: InterfaceTypeDefinitionNode | ObjectTypeDefinitionNode,
    name: string,
    field: FieldDefinitionNode
  ): string {
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
            useTypesSuffix: false,
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

  NamedType(node: NamedTypeNode, key, parent, path, ancestors): string {
    const currentVisitContext = this.getVisitorKindContextFromAncestors(ancestors);
    const isVisitingInputType = currentVisitContext.includes(Kind.INPUT_OBJECT_TYPE_DEFINITION);
    const typeToUse = this._getTypeForNode(node);

    if (!isVisitingInputType && this.config.fieldWrapperValue && this.config.wrapFieldDefinitions) {
      return `FieldWrapper<${typeToUse}>`;
    }

    return typeToUse;
  }

  ListType(node: ListTypeNode): string {
    const asString = (node.type as any) as string;

    return this.wrapWithListType(asString);
  }

  SchemaDefinition() {
    return null;
  }

  protected getDeprecationReason(directive: DirectiveNode): string | void {
    if ((directive.name as any) === 'deprecated') {
      const hasArguments = directive.arguments.length > 0;
      let reason = 'Field no longer supported';
      if (hasArguments) {
        reason = directive.arguments[0].value as any;
      }
      return reason;
    }
  }

  protected wrapWithListType(str: string): string {
    return `Array<${str}>`;
  }
}
