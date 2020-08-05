import autoBind from 'auto-bind';
import { Types, PluginContext } from '@graphql-codegen/plugin-helpers';
import {
  LoadedFragment,
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  DocumentMode,
  RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSchema } from 'graphql';

export class TypeScriptDocumentNodesVisitor extends ClientSideBaseVisitor<
  RawClientSideBasePluginConfig,
  ClientSideBasePluginConfig
> {
  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: RawClientSideBasePluginConfig,
    documents: Types.DocumentFile[],
    pluginContext: PluginContext
  ) {
    super(
      schema,
      fragments,
      {
        documentMode: DocumentMode.documentNodeImportFragments,
        documentNodeImport: '@graphql-typed-document-node/core#TypedDocumentNode',
        ...rawConfig,
      },
      {},
      documents,
      pluginContext
    );

    autoBind(this);
  }

  protected getDocumentNodeSignature(resultType: string, variablesTypes: string) {
    return `DocumentNode<${resultType}, ${variablesTypes}>`;
  }
}
