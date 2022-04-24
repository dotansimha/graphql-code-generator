import {
  ClientSideBasePluginConfig,
  ClientSideBaseVisitor,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { camelCase } from 'change-case-all';
import { GraphQLSchema, Kind, OperationDefinitionNode, print } from 'graphql';
import { RawGraphQLUrqlPluginConfig } from './config';

export interface GraphQLRequestPluginConfig extends ClientSideBasePluginConfig {
  rawRequest: boolean;
}

export class GraphQLUrqlVisitor extends ClientSideBaseVisitor<RawGraphQLUrqlPluginConfig, GraphQLRequestPluginConfig> {
  private _operationsToInclude: {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
  }[] = [];

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: RawGraphQLUrqlPluginConfig) {
    super(schema, fragments, rawConfig, {});

    autoBind(this);

    const typeImport = this.config.useTypeImports ? 'import type' : 'import';

    this._additionalImports.push(`${typeImport} { Client, OperationContext } from '@urql/core';`);
  }

  public OperationDefinition(node: OperationDefinitionNode) {
    const operationName = node.name?.value;

    if (!operationName) {
      // eslint-disable-next-line no-console
      console.warn(
        `Anonymous GraphQL operation was ignored in "typescript-urql-sdk", please make sure to name your operation: `,
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
      const documentVariableName = x.documentVariableName;
      const optionType = GraphQLUrqlVisitor.getOperationOptionType(x.operationType);
      const generics = [x.operationResultType, x.operationVariablesTypes];

      const hasVariables = GraphQLUrqlVisitor.getHasNonNullableVariables(x.node);
      const variablesType = hasVariables ? x.operationVariablesTypes : `${x.operationVariablesTypes} = {}`;

      const operationName = x.node.name.value;

      return `${camelCase(operationName)}(variables: ${variablesType}, context?: ${optionType}) {
          return client.${GraphQLUrqlVisitor.getOperation(x.operationType)}<${generics.join(
        ', '
      )}>(${documentVariableName}, variables, context);
      }`;
    });
    return `export const getSdk = (client: Client) => ({
      ${sdkOperations.join(',\n')}
    });
    export type SdkType = ReturnType<typeof getSdk>
`;
  }
  private static getHasNonNullableVariables(node: OperationDefinitionNode): boolean {
    if (!node.variableDefinitions?.length) {
      return false;
    }
    for (const definition of node.variableDefinitions) {
      if (definition.type.kind !== Kind.NAMED_TYPE) {
        const hasDefaultValue = Boolean(definition.defaultValue);
        return !hasDefaultValue;
      }
    }
    return false;
  }
  // private static getDocumentFieldName(operationType: string): string {
  //   switch (operationType) {
  //     case 'Subscription':
  //       return 'query';
  //     case 'Mutation':
  //       return 'mutation';
  //     case 'Query':
  //       return 'query';
  //     default:
  //       throw new Error('unknown operation type: ' + operationType);
  //   }
  // }
  private static getOperation(operationType: string): string {
    switch (operationType) {
      case 'Subscription':
        return 'subscription';
      case 'Mutation':
        return 'mutation';
      case 'Query':
        return 'query';
      default:
        throw new Error('unknown operation type: ' + operationType);
    }
  }

  private static getOperationOptionType(_operationType: string): string {
    return 'Partial<OperationContext>';
  }
}
