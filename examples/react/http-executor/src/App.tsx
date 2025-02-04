import { useEffect, useState } from 'react';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import './App.css';
import Film from './Film';
import { graphql, DocumentType } from './gql';

const executor = buildHTTPExecutor({
  endpoint: 'https://graphql.org/graphql/',
});

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

// we could also define a client:
// `const client = new GraphQLClient('https://graphql.org/graphql/')`
// and use:
// `client.request(allFilmsWithVariablesQueryDocument, { first: 10 })`

function App() {
  const [data, setData] = useState<DocumentType<typeof AllFilmsWithVariablesQuery>>();

  useEffect(() => {
    executor({
      document: AllFilmsWithVariablesQuery,
      variables: {
        first: 10,
      },
    }).then(result => {
      if ('data' in result) {
        setData(result.data!);
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
