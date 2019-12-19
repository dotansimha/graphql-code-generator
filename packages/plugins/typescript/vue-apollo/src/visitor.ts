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
export class VueApolloVisitor extends ClientSideBaseVisitor<VueApolloRawPluginConfig, VueApolloPluginConfig> {
  private _externalImportPrefix: string;
  private imports = new Set<string>();

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: VueApolloRawPluginConfig, documents: Types.DocumentFile[]) {
    super(schema, fragments, rawConfig, {
      withCompositionFunctions: getConfigValue(rawConfig.withCompositionFunctions, true),
      vueApolloComposableImportFrom: getConfigValue(rawConfig.vueApolloComposableImportFrom, '@vue/apollo-composable'),
      addDocBlocks: getConfigValue(rawConfig.addDocBlocks, true),
    });

    this._externalImportPrefix = this.config.importOperationTypesFrom ? `${this.config.importOperationTypesFrom}.` : '';
    this._documents = documents;

    autoBind(this);
  }

  private getVueApolloComposableImport(): string {
    return `import * as VueApolloComposable from '${this.config.vueApolloComposableImportFrom}';`;
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

  private _buildCompositionFunctionsJSDoc(node: OperationDefinitionNode, operationName: string, operationType: string): string {
    const variableString = node.variableDefinitions.reduce((acc, item) => {
      const name = item.variable.name.value;

      return `${acc}\n *      ${name}: // value for '${name}'`;
    }, '');

    const queryDescription = `
 * To run a query within a Vue component, call \`use${operationName}\` and pass it any options that fit your needs.
 * When your component renders, \`use${operationName}\` returns an object from Apollo Client that contains loading, error, and result properties
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

  private _buildCompositionFunctions(node: OperationDefinitionNode, operationType: string, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    const suffix = this._getCompositionFunctionSuffix(node.name.value, operationType);
    const operationName: string = this.convertName(node.name.value, {
      suffix,
      useTypesPrefix: false,
    });
    const isQueryOrSubscription = ['Query', 'Subscription'].includes(operationType);

    this.imports.add(this.getVueApolloComposableImport());

    const compositionFunctions = [
      `export function use${operationName}(${isQueryOrSubscription ? `variables?: ${operationVariablesTypes}, ` : ''}baseOptions?: VueApolloComposable.Use${operationType}Options<${operationResultType}, ${operationVariablesTypes}>) {
        return VueApolloComposable.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${this.getDocumentNodeVariable(node, documentVariableName)}, ${isQueryOrSubscription ? 'variables, ' : ''}baseOptions);
      }`,
    ];

    if (this.config.addDocBlocks) {
      compositionFunctions.unshift(this._buildCompositionFunctionsJSDoc(node, operationName, operationType));
    }

    const compositionFunctionResults = [`export type ${operationName}CompositionFunctionResult = ReturnType<typeof use${operationName}>;`];

    return [...compositionFunctions, ...compositionFunctionResults].join('\n');
  }

  private _getCompositionFunctionSuffix(name: string, operationType: string) {
    if (!this.config.dedupeOperationSuffix) {
      return pascalCase(operationType);
    }
    if (name.includes('Query') || name.includes('Mutation') || name.includes('Subscription')) {
      return '';
    }
    return pascalCase(operationType);
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    operationResultType = this._externalImportPrefix + operationResultType;
    operationVariablesTypes = this._externalImportPrefix + operationVariablesTypes;

    const compositionFunctions = this.config.withCompositionFunctions ? this._buildCompositionFunctions(node, operationType, documentVariableName, operationResultType, operationVariablesTypes) : null;

    return [compositionFunctions].filter(a => a).join('\n');
  }
}
