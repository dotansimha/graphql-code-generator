import autoBind from 'auto-bind';
import {
  ASTNode,
  FragmentDefinitionNode,
  GraphQLSchema,
  OperationDefinitionNode,
  SelectionSetNode,
} from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  DocumentMode,
  LoadedFragment,
  RawClientSideBasePluginConfig,
  typedDocumentString,
} from '@graphql-codegen/visitor-plugin-common';

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
    documents: Types.DocumentFile[],
  ) {
    super(
      schema,
      fragments,
      {
        documentNodeImport: '@graphql-typed-document-node/core#TypedDocumentNode',
        ...config,
        documentMode: config.documentMode || DocumentMode.documentNodeImportFragments,
      },
      {},
      documents,
    );

    this.pluginConfig = config;

    autoBind(this);

    // We need to make sure it's there because in this mode, the base plugin doesn't add the import
    if (this.config.documentMode === DocumentMode.graphQLTag) {
      const documentNodeImport = this._parseImport(
        this.config.documentNodeImport || 'graphql#DocumentNode',
      );
      const tagImport = this._generateImport(documentNodeImport, 'DocumentNode', true);
      if (tagImport) {
        this._imports.add(tagImport);
      }
    } else if (this.config.documentMode === DocumentMode.string) {
      const tagImport = this._generateImport(
        typedDocumentString.import,
        typedDocumentString.import.propName,
        true,
      );
      if (tagImport) {
        this._imports.add(tagImport);
      }
    }
  }

  public SelectionSet(node: SelectionSetNode, _: unknown, parent?: ASTNode) {
    if (!this.pluginConfig.addTypenameToSelectionSets) {
      return undefined;
    }

    // Don't add __typename to OperationDefinitions.
    if (parent && parent.kind === 'OperationDefinition') {
      return undefined;
    }

    // No changes if no selections.
    const { selections } = node;
    if (!selections) {
      return undefined;
    }

    // If selections already have a __typename or is introspection do nothing.
    const hasTypename = selections.some(
      selection =>
        selection.kind === 'Field' &&
        (selection.name.value === '__typename' || selection.name.value.lastIndexOf('__', 0) === 0),
    );
    if (hasTypename) {
      return undefined;
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

  protected getDocumentNodeSignature(
    resultType: string,
    variablesTypes: string,
    node: FragmentDefinitionNode | OperationDefinitionNode,
  ) {
    const shouldUseImportPrefix = !!this.config.importOperationTypesFrom;
    const resultImportPrefix = shouldUseImportPrefix && resultType !== 'unknown' ? 'Types.' : '';
    const variablesImportPrefix =
      shouldUseImportPrefix && variablesTypes !== 'unknown' ? 'Types.' : '';
    if (
      this.config.documentMode === DocumentMode.documentNode ||
      this.config.documentMode === DocumentMode.documentNodeImportFragments ||
      this.config.documentMode === DocumentMode.graphQLTag
    ) {
      return ` as unknown as DocumentNode<${resultImportPrefix}${resultType}, ${variablesImportPrefix}${variablesTypes}>`;
    }

    if (this.config.documentMode === DocumentMode.string) {
      return ` as unknown as TypedDocumentString<${resultImportPrefix}${resultType}, ${variablesImportPrefix}${variablesTypes}>`;
    }

    return super.getDocumentNodeSignature(resultType, variablesTypes, node);
  }
}
