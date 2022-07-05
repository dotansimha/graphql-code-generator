import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  DocumentMode,
  LoadedFragment,
  indentMultiline,
  getConfigValue,
  indent,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, print, visit, GraphQLSchema, Kind } from 'graphql';
import { ApolloAngularRawPluginConfig } from './config.js';
import { camelCase } from 'change-case-all';
import { Types } from '@graphql-codegen/plugin-helpers';

const R_MOD = /module:\s*"([^"]+)"/; // matches: module: "..."
const R_NAME = /name:\s*"([^"]+)"/; // matches: name: "..."

function R_DEF(directive: string) {
  return new RegExp(`\\s+\\@${directive}\\([^)]+\\)`, 'gm');
}

export interface ApolloAngularPluginConfig extends ClientSideBasePluginConfig {
  apolloAngularVersion: number;
  ngModule?: string;
  namedClient?: string;
  serviceName?: string;
  serviceProvidedInRoot?: boolean;
  serviceProvidedIn?: string;
  sdkClass?: boolean;
  querySuffix?: string;
  mutationSuffix?: string;
  subscriptionSuffix?: string;
  apolloAngularPackage: string;
  additionalDI?: string[];
  addExplicitOverride: boolean;
}

export class ApolloAngularVisitor extends ClientSideBaseVisitor<
  ApolloAngularRawPluginConfig,
  ApolloAngularPluginConfig
