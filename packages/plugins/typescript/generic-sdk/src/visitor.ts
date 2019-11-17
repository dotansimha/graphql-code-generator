import { ClientSideBaseVisitor, ClientSideBasePluginConfig, LoadedFragment, getConfigValue, OMIT_TYPE, indentMultiline, RawClientSideBasePluginConfig, DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { GraphQLSchema, Kind } from 'graphql';
import { OperationDefinitionNode } from 'graphql';

export class GenericSdkVisitor extends ClientSideBaseVisitor<RawClientSideBasePluginConfig, ClientSideBasePluginConfig> {
  private _operationsToInclude: { node: OperationDefinitionNode; documentVariableName: string; operationType: string; operationResultType: string; operationVariablesTypes: string }[] = [];

  constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: RawClientSideBasePluginConfig) {
    super(schema, fragments, rawConfig, {});

    autoBind(this);

    if (this.config.documentMode !== DocumentMode.string) {
      this._additionalImports.push(`import { print } from 'graphql';`);
    }
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
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
        const optionalVariables = !o.node.variableDefinitions || o.node.variableDefinitions.length === 0 || o.node.variableDefinitions.every(v => v.type.kind !== Kind.NON_NULL_TYPE || v.defaultValue);
        const doc = this.config.documentMode === DocumentMode.string ? o.documentVariableName : `print(${o.documentVariableName})`;
        return `${o.node.name.value}(variables${optionalVariables ? '?' : ''}: ${o.operationVariablesTypes}): Promise<${o.operationResultType}> {
  return requester<${o.operationResultType}, ${o.operationVariablesTypes}>(${doc}, variables);
}`;
      })
      .map(s => indentMultiline(s, 2));

    return `export type Requester = <R, V>(doc: string, vars?: V) => Promise<R>
export function getSdk(requester: Requester) {
  return {
${allPossibleActions.join(',\n')}
  };
}`;
  }
}
