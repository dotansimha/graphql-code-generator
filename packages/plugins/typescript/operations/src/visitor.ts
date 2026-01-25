import {
  BaseDocumentsVisitor,
  type ConvertSchemaEnumToDeclarationBlockString,
  convertSchemaEnumToDeclarationBlockString,
  DeclarationBlock,
  DeclarationKind,
  generateFragmentImportStatement,
  generateImportStatement,
  getConfigValue,
  indent,
  isOneOfInputObjectType,
  getEnumsImports,
  isNativeNamedType,
  LoadedFragment,
  ParsedDocumentsConfig,
  type ParsedEnumValuesMap,
  parseEnumValues,
  PreResolveTypesProcessor,
  SelectionSetProcessorConfig,
  SelectionSetToObject,
  getNodeComment,
  wrapTypeWithModifiers,
  printTypeScriptMaybeType,
  buildTypeImport,
} from '@graphql-codegen/visitor-plugin-common';
import { normalizeImportExtension } from '@graphql-codegen/plugin-helpers';
import autoBind from 'auto-bind';
import {
  type DocumentNode,
  EnumTypeDefinitionNode,
  type FragmentDefinitionNode,
  getNamedType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  type GraphQLNamedInputType,
  GraphQLScalarType,
  type GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  isEnumType,
  Kind,
  type TypeDefinitionNode,
  TypeInfo,
  type TypeNode,
  visit,
  visitWithTypeInfo,
} from 'graphql';
import type { TypeScriptDocumentsPluginConfig } from './config.js';
import { TypeScriptOperationVariablesToObject, SCALARS } from './ts-operation-variables-to-object.js';
import { normalizeAvoidOptionals, NormalizedAvoidOptionalsConfig } from './config.avoidOptionals.js';

export interface TypeScriptDocumentsParsedConfig extends ParsedDocumentsConfig {
  arrayInputCoercion: boolean;
  avoidOptionals: NormalizedAvoidOptionalsConfig;
  immutableTypes: boolean;
  noExport: boolean;
  maybeValue: string;
  inputMaybeValue: string;
  allowUndefinedQueryVariables: boolean;
  enumType: ConvertSchemaEnumToDeclarationBlockString['outputType'];
  enumValues: ParsedEnumValuesMap;
  ignoreEnumValuesFromSchema: boolean;
  futureProofEnums: boolean;
}

type UsedNamedInputTypes = Record<
  string,
  | {
      type: 'GraphQLScalarType';
      node: GraphQLScalarType;
      tsType: string;
      useCases: { input: boolean; output: boolean; variables: boolean };
    }
  | { type: 'GraphQLEnumType'; node: GraphQLEnumType; tsType: string }
  | { type: 'GraphQLInputObjectType'; node: GraphQLInputObjectType; tsType: string }
>;

export class TypeScriptDocumentsVisitor extends BaseDocumentsVisitor<
  TypeScriptDocumentsPluginConfig,
  TypeScriptDocumentsParsedConfig
