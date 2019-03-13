import { BaseVisitor, ParsedConfig, RawConfig } from './index';
import autoBind from 'auto-bind';
import { FragmentDefinitionNode, print, OperationDefinitionNode } from 'graphql';
import { DepGraph } from 'dependency-graph';
import gqlTag from 'graphql-tag';
import { toPascalCase } from 'graphql-codegen-plugin-helpers';
import { getConfigValue } from './utils';

export interface RawClientSideBasePluginConfig extends RawConfig {
  noGraphQLTag?: boolean;
  gqlImport?: string;
}

export interface ClientSideBasePluginConfig extends ParsedConfig {
  noGraphQLTag: boolean;
  gqlImport: string;
}

export class ClientSideBaseVisitor<
  TRawConfig extends RawClientSideBasePluginConfig = RawClientSideBasePluginConfig,
  TPluginConfig extends ClientSideBasePluginConfig = ClientSideBasePluginConfig
> extends BaseVisitor<TRawConfig, TPluginConfig> {
  constructor(
    protected _fragments: FragmentDefinitionNode[],
    rawConfig: TRawConfig,
    additionalConfig: Partial<TPluginConfig>
  ) {
    super(rawConfig, {
      noGraphQLTag: getConfigValue(rawConfig.noGraphQLTag, false),
      gqlImport: rawConfig.gqlImport || null,
      ...additionalConfig
    } as any);

    autoBind(this);
  }

  protected _getFragmentName(fragment: FragmentDefinitionNode | string): string {
    return (typeof fragment === 'string' ? fragment : fragment.name.value) + 'FragmentDoc';
  }

  protected _extractFragments(document: FragmentDefinitionNode | OperationDefinitionNode): string[] | undefined {
    return (print(document).match(/\.\.\.[a-z0-9\_]+/gi) || []).map(name => name.replace('...', ''));
  }

  protected _transformFragments(document: FragmentDefinitionNode | OperationDefinitionNode): string[] | undefined {
    return this._extractFragments(document).map(document => this._getFragmentName(document));
  }

  protected _includeFragments(fragments: string[]): string {
    if (fragments) {
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
      return JSON.stringify(gqlTag(doc));
    }

    return 'gql`' + doc + '`';
  }

  protected _generateFragment(fragmentDocument: FragmentDefinitionNode): string | void {
    const name = this._getFragmentName(fragmentDocument);

    return `export const ${name}${this.config.noGraphQLTag ? ': DocumentNode' : ''} = ${this._gql(fragmentDocument)};`;
  }

  public get fragments(): string {
    if (this._fragments.length === 0) {
      return '';
    }

    const graph = new DepGraph<FragmentDefinitionNode>({ circular: true });

    for (const fragment of this._fragments) {
      if (graph.hasNode(fragment.name.value)) {
        const cachedAsString = print(graph.getNodeData(fragment.name.value));
        const asString = print(fragment);

        if (cachedAsString !== asString) {
          throw new Error(`Duplicated fragment called '${fragment.name}'!`);
        }
      }

      graph.addNode(fragment.name.value, fragment);
    }

    this._fragments.forEach(fragment => {
      const depends = this._extractFragments(fragment);

      if (depends) {
        depends.forEach(name => {
          graph.addDependency(fragment.name.value, name);
        });
      }
    });

    return graph
      .overallOrder()
      .map(name => this._generateFragment(graph.getNodeData(name)))
      .join('\n');
  }

  protected _parseImport(importStr: string) {
    const [moduleName, propName] = importStr.split('#');

    return {
      moduleName,
      propName
    };
  }

  public getImports(): string {
    const gqlImport = this._parseImport(this.config.gqlImport || 'graphql-tag');
    let imports = [];

    if (!this.config.noGraphQLTag) {
      imports.push(`
import ${
        gqlImport.propName ? `{ ${gqlImport.propName === 'gql' ? 'gql' : `${gqlImport.propName} as gql`} }` : 'gql'
      } from '${gqlImport.moduleName}';`);
    } else {
      imports.push(`import { DocumentNode } from 'graphql';`);
    }

    return imports.join('\n');
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

    const documentVariableName = this.convertName(node, {
      suffix: 'Document'
    });
    const documentString = `export const ${documentVariableName}${
      this.config.noGraphQLTag ? ': DocumentNode' : ''
    } = ${this._gql(node)};`;
    const operationType: string = toPascalCase(node.operation);
    const operationResultType: string = this.convertName(node, {
      suffix: operationType
    });
    const operationVariablesTypes: string = this.convertName(node, {
      suffix: operationType + 'Variables'
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