> {
  private _externalImportPrefix = '';
  private _operationsToInclude: {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
    serviceName: string;
  }[] = [];
  private dependencyInjections = '';
  private dependencyInjectionArgs = '';

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    private _allOperations: OperationDefinitionNode[],
    rawConfig: ApolloAngularRawPluginConfig,
    documents?: Types.DocumentFile[]
  ) {
    super(
      schema,
      fragments,
      rawConfig,
      {
        sdkClass: rawConfig.sdkClass,
        ngModule: rawConfig.ngModule,
        namedClient: rawConfig.namedClient,
        serviceName: rawConfig.serviceName,
        serviceProvidedIn: rawConfig.serviceProvidedIn,
        serviceProvidedInRoot: rawConfig.serviceProvidedInRoot,
        querySuffix: rawConfig.querySuffix,
        mutationSuffix: rawConfig.mutationSuffix,
        subscriptionSuffix: rawConfig.subscriptionSuffix,
        additionalDI: getConfigValue(rawConfig.additionalDI, []),
        apolloAngularPackage: getConfigValue(rawConfig.apolloAngularPackage, 'apollo-angular'),
        apolloAngularVersion: getConfigValue(rawConfig.apolloAngularVersion, 2),
        gqlImport: getConfigValue(
          rawConfig.gqlImport,
          !rawConfig.apolloAngularVersion || rawConfig.apolloAngularVersion === 2 ? `apollo-angular#gql` : null
        ),
        addExplicitOverride: getConfigValue(rawConfig.addExplicitOverride, false),
      },
      documents
    );

    if (this.config.importOperationTypesFrom) {
      this._externalImportPrefix = `${this.config.importOperationTypesFrom}.`;

      if (this.config.documentMode !== DocumentMode.external || !this.config.importDocumentNodeExternallyFrom) {
        // eslint-disable-next-line no-console
        console.warn(
          '"importOperationTypesFrom" should be used with "documentMode=external" and "importDocumentNodeExternallyFrom"'
        );
      }

      if (this.config.importOperationTypesFrom !== 'Operations') {
        // eslint-disable-next-line no-console
        console.warn('importOperationTypesFrom only works correctly when left empty or set to "Operations"');
      }
    }

    const dependencyInjections = ['apollo: Apollo.Apollo'].concat(this.config.additionalDI);
    const dependencyInjectionArgs = dependencyInjections.map(content => {
      return content.split(':')[0];
    });

    this.dependencyInjections = dependencyInjections.join(', ');
    this.dependencyInjectionArgs = dependencyInjectionArgs.join(', ');

    autoBind(this);
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }

    const imports = [
      `import { Injectable } from '@angular/core';`,
      `import * as Apollo from '${this.config.apolloAngularPackage}';`,
    ];

    if (this.config.sdkClass) {
      const corePackage = this.config.apolloAngularVersion > 1 ? '@apollo/client/core' : 'apollo-client';
      imports.push(`import * as ApolloCore from '${corePackage}';`);
    }

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
          module: def.module,
        };
      });

    if (this.config.serviceProvidedIn) {
      const ngModule = this._parseNgModule(this.config.serviceProvidedIn);

      defs[ngModule.link] = {
        path: ngModule.path,
        module: ngModule.module,
      };
    }

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
    }
    if (this.config.ngModule) {
      return this._parseNgModule(this.config.ngModule).module;
    }

    return `'root'`;
  }

  private _getDocumentNodeVariable(node: OperationDefinitionNode, documentVariableName: string): string {
    if (this.config.importDocumentNodeExternallyFrom === 'near-operation-file') {
      return `Operations.${documentVariableName}`;
    }
    if (this.config.importOperationTypesFrom) {
      return `${this.config.importOperationTypesFrom}.${documentVariableName}`;
    }
    return documentVariableName;
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

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const serviceName = `${this.convertName(node)}${this._operationSuffix(operationType)}`;
    this._operationsToInclude.push({
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
      serviceName,
    });
    const namedClient = this._namedClient(node);

    operationResultType = this._externalImportPrefix + operationResultType;
    operationVariablesTypes = this._externalImportPrefix + operationVariablesTypes;

    const content = `
  @Injectable({
    providedIn: ${this._providedIn(node)}
  })
  export class ${serviceName} extends Apollo.${operationType}<${operationResultType}, ${operationVariablesTypes}> {
    ${this.config.addExplicitOverride ? 'override ' : ''}document = ${this._getDocumentNodeVariable(
      node,
      documentVariableName
    )};
    ${namedClient !== '' ? (this.config.addExplicitOverride ? 'override ' : '') + namedClient : ''}
    constructor(${this.dependencyInjections}) {
      super(${this.dependencyInjectionArgs});
    }
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

    const hasMutations = this._operationsToInclude.find(o => o.operationType === 'Mutation');
    const hasSubscriptions = this._operationsToInclude.find(o => o.operationType === 'Subscription');
    const hasQueries = this._operationsToInclude.find(o => o.operationType === 'Query');

    const allPossibleActions = this._operationsToInclude
      .map(o => {
        const operationResultType = this._externalImportPrefix + o.operationResultType;
        const operationVariablesTypes = this._externalImportPrefix + o.operationVariablesTypes;

        const optionalVariables =
          !o.node.variableDefinitions ||
          o.node.variableDefinitions.length === 0 ||
          o.node.variableDefinitions.every(v => v.type.kind !== Kind.NON_NULL_TYPE || !!v.defaultValue);

        const options =
          o.operationType === 'Mutation'
            ? `${o.operationType}OptionsAlone<${operationResultType}, ${operationVariablesTypes}>`
            : `${o.operationType}OptionsAlone<${operationVariablesTypes}>`;

        const method = `
${camelCase(o.node.name.value)}(variables${
          optionalVariables ? '?' : ''
        }: ${operationVariablesTypes}, options?: ${options}) {
  return this.${camelCase(o.serviceName)}.${actionType(o.operationType)}(variables, options)
}`;

        let watchMethod: string;

        if (o.operationType === 'Query') {
          watchMethod = `

${camelCase(o.node.name.value)}Watch(variables${
            optionalVariables ? '?' : ''
          }: ${operationVariablesTypes}, options?: WatchQueryOptionsAlone<${operationVariablesTypes}>) {
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
    const providedIn = this.config.serviceProvidedIn
      ? `{ providedIn: ${this._parseNgModule(this.config.serviceProvidedIn).module} }`
      : this.config.serviceProvidedInRoot === false
      ? ''
      : `{ providedIn: 'root' }`;

    // Generate these types only if they're going to be used,
    // to avoid "unused variable" compile errors in generated code
    const omitType =
      hasQueries || hasMutations || hasSubscriptions
        ? `type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;`
        : '';
    const watchType = hasQueries
      ? `interface WatchQueryOptionsAlone<V> extends Omit<ApolloCore.WatchQueryOptions<V>, 'query' | 'variables'> {}`
      : '';
    const queryType = hasQueries
      ? `interface QueryOptionsAlone<V> extends Omit<ApolloCore.QueryOptions<V>, 'query' | 'variables'> {}`
      : '';
    const mutationType = hasMutations
      ? `interface MutationOptionsAlone<T, V> extends Omit<ApolloCore.MutationOptions<T, V>, 'mutation' | 'variables'> {}`
      : '';
    const subscriptionType = hasSubscriptions
      ? `interface SubscriptionOptionsAlone<V> extends Omit<ApolloCore.SubscriptionOptions<V>, 'query' | 'variables'> {}`
      : '';

    const types = [omitType, watchType, queryType, mutationType, subscriptionType]
      .filter(s => s)
      .map(s => indent(s, 1))
      .join('\n\n');

    return `
${types}

  @Injectable(${providedIn})
  export class ${serviceName} {
    constructor(
${injections}
    ) {}
  ${allPossibleActions.join('\n')}
  }`;
  }
}
