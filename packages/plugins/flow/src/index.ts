import { Types, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { parse, printSchema, visit, GraphQLSchema } from 'graphql';
import { FlowVisitor } from './visitor';
import { RawTypesConfig } from '@graphql-codegen/visitor-plugin-common';

export * from './visitor';
export * from './flow-variables-to-object';

export interface FlowPluginConfig extends RawTypesConfig {
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

export const plugin: PluginFunction<FlowPluginConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: FlowPluginConfig) => {
  const header = `/* @flow */\n\n`;
  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
  const visitor = new FlowVisitor(schema, config);

  const visitorResult = visit(astNode, {
    leave: visitor,
  });

  return [header, visitor.scalarsDefinition, ...visitorResult.definitions].join('\n');
};
