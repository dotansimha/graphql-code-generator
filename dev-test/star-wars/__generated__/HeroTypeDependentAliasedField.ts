import * as Types from '../types.d';

export type HeroTypeDependentAliasedFieldQueryVariables = {
  episode?: Types.Maybe<Types.Episode>;
};

export type HeroTypeDependentAliasedFieldQuery = { __typename?: 'Query' } & { hero: Types.Maybe<({ __typename?: 'Human' } & { property: Types.Human['homePlanet'] }) | ({ __typename?: 'Droid' } & { property: Types.Droid['primaryFunction'] })> };
