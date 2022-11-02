import React from 'react';
import request from 'graphql-request';
import './App.css';
import Film from './Film';
import { graphql } from './gql/gql';
import { useQuery } from '@tanstack/react-query';

const allFilmsWithVariablesQueryDocument = graphql(/* GraphQL */ `
  query allFilmsWithVariablesQuery($first: Int!) {
    allFilms(first: $first) {
      edges {
        node {
          ...FilmItem
        }
      }
    }
  }
`);

function App() {
  const { data } = useQuery(['films', { first: 10 }] as const, async ({ queryKey }) =>
    request(
      'https://swapi-graphql.netlify.app/.netlify/functions/index',
      allFilmsWithVariablesQueryDocument,
      queryKey[1]
    )
  );

  return (
    <div className="App">
      {data && <ul>{data.allFilms?.edges?.map((e, i) => e?.node && <Film film={e?.node} key={`film-${i}`} />)}</ul>}
    </div>
  );
}

export default App;
