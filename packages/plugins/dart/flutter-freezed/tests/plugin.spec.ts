import { plugin } from '../src';
import { fullDemoConfig } from './config';
import { fullSchema } from './schema';

/** plugin test */
describe('flutter-freezed: plugin config', () => {
  test('full plugin test: expect generated code to be as configured', () => {
    const result = plugin(fullSchema, [], fullDemoConfig);

    expect(result).toBe(`import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:flutter/foundation.dart';

part 'app_models.freezed.dart';
part 'app_models.g.dart';

enum Episode{
  @JsonKey(name: NEWHOPE) newhope
  @JsonKey(name: EMPIRE) empire
  @JsonKey(name: JEDI) jedi
}

@freezed
@JsonSerializable(explicitToJson: true)
class Movie with _$Movie {
  const Movie._();

  const factory Movie({
    required String id,
    required String title,
  }) = _Movie;

  const factory Movie.createInput({
    required String title,
  }) = CreateMovieInput;

  const factory Movie.upsertInput({
    required String id,
    required String title,
  }) = UpsertMovieInput;

  const factory Movie.deleteInput({
    required String id,
  }) = DeleteMovieInput;

  factory Movie.fromJson(Map<String, Object?> json) => _MovieFromJson(json);
}

@unfreezed
@JsonSerializable(explicitToJson: true)
class CreateMovieInput with _$CreateMovieInput {
  const CreateMovieInput._();

  const factory CreateMovieInput.createInput({
    required String title,
  }) = CreateMovieInput;

  factory CreateMovieInput.fromJson(Map<String, Object?> json) => _CreateMovieInputFromJson(json);
}

@unfreezed
@JsonSerializable(explicitToJson: true)
class UpsertMovieInput with _$UpsertMovieInput {
  const UpsertMovieInput._();

  const factory UpsertMovieInput.upsertInput({
    required String id,
    required String title,
  }) = UpsertMovieInput;

  factory UpsertMovieInput.fromJson(Map<String, Object?> json) => _UpsertMovieInputFromJson(json);
}

@unfreezed
@JsonSerializable(explicitToJson: true)
class UpdateMovieInput with _$UpdateMovieInput {
  const UpdateMovieInput._();

  const factory UpdateMovieInput({
    required String id,
    String? title,
  }) = _UpdateMovieInput;

  factory UpdateMovieInput.fromJson(Map<String, Object?> json) => _UpdateMovieInputFromJson(json);
}

@unfreezed
@JsonSerializable(explicitToJson: true)
class DeleteMovieInput with _$DeleteMovieInput {
  const DeleteMovieInput._();

  const factory DeleteMovieInput.deleteInput({
    required String id,
  }) = DeleteMovieInput;

  factory DeleteMovieInput.fromJson(Map<String, Object?> json) => _DeleteMovieInputFromJson(json);
}

@Freezed(
  copyWith: false,
  equal: false,
  unionValueCase: 'FreezedUnionCase.pascal',
)
@JsonSerializable(explicitToJson: true)
class Starship with _$Starship {
  const factory Starship({
    @JsonKey(name: 'id')
    required String id,
    @JsonKey(name: 'name')
    required String name,
    @JsonKey(name: 'length')
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

@unfreezed
@JsonSerializable(explicitToJson: true)
class Droid with _$Droid {
  const Droid._();

  factory Droid({
    required String id,
    required String name,
    List<MovieCharacter?>? friends,
    required List<Episode?> appearsIn,
    String? primaryFunction,
  }) = _Droid;

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
  factory SearchResult.droid({
    @NanoId(size: 16, alphabets: NanoId.ALPHA_NUMERIC)
    required String id,
    required String name,
    List<MovieCharacter?>? friends,
    required List<Episode?> appearsIn,
    String? primaryFunction,
  }) = Droid;

  const factory SearchResult.starship({
    @JsonKey(name: 'id')
    required String id,
    @JsonKey(name: 'name')
    required String name,
    @JsonKey(name: 'length')
    double? length,
  }) = Starship;

  factory SearchResult.fromJson(Map<String, Object?> json) => _SearchResultFromJson(json);
}

@freezed
@JsonSerializable(explicitToJson: true)
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
}

@unfreezed
@JsonSerializable(explicitToJson: true)
class BaseAInput with _$BaseAInput {
  const BaseAInput._();

  const factory BaseAInput({
    required BaseBInput b,
  }) = _BaseAInput;

  factory BaseAInput.fromJson(Map<String, Object?> json) => _BaseAInputFromJson(json);
}

@unfreezed
@JsonSerializable(explicitToJson: true)
class BaseBInput with _$BaseBInput {
  const BaseBInput._();

  const factory BaseBInput({
    required BaseCInput c,
  }) = _BaseBInput;

  factory BaseBInput.fromJson(Map<String, Object?> json) => _BaseBInputFromJson(json);
}

@unfreezed
@JsonSerializable(explicitToJson: true)
class BaseCInput with _$BaseCInput {
  const BaseCInput._();

  const factory BaseCInput({
    required BaseAInput a,
  }) = _BaseCInput;

  factory BaseCInput.fromJson(Map<String, Object?> json) => _BaseCInputFromJson(json);
}

@freezed
@JsonSerializable(explicitToJson: true)
class Base with _$Base {
  const Base._();

  const factory Base({
    String? id,
  }) = _Base;

  const factory Base.aInput({
    required BaseBInput b,
  }) = BaseAInput;

  const factory Base.bInput({
    required BaseCInput c,
  }) = BaseBInput;

  const factory Base.cInput({
    required BaseAInput a,
  }) = BaseCInput;

  const factory Base.createMovieInput({
    required String title,
  }) = CreateMovieInput;

  factory Base.fromJson(Map<String, Object?> json) => _BaseFromJson(json);
}`);
  });
});
