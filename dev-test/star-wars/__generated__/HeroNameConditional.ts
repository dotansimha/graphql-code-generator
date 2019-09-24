import * as Types from '../types.d';

export type HeroNameConditionalInclusionQueryVariables = {
  episode?: Types.Maybe<Types.Episode>;
  includeName: Types.Scalars['Boolean'];
};

export type HeroNameConditionalInclusionQuery = { __typename?: 'Query' } & { hero: Types.Maybe<({ __typename?: 'Human' } & Pick<Types.Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)> };

export type HeroNameConditionalExclusionQueryVariables = {
  episode?: Types.Maybe<Types.Episode>;
  skipName: Types.Scalars['Boolean'];
};

export type HeroNameConditionalExclusionQuery = { __typename?: 'Query' } & { hero: Types.Maybe<({ __typename?: 'Human' } & Pick<Types.Human, 'name'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name'>)> };
