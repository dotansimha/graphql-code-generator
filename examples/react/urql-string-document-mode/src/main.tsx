import React from 'react';
import ReactDOM from 'react-dom/client';
import { createClient, Provider } from 'urql';

import './main.css';
import App from './App';

const client = createClient({
  url: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
});

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider value={client}>
      <App />
    </Provider>
  </React.StrictMode>
);