> {
  protected _usedNamedInputTypes: UsedNamedInputTypes = {};
  protected _needsExactUtilityType: boolean = false;
  private _outputPath: string;

  constructor(
    schema: GraphQLSchema,
    config: TypeScriptDocumentsPluginConfig,
    documentNode: DocumentNode,
    outputPath: string
  ) {
    super(
      config,
      {
        arrayInputCoercion: getConfigValue(config.arrayInputCoercion, true),
        noExport: getConfigValue(config.noExport, false),
        avoidOptionals: normalizeAvoidOptionals(getConfigValue(config.avoidOptionals, false)),
        immutableTypes: getConfigValue(config.immutableTypes, false),
        nonOptionalTypename: getConfigValue(config.nonOptionalTypename, false),
        mergeFragmentTypes: getConfigValue(config.mergeFragmentTypes, false),
        allowUndefinedQueryVariables: getConfigValue(config.allowUndefinedQueryVariables, false),
        enumType: getConfigValue(config.enumType, 'string-literal'),
        enumValues: parseEnumValues({
          schema,
          mapOrStr: config.enumValues,
          ignoreEnumValuesFromSchema: config.ignoreEnumValuesFromSchema,
        }),
        ignoreEnumValuesFromSchema: getConfigValue(config.ignoreEnumValuesFromSchema, false),
        futureProofEnums: getConfigValue(config.futureProofEnums, false),
        maybeValue: getConfigValue(config.maybeValue, 'T | null'),
        inputMaybeValue: getConfigValue(config.inputMaybeValue, 'T | null | undefined'),
      } as TypeScriptDocumentsParsedConfig,
      schema
    );

    this._outputPath = outputPath;
    autoBind(this);

    const allFragments: LoadedFragment[] = [
      ...(documentNode.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(
        fragmentDef => ({
          node: fragmentDef,
          name: fragmentDef.name.value,
          onType: fragmentDef.typeCondition.name.value,
          isExternal: false,
        })
      ),
      ...(config.externalFragments || []),
    ];

    // Create a combined document that includes operations, internal and external fragments for enum collection
    const documentWithAllFragments: DocumentNode = {
      ...documentNode,
      definitions: [
        ...documentNode.definitions.filter(d => d.kind !== Kind.FRAGMENT_DEFINITION),
        ...allFragments.map(f => f.node),
      ],
    };

    this._usedNamedInputTypes = this.collectUsedInputTypes({ schema, documentNode: documentWithAllFragments });

    const processorConfig: SelectionSetProcessorConfig = {
      namespacedImportName: this.config.namespacedImportName,
      convertName: this.convertName.bind(this),
      enumPrefix: this.config.enumPrefix,
      enumSuffix: this.config.enumSuffix,
      scalars: this.scalars,
      formatNamedField: ({ name, isOptional }) => {
        return (this.config.immutableTypes ? `readonly ${name}` : name) + (isOptional ? '?' : '');
      },
      wrapTypeWithModifiers: (baseType, type) => {
        return wrapTypeWithModifiers(baseType, type, {
          wrapOptional: type =>
            printTypeScriptMaybeType({
              type,
              pattern: this.config.maybeValue,
            }),
          wrapArray: type => {
            const listModifier = this.config.immutableTypes ? 'ReadonlyArray' : 'Array';
            return `${listModifier}<${type}>`;
          },
        });
      },
      printFieldsOnNewLines: this.config.printFieldsOnNewLines,
    };

    this.setSelectionSetHandler(
      new SelectionSetToObject(
        new PreResolveTypesProcessor(processorConfig),
        this.scalars,
        this.schema,
        this.convertName.bind(this),
        this.getFragmentSuffix.bind(this),
        allFragments,
        this.config
      )
    );

    const enumsNames = Object.keys(schema.getTypeMap()).filter(typeName => isEnumType(schema.getType(typeName)));
    this.setVariablesTransformer(
      new TypeScriptOperationVariablesToObject(
        {
          avoidOptionals: this.config.avoidOptionals,
          immutableTypes: this.config.immutableTypes,
          inputMaybeValue: this.config.inputMaybeValue,
        },
        this.scalars,
        this.convertName.bind(this),
        this.config.namespacedImportName,
        enumsNames,
        this.config.enumPrefix,
        this.config.enumSuffix,
        this.config.enumValues,
        this.config.arrayInputCoercion
      )
    );
    this._declarationBlockConfig = {
      ignoreExport: this.config.noExport,
      enumNameValueSeparator: ' =',
    };
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string | null {
    const enumName = node.name.value;
    if (
      !this._usedNamedInputTypes[enumName] || // If not used...
      this.config.importSchemaTypesFrom // ... Or, is imported from a shared file
    ) {
      return null; // ... then, don't generate in this file
    }

    return convertSchemaEnumToDeclarationBlockString({
      schema: this._schema,
      node,
      declarationBlockConfig: this._declarationBlockConfig,
      enumName,
      enumValues: this.config.enumValues,
      futureProofEnums: this.config.futureProofEnums,
      ignoreEnumValuesFromSchema: this.config.ignoreEnumValuesFromSchema,
      outputType: this.config.enumType,
      naming: {
        convert: this.config.convert,
        typesPrefix: this.config.typesPrefix,
        typesSuffix: this.config.typesSuffix,
        useTypesPrefix: this.config.enumPrefix,
        useTypesSuffix: this.config.enumSuffix,
      },
    });
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string | null {
    const inputTypeName = node.name.value;
    if (
      !this._usedNamedInputTypes[inputTypeName] || // If not used...
      this.config.importSchemaTypesFrom // ... Or, is imported from a shared file
    ) {
      return null; // ... then, don't generate in this file
    }

    // Note: we usually don't need to export this type,
    // however, it's not possible to know if another file is using this type e.g. using `importSchemaTypesFrom`,
    // so it's better export the types.

    if (isOneOfInputObjectType(this._schema.getType(inputTypeName))) {
      return new DeclarationBlock(this._declarationBlockConfig)
        .export()
        .asKind('type')
        .withName(this.convertName(node))
        .withComment(node.description?.value)
        .withContent(`\n` + (node.fields || []).join('\n  |')).string;
    }

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withComment(node.description?.value)
      .withBlock((node.fields || []).join('\n')).string;
  }

  InputValueDefinition(
    node: InputValueDefinitionNode,
    _key?: number | string,
    _parent?: any,
    _path?: Array<string | number>,
    ancestors?: Array<TypeDefinitionNode>
  ): string {
    const oneOfDetails = parseOneOfInputValue({
      node,
      schema: this._schema,
      ancestors,
    });

    // 1. Flatten GraphQL type nodes to make it easier to turn into string
    // GraphQL type nodes may have `NonNullType` type before each `ListType` or `NamedType`
    // This make it a bit harder to know whether a `ListType` or `Namedtype` is nullable without looking at the node before it.
    // Flattening it into an array where the nullability is in `ListType` and `NamedType` makes it easier to code,
    //
    // So, we recursively call `collectAndFlattenTypeNodes` to handle the following scenarios:
    // - [Thing]
    // - [Thing!]
    // - [Thing]!
    // - [Thing!]!
    const typeNodes: Parameters<typeof collectAndFlattenTypeNodes>[0]['typeNodes'] = [];
    collectAndFlattenTypeNodes({
      currentTypeNode: node.type,
      isPreviousNodeNonNullable: oneOfDetails.isOneOfInputValue, // If the InputValue is part of @oneOf input, we treat it as non-null (even if it must be null in the schema)
      typeNodes,
    });

    // 2. Generate the type of a TypeScript field declaration
    // e.g. `field?: string`, then the `string` is the `typePart`
    let typePart: string = '';
    // We call `.reverse()` here to get the base type node first
    for (const typeNode of typeNodes.reverse()) {
      if (typeNode.type === 'NamedType') {
        const usedInputType = this._usedNamedInputTypes[typeNode.name];
        if (!usedInputType) {
          continue;
        }

        typePart = usedInputType.tsType; // If the schema is correct, when reversing typeNodes, the first node would be `NamedType`, which means we can safely set it as the base for typePart
        if (!typeNode.isNonNullable) {
          typePart = printTypeScriptMaybeType({
            type: typePart,
            pattern: this.config.inputMaybeValue,
          });
        }
        continue;
      }

      if (typeNode.type === 'ListType') {
        typePart = `Array<${typePart}>`;
        if (!typeNode.isNonNullable) {
          typePart = printTypeScriptMaybeType({
            type: typePart,
            pattern: this.config.inputMaybeValue,
          });
        }
      }
    }

    // TODO: eddeee888 check if we want to support `directiveArgumentAndInputFieldMappings` for operations
    // if (node.directives && this.config.directiveArgumentAndInputFieldMappings) {
    //   typePart =
    //     getDirectiveOverrideType({
    //       directives: node.directives,
    //       directiveArgumentAndInputFieldMappings: this.config.directiveArgumentAndInputFieldMappings,
    //     }) || typePart;
    // }

    const addOptionalSign =
      !oneOfDetails.isOneOfInputValue &&
      !this.config.avoidOptionals.inputValue &&
      (node.type.kind !== Kind.NON_NULL_TYPE ||
        (!this.config.avoidOptionals.defaultValue && node.defaultValue !== undefined));

    // 3. Generate the keyPart of the TypeScript field declaration
    // e.g. `field?: string`, then the `field?` is the `keyPart`
    const keyPart = `${node.name.value}${addOptionalSign ? '?' : ''}`;

    // 4. other parts of TypeScript field declaration
    const commentPart = getNodeComment(node);
    const readonlyPart = this.config.immutableTypes ? 'readonly ' : '';

    const currentInputValue = commentPart + indent(`${readonlyPart}${keyPart}: ${typePart};`);

    // 5. Check if field is part of `@oneOf` input type
    // If yes, we must generate a union member where the current inputValue must be provieded, and the others are not
    // e.g.
    // ```graphql
    // input UserInput {
    //   byId: ID
    //   byEmail: String
    //   byLegacyId: ID
    // }
    // ```
    //
    // Then, the generated type is:
    // ```ts
    // type UserInput =
    //   | { byId: string | number; byEmail?: never; byLegacyId?: never }
    //   | { byId?: never; byEmail: string; byLegacyId?: never }
    //   | { byId?: never; byEmail?: never; byLegacyId: string | number }
    // ```
    if (oneOfDetails.isOneOfInputValue) {
      const fieldParts: Array<string> = [];
      for (const fieldName of Object.keys(oneOfDetails.parentType.getFields())) {
        if (fieldName === node.name.value) {
          fieldParts.push(currentInputValue);
          continue;
        }
        fieldParts.push(`${readonlyPart}${fieldName}?: never;`);
      }
      return indent(`{ ${fieldParts.join(' ')} }`);
    }

    // If field is not part of @oneOf input type, then it's a input value, just return as-is
    return currentInputValue;
  }

  public getImports(): Array<string> {
    return !this.config.globalNamespace &&
      (this.config.inlineFragmentTypes === 'combine' || this.config.inlineFragmentTypes === 'mask')
      ? this.config.fragmentImports.map(fragmentImport => generateFragmentImportStatement(fragmentImport, 'type'))
      : [];
  }

  public getExternalSchemaTypeImports(): Array<string> {
    if (!this.config.importSchemaTypesFrom) {
      return [];
    }

    const hasTypesToImport =
      Object.values(this._usedNamedInputTypes).filter(
        value => value.type === 'GraphQLEnumType' || value.type === 'GraphQLInputObjectType' // Only Enums and Inputs are stored in the shared type file (never Scalar), so we should only print import line if Enums and Inputs are used.
      ).length > 0;

    if (!hasTypesToImport) {
      return [];
    }

    return [
      generateImportStatement({
        baseDir: process.cwd(),
        baseOutputDir: '',
        outputPath: this._outputPath,
        importSource: {
          path: this.config.importSchemaTypesFrom,
          namespace: this.config.namespacedImportName,
          identifiers: [],
        },
        typesImport: true,
        emitLegacyCommonJSImports: this.config.emitLegacyCommonJSImports,
        importExtension: normalizeImportExtension({
          emitLegacyCommonJSImports: this.config.emitLegacyCommonJSImports,
          importExtension: this.config.importExtension,
        }),
      }),
    ];
  }

  public getEnumsImports(): string[] {
    const usedEnumMap: ParsedEnumValuesMap = {};
    for (const [enumName, enumDetails] of Object.entries(this.config.enumValues)) {
      if (this._usedNamedInputTypes[enumName]) {
        usedEnumMap[enumName] = enumDetails;
      }
    }

    return getEnumsImports({
      enumValues: usedEnumMap,
      useTypeImports: this.config.useTypeImports,
    });
  }

  public getScalarsImports(): string[] {
    const fileType: 'shared-type-file' | 'operation-file' =
      this.config.importSchemaTypesFrom || // For output use cases, generates it when it an operation file i.e. import schema types...
      this.config.generatesOperationTypes
        ? 'operation-file'
        : 'shared-type-file';
    const imports: {
      [source: string]: // `source` is where to import from e.g. './relative-import', 'package-import', '@org/package'
      {
        identifiers: {
          [identifier: string]: // `identifier` is the name of import, this could be used for named or default imports
          { asDefault: boolean };
        };
      };
    } = {};
    for (const [scalarName, parsedScalar] of Object.entries(this.config.scalars)) {
      const usedScalar = this._usedNamedInputTypes[scalarName];
      if (!usedScalar || usedScalar.type !== 'GraphQLScalarType') {
        continue;
      }

      if (
        parsedScalar.input.isExternal &&
        ((usedScalar.useCases.input && fileType === 'shared-type-file') ||
          (usedScalar.useCases.variables && fileType === 'operation-file'))
      ) {
        imports[parsedScalar.input.source] ||= { identifiers: {} };
        imports[parsedScalar.input.source].identifiers[parsedScalar.input.import] = {
          asDefault: parsedScalar.input.default,
        };
      }

      if (parsedScalar.output.isExternal && usedScalar.useCases.output && fileType === 'operation-file') {
        imports[parsedScalar.output.source] ||= { identifiers: {} };
        imports[parsedScalar.output.source].identifiers[parsedScalar.output.import] = {
          asDefault: parsedScalar.output.default,
        };
      }
    }

    return Object.entries(imports).reduce<string[]>((res, [importSource, importParams]) => {
      // One import statement cannot have multiple defaults.
      // So:
      // - split each defaults into its own statements
      // - the named imports can all go together, tracked by `namedImports`
      const namedImports = [];
      for (const [identifier, identifierMetadata] of Object.entries(importParams.identifiers)) {
        if (identifierMetadata.asDefault) {
          res.push(
            buildTypeImport({
              identifier,
              source: importSource,
              asDefault: true,
              useTypeImports: this.config.useTypeImports,
            })
          );
          continue;
        }

        namedImports.push(identifier);
      }

      if (namedImports.length > 0) {
        res.push(
          buildTypeImport({
            identifier: namedImports.join(', '),
            source: importSource,
            asDefault: false,
            useTypeImports: this.config.useTypeImports,
          })
        );
      }

      return res;
    }, []);
  }

  protected getPunctuation(_declarationKind: DeclarationKind): string {
    return ';';
  }

  protected applyVariablesWrapper(variablesBlock: string, operationType: string): string {
    const extraType = this.config.allowUndefinedQueryVariables && operationType === 'Query' ? ' | undefined' : '';
    this._needsExactUtilityType = true;
    return `Exact<${variablesBlock === '{}' ? `{ [key: string]: never; }` : variablesBlock}>${extraType}`;
  }

  private collectInnerTypesRecursively({
    node,
    usedInputTypes,
    location,
  }: {
    node: GraphQLNamedInputType;
    usedInputTypes: UsedNamedInputTypes;
    location: 'variables' | 'input'; // the location where the node was found. This is useful for nested input. Note: Since it starts at the variable, it first iteration is 'variables' and the rest will be `input`
  }): void {
    if (node instanceof GraphQLEnumType) {
      if (usedInputTypes[node.name]) {
        return;
      }

      usedInputTypes[node.name] = {
        type: 'GraphQLEnumType',
        node,
        tsType: this.convertName(node.name),
      };
      return;
    }

    if (node instanceof GraphQLScalarType) {
      const scalarType = usedInputTypes[node.name] || {
        type: 'GraphQLScalarType',
        node,
        tsType: (SCALARS[node.name] || this.config.scalars?.[node.name]?.input.type) ?? 'unknown',
        useCases: {
          variables: location === 'variables',
          input: location === 'input',
          output: false,
        },
      };

      if (scalarType.type !== 'GraphQLScalarType') {
        throw new Error(`${node.name} has been incorrectly parsed as Scalar. This should not happen.`);
      }

      // ensure scalar's useCases is updated to have `useCases.input:true` or `useCases.variables:true`, depending on the use case
      // this is required because if the scalar has been parsed previously, it may only have `useCases.output:true`, and not `useCases.input:true` or `useCases.variables:true`
      if (location === 'input') {
        scalarType.useCases.input = true;
      }
      if (location === 'variables') {
        scalarType.useCases.variables = true;
      }

      usedInputTypes[node.name] = scalarType;
      return;
    }

    // GraphQLInputObjectType
    if (usedInputTypes[node.name]) {
      return;
    }
    usedInputTypes[node.name] = {
      type: 'GraphQLInputObjectType',
      node,
      tsType: this.convertName(node.name),
    };

    const fields = node.getFields();
    for (const field of Object.values(fields)) {
      const fieldType = getNamedType(field.type);
      this.collectInnerTypesRecursively({
        node: fieldType,
        usedInputTypes,
        location: 'input',
      });
    }
  }

  /**
   * FIXME: This function is called `collectUsedInputTypes`, but it collects the types used in Result (SelectionSet) as well:
   * - used Enums for Variables
   * - used Scalars for Variables
   * - used Input for Variables
   *
   * - used Enums for Result
   * - used Scalars for Result
   */
  private collectUsedInputTypes({
    schema,
    documentNode,
  }: {
    schema: GraphQLSchema;
    documentNode: DocumentNode;
  }): UsedNamedInputTypes {
    const schemaTypes = schema.getTypeMap();

    const usedInputTypes: UsedNamedInputTypes = {};

    // Collect input enums and input types
    visit(documentNode, {
      VariableDefinition: variableDefinitionNode => {
        visit(variableDefinitionNode, {
          NamedType: namedTypeNode => {
            const foundInputType = schemaTypes[namedTypeNode.name.value];
            if (
              foundInputType &&
              (foundInputType instanceof GraphQLInputObjectType ||
                foundInputType instanceof GraphQLScalarType ||
                foundInputType instanceof GraphQLEnumType) &&
              !isNativeNamedType(foundInputType)
            ) {
              this.collectInnerTypesRecursively({
                node: foundInputType,
                usedInputTypes,
                location: 'variables',
              });
            }
          },
        });
      },
    });

    // Collect output enums
    const typeInfo = new TypeInfo(schema);
    visit(
      documentNode,
      // AST doesn’t include field types (they are defined in schema) - only names.
      // TypeInfo is a stateful helper that tracks typing context while walking the AST
      // visitWithTypeInfo wires that context into a visitor.
      visitWithTypeInfo(typeInfo, {
        Field: () => {
          const fieldType = typeInfo.getType();
          if (fieldType) {
            const namedType = getNamedType(fieldType);

            if (namedType instanceof GraphQLEnumType) {
              usedInputTypes[namedType.name] = {
                type: 'GraphQLEnumType',
                node: namedType,
                tsType: this.convertName(namedType.name),
              };
              return;
            }

            if (namedType instanceof GraphQLScalarType) {
              const scalarType = usedInputTypes[namedType.name] || {
                type: 'GraphQLScalarType',
                node: namedType,
                tsType: this.convertName(namedType.name),
                useCases: { variables: false, input: false, output: true },
              };

              if (scalarType.type !== 'GraphQLScalarType') {
                throw new Error(`${namedType.name} has been incorrectly parsed as Scalar. This should not happen.`);
              }

              // ensure scalar's useCases is updated to have `useCases.output:true`
              // this is required because if the scalar has been parsed previously, it may only have `useCases.input:true` or `useCases.variables:true`, not `useCases.output:true`
              scalarType.useCases.output = true;

              usedInputTypes[namedType.name] = scalarType;
            }
          }
        },
      })
    );

    return usedInputTypes;
  }

  getExactUtilityType(): string | null {
    if (
      !this.config.generatesOperationTypes || // 1. If we don't generate operation types, definitely do not need `Exact`
      !this._needsExactUtilityType // 2. Even if we generate operation types, we may not need `Exact` if there's no operations in the documents i.e. only fragments found
    ) {
      return null;
    }

    return 'type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };';
  }

  getIncrementalUtilityType(): string | null {
    if (!this.config.generatesOperationTypes) {
      return null;
    }

    // Note: `export` here is important for 2 reasons
    // 1. It is not always used in the rest of the file, so this is a safe way to avoid lint rules (in tsconfig or eslint) complaining it's not used in the current file.
    // 2. In Client Preset, it is used by fragment-masking.ts, so it needs `export`
    return "export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };";
  }
}

function parseOneOfInputValue({
  node,
  schema,
  ancestors,
}: {
  node: InputValueDefinitionNode;
  schema: GraphQLSchema;
  ancestors?: Array<TypeDefinitionNode>;
}):
  | { isOneOfInputValue: true; realParentDef: TypeDefinitionNode; parentType: GraphQLInputObjectType }
  | { isOneOfInputValue: false } {
  const realParentDef = ancestors?.[ancestors.length - 1];
  if (realParentDef) {
    const parentType = schema.getType(realParentDef.name.value);
    if (isOneOfInputObjectType(parentType)) {
      if (node.type.kind === Kind.NON_NULL_TYPE) {
        throw new Error(
          'Fields on an input object type can not be non-nullable. It seems like the schema was not validated.'
        );
      }
      return { isOneOfInputValue: true, realParentDef, parentType };
    }
  }
  return { isOneOfInputValue: false };
}

function collectAndFlattenTypeNodes({
  currentTypeNode,
  isPreviousNodeNonNullable,
  typeNodes,
}: {
  currentTypeNode: TypeNode;
  isPreviousNodeNonNullable: boolean;
  typeNodes: Array<
    { type: 'ListType'; isNonNullable: boolean } | { type: 'NamedType'; isNonNullable: boolean; name: string }
  >;
}): void {
  if (currentTypeNode.kind === Kind.NON_NULL_TYPE) {
    const nextTypeNode = currentTypeNode.type;
    collectAndFlattenTypeNodes({ currentTypeNode: nextTypeNode, isPreviousNodeNonNullable: true, typeNodes });
  } else if (currentTypeNode.kind === Kind.LIST_TYPE) {
    typeNodes.push({ type: 'ListType', isNonNullable: isPreviousNodeNonNullable });

    const nextTypeNode = currentTypeNode.type;
    collectAndFlattenTypeNodes({ currentTypeNode: nextTypeNode, isPreviousNodeNonNullable: false, typeNodes });
  } else if (currentTypeNode.kind === Kind.NAMED_TYPE) {
    typeNodes.push({
      type: 'NamedType',
      isNonNullable: isPreviousNodeNonNullable,
      name: currentTypeNode.name.value,
    });
  }
}
