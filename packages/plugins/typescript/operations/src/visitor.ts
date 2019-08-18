import { GraphQLSchema } from 'graphql';
import { ParsedDocumentsConfig, BaseDocumentsVisitor, LoadedFragment, getConfigValue } from '@graphql-codegen/visitor-plugin-common';
import { TypeScriptSelectionSetToObject } from './ts-selection-set-to-object';
import { TypeScriptOperationVariablesToObject } from './ts-operation-variables-to-object';
import { TypeScriptDocumentsPluginConfig } from './index';

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

    this.setSelectionSetHandler(new TypeScriptSelectionSetToObject(this.scalars, this.schema, this.convertName, this.config.addTypename, this.config.preResolveTypes, this.config.nonOptionalTypename, allFragments, this.config));
    this.setVariablesTransformer(new TypeScriptOperationVariablesToObject(this.scalars, this.convertName, this.config.avoidOptionals, this.config.immutableTypes, this.config.namespacedImportName));
    this._declarationBlockConfig = {
      ignoreExport: this.config.noExport,
    };
  }
}
