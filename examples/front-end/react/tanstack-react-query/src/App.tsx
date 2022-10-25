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
  const { data } = useQuery(['films'], async () =>
    request('https://swapi-graphql.netlify.app/.netlify/functions/index', allFilmsWithVariablesQueryDocument, {
      first: 10,
    })
  );

  return (
    <div className="App">
      {data && <ul>{data.allFilms?.edges?.map((e, i) => e?.node && <Film film={e?.node} key={`film-${i}`} />)}</ul>}
    </div>
  );
}

export default App;
