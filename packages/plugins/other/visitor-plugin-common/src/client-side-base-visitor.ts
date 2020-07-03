import { BaseVisitor, ParsedConfig, RawConfig } from './base-visitor';
import autoBind from 'auto-bind';
import {
  FragmentDefinitionNode,
  print,
  OperationDefinitionNode,
  visit,
  FragmentSpreadNode,
  GraphQLSchema,
  Kind,
} from 'graphql';
import { DepGraph } from 'dependency-graph';
import gqlTag from 'graphql-tag';
import { Types } from '@graphql-codegen/plugin-helpers';
import { getConfigValue, buildScalars } from './utils';
import { LoadedFragment } from './types';
import { basename, extname } from 'path';
import { DEFAULT_SCALARS } from './scalars';
import { pascalCase } from 'pascal-case';
import { generateFragmentImportStatement } from './imports';

export enum DocumentMode {
  graphQLTag = 'graphQLTag',
  documentNode = 'documentNode',
  documentNodeImportFragments = 'documentNodeImportFragments',
  external = 'external',
  string = 'string',
}

const EXTENSIONS_TO_REMOVE = ['.ts', '.tsx', '.js', '.jsx'];

export interface RawClientSideBasePluginConfig extends RawConfig {
  /**
   * @description Deprecated. Changes the documentMode to `documentNode`.
   * @default false
   */
  noGraphQLTag?: boolean;
  /**
   * @default gql#graphql-tag
   * @description Customize from which module will `gql` be imported from.
   * This is useful if you want to use modules other than `graphql-tag`, e.g. `graphql.macro`.
   *
   * @exampleMarkdown
   * ## graphql.macro
   * ```yml
   * config:
   *   gqlImport: graphql.macro#gql
   * ```
   *
   * ## Gatsby
   * ```yml
   * config:
   *   gqlImport: gatsby#graphql
   * ```
   */
  gqlImport?: string;
  /**
   * @default false
   * @description Set this configuration to `true` if you wish to tell codegen to generate code with no `export` identifier.
   */
  noExport?: boolean;
  /**
   * @default false
   * @description Set this configuration to `true` if you wish to make sure to remove duplicate operation name suffix.
   */
  dedupeOperationSuffix?: boolean;
  /**
   * @default false
   * @description Set this configuration to `true` if you wish to disable auto add suffix of operation name, like `Query`, `Mutation`, `Subscription`, `Fragment`.
   */
  omitOperationSuffix?: boolean;
  /**
   * @default ""
   * @description Adds a suffix to generated operation result type names
   */
  operationResultSuffix?: string;
  /**
   * @default ""
   * @description Changes the GraphQL operations variables prefix.
   */
  documentVariablePrefix?: string;
  /**
   * @default Document
   * @description Changes the GraphQL operations variables suffix.
   */
  documentVariableSuffix?: string;
  /**
   * @default ""
   * @description Changes the GraphQL fragments variables prefix.
   */
  fragmentVariablePrefix?: string;
  /**
   * @default FragmentDoc
   * @description Changes the GraphQL fragments variables suffix.
   */
  fragmentVariableSuffix?: string;
  /**
   * @default graphQLTag
   * @description Declares how DocumentNode are created:
   * - `graphQLTag`: `graphql-tag` or other modules (check `gqlImport`) will be used to generate document nodes. If this is used, document nodes are generated on client side i.e. the module used to generate this will be shipped to the client
   * - `documentNode`: document nodes will be generated as objects when we generate the templates.
   * - `documentNodeImportFragments`: Similar to documentNode except it imports external fragments instead of embedding them.
   * - `external`: document nodes are imported from an external file. To be used with `importDocumentNodeExternallyFrom`
   */
  documentMode?: DocumentMode;
  /**
   * @default ""
   * @description This config is used internally by presets, but you can use it manually to tell codegen to prefix all base types that it's using.
   * This is useful if you wish to generate base types from `typescript-operations` plugin into a different file, and import it from there.
   */
  importOperationTypesFrom?: string;
  /**
   * @default ""
   * @description This config should be used if `documentMode` is `external`. This has 2 usage:
   * - any string: This would be the path to import document nodes from. This can be used if we want to manually create the document nodes e.g. Use `graphql-tag` in a separate file and export the generated document
   * - 'near-operation-file': This is a special mode that is intended to be used with `near-operation-file` preset to import document nodes from those files. If these files are `.graphql` files, we make use of webpack loader.
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   documentMode: external
   *   importDocumentNodeExternallyFrom: path/to/document-node-file
   * ```
   *
   * ```yml
   * config:
   *   documentMode: external
   *   importDocumentNodeExternallyFrom: near-operation-file
   * ```
   *
   */
  importDocumentNodeExternallyFrom?: string;
}

