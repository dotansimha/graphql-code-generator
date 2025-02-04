import React from 'react';
import ReactDOM from 'react-dom/client';
import Film from './Film';
import { graphql } from './gql';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://graphql.org/graphql/',
  cache: new InMemoryCache(),
});

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
  const { data } = useQuery(allFilmsWithVariablesQueryDocument, { variables: { first: 10 } });
  return (
    <div className="App">
      {data && <ul>{data.allFilms?.edges?.map((e, i) => e?.node && <Film film={e?.node} key={`film-${i}`} />)}</ul>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
