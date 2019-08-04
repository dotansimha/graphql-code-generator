import { GraphQLSchema, concatAST, visit } from 'graphql';
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { RawConfig } from '@graphql-codegen/visitor-plugin-common';
import { CompatabilityPluginVisitor } from './visitor';

export interface CompatabilityPluginRawConfig extends RawConfig {
  /**
   * @name noNamespaces
   * @type boolean
   * @description Does not generate TypeScript `namepsace`s and uses the operation name as prefix.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-compatibility
   *  config:
   *    noNamespaces: true
   * ```
   */
  noNamespaces?: boolean;
  /**
   * @name strict
   * @type boolean
   * @description Make sure to genereate code that compatible with TypeScript strict mode.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-compatibility
   *  config:
   *    strict: true
   * ```
   */
  strict?: boolean;
  /**
   * @name preResolveTypes
   * @type boolean
   * @description Avoid using `Pick` in `typescript-operations` and make sure to optimize this package as well.
   * @default false
   *
   */
  preResolveTypes?: boolean;
}

const REACT_APOLLO_PLUGIN_NAME = 'typescript-react-apollo';

export const plugin: PluginFunction<CompatabilityPluginRawConfig> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: CompatabilityPluginRawConfig, additionalData): Promise<string> => {
  const allAst = concatAST(
    documents.reduce((prev, v) => {
      return [...prev, v.content];
    }, [])
  );

  const reactApollo = ((additionalData || {}).allPlugins || []).find(p => Object.keys(p)[0] === REACT_APOLLO_PLUGIN_NAME);
  const visitor = new CompatabilityPluginVisitor(config, schema, {
    reactApollo: reactApollo
      ? {
          ...(reactApollo[REACT_APOLLO_PLUGIN_NAME] as object),
          ...config,
        }
      : null,
  });

  const visitorResult = visit(allAst, {
    leave: visitor as any,
  });

  const discriminateUnion = `type DiscriminateUnion<T, U> = T extends U ? T : never;\n`;
  const requireField = `type RequireField<T, TNames extends string> = T & { [P in TNames]: (T & { [name: string]: never })[P] };\n`;
  const result: string = visitorResult.definitions.filter(a => a && typeof a === 'string').join('\n');

  return result.includes('DiscriminateUnion') ? [discriminateUnion, requireField, result].join('\n') : result;
};
