import * as Types from '../types.d';

export type HeroAndFriendsNamesQueryVariables = {
  episode?: Types.Maybe<Types.Episode>;
};

export type HeroAndFriendsNamesQuery = { __typename?: 'Query' } & {
  hero: Types.Maybe<
    | ({ __typename?: 'Human' } & Pick<Types.Human, 'name'> & { friends: Types.Maybe<Array<Types.Maybe<({ __typename?: 'Human' } & Pick<Types.Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)>>> })
    | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'> & { friends: Types.Maybe<Array<Types.Maybe<({ __typename?: 'Human' } & Pick<Types.Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)>>> })
  >;
};
