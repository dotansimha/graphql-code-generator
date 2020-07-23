import autoBind from 'auto-bind';
import { Types } from '@graphql-codegen/plugin-helpers';
import {
  LoadedFragment,
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  DocumentMode,
  RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { OperationDefinitionNode , GraphQLSchema } from 'graphql';


export class TypeScriptDocumentNodesVisitor extends ClientSideBaseVisitor<
  RawClientSideBasePluginConfig,
  ClientSideBasePluginConfig
> {
  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: RawClientSideBasePluginConfig,
    documents: Types.DocumentFile[]
  ) {
    super(
      schema,
      fragments,
      {
        ...rawConfig,
        documentMode: DocumentMode.documentNodeImportFragments,
      },
      {},
      documents
    );

    autoBind(this);
  }

  getImports(): string[] {
    return [...super.getImports(), `import { TypedDocumentNode } from '@graphql-typed-document-node/core';`];
  }

  protected getDocumentNodeSignature(resultType: string, variablesTypes: string, node: OperationDefinitionNode) {
    return `TypedDocumentNode<${resultType}, ${variablesTypes}>`;
  }
}
