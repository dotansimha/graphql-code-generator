import * as Types from '../types.d';

export type HeroDetailsQueryVariables = {
  episode?: Types.Maybe<Types.Episode>;
};

export type HeroDetailsQuery = { __typename?: 'Query' } & { hero: Types.Maybe<({ __typename?: 'Human' } & Pick<Types.Human, 'height' | 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'primaryFunction' | 'name'>)> };
