import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  getConfigValue,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';
import { MSWRawPluginConfig } from './config';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, GraphQLSchema, print } from 'graphql';
import { pascalCase } from 'change-case-all';

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

    const suffix = pascalCase(link?.name || '');
    const operations = this._operationsToInclude.map(
      ({ node, operationType, operationResultType, operationVariablesTypes }) => {
        if (operationType === 'Query' || operationType === 'Mutation') {
          const handlerName = `mock${pascalCase(node.name.value)}${operationType}${suffix}`;

          /** @ts-expect-error name DOES exist on @type{import('graphql').SelectionNode} */
          const selections = node.selectionSet.selections.map(sel => sel.name.value).join(', ');
          const variables = node.variableDefinitions.map(def => def.variable.name.value).join(', ');

          return `/**
 * @param resolver a function that accepts a captured request and may return a mocked response.
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * ${handlerName}((req, res, ctx) => {${variables && `\n *   const { ${variables} } = req.variables;`}
 *   return res(
 *     ctx.data({ ${selections} })
 *   )
 * })
 */
export const ${handlerName} = (resolver: ResponseResolver<GraphQLRequest<${operationVariablesTypes}>, GraphQLContext<${operationResultType}>, any>) =>
  ${link?.name || 'graphql'}.${operationType.toLowerCase()}<${operationResultType}, ${operationVariablesTypes}>(
    '${node.name.value}',
    resolver
  )\n`;
        }
        return '';
      }
    );

    return [endpoint, ...operations].join('\n');
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
