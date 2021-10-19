import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  LoadedFragment,
  DocumentMode,
  getConfigValue,
} from '@graphql-codegen/visitor-plugin-common';
import { ReactQueryRawPluginConfig } from './config';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, GraphQLSchema } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { FetcherRenderer } from './fetcher';
import { FetchFetcher } from './fetcher-fetch';
import { HardcodedFetchFetcher } from './fetcher-fetch-hardcoded';
import { GraphQLRequestClientFetcher } from './fetcher-graphql-request';
import { CustomMapperFetcher } from './fetcher-custom-mapper';
import { pascalCase } from 'change-case-all';
import { generateQueryKeyMaker, generateMutationKeyMaker } from './variables-generator';

export interface ReactQueryPluginConfig extends ClientSideBasePluginConfig {
  errorType: string;
  exposeDocument: boolean;
  exposeQueryKeys: boolean;
  exposeMutationKeys: boolean;
  exposeFetcher: boolean;
}

export interface ReactQueryMethodMap {
  query: {
    hook: string;
    options: string;
  };
  mutation: {
    hook: string;
    options: string;
  };
}

export class ReactQueryVisitor extends ClientSideBaseVisitor<ReactQueryRawPluginConfig, ReactQueryPluginConfig> {
  private _externalImportPrefix: string;
  public fetcher: FetcherRenderer;
  public reactQueryIdentifiersInUse = new Set<string>();

  public queryMethodMap: ReactQueryMethodMap = {
    query: {
      hook: 'useQuery',
      options: 'UseQueryOptions',
    },
    mutation: {
      hook: 'useMutation',
      options: 'UseMutationOptions',
    },
  };

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    protected rawConfig: ReactQueryRawPluginConfig,
    documents: Types.DocumentFile[]
  ) {
    super(schema, fragments, rawConfig, {
      documentMode: DocumentMode.string,
      errorType: getConfigValue(rawConfig.errorType, 'unknown'),
      exposeDocument: getConfigValue(rawConfig.exposeDocument, false),
      exposeQueryKeys: getConfigValue(rawConfig.exposeQueryKeys, false),
      exposeMutationKeys: getConfigValue(rawConfig.exposeMutationKeys, false),
      exposeFetcher: getConfigValue(rawConfig.exposeFetcher, false),
    });
    this._externalImportPrefix = this.config.importOperationTypesFrom ? `${this.config.importOperationTypesFrom}.` : '';
    this._documents = documents;
    this.fetcher = this.createFetcher(rawConfig.fetcher || 'fetch');

    autoBind(this);
  }

  public get imports(): Set<string> {
    return this._imports;
  }

  private createFetcher(raw: ReactQueryRawPluginConfig['fetcher']): FetcherRenderer {
    if (raw === 'fetch') {
      return new FetchFetcher(this);
    } else if (typeof raw === 'object' && 'endpoint' in raw) {
      return new HardcodedFetchFetcher(this, raw);
    } else if (raw === 'graphql-request') {
      return new GraphQLRequestClientFetcher(this);
    }

    return new CustomMapperFetcher(this, raw);
  }

  public get hasOperations() {
    return this._collectedOperations.length > 0;
  }

  public getImports(): string[] {
    const baseImports = super.getImports();

    if (!this.hasOperations) {
      return baseImports;
    }

    return [...baseImports, `import { ${Array.from(this.reactQueryIdentifiersInUse).join(', ')} } from 'react-query';`];
  }

  public getFetcherImplementation(): string {
    return this.fetcher.generateFetcherImplementaion();
  }

  private _getHookSuffix(name: string, operationType: string) {
    if (this.config.omitOperationSuffix) {
      return '';
    }
    if (!this.config.dedupeOperationSuffix) {
      return pascalCase(operationType);
    }
    if (name.includes('Query') || name.includes('Mutation') || name.includes('Subscription')) {
      return '';
    }
    return pascalCase(operationType);
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean
  ): string {
    const nodeName = node.name?.value ?? '';
    const suffix = this._getHookSuffix(nodeName, operationType);
    const operationName: string = this.convertName(nodeName, {
      suffix,
      useTypesPrefix: false,
      useTypesSuffix: false,
    });

    operationResultType = this._externalImportPrefix + operationResultType;
    operationVariablesTypes = this._externalImportPrefix + operationVariablesTypes;

    if (operationType === 'Query') {
      let query = this.fetcher.generateQueryHook(
        node,
        documentVariableName,
        operationName,
        operationResultType,
        operationVariablesTypes,
        hasRequiredVariables
      );
      if (this.config.exposeDocument) {
        query += `\nuse${operationName}.document = ${documentVariableName};\n`;
      }
      if (this.config.exposeQueryKeys) {
        query += generateQueryKeyMaker(node, operationName, operationVariablesTypes, hasRequiredVariables);
      }

      // The reason we're looking at the private field of the CustomMapperFetcher to see if it's a react hook
      // is to prevent calling generateFetcherFetch for each query since all the queries won't be able to generate
      // a fetcher field anyways.
      if (this.config.exposeFetcher && !(this.fetcher as any)._isReactHook) {
        query += this.fetcher.generateFetcherFetch(
          node,
          documentVariableName,
          operationName,
          operationResultType,
          operationVariablesTypes,
          hasRequiredVariables
        );
      }
      return query;
    } else if (operationType === 'Mutation') {
      let query = this.fetcher.generateMutationHook(
        node,
        documentVariableName,
        operationName,
        operationResultType,
        operationVariablesTypes,
        hasRequiredVariables
      );
      if (this.config.exposeMutationKeys) {
        query += generateMutationKeyMaker(node, operationName);
      }
      if (this.config.exposeFetcher && !(this.fetcher as any)._isReactHook) {
        query += this.fetcher.generateFetcherFetch(
          node,
          documentVariableName,
          operationName,
          operationResultType,
          operationVariablesTypes,
          hasRequiredVariables
        );
      }
      return query;
    } else if (operationType === 'Subscription') {
      // eslint-disable-next-line no-console
      console.warn(
        `Plugin "typescript-react-query" does not support GraphQL Subscriptions at the moment! Ignoring "${node.name.value}"...`
      );
    }

    return null;
  }
}
