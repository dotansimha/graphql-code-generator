import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { camelCase } from 'change-case-all';
import { GraphQLSchema, OperationDefinitionNode, print } from 'graphql';
import { RawGraphQLApolloPluginConfig } from './config.js';

export interface GraphQLRequestPluginConfig extends ClientSideBasePluginConfig {
  rawRequest: boolean;
}

export class GraphQLApolloVisitor extends ClientSideBaseVisitor<
  RawGraphQLApolloPluginConfig,
  GraphQLRequestPluginConfig
> {
  private _operationsToInclude: {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
  }[] = [];

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: RawGraphQLApolloPluginConfig) {
    super(schema, fragments, rawConfig, {});

    autoBind(this);

    const typeImport = this.config.useTypeImports ? 'import type' : 'import';

    this._additionalImports.push(
      `${typeImport} { ApolloClient, QueryOptions, SubscriptionOptions, MutationOptions } from '@apollo/client';`
    );
  }

  public OperationDefinition(node: OperationDefinitionNode) {
    const operationName = node.name?.value;

    if (!operationName) {
      // eslint-disable-next-line no-console
      console.warn(
        `Anonymous GraphQL operation was ignored in "typescript-graphql-request", please make sure to name your operation: `,
        print(node)
      );

      return null;
    }

    return super.OperationDefinition(node);
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    this._operationsToInclude.push({
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
    });

    return null;
  }

  public get sdkContent(): string {
    const sdkOperations = this._operationsToInclude.map(x => {
      const { documentVariableName } = x;
      const optionType = GraphQLApolloVisitor.getApolloOperationOptionType(x.operationType);
      const generics = [x.operationResultType, x.operationVariablesTypes];

      const operationName = x.node.name.value;
      const genericParameter = x.operationType !== 'Mutation' ? [...generics].reverse() : [...generics];
      // the reason we're reversing: https://github.com/apollographql/apollo-client/issues/8537
      return `${camelCase(operationName)}${x.operationType}(options: Partial<${optionType}<${genericParameter.join(
        ', '
      )}>>) {
          return client.${GraphQLApolloVisitor.getApolloOperation(x.operationType)}<${generics.join(
        ', '
      )}>({...options, ${GraphQLApolloVisitor.getDocumentFieldName(x.operationType)}: ${documentVariableName}})
      }`;
    });
    return `export const getSdk = (client: ApolloClient<any>) => ({
      ${sdkOperations.join(',\n')}
    });
    export type SdkType = ReturnType<typeof getSdk>
`;
  }
  private static getDocumentFieldName(operationType: string): string {
    switch (operationType) {
      case 'Subscription':
        return 'query';
      case 'Mutation':
        return 'mutation';
      case 'Query':
        return 'query';
      default:
        throw new Error('unknown operation type: ' + operationType);
    }
  }
  private static getApolloOperation(operationType: string): string {
    switch (operationType) {
      case 'Subscription':
        return 'subscribe';
      case 'Mutation':
        return 'mutate';
      case 'Query':
        return 'query';
      default:
        throw new Error('unknown operation type: ' + operationType);
    }
  }

  private static getApolloOperationOptionType(operationType: string): string {
    switch (operationType) {
      case 'Subscription':
        return 'SubscriptionOptions';
      case 'Mutation':
        return 'MutationOptions';
      case 'Query':
        return 'QueryOptions';
      default:
        throw new Error('unknown operation type: ' + operationType);
    }
  }
}
