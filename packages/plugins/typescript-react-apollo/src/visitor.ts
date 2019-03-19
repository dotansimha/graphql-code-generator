import { ClientSideBaseVisitor, ClientSideBasePluginConfig, getConfigValue } from '@graphql-codegen/visitor-plugin-common';
import { ReactApolloRawPluginConfig } from './index';
import * as autoBind from 'auto-bind';
import { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql';
import { toPascalCase } from '@graphql-codegen/plugin-helpers';
import { titleCase } from 'change-case';

export interface ReactApolloPluginConfig extends ClientSideBasePluginConfig {
  withHOC: boolean;
  withComponent: boolean;
  withHooks: boolean;
  hooksImportFrom: string;
}

export class ReactApolloVisitor extends ClientSideBaseVisitor<ReactApolloRawPluginConfig, ReactApolloPluginConfig> {
  constructor(fragments: FragmentDefinitionNode[], rawConfig: ReactApolloRawPluginConfig) {
    super(fragments, rawConfig, {
      withHOC: getConfigValue(rawConfig.withHOC, true),
      withComponent: getConfigValue(rawConfig.withComponent, true),
      withHooks: getConfigValue(rawConfig.withHooks, false),
      hooksImportFrom: getConfigValue(rawConfig.hooksImportFrom, 'react-apollo-hooks'),
    } as any);

    autoBind(this);
  }

  public getImports(): string {
    const baseImports = super.getImports();
    const imports = [];

    if (this.config.withComponent) {
      imports.push(`import * as React from 'react';`);
    }

    if (this.config.withComponent || this.config.withHOC) {
      imports.push(`import * as ReactApollo from 'react-apollo';`);
    }

    if (this.config.withHooks) {
      imports.push(`import * as ReactApolloHooks from '${typeof this.config.hooksImportFrom === 'string' ? this.config.hooksImportFrom : 'react-apollo-hooks'}';`);
    }

    return [baseImports, ...imports].join('\n');
  }

  private _buildHocProps(operationName: string, operationType: string): string {
    const typeVariableName = this.convertName(operationName + toPascalCase(operationType));
    const variablesVarName = this.convertName(operationName + toPascalCase(operationType) + 'Variables');
    const argType = operationType === 'mutation' ? 'MutateProps' : 'DataProps';

    return `Partial<ReactApollo.${argType}<${typeVariableName}, ${variablesVarName}>>`;
  }

  private _buildOperationHoc(node: OperationDefinitionNode, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    const operationName: string = this.convertName(node.name.value);
    const propsTypeName: string = operationName + 'Props';

    const propsVar = `export type ${propsTypeName}<TChildProps = {}> = ${this._buildHocProps(node.name.value, node.operation)} & TChildProps;`;

    const mutationFn = node.operation === 'mutation' ? `export type ${this.convertName(node.name.value + 'MutationFn')} = ReactApollo.MutationFn<${operationResultType}, ${operationVariablesTypes}>;` : null;

    const hocString = `export function with${operationName}<TProps, TChildProps = {}>(operationOptions: ReactApollo.OperationOption<
  TProps, 
  ${operationResultType},
  ${operationVariablesTypes},
  ${propsTypeName}<TChildProps>> | undefined) {
    return ReactApollo.with${titleCase(node.operation)}<TProps, ${operationResultType}, ${operationVariablesTypes}, ${propsTypeName}<TChildProps>>(${documentVariableName}, operationOptions);
};`;

    return [propsVar, mutationFn, hocString].filter(a => a).join('\n');
  }

  private _buildComponent(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const componentName: string = this.convertName(node.name.value + 'Component');

    return `
export class ${componentName} extends React.Component<Partial<ReactApollo.${operationType}Props<${operationResultType}, ${operationVariablesTypes}>>> {
  render() {
      return (
          <ReactApollo.${operationType}<${operationResultType}, ${operationVariablesTypes}> ${node.operation}={${documentVariableName}} {...(this as any)['props'] as any} />
      );
  }
}`;
  }

  private _buildHooks(node: OperationDefinitionNode, operationType: string, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    return `
export function use${operationResultType}(baseOptions?: ReactApolloHooks.${operationType}HookOptions<${node.operation !== 'query' ? `${operationResultType}, ` : ''}${operationVariablesTypes}>) {
  return ReactApolloHooks.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, baseOptions);
};`;
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const component = this.config.withComponent ? this._buildComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) : null;
    const hoc = this.config.withHOC ? this._buildOperationHoc(node, documentVariableName, operationResultType, operationVariablesTypes) : null;
    const hooks = this.config.withHooks ? this._buildHooks(node, operationType, documentVariableName, operationResultType, operationVariablesTypes) : null;

    return [component, hoc, hooks].filter(a => a).join('\n');
  }
}
