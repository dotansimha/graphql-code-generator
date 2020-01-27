import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';
import { visit, concatAST, GraphQLSchema, Kind, FragmentDefinitionNode } from 'graphql';
import { TypeScriptDocumentsVisitor } from './visitor';
import { RawDocumentsConfig, LoadedFragment, optimizeOperations } from '@graphql-codegen/visitor-plugin-common';
import { AvoidOptionalsConfig } from '@graphql-codegen/typescript';

export interface TypeScriptDocumentsPluginConfig extends RawDocumentsConfig {
  /**
   * @name avoidOptionals
   * @type boolean
   * @description This will cause the generator to avoid using TypeScript optionals (`?`) on types,
   * so the following definition: `type A { myField: String }` will output `myField: Maybe<string>`
   * instead of `myField?: Maybe<string>`.
   * @default false
   *
   * @example Override all definition types
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *  config:
   *    avoidOptionals: true
   * ```
   *
   * @example Override only specific definition types
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    avoidOptionals:
   *      inputValue: true
   *      object: true
   * ```
   */
  avoidOptionals?: boolean | AvoidOptionalsConfig;
  /**
   * @name immutableTypes
   * @type boolean
   * @description Generates immutable types by adding `readonly` to properties and uses `ReadonlyArray`.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *  config:
   *    immutableTypes: true
   * ```
   */
  immutableTypes?: boolean;
  /**
   * @name flattenGeneratedTypes
   * @type boolean
   * @description Flatten fragment spread and inline fragments into a simple selection set before generating.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *  config:
   *    flattenGeneratedTypes: true
   * ```
   */
  flattenGeneratedTypes?: boolean;
  /**
   * @name noExport
   * @type boolean
   * @description Set the to `true` in order to generate output without `export` modifier.
   * This is useful if you are generating `.d.ts` file and want it to be globally available.
   * @default false
   *
   * @example Disable all export from a file
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    noExport: true
   * ```
   */
  noExport?: boolean;
  globalNamespace?: boolean;
}

export const plugin: PluginFunction<TypeScriptDocumentsPluginConfig> = (schema: GraphQLSchema, rawDocuments: Types.DocumentFile[], config: TypeScriptDocumentsPluginConfig) => {
  const documents = config.flattenGeneratedTypes ? optimizeOperations(schema, rawDocuments) : rawDocuments;
  const allAst = concatAST(documents.map(v => v.document));

  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(fragmentDef => ({ node: fragmentDef, name: fragmentDef.name.value, onType: fragmentDef.typeCondition.name.value, isExternal: false })),
    ...(config.externalFragments || []),
  ];

  const visitorResult = visit(allAst, {
    leave: new TypeScriptDocumentsVisitor(schema, config, allFragments),
  });

  const result = visitorResult.definitions.join('\n');

  if (config.globalNamespace) {
    return `
    declare global { 
      ${result} 
    }
          `;
  } else {
    return result;
  }
};

export { TypeScriptDocumentsVisitor };