export interface ClientSideBasePluginConfig extends ParsedConfig {
  gqlImport: string;
  operationResultSuffix: string;
  dedupeOperationSuffix: boolean;
  omitOperationSuffix: boolean;
  noExport: boolean;
  documentVariablePrefix: string;
  documentVariableSuffix: string;
  fragmentVariablePrefix: string;
  fragmentVariableSuffix: string;
  documentMode?: DocumentMode;
  importDocumentNodeExternallyFrom?: 'near-operation-file' | string;
  importOperationTypesFrom?: string;
  globalNamespace?: boolean;
}

export class ClientSideBaseVisitor<
  TRawConfig extends RawClientSideBasePluginConfig = RawClientSideBasePluginConfig,
  TPluginConfig extends ClientSideBasePluginConfig = ClientSideBasePluginConfig
> extends BaseVisitor<TRawConfig, TPluginConfig> {
  protected _collectedOperations: OperationDefinitionNode[] = [];
  protected _documents: Types.DocumentFile[] = [];
  protected _additionalImports: string[] = [];

  constructor(
    protected _schema: GraphQLSchema,
    protected _fragments: LoadedFragment[],
    rawConfig: TRawConfig,
    additionalConfig: Partial<TPluginConfig>,
    documents?: Types.DocumentFile[]
  ) {
    super(rawConfig, {
      scalars: buildScalars(_schema, rawConfig.scalars, DEFAULT_SCALARS),
      dedupeOperationSuffix: getConfigValue(rawConfig.dedupeOperationSuffix, false),
      omitOperationSuffix: getConfigValue(rawConfig.omitOperationSuffix, false),
      gqlImport: rawConfig.gqlImport || null,
      noExport: !!rawConfig.noExport,
      importOperationTypesFrom: getConfigValue(rawConfig.importOperationTypesFrom, null),
      operationResultSuffix: getConfigValue(rawConfig.operationResultSuffix, ''),
      documentVariablePrefix: getConfigValue(rawConfig.documentVariablePrefix, ''),
      documentVariableSuffix: getConfigValue(rawConfig.documentVariableSuffix, 'Document'),
      fragmentVariablePrefix: getConfigValue(rawConfig.fragmentVariablePrefix, ''),
      fragmentVariableSuffix: getConfigValue(rawConfig.fragmentVariableSuffix, 'FragmentDoc'),
      documentMode: ((rawConfig: RawClientSideBasePluginConfig) => {
        if (typeof rawConfig.noGraphQLTag === 'boolean') {
          return rawConfig.noGraphQLTag ? DocumentMode.documentNode : DocumentMode.graphQLTag;
        }
        return getConfigValue(rawConfig.documentMode, DocumentMode.graphQLTag);
      })(rawConfig),
      importDocumentNodeExternallyFrom: getConfigValue(rawConfig.importDocumentNodeExternallyFrom, ''),
      ...additionalConfig,
    } as any);

    this._documents = documents;

    autoBind(this);
  }

  protected _extractFragments(
    document: FragmentDefinitionNode | OperationDefinitionNode,
    withNested = false
  ): string[] {
    if (!document) {
      return [];
    }

    const names: Set<string> = new Set();

    visit(document, {
      enter: {
        FragmentSpread: (node: FragmentSpreadNode) => {
          names.add(node.name.value);

          if (withNested) {
            const foundFragment = this._fragments.find(f => f.name === node.name.value);

            if (foundFragment) {
              const childItems = this._extractFragments(foundFragment.node, true);

              if (childItems && childItems.length > 0) {
                for (const item of childItems) {
                  names.add(item);
                }
              }
            }
          }
        },
      },
    });

    return Array.from(names);
  }

  protected _transformFragments(document: FragmentDefinitionNode | OperationDefinitionNode): string[] {
    const includeNestedFragments = this.config.documentMode === DocumentMode.documentNode;

    return this._extractFragments(document, includeNestedFragments).map(document =>
      this.getFragmentVariableName(document)
    );
  }

  protected _includeFragments(fragments: string[]): string {
    if (fragments && fragments.length > 0) {
      if (this.config.documentMode === DocumentMode.documentNode) {
        return this._fragments
          .filter(f => fragments.includes(this.getFragmentVariableName(f.name)))
          .map(fragment => print(fragment.node))
          .join('\n');
      } else if (this.config.documentMode === DocumentMode.documentNodeImportFragments) {
        return '';
      } else {
        return `${fragments.map(name => '${' + name + '}').join('\n')}`;
      }
    }

    return '';
  }

  protected _prepareDocument(documentStr: string): string {
    return documentStr;
  }

  protected _gql(node: FragmentDefinitionNode | OperationDefinitionNode): string {
    const fragments = this._transformFragments(node);

    const doc = this._prepareDocument(`
    ${
      print(node)
        .split('\\')
        .join('\\\\') /* Re-escape escaped values in GraphQL syntax */
    }
    ${this._includeFragments(fragments)}`);

    if (this.config.documentMode === DocumentMode.documentNode) {
      const gqlObj = gqlTag([doc]);
      if (gqlObj && gqlObj.loc) {
        delete (gqlObj as any).loc;
      }
      return JSON.stringify(gqlObj);
    } else if (this.config.documentMode === DocumentMode.documentNodeImportFragments) {
      const gqlObj = gqlTag([doc]);
      if (gqlObj && gqlObj.loc) {
        delete (gqlObj as any).loc;
      }
      if (fragments.length > 0) {
        const definitions = [
          ...gqlObj.definitions.map(t => JSON.stringify(t)),
          ...fragments.map(name => `...${name}.definitions`),
        ].join();
        return `{"kind":"${Kind.DOCUMENT}","definitions":[${definitions}]}`;
      }
      return JSON.stringify(gqlObj);
    } else if (this.config.documentMode === DocumentMode.string) {
      return '`' + doc + '`';
    }

    return 'gql`' + doc + '`';
  }

  protected _generateFragment(fragmentDocument: FragmentDefinitionNode): string | void {
    const name = this.getFragmentVariableName(fragmentDocument);
    const isDocumentNode =
      this.config.documentMode === DocumentMode.documentNode ||
      this.config.documentMode === DocumentMode.documentNodeImportFragments;
    return `export const ${name}${isDocumentNode ? ': DocumentNode' : ''} = ${this._gql(fragmentDocument)};`;
  }

  private get fragmentsGraph(): DepGraph<LoadedFragment> {
    const graph = new DepGraph<LoadedFragment>({ circular: true });

    for (const fragment of this._fragments) {
      if (graph.hasNode(fragment.name)) {
        const cachedAsString = print(graph.getNodeData(fragment.name).node);
        const asString = print(fragment.node);

        if (cachedAsString !== asString) {
          throw new Error(`Duplicated fragment called '${fragment.name}'!`);
        }
      }

      graph.addNode(fragment.name, fragment);
    }

    this._fragments.forEach(fragment => {
      const depends = this._extractFragments(fragment.node);

      if (depends && depends.length > 0) {
        depends.forEach(name => {
          graph.addDependency(fragment.name, name);
        });
      }
    });

    return graph;
  }

  public get fragments(): string {
    if (this._fragments.length === 0 || this.config.documentMode === DocumentMode.external) {
      return '';
    }

    const graph = this.fragmentsGraph;
    const orderedDeps = graph.overallOrder();
    const localFragments = orderedDeps
      .filter(name => !graph.getNodeData(name).isExternal)
      .map(name => this._generateFragment(graph.getNodeData(name).node));

    return localFragments.join('\n');
  }

  protected _parseImport(importStr: string) {
    const [moduleName, propName] = importStr.split('#');

    return {
      moduleName,
      propName,
    };
  }

  private clearExtension(path: string): string {
    const extension = extname(path);

    if (EXTENSIONS_TO_REMOVE.includes(extension)) {
      return path.replace(/\.[^/.]+$/, '');
    }

    return path;
  }

  public getImports(options: { excludeFragments?: boolean } = {}): string[] {
    const imports = [...this._additionalImports];

    switch (this.config.documentMode) {
      case DocumentMode.documentNode:
      case DocumentMode.documentNodeImportFragments: {
        imports.push(`import { DocumentNode } from 'graphql';`);
        break;
      }
      case DocumentMode.graphQLTag: {
        const gqlImport = this._parseImport(this.config.gqlImport || 'graphql-tag');
        imports.push(
          `import ${
            gqlImport.propName ? `{ ${gqlImport.propName === 'gql' ? 'gql' : `${gqlImport.propName} as gql`} }` : 'gql'
          } from '${gqlImport.moduleName}';`
        );
        break;
      }
      case DocumentMode.external: {
        if (this._collectedOperations.length > 0) {
          if (this.config.importDocumentNodeExternallyFrom === 'near-operation-file' && this._documents.length === 1) {
            imports.push(
              `import * as Operations from './${this.clearExtension(basename(this._documents[0].location))}';`
            );
          } else {
            imports.push(
              `import * as Operations from '${this.clearExtension(this.config.importDocumentNodeExternallyFrom)}';`
            );
          }
        }
        break;
      }
      default:
        break;
    }

    if (!options.excludeFragments && !this.config.globalNamespace) {
      const { documentMode, fragmentImports } = this.config;
      if (
        documentMode === DocumentMode.graphQLTag ||
        documentMode === DocumentMode.string ||
        documentMode === DocumentMode.documentNodeImportFragments
      ) {
        imports.push(
          ...fragmentImports.map(fragmentImport => generateFragmentImportStatement(fragmentImport, 'document'))
        );
      }
    }

    return imports;
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    return null;
  }

  public OperationDefinition(node: OperationDefinitionNode): string {
    if (!node.name || !node.name.value) {
      return null;
    }

    this._collectedOperations.push(node);

    const documentVariableName = this.convertName(node, {
      suffix: this.config.documentVariableSuffix,
      prefix: this.config.documentVariablePrefix,
      useTypesPrefix: false,
    });

    let documentString = '';
    if (this.config.documentMode !== DocumentMode.external) {
      const isDocumentNode =
        this.config.documentMode === DocumentMode.documentNode ||
        this.config.documentMode === DocumentMode.documentNodeImportFragments;
      documentString = `${this.config.noExport ? '' : 'export'} const ${documentVariableName}${
        isDocumentNode ? ': DocumentNode' : ''
      } = ${this._gql(node)};`;
    }

    const operationType: string = pascalCase(node.operation);
    const operationTypeSuffix: string = this.getOperationSuffix(node, operationType);

    const operationResultType: string = this.convertName(node, {
      suffix: operationTypeSuffix + this._parsedConfig.operationResultSuffix,
    });
    const operationVariablesTypes: string = this.convertName(node, {
      suffix: operationTypeSuffix + 'Variables',
    });

    const additional = this.buildOperation(
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes
    );

    return [documentString, additional].filter(a => a).join('\n');
  }
}
