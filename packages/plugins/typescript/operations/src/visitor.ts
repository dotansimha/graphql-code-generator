import {
  AvoidOptionalsConfig,
  BaseDocumentsVisitor,
  DeclarationKind,
  generateFragmentImportStatement,
  getConfigValue,
  LoadedFragment,
  normalizeAvoidOptionals,
  ParsedDocumentsConfig,
  PreResolveTypesProcessor,
  SelectionSetProcessorConfig,
  SelectionSetToObject,
  wrapTypeWithModifiers,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { GraphQLOutputType, GraphQLSchema, isEnumType, isNonNullType } from 'graphql';
import { TypeScriptDocumentsPluginConfig } from './config';
import { TypeScriptOperationVariablesToObject } from './ts-operation-variables-to-object';
import { TypeScriptSelectionSetProcessor } from './ts-selection-set-processor';

export const EXACT_SIGNATURE = `type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };`;
export interface TypeScriptDocumentsParsedConfig extends ParsedDocumentsConfig {
  avoidOptionals: AvoidOptionalsConfig;
  immutableTypes: boolean;
  noExport: boolean;
}

export class TypeScriptDocumentsVisitor extends BaseDocumentsVisitor<
  TypeScriptDocumentsPluginConfig,
  TypeScriptDocumentsParsedConfig
> {
  constructor(schema: GraphQLSchema, config: TypeScriptDocumentsPluginConfig, allFragments: LoadedFragment[]) {
    super(
      config,
      {
        noExport: getConfigValue(config.noExport, false),
        avoidOptionals: normalizeAvoidOptionals(getConfigValue(config.avoidOptionals, false)),
        immutableTypes: getConfigValue(config.immutableTypes, false),
        nonOptionalTypename: getConfigValue(config.nonOptionalTypename, false),
      } as TypeScriptDocumentsParsedConfig,
      schema
    );

    autoBind(this);

    const wrapOptional = (type: string) => {
      const prefix = this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '';
      return `${prefix}Maybe<${type}>`;
    };
    const wrapArray = (type: string) => {
      const listModifier = this.config.immutableTypes ? 'ReadonlyArray' : 'Array';
      return `${listModifier}<${type}>`;
    };

    const formatNamedField = (name: string, type: GraphQLOutputType | null): string => {
      const optional = !this.config.avoidOptionals.field && !!type && !isNonNullType(type);
      return (this.config.immutableTypes ? `readonly ${name}` : name) + (optional ? '?' : '');
    };

    const processorConfig: SelectionSetProcessorConfig = {
      namespacedImportName: this.config.namespacedImportName,
      convertName: this.convertName.bind(this),
      enumPrefix: this.config.enumPrefix,
      scalars: this.scalars,
      formatNamedField,
      wrapTypeWithModifiers(baseType, type) {
        return wrapTypeWithModifiers(baseType, type, { wrapOptional, wrapArray });
      },
    };
    const processor = new (config.preResolveTypes ? PreResolveTypesProcessor : TypeScriptSelectionSetProcessor)(
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
        this.config.avoidOptionals.object,
        this.config.immutableTypes,
        this.config.namespacedImportName,
        enumsNames,
        this.config.enumPrefix,
        this.config.enumValues
      )
    );
    this._declarationBlockConfig = {
      ignoreExport: this.config.noExport,
    };
  }

  public getImports(): Array<string> {
    return !this.config.globalNamespace
      ? this.config.fragmentImports.map(fragmentImport => generateFragmentImportStatement(fragmentImport, 'type'))
      : [];
  }

  protected getPunctuation(declarationKind: DeclarationKind): string {
    return ';';
  }

  protected applyVariablesWrapper(variablesBlock: string): string {
    this._globalDeclarations.add(EXACT_SIGNATURE);

    return `Exact<${variablesBlock === '{}' ? `{ [key: string]: never; }` : variablesBlock}>`;
  }
}
