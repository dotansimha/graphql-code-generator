import { BaseVisitor, ParsedConfig, RawConfig } from './index';
import * as autoBind from 'auto-bind';
import { FragmentDefinitionNode, print, OperationDefinitionNode, visit, FragmentSpreadNode } from 'graphql';
import { DepGraph } from 'dependency-graph';
import gqlTag from 'graphql-tag';
import { toPascalCase } from '@graphql-codegen/plugin-helpers';
import { getConfigValue } from './utils';
import { LoadedFragment } from './types';
export interface RawClientSideBasePluginConfig extends RawConfig {
  noGraphQLTag?: boolean;
  gqlImport?: string;
  noExport?: boolean;
}

export interface ClientSideBasePluginConfig extends ParsedConfig {
  /**
   * @name noGraphQLTag
   * @type boolean
   * @default false
   * @description Instead of adding gql tag with the GraphQL operation, it uses the percompiled JSON representation (DocumentNode)
   * of the operation.
   *
   * @example
   * ```yml
   * config:
   *   noGraphQLTag: true
   * ```
   */
  noGraphQLTag: boolean;
  /**
   * @name gqlImport
   * @type string
   * @default gql#graphql-tag
   * @description Customize from which module will `gql` be imported from.
   * This is useful if you want to use modules other than `graphql-tag`, e.g. `graphql.macro`.
   *
   * @example graphql.macro
   * ```yml
   * config:
   *   gqlImport: graphql.macro#gql
   * ```
   * @example Gatsby
   * ```yml
   * config:
   *   gqlImport: gatsby#graphql
   * ```
   */
  gqlImport: string;
  noExport: boolean;
}

export class ClientSideBaseVisitor<TRawConfig extends RawClientSideBasePluginConfig = RawClientSideBasePluginConfig, TPluginConfig extends ClientSideBasePluginConfig = ClientSideBasePluginConfig> extends BaseVisitor<TRawConfig, TPluginConfig> {
  protected _collectedOperations: OperationDefinitionNode[] = [];

  constructor(protected _fragments: LoadedFragment[], rawConfig: TRawConfig, additionalConfig: Partial<TPluginConfig>) {
    super(rawConfig, {
      noGraphQLTag: getConfigValue(rawConfig.noGraphQLTag, false),
      gqlImport: rawConfig.gqlImport || null,
      noExport: !!rawConfig.noExport,
      ...additionalConfig,
    } as any);

    autoBind(this);
  }

  protected _getFragmentName(fragment: FragmentDefinitionNode | string): string {
    return (typeof fragment === 'string' ? fragment : fragment.name.value) + 'FragmentDoc';
  }

  protected _extractFragments(document: FragmentDefinitionNode | OperationDefinitionNode): string[] {
    if (!document) {
      return [];
    }

    const names = [];

    visit(document, {
      enter: {
        FragmentSpread: (node: FragmentSpreadNode) => {
          names.push(node.name.value);
        },
      },
    });

    return names;
  }

  protected _transformFragments(document: FragmentDefinitionNode | OperationDefinitionNode): string[] {
    return this._extractFragments(document).map(document => this._getFragmentName(document));
  }

  protected _includeFragments(fragments: string[]): string {
    if (fragments && fragments.length > 0) {
      return `${fragments
        .filter((name, i, all) => all.indexOf(name) === i)
        .map(name => '${' + name + '}')
        .join('\n')}`;
    }

    return '';
  }

  protected _prepareDocument(documentStr: string): string {
    return documentStr;
  }

  protected _gql(node: FragmentDefinitionNode | OperationDefinitionNode): string {
    const doc = this._prepareDocument(`
    ${print(node)}
    ${this._includeFragments(this._transformFragments(node))}`);

    if (this.config.noGraphQLTag) {
      const gqlObj = gqlTag(doc);

      if (gqlObj && gqlObj['loc']) {
        delete gqlObj.loc;
      }

      return JSON.stringify(gqlObj);
    }

    return 'gql`' + doc + '`';
  }

  protected _generateFragment(fragmentDocument: FragmentDefinitionNode): string | void {
    const name = this._getFragmentName(fragmentDocument);

    return `export const ${name}${this.config.noGraphQLTag ? ': DocumentNode' : ''} = ${this._gql(fragmentDocument)};`;
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
    if (this._fragments.length === 0) {
      return '';
    }

    const graph = this.fragmentsGraph;
    const orderedDeps = graph.overallOrder();
    const localFragments = orderedDeps.filter(name => !graph.getNodeData(name).isExternal).map(name => this._generateFragment(graph.getNodeData(name).node));

    return localFragments.join('\n');
  }

  protected _parseImport(importStr: string) {
    const [moduleName, propName] = importStr.split('#');

    return {
      moduleName,
      propName,
    };
  }

  public getImports(): string[] {
    const gqlImport = this._parseImport(this.config.gqlImport || 'graphql-tag');
    let imports = [];

    if (!this.config.noGraphQLTag) {
      imports.push(`import ${gqlImport.propName ? `{ ${gqlImport.propName === 'gql' ? 'gql' : `${gqlImport.propName} as gql`} }` : 'gql'} from '${gqlImport.moduleName}';`);
    } else {
      imports.push(`import { DocumentNode } from 'graphql';`);
    }

    (this._fragments || [])
      .filter(f => f.isExternal && f.importFrom && (!f['level'] || (f['level'] !== undefined && f['level'] === 0)))
      .forEach(externalFragment => {
        const identifierName = this._getFragmentName(externalFragment.name);

        imports.push(`import { ${identifierName} } from '${externalFragment.importFrom}';`);
      });

    return imports;
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    return null;
  }

  public OperationDefinition(node: OperationDefinitionNode): string {
    if (!node.name || !node.name.value) {
      return null;
    }

    this._collectedOperations.push(node);

    const documentVariableName = this.convertName(node, {
      suffix: 'Document',
      useTypesPrefix: false,
    });
    const documentString = `${this.config.noExport ? '' : 'export'} const ${documentVariableName}${this.config.noGraphQLTag ? ': DocumentNode' : ''} = ${this._gql(node)};`;
    const operationType: string = toPascalCase(node.operation);
    const operationResultType: string = this.convertName(node, {
      suffix: operationType,
    });
    const operationVariablesTypes: string = this.convertName(node, {
      suffix: operationType + 'Variables',
    });

    const additional = this.buildOperation(node, documentVariableName, operationType, operationResultType, operationVariablesTypes);

    return [documentString, additional].filter(a => a).join('\n');
  }
}
