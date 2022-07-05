import { TypeScriptDocumentNodesRawPluginConfig } from './index.js';
import autoBind from 'auto-bind';
import { Types } from '@graphql-codegen/plugin-helpers';
import {
  getConfigValue,
  LoadedFragment,
  ClientSideBaseVisitor,
  NamingConvention,
  ClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSchema } from 'graphql';

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
