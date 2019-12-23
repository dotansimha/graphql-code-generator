import { ClientSideBaseVisitor, ClientSideBasePluginConfig, getConfigValue, LoadedFragment, OMIT_TYPE, DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { ReactApolloRawPluginConfig } from './index';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, Kind } from 'graphql';
import { toPascalCase, Types } from '@graphql-codegen/plugin-helpers';
import { pascalCase } from 'pascal-case';
import { camelCase } from 'camel-case';
import { GraphQLSchema } from 'graphql';

export interface ReactApolloPluginConfig extends ClientSideBasePluginConfig {
  withComponent: boolean;
  withHOC: boolean;
  withHooks: boolean;
  withMutationFn: boolean;
  apolloReactCommonImportFrom: string;
  apolloReactComponentsImportFrom: string;
  apolloReactHocImportFrom: string;
  apolloReactHooksImportFrom: string;
  componentSuffix: string;
  reactApolloVersion: 2 | 3;
  withResultType: boolean;
  withMutationOptionsType: boolean;
  addDocBlocks: boolean;
}

export class ReactApolloVisitor extends ClientSideBaseVisitor<ReactApolloRawPluginConfig, ReactApolloPluginConfig> {
  private _externalImportPrefix: string;
  private imports = new Set<string>();

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: ReactApolloRawPluginConfig, documents: Types.DocumentFile[]) {
    super(schema, fragments, rawConfig, {
      componentSuffix: getConfigValue(rawConfig.componentSuffix, 'Component'),
      withHOC: getConfigValue(rawConfig.withHOC, true),
      withComponent: getConfigValue(rawConfig.withComponent, true),
      withHooks: getConfigValue(rawConfig.withHooks, false),
      withMutationFn: getConfigValue(rawConfig.withMutationFn, true),
      apolloReactCommonImportFrom: getConfigValue(rawConfig.apolloReactCommonImportFrom, rawConfig.reactApolloVersion === 3 ? '@apollo/client' : '@apollo/react-common'),
      apolloReactComponentsImportFrom: getConfigValue(rawConfig.apolloReactComponentsImportFrom, rawConfig.reactApolloVersion === 3 ? '@apollo/client' : '@apollo/react-components'),
      apolloReactHocImportFrom: getConfigValue(rawConfig.apolloReactHocImportFrom, rawConfig.reactApolloVersion === 3 ? '@apollo/client' : '@apollo/react-hoc'),
      apolloReactHooksImportFrom: getConfigValue(rawConfig.apolloReactHooksImportFrom, rawConfig.reactApolloVersion === 3 ? '@apollo/client' : '@apollo/react-hooks'),
      reactApolloVersion: getConfigValue(rawConfig.reactApolloVersion, 2),
      withResultType: getConfigValue(rawConfig.withResultType, true),
      withMutationOptionsType: getConfigValue(rawConfig.withMutationOptionsType, true),
      addDocBlocks: getConfigValue(rawConfig.addDocBlocks, true),
    });

    this._externalImportPrefix = this.config.importOperationTypesFrom ? `${this.config.importOperationTypesFrom}.` : '';
    this._documents = documents;

    autoBind(this);
  }

  private getReactImport(): string {
    return `import * as React from 'react';`;
  }

  private getApolloReactCommonImport(): string {
    return `import * as ApolloReactCommon from '${this.config.apolloReactCommonImportFrom}';`;
  }

  private getApolloReactComponentsImport(): string {
    return `import * as ApolloReactComponents from '${this.config.apolloReactComponentsImportFrom}';`;
  }

  private getApolloReactHocImport(): string {
    return `import * as ApolloReactHoc from '${this.config.apolloReactHocImportFrom}';`;
  }

  private getApolloReactHooksImport(): string {
    return `import * as ApolloReactHooks from '${this.config.apolloReactHooksImportFrom}';`;
  }

  private getOmitDeclaration(): string {
    return OMIT_TYPE;
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

  private _buildHocProps(operationName: string, operationType: string): string {
    const typeVariableName = this._externalImportPrefix + this.convertName(operationName + toPascalCase(operationType) + this._parsedConfig.operationResultSuffix);
    const variablesVarName = this._externalImportPrefix + this.convertName(operationName + toPascalCase(operationType) + 'Variables');
    const argType = operationType === 'mutation' ? 'MutateProps' : 'DataProps';

    this.imports.add(this.getApolloReactCommonImport());
    this.imports.add(this.getApolloReactHocImport());

    return `ApolloReactHoc.${argType}<${typeVariableName}, ${variablesVarName}>`;
  }

  private _buildMutationFn(node: OperationDefinitionNode, operationResultType: string, operationVariablesTypes: string): string {
    if (node.operation === 'mutation') {
      this.imports.add(this.getApolloReactCommonImport());
      return `export type ${this.convertName(node.name.value + 'MutationFn')} = ApolloReactCommon.MutationFunction<${operationResultType}, ${operationVariablesTypes}>;`;
    }
    return null;
  }

  private _buildOperationHoc(node: OperationDefinitionNode, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    this.imports.add(this.getApolloReactCommonImport());
    this.imports.add(this.getApolloReactHocImport());
    const operationName: string = this.convertName(node.name.value, { useTypesPrefix: false });
    const propsTypeName: string = this.convertName(node.name.value, { suffix: 'Props' });

    const propsVar = `export type ${propsTypeName}<TChildProps = {}> = ${this._buildHocProps(node.name.value, node.operation)} | TChildProps;`;

    const hocString = `export function with${operationName}<TProps, TChildProps = {}>(operationOptions?: ApolloReactHoc.OperationOption<
  TProps,
  ${operationResultType},
  ${operationVariablesTypes},
  ${propsTypeName}<TChildProps>>) {
    return ApolloReactHoc.with${pascalCase(node.operation)}<TProps, ${operationResultType}, ${operationVariablesTypes}, ${propsTypeName}<TChildProps>>(${this.getDocumentNodeVariable(node, documentVariableName)}, {
      alias: '${camelCase(operationName)}',
      ...operationOptions
    });
};`;

    return [propsVar, hocString].filter(a => a).join('\n');
  }

  private _buildComponent(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const componentPropsName: string = this.convertName(node.name.value, {
      suffix: this.config.componentSuffix + 'Props',
      useTypesPrefix: false,
    });
    const componentName: string = this.convertName(node.name.value, {
      suffix: this.config.componentSuffix,
      useTypesPrefix: false,
    });

    const isVariablesRequired = operationType === 'Query' && node.variableDefinitions.some(variableDef => variableDef.type.kind === Kind.NON_NULL_TYPE);

    this.imports.add(this.getReactImport());
    this.imports.add(this.getApolloReactCommonImport());
    this.imports.add(this.getApolloReactComponentsImport());
    this.imports.add(this.getOmitDeclaration());

    const propsType = `Omit<ApolloReactComponents.${operationType}ComponentOptions<${operationResultType}, ${operationVariablesTypes}>, '${operationType.toLowerCase()}'>`;
    let componentProps = '';
    if (isVariablesRequired) {
      componentProps = `export type ${componentPropsName} = ${propsType} & ({ variables: ${operationVariablesTypes}; skip?: boolean; } | { skip: boolean; });`;
    } else {
      componentProps = `export type ${componentPropsName} = ${propsType};`;
    }

    const component = `
    export const ${componentName} = (props: ${componentPropsName}) => (
      <ApolloReactComponents.${operationType}<${operationResultType}, ${operationVariablesTypes}> ${node.operation}={${this.getDocumentNodeVariable(node, documentVariableName)}} {...props} />
    );
    `;
    return [componentProps, component].join('\n');
  }

  private _buildHooksJSDoc(node: OperationDefinitionNode, operationName: string, operationType: string): string {
    const variableString = node.variableDefinitions.reduce((acc, item) => {
      const name = item.variable.name.value;

      return `${acc}\n *      ${name}: // value for '${name}'`;
    }, '');

    const queryDescription = `
 * To run a query within a React component, call \`use${operationName}\` and pass it any options that fit your needs.
 * When your component renders, \`use${operationName}\` returns an object from Apollo Client that contains loading, error, and data properties 
 * you can use to render your UI.`;

    const queryExample = `
 * const { data, loading, error } = use${operationName}({
 *   variables: {${variableString}
 *   },
 * });`;

    const mutationDescription = `
 * To run a mutation, you first call \`use${operationName}\` within a React component and pass it any options that fit your needs.
 * When your component renders, \`use${operationName}\` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution`;

    const mutationExample = `
 * const [${camelCase(operationName)}, { data, loading, error }] = use${operationName}({
 *   variables: {${variableString}
 *   },
 * });`;

    return `
/**
 * __use${operationName}__
 *${operationType === 'Mutation' ? mutationDescription : queryDescription}
 *
 * @param baseOptions options that will be passed into the ${operationType.toLowerCase()}, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#${operationType === 'Mutation' ? 'options-2' : 'options'};
 *
 * @example${operationType === 'Mutation' ? mutationExample : queryExample}
 */`;
  }

  private _buildHooks(node: OperationDefinitionNode, operationType: string, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    const suffix = this._getHookSuffix(node.name.value, operationType);
    const operationName: string = this.convertName(node.name.value, {
      suffix,
      useTypesPrefix: false,
    });

    this.imports.add(this.getApolloReactCommonImport());
    this.imports.add(this.getApolloReactHooksImport());

    const hookFns = [
      `export function use${operationName}(baseOptions?: ApolloReactHooks.${operationType}HookOptions<${operationResultType}, ${operationVariablesTypes}>) {
        return ApolloReactHooks.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${this.getDocumentNodeVariable(node, documentVariableName)}, baseOptions);
      }`,
    ];

    if (this.config.addDocBlocks) {
      hookFns.unshift(this._buildHooksJSDoc(node, operationName, operationType));
    }

    const hookResults = [`export type ${operationName}HookResult = ReturnType<typeof use${operationName}>;`];

    if (operationType === 'Query') {
      const lazyOperationName: string = this.convertName(node.name.value, {
        suffix: pascalCase('LazyQuery'),
        useTypesPrefix: false,
      });
      hookFns.push(
        `export function use${lazyOperationName}(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<${operationResultType}, ${operationVariablesTypes}>) {
          return ApolloReactHooks.useLazyQuery<${operationResultType}, ${operationVariablesTypes}>(${this.getDocumentNodeVariable(node, documentVariableName)}, baseOptions);
        }`
      );
      hookResults.push(`export type ${lazyOperationName}HookResult = ReturnType<typeof use${lazyOperationName}>;`);
    }

    return [...hookFns, ...hookResults].join('\n');
  }

  private _getHookSuffix(name: string, operationType: string) {
    if (!this.config.dedupeOperationSuffix) {
      return pascalCase(operationType);
    }
    if (name.includes('Query') || name.includes('Mutation') || name.includes('Subscription')) {
      return '';
    }
    return pascalCase(operationType);
  }

  private _buildResultType(node: OperationDefinitionNode, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const componentResultType = this.convertName(node.name.value, {
      suffix: `${operationType}Result`,
      useTypesPrefix: false,
    });

    switch (node.operation) {
      case 'query':
        this.imports.add(this.getApolloReactCommonImport());
        return `export type ${componentResultType} = ApolloReactCommon.QueryResult<${operationResultType}, ${operationVariablesTypes}>;`;
      case 'mutation':
        this.imports.add(this.getApolloReactCommonImport());
        return `export type ${componentResultType} = ApolloReactCommon.MutationResult<${operationResultType}>;`;
      case 'subscription':
        this.imports.add(this.getApolloReactCommonImport());
        return `export type ${componentResultType} = ApolloReactCommon.SubscriptionResult<${operationResultType}>;`;
      default:
        return '';
    }
  }

  private _buildWithMutationOptionsType(node: OperationDefinitionNode, operationResultType: string, operationVariablesTypes: string): string {
    if (node.operation !== 'mutation') {
      return '';
    }

    this.imports.add(this.getApolloReactCommonImport());

    const mutationOptionsType = this.convertName(node.name.value, { suffix: 'MutationOptions', useTypesPrefix: false });

    return `export type ${mutationOptionsType} = ApolloReactCommon.BaseMutationOptions<${operationResultType}, ${operationVariablesTypes}>;`;
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    operationResultType = this._externalImportPrefix + operationResultType;
    operationVariablesTypes = this._externalImportPrefix + operationVariablesTypes;

    const mutationFn = this.config.withMutationFn || this.config.withComponent ? this._buildMutationFn(node, operationResultType, operationVariablesTypes) : null;
    const component = this.config.withComponent ? this._buildComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) : null;
    const hoc = this.config.withHOC ? this._buildOperationHoc(node, documentVariableName, operationResultType, operationVariablesTypes) : null;
    const hooks = this.config.withHooks ? this._buildHooks(node, operationType, documentVariableName, operationResultType, operationVariablesTypes) : null;
    const resultType = this.config.withResultType ? this._buildResultType(node, operationType, operationResultType, operationVariablesTypes) : null;
    const mutationOptionsType = this.config.withMutationOptionsType ? this._buildWithMutationOptionsType(node, operationResultType, operationVariablesTypes) : null;

    return [mutationFn, component, hoc, hooks, resultType, mutationOptionsType].filter(a => a).join('\n');
  }
}
