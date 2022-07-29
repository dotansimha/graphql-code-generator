export interface FreezedPluginConfig /* extends TypeScriptPluginConfig */ {
  /**
   * @name baseDir
   * @description the path to the folder that will be created for the generated Freezed classes.
   * @default "./data/models"
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
   *     config:
   *       fileName: app_models
   * ```
   */
  baseDir: string;

  // TODO: Figure out how to make it modular
  /**
   * @name modular
   * @description if true, generates each Freezed class in the baseDir
   * @default false
   * ```yml
   * generates:
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
   *     config:
   *       modular: false
   *
   */
  modular?: boolean;

  /**
   * @name fileName
   * @description if `modular` is set to false, this fileName will be used for the generated output file
   * @default "app_models"
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
   *     config:
   *       fileName: app_models
   *
   * ```
   */

  fileName?: string;

  /**
   * @name immutable
   * @description  set to true to use the `@freezed` decorator or false to use the `@unfreezed` decorator
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
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
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
   *     config:
   *       makeCollectionsUnmodifiable: true
   *
   * ```
   */

  makeCollectionsUnmodifiable?: boolean;

  // TODO: these options also can be passed to `@Freezed(  copyWith: false,equal: false,)`

  /**
   * @name privateEmptyConstructor
   * @description if true, defines a private empty constructor to allow getter and methods to work on the class
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
   *     config:
   *       privateEmptyConstructor: true
   *
   * ```
   */

  privateEmptyConstructor?: boolean;

  /**
   * @name ignoreTypes
   * @description names of GraphQL types to ignore when generating Freezed classes
   * @default []
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
   *     config:
   *       ignoreTypes: ["PaginatorInfo"]
   *
   * ```
   */

  ignoreTypes?: string[];

  /**
   * @name fromJsonToJson
   * @description generate fromJson toJson methods on the classes with json_serialization. Requires the [json_serializable](https://pub.dev/packages/json_serializable) to be installed in your Flutter app
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
   *     config:
   *       fileName: app_models
   *       ignoreTypes: ["PaginatorInfo"]
   *       fromJsonToJson: true
   *
   * ```
   */

  fromJsonToJson?: boolean;

  /**
   * @name lowercaseEnums
   * @description make enum fields lowercase
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
   *     config:
   *       fileName: app_models
   *       ignoreTypes: ["PaginatorInfo"]
   *       fromJsonToJson: true
   *       lowercaseEnums: true
   * ```
   */

  lowercaseEnums?: boolean;

  /**
   * @name unionConstructor
   * @description generate empty constructors for Union Types
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
   *     config:
   *       fileName: app_models
   *       ignoreTypes: ["PaginatorInfo"]
   *       fromJsonToJson: true
   *       unionConstructor: true
   * ```
   */

  unionConstructor?: boolean;

  /**
   * @name customScalars
   * @description map custom Scalars to Dart built-in types
   * @default {}
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
   *     config:
   *       fileName: app_models
   *       ignoreTypes: ["PaginatorInfo"]
   *       fromJsonToJson: true
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
   * @name mergeInputs
   * @description merge InputTypes as a union of an ObjectType where ObjectType is denoted by a $ in the pattern.
   * @default []
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
   *     config:
   *       fileName: app_models
   *       ignoreTypes: ["PaginatorInfo"]
   *       fromJsonToJson: true
   *       customScalars:
   *         {
   *           "jsonb": "Map<String, dynamic>",
   *           "timestamptz": "DateTime",
   *           "UUID": "String",
   *         }
   *      mergeInputs: ["Create$Input", "Update$Input", "Delete$Input"]
   * ```
   */

  mergeInputs?: string[];

  /**
   * @name interfaceNamePrefix
   * @description append this string to the abstract class name for Interface Types
   * @default ""
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
   *     config:
   *       fileName: app_models
   *       optionalConstructor: true
   *       interfaceNamePrefix: "I_"
   * ```
   */

  interfaceNamePrefix?: string;

  /**
   * @name interfaceNameSuffix
   * @description prepend this string to the abstract class name for Interface Types
   * @default "Interface"
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
   *     config:
   *       fileName: app_models
   *       optionalConstructor: true
   *       interfaceNameSuffix: "Interface"
   * ```
   */

  interfaceNameSuffix?: string;

  /**
   * @name optionalConstructor
   * @description makes all the properties in the Freezed classes optional and rather uses Assert statements to enforce required fields
   * @default false
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/your/flutter/project/data/models/app_models.dart
   *     plugins:
   *       - typescript
   *       - graphql-codegen-flutter-freezed-classes
   *     config:
   *       fileName: app_models
   *       optionalConstructor: true
   *
   * ```
   */

  optionalConstructor?: boolean;
}
