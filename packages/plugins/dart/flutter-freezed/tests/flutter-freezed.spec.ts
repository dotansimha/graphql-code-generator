import { plugin } from '@graphql-codegen/flutter-freezed';
import {
  CustomDecorator,
  transformCustomDecorators,
  DefaultFreezedPluginConfig,
  getCustomDecorators,
  getFreezedConfigValue,
} from '../src/utils';
import { nonNullableListWithCustomScalars, starWarsSchema } from './schema';

/** utils test */
describe('flutter-freezed: utils & helpers', () => {
  test('getFreezedConfigValue(): returns the expected value for globalFreezedConfig and typeSpecificFreezedConfig', () => {
    const Starship = 'Starship';

    const config = new DefaultFreezedPluginConfig();

    const typeConfig = new DefaultFreezedPluginConfig({
      typeSpecificFreezedConfig: {
        Starship: {
          config: {
            alwaysUseJsonKeyName: true,
            assertNonNullableFields: true,
            copyWith: false,
            unionValueCase: 'FreezedUnionCase.pascal',
          },
        },
      },
    });

    expect(getFreezedConfigValue('alwaysUseJsonKeyName', config)).toBe(false);
    expect(getFreezedConfigValue('alwaysUseJsonKeyName', typeConfig, Starship)).toBe(true);

    expect(getFreezedConfigValue('assertNonNullableFields', config)).toBe(false);
    expect(getFreezedConfigValue('assertNonNullableFields', typeConfig, Starship)).toBe(true);

    expect(getFreezedConfigValue('copyWith', config)).toBe(null);
    expect(getFreezedConfigValue('copyWith', typeConfig, Starship)).toBe(false);

    expect(getFreezedConfigValue('customDecorators', config)).toMatchObject({});
    expect(getFreezedConfigValue('defaultUnionConstructor', config)).toBe(true);
    expect(getFreezedConfigValue('equal', config)).toBe(null);
    expect(getFreezedConfigValue('fromJsonToJson', config)).toBe(true);
    expect(getFreezedConfigValue('immutable', config)).toBe(true);
    expect(getFreezedConfigValue('makeCollectionsUnmodifiable', config)).toBe(null);
    expect(getFreezedConfigValue('mergeInputs', config)).toMatchObject([]);
    expect(getFreezedConfigValue('mutableInputs', config)).toBe(true);
    expect(getFreezedConfigValue('privateEmptyConstructor', config)).toBe(true);
    expect(getFreezedConfigValue('unionKey', config)).toBe(null);

    expect(getFreezedConfigValue('unionValueCase', config)).toBe(null);
    expect(getFreezedConfigValue('unionValueCase', typeConfig, Starship)).toBe('FreezedUnionCase.pascal');
  });

  test('transformCustomDecorators(): expect customDecorators to be used as configured', () => {
    const config = new DefaultFreezedPluginConfig({
      globalFreezedConfig: {
        customDecorators: {
          '@JsonSerializable(explicitToJson: true)': {
            applyOn: ['class'],
            mapsToFreezedAs: 'custom',
          },
        },
      },
      typeSpecificFreezedConfig: {
        Droid: {
          config: {
            customDecorators: {
              '@FreezedUnionValue': {
                applyOn: ['union_factory'],
                arguments: ["'BestDroid'"],
                mapsToFreezedAs: 'custom',
              },
            },
          },
          fields: {
            id: {
              customDecorators: {
                '@NanoId': {
                  applyOn: ['union_factory_parameter'],
                  arguments: ['size: 16', 'alphabets: NanoId.ALPHA_NUMERIC'],
                  mapsToFreezedAs: 'custom',
                },
              },
            },
          },
        },
      },
    });
    const globalCustomDecorators = getCustomDecorators(config, ['class']);
    const droidCustomDecorators = getCustomDecorators(config, ['class', 'union_factory'], 'Droid');
    const idCustomDecorators = getCustomDecorators(config, ['union_factory_parameter'], 'Droid', 'id');

    expect(globalCustomDecorators).toMatchObject<CustomDecorator>({
      '@JsonSerializable(explicitToJson: true)': {
        applyOn: ['class'],
        mapsToFreezedAs: 'custom',
      },
    });

    expect(droidCustomDecorators).toMatchObject<CustomDecorator>({
      '@JsonSerializable(explicitToJson: true)': {
        applyOn: ['class'],
        mapsToFreezedAs: 'custom',
      },
      '@FreezedUnionValue': {
        applyOn: ['union_factory'],
        arguments: ["'BestDroid'"],
        mapsToFreezedAs: 'custom',
      },
    });

    expect(idCustomDecorators).toMatchObject<CustomDecorator>({
      '@NanoId': {
        applyOn: ['union_factory_parameter'],
        arguments: ['size: 16', 'alphabets: NanoId.ALPHA_NUMERIC'],
        mapsToFreezedAs: 'custom',
      },
    });

    const result = plugin(starWarsSchema, [], config);

    expect(result).toBe('hi');
  });
});

/** config test */
/* describe('flutter-freezed: using default config values', () => {
  it('should not transform the scalars', () => {
    const result = plugin(nonNullableListWithCustomScalars, [], {})

    expect(result).toBe('hi');
  })
})
 */
