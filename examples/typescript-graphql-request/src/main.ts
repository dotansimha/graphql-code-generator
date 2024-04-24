/* eslint-disable no-console */
import { GraphQLClient } from 'graphql-request';
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

const apiUrl = 'https://swapi-graphql.netlify.app/.netlify/functions/index';

const client = new GraphQLClient(apiUrl);

export const getPeople = async (first?: number) => {
  let res: AllPeopleQueryQuery;
  if (first) {
    res = await client.request(AllPeopleWithVariablesQueryDocument.toString(), { first });
  } else {
    res = await client.request(AllPeopleQueryDocument.toString());
  }
  return res?.allPeople?.edges;
};
