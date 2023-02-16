import React from 'react';
import ReactDOM from 'react-dom/client';
import { createClient, Provider } from 'urql';

import './index.css';
import App from './App';

const client = createClient({
  url: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider value={client}>
      <App />
    </Provider>
  </React.StrictMode>
);
