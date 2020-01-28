import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';
export interface ReactApolloRawPluginConfig extends RawClientSideBasePluginConfig {
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
   * @name apolloReactCommonImportFrom
   * @type string
   * @default @apollo/react-common
   */
  apolloReactCommonImportFrom?: string;
  /**
   * @name apolloReactComponentsImportFrom
   * @type string
   * @default @apollo/react-components
   */
  apolloReactComponentsImportFrom?: string;
  /**
   * @name apolloReactHocImportFrom
   * @type string
   * @default @apollo/react-hoc
   */
  apolloReactHocImportFrom?: string;
  /**
   * @name apolloReactHooksImportFrom
   * @type string
   * @default @apollo/react-hooks
   */
  apolloReactHooksImportFrom?: string;
  /**
   * @name componentSuffix
   * @type string
   * @description You can specify a suffix that gets attached to the name of the generated component.
   * @default Component
   */
  componentSuffix?: string;
  /**
   * @name reactApolloVersion
   * @type 2 | 3
   * @description Sets the version of react-apollo.
   * @default 2
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
   *    reactApolloVersion: 3
   * ```
   */
  reactApolloVersion?: 2 | 3;
  /**
   * @name withResultType
   * @type boolean
   * @description Customized the output by enabling/disabling the generated result type.
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
   *    withResultType: true
   * ```
   */
  withResultType?: boolean;
  /**
   * @name withMutationOptionsType
   * @type boolean
   * @description Customized the output by enabling/disabling the generated mutation option type.
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
   *    withMutationOptionsType: true
   *
   */
  withMutationOptionsType?: boolean;
  /**
   * @name addDocBlocks
   * @type boolean
   * @description Allows you to enable/disable the generation of docblocks in generated code.
   * Some IDE's (like VSCode) add extra inline information with docblocks, you can disable this feature if your prefered IDE does not.
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
   *    addDocBlocks: true
   *
   */
  addDocBlocks?: boolean;
}
