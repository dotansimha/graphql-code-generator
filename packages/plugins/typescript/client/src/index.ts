/**
 * This file is used by codegen-graphql to generate strongly typed
 * functions for every query written in `internalApiQueries.graphql`
 */
import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import {
  GraphQLSchema,
  concatAST,
  Kind,
  FragmentDefinitionNode,
  visit,
  OperationDefinitionNode,
  DocumentNode,
} from 'graphql';
import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  RawClientSideBasePluginConfig,
  getConfigValue,
  LoadedFragment,
} from '@graphql-codegen/visitor-plugin-common';

export interface ClientQueryPluginConfig extends ClientSideBasePluginConfig {
  clientName: string;
  clientPath: string;
}

export interface ClientQueryRawPluginConfig extends RawClientSideBasePluginConfig {
  clientName: string;
  clientPath: string;
}

export class ClientQueryVisitor extends ClientSideBaseVisitor<ClientQueryRawPluginConfig, ClientQueryPluginConfig> {
  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: ClientQueryRawPluginConfig) {
    super(schema, fragments, rawConfig, {
      clientName: getConfigValue(rawConfig.clientName, 'clientName'),
      clientPath: getConfigValue(rawConfig.clientPath, 'clientPath'),
    });
  }

  public getImports(): string[] {
    const baseImports = super.getImports();

    return [...baseImports, `import ${this.config.clientName} from "${this.config.clientPath}"`];
  }

  buildOperation = (
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string => {
    if (!node || !node.name) {
      return '';
    }

    const operationName: string = this.convertName(node.name.value, {
      useTypesPrefix: false,
    });

    let hocString = '';
    switch (operationType) {
      case 'Mutation':
        hocString = `export function mutate${operationName}(variables?: ${operationVariablesTypes}) {
          return ${this.config.clientName}.mutate<${operationResultType}, ${operationVariablesTypes}>( {
              mutation: ${documentVariableName},
              variables
          });
        };`;
        break;
      case 'Query':
        hocString = `export function query${operationName}(variables?: ${operationVariablesTypes}) {
          return ${this.config.clientName}.query<${operationResultType}, ${operationVariablesTypes}>( {
              query: ${documentVariableName},
              variables
          });
        };`;
        break;
      default:
        throw new Error('OperationType ' + operationType + ' not supported');
    }

    return hocString;
  };
}

export const plugin: PluginFunction<ClientQueryRawPluginConfig> = (schema, documents, config) => {
  const sourceDocuments: DocumentNode[] = documents.map(v => v.document).filter(d => d !== undefined) as DocumentNode[];

  const allAst = concatAST(sourceDocuments);

  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(
      fragmentDef => ({
        node: fragmentDef,
        name: fragmentDef.name.value,
        onType: fragmentDef.typeCondition.name.value,
        isExternal: false,
      })
    ),
    ...(config.externalFragments || []),
  ];

  const visitor = new ClientQueryVisitor(schema, allFragments, config);
  const visitorResult = visit(allAst, { leave: visitor });

  return {
    prepend: visitor.getImports(),
    content: [visitor.fragments, ...visitorResult.definitions.filter((t: string) => typeof t === 'string')].join('\n'),
  };
};
