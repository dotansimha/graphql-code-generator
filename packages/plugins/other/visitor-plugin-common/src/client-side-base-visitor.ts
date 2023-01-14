import { basename, extname } from 'path';
import { oldVisit, Types } from '@graphql-codegen/plugin-helpers';
import { optimizeDocumentNode } from '@graphql-tools/optimize';
import autoBind from 'auto-bind';
import { pascalCase } from 'change-case-all';
import { DepGraph } from 'dependency-graph';
import {
  FragmentDefinitionNode,
  FragmentSpreadNode,
  GraphQLSchema,
  Kind,
  OperationDefinitionNode,
  print,
} from 'graphql';
import gqlTag from 'graphql-tag';
import { BaseVisitor, ParsedConfig, RawConfig } from './base-visitor.js';
import { generateFragmentImportStatement } from './imports.js';
import { LoadedFragment, ParsedImport } from './types.js';
import { buildScalarsFromConfig, getConfigValue } from './utils.js';

gqlTag.enableExperimentalFragmentVariables();

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
   * @default graphql-tag#gql
   * @description Customize from which module will `gql` be imported from.
   * This is useful if you want to use modules other than `graphql-tag`, e.g. `graphql.macro`.
   *
   * @exampleMarkdown
   * ## graphql.macro
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          gqlImport: 'graphql.macro#gql'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Gatsby
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          gqlImport: 'gatsby#graphql'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  gqlImport?: string;
  /**
   * @default graphql#DocumentNode
   * @description Customize from which module will `DocumentNode` be imported from.
   * This is useful if you want to use modules other than `graphql`, e.g. `@graphql-typed-document-node`.
   */
  documentNodeImport?: string;
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
   *
   * - `graphQLTag`: `graphql-tag` or other modules (check `gqlImport`) will be used to generate document nodes. If this is used, document nodes are generated on client side i.e. the module used to generate this will be shipped to the client
   * - `documentNode`: document nodes will be generated as objects when we generate the templates.
   * - `documentNodeImportFragments`: Similar to documentNode except it imports external fragments instead of embedding them.
   * - `external`: document nodes are imported from an external file. To be used with `importDocumentNodeExternallyFrom`
   *
   * Note that some plugins (like `typescript-graphql-request`) also supports `string` for this parameter.
   *
   */
  documentMode?: DocumentMode;
  /**
   * @default true
   * @description If you are using `documentNode: documentMode | documentNodeImportFragments`, you can set this to `true` to apply document optimizations for your GraphQL document.
   * This will remove all "loc" and "description" fields from the compiled document, and will remove all empty arrays (such as `directives`, `arguments` and `variableDefinitions`).
   */
  optimizeDocumentNode?: boolean;
  /**
   * @default ""
   * @description This config is used internally by presets, but you can use it manually to tell codegen to prefix all base types that it's using.
   * This is useful if you wish to generate base types from `typescript-operations` plugin into a different file, and import it from there.
   */
  importOperationTypesFrom?: string;
  /**
   * @default ""
   * @description This config should be used if `documentMode` is `external`. This has 2 usage:
   *
   * - any string: This would be the path to import document nodes from. This can be used if we want to manually create the document nodes e.g. Use `graphql-tag` in a separate file and export the generated document
   * - 'near-operation-file': This is a special mode that is intended to be used with `near-operation-file` preset to import document nodes from those files. If these files are `.graphql` files, we make use of webpack loader.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          documentMode: 'external',
   *          importDocumentNodeExternallyFrom: 'path/to/document-node-file',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          documentMode: 'external',
   *          importDocumentNodeExternallyFrom: 'near-operation-file',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   */
  importDocumentNodeExternallyFrom?: string;
  /**
   * @default false
   * @description This config adds PURE magic comment to the static variables to enforce treeshaking for your bundler.
   */
  pureMagicComment?: boolean;
  /**
   * @default false
   * @description If set to true, it will enable support for parsing variables on fragments.
   */
  experimentalFragmentVariables?: boolean;
}

