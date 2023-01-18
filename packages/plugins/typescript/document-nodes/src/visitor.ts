import { Types } from '@graphql-codegen/plugin-helpers';
import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  getConfigValue,
  LoadedFragment,
  NamingConvention,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { GraphQLSchema } from 'graphql';
import { TypeScriptDocumentNodesRawPluginConfig } from './index.js';

export interface TypeScriptDocumentNodesPluginConfig extends ClientSideBasePluginConfig {
  namingConvention: NamingConvention;
  transformUnderscore: boolean;
}

export class TypeScriptDocumentNodesVisitor extends ClientSideBaseVisitor<
  TypeScriptDocumentNodesRawPluginConfig,
  TypeScriptDocumentNodesPluginConfig
> {
  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: TypeScriptDocumentNodesRawPluginConfig,
    documents: Types.DocumentFile[]
  ) {
    const additionalConfig = {
      documentVariablePrefix: getConfigValue(rawConfig.namePrefix, ''),
      documentVariableSuffix: getConfigValue(rawConfig.nameSuffix, ''),
      fragmentVariablePrefix: getConfigValue(rawConfig.fragmentPrefix, ''),
      fragmentVariableSuffix: getConfigValue(rawConfig.fragmentSuffix, ''),
    };
    super(schema, fragments, rawConfig, additionalConfig, documents);
    autoBind(this);
  }
}
