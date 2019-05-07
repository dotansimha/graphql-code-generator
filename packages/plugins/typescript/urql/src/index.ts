import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { visit, GraphQLSchema, concatAST, Kind, FragmentDefinitionNode } from 'graphql';
import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';
import { UrqlVisitor } from './visitor';
import { extname } from 'path';

export interface UrqlRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @name withComponent
   * @type boolean
   * @description Customized the output by enabling/disabling the generated Component.
   * @default true
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-react-apollo
   *  config:
   *    withComponent: false
   * ```
   */
  withComponent?: boolean;
  /**
   * @name withHooks
   * @type boolean
   * @description Customized the output by enabling/disabling the generated React Hooks.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-react-apollo
   *  config:
   *    withHooks: false
   * ```
   */
  withHooks?: boolean;

  /**
   * @name urqlImportFrom
   * @type string
   * @description You can specify module that exports components `Query`, `Mutation`, `Subscription` and HOCs
   * This is useful for further abstraction of some common tasks (eg. error handling).
   * Filepath relative to generated file can be also specified.
   * @default urql
   */
  urqlImportFrom?: string;
}

export const plugin: PluginFunction<UrqlRawPluginConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: UrqlRawPluginConfig) => {
  const allAst = concatAST(
    documents.reduce((prev, v) => {
      return [...prev, v.content];
    }, [])
  );
  const operationsCount = allAst.definitions.filter(d => d.kind === Kind.OPERATION_DEFINITION);

  if (operationsCount.length === 0) {
    return '';
  }

  const allFragments = allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[];
  const visitor = new UrqlVisitor(allFragments, config) as any;
  const visitorResult = visit(allAst, { leave: visitor });

  return [visitor.getImports(), visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string')].join('\n');
};

export const validate: PluginValidateFn<any> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: UrqlRawPluginConfig, outputFile: string) => {
  if (config.withComponent === false) {
    if (extname(outputFile) !== '.ts' && extname(outputFile) !== '.tsx') {
      throw new Error(`Plugin "react-apollo" with "noComponents" requires extension to be ".ts" or ".tsx"!`);
    }
  } else {
    if (extname(outputFile) !== '.tsx') {
      throw new Error(`Plugin "react-apollo" requires extension to be ".tsx"!`);
    }
  }
};
