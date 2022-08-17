import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  getConfigValue,
  LoadedFragment,
  DocumentMode,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, GraphQLSchema } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { camelCase, pascalCase } from 'change-case-all';
import { VueApolloSmartOpsRawPluginConfig } from './config.js';

export interface VueApolloSmartOpsPluginConfig extends ClientSideBasePluginConfig {
  withSmartOperationFunctions: boolean;
  vueApolloOperationFunctionsImportFrom: 'vue-apollo-smart-ops' | string;
  vueApolloErrorType: 'ApolloError' | string;
  vueApolloErrorTypeImportFrom: 'apollo-client' | string;
  vueApolloErrorHandlerFunction?: string;
  vueApolloErrorHandlerFunctionImportFrom?: string;
  vueAppType?: string;
  vueAppTypeImportFrom?: string;
  addDocBlocks: boolean;
}

type OperationTypeName = 'Query' | 'Mutation' | 'Subscription';

interface BuildOperationFunctionParams {
  operationName: string;
  operationType: OperationTypeName;
  operationResultType: string;
  operationVariablesTypes: string;
  operationHasNonNullableVariable: boolean;
  operationHasVariables: boolean;
  documentNodeVariable: string;
}

function insertIf(condition: boolean, ...elements: any[]): any[] {
  return condition ? elements : [];
}

export class VueApolloVisitor extends ClientSideBaseVisitor<
  VueApolloSmartOpsRawPluginConfig,
  VueApolloSmartOpsPluginConfig
