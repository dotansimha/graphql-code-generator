import { BaseVisitor, ParsedConfig } from 'graphql-codegen-visitor-plugin-common';
import { ReactApolloRawPluginConfig } from './index';
import * as autoBind from 'auto-bind';
import { GraphQLSchema, FragmentDefinitionNode, print, OperationDefinitionNode } from 'graphql';
import { DepGraph } from 'dependency-graph';
import gqlTag from 'graphql-tag';

export interface ReactApolloPluginConfig extends ParsedConfig {
  noHOC: boolean;
  noComponents: boolean;
  withHooks: boolean;
  hooksImportFrom: string;
  gqlImport: string;
}

export class ReactApolloVisitor extends BaseVisitor<ReactApolloRawPluginConfig, ReactApolloPluginConfig> {
  constructor(
    private _schema: GraphQLSchema,
    private _fragments: FragmentDefinitionNode[],
    rawConfig: ReactApolloRawPluginConfig
  ) {
    super(rawConfig, {
      noHOC: rawConfig.noHOC || false,
      noComponents: rawConfig.noComponents || false,
      withHooks: rawConfig.withHooks || false,
      hooksImportFrom: rawConfig.hooksImportFrom || 'react-apollo-hooks',
      gqlImport: rawConfig.gqlImport || null
    } as any);

    autoBind(this);
  }

  private _getFragmentName(fragment: FragmentDefinitionNode | string): string {
    return (typeof fragment === 'string' ? fragment : fragment.name.value) + 'FragmentDoc';
  }

  private _extractFragments(document: FragmentDefinitionNode | OperationDefinitionNode): string[] | undefined {
    return (print(document).match(/\.\.\.[a-z0-9\_]+/gi) || []).map(name => name.replace('...', ''));
  }

  private _transformFragments(document: FragmentDefinitionNode | OperationDefinitionNode): string[] | undefined {
    return this._extractFragments(document).map(document => this._getFragmentName(document));
  }

  private _includeFragments(fragments: string[]): string {
    if (fragments) {
      return `${fragments
        .filter((name, i, all) => all.indexOf(name) === i)
        .map(name => '${' + name + '}')
        .join('\n')}`;
    }

    return '';
  }

  private _gql(node: FragmentDefinitionNode | OperationDefinitionNode): string {
    const doc = `
${print(node)}
${this._includeFragments(this._transformFragments(node))}`;

    return this.config.gqlImport ? JSON.stringify(gqlTag(doc)) : 'gql`' + doc + '`';
  }

  private _generateFragment(fragmentDocument: FragmentDefinitionNode): string | void {
    const name = this._getFragmentName(fragmentDocument);

    return `export const ${name} = ${this._gql(fragmentDocument)};`;
  }

  get fragments(): string {
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

  private _parseImport(importStr: string) {
    const [moduleName, propName] = importStr.split('#');
    return {
      moduleName,
      propName
    };
  }

  get imports(): string {
    const gqlImport = this._parseImport(this.config.gqlImport || 'graphql-tag');
    let imports = `
import ${
      gqlImport.propName ? `{ ${gqlImport.propName === 'gql' ? 'gql' : `${gqlImport.propName} as gql`} }` : 'gql'
    } from '${gqlImport.moduleName}';
      `;

    if (!this.config.noComponents) {
      imports += `import * as React from 'react';\n`;
    }

    if (!this.config.noComponents || !this.config.noHOC) {
      imports += `import * as ReactApollo from 'react-apollo';\n`;
    }

    if (this.config.withHooks) {
      imports += `import * as ReactApolloHooks from '${
        typeof this.config.hooksImportFrom === 'string' ? this.config.hooksImportFrom : 'react-apollo-hooks'
      }';\n`;
    }

    return imports;
  }
}
