import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { visit, GraphQLSchema, concatAST, Kind, FragmentDefinitionNode, DocumentNode } from 'graphql';
import { RawClientSideBasePluginConfig, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import { VueApolloVisitor } from './visitor';
import { extname } from 'path';

export interface VueApolloRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @name withCompositionFunctions
   * @type boolean
   * @description Customized the output by enabling/disabling the generated Vue composition functions.
   * @default true
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-vue-apollo
   *  config:
   *    withCompositionFunctions: true
   * ```
   */
  withCompositionFunctions?: boolean;

  /**
   * @name vueApolloComposableImportFrom
   * @type string
   * @default @vue/apollo-composable
   */
  vueApolloComposableImportFrom?: string;

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
   *    - typescript-vue-apollo
   *  config:
   *    addDocBlocks: true
   *
   */
  addDocBlocks?: boolean;
}

export const plugin: PluginFunction<VueApolloRawPluginConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: VueApolloRawPluginConfig) => {
  const allAst = concatAST(
    documents.reduce((accumulator: DocumentNode[], currentDocument) => {
      return [...accumulator, currentDocument.content];
    }, [])
  );

  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(fragmentDef => ({ node: fragmentDef, name: fragmentDef.name.value, onType: fragmentDef.typeCondition.name.value, isExternal: false })),
    ...(config.externalFragments || []),
  ];

  const visitor = new VueApolloVisitor(schema, allFragments, config, documents);
  const visitorResult = visit(allAst, { leave: visitor });

  return {
    prepend: visitor.getImports(),
    content: [visitor.fragments, ...visitorResult.definitions.filter((definition: string) => typeof definition === 'string')].join('\n'),
  };
};

export const validate: PluginValidateFn<any> = async (_schema: GraphQLSchema, _documents: Types.DocumentFile[], _config: VueApolloRawPluginConfig, outputFile: string) => {
  if (extname(outputFile) !== '.ts') {
    throw new Error(`Plugin "vue-apollo" requires extension to be ".ts"!`);
  }
};

export { VueApolloVisitor };
