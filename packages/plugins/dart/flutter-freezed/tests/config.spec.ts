import { plugin } from '@graphql-codegen/flutter-freezed';
import { DefaultFreezedPluginConfig, getFreezedConfigValue } from '../src/utils';
import { defaultConfig, typeConfig } from './config';
import {
  baseSchema,
  cyclicSchema,
  enumSchema,
  extendedBaseSchema,
  nonNullableListWithCustomScalars,
  simpleUnionSchema,
} from './schema';

describe('flutter-freezed-plugin-config', () => {
  it('should return the default plugin values', () => {
    const config = defaultConfig;
    expect(config.camelCasedEnums).toBe(true);
    expect(config.customScalars).toMatchObject({});
    expect(config.fileName).toBe('app_models');
    expect(config.ignoreTypes).toMatchObject([]);
  });

  it('should return the default globalFreezedConfig values', () => {
    const config = defaultConfig;
    expect(config.globalFreezedConfig.alwaysUseJsonKeyName).toBe(false);
    expect(config.globalFreezedConfig.copyWith).toBeUndefined();
    expect(config.globalFreezedConfig.customDecorators).toMatchObject({});
    expect(config.globalFreezedConfig.defaultUnionConstructor).toBe(true);
    expect(config.globalFreezedConfig.equal).toBeUndefined();
    expect(config.globalFreezedConfig.fromJsonToJson).toBe(true);
    expect(config.globalFreezedConfig.immutable).toBe(true);
    expect(config.globalFreezedConfig.makeCollectionsUnmodifiable).toBeUndefined();
    expect(config.globalFreezedConfig.mergeInputs).toMatchObject([]);
    expect(config.globalFreezedConfig.mutableInputs).toBe(true);
    expect(config.globalFreezedConfig.privateEmptyConstructor).toBe(true);
    expect(config.globalFreezedConfig.unionKey).toBeUndefined();
    expect(config.globalFreezedConfig.unionValueCase).toBeUndefined();
  });

  it('should  return the typeSpecificFreezedConfig values', () => {
    const config = typeConfig;
    const Starship = 'Starship';
    expect(config.typeSpecificFreezedConfig[Starship].config.alwaysUseJsonKeyName).toBe(true);
    expect(config.typeSpecificFreezedConfig[Starship].config.copyWith).toBe(false);
    expect(config.typeSpecificFreezedConfig[Starship].config.unionValueCase).toBe('FreezedUnionCase.pascal');
  });

  describe('getFreezedConfigValue() returns the expect config value', () => {
    const config = typeConfig;
    const Starship = 'Starship';
    test('without a typeName should return the globalFreezedConfig value', () => {
      expect(getFreezedConfigValue('alwaysUseJsonKeyName', config)).toBe(false);
      expect(getFreezedConfigValue('copyWith', config)).toBeUndefined();
      expect(getFreezedConfigValue('unionValueCase', config)).toBe('FreezedUnionCase.camel');
    });

    test('given a typeName should return the typeSpecificFreezedConfig value', () => {
      expect(getFreezedConfigValue('alwaysUseJsonKeyName', config, Starship)).toBe(true);
      expect(getFreezedConfigValue('copyWith', config, Starship)).toBe(false);
      expect(getFreezedConfigValue('unionValueCase', config, Starship)).toBe('FreezedUnionCase.pascal');
    });
  });

  describe('configuring the plugin', () => {
    test('the imported packages', () => {
      expect(plugin(baseSchema, [], new DefaultFreezedPluginConfig({ fileName: 'graphql_models' })))
        .toContain(`import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter/foundation.dart';

part 'graphql_models.freezed.dart';
part 'graphql_models.g.dart';
`);

      expect(plugin(baseSchema, [], new DefaultFreezedPluginConfig({ fileName: 'my_file_name.dart' })))
        .toContain(`import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter/foundation.dart';

part 'my_file_name.freezed.dart';
part 'my_file_name.g.dart';
`);
    });

    test('the casing of Enum fields ', () => {
      expect(plugin(enumSchema, [], new DefaultFreezedPluginConfig({ camelCasedEnums: true }))).toContain(`enum Episode{
  @JsonKey(name: 'NEWHOPE') newhope
  @JsonKey(name: 'EMPIRE') empire
  @JsonKey(name: 'JEDI') jedi
}`);

      expect(plugin(enumSchema, [], new DefaultFreezedPluginConfig({ camelCasedEnums: false })))
        .toContain(`enum Episode{
  NEWHOPE
  EMPIRE
  JEDI
}`);
    });

    it('ignores these types ', () => {
      expect(plugin(baseSchema, [], new DefaultFreezedPluginConfig({ ignoreTypes: ['PersonType'] }))).not.toContain(
        `PersonType`
      );
    });

    it('should handle custom scalars', () => {
      expect(
        plugin(
          nonNullableListWithCustomScalars,
          [],
          new DefaultFreezedPluginConfig({
            customScalars: {
              jsonb: 'Map<String, dynamic>',
              timestamptz: 'DateTime',
              UUID: 'String',
            },
          })
        )
      ).toBe(`import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter/foundation.dart';

part 'app_models.freezed.dart';
part 'app_models.g.dart';

@freezed
class ComplexType with _$ComplexType {
  const ComplexType._();

  const factory ComplexType({
    List<String?>? a,
    List<String>? b,
    required List<bool> c,
    List<List<int?>?>? d,
    List<List<double?>>? e,
    required List<List<String?>> f,
    Map<String, dynamic>? g,
    required DateTime h,
    required String i,
  }) = _ComplexType;

  factory ComplexType.fromJson(Map<String, Object?> json) => _ComplexTypeFromJson(json);
}`);
    });

    it('using @JsonKey(name: "fieldName") for fields that are not camelCased', () => {
      expect(
        plugin(
          extendedBaseSchema,
          [],
          new DefaultFreezedPluginConfig({
            globalFreezedConfig: {
              alwaysUseJsonKeyName: true,
            },
            typeSpecificFreezedConfig: {
              PersonType: {
                config: {
                  alwaysUseJsonKeyName: false,
                },
              },
            },
          })
        )
      ).toBe(`import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter/foundation.dart';

part 'app_models.freezed.dart';
part 'app_models.g.dart';

@freezed
class BaseType with _$BaseType {
  const BaseType._();

  const factory BaseType({
    @JsonKey(name: 'id')
    String? id,
    @JsonKey(name: 'primaryKey')
    required String primaryKey,
    @JsonKey(name: 'CompositeForeignKey')
    required String compositeForeignKey,
  }) = _BaseType;

  factory BaseType.fromJson(Map<String, Object?> json) => _BaseTypeFromJson(json);
}

@freezed
class PersonType with _$PersonType {
  const PersonType._();

  const factory PersonType({
    String? id,
    required String name,
    required String primaryKey,
    @JsonKey(name: 'CompositeForeignKey')
    required String compositeForeignKey,
  }) = _PersonType;

  factory PersonType.fromJson(Map<String, Object?> json) => _PersonTypeFromJson(json);
}`);
    });

    describe('using defaultUnionConstructor & privateEmptyConstructor ', () => {
      it('generates empty constructors for Union Types and mergedInputs and a private empty constructor to allow getter and methods to work on the class', () => {});
      // this is enabled by default
      let result = plugin(simpleUnionSchema, [], new DefaultFreezedPluginConfig({}));

      // contains defaultUnionConstructor
      expect(result).toContain('const factory AuthWithOtpInput() = _AuthWithOtpInput;');
      // contains privateEmptyConstructor
      expect(result).toContain('const VerifyOtpInput._();');
      // expected output
      expect(result).toBe(`import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter/foundation.dart';

part 'app_models.freezed.dart';
part 'app_models.g.dart';

@unfreezed
class RequestOtpInput with _$RequestOtpInput {
  const RequestOtpInput._();

  const factory RequestOtpInput({
    String? email,
    String? phoneNumber,
  }) = _RequestOtpInput;

  factory RequestOtpInput.fromJson(Map<String, Object?> json) => _RequestOtpInputFromJson(json);
}

@unfreezed
class VerifyOtpInput with _$VerifyOtpInput {
  const VerifyOtpInput._();

  const factory VerifyOtpInput({
    String? email,
    String? phoneNumber,
    required String otpCode,
  }) = _VerifyOtpInput;

  factory VerifyOtpInput.fromJson(Map<String, Object?> json) => _VerifyOtpInputFromJson(json);
}

@freezed
class AuthWithOtpInput with _$AuthWithOtpInput {
  const AuthWithOtpInput._();

  const factory AuthWithOtpInput() = _AuthWithOtpInput;

  const factory AuthWithOtpInput.requestOtpInput({
    String? email,
    String? phoneNumber,
  }) = RequestOtpInput;

  const factory AuthWithOtpInput.verifyOtpInput({
    String? email,
    String? phoneNumber,
    required String otpCode,
  }) = VerifyOtpInput;

  factory AuthWithOtpInput.fromJson(Map<String, Object?> json) => _AuthWithOtpInputFromJson(json);
}`);

      // disabling the default config
      result = plugin(
        simpleUnionSchema,
        [],
        new DefaultFreezedPluginConfig({
          globalFreezedConfig: {
            defaultUnionConstructor: false,
          },
          typeSpecificFreezedConfig: {
            VerifyOTPInput: {
              config: {
                privateEmptyConstructor: false,
              },
            },
          },
        })
      );

      // does NOT contain defaultUnionConstructor
      expect(result).not.toContain('const factory AuthWithOtpInput() = _AuthWithOtpInput;');
      // does NOT contain privateEmptyConstructor
      expect(result).not.toContain('const VerifyOtpInput._();');
      // expected output
      expect(result).toBe(`import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter/foundation.dart';

part 'app_models.freezed.dart';
part 'app_models.g.dart';

@unfreezed
class RequestOtpInput with _$RequestOtpInput {
  const RequestOtpInput._();

  const factory RequestOtpInput({
    String? email,
    String? phoneNumber,
  }) = _RequestOtpInput;

  factory RequestOtpInput.fromJson(Map<String, Object?> json) => _RequestOtpInputFromJson(json);
}

@unfreezed
class VerifyOtpInput with _$VerifyOtpInput {
  const factory VerifyOtpInput({
    String? email,
    String? phoneNumber,
    required String otpCode,
  }) = _VerifyOtpInput;

  factory VerifyOtpInput.fromJson(Map<String, Object?> json) => _VerifyOtpInputFromJson(json);
}

@freezed
class AuthWithOtpInput with _$AuthWithOtpInput {
  const AuthWithOtpInput._();

  const factory AuthWithOtpInput.requestOtpInput({
    String? email,
    String? phoneNumber,
  }) = RequestOtpInput;

  const factory AuthWithOtpInput.verifyOtpInput({
    String? email,
    String? phoneNumber,
    required String otpCode,
  }) = VerifyOtpInput;

  factory AuthWithOtpInput.fromJson(Map<String, Object?> json) => _AuthWithOtpInputFromJson(json);
}`);
    });

    it('to be immutable OR immutable but configurable OR mutable ', () => {
      expect(
        plugin(
          cyclicSchema,
          [],
          new DefaultFreezedPluginConfig({
            globalFreezedConfig: {
              immutable: true,
              mutableInputs: true,
            },
            typeSpecificFreezedConfig: {
              BaseAInput: {
                config: {
                  immutable: true,
                  mutableInputs: false, // takes precedence
                },
              },
              BaseBInput: {
                config: {
                  immutable: false,
                  mutableInputs: false, // takes precedence
                },
              },
              BaseCInput: {
                config: {
                  immutable: false,
                  mutableInputs: true, // takes precedence
                },
              },
              Base: {
                config: {
                  copyWith: false,
                  fromJsonToJson: false,
                  makeCollectionsUnmodifiable: true,
                  unionValueCase: 'FreezedUnionCase.pascal',
                },
              },
            },
          })
        )
      ).toBe(`import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter/foundation.dart';

part 'app_models.freezed.dart';
part 'app_models.g.dart';

@freezed
class BaseAInput with _$BaseAInput {
  const BaseAInput._();

  const factory BaseAInput({
    required BaseBInput b,
  }) = _BaseAInput;

  factory BaseAInput.fromJson(Map<String, Object?> json) => _BaseAInputFromJson(json);
}

@unfreezed
class BaseBInput with _$BaseBInput {
  const BaseBInput._();

  factory BaseBInput({
    required BaseCInput c,
  }) = _BaseBInput;

  factory BaseBInput.fromJson(Map<String, Object?> json) => _BaseBInputFromJson(json);
}

@unfreezed
class BaseCInput with _$BaseCInput {
  const BaseCInput._();

  factory BaseCInput({
    required BaseAInput a,
  }) = _BaseCInput;

  factory BaseCInput.fromJson(Map<String, Object?> json) => _BaseCInputFromJson(json);
}

@Freezed(
  copyWith: false,
  makeCollectionsUnmodifiable: true,
  unionValueCase: 'FreezedUnionCase.pascal',
)
class Base with _$Base {
  const Base._();

  const factory Base({
    String? id,
  }) = _Base;

}`);
    });
  });
});
/*   it('should ', () => {});
  it('should ', () => {});
  it('should ', () => {}) */
