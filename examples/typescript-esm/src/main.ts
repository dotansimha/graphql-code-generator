/* eslint-disable no-console */
import { executeOperation } from './executeOperation.js';
import { graphql } from './gql/index.js';

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

executeOperation(apiUrl, AllPeopleQueryDocument).then(res => {
  if (res.errors) {
    console.error(res.errors);
    process.exit(1);
  }

  console.log(res.data?.allPeople.edges);
});

executeOperation(apiUrl, AllPeopleWithVariablesQueryDocument, { first: 10 }).then(res => {
  if (res.errors) {
    console.error(res.errors);
    process.exit(1);
  }

  console.log(res.data?.allPeople.edges);
});
