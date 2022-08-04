import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  LoadedFragment,
  getConfigValue,
  OMIT_TYPE,
  DocumentMode,
} from '@graphql-codegen/visitor-plugin-common';
import { VueUrqlRawPluginConfig } from './config.js';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, GraphQLSchema } from 'graphql';
import { pascalCase } from 'change-case-all';

export interface UrqlPluginConfig extends ClientSideBasePluginConfig {
  withComposition: boolean;
  urqlImportFrom: string;
}

export class UrqlVisitor extends ClientSideBaseVisitor<VueUrqlRawPluginConfig, UrqlPluginConfig> {
  private _externalImportPrefix = '';

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: VueUrqlRawPluginConfig) {
    super(schema, fragments, rawConfig, {
      withComposition: getConfigValue(rawConfig.withComposition, true),
      urqlImportFrom: getConfigValue(rawConfig.urqlImportFrom, '@urql/vue'),
    });

    if (this.config.importOperationTypesFrom) {
      this._externalImportPrefix = `${this.config.importOperationTypesFrom}.`;

      if (this.config.documentMode !== DocumentMode.external || !this.config.importDocumentNodeExternallyFrom) {
        // eslint-disable-next-line no-console
        console.warn(
          '"importOperationTypesFrom" should be used with "documentMode=external" and "importDocumentNodeExternallyFrom"'
        );
      }

      if (this.config.importOperationTypesFrom !== 'Operations') {
        // eslint-disable-next-line no-console
        console.warn('importOperationTypesFrom only works correctly when left empty or set to "Operations"');
      }
    }

    autoBind(this);
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    const imports = [];
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }

    if (this.config.withComposition) {
      imports.push(`import * as Urql from '${this.config.urqlImportFrom}';`);
    }

    imports.push(OMIT_TYPE);

    return [...baseImports, ...imports];
  }

  private _buildCompositionFn(
    node: OperationDefinitionNode,
    operationType: string,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const operationName: string = this.convertName(node.name?.value ?? '', {
      suffix: this.config.omitOperationSuffix ? '' : pascalCase(operationType),
      useTypesPrefix: false,
    });

    if (operationType === 'Mutation') {
      return `
export function use${operationName}() {
  return Urql.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName});
};`;
    }

    if (operationType === 'Subscription') {
      return `
export function use${operationName}<R = ${operationResultType}>(options: Omit<Urql.Use${operationType}Args<never, ${operationVariablesTypes}>, 'query'> = {}, handler?: Urql.SubscriptionHandlerArg<${operationResultType}, R>) {
  return Urql.use${operationType}<${operationResultType}, R, ${operationVariablesTypes}>({ query: ${documentVariableName}, ...options }, handler);
};`;
    }

    return `
export function use${operationName}(options: Omit<Urql.Use${operationType}Args<never, ${operationVariablesTypes}>, 'query'> = {}) {
  return Urql.use${operationType}<${operationResultType}>({ query: ${documentVariableName}, ...options });
};`;
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const documentVariablePrefixed = this._externalImportPrefix + documentVariableName;
    const operationResultTypePrefixed = this._externalImportPrefix + operationResultType;
    const operationVariablesTypesPrefixed = this._externalImportPrefix + operationVariablesTypes;

    const composition = this.config.withComposition
      ? this._buildCompositionFn(
          node,
          operationType,
          documentVariablePrefixed,
          operationResultTypePrefixed,
          operationVariablesTypesPrefixed
        )
      : null;

    return [composition].filter(a => a).join('\n');
  }
}
