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
import { pascalCase } from 'pascal-case';
import { generateQueryKeyMaker } from './variables-generator';

export interface ReactQueryPluginConfig extends ClientSideBasePluginConfig {
  errorType: string;
  exposeQueryKeys: boolean;
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
      exposeQueryKeys: getConfigValue(rawConfig.exposeQueryKeys, false),
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

  public getImports(): string[] {
    const baseImports = super.getImports();
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }

    return [...baseImports, `import { ${Array.from(this.reactQueryIdentifiersInUse).join(', ')} } from 'react-query';`];
  }

  public getFetcherImplementation(): string {
    return this.fetcher.generateFetcherImplementaion();
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean
  ): string {
    const operationName: string = this.convertName(node.name?.value ?? '', {
      suffix: this.config.omitOperationSuffix ? '' : pascalCase(operationType),
      useTypesPrefix: false,
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
      if (this.config.exposeQueryKeys) {
        query += generateQueryKeyMaker(node, operationName, operationVariablesTypes, hasRequiredVariables);
      }
      return query;
    } else if (operationType === 'Mutation') {
      return this.fetcher.generateMutationHook(
        node,
        documentVariableName,
        operationName,
        operationResultType,
        operationVariablesTypes
      );
    } else if (operationType === 'Subscription') {
      // eslint-disable-next-line no-console
      console.warn(
        `Plugin "typescript-react-query" does not support GraphQL Subscriptions at the moment! Ignoring "${node.name.value}"...`
      );
    }

    return null;
  }
}
