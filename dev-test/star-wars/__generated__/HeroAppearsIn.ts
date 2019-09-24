import * as Types from '../types.d';

export type HeroAppearsInQueryVariables = {};

export type HeroAppearsInQuery = { __typename?: 'Query' } & { hero: Types.Maybe<({ __typename?: 'Human' } & Pick<Types.Human, 'name' | 'appearsIn'>) | ({ __typename?: 'Droid' } & Pick<Types.Droid, 'name' | 'appearsIn'>)> };
