import * as Types from '../types.d';

export type HeroNameQueryVariables = {
  episode?: Types.Maybe<Types.Episode>;
};

export type HeroNameQuery = { __typename?: 'Query' } & { hero: Types.Maybe<({ __typename?: 'Human' } & Pick<Types.Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)> };
