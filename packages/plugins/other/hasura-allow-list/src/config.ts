export interface HasuraAllowListPluginConfig {
  /**
   * @default allowed-queries
   * @description Choose the collection name to be generated. Defaults to allowed-queries
   */
  collection_name?: string;
  /**
   * @default 3
   * @description Target metadata config version. Supported versions are 2 and 3.
   * This is mostly for future proofing, currently has no impact as both versions use the same format.
   * The default value _will change_ in the future if/when newer config versions are released.
   */
  config_version?: 2 | 3;
  /**
   * @default false
   * @description Whether to source fragments per-document, or globally. If set, will enforce fragment name uniqueness
   */
  globalFragments?: boolean;
}
