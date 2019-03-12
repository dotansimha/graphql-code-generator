import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  getConfigValue
} from 'graphql-codegen-visitor-plugin-common';
import { StencilApolloRawPluginConfig, StencilComponentType } from './index';
import autoBind from 'auto-bind';
import { FragmentDefinitionNode, print, OperationDefinitionNode } from 'graphql';
import { toPascalCase } from 'graphql-codegen-plugin-helpers';
import * as changeCase from 'change-case';

export interface StencilApolloPluginConfig extends ClientSideBasePluginConfig {
  componentType: StencilComponentType;
}

export class StencilApolloVisitor extends ClientSideBaseVisitor<
  StencilApolloRawPluginConfig,
  StencilApolloPluginConfig
> {
  constructor(fragments: FragmentDefinitionNode[], rawConfig: StencilApolloRawPluginConfig) {
    super(fragments, rawConfig, {
      componentType: getConfigValue(rawConfig.componentType, StencilComponentType.functional)
    } as any);

    autoBind(this);
  }

  public getImports(): string {
    const baseImports = super.getImports();
    const imports = [];

    if (this.config.componentType === StencilComponentType.class) {
      imports.push(`import { Component } from '@stencil/core';`);
    }

    return [baseImports, ...imports].join('\n');
  }

  private _buildOperationFunctionalComponent(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const operationName: string = this.convertName(node.name.value);
    const propsTypeName: string = this.convertName(operationName + 'Props');
    const apolloStencilComponentTag = changeCase.paramCase(`Apollo${operationType}`);
    const onReadySignature = toPascalCase(`On${operationType}ReadyFn`);
    const componentName = this.convertName(`${operationName}Component`);

    const propsVar = `
        export type ${propsTypeName} = {
            variables ?: ${operationVariablesTypes};
            onReady ?: import('stencil-apollo/dist/types/components/${apolloStencilComponentTag}/types').${onReadySignature}<${operationResultType}, ${operationVariablesTypes}>;
        };
      `;

    const component = `
        export const ${componentName} = (props: ${propsTypeName}) => <${apolloStencilComponentTag} ${operationType.toLowerCase()}={ ${documentVariableName} } { ...props } />;
      `;

    return [propsVar, component].filter(a => a).join('\n');
  }

  private _buildClassComponent(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const componentName: string = this.convertName(node.name.value + 'Component');
    const apolloStencilComponentTag = changeCase.paramCase(`Apollo${operationType}`);
    const onReadySignature = toPascalCase(`On${operationType}ReadyFn`);

    return `
            @Component({
                tag: '${changeCase.paramCase(`Apollo${toPascalCase(node.name.value)}`)}'
            })
            export class ${componentName} {
                @Prop() onReady: import('stencil-apollo/dist/types/components/${apolloStencilComponentTag}/types').${onReadySignature}<${operationResultType}, ${operationVariablesTypes}>;
                render() {
                    return <${apolloStencilComponentTag} ${operationType.toLowerCase()}={ ${documentVariableName} } onReady={ this.onReady } />;
                }
            }
      `;
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    switch (this.config.componentType) {
      case StencilComponentType.class:
        return this._buildClassComponent(
          node,
          documentVariableName,
          operationType,
          operationResultType,
          operationVariablesTypes
        );
      case StencilComponentType.functional:
        return this._buildOperationFunctionalComponent(
          node,
          documentVariableName,
          operationType,
          operationResultType,
          operationVariablesTypes
        );
      default:
        return '';
    }
  }
}
