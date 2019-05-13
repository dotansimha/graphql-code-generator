import { ClientSideBaseVisitor, ClientSideBasePluginConfig, getConfigValue } from '@graphql-codegen/visitor-plugin-common';
import { ReactApolloRawPluginConfig } from './index';
import * as autoBind from 'auto-bind';
import { FragmentDefinitionNode, OperationDefinitionNode, Kind } from 'graphql';
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
  constructor(fragments: FragmentDefinitionNode[], rawConfig: ReactApolloRawPluginConfig) {
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

  public getImports(): string {
    const baseImports = super.getImports();
    const imports = [];

    if (this.config.withComponent) {
      imports.push(`import * as React from 'react';`);
    }

    if (this.config.withComponent || this.config.withHOC || this.config.withMutationFn) {
      imports.push(`import * as ReactApollo from '${typeof this.config.reactApolloImportFrom === 'string' ? this.config.reactApolloImportFrom : 'react-apollo'}';`);
    }

    if (this.config.withHooks) {
      imports.push(`import * as ReactApolloHooks from '${typeof this.config.hooksImportFrom === 'string' ? this.config.hooksImportFrom : 'react-apollo-hooks'}';`);
    }

    imports.push(`export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>`);

    return [baseImports, ...imports].join('\n');
  }

  private _buildHocProps(operationName: string, operationType: string): string {
    const typeVariableName = this.convertName(operationName + toPascalCase(operationType));
    const variablesVarName = this.convertName(operationName + toPascalCase(operationType) + 'Variables');
    const argType = operationType === 'mutation' ? 'MutateProps' : 'DataProps';

    return `Partial<ReactApollo.${argType}<${typeVariableName}, ${variablesVarName}>>`;
  }

  private _buildMutationFn(node: OperationDefinitionNode, operationResultType: string, operationVariablesTypes: string): string {
    if (node.operation === 'mutation') {
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
    const componentName: string = this.convertName(node.name.value, { suffix: this.config.componentSuffix, useTypesPrefix: false });

    const isVariablesRequired = operationType === 'Query' && node.variableDefinitions.some(variableDef => variableDef.type.kind === Kind.NON_NULL_TYPE);

    return `
export const ${componentName} = (props: Omit<Omit<ReactApollo.${operationType}Props<${operationResultType}, ${operationVariablesTypes}>, '${operationType.toLowerCase()}'>, 'variables'> & { variables${
      isVariablesRequired ? '' : '?'
    }: ${operationVariablesTypes} }) => (
  <ReactApollo.${operationType}<${operationResultType}, ${operationVariablesTypes}> ${node.operation}={${documentVariableName}} {...props} />
);
`;
  }

  private _buildHooks(node: OperationDefinitionNode, operationType: string, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    const operationName: string = this.convertName(node.name.value, { suffix: titleCase(operationType), useTypesPrefix: false });

    return `
export function use${operationName}(baseOptions?: ReactApolloHooks.${operationType}HookOptions<${node.operation !== 'query' ? `${operationResultType}, ` : ''}${operationVariablesTypes}>) {
  return ReactApolloHooks.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, baseOptions);
};`;
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const mutationFn = this.config.withMutationFn ? this._buildMutationFn(node, operationResultType, operationVariablesTypes) : null;
    const component = this.config.withComponent ? this._buildComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) : null;
    const hoc = this.config.withHOC ? this._buildOperationHoc(node, documentVariableName, operationResultType, operationVariablesTypes) : null;
    const hooks = this.config.withHooks ? this._buildHooks(node, operationType, documentVariableName, operationResultType, operationVariablesTypes) : null;

    return [mutationFn, component, hoc, hooks].filter(a => a).join('\n');
  }
}
