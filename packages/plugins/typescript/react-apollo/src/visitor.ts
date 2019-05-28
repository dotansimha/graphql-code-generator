import { ClientSideBaseVisitor, ClientSideBasePluginConfig, getConfigValue, LoadedFragment, OMIT_TYPE } from '@graphql-codegen/visitor-plugin-common';
import { ReactApolloRawPluginConfig } from './index';
import * as autoBind from 'auto-bind';
import { OperationDefinitionNode, Kind } from 'graphql';
import { toPascalCase } from '@graphql-codegen/plugin-helpers';
import { titleCase } from 'change-case';

export interface ReactApolloPluginConfig extends ClientSideBasePluginConfig {
  withHOC: boolean;
  withComponent: boolean;
  withHooks: boolean;
  withMutationFn: boolean;
  hooksImportFrom: string;
  reactApolloImportFrom: string;
  componentSuffix: string;
}

export class ReactApolloVisitor extends ClientSideBaseVisitor<ReactApolloRawPluginConfig, ReactApolloPluginConfig> {
  constructor(fragments: LoadedFragment[], rawConfig: ReactApolloRawPluginConfig) {
    super(fragments, rawConfig, {
      componentSuffix: getConfigValue(rawConfig.componentSuffix, 'Component'),
      withHOC: getConfigValue(rawConfig.withHOC, true),
      withComponent: getConfigValue(rawConfig.withComponent, true),
      withHooks: getConfigValue(rawConfig.withHooks, false),
      withMutationFn: getConfigValue(rawConfig.withMutationFn, true),
      hooksImportFrom: getConfigValue(rawConfig.hooksImportFrom, 'react-apollo-hooks'),
      reactApolloImportFrom: getConfigValue(rawConfig.reactApolloImportFrom, 'react-apollo'),
    } as any);

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
    const typeVariableName = this.convertName(operationName + toPascalCase(operationType));
    const variablesVarName = this.convertName(operationName + toPascalCase(operationType) + 'Variables');
    const argType = operationType === 'mutation' ? 'MutateProps' : 'DataProps';

    this.imports.add(this.getReactApolloImport());

    return `Partial<ReactApollo.${argType}<${typeVariableName}, ${variablesVarName}>>`;
  }

  private _buildMutationFn(node: OperationDefinitionNode, operationResultType: string, operationVariablesTypes: string): string {
    if (node.operation === 'mutation') {
      this.imports.add(this.getReactApolloImport());
      return `export type ${this.convertName(node.name.value + 'MutationFn')} = ReactApollo.MutationFn<${operationResultType}, ${operationVariablesTypes}>;`;
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
      componentProps = `export type ${componentPropsName} = ${propsType} & ({ variables: ${operationVariablesTypes}; skip: false; } | { skip: true; });`;
    } else {
      componentProps = `export type ${componentPropsName} = ${propsType};`;
    }

    const component = `
    export const ${componentName} = (props: ${componentPropsName}) => (
      <ReactApollo.${operationType}<${operationResultType}, ${operationVariablesTypes}> ${node.operation}={${documentVariableName}} {...props} />
    );
    `;
    return [componentProps, component].join('\n');
  }

  private _buildHooks(node: OperationDefinitionNode, operationType: string, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    const operationName: string = this.convertName(node.name.value, { suffix: titleCase(operationType), useTypesPrefix: false });

    this.imports.add(this.getReactApolloHooksImport());
    return `
export function use${operationName}(baseOptions?: ReactApolloHooks.${operationType}HookOptions<${node.operation !== 'query' ? `${operationResultType}, ` : ''}${operationVariablesTypes}>) {
  return ReactApolloHooks.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, baseOptions);
};`;
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const mutationFn = this.config.withMutationFn || this.config.withComponent ? this._buildMutationFn(node, operationResultType, operationVariablesTypes) : null;
    const component = this.config.withComponent ? this._buildComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) : null;
    const hoc = this.config.withHOC ? this._buildOperationHoc(node, documentVariableName, operationResultType, operationVariablesTypes) : null;
    const hooks = this.config.withHooks ? this._buildHooks(node, operationType, documentVariableName, operationResultType, operationVariablesTypes) : null;

    return [mutationFn, component, hoc, hooks].filter(a => a).join('\n');
  }
}
