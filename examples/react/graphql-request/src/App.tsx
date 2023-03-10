import { useEffect, useState } from 'react';
import { GraphQLClient } from 'graphql-request';
import './App.css';
import Film from './Film';
import { graphql, DocumentType } from './gql';

const client = new GraphQLClient('https://swapi-graphql.netlify.app/.netlify/functions/index');

const AllFilmsWithVariablesQuery = graphql(/* GraphQL */ `
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
  const [data, setData] = useState<DocumentType<typeof AllFilmsWithVariablesQuery>>();

  useEffect(() => {
    client.request(AllFilmsWithVariablesQuery, { first: 10 }).then(result => {
      setData(result);
    });
  }, []);

  return (
    <div className="App">
      {data && <ul>{data.allFilms?.edges?.map((e, i) => e?.node && <Film film={e?.node} key={`film-${i}`} />)}</ul>}
    </div>
  );
}

export default App;
