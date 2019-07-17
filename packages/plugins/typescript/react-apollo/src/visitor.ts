import { ClientSideBaseVisitor, ClientSideBasePluginConfig, getConfigValue, LoadedFragment, OMIT_TYPE } from '@graphql-codegen/visitor-plugin-common';
import { ReactApolloRawPluginConfig } from './index';
import * as autoBind from 'auto-bind';
import { OperationDefinitionNode, Kind } from 'graphql';
import { toPascalCase } from '@graphql-codegen/plugin-helpers';
import { titleCase } from 'change-case';

export interface ReactApolloPluginConfig extends ClientSideBasePluginConfig {
  withComponent: boolean;
  withHOC: boolean;
  withHooks: boolean;
  withMutationFn: boolean;
  apolloReactCommonImportFrom: string;
  apolloReactComponentsImportFrom: string;
  apolloReactHocImportFrom: string;
  apolloReactHooksImportFrom: string;
  componentSuffix: string;
  reactApolloVersion: 2 | 3;
}

export class ReactApolloVisitor extends ClientSideBaseVisitor<ReactApolloRawPluginConfig, ReactApolloPluginConfig> {
  constructor(fragments: LoadedFragment[], rawConfig: ReactApolloRawPluginConfig) {
    super(fragments, rawConfig, {
      componentSuffix: getConfigValue(rawConfig.componentSuffix, 'Component'),
      withHOC: getConfigValue(rawConfig.withHOC, true),
      withComponent: getConfigValue(rawConfig.withComponent, true),
      withHooks: getConfigValue(rawConfig.withHooks, false),
      withMutationFn: getConfigValue(rawConfig.withMutationFn, true),
      apolloReactCommonImportFrom: getConfigValue(rawConfig.apolloReactCommonImportFrom, '@apollo/react-common'),
      apolloReactComponentsImportFrom: getConfigValue(rawConfig.apolloReactComponentsImportFrom, '@apollo/react-components'),
      apolloReactHocImportFrom: getConfigValue(rawConfig.apolloReactHocImportFrom, '@apollo/react-hoc'),
      apolloReactHooksImportFrom: getConfigValue(rawConfig.apolloReactHooksImportFrom, '@apollo/react-hooks'),
      reactApolloVersion: getConfigValue(rawConfig.reactApolloVersion, 2),
    } as any);

    autoBind(this);
  }

  private imports = new Set<string>();

  private getReactImport(): string {
    return `import * as React from 'react';`;
  }

  private getApolloReactCommonImport(): string {
    return `import * as ApolloReactCommon from '${this.config.apolloReactCommonImportFrom}';`;
  }

  private getApolloReactComponentsImport(): string {
    return `import * as ApolloReactComponents from '${this.config.apolloReactComponentsImportFrom}';`;
  }

  private getApolloReactHocImport(): string {
    return `import * as ApolloReactHoc from '${this.config.apolloReactHocImportFrom}';`;
  }

  private getApolloReactHooksImport(): string {
    return `import * as ApolloReactHooks from '${this.config.apolloReactHooksImportFrom}';`;
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

    this.imports.add(this.getApolloReactCommonImport());
    this.imports.add(this.getApolloReactHocImport());

    return `Partial<ApolloReactHoc.${argType}<${typeVariableName}, ${variablesVarName}>>`;
  }

  private _buildMutationFn(node: OperationDefinitionNode, operationResultType: string, operationVariablesTypes: string): string {
    if (node.operation === 'mutation') {
      this.imports.add(this.getApolloReactCommonImport());
      return `export type ${this.convertName(node.name.value + 'MutationFn')} = ApolloReactCommon.MutationFunction<${operationResultType}, ${operationVariablesTypes}>;`;
    }
    return null;
  }

  private _buildOperationHoc(node: OperationDefinitionNode, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    this.imports.add(this.getApolloReactCommonImport());
    this.imports.add(this.getApolloReactHocImport());
    const operationName: string = this.convertName(node.name.value, { useTypesPrefix: false });
    const propsTypeName: string = this.convertName(node.name.value, { suffix: 'Props' });

    const propsVar = `export type ${propsTypeName}<TChildProps = {}> = ${this._buildHocProps(node.name.value, node.operation)} & TChildProps;`;

    const hocString = `export function with${operationName}<TProps, TChildProps = {}>(operationOptions?: ApolloReactHoc.OperationOption<
  TProps,
  ${operationResultType},
  ${operationVariablesTypes},
  ${propsTypeName}<TChildProps>>) {
    return ApolloReactHoc.with${titleCase(node.operation)}<TProps, ${operationResultType}, ${operationVariablesTypes}, ${propsTypeName}<TChildProps>>(${documentVariableName}, {
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
    this.imports.add(this.getApolloReactCommonImport());
    this.imports.add(this.getApolloReactComponentsImport());
    this.imports.add(this.getOmitDeclaration());

    const propsType = `Omit<ApolloReactComponents.${operationType}ComponentOptions<${operationResultType}, ${operationVariablesTypes}>, '${operationType.toLowerCase()}'>`;
    let componentProps = '';
    if (isVariablesRequired) {
      componentProps = `export type ${componentPropsName} = ${propsType} & ({ variables: ${operationVariablesTypes}; skip?: false; } | { skip: true; });`;
    } else {
      componentProps = `export type ${componentPropsName} = ${propsType};`;
    }

    const component = `
    export const ${componentName} = (props: ${componentPropsName}) => (
      <ApolloReactComponents.${operationType}<${operationResultType}, ${operationVariablesTypes}> ${node.operation}={${documentVariableName}} {...props} />
    );
    `;
    return [componentProps, component].join('\n');
  }

  private _buildHooks(node: OperationDefinitionNode, operationType: string, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    const operationName: string = this.convertName(node.name.value, { suffix: titleCase(operationType), useTypesPrefix: false });

    this.imports.add(this.getApolloReactCommonImport());
    this.imports.add(this.getApolloReactHooksImport());

    const hookFn = `
    export function use${operationName}(baseOptions?: ApolloReactHooks.${operationType}HookOptions<${operationResultType}, ${operationVariablesTypes}>) {
      return ApolloReactHooks.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, baseOptions);
    };`;

    const hookResult = `export type ${operationName}HookResult = ReturnType<typeof use${operationName}>;`;

    return [hookFn, hookResult].join('\n');
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const mutationFn = this.config.withMutationFn || this.config.withComponent ? this._buildMutationFn(node, operationResultType, operationVariablesTypes) : null;
    const component = this.config.withComponent ? this._buildComponent(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) : null;
    const hoc = this.config.withHOC ? this._buildOperationHoc(node, documentVariableName, operationResultType, operationVariablesTypes) : null;
    const hooks = this.config.withHooks ? this._buildHooks(node, operationType, documentVariableName, operationResultType, operationVariablesTypes) : null;

    return [mutationFn, component, hoc, hooks].filter(a => a).join('\n');
  }
}
