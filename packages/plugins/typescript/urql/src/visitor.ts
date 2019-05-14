import { ClientSideBaseVisitor, ClientSideBasePluginConfig, LoadedFragment, getConfigValue } from '@graphql-codegen/visitor-plugin-common';
import { UrqlRawPluginConfig } from './index';
import * as autoBind from 'auto-bind';
import { OperationDefinitionNode, Kind } from 'graphql';
import { titleCase } from 'change-case';

export interface UrqlPluginConfig extends ClientSideBasePluginConfig {
  withComponent: boolean;
  withHooks: boolean;
  urqlImportFrom: string;
}

export class UrqlVisitor extends ClientSideBaseVisitor<UrqlRawPluginConfig, UrqlPluginConfig> {
  constructor(fragments: LoadedFragment[], rawConfig: UrqlRawPluginConfig) {
    super(fragments, rawConfig, {
      withComponent: getConfigValue(rawConfig.withComponent, true),
      withHooks: getConfigValue(rawConfig.withHooks, false),
      urqlImportFrom: getConfigValue(rawConfig.urqlImportFrom, null),
    });

    autoBind(this);
  }

  public getImports(): string {
    const baseImports = super.getImports();
    const imports = [];
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }

    if (this.config.withComponent) {
      imports.push(`import * as React from 'react';`);
    }

    if (this.config.withComponent || this.config.withHooks) {
      imports.push(`import * as Urql from '${this.config.urqlImportFrom || 'urql'}';`);
    }

    imports.push(`export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>`);

    return [baseImports, ...imports].join('\n');
  }

  private _buildComponent(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const componentName: string = this.convertName(node.name.value, { suffix: 'Component', useTypesPrefix: false });

    const isVariablesRequired = operationType === 'Query' && node.variableDefinitions.some(variableDef => variableDef.type.kind === Kind.NON_NULL_TYPE);

    return `
export const ${componentName} = (props: Omit<Urql.${operationType}Props, 'query'> & { variables${isVariablesRequired ? '' : '?'}: ${operationVariablesTypes} }) => (
  <Urql.${operationType} {...props} query={${documentVariableName}} />
);
`;
  }

  private _buildHooks(node: OperationDefinitionNode, operationType: string, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    const operationName: string = this.convertName(node.name.value, { suffix: titleCase(operationType), useTypesPrefix: false });

    if (operationType === 'Mutation') {
      return `
export function use${operationName}() {
  return Urql.use${operationType}<${operationResultType}>(${documentVariableName});
};`;
    }
    return `
export function use${operationName}(options: Omit<Urql.Use${operationType}Args<${operationVariablesTypes}>, 'query'> = {}) {
  return Urql.use${operationType}<${operationResultType}>({ query: ${documentVariableName}, ...options });
};`;
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const component = this.config.withComponent ? this._buildComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) : null;
    const hooks = this.config.withHooks ? this._buildHooks(node, operationType, documentVariableName, operationResultType, operationVariablesTypes) : null;

    return [component, hooks].filter(a => a).join('\n');
  }
}
