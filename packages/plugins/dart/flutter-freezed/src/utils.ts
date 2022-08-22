import {
  ArgumentNode,
  DirectiveNode,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  ObjectTypeDefinitionNode,
  UnionTypeDefinitionNode
} from "graphql";
import {
  ApplyDecoratorOn,
  CustomDecorator,
  FreezedConfig,
  FlutterFreezedPluginConfig,
  TypeSpecificFreezedConfig
} from "./config.js";
import {
  FreezedDeclarationBlock,
  FreezedFactoryBlock
} from "./freezed-declaration-blocks/index.js";

export type FieldType = FieldDefinitionNode | InputValueDefinitionNode;

export type NodeType =
  | ObjectTypeDefinitionNode
  | InputObjectTypeDefinitionNode
  | UnionTypeDefinitionNode
  | EnumTypeDefinitionNode;

export type OptionName =
  // FreezedClassConfig
  | "alwaysUseJsonKeyName"
  | "copyWith"
  | "customDecorators"
  | "equal"
  | "fromJsonToJson"
  | "immutable"
  | "makeCollectionsUnmodifiable"
  | "mergeInputs"
  | "mutableInputs"
  | "privateEmptyConstructor"
  | "unionKey"
  | "unionValueCase";

export function transformDefinition(
  config: FlutterFreezedPluginConfig,
  freezedFactoryBlockRepository: FreezedFactoryBlockRepository,
  node: NodeType
) {
  // ignore these...
  if (
    [
      "Query",
      "Mutation",
      "Subscription",
      ...(config?.ignoreTypes ?? [])
    ].includes(node.name.value)
  ) {
    return "";
  }

  return new FreezedDeclarationBlock(
    config,
    freezedFactoryBlockRepository,
    node
  ).init();
}

/**
 * returns the value of the FreezedConfig option
 * for a specific type if given typeName
 * or else fallback to the global FreezedConfig value
 */
export function getFreezedConfigValue(
  option: OptionName,
  config: FlutterFreezedPluginConfig,
  typeName?: string | undefined
): any {
  if (typeName) {
    return (
      config?.typeSpecificFreezedConfig?.[typeName]?.config?.[option] ??
      getFreezedConfigValue(option, config)
    );
  }
  return config?.globalFreezedConfig?.[option];
}

/**
 * @description filters the customDirectives to return those that are applied on a list of blocks
 */
