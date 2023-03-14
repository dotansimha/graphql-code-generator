/* eslint-disable no-console */
import { GraphQLClient } from 'graphql-request';
import { graphql } from './gql';

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

client.request(AllPeopleQueryDocument.toString()).then(res => {
  console.log(res?.allPeople?.edges);
});

client.request(AllPeopleWithVariablesQueryDocument.toString(), { first: 10 }).then(res => {
  console.log(res?.allPeople?.edges);
});
