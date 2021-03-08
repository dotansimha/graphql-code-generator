import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  LoadedFragment,
  DocumentMode,
  RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common';
import autoBind from 'auto-bind';
import { OperationDefinitionNode, GraphQLSchema } from 'graphql';
import { Types } from '@graphql-codegen/plugin-helpers';
import { pascalCase } from 'change-case-all';

export interface ReactApolloPluginConfig extends ClientSideBasePluginConfig {}

export class ReactApolloVisitor extends ClientSideBaseVisitor<RawClientSideBasePluginConfig, ReactApolloPluginConfig> {
  private _externalImportPrefix: string;
  private imports = new Set<string>();

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: RawClientSideBasePluginConfig,
    documents: Types.DocumentFile[]
  ) {
    super(schema, fragments, rawConfig, {});

    this._externalImportPrefix = this.config.importOperationTypesFrom ? `${this.config.importOperationTypesFrom}.` : '';
    this._documents = documents;

    autoBind(this);
  }

  private getOffixReactHooksImport(): string {
    return `import * as OffixReactHooks from "react-offix-hooks";`;
  }

  private getDocumentNodeVariable(node: OperationDefinitionNode, documentVariableName: string): string {
    return this.config.documentMode === DocumentMode.external ? `Operations.${node.name.value}` : documentVariableName;
  }

  public getImports(): string[] {
    const baseImports = super.getImports({ excludeFragments: true });
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }

    return [...baseImports, ...Array.from(this.imports)];
  }

  private _buildHooks(
    node: OperationDefinitionNode,
    operationType: string,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const operationName: string = this.convertName(node.name?.value ?? '', {
      useTypesPrefix: false,
    });

    this.imports.add(this.getOffixReactHooksImport());

    const hookFns = [];

    if (operationType === 'Mutation') {
      hookFns.push(
        `export function useOffline${operationName}(baseOptions?: OffixReactHooks.${operationType}HookOptions<${operationResultType}, ${operationVariablesTypes}>) {
    return OffixReactHooks.useOfflineMutation<${operationResultType}, ${operationVariablesTypes}>(${this.getDocumentNodeVariable(
          node,
          documentVariableName
        )}, baseOptions);
}`
      );
    }

    return [...hookFns].join('\n');
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    operationResultType = this._externalImportPrefix + operationResultType;
    operationVariablesTypes = this._externalImportPrefix + operationVariablesTypes;

    const hooks = this._buildHooks(
      node,
      operationType,
      documentVariableName,
      operationResultType,
      operationVariablesTypes
    );

    return [hooks].filter(a => a).join('\n');
  }

  OperationDefinition(node: OperationDefinitionNode) {
    if (!node.name || !node.name.value) {
      return null;
    }
    this._collectedOperations.push(node);
    const documentVariableName = this.convertName(node, {
      suffix: this.config.documentVariableSuffix,
      prefix: this.config.documentVariablePrefix,
      useTypesPrefix: false,
    });

    const operationType = pascalCase(node.operation);
    const operationTypeSuffix = this.getOperationSuffix(node, operationType);
    const operationResultType = this.convertName(node, {
      suffix: operationTypeSuffix + this._parsedConfig.operationResultSuffix,
    });
    const operationVariablesTypes = this.convertName(node, {
      suffix: operationTypeSuffix + 'Variables',
    });
    const additional = this.buildOperation(
      node,
      documentVariableName,
      operationType,
      operationResultType,
      operationVariablesTypes
    );
    return [additional].filter(a => a).join('\n');
  }
}
