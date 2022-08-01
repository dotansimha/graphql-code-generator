export interface FreezedConfig {
  /**
   * @name alwaysUseJsonKeyName
   * @description Use @JsonKey(name: 'name') even if the name is already camelCased
   * @default false
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       alwaysUseJsonKeyName: true
   *
   * ```
   */

  alwaysUseJsonKeyName?: boolean;

  /**
   * @name assertNonNullableFields
   * @description makes non-nullable fields optional properties in the Freezed class but uses Frezed's @Assert decorators to enforce them as required fields
   * @default false
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       assertNonNullableFields: true
   *
   * ```
   */

  assertNonNullableFields?: boolean; // TODO:

  /**
   * @name copyWith
   * @description set to false to disable Freezed copyWith method helper
   * @default null
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       copyWith: false
   * ```
   */

  copyWith?: boolean;

  /**
   * @name defaultUnionConstructor
   * @description generate empty constructors for Union Types
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       defaultUnionConstructor: true
   * ```
   */

  defaultUnionConstructor?: boolean;

  /**
   * @name equal
   * @description set to false to disable Freezed equal method helper
   * @default null
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       equal: false
   * ```
   */

  equal?: boolean;

  /**
   * @name fromJsonToJson
   * @description generate fromJson toJson methods on the classes with json_serialization. Requires the [json_serializable](https://pub.dev/packages/json_serializable) to be installed in your Flutter app
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       fromJsonToJson: true
   *
   * ```
   */

  fromJsonToJson?: boolean;

  /**
   * @name immutable
   * @description  set to true to use the `@freezed` decorator or false to use the `@unfreezed` decorator
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       immutable: true
   *
   * ```
   */

  immutable?: boolean;

  /**
   * @name makeCollectionsUnmodifiable
   * @description allows collections(lists/maps) to be modified even if class is immutable
   * @default null
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       makeCollectionsUnmodifiable: true
   *
   * ```
   */

  makeCollectionsUnmodifiable?: boolean;

  /**
   * @name mergeInputs
   * @description merge InputTypes as a union of an ObjectType where ObjectType is denoted by a $ in the pattern.
   * @default []
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *      mergeInputs: ["Create$Input", "Update$Input", "Delete$Input"]
   * ```
   */

  mergeInputs?: string[];

  /**
   * @name mutableInputs
   * @description  since inputs will be used to collect data, it makes sense to make them mutable with Freezed's `@unfreezed` decorator. This overrides(in order words: has a higher precedence than) the `immutable` config value `ONLY` for GraphQL `input types`.
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       mutableInputs: true
   *
   * ```
   */

  mutableInputs?: boolean;

  /**
   * @name privateEmptyConstructor
   * @description if true, defines a private empty constructor to allow getter and methods to work on the class
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       privateEmptyConstructor: true
   *
   * ```
   */

  privateEmptyConstructor?: boolean;

  /**
   * @name unionKey
   * @description specify the key to be used for Freezed union/sealed classes
   * @default null
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       unionKey: 'type'
   *
   * ```
   */

  unionKey?: string;

  /**
   * @name unionValueCase
   * @description specify the casing style to be used for Freezed union/sealed classes
   * @default null
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       unionValueCase: 'FreezedUnionCase.pascal'
   *
   * ```
   */

  unionValueCase?: 'FreezedUnionCase.camel' | 'FreezedUnionCase.pascal';
}

export interface FieldConfig {
  final: boolean;
  defaultValue: any;
  decorators: string[];
}

export interface TypeSpecificFreezedConfig {
  config?: FreezedConfig;
  fields?: Record<string, FieldConfig>;
}

export interface DirectiveMap {
  /**
   * @name: directiveName
   * @description the name of the directive
   */
  directiveName: string;

  /**
   * @name: mapToFreezeAs
   * @description how should Freezed handle this directive. E/g: `final` would mark any field with this directive as `final`. `defaultValue` would decorate any parameter with this directive with `@Default(value: directiveArguments[0])`
   * @default 'other'
   */

  mapToFreezeAs?: 'defaultValue' | 'deprecated' | 'final' | 'other';
}

export interface FreezedPluginConfig /* extends TypeScriptPluginConfig */ {
  /**
   * @name customScalars
   * @description map custom Scalars to Dart built-in types
   * @default {}
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       customScalars:
   *         {
   *           "jsonb": "Map<String, dynamic>",
   *           "timestamptz": "DateTime",
   *           "UUID": "String",
   *         }
   * ```
   */

  customScalars?: { [name: string]: string };

  /**
   * @name directiveMap
   * @description maps GraphQL directives to freezed decorators
   * @default []
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       directiveMap: []
   *
   * ```
   */

  directiveMap?: DirectiveMap[]; // TODO: directives can have a name, and one or many values

  /**
   * @name fileName
   * @description if `modular` is set to false, this fileName will be used for the generated output file
   * @default "app_models"
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       fileName: app_models
   *
   * ```
   */

  fileName?: string;

  /**
   * @name globalFreezedConfig
   * @description use the same Freezed configuration for every generated output
   * @default null
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       globalFreezedConfig:
   *          {
   *              immutable: false,
   *              unionValueCase: FreezedUnionCase.pascal,
   *          }
   *
   * ```
   */

  globalFreezedConfig?: FreezedConfig;

  /**
   * @name typeSpecificFreezedConfig
   * @description override the `globalFreezedConfig` for specific types
   * @default null
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       typeSpecificFreezedConfig:
   *          {
   *             'Starship':{
   *                config: {
   *                  immutable: false,
   *                  unionValueCase: FreezedUnionCase.pascal,
   *                },
   *                fields: {
   *                  'id': {
   *                     final: true,
   *                     defaultValue: NanoId.id(),
   *                  },
   *                },
   *             },
   *          },
   *
   * ```
   */

  typeSpecificFreezedConfig?: Record<string, TypeSpecificFreezedConfig>;

  /**
   * @name ignoreTypes
   * @description names of GraphQL types to ignore when generating Freezed classes
   * @default []
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       ignoreTypes: ["PaginatorInfo"]
   *
   * ```
   */

  ignoreTypes?: string[];

  /**
   * @name interfaceNamePrefix
   * @description append this string to the abstract class name for Interface Types
   * @default ""
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       interfaceNamePrefix: "I_"
   * ```
   */

  interfaceNamePrefix?: string; // TODO:

  /**
   * @name interfaceNameSuffix
   * @description prepend this string to the abstract class name for Interface Types
   * @default "Interface"
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       interfaceNameSuffix: "Interface"
   * ```
   */

  interfaceNameSuffix?: string; // TODO:

  /**
   * @name lowercaseEnums
   * @description make enum fields lowercase
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       lowercaseEnums: true
   * ```
   */

  lowercaseEnums?: boolean; // TODO:

  /**
   * @name modular
   * @description if true, generates each Freezed class in the baseDir
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       modular: false
   * ```
   */

  modular?: boolean; // TODO: Figure out how to make it modular
}
