import * as Types from '../types.d';

export type HumanFieldsFragment = { __typename?: 'Human' } & Pick<Types.Human, 'name' | 'mass'>;
