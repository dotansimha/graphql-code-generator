import { ClientSideBaseVisitor, ClientSideBasePluginConfig, getConfigValue, LoadedFragment, OMIT_TYPE } from '@graphql-codegen/visitor-plugin-common';
import { ReactApolloRawPluginConfig } from './index';
import * as autoBind from 'auto-bind';
import { OperationDefinitionNode, Kind } from 'graphql';
import { toPascalCase, Types } from '@graphql-codegen/plugin-helpers';
import { titleCase } from 'change-case';

export interface ReactApolloPluginConfig extends ClientSideBasePluginConfig {
  withHOC: boolean;
  withComponent: boolean;
  withHooks: boolean;
  withMutationFn: boolean;
  hooksImportFrom: string;
  reactApolloImportFrom: string;
  componentSuffix: string;
  reactApolloVersion: 2 | 3;
  withResultType: boolean;
  withMutationOptionsType: boolean;
}

export class ReactApolloVisitor extends ClientSideBaseVisitor<ReactApolloRawPluginConfig, ReactApolloPluginConfig> {
  constructor(fragments: LoadedFragment[], rawConfig: ReactApolloRawPluginConfig, documents?: Types.DocumentFile[]) {
    super(fragments, rawConfig, {
      componentSuffix: getConfigValue(rawConfig.componentSuffix, 'Component'),
      withHOC: getConfigValue(rawConfig.withHOC, true),
      withComponent: getConfigValue(rawConfig.withComponent, true),
      withHooks: getConfigValue(rawConfig.withHooks, false),
      withMutationFn: getConfigValue(rawConfig.withMutationFn, true),
      hooksImportFrom: getConfigValue(rawConfig.hooksImportFrom, 'react-apollo-hooks'),
      reactApolloImportFrom: getConfigValue(rawConfig.reactApolloImportFrom, 'react-apollo'),
      reactApolloVersion: getConfigValue(rawConfig.reactApolloVersion, 2),
      withResultType: getConfigValue(rawConfig.withResultType, true),
      withMutationOptionsType: getConfigValue(rawConfig.withMutationOptionsType, true),
    } as any, documents);

    autoBind(this);
  }

  private imports = new Set<string>();

  private getReactImport(): string {
    return `import * as React from 'react';`;
  }

  private getReactApolloImport(): string {
    return `import * as ReactApollo from '${typeof this.config.reactApolloImportFrom === 'string' ? this.config.reactApolloImportFrom : 'react-apollo'}';`;
  }

  private getReactApolloHooksImport(): string {
    return `import * as ReactApolloHooks from '${typeof this.config.hooksImportFrom === 'string' ? this.config.hooksImportFrom : 'react-apollo-hooks'}';`;
  }

  private getOmitDeclaration(): string {
    return OMIT_TYPE;
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }

