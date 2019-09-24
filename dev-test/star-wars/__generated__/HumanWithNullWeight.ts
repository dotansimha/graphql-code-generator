import * as Types from '../types.d';

import { HumanFieldsFragment } from './HumanFields';
export type HumanWithNullHeightQueryVariables = {};

export type HumanWithNullHeightQuery = { __typename?: 'Query' } & { human: Types.Maybe<{ __typename?: 'Human' } & HumanFieldsFragment> };
