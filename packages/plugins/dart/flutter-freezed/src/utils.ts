import {
  ConstArgumentNode,
  ConstDirectiveNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  ObjectTypeDefinitionNode,
  UnionTypeDefinitionNode,
} from 'graphql';
import { FreezedConfig, FreezedPluginConfig, TypeSpecificFreezedConfig } from './config';
import { FreezedDeclarationBlock, FreezedFactoryBlock } from './freezed-declaration-blocks';

export type FieldType = FieldDefinitionNode | InputValueDefinitionNode;
export type NodeType = ObjectTypeDefinitionNode | InputObjectTypeDefinitionNode | UnionTypeDefinitionNode;
export type OptionName =
  // FreezedClassConfig
  | 'alwaysUseJsonKeyName'
  | 'assertNonNullableFields'
  | 'copyWith'
  | 'customDecorators'
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

export type ApplyDecoratorOn =
  | 'class'
  | 'class_factory'
  | 'union_factory'
  | 'class_factory_parameter'
  | 'union_factory_parameter';

export type DirectiveToFreezed = {
  /**
   * @name arguments
   * @description arrange the arguments of the directive in order of how the should be outputted
   * @default null
   * @exampleMarkdown
   * ```yml
   * arguments: [$0] # $0 is the first argument, $1 is the 2nd ...
   * ```
   */
  arguments?: string[]; //['$0']

  /**
   * @description Specify where the decorator should be applied
   */
  applyOn: ApplyDecoratorOn[];

  /** maps to a Freezed decorator or use `custom` to use a custom decorator */
  mapsToFreezedAs: '@Default' | '@deprecated' | 'final' | 'directive' | 'custom';
};

export type CustomDecorator = Record<string, DirectiveToFreezed>; // TODO: directives can have a name, and one or many values/arguments

export function transformDefinition(
  config: FreezedPluginConfig,
  freezedFactoryBlockRepository: FreezedFactoryBlockRepository,
  node: NodeType
) {
  // ignore these...
  if (['Query', 'Mutation', 'Subscription', ...(config?.ignoreTypes ?? [])].includes(node.name.value)) {
    return '';
  }

  return new FreezedDeclarationBlock(config, freezedFactoryBlockRepository, node).init();
}

/**
 * returns the value of the FreezedConfig option
 * for a specific type if given typeName
 * or else fallback to the global FreezedConfig value
 */
export function getFreezedConfigValue(
  option: OptionName,
  config: FreezedPluginConfig,
  typeName?: string | undefined
): any {
  if (typeName) {
    return config?.typeSpecificFreezedConfig?.[typeName]?.config?.[option] ?? getFreezedConfigValue(option, config);
  }
  return config?.globalFreezedConfig?.[option];
}

/**
 * @description filters the customDirectives to return those that are applied on a list of blocks
 */
export function getCustomDecorators(
  config: FreezedPluginConfig,
  appliesOn: ApplyDecoratorOn[],
  nodeName?: string | undefined,
  fieldName?: string | undefined
): CustomDecorator {
  const filteredCustomDecorators: CustomDecorator = {};
  const globalCustomDecorators = config?.globalFreezedConfig?.customDecorators ?? {};
  let customDecorators: CustomDecorator = { ...globalCustomDecorators };

  if (nodeName) {
    const typeConfig = config?.typeSpecificFreezedConfig?.[nodeName];
    const typeSpecificCustomDecorators = typeConfig?.config?.customDecorators ?? {};
    customDecorators = { ...customDecorators, ...typeSpecificCustomDecorators };

    if (fieldName) {
      const fieldSpecificCustomDecorators = typeConfig?.fields?.[fieldName]?.customDecorators ?? {};
      customDecorators = { ...customDecorators, ...fieldSpecificCustomDecorators };
    }
  }

  Object.entries(customDecorators).forEach(([key, value]) =>
    value?.applyOn?.forEach(a => {
      if (appliesOn.includes(a)) {
        filteredCustomDecorators[key] = value;
      }
    })
  );

  return filteredCustomDecorators;
}