> {
  private externalImportPrefix: string;
  private imports = new Set<string>();

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: VueApolloSmartOpsRawPluginConfig,
    documents: Types.DocumentFile[]
  ) {
    super(schema, fragments, rawConfig, {
      withSmartOperationFunctions: getConfigValue(rawConfig.withSmartOperationFunctions, true),
      vueApolloOperationFunctionsImportFrom: getConfigValue(
        rawConfig.vueApolloOperationFunctionsImportFrom,
        'vue-apollo-smart-ops'
      ),
      vueApolloErrorType: getConfigValue(rawConfig.vueApolloErrorType, 'ApolloError'),
      vueApolloErrorTypeImportFrom: getConfigValue(rawConfig.vueApolloErrorTypeImportFrom, 'apollo-client'),
      vueApolloErrorHandlerFunction: getConfigValue(rawConfig.vueApolloErrorHandlerFunction, undefined),
      vueApolloErrorHandlerFunctionImportFrom: getConfigValue(
        rawConfig.vueApolloErrorHandlerFunctionImportFrom,
        undefined
      ),
      vueAppType: getConfigValue(rawConfig.vueAppType, undefined),
      vueAppTypeImportFrom: getConfigValue(rawConfig.vueAppTypeImportFrom, undefined),
      addDocBlocks: getConfigValue(rawConfig.addDocBlocks, true),
    });

    this.externalImportPrefix = this.config.importOperationTypesFrom ? `${this.config.importOperationTypesFrom}.` : '';
    this._documents = documents;

    autoBind(this);
  }

  private get vueApolloOperationFunctionsImport(): string {
    return `import { createMutationFunction, createSmartQueryOptionsFunction, createSmartSubscriptionOptionsFunction } from '${this.config.vueApolloOperationFunctionsImportFrom}';`;
  }

  private get vueApolloErrorTypeImport(): string {
    return `import { ${this.config.vueApolloErrorType} } from '${this.config.vueApolloErrorTypeImportFrom}';`;
  }

  private get vueApolloErrorHandlerFunctionImport(): string {
    if (!this.config.vueApolloErrorHandlerFunction || !this.config.vueApolloErrorHandlerFunctionImportFrom) {
      return '';
    }

    return `import { ${this.config.vueApolloErrorHandlerFunction} } from '${this.config.vueApolloErrorHandlerFunctionImportFrom}';`;
  }

  private get vueAppTypeImport(): string {
    if (!this.config.vueAppType || !this.config.vueAppTypeImportFrom) {
      return '';
    }

    return `import { ${this.config.vueAppType} } from '${this.config.vueAppTypeImportFrom}';`;
  }

  private getDocumentNodeVariable(node: OperationDefinitionNode, documentVariableName: string): string {
    return this.config.documentMode === DocumentMode.external ? `Operations.${node.name?.value}` : documentVariableName;
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }
    return [...baseImports, ...Array.from(this.imports)];
  }

  private buildOperationFunctionsJSDoc(
    node: OperationDefinitionNode,
    operationName: string,
    operationType: OperationTypeName
  ): string {
    const operationFunctionName = operationType === 'Mutation' ? camelCase(operationName) : `use${operationName}`;
    const operationNameWithoutSuffix = camelCase(operationName).replace(/(Query|Mutation|Subscription)$/, '');

    const exampleVariables = (node.variableDefinitions ?? []).map(variableDefinition => {
      const name = variableDefinition.variable.name.value;

      return `${name}: // value for '${name}'`;
    });

    switch (operationType) {
      case 'Query':
        return `
/**
 * __${operationFunctionName}__
 *
 * To use a Smart Query within a Vue component, call \`${operationFunctionName}\` as the value for a query key
 * in the component's \`apollo\` config, passing any options required for the query.
 *
 * @param options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.query
 *
 * @example
 * {
 *   apollo: {
 *     ${operationNameWithoutSuffix}: ${operationFunctionName}({
 *       variables: {${
   exampleVariables.length > 0
     ? `
 *         ${exampleVariables.join(`
 *         `)}
 *       `
     : ''
 }},
 *       loadingKey: 'loading',
 *       fetchPolicy: 'no-cache',
 *     }),
 *   }
 * }
 */`;
      case 'Mutation':
        return `
/**
 * __${operationFunctionName}__
 *
 * To run a mutation, you call \`${operationFunctionName}\` within a Vue component and pass it
 * your Vue app instance along with any options that fit your needs.
 *
 * @param app, a reference to your Vue app instance (which must have a \`$apollo\` property)
 * @param options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.mutate
 * @param client (optional), which can be an instance of \`DollarApollo\` or the \`mutate()\` function provided by an \`<ApolloMutation>\` component
 *
 * @example
 * const { success, data, errors } = ${operationFunctionName}(this, {
 *   variables: {${
   exampleVariables.length > 0
     ? `
 *     ${exampleVariables.join(`
 *     `)}
 *   `
     : ''
 }},
 * });
 */`;
      case 'Subscription':
        return `
/**
 * __${operationFunctionName}__
 *
 * To use a Smart Subscription within a Vue component, call \`${operationFunctionName}\` as the value for a \`$subscribe\` key
 * in the component's \`apollo\` config, passing any options required for the subscription.
 *
 * @param options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.subscribe
 *
 * @example
 * {
 *   apollo: {
 *     $subscribe: {
 *       ${operationNameWithoutSuffix}: ${operationFunctionName}({
 *         variables: {${
   exampleVariables.length > 0
     ? `
 *           ${exampleVariables.join(`
 *           `)}
 *         `
     : ''
 }},
 *         loadingKey: 'loading',
 *         fetchPolicy: 'no-cache',
 *       }),
 *     },
 *   }
 * }
 */`;
    }
  }

  private getOperationFunctionSuffix(name: string, operationType: OperationTypeName): string {
    if (!this.config.dedupeOperationSuffix) {
      return this.config.omitOperationSuffix ? '' : pascalCase(operationType);
    }
    if (name.includes('Query') || name.includes('Mutation') || name.includes('Subscription')) {
      return '';
    }
    return pascalCase(operationType);
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: OperationTypeName,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    operationResultType = this.externalImportPrefix + operationResultType;
    operationVariablesTypes = this.externalImportPrefix + operationVariablesTypes;

    if (!this.config.withSmartOperationFunctions) {
      // todo - throw human readable error
      return '';
    }

    if (!node.name?.value) {
      // todo - throw human readable error
      return '';
    }

    const suffix = this.getOperationFunctionSuffix(node.name.value, operationType);
    const operationName: string = this.convertName(node.name.value, {
      suffix,
      useTypesPrefix: false,
    });

    const operationHasVariables = (node.variableDefinitions ?? []).length > 0;
    const operationHasNonNullableVariable = !!node.variableDefinitions?.some(({ type }) => type.kind === 'NonNullType');

    this.imports.add(this.vueApolloOperationFunctionsImport);
    this.imports.add(this.vueApolloErrorTypeImport);

    if (this.vueApolloErrorHandlerFunctionImport) {
      this.imports.add(this.vueApolloErrorHandlerFunctionImport);
    }

    if (this.vueAppTypeImport) {
      this.imports.add(this.vueAppTypeImport);
    }

    const documentNodeVariable = this.getDocumentNodeVariable(node, documentVariableName); // i.e. TestDocument

    const operationFunction = this.buildOperationFunction({
      operationName,
      operationType,
      operationResultType,
      operationVariablesTypes,
      operationHasNonNullableVariable,
      operationHasVariables,
      documentNodeVariable,
    });
    return [
      ...insertIf(this.config.addDocBlocks, [this.buildOperationFunctionsJSDoc(node, operationName, operationType)]),
      operationFunction,
      '',
    ].join('\n');
  }

  private buildOperationFunction({
    operationName,
    operationType,
    operationResultType,
    operationVariablesTypes,
    documentNodeVariable,
  }: BuildOperationFunctionParams): string {
    const operationArguments: string[] = [documentNodeVariable];
    if (this.config.vueApolloErrorHandlerFunction) {
      operationArguments.push(this.config.vueApolloErrorHandlerFunction);
    }

    const genericTypeArguments: string[] = [
      operationResultType,
      operationVariablesTypes,
      this.config.vueApolloErrorType,
    ];
    if (this.config.vueAppType) {
      genericTypeArguments.push(this.config.vueAppType);
    }

    switch (operationType) {
      case 'Query': {
        return `export const use${operationName} = createSmartQueryOptionsFunction<
  ${genericTypeArguments.join(',\n  ')}
>(${operationArguments.join(', ')});`;
      }
      case 'Mutation': {
        return `export const ${camelCase(operationName)} = createMutationFunction<
  ${genericTypeArguments.join(',\n  ')}
>(${operationArguments.join(', ')});`;
      }
      case 'Subscription': {
        return `export const use${operationName} = createSmartSubscriptionOptionsFunction<
  ${genericTypeArguments.join(',\n  ')}
>(${operationArguments.join(', ')});`;
      }
    }
  }
}
