import { TypeScriptPluginConfig } from '@graphql-codegen/typescript';

export interface TypescriptOperationTypesPluginConfig extends Omit<TypeScriptPluginConfig, 'onlyOperationTypes'> {
  /**
   * @description This will cause the generator to not emit objects types, interfaces and unions. Only the used inputs,
   * enums and scalars will be emitted. Interacts well with `preResolveTypes: true` of the typescript-operations plugin
   * @default false
   *
   * @exampleMarkdown Override all definition types
   * <!-- TODO: this block loses indentation during generation docs, find why and fix -->
   * ```yml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript-operation-types
   *     config:
   *       omitObjectTypes: true
   * ```
   */
  omitObjectTypes?: boolean;
}
