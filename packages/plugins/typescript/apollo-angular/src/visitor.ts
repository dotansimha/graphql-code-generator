import { ClientSideBaseVisitor, ClientSideBasePluginConfig, DocumentMode, LoadedFragment, indentMultiline } from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, print, visit, GraphQLSchema, Kind } from 'graphql';
import { ApolloAngularRawPluginConfig } from './config';
import { camelCase } from 'camel-case';
import { Types } from '@graphql-codegen/plugin-helpers';

const R_MOD = /module\:\s*"([^"]+)"/; // matches: module: "..."
const R_NAME = /name\:\s*"([^"]+)"/; // matches: name: "..."

function R_DEF(directive: string) {
  return new RegExp(`\\s+\\@${directive}\\([^)]+\\)`, 'gm');
}

export interface ApolloAngularPluginConfig extends ClientSideBasePluginConfig {
  ngModule?: string;
  namedClient?: string;
  serviceName?: string;
  serviceProvidedInRoot?: boolean;
  sdkClass?: boolean;
  querySuffix?: string;
  mutationSuffix?: string;
  subscriptionSuffix?: string;
}

export class ApolloAngularVisitor extends ClientSideBaseVisitor<ApolloAngularRawPluginConfig, ApolloAngularPluginConfig> {
  private _operationsToInclude: {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
    serviceName: string;
  }[] = [];

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], private _allOperations: OperationDefinitionNode[], rawConfig: ApolloAngularRawPluginConfig, documents?: Types.DocumentFile[]) {
    super(
      schema,
      fragments,
      rawConfig,
      {
        sdkClass: rawConfig.sdkClass,
        ngModule: rawConfig.ngModule,
        namedClient: rawConfig.namedClient,
        serviceName: rawConfig.serviceName,
        serviceProvidedInRoot: rawConfig.serviceProvidedInRoot,
        querySuffix: rawConfig.querySuffix,
        mutationSuffix: rawConfig.mutationSuffix,
        subscriptionSuffix: rawConfig.subscriptionSuffix,
      },
      documents
    );

    autoBind(this);
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }

    const imports = [`import { Injectable } from '@angular/core';`, `import * as Apollo from 'apollo-angular';`];

    if (this.config.sdkClass) {
      imports.push(`import * as ApolloCore from 'apollo-client';`);
    }

    const defs: Record<string, { path: string; module: string }> = {};

    this._allOperations
      .filter(op => this._operationHasDirective(op, 'NgModule') || !!this.config.ngModule)
      .forEach(op => {
        const def = this._operationHasDirective(op, 'NgModule') ? this._extractNgModule(op) : this._parseNgModule(this.config.ngModule);

        // by setting key as link we easily get rid of duplicated imports
        // every path should be relative to the output file
        defs[def.link] = {
          path: def.path,
          module: def.module,
        };
      });

    Object.keys(defs).forEach(key => {
      const def = defs[key];
      // Every Angular Module that I've seen in my entire life use named exports
      imports.push(`import { ${def.module} } from '${def.path}';`);
    });

    return [...baseImports, ...imports];
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
      link,
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
      },
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

  private _getDocumentNodeVariable(node: OperationDefinitionNode, documentVariableName: string): string {
    return this.config.documentMode === DocumentMode.external ? `Operations.${node.name.value}` : documentVariableName;
  }

  private _operationSuffix(operationType: string): string {
    const defaultSuffix = 'GQL';
    switch (operationType) {
      case 'Query':
        return this.config.querySuffix || defaultSuffix;
      case 'Mutation':
        return this.config.mutationSuffix || defaultSuffix;
      case 'Subscription':
        return this.config.subscriptionSuffix || defaultSuffix;
      default:
        return defaultSuffix;
    }
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const serviceName = `${this.convertName(node)}${this._operationSuffix(operationType)}`;
    this._operationsToInclude.push({
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
      serviceName,
    });

    const content = `
  @Injectable({
    providedIn: ${this._providedIn(node)}
  })
  export class ${serviceName} extends Apollo.${operationType}<${operationResultType}, ${operationVariablesTypes}> {
    document = ${this._getDocumentNodeVariable(node, documentVariableName)};
    ${this._namedClient(node)}
  }`;

    return content;
  }

  public get sdkClass(): string {
    const actionType = operation => {
      switch (operation) {
        case 'Mutation':
          return 'mutate';
        case 'Subscription':
          return 'subscribe';
        default:
          return 'fetch';
      }
    };

    const allPossibleActions = this._operationsToInclude
      .map(o => {
        const optionalVariables = !o.node.variableDefinitions || o.node.variableDefinitions.length === 0 || o.node.variableDefinitions.every(v => v.type.kind !== Kind.NON_NULL_TYPE || !!v.defaultValue);

        const options = o.operationType === 'Mutation' ? `${o.operationType}OptionsAlone<${o.operationResultType}, ${o.operationVariablesTypes}>` : `${o.operationType}OptionsAlone<${o.operationVariablesTypes}>`;

        const method = `
${camelCase(o.node.name.value)}(variables${optionalVariables ? '?' : ''}: ${o.operationVariablesTypes}, options?: ${options}) {
  return this.${camelCase(o.serviceName)}.${actionType(o.operationType)}(variables, options)
}`;

        let watchMethod;

        if (o.operationType === 'Query') {
          watchMethod = `

${camelCase(o.node.name.value)}Watch(variables${optionalVariables ? '?' : ''}: ${o.operationVariablesTypes}, options?: WatchQueryOptionsAlone<${o.operationVariablesTypes}>) {
  return this.${camelCase(o.serviceName)}.watch(variables, options)
}`;
        }
        return [method, watchMethod].join('');
      })
      .map(s => indentMultiline(s, 2));

    // Inject the generated services in the constructor
    const injectString = (service: string) => `private ${camelCase(service)}: ${service}`;
    const injections = this._operationsToInclude
      .map(op => injectString(op.serviceName))
      .map(s => indentMultiline(s, 3))
      .join(',\n');

    const serviceName = this.config.serviceName || 'ApolloAngularSDK';
    const providedIn = this.config.serviceProvidedInRoot === false ? '' : `{ providedIn: 'root' }`;

    return `
  type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

  interface WatchQueryOptionsAlone<V>
    extends Omit<ApolloCore.WatchQueryOptions<V>, 'query' | 'variables'> {}
    
  interface QueryOptionsAlone<V>
    extends Omit<ApolloCore.QueryOptions<V>, 'query' | 'variables'> {}
    
  interface MutationOptionsAlone<T, V>
    extends Omit<ApolloCore.MutationOptions<T, V>, 'mutation' | 'variables'> {}
    
  interface SubscriptionOptionsAlone<V>
    extends Omit<ApolloCore.SubscriptionOptions<V>, 'query' | 'variables'> {}

  @Injectable(${providedIn})
  export class ${serviceName} {
    constructor(
${injections}
    ) {}
  ${allPossibleActions.join('\n')}
  }`;
  }
}
