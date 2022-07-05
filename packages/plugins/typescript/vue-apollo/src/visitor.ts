import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  getConfigValue,
  LoadedFragment,
  DocumentMode,
} from '@graphql-codegen/visitor-plugin-common';
import { VueApolloRawPluginConfig } from './config.js';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, GraphQLSchema } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { pascalCase, titleCase } from 'change-case-all';

export interface VueApolloPluginConfig extends ClientSideBasePluginConfig {
  withCompositionFunctions: boolean;
  vueApolloComposableImportFrom: 'vue' | '@vue/apollo-composable' | string;
  vueCompositionApiImportFrom: 'vue' | '@vue/apollo-composable' | string;
  addDocBlocks: boolean;
}

interface BuildCompositionFunctions {
  operationName: string;
  operationType: 'Query' | 'Mutation' | 'Subscription' | 'LazyQuery';
  operationResultType: string;
  operationVariablesTypes: string;
  operationHasNonNullableVariable: boolean;
  operationHasVariables: boolean;
  documentNodeVariable: string;
}

function insertIf(condition: boolean, ...elements: any[]) {
  return condition ? elements : [];
}

export class VueApolloVisitor extends ClientSideBaseVisitor<VueApolloRawPluginConfig, VueApolloPluginConfig> {
  private externalImportPrefix: string;
  private imports = new Set<string>();

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: VueApolloRawPluginConfig,
    documents: Types.DocumentFile[]
  ) {
    super(schema, fragments, rawConfig, {
      withCompositionFunctions: getConfigValue(rawConfig.withCompositionFunctions, true),
      vueApolloComposableImportFrom: getConfigValue(rawConfig.vueApolloComposableImportFrom, '@vue/apollo-composable'),
      vueCompositionApiImportFrom: getConfigValue(rawConfig.vueCompositionApiImportFrom, '@vue/composition-api'),
      addDocBlocks: getConfigValue(rawConfig.addDocBlocks, true),
    });

    this.externalImportPrefix = this.config.importOperationTypesFrom ? `${this.config.importOperationTypesFrom}.` : '';
    this._documents = documents;

    autoBind(this);
  }

  private get vueApolloComposableImport(): string {
    return `import * as VueApolloComposable from '${this.config.vueApolloComposableImportFrom}';`;
  }

  private get vueCompositionApiImport(): string {
    if (this.config.useTypeImports) {
      return `import type * as VueCompositionApi from '${this.config.vueCompositionApiImportFrom}';`;
    }

    return `import * as VueCompositionApi from '${this.config.vueCompositionApiImportFrom}';`;
  }

  private get reactiveFunctionType(): string {
    return 'export type ReactiveFunction<TParam> = () => TParam;';
  }

  private getDocumentNodeVariable(node: OperationDefinitionNode, documentVariableName: string): string {
    return this.config.documentMode === DocumentMode.external ? `Operations.${node.name.value}` : documentVariableName;
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }
    return [...baseImports, ...Array.from(this.imports)];
  }

  private buildCompositionFunctionsJSDoc(
    node: OperationDefinitionNode,
    operationName: string,
    operationType: string
  ): string {
    const operationHasVariables = node.variableDefinitions?.length > 0;

    const exampleVariablesString = node.variableDefinitions?.reduce((accumulator, currentDefinition) => {
      const name = currentDefinition.variable.name.value;

      return `${accumulator}\n *   ${operationType === 'Mutation' ? '  ' : ''}${name}: // value for '${name}'`;
    }, '');

    const exampleArguments = operationHasVariables
      ? operationType === 'Mutation'
        ? `{
 *   variables: {${exampleVariablesString}
 *   },
 * }`
        : `{${exampleVariablesString}
 * }`
      : '';

    const queryDescription = `
 * To run a query within a Vue component, call \`use${operationName}\` and pass it any options that fit your needs.
 * When your component renders, \`use${operationName}\` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.`;

    const queryExample = `
 * const { result, loading, error } = use${operationName}(${exampleArguments});`;

    const mutationDescription = `
 * To run a mutation, you first call \`use${operationName}\` within a Vue component and pass it any options that fit your needs.
 * When your component renders, \`use${operationName}\` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return`;

    const mutationExample = `
 * const { mutate, loading, error, onDone } = use${operationName}(${exampleArguments});`;

    return `
/**
 * __use${operationName}__
 *${operationType === 'Mutation' ? mutationDescription : queryDescription}
 *${
   operationHasVariables && operationType !== 'Mutation'
     ? `
 * @param variables that will be passed into the ${operationType.toLowerCase()}`
     : ''
 }
 * @param options that will be passed into the ${operationType.toLowerCase()}, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/${
      operationType === 'Mutation' ? 'mutation' : operationType === 'Subscription' ? 'subscription' : 'query'
    }.html#options;
 *
 * @example${operationType === 'Mutation' ? mutationExample : queryExample}
 */`;
  }

  private getCompositionFunctionSuffix(name: string, operationType: string) {
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
    operationType: 'Query' | 'Mutation' | 'Subscription',
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    operationResultType = this.externalImportPrefix + operationResultType;
    operationVariablesTypes = this.externalImportPrefix + operationVariablesTypes;

    if (!this.config.withCompositionFunctions) {
      // todo - throw human readable error
      return '';
    }

    if (!node.name?.value) {
      // todo - throw human readable error
      return '';
    }

    const suffix = this.getCompositionFunctionSuffix(node.name.value, operationType);
    const operationName: string = this.convertName(node.name.value, {
      suffix,
      useTypesPrefix: false,
    });

    const operationHasVariables = node.variableDefinitions?.length > 0;

    const operationHasNonNullableVariable = !!node.variableDefinitions?.some(({ type }) => type.kind === 'NonNullType');

    this.imports.add(this.vueApolloComposableImport);
    this.imports.add(this.vueCompositionApiImport);

    // hacky: technically not an import, but a typescript type that is required in the generated code
    this.imports.add(this.reactiveFunctionType);

    const documentNodeVariable = this.getDocumentNodeVariable(node, documentVariableName); // i.e. TestDocument

    const compositionFunctionResultType = this.buildCompositionFunctionReturnType({
      operationName,
      operationType,
      operationResultType,
      operationVariablesTypes,
    });

    const compositionFunctions = [
      this.buildCompositionFunction({
        operationName,
        operationType,
        operationResultType,
        operationVariablesTypes,
        operationHasNonNullableVariable,
        operationHasVariables,
        documentNodeVariable,
      }),
    ];

    if (operationType === 'Query') {
      const lazyOperationName: string = this.convertName(node.name.value, {
        suffix: titleCase('LazyQuery'),
        useTypesPrefix: false,
      });

      const lazyOperationType = 'LazyQuery';

      compositionFunctions.push(
        this.buildCompositionFunction({
          operationName: lazyOperationName,
          operationType: lazyOperationType,
          operationResultType,
          operationVariablesTypes,
          operationHasNonNullableVariable,
          operationHasVariables,
          documentNodeVariable,
        })
      );
    }

    return [
      ...insertIf(this.config.addDocBlocks, [this.buildCompositionFunctionsJSDoc(node, operationName, operationType)]),
      compositionFunctions.join('\n'),
      compositionFunctionResultType,
    ].join('\n');
  }

  private buildCompositionFunction({
    operationName,
    operationType,
    operationResultType,
    operationVariablesTypes,
    operationHasNonNullableVariable,
    operationHasVariables,
    documentNodeVariable,
  }: BuildCompositionFunctions): string {
    const variables = operationHasVariables
      ? `variables: ${operationVariablesTypes} | VueCompositionApi.Ref<${operationVariablesTypes}> | ReactiveFunction<${operationVariablesTypes}>${
          operationHasNonNullableVariable ? '' : ' = {}'
        }, `
      : '';

    switch (operationType) {
      case 'Query': {
        return `export function use${operationName}(${variables}options: VueApolloComposable.UseQueryOptions<${operationResultType}, ${operationVariablesTypes}> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<${operationResultType}, ${operationVariablesTypes}>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<${operationResultType}, ${operationVariablesTypes}>> = {}) {
  return VueApolloComposable.useQuery<${operationResultType}, ${operationVariablesTypes}>(${documentNodeVariable}, ${
          operationHasVariables ? 'variables' : '{}'
        }, options);
}`;
      }
      case 'LazyQuery': {
        return `export function use${operationName}(${variables}options: VueApolloComposable.UseQueryOptions<${operationResultType}, ${operationVariablesTypes}> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<${operationResultType}, ${operationVariablesTypes}>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<${operationResultType}, ${operationVariablesTypes}>> = {}) {
  return VueApolloComposable.useLazyQuery<${operationResultType}, ${operationVariablesTypes}>(${documentNodeVariable}, ${
          operationHasVariables ? 'variables' : '{}'
        }, options);
}`;
      }
      case 'Mutation': {
        return `export function use${operationName}(options: VueApolloComposable.UseMutationOptions<${operationResultType}, ${operationVariablesTypes}> | ReactiveFunction<VueApolloComposable.UseMutationOptions<${operationResultType}, ${operationVariablesTypes}>>${
          operationHasNonNullableVariable ? '' : ' = {}'
        }) {
  return VueApolloComposable.useMutation<${operationResultType}, ${operationVariablesTypes}>(${documentNodeVariable}, options);
}`;
      }
      case 'Subscription': {
        return `export function use${operationName}(${variables}options: VueApolloComposable.UseSubscriptionOptions<${operationResultType}, ${operationVariablesTypes}> | VueCompositionApi.Ref<VueApolloComposable.UseSubscriptionOptions<${operationResultType}, ${operationVariablesTypes}>> | ReactiveFunction<VueApolloComposable.UseSubscriptionOptions<${operationResultType}, ${operationVariablesTypes}>> = {}) {
  return VueApolloComposable.useSubscription<${operationResultType}, ${operationVariablesTypes}>(${documentNodeVariable}, ${
          operationHasVariables ? 'variables' : '{}'
        }, options);
}`;
      }
    }
  }

  private buildCompositionFunctionReturnType({
    operationName,
    operationType,
    operationResultType,
    operationVariablesTypes,
  }: Partial<BuildCompositionFunctions>) {
    return `export type ${operationName}CompositionFunctionResult = VueApolloComposable.Use${operationType}Return<${operationResultType}, ${operationVariablesTypes}>;`;
  }
}
