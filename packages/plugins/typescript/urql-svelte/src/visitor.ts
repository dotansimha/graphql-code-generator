import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  LoadedFragment,
  getConfigValue,
  OMIT_TYPE,
} from '@graphql-codegen/visitor-plugin-common';
import { UrqlSvelteRawPluginConfig } from './config';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, GraphQLSchema } from 'graphql';

export interface UrqlSveltePluginConfig extends ClientSideBasePluginConfig {
  urqlSvelteImportFrom: string;
}

export class UrqlSvelteVisitor extends ClientSideBaseVisitor<UrqlSvelteRawPluginConfig, UrqlSveltePluginConfig> {
  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: UrqlSvelteRawPluginConfig) {
    super(schema, fragments, rawConfig, {
      urqlSvelteImportFrom: getConfigValue(rawConfig.urqlSvelteImportFrom, null),
    });

    autoBind(this);
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    const imports = [];
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return [`import <script context="module" lang="ts">`, ...baseImports];
    }

    imports.push(`import * as UrqlSvelte from '${this.config.urqlSvelteImportFrom || '@urql/svelte'}';`);
    imports.push(OMIT_TYPE);

    return [`import <script context="module" lang="ts">`, ...baseImports, ...imports];
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const operationNameConverted: string = this.convertName(node.name?.value ?? '', {
      suffix: this.config.omitOperationSuffix ? '' : operationType,
      useTypesPrefix: false,
    });

    const operationName: string = operationNameConverted.slice(0, 1).toLowerCase() + operationNameConverted.slice(1);

    if (operationType === 'Subscription') {
      return `
export function ${operationName}(handler) {
  return UrqlSvelte.subscription(UrqlSvelte.operationStore(${documentVariableName}), handler);
};`;
    } else if (operationType === 'Mutation') {
      return `
export function ${operationName}() {
  return UrqlSvelte.mutation(UrqlSvelte.operationStore(${documentVariableName}));
};`;
    } else {
      return `
export function ${operationName}() {
  return UrqlSvelte.query(UrqlSvelte.operationStore(${documentVariableName}));
};`;
    }
  }
}
