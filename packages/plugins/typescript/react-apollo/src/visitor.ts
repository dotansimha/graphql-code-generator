import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  getConfigValue,
  LoadedFragment,
  OMIT_TYPE,
  DocumentMode,
} from '@graphql-codegen/visitor-plugin-common';
import { ReactApolloRawPluginConfig } from './config.js';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, Kind, GraphQLSchema } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { pascalCase, camelCase } from 'change-case-all';

const APOLLO_CLIENT_3_UNIFIED_PACKAGE = `@apollo/client`;
const GROUPED_APOLLO_CLIENT_3_IDENTIFIER = 'Apollo';

export interface ReactApolloPluginConfig extends ClientSideBasePluginConfig {
  withComponent: boolean;
  withHOC: boolean;
  withHooks: boolean;
  withMutationFn: boolean;
  withRefetchFn: boolean;
  apolloReactCommonImportFrom: string;
  apolloReactComponentsImportFrom: string;
  apolloReactHocImportFrom: string;
  apolloReactHooksImportFrom: string;
  componentSuffix: string;
  reactApolloVersion: 2 | 3;
  withResultType: boolean;
  withMutationOptionsType: boolean;
  addDocBlocks: boolean;
  defaultBaseOptions: { [key: string]: string };
  hooksSuffix: string;
}

function hasRequiredVariables(node: OperationDefinitionNode): boolean {
  return (
    node.variableDefinitions?.some(
      variableDef => variableDef.type.kind === Kind.NON_NULL_TYPE && !variableDef.defaultValue
    ) ?? false
  );
}

