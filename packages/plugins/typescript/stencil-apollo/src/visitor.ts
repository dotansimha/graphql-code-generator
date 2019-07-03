import { ClientSideBaseVisitor, ClientSideBasePluginConfig, getConfigValue, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { StencilApolloRawPluginConfig, StencilComponentType } from './index';
import * as autoBind from 'auto-bind';
import { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql';
import { toPascalCase } from '@graphql-codegen/plugin-helpers';
import * as changeCase from 'change-case';

export interface StencilApolloPluginConfig extends ClientSideBasePluginConfig {
  componentType: StencilComponentType;
}

export class StencilApolloVisitor extends ClientSideBaseVisitor<StencilApolloRawPluginConfig, StencilApolloPluginConfig> {
  constructor(fragments: LoadedFragment[], rawConfig: StencilApolloRawPluginConfig) {
    super(fragments, rawConfig, {
      componentType: getConfigValue(rawConfig.componentType, StencilComponentType.functional),
      noExport: rawConfig.componentType === StencilComponentType.class,
    } as any);

    autoBind(this);
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    const imports = [];
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }

    if (this.config.componentType === StencilComponentType.class) {
      imports.push(`import 'stencil-apollo';`);
      imports.push(`import { Component, Prop, h } from '@stencil/core';`);
    } else {
      imports.push(`import * as StencilApollo from 'stencil-apollo';`);
      imports.push(`import { h } from '@stencil/core';`);
    }

    return [...baseImports, ...imports];
  }

  private _buildOperationFunctionalComponent(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const operationName: string = this.convertName(node.name.value);
    const propsTypeName: string = this.convertName(operationName + 'Props');
    const rendererSignature = toPascalCase(`${operationType}Renderer`) + `<${operationResultType}, ${operationVariablesTypes}>`;
    const apolloStencilComponentTag = changeCase.paramCase(`Apollo${operationType}`);
    const componentName = this.convertName(`${operationName}Component`);

    const propsVar = `
export type ${propsTypeName} = {
    variables ?: ${operationVariablesTypes};
    inlist ?: StencilApollo.${rendererSignature};
};
      `;

    const component = `
export const ${componentName} = (props: ${propsTypeName}, children: [StencilApollo.${rendererSignature}]) => (
  <${apolloStencilComponentTag} ${operationType.toLowerCase()}={ ${documentVariableName} } { ...props } renderer={ children[0] } />
);
      `;

    return [propsVar, component].filter(a => a).join('\n');
  }

  private _buildClassComponent(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const componentName: string = this.convertName(node.name.value + 'Component');
    const apolloStencilComponentTag = changeCase.paramCase(`Apollo${operationType}`);
    const rendererSignature = toPascalCase(`${operationType}Renderer`);

    return `
@Component({
    tag: '${changeCase.paramCase(`Apollo${toPascalCase(node.name.value)}`)}'
})
export class ${componentName} {
    @Prop() renderer: import('stencil-apollo').${rendererSignature}<${operationResultType}, ${operationVariablesTypes}>;
    render() {
        return <${apolloStencilComponentTag} ${operationType.toLowerCase()}={ ${documentVariableName} } renderer={ this.renderer } />;
    }
}
      `;
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    switch (this.config.componentType) {
      case StencilComponentType.class:
        return this._buildClassComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes);
      case StencilComponentType.functional:
        return this._buildOperationFunctionalComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes);
      default:
        return '';
    }
  }
}
