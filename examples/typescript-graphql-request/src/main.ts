/* eslint-disable no-console */
import { GraphQLClient } from 'graphql-request';
import { gql } from './gql';

const AllPeopleQueryDocument = gql(/* GraphQL */ `
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

const AllPeopleWithVariablesQueryDocument = gql(/* GraphQL */ `
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

client.request(AllPeopleQueryDocument).then(res => {
  console.log(res?.allPeople?.edges);
});

client.request(AllPeopleWithVariablesQueryDocument, { first: 10 }).then(res => {
  console.log(res?.allPeople?.edges);
});
