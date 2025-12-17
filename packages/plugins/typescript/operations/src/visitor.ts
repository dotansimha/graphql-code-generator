import {
  BaseDocumentsVisitor,
  type ConvertSchemaEnumToDeclarationBlockString,
  convertSchemaEnumToDeclarationBlockString,
  DeclarationKind,
  generateFragmentImportStatement,
  generateImportStatement,
  getConfigValue,
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
  wrapTypeWithModifiers,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import {
  type DocumentNode,
  EnumTypeDefinitionNode,
  type FragmentDefinitionNode,
  GraphQLEnumType,
  GraphQLInputObjectType,
  type GraphQLNamedInputType,
  GraphQLScalarType,
  type GraphQLSchema,
  isEnumType,
  Kind,
  visit,
} from 'graphql';
import { TypeScriptDocumentsPluginConfig } from './config.js';
import { TypeScriptOperationVariablesToObject } from './ts-operation-variables-to-object.js';
import { TypeScriptSelectionSetProcessor } from './ts-selection-set-processor.js';

export interface TypeScriptDocumentsParsedConfig extends ParsedDocumentsConfig {
  arrayInputCoercion: boolean;
  avoidOptionals: NormalizedAvoidOptionalsConfig;
  immutableTypes: boolean;
  noExport: boolean;
  maybeValue: string;
  allowUndefinedQueryVariables: boolean;
  enumType: ConvertSchemaEnumToDeclarationBlockString['outputType'];
  futureProofEnums: boolean;
  enumValues: ParsedEnumValuesMap;
}

type UsedNamedInputTypes = Record<string, GraphQLNamedInputType>;

export class TypeScriptDocumentsVisitor extends BaseDocumentsVisitor<
  TypeScriptDocumentsPluginConfig,
  TypeScriptDocumentsParsedConfig
> {
  protected _usedNamedInputTypes: UsedNamedInputTypes = {};
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
        preResolveTypes: getConfigValue(config.preResolveTypes, true),
        mergeFragmentTypes: getConfigValue(config.mergeFragmentTypes, false),
        allowUndefinedQueryVariables: getConfigValue(config.allowUndefinedQueryVariables, false),
        enumType: getConfigValue(config.enumType, 'string-literal'),
        enumValues: parseEnumValues({
          schema,
          mapOrStr: config.enumValues,
          ignoreEnumValuesFromSchema: config.ignoreEnumValuesFromSchema,
        }),
        futureProofEnums: getConfigValue(config.futureProofEnums, false),
      } as TypeScriptDocumentsParsedConfig,
      schema
    );

    this._outputPath = outputPath;
    autoBind(this);

    const preResolveTypes = getConfigValue(config.preResolveTypes, true);
    const defaultMaybeValue = 'T | null';
    const maybeValue = getConfigValue(config.maybeValue, defaultMaybeValue);

    const wrapOptional = (type: string) => {
      if (preResolveTypes === true) {
        return maybeValue.replace('T', type);
      }
      const prefix = this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '';
      return `${prefix}Maybe<${type}>`;
    };
    const wrapArray = (type: string) => {
      const listModifier = this.config.immutableTypes ? 'ReadonlyArray' : 'Array';
      return `${listModifier}<${type}>`;
    };

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
      wrapTypeWithModifiers(baseType, type) {
        return wrapTypeWithModifiers(baseType, type, { wrapOptional, wrapArray });
      },
      printFieldsOnNewLines: this.config.printFieldsOnNewLines,
    };
    const processor = new (preResolveTypes ? PreResolveTypesProcessor : TypeScriptSelectionSetProcessor)(
      processorConfig
    );
    this.setSelectionSetHandler(
      new SelectionSetToObject(
        processor,
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
        'InputMaybe'
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
        // FIXME: rebase with master for the new extension
        emitLegacyCommonJSImports: true,
      }),
    ];
  }

  protected getPunctuation(_declarationKind: DeclarationKind): string {
    return ';';
  }

  protected applyVariablesWrapper(variablesBlock: string, operationType: string): string {
    const extraType = this.config.allowUndefinedQueryVariables && operationType === 'Query' ? ' | undefined' : '';

    return `Exact<${variablesBlock === '{}' ? `{ [key: string]: never; }` : variablesBlock}>${extraType}`;
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
              usedInputTypes[namedTypeNode.name.value] = foundInputType;
            }
          },
        });
      },
    });

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
    if (!this.config.generatesOperationTypes) {
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
