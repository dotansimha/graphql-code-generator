import { buildQuery } from 'graph/buildQuery';
import { GPlayerList } from 'graph/types';
import graphql from 'graphql-tag';

export const playerListQuery = buildQuery<GPlayerList.Query, GPlayerList.Variables>(graphql`
  query GPlayerList {
    allPlayers {
      id
      tier
      name
    }
  }
`);
