import { ClientSideBaseVisitor, ClientSideBasePluginConfig } from 'graphql-codegen-visitor-plugin-common';
import * as autoBind from 'auto-bind';
import { FragmentDefinitionNode, OperationDefinitionNode, print, visit } from 'graphql';
import { ApolloAngularRawPluginConfig } from './index';

const R_MOD = /module\:\s*"([^"]+)"/; // matches: module: "..."
const R_NAME = /name\:\s*"([^"]+)"/; // matches: name: "..."

function R_DEF(directive: string) {
  return new RegExp(`\\s+\\@${directive}\\([^)]+\\)`, 'gm');
}

export interface ApolloAngularPluginConfig extends ClientSideBasePluginConfig {
  ngModule?: string;
  namedClient?: string;
}

export class ApolloAngularVisitor extends ClientSideBaseVisitor<
  ApolloAngularRawPluginConfig,
  ApolloAngularPluginConfig
> {
  constructor(
    fragments: FragmentDefinitionNode[],
    private _allOperations: OperationDefinitionNode[],
    rawConfig: ApolloAngularRawPluginConfig
  ) {
    super(fragments, rawConfig, {
      ngModule: rawConfig.ngModule,
      namedClient: rawConfig.namedClient
    });

    autoBind(this);
  }

  public getImports(): string {
    const baseImports = super.getImports();
    const imports = [`import { Injectable } from '@angular/core';`, `import Apollo from 'apollo-angular';`];

    const defs: Record<string, { path: string; module: string }> = {};

    this._allOperations
      .filter(op => this._operationHasDirective(op, 'NgModule') || !!this.config.ngModule)
      .forEach(op => {
        const def = this._operationHasDirective(op, 'NgModule')
          ? this._extractNgModule(op)
          : this._parseNgModule(this.config.ngModule);

        // by setting key as link we easily get rid of duplicated imports
        // every path should be relative to the output file
        defs[def.link] = {
          path: def.path,
          module: def.module
        };
      });

    Object.keys(defs).forEach(key => {
      const def = defs[key];
      // Every Angular Module that I've seen in my entire life use named exports
      imports.push(`import { ${def.module} } from '${def.path}';`);
    });

    return [baseImports, ...imports].join('\n');
  }

  private _extractNgModule(operation: OperationDefinitionNode) {
    const [, link] = print(operation).match(R_MOD);
    return this._parseNgModule(link);
  }

  private _parseNgModule(link: string) {
    const [path, module] = link.split('#');

    return {
      path,
      module,
      link
    };
  }

  private _operationHasDirective(operation: string | OperationDefinitionNode, directive: string) {
    if (typeof operation === 'string') {
      return operation.includes(`@${directive}`);
    }

    let found = false;

    visit(operation, {
      Directive(node) {
        if (node.name.value === directive) {
          found = true;
        }
      }
    });

    return found;
  }

  private _removeDirective(document: string, directive: string): string {
    if (this._operationHasDirective(document, directive)) {
      return document.replace(R_DEF(directive), '');
    }

    return document;
  }

  private _removeDirectives(document: string, directives: string[]): string {
    return directives.reduce((doc, directive) => this._removeDirective(doc, directive), document);
  }

  private _extractDirective(operation: OperationDefinitionNode, directive: string) {
    const directives = print(operation).match(R_DEF(directive));

    if (directives.length > 1) {
      throw new Error(`The ${directive} directive used multiple times in '${operation.name}' operation`);
    }

    return directives[0];
  }

  protected _prepareDocument(documentStr: string): string {
    return this._removeDirectives(documentStr, ['NgModule', 'namedClient']);
  }

  private _namedClient(operation: OperationDefinitionNode): string {
    let name: string;

    if (this._operationHasDirective(operation, 'namedClient')) {
      name = this._extractNamedClient(operation);
    } else if (this.config.namedClient) {
      name = this.config.namedClient;
    }

    return name ? `client = '${name}';` : '';
  }

  // tries to find namedClient directive and extract {name}
  private _extractNamedClient(operation: OperationDefinitionNode): string {
    const [, name] = this._extractDirective(operation, 'namedClient').match(R_NAME);

    return name;
  }

  private _providedIn(operation: OperationDefinitionNode): string {
    if (this._operationHasDirective(operation, 'NgModule')) {
      return this._extractNgModule(operation).module;
    } else if (this.config.ngModule) {
      return this._parseNgModule(this.config.ngModule).module;
    }

    return `'root'`;
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const content = `
  @Injectable({
    providedIn: ${this._providedIn(node)}
  })
  export class ${this.convertName(
    node
  )}GQL extends Apollo.${operationType}<${operationResultType}, ${operationVariablesTypes}> {
    document = ${documentVariableName};
    ${this._namedClient(node)}
  }`;

    return content;
  }
}
