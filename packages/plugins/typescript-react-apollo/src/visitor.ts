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

  reactApolloImports = new Set<string>();
  reactApolloHooksImports = new Set<string>();

  public getImports(): string {
    const baseImports = super.getImports();
    const imports = [];

    if (this.config.withComponent) {
      imports.push(`import * as React from 'react';`);
    }

    if (this.reactApolloImports.size) {
      imports.push(`import { ${[...this.reactApolloImports].join(', ')} } from 'react-apollo';`);
    }

    if (this.reactApolloHooksImports.size) {
      imports.push(`import { ${[...this.reactApolloHooksImports].join(', ')} } from '${typeof this.config.hooksImportFrom === 'string' ? this.config.hooksImportFrom : 'react-apollo-hooks'}';`);
    }

    return [baseImports, ...imports].join('\n');
  }

  private _buildHocProps(operationName: string, operationType: string): string {
    const typeVariableName = this.convertName(operationName + toPascalCase(operationType));
    const variablesVarName = this.convertName(operationName + toPascalCase(operationType) + 'Variables');
    const argType = operationType === 'mutation' ? 'MutateProps' : 'DataProps';

    this.reactApolloImports.add(argType);

    return `Partial<${argType}<${typeVariableName}, ${variablesVarName}>>`;
  }

  private _buildOperationHoc(node: OperationDefinitionNode, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    const operationName: string = this.convertName(node.name.value, { useTypesPrefix: false });
    const propsTypeName: string = this.convertName(node.name.value, { suffix: 'Props' });

    const propsVar = `export type ${propsTypeName}<TChildProps = {}> = ${this._buildHocProps(node.name.value, node.operation)} & TChildProps;`;

    this.reactApolloImports.add(`MutationFn`);
    const mutationFn = node.operation === 'mutation' ? `export type ${this.convertName(node.name.value + 'MutationFn')} = MutationFn<${operationResultType}, ${operationVariablesTypes}>;` : null;

    const reactApolloHoc = `with${titleCase(node.operation)}`;
    this.reactApolloImports.add(reactApolloHoc);

    this.reactApolloImports.add(`OperationOption`);

    const hocString = `export function with${operationName}<TProps, TChildProps = {}>(operationOptions?: OperationOption<
  TProps,
  ${operationResultType},
  ${operationVariablesTypes},
  ${propsTypeName}<TChildProps>>) {
    return ${reactApolloHoc}<TProps, ${operationResultType}, ${operationVariablesTypes}, ${propsTypeName}<TChildProps>>(${documentVariableName}, operationOptions);
};`;

    return [propsVar, mutationFn, hocString].filter(a => a).join('\n');
  }

  private _buildComponent(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const componentName: string = this.convertName(node.name.value, { suffix: 'Component', useTypesPrefix: false });

    this.reactApolloImports.add(`${operationType} as Apollo${operationType}`);
    this.reactApolloImports.add(`${operationType}Props`);

    return `
export class ${componentName} extends React.Component<Exclude<${operationType}Props<${operationResultType}, ${operationVariablesTypes}>, 'query'>> {
  render() {
      return (
          <Apollo${operationType}<${operationResultType}, ${operationVariablesTypes}> ${node.operation}={${documentVariableName}} {...this.props} />
      );
  }
}`;
  }

  private _buildHooks(node: OperationDefinitionNode, operationType: string, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    const operationName: string = this.convertName(node.name.value, { suffix: titleCase(operationType), useTypesPrefix: false });

    this.reactApolloHooksImports.add(`use${operationType}`);
    this.reactApolloHooksImports.add(`${operationType}HookOptions`);

    return `
export function use${operationName}(baseOptions?: ${operationType}HookOptions<${node.operation !== 'query' ? `${operationResultType}, ` : ''}${operationVariablesTypes}>) {
  return use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, baseOptions);
};`;
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const component = this.config.withComponent ? this._buildComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) : null;
    const hoc = this.config.withHOC ? this._buildOperationHoc(node, documentVariableName, operationResultType, operationVariablesTypes) : null;
    const hooks = this.config.withHooks ? this._buildHooks(node, operationType, documentVariableName, operationResultType, operationVariablesTypes) : null;

    return [component, hoc, hooks].filter(a => a).join('\n');
  }
}