export class ReactApolloVisitor extends ClientSideBaseVisitor<ReactApolloRawPluginConfig, ReactApolloPluginConfig> {
  private _externalImportPrefix: string;
  private imports = new Set<string>();

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    protected rawConfig: ReactApolloRawPluginConfig,
    documents: Types.DocumentFile[]
  ) {
    super(schema, fragments, rawConfig, {
      componentSuffix: getConfigValue(rawConfig.componentSuffix, 'Component'),
      withHOC: getConfigValue(rawConfig.withHOC, false),
      withComponent: getConfigValue(rawConfig.withComponent, false),
      withHooks: getConfigValue(rawConfig.withHooks, true),
      withMutationFn: getConfigValue(rawConfig.withMutationFn, true),
      withRefetchFn: getConfigValue(rawConfig.withRefetchFn, false),
      apolloReactCommonImportFrom: getConfigValue(
        rawConfig.apolloReactCommonImportFrom,
        rawConfig.reactApolloVersion === 2 ? '@apollo/react-common' : APOLLO_CLIENT_3_UNIFIED_PACKAGE
      ),
      apolloReactComponentsImportFrom: getConfigValue(
        rawConfig.apolloReactComponentsImportFrom,
        rawConfig.reactApolloVersion === 2
          ? '@apollo/react-components'
          : `${APOLLO_CLIENT_3_UNIFIED_PACKAGE}/react/components`
      ),
      apolloReactHocImportFrom: getConfigValue(
        rawConfig.apolloReactHocImportFrom,
        rawConfig.reactApolloVersion === 2 ? '@apollo/react-hoc' : `${APOLLO_CLIENT_3_UNIFIED_PACKAGE}/react/hoc`
      ),
      apolloReactHooksImportFrom: getConfigValue(
        rawConfig.apolloReactHooksImportFrom,
        rawConfig.reactApolloVersion === 2 ? '@apollo/react-hooks' : APOLLO_CLIENT_3_UNIFIED_PACKAGE
      ),
      reactApolloVersion: getConfigValue(rawConfig.reactApolloVersion, 3),
      withResultType: getConfigValue(rawConfig.withResultType, true),
      withMutationOptionsType: getConfigValue(rawConfig.withMutationOptionsType, true),
      addDocBlocks: getConfigValue(rawConfig.addDocBlocks, true),
      defaultBaseOptions: getConfigValue(rawConfig.defaultBaseOptions, {}),
      gqlImport: getConfigValue(
        rawConfig.gqlImport,
        rawConfig.reactApolloVersion === 2 ? null : `${APOLLO_CLIENT_3_UNIFIED_PACKAGE}#gql`
      ),
      hooksSuffix: getConfigValue(rawConfig.hooksSuffix, ''),
    });

    this._externalImportPrefix = this.config.importOperationTypesFrom ? `${this.config.importOperationTypesFrom}.` : '';
    this._documents = documents;

    autoBind(this);
  }

  private getImportStatement(isTypeImport: boolean): string {
    return isTypeImport && this.config.useTypeImports ? 'import type' : 'import';
  }

  private getReactImport(): string {
    return `import * as React from 'react';`;
  }

  private getApolloReactCommonIdentifier(): string {
    if (this.rawConfig.apolloReactCommonImportFrom || this.config.reactApolloVersion === 2) {
      return `ApolloReactCommon`;
    }

    return GROUPED_APOLLO_CLIENT_3_IDENTIFIER;
  }

  private getApolloReactHooksIdentifier(): string {
    if (this.rawConfig.apolloReactHooksImportFrom || this.config.reactApolloVersion === 2) {
      return `ApolloReactHooks`;
    }

    return GROUPED_APOLLO_CLIENT_3_IDENTIFIER;
  }

  private usesExternalHooksOnly(): boolean {
    const apolloReactCommonIdentifier = this.getApolloReactCommonIdentifier();
    return (
      apolloReactCommonIdentifier === GROUPED_APOLLO_CLIENT_3_IDENTIFIER &&
      this.config.apolloReactHooksImportFrom !== APOLLO_CLIENT_3_UNIFIED_PACKAGE &&
      this.config.withHooks &&
      !this.config.withComponent &&
      !this.config.withHOC
    );
  }

  private getApolloReactCommonImport(isTypeImport: boolean): string {
    const apolloReactCommonIdentifier = this.getApolloReactCommonIdentifier();

    return `${this.getImportStatement(
      isTypeImport &&
        (apolloReactCommonIdentifier !== GROUPED_APOLLO_CLIENT_3_IDENTIFIER || this.usesExternalHooksOnly())
    )} * as ${apolloReactCommonIdentifier} from '${this.config.apolloReactCommonImportFrom}';`;
  }

  private getApolloReactComponentsImport(isTypeImport: boolean): string {
    return `${this.getImportStatement(isTypeImport)} * as ApolloReactComponents from '${
      this.config.apolloReactComponentsImportFrom
    }';`;
  }

  private getApolloReactHocImport(isTypeImport: boolean): string {
    return `${this.getImportStatement(isTypeImport)} * as ApolloReactHoc from '${
      this.config.apolloReactHocImportFrom
    }';`;
  }

  private getApolloReactHooksImport(isTypeImport: boolean): string {
    return `${this.getImportStatement(isTypeImport)} * as ${this.getApolloReactHooksIdentifier()} from '${
      this.config.apolloReactHooksImportFrom
    }';`;
  }

  private getOmitDeclaration(): string {
    return OMIT_TYPE;
  }

  private getDefaultOptions(): string {
    return `const defaultOptions = ${JSON.stringify(this.config.defaultBaseOptions)} as const;`;
  }

  private getDocumentNodeVariable(node: OperationDefinitionNode, documentVariableName: string): string {
    return this.config.documentMode === DocumentMode.external
      ? `Operations.${node.name?.value ?? ''}`
      : documentVariableName;
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
    const typeVariableName =
      this._externalImportPrefix +
      this.convertName(operationName + pascalCase(operationType) + this._parsedConfig.operationResultSuffix);
    const variablesVarName =
      this._externalImportPrefix + this.convertName(operationName + pascalCase(operationType) + 'Variables');
    const typeArgs = `<${typeVariableName}, ${variablesVarName}>`;

    if (operationType === 'mutation') {
      this.imports.add(this.getApolloReactCommonImport(true));

      return `${this.getApolloReactCommonIdentifier()}.MutationFunction${typeArgs}`;
    }
    this.imports.add(this.getApolloReactHocImport(true));

    return `ApolloReactHoc.DataValue${typeArgs}`;
  }

  private _buildMutationFn(
    node: OperationDefinitionNode,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    if (node.operation === 'mutation') {
      this.imports.add(this.getApolloReactCommonImport(true));
      return `export type ${this.convertName(
        (node.name?.value ?? '') + 'MutationFn'
      )} = ${this.getApolloReactCommonIdentifier()}.MutationFunction<${operationResultType}, ${operationVariablesTypes}>;`;
    }
    return null;
  }

  private _buildOperationHoc(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    this.imports.add(this.getApolloReactCommonImport(false));
    this.imports.add(this.getApolloReactHocImport(false));
    const nodeName = node.name?.value ?? '';
    const operationName: string = this.convertName(nodeName, { useTypesPrefix: false });
    const propsTypeName: string = this.convertName(nodeName, { suffix: 'Props' });

    const defaultDataName = node.operation === 'mutation' ? 'mutate' : 'data';
    const propsVar = `export type ${propsTypeName}<TChildProps = {}, TDataName extends string = '${defaultDataName}'> = {
      [key in TDataName]: ${this._buildHocProps(nodeName, node.operation)}
    } & TChildProps;`;

    const hocString = `export function with${operationName}<TProps, TChildProps = {}, TDataName extends string = '${defaultDataName}'>(operationOptions?: ApolloReactHoc.OperationOption<
  TProps,
  ${operationResultType},
  ${operationVariablesTypes},
  ${propsTypeName}<TChildProps, TDataName>>) {
    return ApolloReactHoc.with${pascalCase(
      node.operation
    )}<TProps, ${operationResultType}, ${operationVariablesTypes}, ${propsTypeName}<TChildProps, TDataName>>(${this.getDocumentNodeVariable(
      node,
      documentVariableName
    )}, {
      alias: '${camelCase(operationName)}',
      ...operationOptions
    });
};`;

    return [propsVar, hocString].filter(a => a).join('\n');
  }

  private _buildComponent(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const nodeName = node.name?.value ?? '';
    const componentPropsName: string = this.convertName(nodeName, {
      suffix: this.config.componentSuffix + 'Props',
      useTypesPrefix: false,
    });
    const componentName: string = this.convertName(nodeName, {
      suffix: this.config.componentSuffix,
      useTypesPrefix: false,
    });

    const isVariablesRequired = operationType === 'Query' && hasRequiredVariables(node);

    this.imports.add(this.getReactImport());
    this.imports.add(this.getApolloReactCommonImport(true));
    this.imports.add(this.getApolloReactComponentsImport(false));
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
      <ApolloReactComponents.${operationType}<${operationResultType}, ${operationVariablesTypes}> ${
      node.operation
    }={${this.getDocumentNodeVariable(node, documentVariableName)}} {...props} />
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
 * @param baseOptions options that will be passed into the ${operationType.toLowerCase()}, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#${
      operationType === 'Mutation' ? 'options-2' : 'options'
    };
 *
 * @example${operationType === 'Mutation' ? mutationExample : queryExample}
 */`;
  }

  private _buildHooks(
    node: OperationDefinitionNode,
    operationType: string,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean
  ): string {
    const nodeName = node.name?.value ?? '';
    const suffix = this._getHookSuffix(nodeName, operationType);
    const operationName: string =
      this.convertName(nodeName, {
        suffix,
        useTypesPrefix: false,
        useTypesSuffix: false,
      }) + this.config.hooksSuffix;

    this.imports.add(this.getApolloReactCommonImport(true));
    this.imports.add(this.getApolloReactHooksImport(false));
    this.imports.add(this.getDefaultOptions());

    const hookFns = [
      `export function use${operationName}(baseOptions${
        hasRequiredVariables && operationType !== 'Mutation' ? '' : '?'
      }: ${this.getApolloReactHooksIdentifier()}.${operationType}HookOptions<${operationResultType}, ${operationVariablesTypes}>) {
        const options = {...defaultOptions, ...baseOptions}
        return ${this.getApolloReactHooksIdentifier()}.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${this.getDocumentNodeVariable(
        node,
        documentVariableName
      )}, options);
      }`,
    ];

    if (this.config.addDocBlocks) {
      hookFns.unshift(this._buildHooksJSDoc(node, operationName, operationType));
    }

    const hookResults = [`export type ${operationName}HookResult = ReturnType<typeof use${operationName}>;`];

    if (operationType === 'Query') {
      const lazyOperationName: string =
        this.convertName(nodeName, {
          suffix: pascalCase('LazyQuery'),
          useTypesPrefix: false,
        }) + this.config.hooksSuffix;
      hookFns.push(
        `export function use${lazyOperationName}(baseOptions?: ${this.getApolloReactHooksIdentifier()}.LazyQueryHookOptions<${operationResultType}, ${operationVariablesTypes}>) {
          const options = {...defaultOptions, ...baseOptions}
          return ${this.getApolloReactHooksIdentifier()}.useLazyQuery<${operationResultType}, ${operationVariablesTypes}>(${this.getDocumentNodeVariable(
          node,
          documentVariableName
        )}, options);
        }`
      );
      hookResults.push(`export type ${lazyOperationName}HookResult = ReturnType<typeof use${lazyOperationName}>;`);
    }

    return [...hookFns, ...hookResults].join('\n');
  }

  private _getHookSuffix(name: string, operationType: string) {
    if (this.config.omitOperationSuffix) {
      return '';
    }
    if (!this.config.dedupeOperationSuffix) {
      return pascalCase(operationType);
    }
    if (name.includes('Query') || name.includes('Mutation') || name.includes('Subscription')) {
      return '';
    }
    return pascalCase(operationType);
  }

  private _buildResultType(
    node: OperationDefinitionNode,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const componentResultType = this.convertName(node.name?.value ?? '', {
      suffix: `${operationType}Result`,
      useTypesPrefix: false,
    });

    switch (node.operation) {
      case 'query':
        this.imports.add(this.getApolloReactCommonImport(true));
        return `export type ${componentResultType} = ${this.getApolloReactCommonIdentifier()}.QueryResult<${operationResultType}, ${operationVariablesTypes}>;`;
      case 'mutation':
        this.imports.add(this.getApolloReactCommonImport(true));
        return `export type ${componentResultType} = ${this.getApolloReactCommonIdentifier()}.MutationResult<${operationResultType}>;`;
      case 'subscription':
        this.imports.add(this.getApolloReactCommonImport(true));
        return `export type ${componentResultType} = ${this.getApolloReactCommonIdentifier()}.SubscriptionResult<${operationResultType}>;`;
      default:
        return '';
    }
  }

  private _buildWithMutationOptionsType(
    node: OperationDefinitionNode,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    if (node.operation !== 'mutation') {
      return '';
    }

    this.imports.add(this.getApolloReactCommonImport(true));

    const mutationOptionsType = this.convertName(node.name?.value ?? '', {
      suffix: 'MutationOptions',
      useTypesPrefix: false,
    });

    return `export type ${mutationOptionsType} = ${this.getApolloReactCommonIdentifier()}.BaseMutationOptions<${operationResultType}, ${operationVariablesTypes}>;`;
  }

  private _buildRefetchFn(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationVariablesTypes: string
  ): string {
    if (node.operation !== 'query') {
      return '';
    }

    const nodeName = node.name?.value ?? '';
    const operationName: string =
      this.convertName(nodeName, {
        suffix: this._getHookSuffix(nodeName, operationType),
        useTypesPrefix: false,
      }) + this.config.hooksSuffix;

    const optional = hasRequiredVariables(node) ? '' : '?';

    return `export function refetch${operationName}(variables${optional}: ${operationVariablesTypes}) {
      return { query: ${this.getDocumentNodeVariable(node, documentVariableName)}, variables: variables }
    }`;
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean
  ): string {
    operationResultType = this._externalImportPrefix + operationResultType;
    operationVariablesTypes = this._externalImportPrefix + operationVariablesTypes;

    const mutationFn =
      this.config.withMutationFn || this.config.withComponent
        ? this._buildMutationFn(node, operationResultType, operationVariablesTypes)
        : null;
    const component = this.config.withComponent
      ? this._buildComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes)
      : null;
    const hoc = this.config.withHOC
      ? this._buildOperationHoc(node, documentVariableName, operationResultType, operationVariablesTypes)
      : null;
    const hooks = this.config.withHooks
      ? this._buildHooks(
          node,
          operationType,
          documentVariableName,
          operationResultType,
          operationVariablesTypes,
          hasRequiredVariables
        )
      : null;
    const resultType = this.config.withResultType
      ? this._buildResultType(node, operationType, operationResultType, operationVariablesTypes)
      : null;
    const mutationOptionsType = this.config.withMutationOptionsType
      ? this._buildWithMutationOptionsType(node, operationResultType, operationVariablesTypes)
      : null;
    const refetchFn = this.config.withRefetchFn
      ? this._buildRefetchFn(node, documentVariableName, operationType, operationVariablesTypes)
      : null;

    return [mutationFn, component, hoc, hooks, resultType, mutationOptionsType, refetchFn].filter(a => a).join('\n');
  }
}
