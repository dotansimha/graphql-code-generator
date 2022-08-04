import React from 'react';
import { useQuery, gql } from '@apollo/client';
import logo from './logo.svg';
import './App.css';

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

function App() {
  const { data } = useQuery(AllPeopleWithVariablesQueryDocument, { variables: { first: 10 } });
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
        {data && (
          <ul>
            {data.allPeople?.edges?.map(n => (
              <li>{n?.node?.name}</li>
            ))}
          </ul>
        )}
      </header>
    </div>
  );
}

export default App;
