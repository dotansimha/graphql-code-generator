import gql from 'graphql-tag';

import { buildQuery } from 'graph/buildQuery';
import { GPlayerList } from 'graph/types';

export const playerListQuery = buildQuery<GPlayerList.Query, GPlayerList.Variables>(gql`
  query GPlayerList {
    allPlayers {
      id
      tier
      name
    }
  }
`);
