import { TypeScriptDocumentNodesRawPluginConfig } from '.';
import autoBind from 'auto-bind';
import { getConfigValue, LoadedFragment, ClientSideBaseVisitor, NamingConvention, ClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSchema } from 'graphql';

export interface TypeScriptDocumentNodesPluginConfig extends ClientSideBasePluginConfig {
  namingConvention: NamingConvention;
  transformUnderscore: boolean;
}

export class TypeScriptDocumentNodesVisitor extends ClientSideBaseVisitor<TypeScriptDocumentNodesRawPluginConfig, TypeScriptDocumentNodesPluginConfig> {
  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: TypeScriptDocumentNodesRawPluginConfig) {
    // TODO: allow to use `useDefaultExport` only within `near-operation-file` preset
    super(schema, fragments, rawConfig, {
      exportAsDefault: rawConfig.useDefaultExport,
      documentVariablePrefix: getConfigValue(rawConfig.namePrefix, ''),
      documentVariableSuffix: getConfigValue(rawConfig.nameSuffix, ''),
      fragmentVariablePrefix: getConfigValue(rawConfig.fragmentPrefix, ''),
      fragmentVariableSuffix: getConfigValue(rawConfig.fragmentSuffix, ''),
    });

    autoBind(this);
  }
}
