import * as Types from '../types.d';

import { HeroDetails_Human_Fragment, HeroDetails_Droid_Fragment } from './HeroDetailsFragment';

export type HeroDetailsWithFragmentQueryVariables = {
  episode?: Types.Maybe<Types.Episode>;
};

export type HeroDetailsWithFragmentQuery = { __typename?: 'Query' } & { hero: Types.Maybe<({ __typename?: 'Human' } & HeroDetails_Human_Fragment) | ({ __typename?: 'Droid' } & HeroDetails_Droid_Fragment)> };
