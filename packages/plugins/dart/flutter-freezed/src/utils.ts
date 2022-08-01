import {
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  ObjectTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { DirectiveMap, FreezedConfig, FreezedPluginConfig, TypeSpecificFreezedConfig } from './config';
import { FreezedDeclarationBlock, FreezedFactoryBlock } from './freezed-declaration-blocks';

export type ParameterType = 'positional' | 'named';
export type FieldType = FieldDefinitionNode | InputValueDefinitionNode;
export type FieldsType = FieldDefinitionNode[] | InputValueDefinitionNode[];
export type NodeType = ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode | UnionTypeDefinitionNode;
export type OptionName =
  // FreezedClassConfig
  | 'alwaysUseJsonKeyName'
  | 'assertNonNullableFields'
  | 'copyWith'
  | 'defaultUnionConstructor'
  | 'equal'
  | 'fromJsonToJson'
  | 'immutable'
  | 'makeCollectionsUnmodifiable'
  | 'mergeInputs'
  | 'mutableInputs'
  | 'privateEmptyConstructor'
  | 'unionKey'
  | 'unionValueCase';

export function transformDefinition(
  config: FreezedPluginConfig,
  freezedFactoryBlockRepository: FreezedFactoryBlockRepository,
  node: NodeType
) {
  // ignore these...
  if (['Query', 'Mutation', 'Subscription', ...config.ignoreTypes].includes(node.name.value)) {
    return '';
  }

  return new FreezedDeclarationBlock(config, freezedFactoryBlockRepository, node).init();
}

/**
 * returns the value of the FreezedConfig option
 * for a specific type if given typeName
 * or else fallback to the global FreezedConfig value
 */
export function getFreezedConfigValue(option: OptionName, config: FreezedPluginConfig, typeName: string = null) {
  if (typeName) {
    return config?.typeSpecificFreezedConfig?.[typeName]?.config?.[option] ?? getFreezedConfigValue(option, config);
  }
  return config?.globalFreezedConfig?.[option];
}

/** a class variant of the getFreezedConfigValue helper function
 *
 * returns the value of the FreezedConfig option
 * for a specific type if given typeName
 * or else fallback to the global FreezedConfig value
 */
export class FreezedConfigValue {
  constructor(private _config: FreezedPluginConfig, private _typeName: string = null) {
    this._config = _config;
    this._typeName = _typeName;
  }

  /**
   * returns the value of the FreezedConfig option
   * for a specific type if given typeName
   * or else fallback to the global FreezedConfig value
   */
  get(option: OptionName) {
    if (this._typeName) {
      return (
        this._config?.typeSpecificFreezedConfig?.[this._typeName]?.config?.[option] ??
        new FreezedConfigValue(this._config).get(option)
      );
    }
    return this._config?.globalFreezedConfig?.[option];
  }
}

export class FreezedImportBlock {
  _importFreezedAnnotation?: boolean = true;
  _importFoundation?: boolean = true;
  _jsonSerializable?: boolean;

  // TODO: the constructor should accept a node, and extract it shape and store it but return itself
  constructor(private _config: FreezedPluginConfig, private _fileName?: string) {
    // this._fileName = _fileName;
  }

  string(): string {
    return [
      this._importFreezedAnnotation && "import 'package:freezed_annotation/freezed_annotation.dart';",
      this._importFoundation && "import 'package:flutter/foundation.dart';",
      `part ${this.getFileName(this._fileName)}.dart;`,
      this._jsonSerializable && `part '${this.getFileName(this._fileName)}.g.dart';`,
    ].join('\n');
  }

  /** TODO: Work on the modularization
   *  returns the fileName without the extension.
   * if modular is set to, returns the value of fileName from the config
   */
  getFileName(fileName?: string) {
    return this._config.modular ? this._config.fileName : fileName.replace('.dart', '');
  }
}

/**
 * stores an instance of  FreezedFactoryBlock using the node names as the key
 * and returns that instance when replacing tokens
 * */
export class FreezedFactoryBlockRepository {
  _store: Record<string, FreezedFactoryBlock> = {};

  register(key: string, value: FreezedFactoryBlock): FreezedFactoryBlock {
    this._store[key] = value;
    return value;
  }

  retrieve(key: string, name: string, typeName: string = null): FreezedFactoryBlock {
    return this._store[key].setKey(key).setName(name).setNamedConstructor(typeName).init();
  }
}

/** initializes a FreezedPluginConfig with the defaults values */
export class DefaultFreezedPluginConfig implements FreezedPluginConfig {
  customScalars?: { [name: string]: string };
  directiveMap?: DirectiveMap[];
  fileName?: string;
  globalFreezedConfig?: FreezedConfig;
  typeSpecificFreezedConfig?: Record<string, TypeSpecificFreezedConfig>;
  ignoreTypes?: string[];
  interfaceNamePrefix?: string;
  interfaceNameSuffix?: string;
  lowercaseEnums?: boolean;
  modular?: boolean;

  constructor(config: FreezedPluginConfig = {}) {
    Object.assign(this, {
      customScalars: config.customScalars ?? {},
      directiveMap: config.directiveMap ?? [],
      fileName: config.fileName ?? 'app_models',
      globalFreezedConfig: config.globalFreezedConfig ?? new DefaultFreezedConfig(),
      typeSpecificFreezedConfig: config.typeSpecificFreezedConfig ?? {},
      ignoreTypes: config.ignoreTypes ?? [],
      interfaceNamePrefix: config.interfaceNamePrefix ?? '',
      interfaceNameSuffix: config.interfaceNameSuffix ?? 'Interface',
      lowercaseEnums: config.lowercaseEnums ?? true,
      modular: config.modular ?? true,
    });
  }
}

/** initializes a FreezedConfig with the defaults values */
export class DefaultFreezedConfig implements FreezedConfig {
  alwaysUseJsonKeyName?: boolean;
  assertNonNullableFields?: boolean;
  copyWith?: boolean;
  defaultUnionConstructor?: boolean;
  equal?: boolean;
  fromJsonToJson?: boolean;
  immutable?: boolean;
  makeCollectionsUnmodifiable?: boolean;
  mergeInputs?: string[];
  mutableInputs?: boolean;
  privateEmptyConstructor?: boolean;
  unionKey?: string;
  unionValueCase?: 'FreezedUnionCase.camel' | 'FreezedUnionCase.pascal';

  constructor() {
    Object.assign(this, {
      alwaysUseJsonKeyName: false,
      assertNonNullableFields: false,
      copyWith: null,
      defaultUnionConstructor: true,
      equal: null,
      fromJsonToJson: true,
      immutable: true,
      makeCollectionsUnmodifiable: null,
      mergeInputs: [],
      mutableInputs: true,
      privateEmptyConstructor: true,
      unionKey: null,
      unionValueCase: null,
    });
  }
}
