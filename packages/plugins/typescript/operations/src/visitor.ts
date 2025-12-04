import {
  BaseDocumentsVisitor,
  type ConvertSchemaEnumToDeclarationBlockString,
  convertSchemaEnumToDeclarationBlockString,
  DeclarationBlock,
  DeclarationKind,
  generateFragmentImportStatement,
  getConfigValue,
  indent,
  isOneOfInputObjectType,
  getEnumsImports,
  LoadedFragment,
  normalizeAvoidOptionals,
  NormalizedAvoidOptionalsConfig,
  ParsedDocumentsConfig,
  type ParsedEnumValuesMap,
  parseEnumValues,
  PreResolveTypesProcessor,
  SelectionSetProcessorConfig,
  SelectionSetToObject,
  transformComment,
  wrapTypeWithModifiers,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import {
  type DocumentNode,
  EnumTypeDefinitionNode,
  type FragmentDefinitionNode,
  getNamedType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  type GraphQLNamedInputType,
  type GraphQLNamedType,
  type GraphQLOutputType,
  GraphQLScalarType,
  type GraphQLSchema,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  isEnumType,
  isNonNullType,
  Kind,
  ListTypeNode,
  NamedTypeNode,
  NonNullTypeNode,
  ScalarTypeDefinitionNode,
  TypeInfo,
  visit,
  visitWithTypeInfo,
} from 'graphql';
import { TypeScriptDocumentsPluginConfig } from './config.js';
import { TypeScriptOperationVariablesToObject, SCALARS } from './ts-operation-variables-to-object.js';
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
    if (!this._usedNamedInputTypes[enumName]) {
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

  ScalarTypeDefinition(node: ScalarTypeDefinitionNode): string | null {
    const scalarName = node.name.value;

    // Don't generate type aliases for built-in scalars
    if (SCALARS[scalarName] || !this._usedNamedInputTypes[scalarName]) {
      return null;
    }

    // Check if a custom scalar mapping is provided in config
    const scalarType = this.scalars?.[scalarName]?.input ?? 'any';

    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withContent(scalarType).string;
  }

  InputObjectTypeDefinition(node: InputObjectTypeDefinitionNode): string | null {
    const inputTypeName = node.name.value;
    if (!this._usedNamedInputTypes[inputTypeName]) {
      return null;
    }

    if (isOneOfInputObjectType(this._schema.getType(inputTypeName))) {
      return this.getInputObjectOneOfDeclarationBlock(node).string;
    }

    return this.getInputObjectDeclarationBlock(node).string;
  }

  InputValueDefinition(node: InputValueDefinitionNode): string {
    const comment = transformComment(node.description?.value || '', 1);
    const type: string = node.type as any as string;
    return comment + indent(`${node.name.value}: ${type};`);
  }

  private getInputObjectDeclarationBlock(node: InputObjectTypeDefinitionNode): DeclarationBlock {
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind('type')
      .withName(this.convertName(node))
      .withComment(node.description?.value)
      .withBlock((node.fields || []).join('\n'));
  }

  private getInputObjectOneOfDeclarationBlock(node: InputObjectTypeDefinitionNode): DeclarationBlock {
    const declarationKind = (node.fields?.length || 0) === 1 ? 'type' : 'type';
    return new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind(declarationKind)
      .withName(this.convertName(node))
      .withComment(node.description?.value)
      .withContent(`\n` + (node.fields || []).join('\n  |'));
  }

  private isValidVisit(ancestors: any): boolean {
    const currentVisitContext = this.getVisitorKindContextFromAncestors(ancestors);
    const isVisitingInputType = currentVisitContext.includes(Kind.INPUT_OBJECT_TYPE_DEFINITION);
    const isVisitingEnumType = currentVisitContext.includes(Kind.ENUM_TYPE_DEFINITION);

    return isVisitingInputType || isVisitingEnumType;
  }

  NamedType(node: NamedTypeNode, _key: any, _parent: any, _path: any, ancestors: any): string | undefined {
    if (!this.isValidVisit(ancestors)) {
      return undefined;
    }

    const schemaType = this._schema.getType(node.name.value);

    if (schemaType instanceof GraphQLScalarType) {
      const inputType = this.scalars?.[node.name.value]?.input ?? SCALARS[node.name.value] ?? 'any';
      if (inputType === 'any' && node.name.value) {
        return node.name.value;
      }

      return inputType;
    }

    if (schemaType instanceof GraphQLEnumType || schemaType instanceof GraphQLInputObjectType) {
      return this.convertName(node.name.value);
    }

    return node.name.value;
  }

  ListType(node: ListTypeNode, _key: any, _parent: any, _path: any, ancestors: any): string | undefined {
    if (!this.isValidVisit(ancestors)) {
      return undefined;
    }

    const listModifier = this.config.immutableTypes ? 'ReadonlyArray' : 'Array';
    return `${listModifier}<${node.type}>`;
  }

  NonNullType(node: NonNullTypeNode, _key: any, _parent: any, _path: any, ancestors: any): string | undefined {
    if (!this.isValidVisit(ancestors)) {
      return undefined;
    }

    return node.type as any as string | undefined;
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

  private collectInnerTypesRecursively(type: GraphQLInputObjectType, usedInputTypes: UsedNamedInputTypes): void {
    const fields = type.getFields();
    for (const field of Object.values(fields)) {
      const fieldType = getNamedType(field.type);
      if (
        (fieldType instanceof GraphQLEnumType ||
          fieldType instanceof GraphQLInputObjectType ||
          fieldType instanceof GraphQLScalarType) &&
        !usedInputTypes[fieldType.name]
      ) {
        usedInputTypes[fieldType.name] = fieldType;
        if (fieldType instanceof GraphQLInputObjectType) {
          this.collectInnerTypesRecursively(fieldType, usedInputTypes);
        }
      }
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
                foundInputType instanceof GraphQLEnumType)
            ) {
              usedInputTypes[namedTypeNode.name.value] = foundInputType;
              if (foundInputType instanceof GraphQLInputObjectType) {
                this.collectInnerTypesRecursively(foundInputType, usedInputTypes);
              }
            }
          },
        });
      },
    });

    // Collect output enums
    const typeInfo = new TypeInfo(schema);
    visit(
      documentNode,
      visitWithTypeInfo(typeInfo, {
        Field: () => {
          const fieldType = typeInfo.getType();
          if (fieldType) {
            const namedType = getNamedType(fieldType);

            if (namedType instanceof GraphQLEnumType) {
              usedInputTypes[namedType.name] = namedType;
            }
          }
        },
      })
    );

    return usedInputTypes;
  }

  public getEnumsImports(): string[] {
    return getEnumsImports({
      enumValues: this.config.enumValues,
      useTypeImports: this.config.useTypeImports,
    });
  }

  getExactUtilityType(): string | null {
    if (!this.config.generatesOperationTypes) {
      return null;
    }

    return 'type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };';
  }
}
