import { ClientSideBaseVisitor, ClientSideBasePluginConfig, getConfigValue } from '@graphql-codegen/visitor-plugin-common';
import { StencilApolloRawPluginConfig, StencilComponentType } from './index';
import * as autoBind from 'auto-bind';
import { FragmentDefinitionNode, OperationDefinitionNode } from 'graphql';
import { toPascalCase } from '@graphql-codegen/plugin-helpers';
import * as changeCase from 'change-case';

export interface StencilApolloPluginConfig extends ClientSideBasePluginConfig {
  componentType: StencilComponentType;
}

export class StencilApolloVisitor extends ClientSideBaseVisitor<StencilApolloRawPluginConfig, StencilApolloPluginConfig> {
  stencilApolloImports = new Set<string>();
  constructor(fragments: FragmentDefinitionNode[], rawConfig: StencilApolloRawPluginConfig) {
    super(fragments, rawConfig, {
      componentType: getConfigValue(rawConfig.componentType, StencilComponentType.functional),
    } as any);

    autoBind(this);
  }

  public getImports(): string {
    const baseImports = super.getImports();

    const imports = [];

    if (this.config.componentType === StencilComponentType.class) {
      imports.push(`import { Component, Prop } from '@stencil/core';`);
    }

    if (this.stencilApolloImports.size) {
      imports.push(`import { ${[...this.stencilApolloImports].join(', ')} } from 'stencil-apollo';`);
    }

    return [baseImports, ...imports].join('\n');
  }

  private _buildOperationFunctionalComponent(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const operationName: string = this.convertName(node.name.value);
    const propsTypeName: string = this.convertName(operationName + 'Props');
    const rendererSignature = toPascalCase(`${operationType}Renderer`) + `<${operationResultType}, ${operationVariablesTypes}>`;
    const apolloStencilFunctionalComponentName = changeCase.titleCase(`${operationType}`);
    const componentName = this.convertName(`${operationName}Component`);

    this.stencilApolloImports.add(`${operationType}Renderer`);
    this.stencilApolloImports.add(`${apolloStencilFunctionalComponentName} as Apollo${apolloStencilFunctionalComponentName}`);

    const propsVar = `
        export type ${propsTypeName} = {
            variables ?: ${operationVariablesTypes};
            children ?: ${rendererSignature};
        };
      `;

    const component = `
        export const ${componentName} = (props: ${propsTypeName}, children: [${rendererSignature}]) => (
          <Apollo${apolloStencilFunctionalComponentName}<${operationResultType}, ${operationVariablesTypes}> ${operationType.toLowerCase()}={ ${documentVariableName} } { ...props }>
            {children[0]}
          </Apollo${apolloStencilFunctionalComponentName}>
        );
      `;

    return [propsVar, component].filter(a => a).join('\n');
  }

  private _buildClassComponent(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const componentName: string = this.convertName(node.name.value + 'Component');
    const apolloStencilComponentTag = changeCase.paramCase(`Apollo${operationType}`);
    const rendererSignature = toPascalCase(`${operationType}Renderer`);

    this.stencilApolloImports.add(rendererSignature);

    return `
            @Component({
                tag: '${changeCase.paramCase(`Apollo${toPascalCase(node.name.value)}`)}'
            })
            export class ${componentName} {
                @Prop() renderer: ${rendererSignature}<${operationResultType}, ${operationVariablesTypes}>;
                @Prop() variables: ${operationVariablesTypes};
                render() {
                    return <${apolloStencilComponentTag} ${operationType.toLowerCase()}={ ${documentVariableName} } renderer={ this.renderer } variables={ this.variables } />;
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
