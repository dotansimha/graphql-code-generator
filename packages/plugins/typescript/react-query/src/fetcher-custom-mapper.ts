import { OperationDefinitionNode } from 'graphql';
import { ReactQueryVisitor } from './visitor';
import { FetcherRenderer } from './fetcher';
import { parseMapper, ParsedMapper, buildMapperImport } from '@graphql-codegen/visitor-plugin-common';

export class CustomMapperFetcher implements FetcherRenderer {
  private _mapper: ParsedMapper;

  constructor(private visitor: ReactQueryVisitor, fetcherStr: string) {
    this._mapper = parseMapper(fetcherStr);
  }

  getFetcherFnName(): string {
    if (this._mapper.isExternal) {
      return this._mapper.type;
    }

    return this._mapper.type;
  }

  generateFetcherImplementaion(): string {
    if (this._mapper.isExternal) {
      return buildMapperImport(
        this._mapper.source,
        [
          {
            identifier: this._mapper.type,
            asDefault: this._mapper.default,
          },
        ],
        this.visitor.config.useTypeImports
      );
    }

    return null;
  }

  generateQueryHook(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean
  ): string {
    const variables = `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
    this.visitor.reactQueryIdentifiersInUse.add('useQuery');
    this.visitor.reactQueryIdentifiersInUse.add('QueryConfig');

    return `export const use${operationResultType} = (${variables}, options?: QueryConfig<${operationResultType}>) => 
  useQuery<${operationResultType}>(
    ['${node.name.value}', variables],
    ${this.getFetcherFnName()}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables),
    options
  );`;
  }

  generateMutationHook(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string,
    hasRequiredVariables: boolean
  ): string {
    const variables = `variables${hasRequiredVariables ? '' : '?'}: ${operationVariablesTypes}`;
    this.visitor.reactQueryIdentifiersInUse.add('useMutation');
    this.visitor.reactQueryIdentifiersInUse.add('MutationConfig');

    return `export const use${operationResultType} = (${variables}, options?: MutationConfig<${operationResultType}, unknown, ${operationVariablesTypes}>) => 
    useMutation<${operationResultType}, unknown, ${operationVariablesTypes}>(
    ${this.getFetcherFnName()}<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables),
    options
  );`;
  }
}
