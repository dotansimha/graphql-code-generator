import { plugin } from '../src';
import { CustomDecorator } from '../src/config';
import { DefaultFreezedPluginConfig, getCustomDecorators, getFreezedConfigValue } from '../src/utils';
import { starWarsSchema } from './schema';

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
            copyWith: false,
            unionValueCase: 'FreezedUnionCase.pascal',
          },
        },
      },
    });

    expect(getFreezedConfigValue('alwaysUseJsonKeyName', config)).toBe(false);
    expect(getFreezedConfigValue('alwaysUseJsonKeyName', typeConfig, Starship)).toBe(true);

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

    expect(result).toBe(`enum Episode{
  @JsonKey(name: NEWHOPE) newhope
  @JsonKey(name: EMPIRE) empire
  @JsonKey(name: JEDI) jedi
}

@freezed
@JsonSerializable(explicitToJson: true)
class Starship with _$Starship {
  const Starship._();

  const factory Starship({
    required String id,
    required String name,
    double? length,
  }) = _Starship;

  factory Starship.fromJson(Map<String, Object?> json) => _StarshipFromJson(json);
}

@freezed
@JsonSerializable(explicitToJson: true)
class MovieCharacter with _$MovieCharacter {
  const MovieCharacter._();

  const factory MovieCharacter({
    required String name,
    required List<Episode?> appearsIn,
  }) = _MovieCharacter;

  factory MovieCharacter.fromJson(Map<String, Object?> json) => _MovieCharacterFromJson(json);
}

@freezed
@JsonSerializable(explicitToJson: true)
class Human with _$Human {
  const Human._();

  const factory Human({
    required String id,
    required String name,
    List<MovieCharacter?>? friends,
    required List<Episode?> appearsIn,
    List<Starship?>? starships,
    int? totalCredits,
  }) = _Human;

  factory Human.fromJson(Map<String, Object?> json) => _HumanFromJson(json);
}

@freezed
@JsonSerializable(explicitToJson: true)
class Droid with _$Droid {
  const Droid._();

  const factory Droid({
    required String id,
    required String name,
    List<MovieCharacter?>? friends,
    required List<Episode?> appearsIn,
    String? primaryFunction,
  }) = _Droid;

  factory Droid.fromJson(Map<String, Object?> json) => _DroidFromJson(json);
}

@freezed
@JsonSerializable(explicitToJson: true)
class SearchResult with _$SearchResult {
  const SearchResult._();

  const factory SearchResult() = _SearchResult;

  const factory SearchResult.human({
    required String id,
    required String name,
    List<MovieCharacter?>? friends,
    required List<Episode?> appearsIn,
    List<Starship?>? starships,
    int? totalCredits,
  }) = Human;

  @FreezedUnionValue('BestDroid')
  const factory SearchResult.droid({
    @NanoId(size: 16, alphabets: NanoId.ALPHA_NUMERIC)
    required String id,
    required String name,
    List<MovieCharacter?>? friends,
    required List<Episode?> appearsIn,
    String? primaryFunction,
  }) = Droid;

  const factory SearchResult.starship({
    required String id,
    required String name,
    double? length,
  }) = Starship;

  factory SearchResult.fromJson(Map<String, Object?> json) => _SearchResultFromJson(json);
}
`);
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
