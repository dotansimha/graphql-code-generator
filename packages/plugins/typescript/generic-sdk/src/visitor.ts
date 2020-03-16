import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  LoadedFragment,
  indentMultiline,
  RawClientSideBasePluginConfig,
  DocumentMode,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { GraphQLSchema, Kind, OperationDefinitionNode } from 'graphql';

export class GenericSdkVisitor extends ClientSideBaseVisitor<
  RawClientSideBasePluginConfig,
  ClientSideBasePluginConfig
> {
  private _operationsToInclude: {
    node: OperationDefinitionNode;
    documentVariableName: string;
    operationType: string;
    operationResultType: string;
    operationVariablesTypes: string;
  }[] = [];

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: RawClientSideBasePluginConfig) {
    super(schema, fragments, rawConfig, {});

    autoBind(this);

    if (this.config.documentMode !== DocumentMode.string) {
      this._additionalImports.push(`import { DocumentNode } from 'graphql';`);
    }
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    this._operationsToInclude.push({
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes,
    });

    return null;
  }

  public get sdkContent(): string {
    const allPossibleActions = this._operationsToInclude
      .map(o => {
        const optionalVariables =
          !o.node.variableDefinitions ||
          o.node.variableDefinitions.length === 0 ||
          o.node.variableDefinitions.every(v => v.type.kind !== Kind.NON_NULL_TYPE || v.defaultValue);
        return `${o.node.name.value}(variables${optionalVariables ? '?' : ''}: ${
          o.operationVariablesTypes
        }, options?: C): Promise<${o.operationResultType}> {
  return requester<${o.operationResultType}, ${o.operationVariablesTypes}>(${
          o.documentVariableName
        }, variables, options);
}`;
      })
      .map(s => indentMultiline(s, 2));

    return `export type Requester<C= {}> = <R, V>(doc: ${
      this.config.documentMode === DocumentMode.string ? 'string' : 'DocumentNode'
    }, vars?: V, options?: C) => Promise<R>
export function getSdk<C>(requester: Requester<C>) {
  return {
${allPossibleActions.join(',\n')}
  };
}`;
  }
}
