import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App/App';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-boost';

const client = new ApolloClient({
  uri: 'https://0vw9j9w0l5.lp.gql.zone/graphql'
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