export function getCustomDecorators(
  config: FlutterFreezedPluginConfig,
  appliesOn: ApplyDecoratorOn[],
  nodeName?: string | undefined,
  fieldName?: string | undefined
): CustomDecorator {
  const filteredCustomDecorators: CustomDecorator = {};
  const globalCustomDecorators =
    config?.globalFreezedConfig?.customDecorators ?? {};
  let customDecorators: CustomDecorator = { ...globalCustomDecorators };

  if (nodeName) {
    const typeConfig = config?.typeSpecificFreezedConfig?.[nodeName];
    const typeSpecificCustomDecorators =
      typeConfig?.config?.customDecorators ?? {};
    customDecorators = { ...customDecorators, ...typeSpecificCustomDecorators };

    if (fieldName) {
      const fieldSpecificCustomDecorators =
        typeConfig?.fields?.[fieldName]?.customDecorators ?? {};
      customDecorators = {
        ...customDecorators,
        ...fieldSpecificCustomDecorators
      };
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
        if (value && value.mapsToFreezedAs !== "custom") {
          return true;
        }
        return false;
      })
      // transform each directive to string
      .map(d => directiveToString(d, customDecorators))
  ];

  // for  decorators that mapsToFreezedAs === 'custom'
  Object.entries(customDecorators).forEach(([key, value]) => {
    if (value.mapsToFreezedAs === "custom") {
      const args = value?.arguments;
      // if the custom directives have arguments,
      if (args && args !== []) {
        // join them with a comma in the parenthesis
        result = [...result, `${key}(${args.join(", ")})\n`];
      } else {
        // else return the customDecorator key just as it is
        result = [...result, key + "\n"];
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
function directiveToString(
  directive: DirectiveNode,
  customDecorators: CustomDecorator
) {
  const key = directive.name.value;
  const value = customDecorators[key];
  if (value.mapsToFreezedAs === "directive") {
    // get the directive's arguments
    const directiveArgs: readonly ArgumentNode[] = directive?.arguments ?? [];
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
      return `@${directive.name.value}(${args?.join(", ")})\n`;
    }
  } else if (value.mapsToFreezedAs === "@Default") {
    const defaultValue =
      directive?.arguments?.[argToInt(value?.arguments?.[0] ?? "0")];
    if (defaultValue) {
      return `@Default(value: ${defaultValue})\n`;
    }
  }
  // returns either "@deprecated" || "final".
  // `final` to be filtered from the decorators array when applying the decorators
  return value.mapsToFreezedAs + "\n";
}

/** transforms string template: "$0" into an integer: 1 */
function argToInt(arg: string) {
  const parsedIndex = Number.parseInt(arg.replace("$", "").trim() ?? "0"); // '$1 => 1
  return parsedIndex ? parsedIndex : 0;
}

/** returns freezed import statements */
export function addFreezedImportStatements(fileName: string) {
  return [
    "import 'package:freezed_annotation/freezed_annotation.dart';\n",
    "import 'package:flutter/foundation.dart';\n\n",
    `part '${fileName.replace(/\.dart/g, "")}.freezed.dart';\n`,
    `part '${fileName.replace(/\.dart/g, "")}.g.dart';\n\n`
  ].join("");
}

/** a class variant of the getFreezedConfigValue helper function
 *
 * returns the value of the FreezedConfig option
 * for a specific type if given typeName
 * or else fallback to the global FreezedConfig value
 */
export class FreezedConfigValue {
  constructor(
    private _config: FlutterFreezedPluginConfig,
    private _typeName: string | undefined
  ) {
    this._config = _config;
    this._typeName = _typeName;
  }

  /**
   * returns the value of the FreezedConfig option
   * for a specific type if given typeName
   * or else fallback to the global FreezedConfig value
   */
  get<T>(option: OptionName): T {
    return getFreezedConfigValue(option, this._config, this._typeName) as T;
  }
}

/**
 * stores an instance of  FreezedFactoryBlock using the node names as the key
 * and returns that instance when replacing tokens
 * */
export class FreezedFactoryBlockRepository {
  _store: Record<string, FreezedFactoryBlock> = {};

  get(key: string): FreezedFactoryBlock | undefined {
    return this._store[key];
  }

  register(key: string, value: FreezedFactoryBlock): FreezedFactoryBlock {
    this._store[key] = value;
    return value;
  }

  retrieve(
    key: string,
    appliesOn: string,
    name: string,
    typeName: string | undefined
  ): string {
    if (this._store[key]) {
      return (
        this._store[key]
          .setDecorators(appliesOn, key)
          .setKey(key)
          .setName(name)
          .setNamedConstructor(typeName)
          .init()
          .toString() + "\n"
      );
    }
    return "";
  }
}

/** initializes a FreezedPluginConfig with the defaults values */
export class DefaultFreezedPluginConfig implements FlutterFreezedPluginConfig {
  camelCasedEnums?: boolean;
  customScalars?: { [name: string]: string };
  fileName?: string;
  globalFreezedConfig?: FreezedConfig;
  typeSpecificFreezedConfig?: Record<string, TypeSpecificFreezedConfig>;
  ignoreTypes?: string[];

  constructor(config: FlutterFreezedPluginConfig = {}) {
    Object.assign(this, {
      camelCasedEnums: config.camelCasedEnums ?? true,
      customScalars: config.customScalars ?? {},
      fileName: config.fileName ?? "app_models",
      globalFreezedConfig: {
        ...new DefaultFreezedConfig(),
        ...(config.globalFreezedConfig ?? {})
      },
      typeSpecificFreezedConfig: config.typeSpecificFreezedConfig ?? {},
      ignoreTypes: config.ignoreTypes ?? []
    });
  }
}

/** initializes a FreezedConfig with the defaults values */
export class DefaultFreezedConfig implements FreezedConfig {
  alwaysUseJsonKeyName?: boolean;
  copyWith?: boolean;
  customDecorators?: CustomDecorator;
  equal?: boolean;
  fromJsonToJson?: boolean;
  immutable?: boolean;
  makeCollectionsUnmodifiable?: boolean;
  mergeInputs?: string[];
  mutableInputs?: boolean;
  privateEmptyConstructor?: boolean;
  unionKey?: string;
  unionValueCase?: "FreezedUnionCase.camel" | "FreezedUnionCase.pascal";

  constructor() {
    Object.assign(this, {
      alwaysUseJsonKeyName: false,
      copyWith: undefined,
      customDecorators: {},
      equal: undefined,
      fromJsonToJson: true,
      immutable: true,
      makeCollectionsUnmodifiable: undefined,
      mergeInputs: [],
      mutableInputs: true,
      privateEmptyConstructor: false,
      unionKey: undefined,
      unionValueCase: undefined
    });
  }
}
