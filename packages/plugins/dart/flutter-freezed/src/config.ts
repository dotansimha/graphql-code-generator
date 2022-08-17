/**
 * @name ApplyDecoratorOn
 * @description Values that are passed to the `DecoratorToFreezed.applyOn` field that specifies where the custom decorator should be applied
 */
export type ApplyDecoratorOn =
  | 'enum'
  | 'enum_field'
  | 'class'
  | 'class_factory'
  | 'union_factory'
  | 'merged_input_factory'
  | 'class_factory_parameter'
  | 'union_factory_parameter'
  | 'merged_input_parameter';

/**
 * @name DecoratorToFreezed
 * @description the value of a `CustomDecorator`. This value specifies how the the decorator should be handled by Freezed
 */
export type DecoratorToFreezed = {
  /**
   * @name arguments
   * @description Arguments to be applied on the decorator. if the `mapsToFreezedAs === 'directive'`,  use template string such `['$0', '$2', '$3']` to select/order the arguments of the directive to be used($0 is the first argument, $1 is the second).
   * @default undefined
   * @exampleMarkdown
   * ```yml
   * arguments: [$0] # $0 is the first argument, $1 is the 2nd ...
   * ```
   */
  arguments?: string[]; //['$0']

  /**
   * @name applyOn
   * @description Specify where the decorator should be applied
   * @exampleMarkdown
   * ```yml
   * applyOn: ['class_factory','union_factory'], # applies this decorator on both class and union factory blocks
   * ```
   */
  applyOn: ApplyDecoratorOn[];

  /**
   * @name mapsToFreezedAs
   * @description maps to a Freezed decorator or use `custom` to use a custom decorator.If `mapsToFreezedAs === 'directive'` don't include the `@` prefix in the key of the customDecorator.  If `mapsToFreezedAs === 'custom'` value, whatever you use as the key of the customDecorator is used just as it is, and the arguments spread into a parenthesis () */
  mapsToFreezedAs: '@Default' | '@deprecated' | 'final' | 'directive' | 'custom';
};

/**
 * @name CustomDecorator
 * @description
 * use this option to add annotations/decorators for the the generated output. Also use this to add @Assert decorators to validate the properties of the model
 */
export type CustomDecorator = Record<string, DecoratorToFreezed>;

/**
 * @name FreezedConfig
 * @description configure what Freeze should generate
 * @default DefaultFreezedConfig
 */
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
   * @name copyWith
   * @description set to false to disable Freezed copyWith method helper
   * @default undefined
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
   * @name customDecorators
   * @description annotate/decorate the generated output. Also use this option to map GraphQL directives to freezed decorators.
   * @default {}
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       customDecorators: {
   *          'default' : {
   *             mapsToFreezedAs: '@Default',
   *             arguments: ['$0'],
   *            },
   *           'deprecated' : {
   *              mapsToFreezedAs: '@deprecated',
   *           },
   *          'readonly' : {
   *              mapsToFreezedAs: 'final',
   *           },
   *          '@Assert' : {
   *              mapsToFreezedAs: 'custom',
   *              applyOn: ['class_factory','union_factory'], # @Assert should ONLY be used on factories
   *              arguments: [
   *                  '(email != null && email != "") || (phoneNumber != null && phoneNumber != "")',
   *                  'provide either an email or a phoneNumber',
   *              ],
   *           }, # custom are used just as it given
   *       }
   *
   * ```
   */

  customDecorators?: CustomDecorator;

  /**
   * @name defaultUnionConstructor
   * @description generate empty constructors for Union Types and mergedInputs
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
   * @default undefined
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
   * @default undefined
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
   * @default undefined
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
   * @default undefined
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

/**
 * @name FieldConfig
 * @description configuration for the field
 */
export interface FieldConfig {
  /**
   * @name final
   * @description marks a field as final
   * @default undefined
   */

  final?: boolean;

  /**
   * @name deprecated
   * @description marks a field as deprecated
   * @default undefined
   */

  deprecated?: boolean;

  /**
   * @name defaultValue
   * @description annotate a field with a @Default(value: defaultValue) decorator
   * @default undefined
   */

  defaultValue?: any;

  /**
   * @name customDecorators
   * @description specific directives to apply to the field. All `mapsToFreezedAs` values except `custom` are parsed so use the name of the directive without the `@` symbol as the key of the customDecorators. With the `custom` value, whatever you use as the key of the custom directive is used just as it is, and the arguments spread into a parenthesis ()
   * @default undefined
   * @exampleMarkdown
   * ```yml
   * customDecorators: {
   *    'default' : {
   *        mapsToFreezedAs: '@Default',
   *          applyOn: ['class_factory_parameter],
   *        arguments: ['$0'],
   *      },
   *      'deprecated' : {
   *          mapsToFreezedAs: '@deprecated',
   *          applyOn: ['union_factory_parameter],
   *       },
   *      'readonly' : {
   *          mapsToFreezedAs: 'final',
   *          applyOn: ['class_factory_parameter','union_factory_parameter'],
   *       },
   *      '@HiveField' : {
   *          mapsToFreezedAs: 'custom',
   *          applyOn: ['class_factory_parameter'],
   *          arguments: ['1'],
   *       }, # custom are used just as it given
   * }
   * ```
   */

  customDecorators?: CustomDecorator;
}

/**
 * @name TypeSpecificFreezedConfig
 * @description override the `FlutterFreezedPluginConfig.globalFreezedConfig` option for a specific type
 */
export interface TypeSpecificFreezedConfig {
  /** marks a type as deprecated */

  deprecated?: boolean;

  /** overrides the `globalFreezedConfig` for this type */

  config?: FreezedConfig;

  /** configure fields for this type. The GraphQL field name is the key */

  fields?: Record<string, FieldConfig>;
}

/**
 * @name FlutterFreezedPluginConfig
 * @description configure the `flutter-freezed` plugin
 */
export interface FlutterFreezedPluginConfig /* extends TypeScriptPluginConfig */ {
  /**
   * @name camelCasedEnums
   * @description Dart's recommended lint uses camelCase for enum fields. Set this option to `false` to use the same case as used in the GraphQL Schema but note this can cause lint issues.
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   flutter_app/lib/data/models/app_models.dart
   *     plugins:
   *       - flutter-freezed
   *     config:
   *       camelCasedEnums: true
   * ```
   */

  camelCasedEnums?: boolean;

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
   * @name fileName
   * @description this fileName will be used for the generated output file
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
   * @default DefaultFreezedConfig
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
   * @description override the `globalFreezedConfig` for specific types. The GraphQL Type name is the key
   * @default undefined
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
}
