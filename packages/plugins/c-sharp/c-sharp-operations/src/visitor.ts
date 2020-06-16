import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  DocumentMode,
  LoadedFragment,
  indentMultiline,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, print, visit, GraphQLSchema, Kind } from 'graphql';
import { CSharpOperationsRawPluginConfig } from './config';
import { camelCase } from 'camel-case';
import { Types } from '@graphql-codegen/plugin-helpers';

const R_NAME = /name:\s*"([^"]+)"/;

function R_DEF(directive: string) {
  return new RegExp(`\\s+\\@${directive}\\([^)]+\\)`, 'gm');
}

export interface CSharpOperationsPluginConfig extends ClientSideBasePluginConfig {
  namedClient: string;
  serviceName: string;
  querySuffix: string;
  mutationSuffix: string;
  subscriptionSuffix: string;
}

export class CSharpOperationsVisitor extends ClientSideBaseVisitor<
  CSharpOperationsRawPluginConfig,
  CSharpOperationsPluginConfig
> {
  private _operationsToInclude: {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
    serviceName: string;
  }[] = [];

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: CSharpOperationsRawPluginConfig,
    documents?: Types.DocumentFile[]
  ) {
    super(
      schema,
      fragments,
      rawConfig,
      {
        namedClient: rawConfig.namedClient,
        serviceName: rawConfig.serviceName,
        querySuffix: rawConfig.querySuffix,
        mutationSuffix: rawConfig.mutationSuffix,
        subscriptionSuffix: rawConfig.subscriptionSuffix,
      },
      documents
    );

    autoBind(this);
  }

  private _operationHasDirective(operation: string | OperationDefinitionNode, directive: string) {
    if (typeof operation === 'string') {
      return operation.includes(`${directive}`);
    }

    let found = false;

    visit(operation, {
      Directive(node) {
        if (node.name.value === directive) {
          found = true;
        }
      },
    });

    return found;
  }

  private _extractDirective(operation: OperationDefinitionNode, directive: string) {
    const directives = print(operation).match(R_DEF(directive));

    if (directives.length > 1) {
      throw new Error(`The ${directive} directive used multiple times in '${operation.name}' operation`);
    }

    return directives[0];
  }

  private _namedClient(operation: OperationDefinitionNode): string {
    let name: string;

    if (this._operationHasDirective(operation, 'namedClient')) {
      name = this._extractNamedClient(operation);
    } else if (this.config.namedClient) {
      name = this.config.namedClient;
    }

    return name ? `client = '${name}';` : '';
  }

  private _extractNamedClient(operation: OperationDefinitionNode): string {
    const [, name] = this._extractDirective(operation, 'namedClient').match(R_NAME);

    return name;
  }

  protected _gql(node: OperationDefinitionNode): string {
    const fragments = this._transformFragments(node);
    let doc = this._prepareDocument(`
    ${print(node).split('\\').join('\\\\')}
    ${this._includeFragments(fragments)}`);

    doc = doc.replace(/"/g, '""');

    if (this.config.documentMode === DocumentMode.string) {
      return '@"' + doc + '"';
    }

    return '@"' + doc + '"';
  }

  private _getDocumentNodeVariable(node: OperationDefinitionNode, documentVariableName: string): string {
    return this.config.documentMode === DocumentMode.external ? `Operations.${node.name.value}` : documentVariableName;
  }

  private _operationSuffix(operationType: string): string {
    const defaultSuffix = 'GQL';
    switch (operationType) {
      case 'query':
        return this.config.querySuffix || defaultSuffix;
      case 'mutation':
        return this.config.mutationSuffix || defaultSuffix;
      case 'subscription':
        return this.config.subscriptionSuffix || defaultSuffix;
      default:
        return defaultSuffix;
    }
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const serviceName = `${this.convertName(node)}${this._operationSuffix(operationType)}`;
    this._operationsToInclude.push({
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
      serviceName,
    });

    const content = `
  public class ${serviceName}{

    public static GraphQLRequest get${serviceName}() {
      return new GraphQLRequest {
        Query = ${this._getDocumentNodeVariable(node, documentVariableName)},
        OperationName = "${this.convertName(node)}"
      };
    }
    ${this._namedClient(node)}
  }
  `;

    return content;
  }

  public get sdkClass(): string {
    const actionType = operation => {
      switch (operation) {
        case 'Mutation':
          return 'mutate';
        case 'Subscription':
          return 'subscribe';
        default:
          return 'fetch';
      }
    };

    const allPossibleActions = this._operationsToInclude
      .map(o => {
        const optionalVariables =
          !o.node.variableDefinitions ||
          o.node.variableDefinitions.length === 0 ||
          o.node.variableDefinitions.every(v => v.type.kind !== Kind.NON_NULL_TYPE || !!v.defaultValue);

        const options =
          o.operationType === 'Mutation'
            ? `${o.operationType}OptionsAlone<${o.operationResultType}, ${o.operationVariablesTypes}>`
            : `${o.operationType}OptionsAlone<${o.operationVariablesTypes}>`;

        const method = `
${camelCase(o.node.name.value)}(variables${optionalVariables ? '?' : ''}: ${
          o.operationVariablesTypes
        }, options?: ${options}) {
  return this.${camelCase(o.serviceName)}.${actionType(o.operationType)}(variables, options)
}`;

        let watchMethod;

        if (o.operationType === 'Query') {
          watchMethod = `

${camelCase(o.node.name.value)}Watch(variables${optionalVariables ? '?' : ''}: ${
            o.operationVariablesTypes
          }, options?: WatchQueryOptionsAlone<${o.operationVariablesTypes}>) {
  return this.${camelCase(o.serviceName)}.watch(variables, options)
}`;
        }
        return [method, watchMethod].join('');
      })
      .map(s => indentMultiline(s, 2));

    const injectString = (service: string) => `private ${camelCase(service)}: ${service}`;
    const injections = this._operationsToInclude
      .map(op => injectString(op.serviceName))
      .map(s => indentMultiline(s, 3))
      .join(',\n');

    const serviceName = this.config.serviceName || 'GraphQLSDK';

    return `
  type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

  interface WatchQueryOptionsAlone<V>
    extends Omit<ApolloCore.WatchQueryOptions<V>, 'query' | 'variables'> {}

  interface QueryOptionsAlone<V>
    extends Omit<ApolloCore.QueryOptions<V>, 'query' | 'variables'> {}

  interface MutationOptionsAlone<T, V>
    extends Omit<ApolloCore.MutationOptions<T, V>, 'mutation' | 'variables'> {}

  interface SubscriptionOptionsAlone<V>
    extends Omit<ApolloCore.SubscriptionOptions<V>, 'query' | 'variables'> {}
  public class ${serviceName} {
    constructor(
${injections}
    ) {}
  ${allPossibleActions.join('\n')}
  }`;
  }

  public OperationDefinition(node: OperationDefinitionNode): string {
    if (!node.name || !node.name.value) {
      return null;
    }

    this._collectedOperations.push(node);

    const documentVariableName = this.convertName(node, {
      suffix: this.config.documentVariableSuffix,
      prefix: this.config.documentVariablePrefix,
      useTypesPrefix: false,
    });

    let documentString = '';
    if (this.config.documentMode !== DocumentMode.external) {
      const isDocumentNode = this.config.documentMode === DocumentMode.documentNode;
      documentString = `${this.config.noExport ? '' : 'public'} static string ${documentVariableName}${
        isDocumentNode ? ': DocumentNode' : ''
      } = ${this._gql(node)};`;
    }

    const operationType: string = node.operation;
    const operationTypeSuffix: string =
      this.config.dedupeOperationSuffix && node.name.value.toLowerCase().endsWith(node.operation)
        ? ''
        : !operationType
        ? ''
        : operationType;

    const operationResultType: string = this.convertName(node, {
      suffix: operationTypeSuffix + this._parsedConfig.operationResultSuffix,
    });
    const operationVariablesTypes: string = this.convertName(node, {
      suffix: operationTypeSuffix + 'Variables',
    });

    const serviceName = `${this.convertName(node)}${this._operationSuffix(operationType)}`;
    this._operationsToInclude.push({
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
      serviceName,
    });

    const content = `
    public class ${serviceName}{

      public static GraphQLRequest get${serviceName}() {
        return new GraphQLRequest {
          Query = ${this._getDocumentNodeVariable(node, documentVariableName)},
          OperationName = "${this.convertName(node)}"
        };
      }
      ${this._namedClient(node)}
      ${documentString}
    }
    `;
    return [content].filter(a => a).join('\n');
  }
}
