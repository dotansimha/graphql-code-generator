import { GraphQLSchema, isListType, GraphQLObjectType, GraphQLNonNull, GraphQLList, isEnumType } from 'graphql';
import { PreResolveTypesProcessor, ParsedDocumentsConfig, BaseDocumentsVisitor, LoadedFragment, getConfigValue, SelectionSetProcessorConfig, SelectionSetToObject } from '@graphql-codegen/visitor-plugin-common';
import { TypeScriptOperationVariablesToObject } from './ts-operation-variables-to-object';
import { TypeScriptDocumentsPluginConfig } from './config';
import { isNonNullType } from 'graphql';
import { TypeScriptSelectionSetProcessor } from './ts-selection-set-processor';
import autoBind from 'auto-bind';

export interface TypeScriptDocumentsParsedConfig extends ParsedDocumentsConfig {
  avoidOptionals: boolean;
  immutableTypes: boolean;
  noExport: boolean;
}

export class TypeScriptDocumentsVisitor extends BaseDocumentsVisitor<TypeScriptDocumentsPluginConfig, TypeScriptDocumentsParsedConfig> {
  constructor(schema: GraphQLSchema, config: TypeScriptDocumentsPluginConfig, allFragments: LoadedFragment[]) {
    super(
      config,
      {
        noExport: getConfigValue(config.noExport, false),
        avoidOptionals: typeof config.avoidOptionals === 'boolean' ? getConfigValue(config.avoidOptionals, false) : false,
        immutableTypes: getConfigValue(config.immutableTypes, false),
        nonOptionalTypename: getConfigValue(config.nonOptionalTypename, false),
      } as TypeScriptDocumentsParsedConfig,
      schema
    );

    autoBind(this);

    const clearOptional = (str: string): string => {
      const prefix = this.config.namespacedImportName ? `${this.config.namespacedImportName}\.` : '';
      const rgx = new RegExp(`^${prefix}Maybe<(.*?)>$`, 'is');

      if (str.startsWith(`${this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : ''}Maybe`)) {
        return str.replace(rgx, '$1');
      }

      return str;
    };

    const wrapTypeWithModifiers = (baseType: string, type: GraphQLObjectType | GraphQLNonNull<GraphQLObjectType> | GraphQLList<GraphQLObjectType>): string => {
      const prefix = this.config.namespacedImportName ? `${this.config.namespacedImportName}.` : '';

      if (isNonNullType(type)) {
        return clearOptional(wrapTypeWithModifiers(baseType, type.ofType));
      } else if (isListType(type)) {
        const innerType = wrapTypeWithModifiers(baseType, type.ofType);

        return `${prefix}Maybe<${this.config.immutableTypes ? 'ReadonlyArray' : 'Array'}<${innerType}>>`;
      } else {
        return `${prefix}Maybe<${baseType}>`;
      }
    };

    const processorConfig: SelectionSetProcessorConfig = {
      namespacedImportName: this.config.namespacedImportName,
      convertName: this.convertName.bind(this),
      enumPrefix: this.config.enumPrefix,
      scalars: this.scalars,
      formatNamedField: (name: string): string => (this.config.immutableTypes ? `readonly ${name}` : name),
      wrapTypeWithModifiers,
    };
    const processor = new (config.preResolveTypes ? PreResolveTypesProcessor : TypeScriptSelectionSetProcessor)(processorConfig);
    this.setSelectionSetHandler(new SelectionSetToObject(processor, this.scalars, this.schema, this.convertName.bind(this), allFragments, this.config));
    const enumsNames = Object.keys(schema.getTypeMap()).filter(typeName => isEnumType(schema.getType(typeName)));
    this.setVariablesTransformer(
      new TypeScriptOperationVariablesToObject(this.scalars, this.convertName.bind(this), this.config.avoidOptionals, this.config.immutableTypes, this.config.namespacedImportName, enumsNames, this.config.enumPrefix, this.config.enumValues)
    );
    this._declarationBlockConfig = {
      ignoreExport: this.config.noExport,
    };
  }
}
