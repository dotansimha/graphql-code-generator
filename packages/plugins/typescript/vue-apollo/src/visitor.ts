import { ClientSideBaseVisitor, ClientSideBasePluginConfig, getConfigValue, LoadedFragment, DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { VueApolloRawPluginConfig } from './index';
import autoBind from 'auto-bind';
import { OperationDefinitionNode } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { pascalCase } from 'change-case';
import { GraphQLSchema } from 'graphql';

export interface VueApolloPluginConfig extends ClientSideBasePluginConfig {
  withCompositionFunctions: boolean;
  vueApolloComposableImportFrom: string;
  addDocBlocks: boolean;
}

interface BuildCompositionFunctions {
  operationName: string;
  operationType: 'Query' | 'Mutation' | 'Subscription';
  documentNodeVariable: string;
  operationResultType: string;
  operationVariablesTypes: string;
}

function insertIf(condition: boolean, ...elements: any[]) {
  return condition ? elements : [];
}

export class VueApolloVisitor extends ClientSideBaseVisitor<VueApolloRawPluginConfig, VueApolloPluginConfig> {
  private externalImportPrefix: string;
  private imports = new Set<string>();

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: VueApolloRawPluginConfig, documents: Types.DocumentFile[]) {
    super(schema, fragments, rawConfig, {
      withCompositionFunctions: getConfigValue(rawConfig.withCompositionFunctions, true),
      vueApolloComposableImportFrom: getConfigValue(rawConfig.vueApolloComposableImportFrom, '@vue/apollo-composable'),
      addDocBlocks: getConfigValue(rawConfig.addDocBlocks, true),
    });

    this.externalImportPrefix = this.config.importOperationTypesFrom ? `${this.config.importOperationTypesFrom}.` : '';
    this._documents = documents;

    autoBind(this);
  }

  private getVueApolloComposableImport(): string {
    return `import * as VueApolloComposable from '${this.config.vueApolloComposableImportFrom}';`;
  }

  private getDocumentNodeVariable(node: OperationDefinitionNode, documentVariableName: string): string {
    return this.config.documentMode === DocumentMode.external ? `Operations.${node.name!.value}` : documentVariableName;
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }
    return [...baseImports, ...Array.from(this.imports)];
  }

  private buildCompositionFunctionsJSDoc(node: OperationDefinitionNode, operationName: string, operationType: string): string {
    const variableString = node.variableDefinitions?.reduce((accumulator, currentDefinition) => {
      const name = currentDefinition.variable.name.value;

      return `${accumulator}\n *      ${name}: // value for '${name}'`;
    }, '');

    const queryDescription = `
 * To run a query within a Vue component, call \`use${operationName}\` and pass it any options that fit your needs.
 * When your component renders, \`use${operationName}\` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.`;

    const queryExample = `
 * const { result, loading, error } = use${operationName}(
 *   {${variableString}
 *   }
 * );`;

    const mutationDescription = `
 * To run a mutation, you first call \`use${operationName}\` within a Vue component and pass it any options that fit your needs.
 * When your component renders, \`use${operationName}\` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return`;

    const mutationExample = `
 * const { mutate, loading, error, onDone } = use${operationName}({
 *   variables: {${variableString}
 *   },
 * });`;

    return `
/**
 * __use${operationName}__
 *${operationType === 'Mutation' ? mutationDescription : queryDescription}
 *
 * @param baseOptions options that will be passed into the ${operationType.toLowerCase()}, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/${operationType === 'Mutation' ? 'mutation' : 'query'}.html#options;
 *
 * @example${operationType === 'Mutation' ? mutationExample : queryExample}
 */`;
  }

  private getCompositionFunctionSuffix(name: string, operationType: string) {
    if (!this.config.dedupeOperationSuffix) {
      return pascalCase(operationType);
    }
    if (name.includes('Query') || name.includes('Mutation') || name.includes('Subscription')) {
      return '';
    }
    return pascalCase(operationType);
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: 'Query' | 'Mutation' | 'Subscription', operationResultType: string, operationVariablesTypes: string): string {
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

    this.imports.add(this.getVueApolloComposableImport());

    const documentNodeVariable = this.getDocumentNodeVariable(node, documentVariableName); // i.e. TestDocument

    const compositionFunctionResultType = this.buildCompositionFunctionReturnType(operationName);

    const compositionFunction = this.buildCompositionFunction({
      operationName,
      operationType,
      operationResultType,
      operationVariablesTypes,
      documentNodeVariable,
    });
    return [...insertIf(this.config.addDocBlocks, [this.buildCompositionFunctionsJSDoc(node, operationName, operationType)]), compositionFunction, compositionFunctionResultType].join('\n');
  }

  private buildCompositionFunction({ operationName, operationType, documentNodeVariable, operationResultType, operationVariablesTypes }: BuildCompositionFunctions): string {
    switch (operationType) {
      case 'Query':
        return `export function use${operationName}(variables?: ${operationVariablesTypes}, baseOptions?: VueApolloComposable.Use${operationType}Options<${operationResultType}, ${operationVariablesTypes}>) {
          return VueApolloComposable.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentNodeVariable}, variables, baseOptions);
        }`;
      case 'Mutation':
        // Omit<VueApolloComposable.UseMutationOptions<SubmitRepositoryMutation>, 'variables'>, variables: SubmitRepositoryMutationVariables }
        return `export function use${operationName}(baseOptions?: VueApolloComposable.Use${operationType}Options<${operationResultType}, ${operationVariablesTypes}>) {
            return VueApolloComposable.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentNodeVariable}, baseOptions);
          }`;
      case 'Subscription':
        return `export function use${operationName}(variables?: ${operationVariablesTypes}, baseOptions?: VueApolloComposable.Use${operationType}Options<${operationResultType}, ${operationVariablesTypes}>) {
            return VueApolloComposable.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentNodeVariable}, variables, baseOptions);
          }`;
    }
  }

  private buildCompositionFunctionReturnType(operationName: string) {
    return `export type ${operationName}CompositionFunctionResult = ReturnType<typeof use${operationName}>;`;
  }
}
