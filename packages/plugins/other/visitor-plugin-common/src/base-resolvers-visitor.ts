import { ParsedConfig, RawConfig, BaseVisitor } from './base-visitor';
import autoBind from 'auto-bind';
import { DEFAULT_SCALARS } from './scalars';
import { NormalizedScalarsMap, EnumValuesMap, ParsedEnumValuesMap, DeclarationKind } from './types';
import {
  DeclarationBlock,
  DeclarationBlockConfig,
  indent,
  getBaseTypeNode,
  buildScalars,
  getConfigValue,
  getRootTypeNames,
  stripMapperTypeInterpolation,
  OMIT_TYPE,
  REQUIRE_FIELDS_TYPE,
  wrapTypeWithModifiers,
} from './utils';
import {
  NameNode,
  ListTypeNode,
  NamedTypeNode,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
  GraphQLSchema,
  NonNullTypeNode,
  UnionTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  isObjectType,
  isInterfaceType,
  isNonNullType,
  isUnionType,
  GraphQLNamedType,
  isEnumType,
  DirectiveDefinitionNode,
  GraphQLObjectType,
  InputValueDefinitionNode,
} from 'graphql';

import { OperationVariablesToObject } from './variables-to-object';
import { ParsedMapper, parseMapper, transformMappers, ExternalParsedMapper } from './mappers';
import { parseEnumValues } from './enum-values';
import { ApolloFederation, getBaseType } from '@graphql-codegen/plugin-helpers';

export interface ParsedResolversConfig extends ParsedConfig {
  contextType: ParsedMapper;
  fieldContextTypes: Array<string>;
  rootValueType: ParsedMapper;
  mappers: {
    [typeName: string]: ParsedMapper;
  };
  defaultMapper: ParsedMapper | null;
  avoidOptionals: boolean;
  addUnderscoreToArgsType: boolean;
  enumValues: ParsedEnumValuesMap;
  resolverTypeWrapperSignature: string;
  federation: boolean;
  enumPrefix: boolean;
  optionalResolveType: boolean;
  immutableTypes: boolean;
}

