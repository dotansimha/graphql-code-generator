import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  LoadedFragment,
  getConfigValue,
  OMIT_TYPE,
} from '@graphql-codegen/visitor-plugin-common';
import { UrqlSvelteRawPluginConfig } from './config';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, GraphQLSchema } from 'graphql'; // Kind
// import { pascalCase } from 'pascal-case';

export interface UrqlSveltePluginConfig extends ClientSideBasePluginConfig {
  urqlSvelteImportFrom: string;
}

export class UrqlSvelteVisitor extends ClientSideBaseVisitor<UrqlSvelteRawPluginConfig, UrqlSveltePluginConfig> {
  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: UrqlSvelteRawPluginConfig) {
    super(schema, fragments, rawConfig, {
      urqlSvelteImportFrom: getConfigValue(rawConfig.urqlSvelteImportFrom, null),
    });

    autoBind(this);
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    const imports = [];
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return [`<script context="module" lang="ts">`, ...baseImports];
    }

    imports.push(`import * as UrqlSvelte from '${this.config.urqlSvelteImportFrom || '@urql/svelte'}';`);

    imports.push(OMIT_TYPE);

    return [`import <script context="module" lang="ts">`, ...baseImports, ...imports];
  }

  //   private _buildComponent(
  //     node: OperationDefinitionNode,
  //     documentVariableName: string,
  //     operationType: string,
  //     operationResultType: string,
  //     operationVariablesTypes: string
  //   ): string {
  //     const componentNameConverted: string = this.convertName(node.name?.value ?? '', {
  //       suffix: 'Component',
  //       useTypesPrefix: false,
  //     });

  //        const componentName: string = this.convertName(node.name?.value ?? '', {
  //       suffix: 'Component',
  //       useTypesPrefix: false,
  //     });

  //     const isVariablesRequired =
  //       operationType === 'Query' &&
  //       node.variableDefinitions.some(variableDef => variableDef.type.kind === Kind.NON_NULL_TYPE);

  //     const generics = [operationResultType, operationVariablesTypes];

  //     if (operationType === 'Subscription') {
  //       generics.unshift(operationResultType);
  //     }
  //     return `
  // export const ${componentName} = (props: Omit<Urql.${operationType}Props<${generics.join(
  //       ', '
  //     )}>, 'query'> & { variables${isVariablesRequired ? '' : '?'}: ${operationVariablesTypes} }) => (
  //   <Urql.${operationType} {...props} query={${documentVariableName}} />
  // );
  // `;
  //   }

  private _buildHooks(
    node: OperationDefinitionNode,
    operationType: string,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const operationNameConverted: string = this.convertName(node.name?.value ?? '', {
      suffix: this.config.omitOperationSuffix ? '' : operationType,
      useTypesPrefix: false,
    });

    const operationName: string = operationNameConverted.slice(0, 1).toLowerCase() + operationNameConverted.slice(1);

    //     if (operationType === 'Mutation') {
    //       return `
    // export function ${operationName}() {
    //   return UrqlSvelte.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName});
    // };`;
    //     }

    //     if (operationType === 'Subscription') {
    //       return `
    // export function ${operationName}<TData = ${operationResultType}>(options: Omit<Urql.Use${operationType}Args<${operationVariablesTypes}>, 'query'> = {}, handler?: Urql.SubscriptionHandler<${operationResultType}, TData>) {
    //   return Urql.use${operationType}<${operationResultType}, TData, ${operationVariablesTypes}>({ query: ${documentVariableName}, ...options }, handler);
    // };`;
    //     }
    if (operationType === 'Subscription') {
      return `
export function ${operationName}(handler) {
  return UrqlSvelte.subscription(UrqlSvelte.operationStore(${documentVariableName}), handler);
};`;
    } else if (operationType === 'Mutation') {
      return `
export function ${operationName}() {
  return UrqlSvelte.mutation(UrqlSvelte.operationStore(${documentVariableName}));
};`;
    } else {
      return `
export function ${operationName}() {
  return UrqlSvelte.query(UrqlSvelte.operationStore(${documentVariableName}));
};`;
    }
  }

  // query(operationStore(`
  //    query {
  //      listPdfs {
  //        rowid
  //        name
  //      }
  //    }
  //  `));

  //      if (operationType === 'Mutation') {
  //       return `
  // export function use${operationName}() {
  //   return Urql.use${operationType}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName});
  // };`;
  //     }

  //     if (operationType === 'Subscription') {
  //       return `
  // export function use${operationName}<TData = ${operationResultType}>(options: Omit<Urql.Use${operationType}Args<${operationVariablesTypes}>, 'query'> = {}, handler?: Urql.SubscriptionHandler<${operationResultType}, TData>) {
  //   return Urql.use${operationType}<${operationResultType}, TData, ${operationVariablesTypes}>({ query: ${documentVariableName}, ...options }, handler);
  // };`;
  //     }

  //     return `
  // export function use${operationName}(options: Omit<Urql.Use${operationType}Args<${operationVariablesTypes}>, 'query'> = {}) {
  //   return Urql.use${operationType}<${operationResultType}>({ query: ${documentVariableName}, ...options });
  // };`;
  //   }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    return this._buildHooks(node, operationType, documentVariableName, operationResultType, operationVariablesTypes);

    // return [component, hooks].filter(a => a).join('\n');
  }
}
