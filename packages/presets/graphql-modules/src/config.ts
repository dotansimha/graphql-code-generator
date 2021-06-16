export type ModulesConfig = {
  /**
   * @name baseTypesPath
   * @type string
   * @description Required, should point to the base schema types file.
   * The key of the output is used a the base path for this file.
   *
   * @example
   * ```yml
   * generates:
   * src/:
   *  preset: modules
   *  presetConfig:
   *    baseTypesPath: types.ts
   *  plugins:
   *    - typescript-resolvers
   * ```
   */
  baseTypesPath: string;
  /**
   * @name importBaseTypesFrom
   * @type string
   * @description Overrides the package import for the base types. Use this if you are within a monorepo and you wish
   * to import the base types directly from a different package, and not from a relative path.
   *
   */
  importBaseTypesFrom?: string;
  /**
   * @name cwd
   * @type string
   * @description Optional, override the `cwd` of the execution. We are using `cwd` to figure out the imports between files. Use this if your execution path is not your project root directory.
   * @default process.cwd()
   *
   * @example
   * ```yml
   * generates:
   * src/:
   *  preset: modules
   *  presetConfig:
   *    baseTypesPath: types.ts
   *    cwd: /some/path
   *  plugins:
   *    - typescript-resolvers
   * ```
   */
  cwd?: string;
  /**
   * @name importTypesNamespace
   * @type string
   * @description Optional, override the name of the import namespace used to import from the `baseTypesPath` file.
   * @default Types
   *
   * @example
   * ```yml
   * generates:
   * src/:
   *  preset: modules
   *  presetConfig:
   *    baseTypesPath: types.ts
   *    importTypesNamespace: core
   *  plugins:
   *    - typescript-resolvers
   * ```
   */
  importTypesNamespace?: string;
  /**
   * @name filename
   * @type string
   * @description Required, sets the file name for the generated files.
   *
   * @example
   * ```yml
   * generates:
   * src/:
   *  preset: modules
   *  presetConfig:
   *    baseTypesPath: types.ts
   *    filename: types.ts
   *  plugins:
   *    - typescript-operations
   *    - typescript-react-apollo
   * ```
   */
  filename: string;
  /**
   * @name encapsulateModuleTypes
   * @type string
   * @default namespace
   * @description Configure how to encapsulate the module types, to avoid confusion.
   *
   * `namespace` (default): will wrap all types in a TypeScript namespace, using the module name.
   * `prefix`: will prefix all types from a specific module with the module name.
   * `none`: will skip encapsulation, and generate type as-is.
   *
   * @example
   * ```yml
   * generates:
   * src/:
   *  preset: modules
   *  presetConfig:
   *    baseTypesPath: types.ts
   *    filename: types.ts
   *  plugins:
   *    - typescript-operations
   *    - typescript-react-apollo
   * ```
   */
  encapsulateModuleTypes: 'prefix' | 'namespace' | 'none';
};