export interface RawResolversConfig extends RawConfig {
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
   * @name contextType
   * @type string
   * @description Use this configuration to set a custom type for your `context`, and it will
   * effect all the resolvers, without the need to override it using generics each time.
   * If you wish to use an external type and import it from another file, you can use `add` plugin
   * and add the required `import` statement, or you can use a `module#type` syntax.
   *
   * @example Custom Context Type
   * ```yml
   * plugins
   *   config:
   *     contextType: MyContext
   * ```
   * @example Custom Context Type
   * ```yml
   * plugins
   *   config:
   *     contextType: ./my-types#MyContext
   * ```
   */
  contextType?: string;
  /**
   * @name fieldContextTypes
   * @type string array
   * @description Use this to set a custom type for a specific field `context`.
   * It will only affect the targeted resolvers.
   * You can either use `Field.Path#ContextTypeName` or `Field.Path#ExternalFileName#ContextTypeName`
   *
   * @example Custom Field Context Types
   * ```
   * plugins
   *   config:
   *     fieldContextTypes:
   *       - MyType.foo#CustomContextType
   *       - MyType.bar#./my-file#ContextTypeOne
   * ```
   *
   */
  fieldContextTypes?: Array<string>;
  /**
   * @name rootValueType
   * @type string
   * @description Use this configuration to set a custom type for the `rootValue`, and it will
   * effect resolvers of all root types (Query, Mutation and Subscription), without the need to override it using generics each time.
   * If you wish to use an external type and import it from another file, you can use `add` plugin
   * and add the required `import` statement, or you can use both `module#type` or `module#namespace#type` syntax.
   *
   * @example Custom RootValue Type
   * ```yml
   * plugins
   *   config:
   *     rootValueType: MyRootValue
   * ```
   * @example Custom RootValue Type
   * ```yml
   * plugins
   *   config:
   *     rootValueType: ./my-types#MyRootValue
   * ```
   */
  rootValueType?: string;
  /**
   * @name mapperTypeSuffix
   * @type string
   * @description Adds a suffix to the imported names to prevent name clashes.
   *
   * ```yml
   * plugins
   *   config:
   *     mapperTypeSuffix: Model
   * ```
   */
  mapperTypeSuffix?: string;
  /**
   * @name mappers
   * @type Object
   * @description Replaces a GraphQL type usage with a custom type, allowing you to return custom object from
   * your resolvers.
   * You can use both `module#type` and `module#namespace#type` syntax.
   *
   * @example Custom Context Type
   * ```yml
   * plugins
   *   config:
   *     mappers:
   *       User: ./my-models#UserDbObject
   *       Book: ./my-models#Collections#Book
   * ```
   */
  mappers?: { [typeName: string]: string };
  /**
   * @name defaultMapper
   * @type string
   * @description Allow you to set the default mapper when it's not being override by `mappers` or generics.
   * You can specify a type name, or specify a string in `module#type` or `module#namespace#type` format.
   * The defualt value of mappers it the TypeScript type generated by `typescript` package.
   *
   * @example Replace with any
   * ```yml
   * plugins
   *   config:
   *     defaultMapper: any
   * ```
   *
   * @example Custom Base Object
   * ```yml
   * plugins
   *   config:
   *     defaultMapper: ./my-file#BaseObject
   * ```
   *
   * @example Wrap default types with Partial
   * You can also specify a custom wrapper for the original type, without overring the original generated types, use "{T}" to specify the identifier. (for flow, use `$Shape<{T}>`)
   * ```yml
   * plugins
   *   config:
   *     defaultMapper: Partial<{T}>
   * ```
   *
   * @example Allow deep partial with `utility-types`
   * ```yml
   * plugins
   *  plugins:
   *    - "typescript"
   *    - "typescript-resolvers"
   *    - add: "import { DeepPartial } from 'utility-types';"
   *  config:
   *    defaultMapper: DeepPartial<{T}>
   * ```
   */
  defaultMapper?: string;
  /**
   * @name avoidOptionals
   * @type boolean
   * @description This will cause the generator to avoid using TypeScript optionals (`?`),
   * so all field resolvers must be implemented in order to avoid compilation errors.
   *
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-resolvers
   *  config:
   *    avoidOptionals: true
   * ```
   */
  avoidOptionals?: boolean;
  /**
   * @name showUnusedMappers
   * @type boolean
   * @description Warns about unused mappers.
   * @default true
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-resolvers
   *  config:
   *    showUnusedMappers: true
   * ```
   */
  showUnusedMappers?: boolean;
  /**
   * @name enumValues
   * @type EnumValuesMap
   * @description Overrides the default value of enum values declared in your GraphQL schema, supported
   * in this plugin because of the need for integeration with `typescript` package.
   * See documentation under `typescript` plugin for more information and examples.
   *
   */
  enumValues?: EnumValuesMap;
  /**
   * @name resolverTypeWrapperSignature
   * @type string
   * @default Promise<T> | T
   * @description Allow you to override `resolverTypeWrapper` definition.
   *
   */
  resolverTypeWrapperSignature?: string;
  /**
   * @name federation
   * @type boolean
   * @default false
   * @description Supports Apollo Federation
   *
   */
  federation?: boolean;
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
  /**
   * @name optionalResolveType
   * @type boolean
   * @default false
   * @description Sets the `__resolveType` field as optional field.
   */
  optionalResolveType?: boolean;
  /**
   * @name immutableTypes
   * @type boolean
   * @default false
   * @description Generates immutable types by adding `readonly` to properties and uses `ReadonlyArray`.
   */
  immutableTypes?: boolean;
}

export type ResolverTypes = { [gqlType: string]: string };
export type ResolverParentTypes = { [gqlType: string]: string };
export type GroupedMappers = Record<string, { identifier: string; asDefault?: boolean }[]>;
type FieldContextTypeMap = Record<string, ParsedMapper>;

export class BaseResolversVisitor<
  TRawConfig extends RawResolversConfig = RawResolversConfig,
  TPluginConfig extends ParsedResolversConfig = ParsedResolversConfig
