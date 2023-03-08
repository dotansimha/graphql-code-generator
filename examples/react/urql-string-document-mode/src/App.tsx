import { TypedDocumentString } from '@graphql-typed-document-node/core';

import './App.css';
import Film from './Film';
import { graphql } from './gql';
import { AnyVariables, OperationContext, RequestPolicy, TypedDocumentNode, useQuery, UseQueryResponse } from 'urql';
import type { DocumentNode } from 'graphql';

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

declare module 'urql' {
  // @ts-expect-error this is just temporary until we update types in urql
  export type UseQueryArgs<Variables extends AnyVariables = AnyVariables, Data = any> = {
    query: string | DocumentNode | TypedDocumentNode<Data, Variables> | TypedDocumentString<Data, Variables>;
    requestPolicy?: RequestPolicy;
    context?: Partial<OperationContext>;
    pause?: boolean;
  } & (Variables extends void
    ? {
        variables?: Variables;
      }
    : Variables extends {
        [P in keyof Variables]: Variables[P] | null;
      }
    ? {
        variables?: Variables;
      }
    : {
        variables: Variables;
      });

  export function useQuery<Data = any, Variables extends AnyVariables = AnyVariables>(
    args: UseQueryArgs<Variables, Data>
  ): UseQueryResponse<Data, Variables>;
}

function App() {
  const [{ data }] = useQuery({
    query: allFilmsWithVariablesQueryDocument,
    variables: {
      first: 10,
    },
  });

  return (
    <div className="App">
      {data && <ul>{data.allFilms?.edges?.map((e, i) => e?.node && <Film film={e?.node} key={`film-${i}`} />)}</ul>}
    </div>
  );
}

export default App;
