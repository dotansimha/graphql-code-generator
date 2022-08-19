import React, { useEffect, useState } from 'react';
import request from 'graphql-request';
import './App.css';
import Film from './Film';
import { gql } from './gql/gql';
import { AllFilmsWithVariablesQueryQuery } from './gql/graphql';

const allFilmsWithVariablesQueryDocument = gql(/* GraphQL */ `
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

// we could also define a client:
// `const client = new GraphQLClient('https://swapi-graphql.netlify.app/.netlify/functions/index')`
// and use:
// `client.request(allFilmsWithVariablesQueryDocument, { first: 10 })`

function App() {
  const [data, setData] = useState<AllFilmsWithVariablesQueryQuery>();

  useEffect(() => {
    request('https://swapi-graphql.netlify.app/.netlify/functions/index', allFilmsWithVariablesQueryDocument, {
      first: 10,
    }).then(data => {
      if (data.allFilms) {
        setData(data);
      }
    });
  }, []);

  return (
    <div className="App">
      {data && <ul>{data.allFilms?.edges?.map((e, i) => e?.node && <Film film={e?.node} key={`film-${i}`} />)}</ul>}
    </div>
  );
}

export default App;
