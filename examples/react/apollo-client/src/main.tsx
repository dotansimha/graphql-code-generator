import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import App from './App';

const client = new ApolloClient({
  uri: 'https://graphql.org/graphql/',
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
);
