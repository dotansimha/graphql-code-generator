import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { GraphQL17Alpha2Handler } from '@apollo/client/incremental';
import { ApolloProvider } from '@apollo/client/react';
import App from './App';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://graphql.org/graphql/',
  }),
  cache: new InMemoryCache(),
  incrementalHandler: new GraphQL17Alpha2Handler(),
});

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
);