export interface ClientSideBasePluginConfig extends ParsedConfig {
  gqlImport: string;
  documentNodeImport: string;
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
  pureMagicComment?: boolean;
  optimizeDocumentNode: boolean;
  experimentalFragmentVariables?: boolean;
}

export class ClientSideBaseVisitor<
  TRawConfig extends RawClientSideBasePluginConfig = RawClientSideBasePluginConfig,
  TPluginConfig extends ClientSideBasePluginConfig = ClientSideBasePluginConfig
> extends BaseVisitor<TRawConfig, TPluginConfig> {
  protected _collectedOperations: OperationDefinitionNode[] = [];
  protected _documents: Types.DocumentFile[] = [];
  protected _additionalImports: string[] = [];
  protected _imports = new Set<string>();

  constructor(
    protected _schema: GraphQLSchema,
    protected _fragments: LoadedFragment[],
    rawConfig: TRawConfig,
    additionalConfig: Partial<TPluginConfig>,
    documents?: Types.DocumentFile[]
  ) {
    super(rawConfig, {
      scalars: buildScalarsFromConfig(_schema, rawConfig),
      dedupeOperationSuffix: getConfigValue(rawConfig.dedupeOperationSuffix, false),
      optimizeDocumentNode: getConfigValue(rawConfig.optimizeDocumentNode, true),
      omitOperationSuffix: getConfigValue(rawConfig.omitOperationSuffix, false),
      gqlImport: rawConfig.gqlImport || null,
      documentNodeImport: rawConfig.documentNodeImport || null,
      noExport: Boolean(rawConfig.noExport),
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
      pureMagicComment: getConfigValue(rawConfig.pureMagicComment, false),
      experimentalFragmentVariables: getConfigValue(rawConfig.experimentalFragmentVariables, false),
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

    oldVisit(document, {
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
    const includeNestedFragments =
      this.config.documentMode === DocumentMode.documentNode ||
      (this.config.dedupeFragments && document.kind === 'OperationDefinition');

    return this._extractFragments(document, includeNestedFragments).map(document =>
      this.getFragmentVariableName(document)
    );
  }

  protected _includeFragments(fragments: string[], nodeKind: 'FragmentDefinition' | 'OperationDefinition'): string {
    if (fragments && fragments.length > 0) {
      if (this.config.documentMode === DocumentMode.documentNode) {
        return this._fragments
          .filter(f => fragments.includes(this.getFragmentVariableName(f.name)))
          .map(fragment => print(fragment.node))
          .join('\n');
      }
      if (this.config.documentMode === DocumentMode.documentNodeImportFragments) {
        return '';
      }
      if (this.config.dedupeFragments && nodeKind !== 'OperationDefinition') {
        return '';
      }
      return String(fragments.map(name => '${' + name + '}').join('\n'));
    }

    return '';
  }

  protected _prepareDocument(documentStr: string): string {
    return documentStr;
  }

  protected _gql(node: FragmentDefinitionNode | OperationDefinitionNode): string {
    const fragments = this._transformFragments(node);

    const doc = this._prepareDocument(`
    ${print(node).split('\\').join('\\\\') /* Re-escape escaped values in GraphQL syntax */}
    ${this._includeFragments(fragments, node.kind)}`);

    if (this.config.documentMode === DocumentMode.documentNode) {
      let gqlObj = gqlTag([doc]);

      if (this.config.optimizeDocumentNode) {
        gqlObj = optimizeDocumentNode(gqlObj);
      }

      return JSON.stringify(gqlObj);
    }
    if (this.config.documentMode === DocumentMode.documentNodeImportFragments) {
      let gqlObj = gqlTag([doc]);

      if (this.config.optimizeDocumentNode) {
        gqlObj = optimizeDocumentNode(gqlObj);
      }

      if (fragments.length > 0 && (!this.config.dedupeFragments || node.kind === 'OperationDefinition')) {
        const definitions = [
          ...gqlObj.definitions.map(t => JSON.stringify(t)),
          ...fragments.map(name => `...${name}.definitions`),
        ].join();

        return `{"kind":"${Kind.DOCUMENT}","definitions":[${definitions}]}`;
      }

      return JSON.stringify(gqlObj);
    }
    if (this.config.documentMode === DocumentMode.string) {
      return '`' + doc + '`';
    }

    const gqlImport = this._parseImport(this.config.gqlImport || 'graphql-tag');

    return (gqlImport.propName || 'gql') + '`' + doc + '`';
  }

  protected _generateFragment(fragmentDocument: FragmentDefinitionNode): string | void {
    const name = this.getFragmentVariableName(fragmentDocument);
    const fragmentTypeSuffix = this.getFragmentSuffix(fragmentDocument);
    return `export const ${name} =${this.config.pureMagicComment ? ' /*#__PURE__*/' : ''} ${this._gql(
      fragmentDocument
    )}${this.getDocumentNodeSignature(
      this.convertName(fragmentDocument.name.value, {
        useTypesPrefix: true,
        suffix: fragmentTypeSuffix,
      }),
      this.config.experimentalFragmentVariables
        ? this.convertName(fragmentDocument.name.value, {
            suffix: fragmentTypeSuffix + 'Variables',
          })
        : 'unknown',
      fragmentDocument
    )};`;
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

  protected _parseImport(importStr: string): ParsedImport {
    // This is a special case when we want to ignore importing, and just use `gql` provided from somewhere else
    // Plugins that uses that will need to ensure to add import/declaration for the gql identifier
    if (importStr === 'gql') {
      return {
        moduleName: null,
        propName: 'gql',
      };
    }

    // This is a special use case, when we don't want this plugin to manage the import statement
    // of the gql tag. In this case, we provide something like `Namespace.gql` and it will be used instead.
    if (importStr.includes('.gql')) {
      return {
        moduleName: null,
        propName: importStr,
      };
    }

    const [moduleName, propName] = importStr.split('#');

    return {
      moduleName,
      propName,
    };
  }

  protected _generateImport(
    { moduleName, propName }: ParsedImport,
    varName: string,
    isTypeImport: boolean
  ): string | null {
    const typeImport = isTypeImport && this.config.useTypeImports ? 'import type' : 'import';
    const propAlias = propName === varName ? '' : ` as ${varName}`;

    if (moduleName) {
      return `${typeImport} ${propName ? `{ ${propName}${propAlias} }` : varName} from '${moduleName}';`;
    }

    return null;
  }

  private clearExtension(path: string): string {
    const extension = extname(path);

    if (EXTENSIONS_TO_REMOVE.includes(extension)) {
      return path.replace(/\.[^/.]+$/, '');
    }

    return path;
  }

  public getImports(options: { excludeFragments?: boolean } = {}): string[] {
    (this._additionalImports || []).forEach(i => this._imports.add(i));

    switch (this.config.documentMode) {
      case DocumentMode.documentNode:
      case DocumentMode.documentNodeImportFragments: {
        const documentNodeImport = this._parseImport(this.config.documentNodeImport || 'graphql#DocumentNode');
        const tagImport = this._generateImport(documentNodeImport, 'DocumentNode', true);

        if (tagImport) {
          this._imports.add(tagImport);
        }

        break;
      }
      case DocumentMode.graphQLTag: {
        const gqlImport = this._parseImport(this.config.gqlImport || 'graphql-tag');
        const tagImport = this._generateImport(gqlImport, 'gql', false);

        if (tagImport) {
          this._imports.add(tagImport);
        }

        break;
      }
      case DocumentMode.external: {
        if (this._collectedOperations.length > 0) {
          if (this.config.importDocumentNodeExternallyFrom === 'near-operation-file' && this._documents.length === 1) {
            let documentPath = `./${this.clearExtension(basename(this._documents[0].location))}`;
            if (!this.config.emitLegacyCommonJSImports) {
              documentPath += '.js';
            }

            this._imports.add(`import * as Operations from '${documentPath}';`);
          } else {
            if (!this.config.importDocumentNodeExternallyFrom) {
              // eslint-disable-next-line no-console
              console.warn('importDocumentNodeExternallyFrom must be provided if documentMode=external');
            }

            this._imports.add(
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
        // keep track of what imports we've already generated so we don't try
        // to import the same identifier twice
        const alreadyImported = new Map<string, Set<string>>();

        const deduplicatedImports = fragmentImports
          .map(fragmentImport => {
            const { path, identifiers } = fragmentImport.importSource;
            if (!alreadyImported.has(path)) {
              alreadyImported.set(path, new Set<string>());
            }

            const alreadyImportedForPath = alreadyImported.get(path);
            const newIdentifiers = identifiers.filter(identifier => !alreadyImportedForPath.has(identifier.name));
            newIdentifiers.forEach(newIdentifier => alreadyImportedForPath.add(newIdentifier.name));

            // filter the set of identifiers in this fragment import to only
            // the ones we haven't already imported from this path
            return {
              ...fragmentImport,
              importSource: {
                ...fragmentImport.importSource,
                identifiers: newIdentifiers,
              },
              emitLegacyCommonJSImports: this.config.emitLegacyCommonJSImports,
            };
          })
          // remove any imports that now have no identifiers in them
          .filter(fragmentImport => fragmentImport.importSource.identifiers.length > 0);

        deduplicatedImports.forEach(fragmentImport => {
          if (fragmentImport.outputPath !== fragmentImport.importSource.path) {
            this._imports.add(generateFragmentImportStatement(fragmentImport, 'document'));
          }
        });
      }
    }

    return Array.from(this._imports);
  }

  protected buildOperation(
    _node: OperationDefinitionNode,
    _documentVariableName: string,
    _operationType: string,
    _operationResultType: string,
    _operationVariablesTypes: string,
    _hasRequiredVariables: boolean
  ): string {
    return null;
  }

  protected getDocumentNodeSignature(
    _resultType: string,
    _variablesTypes: string,
    _node: FragmentDefinitionNode | OperationDefinitionNode
  ): string {
    if (
      this.config.documentMode === DocumentMode.documentNode ||
      this.config.documentMode === DocumentMode.documentNodeImportFragments
    ) {
      return ` as unknown as DocumentNode`;
    }

    return '';
  }

  /**
   * Checks if the specific operation has variables that are non-null (required), and also doesn't have default.
   * This is useful for deciding of `variables` should be optional or not.
   * @param node
   */
  protected checkVariablesRequirements(node: OperationDefinitionNode): boolean {
    const variables = node.variableDefinitions || [];

    if (variables.length === 0) {
      return false;
    }

    return variables.some(variableDef => variableDef.type.kind === Kind.NON_NULL_TYPE && !variableDef.defaultValue);
  }

  public getOperationVariableName(node: OperationDefinitionNode) {
    return this.convertName(node, {
      suffix: this.config.documentVariableSuffix,
      prefix: this.config.documentVariablePrefix,
      useTypesPrefix: false,
    });
  }

  public OperationDefinition(node: OperationDefinitionNode): string {
    this._collectedOperations.push(node);

    const documentVariableName = this.getOperationVariableName(node);

    const operationType: string = pascalCase(node.operation);
    const operationTypeSuffix: string = this.getOperationSuffix(node, operationType);

    const operationResultType: string = this.convertName(node, {
      suffix: operationTypeSuffix + this._parsedConfig.operationResultSuffix,
    });
    const operationVariablesTypes: string = this.convertName(node, {
      suffix: operationTypeSuffix + 'Variables',
    });

    let documentString = '';
    if (
      this.config.documentMode !== DocumentMode.external &&
      documentVariableName !== '' // only generate exports for named queries
    ) {
      documentString = `${this.config.noExport ? '' : 'export'} const ${documentVariableName} =${
        this.config.pureMagicComment ? ' /*#__PURE__*/' : ''
      } ${this._gql(node)}${this.getDocumentNodeSignature(operationResultType, operationVariablesTypes, node)};`;
    }

    const hasRequiredVariables = this.checkVariablesRequirements(node);

    const additional = this.buildOperation(
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
      hasRequiredVariables
    );

    return [documentString, additional].filter(a => a).join('\n');
  }
}
