import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { visit, concatAST, GraphQLSchema, Kind, FragmentDefinitionNode } from 'graphql';
import { FlowDocumentsVisitor } from './visitor';
import { RawDocumentsConfig, LoadedFragment } from '@graphql-codegen/visitor-plugin-common';

export interface FlowDocumentsPluginConfig extends RawDocumentsConfig {
  /**
   * @name useFlowExactObjects
   * @type boolean
   * @description Generates Flow types as Exact types.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - flow
   *  config:
   *    useFlowExactObjects: true
   * ```
   */
  useFlowExactObjects?: boolean;
  /**
   * @name useFlowReadOnlyTypes
   * @type boolean
   * @description Generates read-only Flow types
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - flow
   *  config:
   *    useFlowReadOnlyTypes: true
   * ```
   */
  useFlowReadOnlyTypes?: boolean;
}

export const plugin: PluginFunction<FlowDocumentsPluginConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: FlowDocumentsPluginConfig) => {
  let prefix = `type $Pick<Origin: Object, Keys: Object> = $ObjMapi<Keys, <Key>(k: Key) => $ElementType<Origin, Key>>;\n`;

  const allAst = concatAST(
    documents.reduce((prev, v) => {
      return [...prev, v.content];
    }, [])
  );

  const allFragments: LoadedFragment[] = (allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(fragmentDef => ({ name: fragmentDef.name.value, onType: fragmentDef.typeCondition.name.value }));

  const visitorResult = visit(allAst, {
    leave: new FlowDocumentsVisitor(schema, config, allFragments),
  });

  return [prefix, ...visitorResult.definitions].join('\n');
};
