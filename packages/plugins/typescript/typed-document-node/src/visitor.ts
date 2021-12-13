import autoBind from 'auto-bind';
import { Types } from '@graphql-codegen/plugin-helpers';
import {
  LoadedFragment,
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  DocumentMode,
  RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSchema } from 'graphql';

interface TypeScriptDocumentNodesVisitorPluginConfig extends RawClientSideBasePluginConfig {
  addTypenameToSelectionSets?: boolean;
}

export class TypeScriptDocumentNodesVisitor extends ClientSideBaseVisitor<
  TypeScriptDocumentNodesVisitorPluginConfig,
  ClientSideBasePluginConfig
> {
  private pluginConfig: TypeScriptDocumentNodesVisitorPluginConfig;

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    config: TypeScriptDocumentNodesVisitorPluginConfig,
    documents: Types.DocumentFile[]
  ) {
    super(
      schema,
      fragments,
      {
        documentMode: DocumentMode.documentNodeImportFragments,
        documentNodeImport: '@graphql-typed-document-node/core#TypedDocumentNode',
        ...config,
      },
      {},
      documents
    );

    this.pluginConfig = config;

    autoBind(this);

    // We need to make sure it's there because in this mode, the base plugin doesn't add the import
    if (this.config.documentMode === DocumentMode.graphQLTag) {
      const documentNodeImport = this._parseImport(this.config.documentNodeImport || 'graphql#DocumentNode');
      const tagImport = this._generateImport(documentNodeImport, 'DocumentNode', true);
      this._imports.add(tagImport);
    }
  }

  public SelectionSet(node, _, parent) {
    if (!this.pluginConfig.addTypenameToSelectionSets) {
      return;
    }

    // Don't add __typename to OperationDefinitions.
    if (parent && parent.kind === 'OperationDefinition') {
      return;
    }

    // No changes if no selections.
    const { selections } = node;
    if (!selections) {
      return;
    }

    // If selections already have a __typename or is introspection do nothing.
    const hasTypename = selections.some(
      selection =>
        selection.kind === 'Field' &&
        (selection.name.value === '__typename' || selection.name.value.lastIndexOf('__', 0) === 0)
    );
    if (hasTypename) {
      return;
    }

    return {
      ...node,
      selections: [
        ...selections,
        {
          kind: 'Field',
          name: {
            kind: 'Name',
            value: '__typename',
          },
        },
      ],
    };
  }

  protected getDocumentNodeSignature(resultType: string, variablesTypes: string, node) {
    if (
      this.config.documentMode === DocumentMode.documentNode ||
      this.config.documentMode === DocumentMode.documentNodeImportFragments ||
      this.config.documentMode === DocumentMode.graphQLTag
    ) {
      return ` as unknown as DocumentNode<${resultType}, ${variablesTypes}>`;
    }

    return super.getDocumentNodeSignature(resultType, variablesTypes, node);
  }
}
