import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates React Apollo components and HOC with TypeScript typings.
 *
 * It extends the basic TypeScript plugins: `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations` - and thus shares a similar configuration.
 */
export interface ReactApolloRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Customize the output by enabling/disabling the generated Component (deprecated since Apollo-Client v3). For more details: https://apollographql.com/docs/react/api/react/components
   * @default false
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-react-apollo
   *     config:
   *       withComponent: true
   * ```
   */
  withComponent?: boolean;
  /**
   * @description Customize the output by enabling/disabling the HOC (deprecated since Apollo-Client v3). For more details: https://apollographql.com/docs/react/api/react/hoc
   * @default false
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-react-apollo
   *     config:
   *       withHOC: true
   * ```
   */
  withHOC?: boolean;
  /**
   * @description Customized the output by enabling/disabling the generated React Hooks. For more details: https://apollographql.com/docs/react/api/react/hooks
   * @default true
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-react-apollo
   *     config:
   *       withHooks: true
   * ```
   */
  withHooks?: boolean;
  /**
   * @description Customized the output by enabling/disabling the generated mutation function signature.
   * @default true
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-react-apollo
   *     config:
   *       withMutationFn: true
   * ```
   */
  withMutationFn?: boolean;
  /**
   * @description Enable generating a function to be used with refetchQueries
   * @default false
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-react-apollo
   *     config:
   *       withRefetchFn: false
   * ```
   */
  withRefetchFn?: boolean;
  /**
   * @description Customize the package where apollo-react common lib is loaded from.
   * @default "@apollo/react-common"
   */
  apolloReactCommonImportFrom?: string;
  /**
   * @description Customize the package where apollo-react component lib is loaded from.
   * @default "@apollo/react-components"
   */
  apolloReactComponentsImportFrom?: string;
  /**
   * @description Customize the package where apollo-react HOC lib is loaded from.
   * @default "@apollo/react-hoc"
   */
  apolloReactHocImportFrom?: string;
  /**
   * @description Customize the package where apollo-react hooks lib is loaded from.
   * @default "@apollo/react-hooks"
   */
  apolloReactHooksImportFrom?: string;
  /**
   * @description You can specify a suffix that gets attached to the name of the generated component.
   * @default Component
   */
  componentSuffix?: string;
  /**
   * @description Sets the version of react-apollo.
   * If you are using the old (deprecated) package of `react-apollo`, please set this configuration to `2`.
   * If you are using Apollo-Client v3, please set this to `3`.
   * @default 3
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-react-apollo
   *     config:
   *       reactApolloVersion: 2
   * ```
   */
  reactApolloVersion?: 2 | 3;
  /**
   * @description Customized the output by enabling/disabling the generated result type.
   * @default true
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-react-apollo
   *     config:
   *       withResultType: true
   * ```
   */
  withResultType?: boolean;
  /**
   * @description Customized the output by enabling/disabling the generated mutation option type.
   * @default true
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-react-apollo
   *     config:
   *       withMutationOptionsType: true
   * ```
   */
  withMutationOptionsType?: boolean;
  /**
   * @description Allows you to enable/disable the generation of docblocks in generated code.
   * Some IDE's (like VSCode) add extra inline information with docblocks, you can disable this feature if your preferred IDE does not.
   * @default true
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-react-apollo
   *     config:
   *       addDocBlocks: true
   * ```
   */
  addDocBlocks?: boolean;

  defaultBaseOptions?: { [key: string]: string };

  hooksSuffix?: string;
}
