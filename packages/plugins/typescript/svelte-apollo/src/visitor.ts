import type { GraphQLSchema, OperationDefinitionNode } from 'graphql';
import { ClientSideBaseVisitor, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import type { Types } from '@graphql-codegen/plugin-helpers';
import injectImports from './injectImports';
import { SvelteApolloVisitorConfig } from './config';

export class SvelteApolloVisitor extends ClientSideBaseVisitor {
  private imports = new Set<string>();
  private basicConfig: {
    addSvelteContext: boolean;
    loadGetClientFrom: string;
    noExport: boolean;
  };

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    { addSvelteContext, loadGetClientFrom = 'svelte-apollo', noExport, ...config }: SvelteApolloVisitorConfig,
    documents?: Types.DocumentFile[]
  ) {
    super(schema, fragments, { ...config, noExport }, {}, documents);
    this.basicConfig = { addSvelteContext, loadGetClientFrom, noExport };
  }

  getImports(): string[] {
    const loads = {};
    const apolloImports = [];

    if (this.basicConfig.addSvelteContext) {
      apolloImports.push('ApolloClient');
      loads['svelte'] = ['getContext', 'setContext'];
    } else {
      if (this.basicConfig.loadGetClientFrom) {
        loads[this.basicConfig.loadGetClientFrom] = ['getClient'];
      }
    }

    if (this.imports.size) {
      apolloImports.push(...this.imports);
    }

    if (apolloImports.length) {
      loads['@apollo/client'] = { type: apolloImports };
    }

    return [...super.getImports(), ...injectImports(loads)];
  }

  getExecutions(): string {
    return !this.basicConfig.addSvelteContext ? '' : this.getSvelteContext();
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: 'Query' | 'Mutation' | 'Subscription',
    operationResultType: string,
    operationVariablesTypes: string,
    requiresVariables: boolean
  ): string {
    if (!node?.name) {
      throw new Error('You should name all your operations');
    }

    const name = this.convertName(node.name.value);

    switch (operationType) {
      case 'Query':
        this.imports.add('QueryOptions');
        return this.buildQuery(
          name,
          documentVariableName,
          operationResultType,
          operationVariablesTypes,
          requiresVariables
        );
      case 'Mutation':
        this.imports.add('MutationOptions');
        return this.buildMutation(
          name,
          documentVariableName,
          operationResultType,
          operationVariablesTypes,
          requiresVariables
        );
      case 'Subscription':
        this.imports.add('SubscriptionOptions');
        return this.buildSubscription(
          name,
          documentVariableName,
          operationResultType,
          operationVariablesTypes,
          requiresVariables
        );
    }
  }

  private buildQuery(
    name: string,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    requiresVariables: boolean
  ): string {
    const $e = this.basicConfig.noExport ? '' : 'export ';
    const $d = requiresVariables ? ' = {}' : '';
    return `${$e}const Query${name} = (
      options: Omit<QueryOptions<${operationVariablesTypes}>, "query">${$d}
    ) => getClient().query<${operationResultType}>({ query: ${documentVariableName}, ...options })
    `;
  }

  private buildMutation(
    name: string,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    requiresVariables: boolean
  ): string {
    const $e = this.basicConfig.noExport ? '' : 'export ';
    const $d = requiresVariables ? ' = {}' : '';
    return `${$e}const Mutation${name} = (
      options: Omit<MutationOptions<${operationResultType}, ${operationVariablesTypes}>, "mutation">${$d}
    ) => getClient().mutate({ mutation: ${documentVariableName}, ...options })
    `;
  }

  private buildSubscription(
    name: string,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    requiresVariables: boolean
  ): string {
    const $e = this.basicConfig.noExport ? '' : 'export ';
    const $d = requiresVariables ? ' = {}' : '';
    return `${$e}const Subscription${name} = (
      options: Omit<SubscriptionOptions<${operationVariablesTypes}>, "query">${$d}
    ) => getClient().subscribe<${operationResultType}>({ query: ${documentVariableName}, ...options })
    `;
  }

  private getSvelteContext(): string {
    const $e = this.basicConfig.noExport ? '' : 'export ';
    return `
// addSvelteContext
const CLIENT = typeof Symbol !== "undefined" ? Symbol("client") : "@@client";

${$e}function getClient<TCache = any>() {
	const client = getContext(CLIENT);
	if (!client) {
		throw new Error(
			"ApolloClient has not been set yet, use setClient(new ApolloClient({ ... })) to define it"
		);
	}
	return client as ApolloClient<TCache>;
}

${$e}function setClient<TCache = any>(client: ApolloClient<TCache>): void {
	setContext(CLIENT, client);
}`;
  }
}
