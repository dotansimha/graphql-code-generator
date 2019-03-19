import { ClientSideBaseVisitor, ClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';
import * as autoBind from 'auto-bind';
import { FragmentDefinitionNode, OperationDefinitionNode, FieldNode } from 'graphql';
import { AwsAmplifyAngularRawPluginConfig } from './index';

export interface AwsAmplifyAngularPluginConfig extends ClientSideBasePluginConfig {}

export class AwsAmplifyAngularVisitor extends ClientSideBaseVisitor<
  AwsAmplifyAngularRawPluginConfig,
  AwsAmplifyAngularPluginConfig
> {
  generatedAPIs: string[] = [];

  constructor(
    fragments: FragmentDefinitionNode[],
    private _allOperations: OperationDefinitionNode[],
    rawConfig: AwsAmplifyAngularRawPluginConfig
  ) {
    super(fragments, rawConfig, {});

    autoBind(this);
  }

  public getImports(): string {
    const baseImports = super.getImports();
    const imports = [
      `import { Injectable } from '@angular/core';`,
      `import API, { graphqlOperation } from '@aws-amplify/api';`,
      `import { GraphQLResult } from "@aws-amplify/api/lib/types";`,
      `import * as Observable from 'zen-observable';`
    ];

    return [baseImports, ...imports].join('\n');
  }

  public buildService() {
    const apis = this.generatedAPIs.map(name => `${name.replace(/API$/i, '')} = ${name};`);

    return `
      @Injectable({
        providedIn: 'root'
      })
      export class APIService {
        ${apis.join('\n')}
      }
    `;
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    return super.OperationDefinition(node);
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const isSubscription = operationType === 'Subscription';
    const hasVariables = node.variableDefinitions.length > 0;

    const name = this.convertName(node, {
      suffix: isSubscription ? 'ListenerAPI' : 'API'
    });

    this.generatedAPIs.push(name);

    const field = node.selectionSet.selections[0] as FieldNode;
    const fieldName = field.alias ? field.alias.value : field.name.value;

    const variables = hasVariables ? `variables: ${operationVariablesTypes}` : '';

    if (isSubscription) {
      this.generatedAPIs.push(name);

      return `
        const ${name}: Observable<${operationResultType}> = API.graphql(graphqlOperation(${documentVariableName})) as Observable<${operationResultType}>
      `;
    }

    const graphqlOperation =
      'graphqlOperation(' + (hasVariables ? `${documentVariableName}, variables` : documentVariableName) + ')';

    return `
      async function ${name}(${variables}): Promise<${operationResultType}> {
        const response = (await API.graphql(${graphqlOperation})) as any;
        return <${operationResultType}>response.data.${fieldName};
      }
    `;
  }
}
