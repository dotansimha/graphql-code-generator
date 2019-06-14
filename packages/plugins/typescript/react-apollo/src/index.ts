import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { visit, GraphQLSchema, concatAST, Kind, FragmentDefinitionNode } from 'graphql';
import { RawClientSideBasePluginConfig, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { ReactApolloVisitor } from './visitor';
import { extname } from 'path';

export interface ReactApolloRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @name withHOC
   * @type boolean
   * @description Customized the output by enabling/disabling the HOC.
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
   *    withHOC: false
   * ```
   */
  withHOC?: boolean;
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
   * @name withMutationFn
   * @type boolean
   * @description Customized the output by enabling/disabling the generated mutation function signature.
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
   *    withMutationFn: true
   * ```
   */
  withMutationFn?: boolean;

  /**
   * @name hooksImportFrom
   * @type string
   * @description You can specify alternative module that is exports `useQuery` `useMutation` and `useSubscription`.
   * This is useful for further abstraction of some common tasks (eg. error handling).
   * Filepath relative to generated file can be also specified.
   * @default react-apollo-hooks
   */
  hooksImportFrom?: string;
  /**
   * @name reactApolloImportFrom
   * @type string
   * @description You can specify module that exports components `Query`, `Mutation`, `Subscription` and HOCs
   * This is useful for further abstraction of some common tasks (eg. error handling).
   * Filepath relative to generated file can be also specified.
   * @default react-apollo
   */
  reactApolloImportFrom?: string;
  componentSuffix?: string;
  /**
   * @name componentSuffix
   * @type string
   * @description You can specify a suffix that gets attached to the name of the generated component.
   * @default Component
   */
}

export const plugin: PluginFunction<ReactApolloRawPluginConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: ReactApolloRawPluginConfig) => {
  const allAst = concatAST(
    documents.reduce((prev, v) => {
      return [...prev, v.content];
    }, [])
  );

  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(fragmentDef => ({ node: fragmentDef, name: fragmentDef.name.value, onType: fragmentDef.typeCondition.name.value, isExternal: false })),
    ...(config.externalFragments || []),
  ];

  const visitor = new ReactApolloVisitor(allFragments, config) as any;
  const visitorResult = visit(allAst, { leave: visitor });

  return {
    prepend: visitor.getImports(),
    content: [visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string')].join('\n'),
  };
};

export const validate: PluginValidateFn<any> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: ReactApolloRawPluginConfig, outputFile: string) => {
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

export { ReactApolloVisitor };