    return [...baseImports, ...this.imports];
  }

  private _buildHocProps(operationName: string, operationType: string): string {
    const typeVariableName = this.convertName(operationName + toPascalCase(operationType) + this._parsedConfig.operationResultSuffix);
    const variablesVarName = this.convertName(operationName + toPascalCase(operationType) + 'Variables');
    const argType = operationType === 'mutation' ? 'MutateProps' : 'DataProps';

    this.imports.add(this.getReactApolloImport());

    return `Partial<ReactApollo.${argType}<${typeVariableName}, ${variablesVarName}>>`;
  }

  private _buildMutationFn(node: OperationDefinitionNode, operationResultType: string, operationVariablesTypes: string): string {
    if (node.operation === 'mutation') {
      this.imports.add(this.getReactApolloImport());
      return `export type ${this.convertName(node.name.value + 'MutationFn')} = ReactApollo.${MutationFnNameForVersionMap[this.config.reactApolloVersion]}<${operationResultType}, ${operationVariablesTypes}>;`;
    }
    return null;
  }

  private _buildOperationHoc(node: OperationDefinitionNode, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    const operationName: string = this.convertName(node.name.value, { useTypesPrefix: false });
    const propsTypeName: string = this.convertName(node.name.value, { suffix: 'Props' });

    const propsVar = `export type ${propsTypeName}<TChildProps = {}> = ${this._buildHocProps(node.name.value, node.operation)} & TChildProps;`;

    const hocString = `export function with${operationName}<TProps, TChildProps = {}>(operationOptions?: ReactApollo.OperationOption<
  TProps,
  ${operationResultType},
  ${operationVariablesTypes},
  ${propsTypeName}<TChildProps>>) {
    return ReactApollo.with${titleCase(node.operation)}<TProps, ${operationResultType}, ${operationVariablesTypes}, ${propsTypeName}<TChildProps>>(${documentVariableName}, {
      alias: 'with${operationName}',
      ...operationOptions
    });
};`;

    return [propsVar, hocString].filter(a => a).join('\n');
  }

  private _buildComponent(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const componentPropsName: string = this.convertName(node.name.value, { suffix: this.config.componentSuffix + 'Props', useTypesPrefix: false });
    const componentName: string = this.convertName(node.name.value, { suffix: this.config.componentSuffix, useTypesPrefix: false });

    const isVariablesRequired = operationType === 'Query' && node.variableDefinitions.some(variableDef => variableDef.type.kind === Kind.NON_NULL_TYPE);

    this.imports.add(this.getReactImport());
    this.imports.add(this.getReactApolloImport());
    this.imports.add(this.getOmitDeclaration());

    const propsType = `Omit<ReactApollo.${operationType}Props<${operationResultType}, ${operationVariablesTypes}>, '${operationType.toLowerCase()}'>`;
    let componentProps = '';
    if (isVariablesRequired) {
      componentProps = `export type ${componentPropsName} = ${propsType} & ({ variables: ${operationVariablesTypes}; skip?: false; } | { skip: true; });`;
    } else {
      componentProps = `export type ${componentPropsName} = ${propsType};`;
    }

    const component = `
    export const ${componentName} = (props: ${componentPropsName}) => (
      <ReactApollo.${operationType}<${operationResultType}, ${operationVariablesTypes}> ${node.operation}={${this.config.documentMode === 'external' ? `Operations.${node.name.value}` : documentVariableName}} {...props} />
    );
    `;
    return [componentProps, component].join('\n');
  }

  private _buildHooks(node: OperationDefinitionNode, operationType: string, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    const operationName: string = this.convertName(node.name.value, { suffix: titleCase(operationType), useTypesPrefix: false });

    this.imports.add(this.getReactApolloHooksImport());

    const hookFn = `
    export function use${operationName}(baseOptions?: ReactApolloHooks.${operationType}HookOptions<${this.config.hooksImportFrom === '@apollo/react-hooks' || node.operation !== 'query' ? `${operationResultType}, ` : ''}${operationVariablesTypes}>) {
      return ReactApolloHooks.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, baseOptions);
    };`;

    const hookResult = `export type ${operationName}HookResult = ReturnType<typeof use${operationName}>;`;

    return [hookFn, hookResult].join('\n');
  }

  private _buildResultType(node: OperationDefinitionNode, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const componentResultType = this.convertName(node.name.value, { suffix: `${operationType}Result`, useTypesPrefix: false });

    switch (node.operation) {
      case 'query':
        this.imports.add(this.getReactApolloImport());
        return `export type ${componentResultType} = ReactApollo.QueryResult<${operationResultType}, ${operationVariablesTypes}>;`;
      case 'mutation':
        this.imports.add(this.getReactApolloImport());
        return `export type ${componentResultType} = ReactApollo.MutationResult<${operationResultType}>;`;
      case 'subscription':
        this.imports.add(this.getReactApolloImport());
        return `export type ${componentResultType} = ReactApollo.SubscriptionResult<${operationResultType}>;`;
      default:
        return '';
    }
  }

  private _buildWithMutationOptionsType(node: OperationDefinitionNode, operationResultType: string, operationVariablesTypes: string): string {
    if (node.operation !== 'mutation') {
      return '';
    }

    this.imports.add(this.getReactApolloImport());

    const mutationOptionsType = this.convertName(node.name.value, { suffix: 'MutationOptions', useTypesPrefix: false });

    return `export type ${mutationOptionsType} = ReactApollo.MutationOptions<${operationResultType}, ${operationVariablesTypes}>;`;
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const mutationFn = this.config.withMutationFn || this.config.withComponent ? this._buildMutationFn(node, operationResultType, operationVariablesTypes) : null;
    const component = this.config.withComponent ? this._buildComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) : null;
    const hoc = this.config.withHOC ? this._buildOperationHoc(node, documentVariableName, operationResultType, operationVariablesTypes) : null;
    const hooks = this.config.withHooks ? this._buildHooks(node, operationType, documentVariableName, operationResultType, operationVariablesTypes) : null;
    const resultType = this.config.withResultType ? this._buildResultType(node, operationType, operationResultType, operationVariablesTypes) : null;
    const mutationOptionsType = this.config.withMutationOptionsType ? this._buildWithMutationOptionsType(node, operationResultType, operationVariablesTypes) : null;

    return [mutationFn, component, hoc, hooks, resultType, mutationOptionsType].filter(a => a).join('\n');
  }
}

const MutationFnNameForVersionMap = {
  2: 'MutationFn',
  3: 'MutationFunction',
};
