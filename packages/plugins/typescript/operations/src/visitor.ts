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
  normalizeAvoidOptionals,
  NormalizedAvoidOptionalsConfig,
  ParsedDocumentsConfig,
  type ParsedEnumValuesMap,
  parseEnumValues,
  PreResolveTypesProcessor,
  SelectionSetProcessorConfig,
  SelectionSetToObject,
  getNodeComment,
  wrapTypeWithModifiers,
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
import { TypeScriptDocumentsPluginConfig } from './config.js';
import { TypeScriptOperationVariablesToObject, SCALARS } from './ts-operation-variables-to-object.js';

export interface TypeScriptDocumentsParsedConfig extends ParsedDocumentsConfig {
  arrayInputCoercion: boolean;
  avoidOptionals: NormalizedAvoidOptionalsConfig;
  immutableTypes: boolean;
  noExport: boolean;
  maybeValue: string;
  allowUndefinedQueryVariables: boolean;
  enumType: ConvertSchemaEnumToDeclarationBlockString['outputType'];
  enumValues: ParsedEnumValuesMap;
  ignoreEnumValuesFromSchema: boolean;
  futureProofEnums: boolean;
}

type UsedNamedInputTypes = Record<
  string,
  | { type: 'GraphQLScalarType'; node: GraphQLScalarType; tsType: string }
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

    this._usedNamedInputTypes = this.collectUsedInputTypes({ schema, documentNode });

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
          wrapOptional: type => this.config.maybeValue.replace('T', type),
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
        this.scalars,
        this.convertName.bind(this),
        // FIXME: this is the legacy avoidOptionals which was used to make Result fields non-optional. This use case is no longer valid.
        // It's also being used for Variables so people could already be using it.
        // Maybe it's better to deprecate and remove, to see what users think.
        this.config.avoidOptionals,
        this.config.immutableTypes,
        this.config.namespacedImportName,
        enumsNames,
        this.config.enumPrefix,
        this.config.enumSuffix,
        this.config.enumValues,
        this.config.arrayInputCoercion,
        undefined,
        undefined
      )
    );
    this._declarationBlockConfig = {
      ignoreExport: this.config.noExport,
      enumNameValueSeparator: ' =',
    };
  }

  EnumTypeDefinition(node: EnumTypeDefinitionNode): string | null {
    const enumName = node.name.value;
    if (!this._usedNamedInputTypes[enumName] || this.config.importSchemaTypesFrom) {
      return null;
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
    if (!this._usedNamedInputTypes[inputTypeName]) {
      return null;
    }

    if (isOneOfInputObjectType(this._schema.getType(inputTypeName))) {
      return new DeclarationBlock(this._declarationBlockConfig)
        .asKind('type')
        .withName(this.convertName(node))
        .withComment(node.description?.value)
        .withContent(`\n` + (node.fields || []).join('\n  |')).string;
    }

    return new DeclarationBlock(this._declarationBlockConfig)
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
          typePart += ' | null | undefined';
        }
        continue;
      }

      if (typeNode.type === 'ListType') {
        typePart = `Array<${typePart}>`;
        if (!typeNode.isNonNullable) {
          typePart += ' | null | undefined';
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

    const hasTypesToImport = Object.keys(this._usedNamedInputTypes).length > 0;

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

  protected getPunctuation(_declarationKind: DeclarationKind): string {
    return ';';
  }

  protected applyVariablesWrapper(variablesBlock: string, operationType: string): string {
    const extraType = this.config.allowUndefinedQueryVariables && operationType === 'Query' ? ' | undefined' : '';
    this._needsExactUtilityType = true;
    return `Exact<${variablesBlock === '{}' ? `{ [key: string]: never; }` : variablesBlock}>${extraType}`;
  }

  private collectInnerTypesRecursively(node: GraphQLNamedInputType, usedInputTypes: UsedNamedInputTypes): void {
    if (usedInputTypes[node.name]) {
      return;
    }

    if (node instanceof GraphQLEnumType) {
      usedInputTypes[node.name] = {
        type: 'GraphQLEnumType',
        node,
        tsType: this.convertName(node.name),
      };
      return;
    }

    if (node instanceof GraphQLScalarType) {
      usedInputTypes[node.name] = {
        type: 'GraphQLScalarType',
        node,
        tsType: (SCALARS[node.name] || this.config.scalars?.[node.name]?.input.type) ?? 'unknown',
      };
      return;
    }

    // GraphQLInputObjectType
    usedInputTypes[node.name] = {
      type: 'GraphQLInputObjectType',
      node,
      tsType: this.convertName(node.name),
    };

    const fields = node.getFields();
    for (const field of Object.values(fields)) {
      const fieldType = getNamedType(field.type);
      this.collectInnerTypesRecursively(fieldType, usedInputTypes);
    }
  }

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
              this.collectInnerTypesRecursively(foundInputType, usedInputTypes);
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
            }
          }
        },
      })
    );

    return usedInputTypes;
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