> extends BaseVisitor<TRawConfig, TPluginConfig> {
  protected _parsedConfig: TPluginConfig;
  protected _declarationBlockConfig: DeclarationBlockConfig = {};
  protected _collectedResolvers: { [key: string]: string } = {};
  protected _collectedDirectiveResolvers: { [key: string]: string } = {};
  protected _variablesTransfomer: OperationVariablesToObject;
  protected _usedMappers: { [key: string]: boolean } = {};
  protected _resolversTypes: ResolverTypes = {};
  protected _resolversParentTypes: ResolverParentTypes = {};
  protected _rootTypeNames: string[] = [];
  protected _globalDeclarations: Set<string> = new Set();
  protected _federation: ApolloFederation;
  protected _hasScalars = false;
  protected _hasFederation = false;
  protected _fieldContextTypeMap: FieldContextTypeMap;

  constructor(
    rawConfig: TRawConfig,
    additionalConfig: TPluginConfig,
    private _schema: GraphQLSchema,
    defaultScalars: NormalizedScalarsMap = DEFAULT_SCALARS
  ) {
    super(rawConfig, {
      immutableTypes: getConfigValue(rawConfig.immutableTypes, false),
      optionalResolveType: getConfigValue(rawConfig.optionalResolveType, false),
      enumPrefix: getConfigValue(rawConfig.enumPrefix, true),
      federation: getConfigValue(rawConfig.federation, false),
      resolverTypeWrapperSignature: getConfigValue(rawConfig.resolverTypeWrapperSignature, 'Promise<T> | T'),
      enumValues: parseEnumValues(_schema, rawConfig.enumValues),
      addUnderscoreToArgsType: getConfigValue(rawConfig.addUnderscoreToArgsType, false),
      contextType: parseMapper(rawConfig.contextType || 'any', 'ContextType'),
      fieldContextTypes: getConfigValue(rawConfig.fieldContextTypes, []),
      rootValueType: parseMapper(rawConfig.rootValueType || '{}', 'RootValueType'),
      avoidOptionals: getConfigValue(rawConfig.avoidOptionals, false),
      defaultMapper: rawConfig.defaultMapper
        ? parseMapper(rawConfig.defaultMapper || 'any', 'DefaultMapperType')
        : null,
      mappers: transformMappers(rawConfig.mappers || {}, rawConfig.mapperTypeSuffix),
      scalars: buildScalars(_schema, rawConfig.scalars, defaultScalars),
      ...(additionalConfig || {}),
    } as TPluginConfig);

    autoBind(this);
    this._federation = new ApolloFederation({ enabled: this.config.federation, schema: this.schema });
    this._rootTypeNames = getRootTypeNames(_schema);
    this._variablesTransfomer = new OperationVariablesToObject(this.scalars, this.convertName);
    this._resolversTypes = this.createResolversFields(
      type => this.applyResolverTypeWrapper(type),
      type => this.clearResolverTypeWrapper(type),
      name => this.getTypeToUse(name)
    );
    this._resolversParentTypes = this.createResolversFields(
      type => type,
      type => type,
      name => this.getParentTypeToUse(name)
    );
    this._fieldContextTypeMap = this.createFieldContextTypeMap();
  }

  public getResolverTypeWrapperSignature(): string {
    return `export type ResolverTypeWrapper<T> = ${this.config.resolverTypeWrapperSignature};`;
  }

  protected shouldMapType(
    type: GraphQLNamedType,
    checkedBefore: { [typeName: string]: boolean } = {},
    duringCheck: string[] = []
  ): boolean {
    if (checkedBefore[type.name] !== undefined) {
      return checkedBefore[type.name];
    }

    if (type.name.startsWith('__') || this.config.scalars[type.name]) {
      return false;
    }

    if (this.config.mappers[type.name]) {
      return true;
    }

    if (isObjectType(type) || isInterfaceType(type)) {
      const fields = type.getFields();

      return Object.keys(fields)
        .filter(fieldName => {
          const field = fields[fieldName];
          const fieldType = getBaseType(field.type);

          return !duringCheck.includes(fieldType.name);
        })
        .some(fieldName => {
          const field = fields[fieldName];
          const fieldType = getBaseType(field.type);

          if (checkedBefore[fieldType.name] !== undefined) {
            return checkedBefore[fieldType.name];
          }

          if (this.config.mappers[type.name]) {
            return true;
          }

          duringCheck.push(type.name);
          const innerResult = this.shouldMapType(fieldType, checkedBefore, duringCheck);

          return innerResult;
        });
    }

    return false;
  }

  // Kamil: this one is heeeeavvyyyy
  protected createResolversFields(
    applyWrapper: (str: string) => string,
    clearWrapper: (str: string) => string,
    getTypeToUse: (str: string) => string
  ): ResolverTypes {
    const allSchemaTypes = this._schema.getTypeMap();
    const nestedMapping: { [typeName: string]: boolean } = {};
    const typeNames = this._federation.filterTypeNames(Object.keys(allSchemaTypes));

    typeNames.forEach(typeName => {
      const schemaType = allSchemaTypes[typeName];
      nestedMapping[typeName] = this.shouldMapType(schemaType, nestedMapping);
    });

    return typeNames.reduce((prev: ResolverTypes, typeName: string) => {
      if (typeName.startsWith('__')) {
        return prev;
      }

      let shouldApplyOmit = false;
      const isRootType = this._rootTypeNames.includes(typeName);

      const isMapped = this.config.mappers[typeName];
      const isScalar = this.config.scalars[typeName];
      const hasDefaultMapper = !!(this.config.defaultMapper && this.config.defaultMapper.type);
      const schemaType = allSchemaTypes[typeName];

      if (isRootType) {
        prev[typeName] = applyWrapper(this.config.rootValueType.type);

        return prev;
      } else if (isInterfaceType(schemaType)) {
        const allTypesMap = this._schema.getTypeMap();
        const implementingTypes: string[] = [];

        for (const graphqlType of Object.values(allTypesMap)) {
          if (graphqlType instanceof GraphQLObjectType) {
            const allInterfaces = graphqlType.getInterfaces();

            if (allInterfaces.some(int => int.name === schemaType.name)) {
              implementingTypes.push(graphqlType.name);
            }
          }
        }

        const possibleTypes = implementingTypes.map(name => getTypeToUse(name)).join(' | ') || 'never';

        prev[typeName] = possibleTypes;
        return prev;
      } else if (isEnumType(schemaType) && this.config.enumValues[typeName]) {
        prev[typeName] = this.config.enumValues[typeName].typeIdentifier;
      } else if (isMapped && this.config.mappers[typeName].type) {
        this.markMapperAsUsed(typeName);
        prev[typeName] = applyWrapper(this.config.mappers[typeName].type);
      } else if (hasDefaultMapper && !hasPlaceholder(this.config.defaultMapper.type)) {
        prev[typeName] = applyWrapper(this.config.defaultMapper.type);
      } else if (isScalar) {
        prev[typeName] = applyWrapper(this._getScalar(typeName));
      } else if (isUnionType(schemaType)) {
        prev[typeName] = schemaType
          .getTypes()
          .map(type => getTypeToUse(type.name))
          .join(' | ');
      } else {
        shouldApplyOmit = true;
        prev[typeName] = this.convertName(typeName, { useTypesPrefix: this.config.enumPrefix });
      }

      if (shouldApplyOmit && prev[typeName] !== 'any' && isObjectType(schemaType)) {
        const fields = schemaType.getFields();
        const relevantFields: {
          addOptionalSign: boolean;
          fieldName: string;
          replaceWithType: string;
        }[] = this._federation
          .filterFieldNames(Object.keys(fields))
          .map(fieldName => {
            const field = fields[fieldName];
            const baseType = getBaseType(field.type);
            const isUnion = isUnionType(baseType);

            if (!this.config.mappers[baseType.name] && !isUnion && !nestedMapping[baseType.name]) {
              return null;
            }

            const addOptionalSign = !this.config.avoidOptionals && !isNonNullType(field.type);

            return {
              addOptionalSign,
              fieldName,
              replaceWithType: wrapTypeWithModifiers(getTypeToUse(baseType.name), field.type, {
                wrapOptional: this.applyMaybe,
                wrapArray: this.wrapWithArray,
              }),
            };
          })
          .filter(a => a);

        if (relevantFields.length > 0) {
          // Puts ResolverTypeWrapper on top of an entire type
          prev[typeName] = applyWrapper(this.replaceFieldsInType(prev[typeName], relevantFields));
        } else {
          // We still want to use ResolverTypeWrapper, even if we don't touch any fields
          prev[typeName] = applyWrapper(prev[typeName]);
        }
      }

      if (isMapped && hasPlaceholder(prev[typeName])) {
        prev[typeName] = replacePlaceholder(prev[typeName], typeName);
      }

      if (!isMapped && hasDefaultMapper && hasPlaceholder(this.config.defaultMapper.type)) {
        // Make sure the inner type has no ResolverTypeWrapper
        const name = clearWrapper(isScalar ? this._getScalar(typeName) : prev[typeName]);
        const replaced = replacePlaceholder(this.config.defaultMapper.type, name);

        // Don't wrap Union with ResolverTypeWrapper, each inner type already has it
        if (isUnionType(schemaType)) {
          prev[typeName] = replaced;
        } else {
          prev[typeName] = applyWrapper(replacePlaceholder(this.config.defaultMapper.type, name));
        }
      }

      return prev;
    }, {} as ResolverTypes);
  }

  protected replaceFieldsInType(
    typeName: string,
    relevantFields: { addOptionalSign: boolean; fieldName: string; replaceWithType: string }[]
  ): string {
    this._globalDeclarations.add(OMIT_TYPE);
    return `Omit<${typeName}, ${relevantFields.map(f => `'${f.fieldName}'`).join(' | ')}> & { ${relevantFields
      .map(f => `${f.fieldName}${f.addOptionalSign ? '?' : ''}: ${f.replaceWithType}`)
      .join(', ')} }`;
  }

  protected applyMaybe(str: string): string {
    return `Maybe<${str}>`;
  }

  protected applyResolverTypeWrapper(str: string): string {
    return `ResolverTypeWrapper<${this.clearResolverTypeWrapper(str)}>`;
  }

  protected clearMaybe(str: string): string {
    if (str.startsWith('Maybe<')) {
      return str.replace(/Maybe<(.*?)>$/, '$1');
    }

    return str;
  }

  protected clearResolverTypeWrapper(str: string): string {
    if (str.startsWith('ResolverTypeWrapper<')) {
      return str.replace(/ResolverTypeWrapper<(.*?)>$/, '$1');
    }

    return str;
  }

  protected wrapWithArray(t: string): string {
    if (this.config.immutableTypes) {
      return `ReadonlyArray<${t}>`;
    }

    return `Array<${t}>`;
  }

  protected createFieldContextTypeMap(): FieldContextTypeMap {
    return this.config.fieldContextTypes.reduce<FieldContextTypeMap>((prev, fieldContextType) => {
      const items = fieldContextType.split('#');
      if (items.length === 3) {
        const [path, source, contextTypeName] = items;
        return { ...prev, [path]: parseMapper(`${source}#${contextTypeName}`) };
      }
      const [path, contextType] = items;
      return { ...prev, [path]: parseMapper(contextType) };
    }, {});
  }

  public buildResolversTypes(): string {
    const declarationKind = 'type';
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(this.convertName('ResolversTypes'))
      .withComment('Mapping between all available schema types and the resolvers types')
      .withBlock(
        Object.keys(this._resolversTypes)
          .map(typeName =>
            indent(`${typeName}: ${this._resolversTypes[typeName]}${this.getPunctuation(declarationKind)}`)
          )
          .join('\n')
      ).string;
  }

  public buildResolversParentTypes(): string {
    const declarationKind = 'type';
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(this.convertName('ResolversParentTypes'))
      .withComment('Mapping between all available schema types and the resolvers parents')
      .withBlock(
        Object.keys(this._resolversParentTypes)
          .map(typeName =>
            indent(`${typeName}: ${this._resolversParentTypes[typeName]}${this.getPunctuation(declarationKind)}`)
          )
          .join('\n')
      ).string;
  }

  public get schema(): GraphQLSchema {
    return this._schema;
  }

  public get defaultMapperType(): string {
    return this.config.defaultMapper.type;
  }

  public get unusedMappers() {
    return Object.keys(this.config.mappers).filter(name => !this._usedMappers[name]);
  }

  public get globalDeclarations(): string[] {
    return Array.from(this._globalDeclarations);
  }

  protected isMapperImported(groupedMappers: GroupedMappers, identifier: string, source: string): boolean {
    const exists = !groupedMappers[source] ? false : !!groupedMappers[source].find(m => m.identifier === identifier);
    const existsFromEnums = !!Object.keys(this.config.enumValues)
      .map(key => this.config.enumValues[key])
      .find(o => o.sourceFile === source && o.typeIdentifier === identifier);

    return exists || existsFromEnums;
  }

  public get mappersImports(): string[] {
    const groupedMappers: GroupedMappers = {};

    const addMapper = (source: string, identifier: string, asDefault: boolean) => {
      if (!this.isMapperImported(groupedMappers, identifier, source)) {
        if (!groupedMappers[source]) {
          groupedMappers[source] = [];
        }

        groupedMappers[source].push({ identifier, asDefault });
      }
    };

    Object.keys(this.config.mappers)
      .map(gqlTypeName => ({ gqlType: gqlTypeName, mapper: this.config.mappers[gqlTypeName] }))
      .filter(({ mapper }) => mapper.isExternal)
      .forEach(({ mapper }) => {
        const externalMapper = mapper as ExternalParsedMapper;
        const identifier = stripMapperTypeInterpolation(externalMapper.import);
        addMapper(externalMapper.source, identifier, externalMapper.default);
      });

    if (this.config.contextType.isExternal) {
      addMapper(this.config.contextType.source, this.config.contextType.import, this.config.contextType.default);
    }

    if (this.config.rootValueType.isExternal) {
      addMapper(this.config.rootValueType.source, this.config.rootValueType.import, this.config.rootValueType.default);
    }

    if (this.config.defaultMapper && this.config.defaultMapper.isExternal) {
      const identifier = stripMapperTypeInterpolation(this.config.defaultMapper.import);
      addMapper(this.config.defaultMapper.source, identifier, this.config.defaultMapper.default);
    }

    Object.values(this._fieldContextTypeMap).forEach(parsedMapper => {
      if (parsedMapper.isExternal) {
        addMapper(parsedMapper.source, parsedMapper.import, parsedMapper.default);
      }
    });

    return Object.keys(groupedMappers)
      .map(source => this.buildMapperImport(source, groupedMappers[source]))
      .filter(Boolean);
  }

  protected buildMapperImport(source: string, types: { identifier: string; asDefault?: boolean }[]): string | null {
    if (!types || types.length === 0) {
      return null;
    }

    const defaultType = types.find(t => t.asDefault === true);
    const namedTypes = types.filter(t => !t.asDefault);

    // { Foo, Bar as BarModel }
    const namedImports = namedTypes.length ? `{ ${namedTypes.map(t => t.identifier).join(', ')} }` : '';
    // Baz
    const defaultImport = defaultType ? defaultType.identifier : '';

    // Baz, { Foo, Bar as BarModel }
    return `import ${[defaultImport, namedImports].filter(Boolean).join(', ')} from '${source}';`;
  }

  setDeclarationBlockConfig(config: DeclarationBlockConfig): void {
    this._declarationBlockConfig = config;
  }

  setVariablesTransformer(variablesTransfomer: OperationVariablesToObject): void {
    this._variablesTransfomer = variablesTransfomer;
  }

  public hasScalars(): boolean {
    return this._hasScalars;
  }

  public hasFederation(): boolean {
    return this._hasFederation;
  }

  public getRootResolver(): string {
    const name = this.convertName('Resolvers');
    const declarationKind = 'type';
    const contextType = `<ContextType = ${this.config.contextType.type}>`;

    // This is here because we don't want to break IResolvers, so there is a mapping by default,
    // and if the developer is overriding typesPrefix, it won't get generated at all.
    const deprecatedIResolvers = !this.config.typesPrefix
      ? `
/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers${contextType} = ${name}<ContextType>;`
      : '';

    return [
      new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind(declarationKind)
        .withName(name, contextType)
        .withBlock(
          Object.keys(this._collectedResolvers)
            .map(schemaTypeName => {
              const resolverType = this._collectedResolvers[schemaTypeName];

              return indent(this.formatRootResolver(schemaTypeName, resolverType, declarationKind));
            })
            .join('\n')
        ).string,
      deprecatedIResolvers,
    ].join('\n');
  }

  protected formatRootResolver(schemaTypeName: string, resolverType: string, declarationKind: DeclarationKind): string {
    return `${schemaTypeName}${this.config.avoidOptionals ? '' : '?'}: ${resolverType}${this.getPunctuation(
      declarationKind
    )}`;
  }

  public getAllDirectiveResolvers(): string {
    if (Object.keys(this._collectedDirectiveResolvers).length) {
      const declarationKind = 'type';
      const name = this.convertName('DirectiveResolvers');
      const contextType = `<ContextType = ${this.config.contextType.type}>`;

      // This is here because we don't want to break IResolvers, so there is a mapping by default,
      // and if the developer is overriding typesPrefix, it won't get generated at all.
      const deprecatedIResolvers = !this.config.typesPrefix
        ? `
/**
 * @deprecated
 * Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
 */
export type IDirectiveResolvers${contextType} = ${name}<ContextType>;`
        : '';

      return [
        new DeclarationBlock(this._declarationBlockConfig)
          .export()
          .asKind(declarationKind)
          .withName(name, contextType)
          .withBlock(
            Object.keys(this._collectedDirectiveResolvers)
              .map(schemaTypeName => {
                const resolverType = this._collectedDirectiveResolvers[schemaTypeName];

                return indent(this.formatRootResolver(schemaTypeName, resolverType, declarationKind));
              })
              .join('\n')
          ).string,
        deprecatedIResolvers,
      ].join('\n');
    }

    return '';
  }

  Name(node: NameNode): string {
    return node.value;
  }

  ListType(node: ListTypeNode): string {
    const asString = (node.type as any) as string;

    return this.wrapWithArray(asString);
  }

  protected _getScalar(name: string): string {
    return `Scalars['${name}']`;
  }

  NamedType(node: NamedTypeNode): string {
    const nameStr = (node.name as any) as string;

    if (this.config.scalars[nameStr]) {
      return this._getScalar(nameStr);
    }

    return this.convertName(node);
  }

  NonNullType(node: NonNullTypeNode): string {
    const asString = (node.type as any) as string;

    return asString;
  }

  protected markMapperAsUsed(name: string): void {
    this._usedMappers[name] = true;
  }

  protected getTypeToUse(name: string): string {
    const resolversType = this.convertName('ResolversTypes');

    return `${resolversType}['${name}']`;
  }

  protected getParentTypeToUse(name: string): string {
    const resolversType = this.convertName('ResolversParentTypes');

    return `${resolversType}['${name}']`;
  }

  protected getParentTypeForSignature(node: FieldDefinitionNode) {
    return 'ParentType';
  }

  protected transformParentGenericType(parentType: string): string {
    return `ParentType extends ${parentType} = ${parentType}`;
  }

  FieldDefinition(node: FieldDefinitionNode, key: string | number, parent: any) {
    const hasArguments = node.arguments && node.arguments.length > 0;
    const declarationKind = 'type';

    return (parentName: string) => {
      const original: FieldDefinitionNode = parent[key];
      const baseType = getBaseTypeNode(original.type);
      const realType = baseType.name.value;
      const parentType = this.schema.getType(parentName);

      if (this._federation.skipField({ fieldNode: original, parentType: parentType })) {
        return null;
      }

      const typeToUse = this.getTypeToUse(realType);
      const mappedType = this._variablesTransfomer.wrapAstTypeWithModifiers(typeToUse, original.type);
      const subscriptionType = this._schema.getSubscriptionType();
      const isSubscriptionType = subscriptionType && subscriptionType.name === parentName;
      let argsType = hasArguments
        ? `${
            this.convertName(parentName, {
              useTypesPrefix: true,
            }) +
            (this.config.addUnderscoreToArgsType ? '_' : '') +
            this.convertName(node.name, {
              useTypesPrefix: false,
            }) +
            'Args'
          }`
        : null;

      if (argsType !== null) {
        const argsToForceRequire = original.arguments.filter(
          arg => !!arg.defaultValue || arg.type.kind === 'NonNullType'
        );

        if (argsToForceRequire.length > 0) {
          argsType = this.applyRequireFields(argsType, argsToForceRequire);
        } else if (original.arguments.length > 0) {
          argsType = this.applyOptionalFields(argsType, original.arguments);
        }
      }

      const parentTypeSignature = this._federation.transformParentType({
        fieldNode: original,
        parentType,
        parentTypeSignature: this.getParentTypeForSignature(node),
      });
      const mappedTypeKey = isSubscriptionType ? `${mappedType}, "${node.name}"` : mappedType;

      const signature: {
        name: string;
        modifier: string;
        type: string;
        genericTypes: string[];
      } = {
        name: node.name as any,
        modifier: this.config.avoidOptionals ? '' : '?',
        type: isSubscriptionType ? 'SubscriptionResolver' : 'Resolver',
        genericTypes: [
          mappedTypeKey,
          parentTypeSignature,
          this._fieldContextTypeMap[`${parentName}.${node.name}`]
            ? this._fieldContextTypeMap[`${parentName}.${node.name}`].type
            : 'ContextType',
          argsType,
        ].filter(f => f),
      };

      if (this._federation.isResolveReferenceField(node)) {
        this._hasFederation = true;
        signature.type = 'ReferenceResolver';

        if (signature.genericTypes.length >= 3) {
          signature.genericTypes = signature.genericTypes.slice(0, 3);
        }
      }

      return indent(
        `${signature.name}${signature.modifier}: ${signature.type}<${signature.genericTypes.join(
          ', '
        )}>${this.getPunctuation(declarationKind)}`
      );
    };
  }

  protected applyRequireFields(argsType: string, fields: InputValueDefinitionNode[]): string {
    this._globalDeclarations.add(REQUIRE_FIELDS_TYPE);
    return `RequireFields<${argsType}, ${fields.map(f => `'${f.name.value}'`).join(' | ')}>`;
  }

  protected applyOptionalFields(argsType: string, fields: readonly InputValueDefinitionNode[]): string {
    this._globalDeclarations.add(REQUIRE_FIELDS_TYPE);
    return `RequireFields<${argsType}, never>`;
  }

  ObjectTypeDefinition(node: ObjectTypeDefinitionNode) {
    const declarationKind = 'type';
    const name = this.convertName(node, {
      suffix: 'Resolvers',
    });
    const typeName = (node.name as any) as string;
    const parentType = this.getParentTypeToUse(typeName);
    const isRootType = [
      this.schema.getQueryType()?.name,
      this.schema.getMutationType()?.name,
      this.schema.getSubscriptionType()?.name,
    ].includes(typeName);

    const fieldsContent = node.fields.map((f: any) => f(node.name));

    if (!isRootType) {
      fieldsContent.push(indent(`__isTypeOf?: isTypeOfResolverFn<ParentType>${this.getPunctuation(declarationKind)}`));
    }

    const block = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(name, `<ContextType = ${this.config.contextType.type}, ${this.transformParentGenericType(parentType)}>`)
      .withBlock(fieldsContent.join('\n'));

    this._collectedResolvers[node.name as any] = name + '<ContextType>';

    return block.string;
  }

  UnionTypeDefinition(node: UnionTypeDefinitionNode, key: string | number, parent: any): string {
    const declarationKind = 'type';
    const name = this.convertName(node, {
      suffix: 'Resolvers',
    });
    const originalNode = parent[key] as UnionTypeDefinitionNode;
    const possibleTypes = originalNode.types
      .map(node => node.name.value)
      .map(f => `'${f}'`)
      .join(' | ');

    this._collectedResolvers[node.name as any] = name;
    const parentType = this.getParentTypeToUse((node.name as any) as string);

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(name, `<ContextType = ${this.config.contextType.type}, ${this.transformParentGenericType(parentType)}>`)
      .withBlock(
        indent(
          `__resolveType${
            this.config.optionalResolveType ? '?' : ''
          }: TypeResolveFn<${possibleTypes}, ParentType, ContextType>${this.getPunctuation(declarationKind)}`
        )
      ).string;
  }

  ScalarTypeDefinition(node: ScalarTypeDefinitionNode): string {
    const nameAsString = (node.name as any) as string;
    const baseName = this.getTypeToUse(nameAsString);

    if (this._federation.skipScalar(nameAsString)) {
      return null;
    }

    this._hasScalars = true;
    this._collectedResolvers[node.name as any] = 'GraphQLScalarType';

    return new DeclarationBlock({
      ...this._declarationBlockConfig,
      blockTransformer(block) {
        return block;
      },
    })
      .export()
      .asKind('interface')
      .withName(
        this.convertName(node, {
          suffix: 'ScalarConfig',
        }),
        ` extends GraphQLScalarTypeConfig<${baseName}, any>`
      )
      .withBlock(indent(`name: '${node.name}'${this.getPunctuation('interface')}`)).string;
  }

  DirectiveDefinition(node: DirectiveDefinitionNode, key, parent): string {
    if (this._federation.skipDirective(node.name as any)) {
      return null;
    }

    const directiveName = this.convertName(node, {
      suffix: 'DirectiveResolver',
    });
    const sourceNode = parent[key] as DirectiveDefinitionNode;
    const hasArguments = sourceNode.arguments && sourceNode.arguments.length > 0;

    this._collectedDirectiveResolvers[node.name as any] = directiveName + '<any, any, ContextType>';

    const directiveArgsTypeName = this.convertName(node, {
      suffix: 'DirectiveArgs',
    });

    return [
      new DeclarationBlock({
        ...this._declarationBlockConfig,
        blockTransformer(block) {
          return block;
        },
      })
        .export()
        .asKind('type')
        .withName(directiveArgsTypeName)
        .withContent(
          `{ ${
            hasArguments ? this._variablesTransfomer.transform<InputValueDefinitionNode>(sourceNode.arguments) : ''
          } }`
        ).string,
      new DeclarationBlock({
        ...this._declarationBlockConfig,
        blockTransformer(block) {
          return block;
        },
      })
        .export()
        .asKind('type')
        .withName(
          directiveName,
          `<Result, Parent, ContextType = ${this.config.contextType.type}, Args = ${directiveArgsTypeName}>`
        )
        .withContent(`DirectiveResolverFn<Result, Parent, ContextType, Args>`).string,
    ].join('\n');
  }

  InterfaceTypeDefinition(node: InterfaceTypeDefinitionNode): string {
    const name = this.convertName(node, {
      suffix: 'Resolvers',
    });
    const declarationKind = 'type';
    const allTypesMap = this._schema.getTypeMap();
    const implementingTypes: string[] = [];

    this._collectedResolvers[node.name as any] = name;

    for (const graphqlType of Object.values(allTypesMap)) {
      if (graphqlType instanceof GraphQLObjectType) {
        const allInterfaces = graphqlType.getInterfaces();
        if (allInterfaces.find(int => int.name === ((node.name as any) as string))) {
          implementingTypes.push(graphqlType.name);
        }
      }
    }

    const parentType = this.getParentTypeToUse((node.name as any) as string);

    const possibleTypes = implementingTypes.map(name => `'${name}'`).join(' | ') || 'null';

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(name, `<ContextType = ${this.config.contextType.type}, ${this.transformParentGenericType(parentType)}>`)
      .withBlock(
        [
          indent(
            `__resolveType${
              this.config.optionalResolveType ? '?' : ''
            }: TypeResolveFn<${possibleTypes}, ParentType, ContextType>${this.getPunctuation(declarationKind)}`
          ),
          ...(node.fields || []).map((f: any) => f(node.name)),
        ].join('\n')
      ).string;
  }

  SchemaDefinition() {
    return null;
  }
}

function replacePlaceholder(pattern: string, typename: string): string {
  return pattern.replace('{T}', typename);
}

function hasPlaceholder(pattern: string): boolean {
  return pattern.includes('{T}');
}
