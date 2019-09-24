import * as Types from '../types.d';

export type TwoHeroesQueryVariables = {};

export type TwoHeroesQuery = { __typename?: 'Query' } & {
  r2: Types.Maybe<({ __typename?: 'Human' } & Pick<Types.Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)>;
  luke: Types.Maybe<({ __typename?: 'Human' } & Pick<Types.Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)>;
};
