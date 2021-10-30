import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  getConfigValue,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import { MSWRawPluginConfig } from './config';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, GraphQLSchema, print } from 'graphql';
import { camelCase, pascalCase } from 'change-case-all';

export interface MSWPluginConfig extends ClientSideBasePluginConfig {
  link?: {
    endpoint: string;
    name: string;
  };
}

export class MSWVisitor extends ClientSideBaseVisitor<MSWRawPluginConfig, MSWPluginConfig> {
  private _operationsToInclude: {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
  }[] = [];

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: MSWRawPluginConfig) {
    super(schema, fragments, rawConfig, { link: getConfigValue(rawConfig.link, undefined) });

    autoBind(this);
  }

  public getImports(): string[] {
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return [];
    }

    return [`import { graphql, ResponseResolver, GraphQLRequest, GraphQLContext } from 'msw'`];
  }

  public getContent() {
    const { link } = this.config;
    let endpoint: string;

    if (link) {
      endpoint = `const ${link.name} = graphql.link('${link.endpoint}')\n`;
    }

    const infix = pascalCase(link?.name || '');
    const operations = this._operationsToInclude.map(
      ({ node, operationType, operationResultType, operationVariablesTypes }) => {
        if (operationType === 'Query' || operationType === 'Mutation') {
          const name = camelCase(node.name.value) + operationType + infix;
          return `export const ${name}Handler = (resolver: ResponseResolver<GraphQLRequest<${operationVariablesTypes}>, GraphQLContext<${operationResultType}>, any>) =>
  ${link?.name || 'graphql'}.${operationType.toLowerCase()}<${operationResultType}, ${operationVariablesTypes}>(
    '${node.name.value}',
    resolver
  )\n`;
        }
        return '';
      }
    );

    return [endpoint, ...operations].join('');
  }

  buildOperation(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) {
    if (node.name == null) {
      throw new Error("Plugin 'msw' cannot generate mocks for unnamed operation.\n\n" + print(node));
    } else {
      this._operationsToInclude.push({
        node,
        documentVariableName,
        operationType,
        operationResultType,
        operationVariablesTypes,
      });
    }

    return null;
  }
}
