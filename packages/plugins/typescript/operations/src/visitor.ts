import {
  BaseDocumentsVisitor,
  DeclarationBlock,
  DeclarationKind,
  generateFragmentImportStatement,
  getConfigValue,
  indent,
  LoadedFragment,
  normalizeAvoidOptionals,
  NormalizedAvoidOptionalsConfig,
  ParsedDocumentsConfig,
  ParsedEnumValuesMap,
  parseEnumValues,
  PreResolveTypesProcessor,
  SelectionSetProcessorConfig,
  SelectionSetToObject,
  transformComment,
  wrapTypeWithModifiers,
  wrapWithSingleQuotes,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import {
  type DocumentNode,
  EnumTypeDefinitionNode,
  type FragmentDefinitionNode,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLNamedInputType,
  type GraphQLNamedType,
  type GraphQLOutputType,
  GraphQLScalarType,
  type GraphQLSchema,
  isEnumType,
  isNonNullType,
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
  enumType: 'string-literal' | 'numeric' | 'const' | 'native-const' | 'native';
  futureProofEnums: boolean;
  enumValues: ParsedEnumValuesMap;
}

type UsedNamedInputTypes = Record<string, GraphQLNamedInputType>;

export class TypeScriptDocumentsVisitor extends BaseDocumentsVisitor<
  TypeScriptDocumentsPluginConfig,
  TypeScriptDocumentsParsedConfig
> {
  protected _usedNamedInputTypes: UsedNamedInputTypes = {};
  constructor(schema: GraphQLSchema, config: TypeScriptDocumentsPluginConfig, documentNode: DocumentNode) {
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

    const formatNamedField = (
      name: string,
      type: GraphQLOutputType | GraphQLNamedType | null,
      isConditional = false,
      isOptional = false
    ): string => {
      const optional =
        isOptional || isConditional || (!this.config.avoidOptionals.field && !!type && !isNonNullType(type));
      return (this.config.immutableTypes ? `readonly ${name}` : name) + (optional ? '?' : '');
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
      formatNamedField,
      wrapTypeWithModifiers(baseType, type) {
        return wrapTypeWithModifiers(baseType, type, { wrapOptional, wrapArray });
      },
      avoidOptionals: this.config.avoidOptionals,
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
    };
  }

  // TODO: share with `typescript`?
  // https://github.com/dotansimha/graphql-code-generator/blob/72e57eca5d8e2e6ae9a642532cf4c41692466f7c/packages/plugins/typescript/typescript/src/visitor.ts#L344
  EnumTypeDefinition(node: EnumTypeDefinitionNode): string {
    const enumName = node.name.value;
    if (!this._usedNamedInputTypes[enumName]) {
      return null;
    }

    // In case of mapped external enum string
    if (this.config.enumValues[enumName]?.sourceFile) {
      return `export { ${this.config.enumValues[enumName].typeIdentifier} };\n`;
    }

    const getValueFromConfig = (enumValue: string | number): string | number | null => {
      const value = this.config.enumValues[enumName]?.mappedValues?.[enumValue];
      if (typeof value !== 'undefined') {
        return value;
      }
      return null;
    };

    const enumTypeName = this.convertName(node, {
      useTypesPrefix: this.config.enumPrefix,
      useTypesSuffix: this.config.enumSuffix,
    });

    const withFutureAddedValue = [
      this.config.futureProofEnums ? [indent('| ' + wrapWithSingleQuotes('%future added value'))] : [],
    ];

    // handle:
    // - enumValues x
    // - future added values

    // - ✅ enumsAsTypes
    // - numericEnums
    // - enumsAsConst
    // - native const enum
    // - native enum

    if (this.config.enumType === 'string-literal') {
      return new DeclarationBlock(this._declarationBlockConfig)
        .asKind('type')
        .withComment(node.description?.value)
        .withName(enumTypeName)
        .withContent(
          '\n' +
            node.values
              .map(enumValueNode => {
                const enumValueName = enumValueNode.name.value;
                const enumValue: string | number = getValueFromConfig(enumValueName) ?? enumValueName;
                const comment = transformComment(enumValueNode.description?.value, 1);

                return comment + indent('| ' + wrapWithSingleQuotes(enumValue));
              })
              .concat(...withFutureAddedValue)
              .join('\n')
        ).string;
    }

    return 'FOUND ';
  }

  public getImports(): Array<string> {
    return !this.config.globalNamespace &&
      (this.config.inlineFragmentTypes === 'combine' || this.config.inlineFragmentTypes === 'mask')
      ? this.config.fragmentImports.map(fragmentImport => generateFragmentImportStatement(fragmentImport, 'type'))
      : [];
  }

  protected getPunctuation(_declarationKind: DeclarationKind): string {
    return ';';
  }

  protected applyVariablesWrapper(variablesBlock: string, operationType: string): string {
    const prefix = this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '';
    const extraType = this.config.allowUndefinedQueryVariables && operationType === 'Query' ? ' | undefined' : '';

    return `${prefix}Exact<${variablesBlock === '{}' ? `{ [key: string]: never; }` : variablesBlock}>${extraType}`;
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
                foundInputType instanceof GraphQLEnumType)
            ) {
              usedInputTypes[namedTypeNode.name.value] = foundInputType;
            }
          },
        });
      },
    });

    return usedInputTypes;
  }
}
