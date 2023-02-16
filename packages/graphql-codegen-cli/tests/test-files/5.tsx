import { buildQuery } from 'graph/buildQuery';
import { GPlayerList } from 'graph/types';
import gql from 'graphql-tag';

export const playerListQuery = buildQuery<GPlayerList.Query, GPlayerList.Variables>(gql`
  query GPlayerList {
    allPlayers {
      id
      tier
      name
    }
  }
`);
