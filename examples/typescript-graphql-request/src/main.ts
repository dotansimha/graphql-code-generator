import { graphql } from './gql';
import { AllPeopleQueryQuery } from './gql/graphql';

const AllPeopleQueryDocument = graphql(/* GraphQL */ `
  query AllPeopleQuery {
    allPeople(first: 5) {
      edges {
        node {
          name
          homeworld {
            name
          }
        }
      }
    }
  }
`);

const AllPeopleWithVariablesQueryDocument = graphql(/* GraphQL */ `
  query AllPeopleWithVariablesQuery($first: Int!) {
    allPeople(first: $first) {
      edges {
        node {
          name
          homeworld {
            name
          }
        }
      }
    }
  }
`);

const apiUrl = 'https://graphql.org/graphql/';

export const getPeople = async (first?: number) => {
  const request = first
    ? { query: AllPeopleWithVariablesQueryDocument.toString(), variables: { first } }
    : { query: AllPeopleQueryDocument.toString() };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const res: AllPeopleQueryQuery = (await response.json()).data;
  return res.allPeople?.edges;
};