export function transformCustomDecorators(
  customDecorators: CustomDecorator,
  node?: NodeType | undefined,
  field?: FieldType | undefined
): string[] {
  let result: string[] = [];

  result = [
    ...result,
    ...(node?.directives ?? [])
      .concat(field?.directives ?? [])
      // extract only the directives whose names were specified as keys
      // and have values that not undefined or null in the customDecorator record
      .filter(d => {
        const key = d.name.value;
        const value = customDecorators[key] ?? customDecorators[`@${key}`];
        if (value && value.mapsToFreezedAs !== 'custom') {
          return true;
        }
        return false;
      })
      // transform each directive to string
      .map(d => directiveToString(d, customDecorators)),
  ];

  // for  decorators that mapsToFreezedAs === 'custom'
  Object.entries(customDecorators).forEach(([key, value]) => {
    if (value.mapsToFreezedAs === 'custom') {
      const args = value?.arguments;
      // if the custom directives have arguments,
      if (args && args !== []) {
        // join them with a comma in the parenthesis
        result = [...result, `${key}(${args.join(', ')})`];
      } else {
        // else return the customDecorator key just as it is
        result = [...result, key];
      }
    }
  });

  return result;
}

/**
 * transforms the directive into a decorator array
 * this decorator array might contain a `final` string which would be filtered out
 * and used to mark the parameter block as final
 */
function directiveToString(directive: ConstDirectiveNode, customDecorators: CustomDecorator) {
  const key = directive.name.value;
  const value = customDecorators[key];
  if (value.mapsToFreezedAs === 'directive') {
    // get the directive's arguments
    const directiveArgs: readonly ConstArgumentNode[] = directive?.arguments ?? [];
    // extract the directive's argument using the template index: ["$0", "$1", ...]
    // specified in the customDecorator.arguments array
    const args = value?.arguments
      ?.filter(a => directiveArgs[argToInt(a)])
      // transform the template index: ["$0", "$1", ...] into the arguments
      .map(a => directiveArgs[argToInt(a)])
      // transform the arguments into string array of ["name: value" , "name: value", ...]
      .map(a => `${a.name}: ${a.value}`);

    // if the args is not empty
    if (args !== []) {
      // returns "@directiveName(argName: argValue, argName: argValue ...)"
      return `@${directive.name.value}(${args?.join(', ')})`;
    }
  } else if (value.mapsToFreezedAs === '@Default') {
    const defaultValue = directive?.arguments?.[argToInt(value?.arguments?.[0] ?? '0')];
    if (defaultValue) {
      return `@Default(value: ${defaultValue})`;
    }
  }
  // returns either "@deprecated" || "final".
  // `final` to be filtered from the decorators array when applying the decorators
  return value.mapsToFreezedAs;
}

/** transforms string template: "$0" into an integer: 1 */
function argToInt(arg: string) {
  const parsedIndex = Number.parseInt(arg.replace('$', '').trim() ?? '0'); // '$1 => 1
  return parsedIndex ? parsedIndex : 0;
}

/** a class variant of the getFreezedConfigValue helper function
 *
 * returns the value of the FreezedConfig option
 * for a specific type if given typeName
 * or else fallback to the global FreezedConfig value
 */
export class FreezedConfigValue {
  constructor(private _config: FreezedPluginConfig, private _typeName: string | undefined) {
    this._config = _config;
    this._typeName = _typeName;
  }

  /**
   * returns the value of the FreezedConfig option
   * for a specific type if given typeName
   * or else fallback to the global FreezedConfig value
   */
  get(option: OptionName) {
    return getFreezedConfigValue(option, this._config, this._typeName);
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
    return this._config.modular ? this._config.fileName : fileName?.replace('.dart', '');
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

  retrieve(key: string, appliesOn: string, name: string, typeName: string | undefined): FreezedFactoryBlock {
    return this._store[key]
      .setDecorators(appliesOn, key)
      .setKey(key)
      .setName(name)
      .setNamedConstructor(typeName)
      .init();
  }
}

/** initializes a FreezedPluginConfig with the defaults values */
export class DefaultFreezedPluginConfig implements FreezedPluginConfig {
  customScalars?: { [name: string]: string };
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
      fileName: config.fileName ?? 'app_models',
      globalFreezedConfig: { ...new DefaultFreezedConfig(), ...(config.globalFreezedConfig ?? {}) },
      typeSpecificFreezedConfig: config.typeSpecificFreezedConfig ?? {}, //TODO: Same thing like the global above
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
  customDecorators?: CustomDecorator;
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
      customDecorators: {},
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
