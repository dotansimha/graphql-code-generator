import { plugin } from '@graphql-codegen/flutter-freezed';
import { DefaultFreezedPluginConfig, getFreezedConfigValue } from '../src/utils';
import { defaultConfig, typeConfig } from './config';
import { baseSchema, enumSchema } from './schema';

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

part graphql_models.dart;
part 'graphql_models.g.dart';
`);

      expect(plugin(baseSchema, [], new DefaultFreezedPluginConfig({ fileName: 'my_file_name.dart' })))
        .toContain(`import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter/foundation.dart';

part my_file_name.dart;
part 'my_file_name.g.dart';
`);
    });

    test('the casing of Enum fields ', () => {
      expect(plugin(enumSchema, [], new DefaultFreezedPluginConfig({ camelCasedEnums: true }))).toContain(`enum Episode{
  @JsonKey(name: NEWHOPE) newhope
  @JsonKey(name: EMPIRE) empire
  @JsonKey(name: JEDI) jedi
}`);
      expect(plugin(enumSchema, [], new DefaultFreezedPluginConfig({ camelCasedEnums: false })))
        .toContain(`enum Episode{
  NEWHOPE
  EMPIRE
  JEDI
}`);
    });

    it('ignores these types ', () => {
      expect(plugin(baseSchema, [], new DefaultFreezedPluginConfig({ ignoreTypes: ['IgnoreBaseType'] }))).not.toContain(
        `IgnoreBaseType`
      );
    });
  });
});
/*   it('should ', () => {});
  it('should ', () => {});
  it('should ', () => {}) */
